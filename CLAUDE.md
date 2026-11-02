# Genomförandeplan – kursverktyget för M0068M Flervariabelanalys

> Den här filen är kartan för bygget. **Läs hela innan du gör något.** Projektet byggs i faser. **Gör en fas i taget, stanna efter varje fas och vänta på Jonatans OK innan du går vidare.** Uppdatera avsnittet *Status* längst ner när en fas är klar. Det är minnet mellan sessionerna.

---

## 1. Vad vi bygger

Ett personligt verktyg för att hålla koll på kursen **M0068M Flervariabelanalys (LTU, läsperiod 2, HT26)**. Kursen började **2 november 2026** och tentan är **13 januari 2027**.

Verktyget visar var i kursen man är, vilka uppgifter som finns och hur kapitlen känns. Man kan fylla i det, men verktyget lägger sig aldrig i: ingen takt, inga påminnelser, inga listor över vad man inte gjort.

**Kursen pågår redan.** Sidan ska gå att använda för modul 1 så tidigt som möjligt, helst efter fas 4.

### Underlaget (facit, i den här ordningen)

| Fil | Bestämmer |
|---|---|
| `DESIGNLAG.md` | **Hur** saker ser ut och beter sig. Gäller alltid |
| `layout.md` | **Vad** som finns var: vyer, innehåll, navigering |
| `backend.md` | **Hur** det är byggt: data, byggskript, lagring, kodstruktur |
| `M0068M_planering.md` | **Kursens innehåll**: moduler, föreläsningar, kapitel, uppgifter, gamla tentor |

Säger två av dem emot varandra: **fråga Jonatan**. Avvik aldrig tyst.

### Om Jonatan
- Designstudent (Teknisk design, LTU). Han kan design men är inte utvecklare, så förklara kodbeslut kort och konkret.
- Skriv till honom på **svenska**, gärna informellt. Kod och kommentarer får vara på svenska eller engelska, men var konsekvent.
- Matte i svar till honom skrivs i LaTeX.

---

## 2. Filer och mappar

Projektets mappstruktur står i `backend.md` §2. Underlaget ligger i `AI/`.

### Referensprojekt: får läsas, ALDRIG ändras
Två tidigare projekt för kursen M0067M. Läs dem för att se hur saker löstes förra gången, men **ändra ingenting i de mapparna**:

| Projekt | Sökväg | Bra att titta på |
|---|---|---|
| Tentasidan | `C:\Users\jonat\Documents\tentor\sida\` | `build.py` (validering), `js/status.js` (lagring), `js/sparfil.js` (kopia på disken), `js/app.js` (router, historik), `style.css` |
| Kurstrackern | `C:\Users\jonat\Desktop\matte schema\` | `DESIGN.md`, säkerhetsskalan 1–5, ångra, statusrad |

Tentasidans layoutspec och `CLAUDE.md` (med beslutsloggen) är förebilden för hur det här projektet är upplagt.

---

## 3. Tekniska ramar (kortversion av `backend.md`)

- **Vanilla HTML, CSS och JS.** Inga ramverk, ingen bundler, ingen npm-kedja för sidan.
- **Fungerar via `file://`**, alltså genom att dubbelklicka på `index.html`.
- **`kurs.json` är facit för kursen.** `build.py` validerar den och skriver `sida/data/kurs.js`.
- **Användardata** ligger i localStorage, nycklad på kapitel-id och uppgiftsnummer, med versionsnummer.
- **Inget kurs-specifikt i koden.** Allt sådant står i `kurs.json`.
- **Ljust och mörkt läge** följer systemet. Alla färger och avstånd är CSS-variabler.
- **KaTeX behövs först i Tentan** (fas 10). Bokuppgifterna visas bara som nummer.

---

## 4. Regler – så går du inte vilse

1. **En fas i taget.** Stanna när fasen är klar, visa vad du gjort och vänta på OK.
2. **Ändra aldrig underlaget** i `AI/`, utom avsnittet *Status* i den här filen.
3. **Ändra aldrig referensprojekten.**
4. **Hitta aldrig på kursdata.** Datum, kapitel och uppgifter kopieras från `M0068M_planering.md`. Ser något fel ut: flagga det, rätta det inte tyst.
5. **Bara Jonatan bestämmer över kursdatan.** Föreslå ändringar, men gör dem inte på eget initiativ.
6. **Ingen feature creep.** `layout.md` §11 och `DESIGNLAG.md` §8 listar sådant som medvetet inte ska vara med. Lägg inte till det, och inget som värderar vad användaren gjort.
7. **Verifiera varje fas** genom att öppna sidan i en webbläsare och klicka igenom. "Det kompilerar" räcker inte. Testskript läggs i scratchpad, inte i projektet.
8. **Om du är osäker: fråga.** Hellre en fråga för mycket än en timme åt fel håll.
9. **Logga besluten.** Varje beslut som inte står i underlaget skrivs in under *Beslut* i Status.

