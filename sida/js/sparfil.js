// Kopia på disken: varje ändring skrivs till en JSON-fil som man väljer en gång (layout.md §9).
// Använder File System Access API (finns i Edge och Chrome, även för file://).
// Filhandtaget sparas i IndexedDB. Webbläsaren kräver ofta ett klick per besök för att
// ge skrivrätt igen; då visar sidfoten en knapp för det.
// Filen har samma format som Ladda ner, så den kan alltid läsas in med Läs in.
(function () {
  "use strict";

  const stod = typeof window.showSaveFilePicker === "function" && "indexedDB" in window;
  const KOD = Kurs.data.kurs.kod.toLowerCase();
  let handtag = null;
  let lage = "av"; // "av" | "aktiv" | "behover-ok" | "fel"
  let fel = null;
  let senast = null; // tid för senaste lyckade skrivning
  let timer = null;
  const lyssnare = [];
  const meddela = () => lyssnare.forEach((f) => { try { f(); } catch (e) { console.error(e); } });

  // ---------- IndexedDB (ett enda nyckel/värde-par) ----------
  function db() {
    return new Promise((ok, nej) => {
      const r = indexedDB.open(KOD, 1);
      r.onupgradeneeded = () => r.result.createObjectStore("kv");
      r.onsuccess = () => ok(r.result);
      r.onerror = () => nej(r.error);
    });
  }
  async function idb(metod, ...arg) {
    const d = await db();
    return new Promise((ok, nej) => {
      const tx = d.transaction("kv", metod === "get" ? "readonly" : "readwrite");
      const r = tx.objectStore("kv")[metod](...arg);
      r.onsuccess = () => ok(r.result);
      r.onerror = () => nej(r.error);
    });
  }

  // Ett fel som säger vad som hänt och vad man kan göra (DESIGNLAG §6).
  function felText(e) {
    if (e && e.name === "NotFoundError") return "Filen hittades inte – koppla om den.";
    if (e && e.name === "NotAllowedError") return "Webbläsaren gav inte skrivrätt till filen.";
    return "Filen gick inte att skriva (" + ((e && e.message) || e) + ").";
  }

  // ---------- Skrivning ----------
  async function skriv() {
    if (!handtag || lage !== "aktiv") return;
    try {
      const w = await handtag.createWritable();
      await w.write(JSON.stringify(Lagring.exportera(), null, 1));
      await w.close();
      senast = new Date();
      fel = null;
    } catch (e) {
      console.warn("Kunde inte skriva kopian på disken:", e);
      lage = "fel";
      fel = felText(e);
    }
    meddela();
  }

  function schemalagg() {
    if (lage !== "aktiv") return;
    clearTimeout(timer);
    timer = setTimeout(skriv, 300);
  }

  // ---------- Publika funktioner ----------
  async function init() {
    if (!stod) return;
    try {
      handtag = await idb("get", "sparfil");
      if (!handtag) return;
      const p = await handtag.queryPermission({ mode: "readwrite" });
      lage = p === "granted" ? "aktiv" : "behover-ok";
    } catch (e) {
      console.warn("Kopian på disken kunde inte läsas in:", e);
      handtag = null;
      lage = "av";
    }
    meddela();
  }

  // Måste anropas från ett klick.
  async function valj() {
    try {
      const h = await window.showSaveFilePicker({
        suggestedName: KOD + "-data.json",
        types: [{ description: "Kursdata (JSON)", accept: { "application/json": [".json"] } }],
      });
      handtag = h;
      await idb("put", h, "sparfil");
      lage = "aktiv";
      await skriv();
    } catch (e) {
      if (e && e.name === "AbortError") return; // användaren avbröt
      lage = "fel";
      fel = felText(e);
      meddela();
    }
  }

  // Måste anropas från ett klick.
  async function ateranslut() {
    if (!handtag) return;
    try {
      const p = await handtag.requestPermission({ mode: "readwrite" });
      lage = p === "granted" ? "aktiv" : "behover-ok";
      if (lage === "aktiv") await skriv();
      else meddela();
    } catch (e) {
      lage = "fel";
      fel = felText(e);
      meddela();
    }
  }

  async function sluta() {
    clearTimeout(timer);
    handtag = null;
    lage = "av";
    fel = null;
    senast = null;
    try { await idb("delete", "sparfil"); } catch (e) { /* ignoreras */ }
    meddela();
  }

  Lagring.vidAndring(schemalagg);

  window.Sparfil = {
    stod, init, valj, ateranslut, sluta,
    vidAndring: (f) => lyssnare.push(f),
    get lage() { return lage; },
    get namn() { return handtag ? handtag.name : null; },
    get fel() { return fel; },
    get senast() { return senast; },
  };
})();
