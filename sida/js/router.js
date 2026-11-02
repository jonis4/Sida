// Hash-adresser → vy (layout.md §7). Startar också sidan.
//   #/                Läget
//   #/nu              Nu, senast öppnade kapitlet (13.1 om inget öppnats)
//   #/kapitel/13.3    Nu, det kapitlet
//   #/tentan          Tentan
//   #/installningar   Inställningar
(function () {
  "use strict";

  const app = document.getElementById("app");
  const sidfot = document.getElementById("sidfot");

  function tolka(hash) {
    const delar = hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
    if (delar.length === 0) return { vy: "laget" };
    if (delar[0] === "nu" && delar.length === 1) {
      return { vy: "nu", kapitel: Lagring.senast() || Kurs.forstaKapitel().id };
    }
    if (delar[0] === "kapitel" && delar.length === 2) return { vy: "nu", kapitel: delar[1] };
    if (delar[0] === "tentan" && delar.length === 1) return { vy: "tentan" };
    if (delar[0] === "installningar" && delar.length === 1) return { vy: "installningar" };
    return { vy: "saknas" };
  }

  // ---------- Historik: så att "Tillbaka" går dit man kom ifrån ----------
  // Varje historikpost får ett djup i history.state. Djup > 1 betyder att det finns en
  // tidigare sida inne i appen, och då gör Tillbaka samma sak som webbläsarens bakåtknapp.
  let djup = 0;
  let ersatt = false;

  function markeraHistorik() {
    const s = history.state;
    if (s && typeof s.djup === "number") {
      djup = s.djup;
    } else {
      djup = ersatt ? Math.max(djup, 1) : djup + 1;
      try { history.replaceState({ djup }, ""); } catch (e) { /* file:// i vissa webbläsare */ }
    }
    ersatt = false;
  }

  function ga(href, { ersatt: e = false } = {}) {
    if (href === location.hash) return;
    if (e) { ersatt = true; location.replace(href); }
    else location.hash = href;
  }

  function tillbaka(foralder) {
    if (djup > 1) history.back();
    else ga(foralder, { ersatt: true });
  }

  // ---------- Rita ----------
  function ritaSidfot() { Delar.sidfot(sidfot); }

  // scrolla = false när samma vy ritas om (t.ex. efter en ändring i en annan flik).
  function rendera(scrolla = true) {
    markeraHistorik();
    const adr = tolka(location.hash);
    for (const a of document.querySelectorAll(".huvudnav a")) {
      if (a.dataset.vy === adr.vy) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
    const vy = window.Vyer[adr.vy];
    if (vy) {
      vy.rita(app, adr);
    } else if (adr.vy === "installningar") {
      app.innerHTML = '<h1>Inställningar</h1><p class="platshallare">Byggs i fas 7.</p>';
    } else {
      app.innerHTML = '<h1>Sidan finns inte</h1><p><a href="#/">Till Läget</a></p>';
    }
    if (scrolla) window.scrollTo(0, 0);
    ritaSidfot();
  }

  document.getElementById("idag").textContent = Kurs.datumText(Kurs.idag(), "lang");
  document.title = Kurs.data.kurs.kod + " " + Kurs.data.kurs.namn;

  Lagring.vidAndring(ritaSidfot);
  Lagring.vidAndringIAnnanFlik(() => {
    // Skriver man i anteckningen ska fältet inte ritas om under fingrarna.
    if (document.activeElement && document.activeElement.tagName === "TEXTAREA") return;
    rendera(false);
  });
  window.addEventListener("hashchange", () => rendera());

  // Startvy: har man öppnat ett kapitel förut hamnar man där, annars i Läget.
  // Gäller bara när adressen saknar hash; ett klick på Läget (#/) går alltid till Läget.
  if ((location.hash === "" || location.hash === "#") && Lagring.senast()) {
    ersatt = true;
    location.replace("#/nu");
  } else {
    rendera();
  }

  window.Router = { ga, tillbaka, rendera };
})();