---

## 5. Faser

Varje fas har ett mål, vad som ska göras och **klart när**.

### Översikt

| Fas | Innehåll | Beroende av | Användbart efter? |
|---|---|---|---|
| 0 | Orientering | – | |
| 1 | Kursdata (`kurs.json`) | 0 | |
| 2 | Byggskript (`build.py`) | 1 | |
| 3 | Skal och lagring | 2 | |
| 4 | Nu (kapitelvyn) | 3 | **Ja, för modul 1** |
| 5 | Läget (kapitellistan) | 4 | |
| 6 | Tidslinjen | 5 | |
| 7 | Inställningar och data | 3 | |
| 8 | Mobil, kanttillstånd, finslipning | 4–7 | |
| 9 | Publicering (valfritt) | 8 | |
| 10 | Tentan (modul 7) | 3 | Klar före modul 6 (17 dec) |

**Kan göras parallellt i separata sessioner:**
- Fas 7 kan göras när som helst efter fas 3.
- Fas 10a (transkribera gamla tentor) kan göras när som helst, eftersom den bara tar fram data.

---

### Fas 0 – Orientering (ingen kod)

**Mål:** Förstå underlaget och miljön innan något byggs.

- Läs `DESIGNLAG.md`, `layout.md`, `backend.md` och `M0068M_planering.md` i sin helhet.
- Titta igenom referensprojekten (§2), särskilt tentasidans `build.py`, `status.js` och `sparfil.js`. Bara läsa.
- Kolla vad som finns installerat (`python --version`, `node --version`).
- Lista motsägelser eller luckor du hittar mellan dokumenten.

**Klart när:** Jonatan har fått en kort rapport med (a) vad du hittat, (b) vilket språk byggskriptet ska skrivas i, (c) frågor och motsägelser. **Stanna.**

---

### Fas 1 – Kursdata

**Mål:** Hela kursen finns som `kurs.json` i formatet från `backend.md` §3.

- Skapa `kurs.json` från `M0068M_planering.md`:
  - `kurs`: kod, namn, tentadatum.
  - `moduler`: m1–m6 plus `tentan` (typ `tenta`).
  - `forelasningar`: alla 28, med datum, tid, sal och kapitel (§5 i planeringen).
  - `kapitel`: alla 31, i kursordning, med modul, sida, standard- och påbyggnadsuppgifter (§6–7).
  - `tentor`: tom lista tills vidare.
- **Modultillhörighet följer föreläsningsplanen:** 16.5 och 16.6 i modul 5, 17.3 i modul 4 (`layout.md` §3).
- Uppgiftsnummer är strängar. Behåll ∗ där studiehandledningen har det.
- Korsreferenserna under 17.3 och 17.4 (`16.4:17,19` och `16.6:1`): **fråga Jonatan** hur de ska lagras innan du väljer.
- **Fråga Jonatan om kapiteltitlarna:** bokens engelska titlar, eller korta svenska (som i wireframen)?

**Klart när:** `kurs.json` finns, och Jonatan har fått se en tabell (kapitel → modul, föreläsning, antal uppgifter) och godkänt den. **Stanna.**

---

### Fas 2 – Byggskript

**Mål:** `kurs.json` kontrolleras automatiskt och blir läsbar för sidan.

- Skriv `build.py` enligt `backend.md` §4: alla kontroller i §4.2, skriver `sida/data/kurs.js`, skriver ingenting vid fel och avslutas då med felkod.
- Sammanfattning vid lyckat bygge: antal moduler, föreläsningar, kapitel, standard- och påbyggnadsuppgifter (ska vara 150 och 62).
- **Testa felhanteringen:** skapa avsiktliga fel i en kopia av `kurs.json` (okänd modul, dubblettkapitel, föreläsning i fel ordning) och kontrollera att varje fel fångas med ett begripligt meddelande.

**Klart när:** `kurs.js` genereras utan fel, siffrorna stämmer med planeringen och felhanteringen är visad för Jonatan. **Stanna.**

