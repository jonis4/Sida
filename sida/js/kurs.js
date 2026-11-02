// Härledningar ur kursdatan (backend.md §4.3). Inget här sparas; allt räknas fram varje gång.
// Datum hanteras som ISO-strängar ("2026-11-05"), som går att jämföra direkt med < och >.
(function () {
  "use strict";

  const K = window.KURS;
  const kapitelMap = new Map(K.kapitel.map((c, i) => [c.id, { ...c, index: i }]));
  const modulMap = new Map(K.moduler.map((m) => [m.id, m]));

  const DAGAR = ["söndag", "måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag"];
  const DAGAR_KORT = ["sön", "mån", "tis", "ons", "tors", "fre", "lör"];
  const MANADER = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

  const utc = (iso) => new Date(iso + "T00:00:00Z");
  // Dagar mellan två datum, och ett datum plus n dagar.
  const dagarMellan = (fran, till) => Math.round((utc(till) - utc(fran)) / 864e5);
  const plusDagar = (iso, n) => new Date(utc(iso).getTime() + n * 864e5).toISOString().slice(0, 10);

  // Dagens datum. window.IDAG_DATUM = "2026-12-24" låtsas att det är en annan dag (för test).
  function idag() {
    if (typeof window.IDAG_DATUM === "string" && /^\d{4}-\d\d-\d\d$/.test(window.IDAG_DATUM)) return window.IDAG_DATUM;
    const n = new Date();
    return n.getFullYear() + "-" + String(n.getMonth() + 1).padStart(2, "0") + "-" + String(n.getDate()).padStart(2, "0");
  }

  // ISO-vecka (måndag först, vecka 1 innehåller årets första torsdag).
  function vecka(iso) {
    const d = utc(iso);
    d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7)); // torsdagen samma vecka
    const dagIAret = (d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5; // 0 = 1 jan
    return Math.floor(dagIAret / 7) + 1;
  }

  // "Torsdag 5 nov", "tors 5 nov", "5 nov"
  function datumText(iso, form) {
    const d = utc(iso);
    const dag = d.getUTCDate() + " " + MANADER[d.getUTCMonth()];
    if (form === "lang") { const v = DAGAR[d.getUTCDay()]; return v[0].toUpperCase() + v.slice(1) + " " + dag; }
    if (form === "kort") return DAGAR_KORT[d.getUTCDay()] + " " + dag;
    return dag;
  }

  // "2–10 nov", "27 nov–4 dec"
  function intervallText(fran, till) {
    if (fran === till) return datumText(fran);
    const a = utc(fran), b = utc(till);
    if (a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear()) {
      return a.getUTCDate() + "–" + datumText(till);
    }
    return datumText(fran) + "–" + datumText(till);
  }

  const kapitel = (id) => kapitelMap.get(id) || null;
  const modul = (id) => modulMap.get(id) || null;
  const forstaKapitel = () => K.kapitel[0];
  const kapitelIModul = (mid) => K.kapitel.filter((c) => c.modul === mid);
  const forelasningarFor = (kid) => K.forelasningar.filter((f) => f.kapitel.includes(kid));
  const forelasningarIModul = (mid) => K.forelasningar.filter((f) => f.modul === mid);
  const tentamodul = () => K.moduler.find((m) => m.typ === "tenta");
  // "Modul 1": numret räknas från ordningen bland de vanliga modulerna.
  const modulNr = (mid) => K.moduler.filter((m) => m.typ !== "tenta").findIndex((m) => m.id === mid) + 1 || null;

  function foregaende(kid) {
    const c = kapitel(kid);
    return c && c.index > 0 ? K.kapitel[c.index - 1] : null;
  }
  function nasta(kid) {
    const c = kapitel(kid);
    return c && c.index < K.kapitel.length - 1 ? K.kapitel[c.index + 1] : null;
  }

  // Modulens första och sista datum: från dess föreläsningar. Tentan: tentadagen.
  function modulDatum(mid) {
    const m = modul(mid);
    if (!m) return null;
    if (m.typ === "tenta") return { forsta: K.kurs.tenta, sista: K.kurs.tenta };
    const f = forelasningarIModul(mid);
    return f.length ? { forsta: f[0].datum, sista: f[f.length - 1].datum } : null;
  }

  // Modulen som pågår: den senaste som har börjat, ända tills nästa börjar.
  // null före första föreläsningen och efter tentadagen.
  function pagar(dag) {
    dag = dag || idag();
    if (dag > K.kurs.tenta) return null;
    let svar = null;
    for (const m of K.moduler) {
      const d = modulDatum(m.id);
      if (d && d.forsta <= dag && (!svar || d.forsta >= modulDatum(svar.id).forsta)) svar = m;
    }
    return svar;
  }

  // "På tentan": på hur många av de gamla tentorna kapitlet har förekommit.
  function paTentan(kid) {
    const antal = K.tentor.filter((t) => t.uppgifter.some((u) => u.kapitel.includes(kid))).length;
    return { antal, av: K.tentor.length };
  }

  // Uppehåll: glapp på mer än en vecka mellan två föreläsningar (jul). Räknas fram, hårdkodas aldrig.
  // { fran, till } är första och sista dagen utan föreläsning; jul = true om glappet täcker julafton.
  function uppehall() {
    const f = K.forelasningar, ut = [];
    for (let i = 1; i < f.length; i++) {
      if (dagarMellan(f[i - 1].datum, f[i].datum) > 7) {
        const fran = plusDagar(f[i - 1].datum, 1), till = plusDagar(f[i].datum, -1);
        let jul = false;
        for (let d = fran; d <= till; d = plusDagar(d, 1)) if (d.slice(5) === "12-24") jul = true;
        ut.push({ fran, till, jul });
      }
    }
    return ut;
  }

  // Moduler som visas tillsammans med en annan (m6 Repetition visas med Tentan).
  const visasMed = (mid) => K.moduler.filter((m) => m.visas_med === mid);

  window.Kurs = {
    data: K,
    idag, vecka, datumText, intervallText, dagarMellan, plusDagar, uppehall,
    kapitel, modul, modulNr, forstaKapitel, kapitelIModul, tentamodul,
    forelasningarFor, forelasningarIModul,
    foregaende, nasta, modulDatum, pagar, paTentan, visasMed,
  };
})();
