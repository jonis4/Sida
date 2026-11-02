"""Bygger sida/data/kurs.js från kurs.json.

Kör:  python build.py

kurs.json ändras aldrig. Om kontrollen hittar fel skrivs ingen kurs.js och skriptet avslutas med felkod 1.
"""

import json
import re
import sys
from datetime import date
from pathlib import Path

ROT = Path(__file__).resolve().parent
KALLA = ROT / "kurs.json"
UT = ROT / "sida" / "data" / "kurs.js"

TID_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
KORSREF_RE = re.compile(r"^(\d+\.\d+):(.+)$")  # "16.4:17" = uppgift 17 i kapitel 16.4


def datum(varde, var, fel):
    """Tolkar ett ISO-datum. Lägger till ett fel och returnerar None om det inte går."""
    try:
        return date.fromisoformat(varde)
    except (TypeError, ValueError):
        fel.append(f"{var}: ogiltigt datum {varde!r} (dagen finns inte, eller formatet är inte ÅÅÅÅ-MM-DD)")
        return None


def strangar(varde, var, fel):
    """Kontrollerar att en lista bara innehåller icke-tomma strängar."""
    if not isinstance(varde, list):
        fel.append(f"{var}: ska vara en lista")
        return []
    for x in varde:
        if not isinstance(x, str) or not x.strip():
            fel.append(f"{var}: {x!r} ska vara en sträng, t.ex. \"{x}\"")
    return [x for x in varde if isinstance(x, str)]


def dubbletter(lista):
    sedda, dubbel = set(), []
    for x in lista:
        if x in sedda and x not in dubbel:
            dubbel.append(x)
        sedda.add(x)
    return dubbel