---

### Fas 3 – Skal och lagring

**Mål:** Sidans grund finns: navigering, stil och sparande. Inga riktiga vyer än.

- `index.html` med huvudnaven **Läget · Nu** (`layout.md` §2) och tomma platshållare för vyerna.
- `style.css` med alla designvariabler överst, enligt `DESIGNLAG.md` §4: färgroller, typskala, två vikter, ljust och mörkt läge. Temat sätts i `<head>` innan sidan ritas.
- `router.js`: hash-adresserna i `layout.md` §7. Tillbaka går dit man kom ifrån.
- `lagring.js` enligt `backend.md` §5: localStorage-nyckeln `m0068m.v1`, versionsfält, `try/catch` överallt, läs in före skrivning, lyssna på ändringar från andra flikar, `tidigare_id`-migrering.
- `kurs.js` (i `sida/js/`): härledningarna i `backend.md` §4.3.
- CSS och JS laddas med `?v=<datum>`.

**Klart när:** Navigeringen fungerar med bakåtknappen, testdata som skrivs via `lagring.js` överlever omladdning och två flikar skriver inte över varandra. Härledningarna ger rätt moduldatum för alla sex moduler. **Stanna.**

---

### Fas 4 – Nu *(första användbara versionen)*

**Mål:** Jonatan kan öppna ett kapitel, klicka i uppgifter, sätta känsla och skriva en anteckning.

Enligt `layout.md` §5:
- Metarad: modul · föreläsning med datum · sida · Facit (länken kan vara inaktiv tills facit finns).
- Kapitelrubrik.
- Standarduppgifter som stora knappar och påbyggnad på egen rad (`delar.js`).
- Känsla 1–5 med namn, plus *Ta bort bedömning*.
- Anteckning som sparas medan man skriver.
- Föregående och nästa kapitel.
- Att öppna ett kapitel sparar det som "senast öppnat". Första besöket visar 13.1.
- Kapitel utan standarduppgifter (15.3) hanteras enligt `layout.md` §5.2.
- Tangenterna `←` `→` och `1`–`5`.
- Tillfälligt: en enkel lista med alla kapitel som länkar, så att man kan hitta dit innan Läget finns.

**Klart när:** Allt ovan fungerar för alla 31 kapitel, överlever omladdning, går att använda med bara tangentbordet och fungerar på 390 px bredd. **Stanna.**

---

### Fas 5 – Läget

**Mål:** Startvyn visar hela kursen och hur kapitlen känns.

Enligt `layout.md` §4 (utom tidslinjen, som kommer i fas 6):
- Rubrik: kursnamn, modulen som pågår och dess datum.
- Kapitellistan grupperad per modul, med kolumnerna Kapitel, Ikryssade, Känns och På tentan.
- Moduler som inte har börjat är hopfällda. Tentan står sist som egen modulrad.
- Sorteringarna Kursordning, Efter känsla och Viktigast på tentan.
- Klick på en rad öppnar kapitlet i Nu. "Senast öppnad" är markerad.
- Läget blir startvy och den tillfälliga listan från fas 4 tas bort.
- **"På tentan" kräver data:** ta fram ett *förslag* på vilka kapitel varje gammal tentauppgift hör till (från `M0068M_planering.md` §11), lägg det i `kurs.json` under `tentor`, och låt Jonatan godkänna det innan det används.

**Klart när:** Listan stämmer för alla moduler, sorteringarna fungerar, tentakopplingen är godkänd och Jonatan har klickat igenom. **Stanna.**

---

### Fas 6 – Tidslinjen

**Mål:** Läget visar var i kursen man är.

Enligt `layout.md` §4.2:
- I skala från kursstart till tentan.
- Veckor som små etiketter. Moduler som band, där den som pågår är något mörkare. Tentan som sista band.
- Föreläsningar som omärkta streck. Jul som streckad yta. Idag som linje.
- Klick på en modul fäller ut den i listan och scrollar dit. Klick på Tentan öppnar Tentan (en platshållare tills fas 10).
- Allt räknas fram ur `kurs.json`. Inga datum hårdkodas i vyn.

**Klart när:** Tidslinjen stämmer med planeringen (kontrollera med `window.IDAG_DATUM` för några olika dagar, även före kursstart och efter tentan). Testa också att flytta en föreläsning i en kopia av `kurs.json` och se att tidslinjen följer med. **Stanna.**

---

### Fas 7 – Inställningar och data

