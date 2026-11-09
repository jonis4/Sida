// Det användaren fyller i, sparat i localStorage (backend.md §5).
// All läsning och skrivning ligger i try/catch: om localStorage inte går att använda fungerar
// sidan ändå, men det som fylls i finns bara kvar tills fliken stängs, och sidfoten säger det.
(function () {
  "use strict";

  const VERSION = 1;
  const NYCKEL = Kurs.data.kurs.kod.toLowerCase() + ".v" + VERSION; // "m0068m.v1"

  // data.kapitel[id] = { ikryssade: ["2", "3"], kansla: 1–5, anteckning: "…" }
  // Ett kapitel utan något ifyllt finns inte med. Inget härlett sparas.
  let data = tom();
  let undanlagd = null; // trasig text som redan lagts undan, så att den inte läggs undan igen
  const status = { sparbar: true, senast: null, fel: null };
  const lyssnare = [];
  const franAnnanFlik = [];
  const meddela = (lista) => lista.forEach((f) => { try { f(); } catch (e) { console.error(e); } });

  function tom() {
    return { version: VERSION, senast: null, kapitel: {} };
  }

  // Tar bara med fält som har rätt form, så att en trasig post aldrig kan krascha sidan.
  function stada(rad) {
    const ut = {};
    if (!rad || typeof rad !== "object") return ut;
    if (Array.isArray(rad.ikryssade)) {
      const nr = [...new Set(rad.ikryssade.filter((n) => typeof n === "string" && n))];
      if (nr.length) ut.ikryssade = nr;
    }
    if (Number.isInteger(rad.kansla) && rad.kansla >= 1 && rad.kansla <= 5) ut.kansla = rad.kansla;
    if (typeof rad.anteckning === "string" && rad.anteckning !== "") ut.anteckning = rad.anteckning;
    return ut;
  }

  // Gör om sparad data (i vilket format den än är) till nuvarande format.
  // Returnerar { data, andrad } där andrad betyder att den bör sparas om.
  function migrera(d) {
    let andrad = false;
    if (!d || typeof d !== "object") return { data: tom(), andrad: true };
    // (Version 1 är den första. Kommer en version 2 läggs omvandlingen från 1 här.)
    const ut = tom();
    ut.senast = typeof d.senast === "string" ? d.senast : null;
    for (const [id, rad] of Object.entries(d.kapitel && typeof d.kapitel === "object" ? d.kapitel : {})) {
      const r = stada(rad);
      if (Object.keys(r).length) ut.kapitel[id] = r;
    }

    // Kapitel som bytt id i kurs.json: flytta över datan från det gamla id:t (backend.md §5.3).
    for (const c of Kurs.data.kapitel) {
      for (const gammalt of c.tidigare_id || []) {
        if (ut.kapitel[gammalt] && !ut.kapitel[c.id]) {
          ut.kapitel[c.id] = ut.kapitel[gammalt];
          delete ut.kapitel[gammalt];
          andrad = true;
        }
        if (ut.senast === gammalt) { ut.senast = c.id; andrad = true; }
      }
    }
    return { data: ut, andrad };
  }

  function las() {
    let r;
    try {
      r = localStorage.getItem(NYCKEL);
    } catch (e) {
      status.sparbar = false;
      status.fel = "blockerad";
      console.warn("localStorage kunde inte läsas:", e);
      return;
    }
    // Ingen sparad data (eller rensad i en annan flik): börja från tomt, behåll inget gammalt i minnet.
    if (!r) { data = tom(); return; }
    let d;
    try {
      d = JSON.parse(r);
    } catch (e) {
      // Trasig data skrivs aldrig över: den läggs undan under en egen nyckel först (en gång).
      if (r !== undanlagd) {
        try { localStorage.setItem(NYCKEL + ".trasig-" + Date.now(), r); undanlagd = r; } catch (e2) { /* ignoreras */ }
        console.warn("Sparad data gick inte att tolka och har lagts undan:", e);
      }
      data = tom();
      return;
    }
    if (d && typeof d.version === "number" && d.version > VERSION) {
      // Sparad av en nyare version av sidan: läs men skriv inte, så att inget går förlorat.
      status.sparbar = false;
      status.fel = "nyare";
    }
    const m = migrera(d);
    data = m.data;
    if (m.andrad && status.sparbar) skrivNu();
  }

  function skrivNu() {
    if (status.fel === "nyare") return false;
    try {
      localStorage.setItem(NYCKEL, JSON.stringify(data));
      status.sparbar = true;
      status.fel = null;
      status.senast = new Date();
      return true;
    } catch (e) {
      status.sparbar = false;
      status.fel = e && e.name === "QuotaExceededError" ? "full" : "blockerad";
      console.warn("localStorage kunde inte skrivas:", e);
      return false;
    }
  }

  // Varje ändring: läs in senaste (en annan flik kan ha sparat), ändra, spara, meddela.
  function andra(kid, f) {
    las();
    const rad = data.kapitel[kid] || {};
    f(rad);
    const r = stada(rad);
    if (Object.keys(r).length) data.kapitel[kid] = r;
    else delete data.kapitel[kid];
    skrivNu();
    meddela(lyssnare);
  }

  // ---------- Läsa ----------
  function kapitel(kid) {
    const r = data.kapitel[kid] || {};
    return { ikryssade: r.ikryssade || [], kansla: r.kansla || null, anteckning: r.anteckning || "" };
  }
  const senast = () => (data.senast && Kurs.kapitel(data.senast) ? data.senast : null);

  // ---------- Skriva ----------
  function vaxla(kid, nr) {
    andra(kid, (r) => {
      const s = new Set(r.ikryssade || []);
      if (s.has(nr)) s.delete(nr); else s.add(nr);
      r.ikryssade = [...s];
    });
  }
  function sattKansla(kid, n) {
    andra(kid, (r) => { if (n) r.kansla = n; else delete r.kansla; });
  }
  function sattAnteckning(kid, text) {
    andra(kid, (r) => { r.anteckning = text; });
  }
  function sattSenast(kid) {
    las();
    if (data.senast === kid) return;
    data.senast = kid;
    skrivNu();
    meddela(lyssnare);
  }

  // ---------- Export, import, rensa, ångra (backend.md §5.4) ----------
  const APP = "kursverktyget";
  const KOD = Kurs.data.kurs.kod;
  const ANGRA_MS = 15000;
  let fore = null; // { data, typ, till }: läget före senaste rensa/import, för Ångra

  // Samma format i nedladdad fil och i kopian på disken, så att båda kan läsas in.
  function exportera() {
    return { app: APP, kurs: KOD, version: VERSION, exporterad: new Date().toISOString(), senast: data.senast, kapitel: data.kapitel };
  }

  // Kontrollerar en fil innan den får ersätta något. Returnerar { ok, data, antal, okanda, exporterad } eller { ok: false, fel }.
  function granska(obj) {
    if (!obj || typeof obj !== "object" || obj.app !== APP || !obj.kapitel || typeof obj.kapitel !== "object") {
      return { ok: false, fel: "Filen är inte en kopia från kursverktyget." };
    }
    if (obj.kurs !== KOD) return { ok: false, fel: "Filen hör till kursen " + obj.kurs + ", inte " + KOD + "." };
    if (typeof obj.version !== "number" || obj.version > VERSION) {
      return { ok: false, fel: "Filen är sparad av en nyare version av sidan och kan inte läsas in här." };
    }
    const m = migrera(obj);
    const ids = Object.keys(m.data.kapitel);
    return {
      ok: true,
      data: m.data,
      antal: ids.length,
      okanda: ids.filter((id) => !Kurs.kapitel(id)), // finns inte i kurs.json; sparas ändå, visas inte
      exporterad: isNaN(Date.parse(obj.exporterad)) ? null : new Date(obj.exporterad),
    };
  }

  function ersatt(ny, typ) {
    las();
    fore = { data, typ, till: Date.now() + ANGRA_MS };
    data = ny;
    skrivNu();
    meddela(lyssnare);
  }
  const ersattAllt = (g) => ersatt(g.data, "import");
  const rensa = () => ersatt(tom(), "rensa");

  const kanAngra = () => !!fore && Date.now() < fore.till;
  function angra() {
    if (!kanAngra()) return false;
    data = fore.data;
    fore = null;
    skrivNu();
    meddela(lyssnare);
    return true;
  }

  // En annan flik har sparat: läs in, så att den här fliken visar och sparar samma sak.
  window.addEventListener("storage", (e) => {
    if (e.key !== NYCKEL && e.key !== null) return; // null = localStorage.clear()
    las();
    meddela(franAnnanFlik);
  });

  las();

  window.Lagring = {
    NYCKEL,
    kapitel, senast,
    vaxla, sattKansla, sattAnteckning, sattSenast,
    exportera, granska, ersattAllt, rensa, angra, kanAngra,
    antalKapitel: () => Object.keys(data.kapitel).length,
    get angraTyp() { return kanAngra() ? fore.typ : null; },
    get angraKvar() { return kanAngra() ? fore.till - Date.now() : 0; },
    vidAndring: (f) => lyssnare.push(f),
    vidAndringIAnnanFlik: (f) => franAnnanFlik.push(f),
    get status() { return { ...status }; },
  };
})();
