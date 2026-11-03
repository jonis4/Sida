// Inställningar: tema och din data (layout.md §9). Nås från sidfoten.
// Rader med namn och förklaring till vänster och valet till höger (DESIGNLAG §4).
(function () {
  "use strict";
  const { esc } = Delar;

  const KOD = Kurs.data.kurs.kod;
  const TEMA_NYCKEL = KOD.toLowerCase() + ".tema";
  // null | { typ: "import", g } | { typ: "rensa" } | { typ: "meddelande", text, fel }
  let lage = null;

  // ---------- Tema ----------
  function tema() {
    try { return localStorage.getItem(TEMA_NYCKEL) || "auto"; } catch (e) { return "auto"; }
  }
  function sattTema(t) {
    try { if (t === "auto") localStorage.removeItem(TEMA_NYCKEL); else localStorage.setItem(TEMA_NYCKEL, t); } catch (e) { /* gäller bara nu */ }
    if (t === "auto") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
  }

  // ---------- Byggstenar ----------
  function rad(namn, hjalp, kontroll) {
    return '<div class="inst-rad"><div class="inst-text"><p class="inst-namn">' + namn + "</p>"
      + (hjalp ? '<p class="inst-hjalp">' + hjalp + "</p>" : "") + "</div>"
      + (kontroll ? '<div class="inst-kontroll">' + kontroll + "</div>" : "") + "</div>";
  }
  const knapp = (h, t, klass = "textknapp") => '<button type="button" class="' + klass + '" data-handling="' + h + '">' + t + "</button>";
  const val = (etikett, alt) => '<div class="val" role="group" aria-label="' + esc(etikett) + '">'
    + alt.map(([h, namn, vald]) => '<button type="button" data-handling="' + h + '" aria-pressed="' + vald + '">' + namn + "</button>").join("") + "</div>";

  // Kopia på disken: namn, förklaring och knappar beroende på läge.
  function kopiaRad() {
    if (!Sparfil.stod) return rad("Kopia på disken", "Finns bara i Edge och Chrome. Använd Ladda ner i stället.", "");
    const namn = "<strong>" + esc(Sparfil.namn || "") + "</strong>";
    switch (Sparfil.lage) {
      case "aktiv":
        return rad("Kopia på disken", "Skrivs automatiskt till " + namn + " vid varje ändring"
          + (Sparfil.senast ? ", senast " + Kurs.datumText(lokaltDatum(Sparfil.senast), "kort") + " " + klockslag(Sparfil.senast) : "") + ".",
          knapp("sparfil-valj", "Byt fil…") + knapp("sparfil-sluta", "Stäng av"));
      case "behover-ok":
        return rad("Kopia på disken", "Webbläsaren vill att du godkänner kopian till " + namn + " en gång per besök.",
          knapp("sparfil-ateranslut", "Fortsätt") + knapp("sparfil-sluta", "Stäng av"));
      case "fel":
        return rad("Kopia på disken", '<span class="varning">' + esc(Sparfil.fel || "Kunde inte skriva till filen.") + "</span>",
          knapp("sparfil-valj", "Välj fil igen…") + knapp("sparfil-sluta", "Stäng av"));
      default:
        return rad("Kopia på disken", "En fil som uppdateras vid varje ändring.",
          knapp("sparfil-valj", "Välj fil…"));
    }
  }

  const klockslag = (d) => String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  const lokaltDatum = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const kapitelText = (n) => n + " kapitel";

  // Bekräftelse på plats, under raden den hör till (DESIGNLAG L8, L10). Knappen säger vad den gör.
  function fraga() {
    if (!lage) return "";
    if (lage.typ === "import") {
      const g = lage.g;
      return '<div class="inst-fraga" tabindex="-1"><p>Filen innehåller ifylld data för ' + kapitelText(g.antal)
        + (g.exporterad ? ", sparad " + esc(Kurs.datumText(lokaltDatum(g.exporterad), "kort")) + " " + klockslag(g.exporterad) : "") + ". "
        + "Den ersätter det du har nu (" + kapitelText(Lagring.antalKapitel()) + ")."
        + (g.okanda.length ? " " + g.okanda.length + " av kapitlen finns inte i kursen längre och visas inte." : "") + "</p>"
        + "<p>" + knapp("import-ok", "Ersätt all data", "knapp-farlig") + knapp("avbryt", "Avbryt") + "</p></div>";
    }
    if (lage.typ === "rensa") {
      return '<div class="inst-fraga" tabindex="-1"><p>Radera allt du fyllt i (' + kapitelText(Lagring.antalKapitel())
        + ")? Det går att ångra i 15 sekunder.</p>"
        + "<p>" + knapp("rensa-ok", "Radera all data", "knapp-farlig") + knapp("avbryt", "Avbryt") + "</p></div>";
    }
    return '<p class="inst-meddelande' + (lage.fel ? " varning" : "") + '" tabindex="-1">' + esc(lage.text)
      + (!lage.fel && Lagring.kanAngra() ? knapp("angra", "Ångra") : "") + "</p>";
  }

  function innehall() {
    const t = tema();
    const ifyllda = Kurs.data.kapitel.filter((c) => {
      const u = Lagring.kapitel(c.id);
      return u.ikryssade.length || u.kansla || u.anteckning;
    }).length;
    // Frågor och meddelanden visas under raden de kom från (DESIGNLAG L8).
    const underRensa = lage && (lage.typ === "rensa" || lage.rad === "rensa");
    return '<section class="inst-grupp">'
      + rad("Tema", "", val("Tema", [["tema:auto", "Auto", t === "auto"], ["tema:light", "Ljust", t === "light"], ["tema:dark", "Mörkt", t === "dark"]]))
      + "</section>"
      + '<section class="inst-grupp" aria-labelledby="rubrik-data"><h2 id="rubrik-data" class="etikett">Din data</h2>'
      + '<p class="inst-sammanfattning tyst">' + ifyllda + " av " + Kurs.data.kapitel.length + " kapitel har något ifyllt.</p>"
      + kopiaRad()
      + rad("Säkerhetskopia", "Flytta din data till en annan dator eller webbläsare.",
        knapp("ladda-ner", "Ladda ner") + knapp("las-in", "Läs in…"))
      + (lage && !underRensa ? fraga() : "")
      + rad("Rensa all data", "Går att ångra i 15 sekunder.", knapp("rensa", "Rensa…"))
      + (underRensa ? fraga() : "")
      + "</section>";
  }

  function rita(el) {
    el.innerHTML = '<div class="installningar">'
      + '<p class="kontext"><a href="#/" data-handling="tillbaka">← Tillbaka</a></p>'
      + '<h1>Inställningar</h1><div id="inst-innehall">' + innehall() + "</div></div>";
  }

  // Ritar om innehållet och lägger fokus där det hör hemma, så att man inte tappar bort sig.
  // Utan angivet fokus stannar fokus på samma knapp som innan (om den finns kvar).
  function uppdatera(fokus) {
    const el = document.getElementById("inst-innehall");
    if (!el) return;
    const a = document.activeElement;
    const forra = !fokus && a && el.contains(a) && a.dataset.handling ? '[data-handling="' + a.dataset.handling + '"]' : null;
    el.innerHTML = innehall();
    const f = (fokus || forra) && el.querySelector(fokus || forra);
    if (f) f.focus();
  }

  // ---------- Ladda ner och Läs in ----------
  function laddaNer() {
    const json = JSON.stringify(Lagring.exportera(), null, 1);
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = KOD.toLowerCase() + "-data-" + lokaltDatum(new Date()) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const filval = document.createElement("input");
  filval.type = "file";
  filval.accept = ".json,application/json";
  filval.hidden = true;
  filval.id = "filval";
  document.body.appendChild(filval);
  filval.addEventListener("change", () => {
    const fil = filval.files[0];
    if (!fil) return;
    fil.text().then((text) => {
      filval.value = "";
      let g;
      try { g = Lagring.granska(JSON.parse(text)); } catch (e) { g = { ok: false, fel: "Filen gick inte att läsa som JSON." }; }
      lage = g.ok ? { typ: "import", g } : { typ: "meddelande", text: g.fel + " Inget har ändrats.", fel: true };
      uppdatera(g.ok ? ".inst-fraga" : ".inst-meddelande");
    });
  });

  // ---------- Handlingar (både i vyn och i sidfoten) ----------
  document.addEventListener("click", (e) => {
    const k = e.target.closest("[data-handling]");
    if (!k) return;
    const h = k.dataset.handling;
    if (h === "tillbaka") { e.preventDefault(); Router.tillbaka("#/"); return; }
    if (h.startsWith("tema:")) {
      sattTema(h.slice(5));
      // Bara valet ändras, så att fokus stannar på knappen.
      k.parentElement.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === k));
      return;
    }
    if (h === "ladda-ner") { laddaNer(); return; }
    if (h === "las-in") { filval.click(); return; }
    if (h === "sparfil-valj") { Sparfil.valj(); return; }
    if (h === "sparfil-ateranslut") { Sparfil.ateranslut(); return; }
    if (h === "sparfil-sluta") { Sparfil.sluta(); return; }
    if (h === "rensa") { lage = { typ: "rensa" }; uppdatera(".inst-fraga"); return; }
    if (h === "avbryt") {
      const forra = lage && lage.typ;
      lage = null;
      uppdatera(forra === "rensa" ? '[data-handling="rensa"]' : '[data-handling="las-in"]');
      return;
    }
    if (h === "rensa-ok") { Lagring.rensa(); lage = { typ: "meddelande", text: "All data är raderad.", rad: "rensa" }; uppdatera(".inst-meddelande"); return; }
    if (h === "import-ok") { Lagring.ersattAllt(lage.g); lage = { typ: "meddelande", text: "Kopian är inläst.", rad: "import" }; uppdatera(".inst-meddelande"); return; }
    if (h === "angra") {
      const typ = Lagring.angraTyp;
      Lagring.angra();
      lage = { typ: "meddelande", text: "Ångrat. Allt är som innan.", rad: typ === "rensa" ? "rensa" : "import" };
      if (document.getElementById("inst-innehall")) uppdatera(".inst-meddelande");
      else Router.rendera(false); // från sidfoten i en annan vy: visa den återställda datan
    }
  });

  // Esc stänger en öppen fråga och lämnar fokus där man kom ifrån (DESIGNLAG §5.7).
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !lage || (lage.typ !== "rensa" && lage.typ !== "import")) return;
    if (!document.getElementById("inst-innehall")) return;
    const forra = lage.typ;
    lage = null;
    uppdatera(forra === "rensa" ? '[data-handling="rensa"]' : '[data-handling="las-in"]');
  });

  // Lämnar man vyn glöms frågor och meddelanden.
  window.addEventListener("hashchange", () => { if (location.hash !== "#/installningar") lage = null; });

  (window.Vyer = window.Vyer || {}).installningar = { rita, uppdatera };
})();