**Mål:** Datan går att säkerhetskopiera och flytta. Kan göras när som helst efter fas 3.

Enligt `layout.md` §9 och `backend.md` §5.4, med tentasidans `sparfil.js` och inställningsvy som förebild:
- Inställningsvy med rader (namn och förklaring till vänster, val till höger).
- Kopia på disken (Edge/Chrome), med lägena av, aktiv, behöver OK och fel.
- Ladda ner och Läs in, med kontroll av filen innan den ersätter något.
- Rensa all data, med bekräftelse på plats och ångra i 15 sekunder.
- Tema: Auto, Ljust, Mörkt.
- Sparstatus i sidfoten. Om sparandet misslyckas blir raden en beständig varning.

**Klart när:** Ladda ner, rensa och läs in återställer allt. Ångra fungerar. Sparfelet går att framkalla och syns. **Stanna.**

---

### Fas 8 – Mobil, kanttillstånd och finslipning

**Mål:** Sidan håller i alla lägen och följer underlaget punkt för punkt.

- Mobilvyerna enligt `layout.md` §8. Ingen sidledsscroll på 320 px.
- Alla kanttillstånd i `layout.md` §10, testade med `window.IDAG_DATUM`.
- Gå igenom checklistan i `DESIGNLAG.md` §9 och lista avvikelser.
- Gå igenom `layout.md` punkt för punkt och lista avvikelser.
- Kontrastkontroll i ljust och mörkt läge.

**Klart när:** Jonatan har fått avvikelselistan och bestämt vad som ska rättas. **Stanna.**

---

### Fas 9 – Publicering (valfritt)

**Mål:** Sidan går att nå från mobilen.

- **Fråga Jonatan först.** Publicering är hans beslut.
- Git-repo och GitHub Pages, som förra kursen. Bara Jonatan pushar.
- Påminn om att data inte synkas: mobil och dator har var sin.

**Klart när:** Den publicerade sidan är kontrollerad och fungerar som den lokala. **Stanna.**

---

### Fas 10 – Tentan (modul 7)

**Mål:** Tentan fungerar ungefär som förra kursens tentasida. Ska vara klar **före modul 6 (17 dec)**, när repetitionen börjar.

Fasen är inte färdigplanerad. Den delas upp så här:

- **10a – Underlag** (kan göras parallellt, när som helst): transkribera de tre gamla tentorna med uppgiftstexter och lösningar i LaTeX, i samma format som förra kursens kunskapsbas. Kräver tentornas PDF:er från Jonatan. **Hitta aldrig på matte.**
- **10b – Layout:** ta fram en layout för Tentan tillsammans med Jonatan och lägg till den i `layout.md` §6. Ingen kod innan den är godkänd.
- **10c – Bygge:** enligt den godkända layouten. Utgångspunkt: tentasidans uppgiftsvy (lösning dold), status (med hjälp, själv, sitter), tentaläge och "vad som brukar komma". KaTeX läggs in här.

**Klart när:** Bestäms i 10b.

---

## 6. Status

> Uppdatera efter varje fas: vad som är klart, beslut som tagits och öppna frågor.

- [x] Fas 0 – Orientering (2 nov 2026)
- [x] Fas 1 – Kursdata (2 nov 2026)
- [x] Fas 2 – Byggskript (2 nov 2026)
- [x] Fas 3 – Skal och lagring (2 nov 2026)
- [x] Fas 4 – Nu (2 nov 2026)
- [x] Fas 5 – Läget (2 nov 2026)
- [x] Fas 6 – Tidslinjen (2 nov 2026)
- [x] Fas 7 – Inställningar och data (2 nov 2026)
- [x] Fas 8 – Mobil, kanttillstånd, finslipning (2 nov 2026)
- [x] Fas 9 – Publicering (2 nov 2026)
- [ ] Fas 10 – Tentan

**Beslut (tagna innan bygget, 2 nov 2026):**
- Verktyget värderar aldrig vad användaren gjort: ingen takt, inget "att ta igen", inget som reagerar på klick (`layout.md` §1).
- Läget är startvyn. Nu är det senast öppnade kapitlet, och 13.1 vid första besöket.
- Känsla 1–5 med namn som i kurstrackern, plus en fri anteckning per kapitel.
- Tentan är modul 7, sist i tidslinjen och listan, och klickbar som de andra modulerna.
- Data lokalt i webbläsaren plus manuell kopia, som i tentasidan. Ingen synk.
- Bara Jonatan ändrar kursdatan.
- Modultillhörighet följer föreläsningsplanen.
- Föreläsningar och veckor syns tyst i tidslinjen: små veckoetiketter och omärkta streck.