def validera(k):
    fel = []
    for falt in ["kurs", "moduler", "forelasningar", "kapitel", "tentor"]:
        if falt not in k:
            fel.append(f"Fältet '{falt}' saknas")
    if fel:
        return fel

    # ---------- Kurs ----------
    for falt in ["kod", "namn", "tenta"]:
        if not k["kurs"].get(falt):
            fel.append(f"kurs: '{falt}' saknas")
    tentadag = datum(k["kurs"].get("tenta"), "kurs.tenta", fel)

    # ---------- Moduler ----------
    modul_ids = [m.get("id") for m in k["moduler"]]
    for d in dubbletter(modul_ids):
        fel.append(f"Modulen '{d}' finns flera gånger")
    for m in k["moduler"]:
        if not m.get("id") or not m.get("namn"):
            fel.append(f"Modul {m}: saknar id eller namn")
        if m.get("typ") not in (None, "tenta"):
            fel.append(f"Modulen '{m.get('id')}': okänd typ '{m['typ']}'")
        if "visas_med" in m and m["visas_med"] not in modul_ids:
            fel.append(f"Modulen '{m.get('id')}': visas_med pekar på okänd modul '{m['visas_med']}'")
    tentamoduler = [m["id"] for m in k["moduler"] if m.get("typ") == "tenta"]
    if len(tentamoduler) != 1:
        fel.append(f"Det ska finnas exakt en modul med \"typ\": \"tenta\", men det finns {len(tentamoduler)}")
    vanliga = [m["id"] for m in k["moduler"] if m.get("typ") != "tenta"]

    # ---------- Kapitel ----------
    kapitel_ids = [c.get("id") for c in k["kapitel"]]
    for d in dubbletter(kapitel_ids):
        fel.append(f"Kapitlet '{d}' finns flera gånger")
    uppgifter_i = {}  # kapitel-id -> mängd av uppgiftsnummer, för korsreferenserna
    for c in k["kapitel"]:
        cid = c.get("id")
        var = f"Kapitel {cid}"
        if not isinstance(cid, str) or not cid:
            fel.append(f"Kapitel {c.get('titel', '?')!r}: id saknas eller är inte en sträng")
            continue
        if not c.get("titel"):
            fel.append(f"{var}: titel saknas")
        if c.get("modul") not in vanliga:
            if c.get("modul") in tentamoduler:
                fel.append(f"{var}: kan inte höra till tentamodulen '{c['modul']}'")
            else:
                fel.append(f"{var}: hör till modulen '{c.get('modul')}', som inte finns")
        if not isinstance(c.get("sida"), int) or c["sida"] <= 0:
            fel.append(f"{var}: sida ska vara ett positivt heltal, inte {c.get('sida')!r}")
        std = strangar(c.get("standard"), f"{var} standard", fel)
        pab = strangar(c.get("pabyggnad"), f"{var} pabyggnad", fel)
        alla = std + pab
        for d in dubbletter(alla):
            fel.append(f"{var}: uppgift {d} finns flera gånger")
        for n in alla:
            if "*" in n or "∗" in n:
                fel.append(f"{var}: uppgift {n!r} ska stå utan ∗ (lägg numret i 'stjarna' i stället)")
        if not alla:
            fel.append(f"{var}: har inga uppgifter alls")
        for n in strangar(c.get("stjarna", []), f"{var} stjarna", fel):
            if n not in alla and n + "*" not in alla and n + "∗" not in alla:
                fel.append(f"{var}: stjarna nämner uppgift {n}, som inte finns i kapitlet")
        uppgifter_i[cid] = set(alla)

    for c in k["kapitel"]:
        for n in c.get("standard", []) + c.get("pabyggnad", []):
            if isinstance(n, str) and (m := KORSREF_RE.match(n)):
                if m[1] not in uppgifter_i:
                    fel.append(f"Kapitel {c['id']}: {n} pekar på kapitel {m[1]}, som inte finns")
                elif m[2] not in uppgifter_i[m[1]]:
                    fel.append(f"Kapitel {c['id']}: {n} pekar på uppgift {m[2]}, som inte finns i {m[1]}")

    # tidigare_id får inte krocka med något befintligt id eller med varandra
    tidigare = []
    for c in k["kapitel"]:
        for t in strangar(c.get("tidigare_id", []), f"Kapitel {c.get('id')} tidigare_id", fel):
            if t in kapitel_ids:
                fel.append(f"Kapitel {c.get('id')}: tidigare_id '{t}' är id för ett kapitel som finns")
            tidigare.append(t)
    for d in dubbletter(tidigare):
        fel.append(f"tidigare_id '{d}' står på flera kapitel")

    # ---------- Föreläsningar ----------
    nummer = [f.get("nr") for f in k["forelasningar"]]
    for d in dubbletter(nummer):
        fel.append(f"Föreläsning {d} finns flera gånger")
    modul_for = {}
    forra = None
    for f in k["forelasningar"]:
        var = f"Föreläsning {f.get('nr')}"
        if not isinstance(f.get("nr"), int):
            fel.append(f"{var}: nr ska vara ett heltal")
        if f.get("modul") not in vanliga:
            fel.append(f"{var}: hör till modulen '{f.get('modul')}', som inte finns (eller är tentan)")
        d = datum(f.get("datum"), var, fel)
        if d and forra and d < forra[1]:
            fel.append(f"{var} ({d}) ligger före föreläsning {forra[0]} ({forra[1]}). "
                       "Föreläsningarna ska stå i datumordning")
        if d:
            forra = (f.get("nr"), d)
        for falt in ["start", "slut"]:
            if not TID_RE.match(str(f.get(falt, ""))):
                fel.append(f"{var}: ogiltig {falt}tid {f.get(falt)!r} (skriv TT:MM)")
        if f.get("start", "") >= f.get("slut", "~"):
            fel.append(f"{var}: slutar inte efter att den börjar")
        for cid in strangar(f.get("kapitel"), f"{var} kapitel", fel):
            if cid not in uppgifter_i:
                fel.append(f"{var}: pekar på kapitel '{cid}', som inte finns")
            else:
                modul_for.setdefault(cid, set()).add(f.get("modul"))

    # Modultillhörighet följer föreläsningsplanen
    for c in k["kapitel"]:
        moduler = modul_for.get(c.get("id"), set())
        if moduler and c.get("modul") in vanliga and c.get("modul") not in moduler:
            fel.append(f"Kapitel {c['id']}: står i modul '{c.get('modul')}' men föreläses i "
                       f"{', '.join(sorted(moduler))}")

    for mid in vanliga:
        if not any(f.get("modul") == mid for f in k["forelasningar"]):
            fel.append(f"Modulen '{mid}' har ingen föreläsning, så dess datum går inte att räkna fram")

    if tentadag and forra and tentadag <= forra[1]:
        fel.append(f"Tentan ({tentadag}) ligger inte efter sista föreläsningen ({forra[1]})")

    # ---------- Tentor ----------
    # { "id": "2026-05-29", "namn": "…", "datum": "2026-05-29" eller null,
    #   "uppgifter": [{ "nr": 1, "poang": [2, 3], "kort": "…", "kapitel": ["13.7", "14.1"] }] }
    if not isinstance(k["tentor"], list):
        fel.append("tentor: ska vara en lista")
        return fel
    for d in dubbletter([t.get("id") for t in k["tentor"]]):
        fel.append(f"Tentan '{d}' finns flera gånger")
    for t in k["tentor"]:
        var = f"Tenta {t.get('id')}"
        if not t.get("id") or not t.get("namn"):
            fel.append(f"{var}: saknar id eller namn")
        if t.get("datum") is not None:
            d = datum(t["datum"], var, fel)
            if d and tentadag and d >= tentadag:
                fel.append(f"{var}: ligger inte före kursens tenta")
        uppg = t.get("uppgifter")
        if not isinstance(uppg, list) or not uppg:
            fel.append(f"{var}: saknar uppgifter")
            continue
        for d in dubbletter([u.get("nr") for u in uppg]):
            fel.append(f"{var}: uppgift {d} finns flera gånger")
        for u in uppg:
            uvar = f"{var} uppgift {u.get('nr')}"
            if not isinstance(u.get("nr"), int):
                fel.append(f"{uvar}: nr ska vara ett heltal")
            if not isinstance(u.get("poang"), list) or not all(isinstance(p, int) and p > 0 for p in u["poang"]):
                fel.append(f"{uvar}: poang ska vara en lista med positiva heltal, t.ex. [2, 3]")
            kap = strangar(u.get("kapitel"), f"{uvar} kapitel", fel)
            if not kap:
                fel.append(f"{uvar}: hör inte till något kapitel")
            for cid in kap:
                if cid not in uppgifter_i:
                    fel.append(f"{uvar}: pekar på kapitel '{cid}', som inte finns")

    return fel


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    try:
        kurs = json.loads(KALLA.read_text(encoding="utf-8"))
    except FileNotFoundError:
        print(f"Hittar inte {KALLA.name}.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"{KALLA.name} är inte giltig JSON: rad {e.lineno}, kolumn {e.colno}: {e.msg}")
        print("  (Vanligt: ett komma för mycket eller för lite, eller ett citattecken som saknas.)")
        sys.exit(1)

    fel = validera(kurs)
    if fel:
        print(f"KONTROLLEN MISSLYCKADES ({len(fel)} fel). Ingenting skrevs.")
        for f in fel:
            print("  -", f)
        sys.exit(1)

    UT.parent.mkdir(parents=True, exist_ok=True)
    UT.write_text("// Genererad av build.py från kurs.json. Redigera kurs.json, inte den här filen.\n"
                  + "window.KURS = " + json.dumps(kurs, ensure_ascii=False, indent=1) + ";\n",
                  encoding="utf-8")

    kap = kurs["kapitel"]
    print("Kontroll OK")
    print(f"  Moduler:          {len(kurs['moduler'])} (varav 1 tenta)")
    print(f"  Föreläsningar:    {len(kurs['forelasningar'])}")
    print(f"  Kapitel:          {len(kap)}")
    print(f"  Standarduppg.:    {sum(len(c['standard']) for c in kap)}")
    print(f"  Påbyggnadsuppg.:  {sum(len(c['pabyggnad']) for c in kap)}")
    print(f"  Gamla tentor:     {len(kurs['tentor'])} ({sum(len(t['uppgifter']) for t in kurs['tentor'])} uppgifter)")
    print(f"Skrev {UT.relative_to(ROT).as_posix()}")


if __name__ == "__main__":
    main()