**Beslut (fas 0, 2 nov 2026):**
- Byggskriptet skrivs i Python (3.14 finns installerat).
- Underlaget ligger i `AI/`. `CLAUDE.md` ligger kvar i projektroten, eftersom Claude Code läser den där (avviker från `backend.md` §2).
- **Startvy (ersätter "Läget är startvyn"):** har man aldrig öppnat ett kapitel hamnar man i Läget. Annars hamnar man i Nu, på det kapitel man senast var på. Klickar man på Nu innan något kapitel öppnats visas 13.1. Det är ett medvetet avsteg från `DESIGNLAG.md` L1 ("Vad ska jag göra nu?"): verktyget säger inte vad man ska göra, det minns var man var.
- Kapiteltitlar: bokens engelska titlar.
- Korsreferenserna under 17.3 och 17.4 sparas separat per kapitel och visas som "16.4:17". En bock under 17.3 påverkar inte 16.4.
- ∗ står inte i uppgiftens id. Id:t är `"24"`, och ∗ läggs i en egen lista `stjarna` på kapitlet. Då kan ∗ ändras utan att sparad data tappas.
- `sida` är sidan där kapitlet börjar (13.3 → s. 708), inte där övningarna börjar.
- Anmärkningar ur studiehandledningen (13.9: "Obs! Endast ordning två") lagras i fältet `anmarkning` och visas tyst i Nu. På prov.
- Facit-länken finns i metaraden men är inaktiv tills Jonatan lagt in facit. Avsteg från L6 ("inga platshållare som ser klara ut"), godkänt.
- Jul i tidslinjen räknas fram som glappet mellan sista föreläsningen före jul och nästa föreläsning. Inga datum hårdkodas.
- "Modulen som pågår" är den senaste modulen som har börjat, ända tills nästa börjar.
- Modul 6 (Repetition) slås ihop med Tentan i vyerna: ett band 17 dec–13 jan i tidslinjen och en rad i listan. m6 finns kvar i datan, eftersom F27 och F28 måste höra till en modul. På prov.
- Kapitel med två föreläsningar visar båda i metaraden ("föreläsning 5 och 6, fre 6 nov").
- Inställningar nås på `#/installningar`.
- Publicering: GitHub Pages i fas 9. Allt i ett publikt repo syns, även `AI/`. Det går att välja att bara publicera `sida/`.

**Beslut (fas 1, 2 nov 2026):**
- `kurs.json` är framtagen med skript ur JSON-delen i `M0068M_planering.md` och kontrollerad mot tabellerna i §5–7, utan avvikelser.
- Kursordningen (ordningen i `kapitel`) följer föreläsningsplanen, inte övningstabellen: 16.4 → 17.3 → 16.5 → 16.6 → 17.1 …
- Varje föreläsning har fältet `modul` (finns inte i exemplet i `backend.md`). Det behövs för F16, F27 och F28, som saknar kapitel.
- Modul 6 har `"visas_med": "tentan"`, så sammanslagningen med Tentan står i datan och inte i koden.
- Korsreferenser skrivs `"16.4:17"` i standardlistan. ∗ står i `stjarna`, och anmärkningen till 13.9 i `anmarkning`.

**Beslut (fas 2, 2 nov 2026):**
- `build.py` kontrollerar allt i `backend.md` §4.2, och dessutom: uppgiftsnummer är strängar utan ∗, `stjarna` och korsreferenser pekar på uppgifter som finns, tiderna är giltiga, det finns exakt en tentamodul och den har inga kapitel, och ett kapitel ligger i samma modul som föreläsningen där det tas upp.

**Beslut (fas 3, 2 nov 2026):**
- Temavalet sparas under en egen nyckel (`<kurskod>.tema`), skild från kursdatan, som i tentasidan. "Rensa all data" rör inte temat.
- localStorage-nyckeln byggs av `kurs.kod` i `kurs.json` och står inte i koden. Därför laddas `data/kurs.js` först i `<head>`.
- Dagens datum står till höger i huvudnaven ("Måndag 2 nov"), som i wireframen.
- Trasig sparad data läggs undan under `<nyckel>.trasig-<tid>` i stället för att skrivas över. Data från en nyare version av sidan läses men skrivs aldrig över, och sidfoten varnar.
- Testning sker i headless Edge via DevTools-protokollet, med skript i scratchpad. Det startas bara med en egen profil (`edgeprofil-*`), så Jonatans vanliga Edge rörs inte.

**Beslut (fas 4, 2 nov 2026):**
- Metaraden i Nu visar tid och sal för föreläsningen (`layout.md` §4.2), även om wireframen i §5 inte gör det.
- Facit-länken blir aktiv när kapitlet får fältet `"facit": "…"` i `kurs.json`. Det kan läggas på ett kapitel i taget.
- Siffrorna `1`–`5` sätter känslan även när fokus står i känslovalet. Där flyttar pilarna mellan nivåerna, inte mellan kapitel.
- En ikryssad uppgift är fylld (form, inte bara färg). Anteckningen sparas 0,4 s efter att man slutat skriva, och direkt när man lämnar fältet eller sidan.
- Jonatan ser stor förbättringspotential i UI-designen. Det tas i fas 8, inte nu.

**Beslut (fas 5, 2 nov 2026):**
- Tentakopplingen (vilka kapitel varje gammal tentauppgift berör) är godkänd av Jonatan och ligger i `kurs.json` under `tentor`. Formatet är `{id, namn, datum|null, uppgifter: [{nr, poang: [delpoäng], kort, kapitel: [...]}]}`. Augustitentan har `datum: null` och id `2026-08`. Själva tentauppgifterna (texter och lösningar) väntar till fas 10, eftersom de är "värda guld" och ska göras ordentligt.
- "På tentan" = på hur många av de gamla tentorna kapitlet förekommit ("2 av 3"), räknat per tenta och inte per uppgift.
- Ikryssade i Läget räknar bara standarduppgifter (utkastets förslag). Kapitel utan standarduppgifter (15.3) visar "–".
- Moduler som har börjat är vanliga rubriker. Moduler som inte börjat är `<details>`, och en utfälld modul förblir utfälld under besöket. Esc fäller ihop den.
- Vald sortering minns under besöket, inte mellan besök.
- När inget alls är ifyllt visar Läget en rad om hur man kommer igång (`DESIGNLAG.md` L11).
- Läget ritas inte om under fingrarna: en ändring i en annan flik ritar om utan att scrolla, och inte alls medan man skriver i en anteckning.

**Beslut (fas 6, 2 nov 2026):**
- Tidslinjen har 3 dagars marginal före kursstart och efter tentan, så att idag-linjen kan ligga före första modulen och efter tentan (`layout.md` §10). Långt utanför kursen stannar den i marginalen.
- Uppehåll är ett glapp på mer än 7 dagar mellan två föreläsningar. Det heter "Jul" om det täcker 24 dec. Den streckade ytan ritas ovanpå Tentan-bandet, eftersom m6 och Tentan är ett band.
- Modulband visar nummer, och namnet bara om bandet är minst 9rem brett. Med nuvarande kurs händer det aldrig. Tas upp i fas 8.
- Klick på ett modulband byter listan till kursordning om den stod i en annan sortering, fäller ut modulen, scrollar dit och lägger fokus på modulrubriken.
- Repot finns på GitHub som `jonis4/Sida`. Jonatan pushade själv via VS Code.

**Beslut (fas 7, 2 nov 2026):**
- Exportformatet, och kopian på disken, är `{app: "kursverktyget", kurs, version, exporterad, senast, kapitel}`. Samma format i båda, så kopian på disken kan läsas in med Läs in. Filnamnen är `m0068m-data-<datum>.json` (Ladda ner) och `m0068m-data.json` (kopia på disken).
- Läs in kontrollerar app, kurskod och version innan något ersätts. Kapitel som inte finns i `kurs.json` sparas men visas inte, och frågan nämner dem.
- Ångra (15 s) finns efter både Rensa och Läs in, i sidfoten i alla vyer och i Inställningar.
- Sidfotens ordning: sparfel, sedan kopian på disken (fel, behöver OK), sedan Ångra, sedan vanlig sparstatus. Bara det första som gäller visas.
- Frågor och meddelanden i Inställningar visas under raden de kom från. Bekräftelseknapparna ("Radera all data", "Ersätt all data") är röda, och övriga handlingar är textknappar.
- Kopian på disken är testad med webbläsarens interna filsystem som fil. Jonatan testar en riktig fil i Edge.

**Beslut (fas 8, 2 nov 2026):**
- **Princip från Jonatan:** visa bara den information som faktiskt behövs. Det som syns direkt efter ett klick behöver inte stå i förväg.
- **Känsla 1–5 har färg** (kurstrackerns skala, rött → grönt, kontrastmätt mot vit text). Det ersätter "gråskala 1→5" i `layout.md` §4.3. Siffran och namnet står alltid med (L12).
- Känsloknapparna i Nu visar bara siffra och namn. Den valda nivån fylls med sin färg. I Läget är rutan i Känns-kolumnen färgad.
- Tidslinjen visar inga modulnamn (de syns i listan när man klickar). Modulen som pågår har en tydligt mörk yta, och hover har en egen, svagare ton.
- Läget har inga kolumnrubriker. På tentan skrivs "1 av 3 tentor", och sorteringsfliken heter "Tentan" (skärmläsarnamn "Viktigast på tentan").
- Modulrubriker: "Modul 1 · Partiella derivator" i fetstil och datumet tyst bredvid. Datum bryts aldrig mitt i.
- Esc stänger frågorna i Inställningar. Fokus står kvar när Inställningar ritas om.
- B1: Föregående och Nästa i Nu går i kursordning även när man kommer från en annan sortering (`layout.md` §5.1 före `DESIGNLAG.md` L9).
- B3–B7 behålls: varannan veckoetikett på mobil, raden om hur man kommer igång, grå yta för frågorna i Inställningar, Tentan som platshållare.
- Ingen "dagar kvar till tentan" (C4): behövs inte.
- Kvar efter granskningen: vanliga modulband och spåret bakom segmentvalet har låg kontrast mot sidan (1,2:1), men deras innehåll bärs av text, så WCAG 1.4.11 kräver ingen kant.

**Beslut (ny tidslinje, variant F, 2 nov 2026)** enligt `AI/tidslinje-instruktion.md`. Ersätter tidslinjebesluten i fas 6 och 8:
- Tidslinjen är rent visuell. Modulbanden är inte klickbara och Tentans block är ingen länk. Tentan nås via raden "Tentan · Öppna →" i listan. `visaModul` och klicklyssnaren är borttagna.
- Skalan går från första föreläsningen till slutet av tentadagen. Ingen marginal, och ingen idag-linje före kursstart eller efter tentan.
- Inga veckoetiketter, modulnamn eller datum. Bara modulnummer, som döljs (container query) om bandet är för smalt.
- Föreläsningar och helger ligger på samma rad. Alla föreläsningsstreck är grå, utom nästa föreläsning som är svart och högre. "Nästa" jämförs med datum och klockslag (`Kurs.klockslag()`, testkrok `window.IDAG_TID`).
- Modul 6 är ett eget band, och Tentan ett svart block på tentadagen. `visas_med` styr fortfarande listan och rubriken, men inte tidslinjen. `kurs.json` är oförändrad.
- Modulen som pågår är ljusgrå (`#d2d2d2`, mörkt `#3d3d3d`), ljusare än idag och Tentan. Det ersätter "tydligt mörk yta" från fas 8.
- **Avsteg från `DESIGNLAG.md` §4 (ikoner utan text):** en ?-knapp under tidslinjen fäller ut en förklaring på plats. Motivering: tidslinjen saknar text, så den behöver en förklaring, och ? är allmänt begripligt. Knappen har skärmläsarnamnet "Vad betyder tidslinjen?". Godkänt av Jonatan genom instruktionen.
- Krockar etiketten "idag" med "Tenta" (de sista dagarna före tentan och på tentadagen) döljs "Tenta". Det mäts i webbläsaren och räknas om när bredden ändras.
- Helgerna i mörkt läge är `#2b2b2b` i stället för `#222`, så att de syns mot förklaringens yta.
- `layout.md` §4.2 och §10 är uppdaterade efter instruktionen (det enda undantaget från att `AI/` inte ändras).

**Beslut (en modul åt gången, 2 nov 2026):**
- Bara en modul är utfälld åt gången i Läget. Alla vanliga moduler är hopfällbara, även de som har börjat. Det ersätter fasen 5-beslutet om att moduler som börjat är vanliga rubriker.
- Utfälld från början: modulen som pågår, och modul 1 före kursstart. Under repetitionen och efter tentan är ingen utfälld, eftersom m6 visas med Tentan-raden.
- Valet minns under besöket (även efter ett kapitelbesök och ett sorteringsbyte). Esc fäller ihop. Byggt med `name` på `<details>`, plus en reserv i JS för äldre webbläsare.
- `layout.md` §4.3 säger fortfarande "Moduler som inte har börjat är hopfällda". Den är inte ändrad, eftersom `AI/` bara ändras när Jonatan ber om det.

**Beslut (fas 9, 2 nov 2026):**
- Bara `sida/` publiceras, via GitHub Actions (`.github/workflows/pages.yml`) vid varje push till main. Repot i sig är lika synligt som förut.
- Jonatan ställde in Pages-källan till "GitHub Actions". Claude pushade på Jonatans uppmaning (undantag från "bara Jonatan pushar", som gäller i övrigt).
- Sidan finns på https://jonis4.github.io/Sida/. Kontrollerad: den fungerar som den lokala, och `AI/`, `kurs.json` och `CLAUDE.md` ger 404.
- Besöksräknare med GoatCounter (`jonis4.goatcounter.com`), önskad av Jonatan. Den är osynlig på sidan, och bara Jonatan ser siffrorna. Den sätter inga cookies och räknar inte `file://` eller localhost.

**Beslut (UX-genomgång, 2 nov 2026):**
- Sidans bredd är 50rem i stället för 44rem, så att kapiteltitlarna i Läget får plats. Kolumnerna Ikryssade, Känns och På tentan är smala och fasta.
- Hopfällda moduler visar en liten ruta per kapitel i känslans färg, grå om kapitlet är obedömt. Rutorna ersätter "N kapitel" och döljs när modulen är utfälld.
- Stapeln i Läget visas först när något är ikryssat. Annars står "4 uppgifter" i tyst text.
- Huvudnaven har vanlig textstorlek utan versaler, och den aktiva vyn står i fetstil.
- ?-knappen ligger närmare tidslinjen.
- "Ta bort bedömning" är liten och tyst, till höger om rubriken "Hur känns kapitlet?". Den kommer efter valet i tabbordningen.
- På mobil visar känsloraden bara siffrorna. Namnet på vald nivå står under, och "1 Förstår inte … 5 Kan förklara" när inget är valt (`layout.md` §8).
- Metaraden i Nu har två rader: "Modul 1 · s. 704 · Facit" och "Föreläsning 3 · ons 4 nov 14:45 · E231". Ett inaktivt Facit står i tyst text utan understrykning.
- Ikryssade uppgifter är mörkgrå (`--tyst`) i stället för svarta.
- Sidfoten visar inte länken till Inställningar när man redan är där. Temavalet är textval i samma stil som sorteringsflikarna.

**Beslut (granskning mot DESIGNLAG, 2 nov 2026):**
- **Avsteg från `DESIGNLAG.md` L4 och trackerns prejudikat:** "Ta bort bedömning" är borttagen. Klickar man på den nivå som redan är vald tas bedömningen bort, och mellanslag på vald nivå gör samma sak. Motivering mot grundsatsen: verktyget är personligt, Jonatan vet att funktionen finns, och en knapp som syns jämt för en sällsynt handling är brus. Beslutat av Jonatan. Ersätter tidigare beslut om knappen.
- Sorteringsfliken heter "På tentan" (L9: "Tentan" är också modulen och vyn). Skärmläsarnamnet är fortfarande "Viktigast på tentan".
- Tentan-raden i Läget är ingen länk och säger "Kommer" så länge Tentan-vyn är en platshållare (L6). Det styrs av `platshallare: true` i `vyer/tentan.js`, som tas bort i fas 10. Ersätter B7.
- Tidslinjens mått är i rem (L12), så att den skalar med webbläsarens textstorlek. Bara linjer och rundningar är kvar i px.
- **Brott mot lagboken som finns kvar, utan beslut än:** huvudnaven utan versaler (§4), bredden 50rem (§4, högst ca 44rem), temavalet som textflikar (§4, ska vara ett segmenterat val), siffror utan namn i känsloraden på mobil (L4) och färgrutor utan siffra i hopfällda moduler (L12).

**Öppna frågor:**
- Vad betyder ∗ efter vissa uppgiftsnummer i studiehandledningen?
- Ska påbyggnadsuppgifter räknas i stapeln "Ikryssade"? (Utkastet: nej.)
- Ska vanliga moduler få en egen vy när man klickar på dem, för konsekvens med Tentan?
- Ska bonusquizzar och räkneövningar synas alls? Datum saknas i underlaget.
- Var facit finns och vad länken ska peka på (Jonatan fixar).
