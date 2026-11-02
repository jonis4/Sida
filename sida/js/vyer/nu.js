// Nu: "Vad står i kapitlet jag jobbar med?" (layout.md §5)
// Inget här reagerar på vad man klickat i: inga frågor, inget som ändras när allt är ikryssat.
(function () {
  "use strict";
  const { esc, ochLista } = Delar;

  // Anteckningen sparas medan man skriver, men inte vid varje tangent.
  let vantandeSparning = null;
  function sparaAnteckningSnart(kid, text) {
    clearTimeout(vantandeSparning && vantandeSparning.timer);
    vantandeSparning = { kid, text, timer: setTimeout(sparaAnteckningNu, 400) };
  }
  function sparaAnteckningNu() {
    if (!vantandeSparning) return;
    const { kid, text, timer } = vantandeSparning;
    clearTimeout(timer);
    vantandeSparning = null;
    Lagring.sattAnteckning(kid, text);
  }
  window.addEventListener("pagehide", sparaAnteckningNu);
  window.addEventListener("hashchange", sparaAnteckningNu, true);

  // Två rader: "Modul 1 · s. 708 · Facit" och "Föreläsning 4 · tors 5 nov 14:45 · E231".
  function metarad(c) {
    const sep = '<span class="sep" aria-hidden="true"> · </span>';
    const forsta = []; // färdig HTML
    const nr = Kurs.modulNr(c.modul);
    if (nr) forsta.push(esc("Modul " + nr));
    forsta.push(esc("s. " + c.sida));
    // Facit är en understruken länk när det finns, annars tyst text utan länk (beslut fas 0).
    forsta.push(c.facit
      ? '<a href="' + esc(c.facit) + '" target="_blank" rel="noopener">Facit</a>'
      : '<span class="inaktiv">Facit<span class="dold"> (finns inte än)</span></span>');
    let h = '<span class="metarad-rad">' + forsta.join(sep) + "</span>";
    const fs = Kurs.forelasningarFor(c.id);
    if (fs.length) {
      const salar = [...new Set(fs.map((f) => f.sal))];
      h += '<span class="metarad-rad">' + [
        "Föreläsning " + ochLista(fs.map((f) => f.nr)),
        ochLista(fs.map((f) => Kurs.datumText(f.datum, "kort") + " " + f.start)),
        salar.join(" och "),
      ].map(esc).join(sep) + "</span>";
    }
    return h;
  }

  function granne(c, riktning) {
    if (!c) return "<span></span>";
    const etikett = riktning === "nasta" ? "Nästa kapitel →" : "← Föregående";
    return '<a class="granne ' + riktning + '" href="#/kapitel/' + esc(c.id) + '" rel="' + (riktning === "nasta" ? "next" : "prev") + '">'
      + '<span class="granne-riktning">' + etikett + "</span>"
      + '<span class="granne-kapitel"><span class="siffror">' + esc(c.id) + "</span> " + esc(c.titel) + "</span></a>";
  }

  // Textfältet växer med texten till en gräns och scrollar sedan (CSS max-height).
  function anpassaHojd(ta) {
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + 2 + "px";
  }

  function rita(el, adr) {
    const c = Kurs.kapitel(adr.kapitel);
    if (!c) {
      el.innerHTML = "<h1>Kapitlet finns inte</h1><p>Det finns inget kapitel " + esc(adr.kapitel)
        + ' i kursen. <a href="#/">Till Läget</a></p>';
      return;
    }
    Lagring.sattSenast(c.id);
    const anteckning = Lagring.kapitel(c.id).anteckning;

    el.innerHTML = '<article class="nu" data-kapitel="' + esc(c.id) + '">'
      + '<p class="metarad">' + metarad(c) + "</p>"
      + '<h1><span class="siffror">' + esc(c.id) + "</span> " + esc(c.titel) + "</h1>"
      + Delar.uppgifter(c)
      + Delar.kansla(c)
      + '<section class="anteckning"><label class="etikett" for="anteckning">Anteckning</label>'
      + '<textarea id="anteckning" rows="3" spellcheck="true">' + esc(anteckning) + "</textarea></section>"
      + '<nav class="grannar" aria-label="Kapitel">' + granne(Kurs.foregaende(c.id), "foregaende") + granne(Kurs.nasta(c.id), "nasta") + "</nav>"
      + "</article>";

    const vy = el.querySelector(".nu");

    // Uppgifter: bara den klickade knappen ändras, så att fokus stannar kvar.
    vy.querySelector(".uppgifter").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-uppgift]");
      if (!b) return;
      Lagring.vaxla(c.id, b.dataset.uppgift);
      b.setAttribute("aria-pressed", Lagring.kapitel(c.id).ikryssade.includes(b.dataset.uppgift));
    });

    // Känsla. Klick (eller mellanslag) på den nivå som redan är vald tar bort bedömningen.
    // Klicket kommer före change, så det sparade värdet är fortfarande det gamla här.
    const kansla = vy.querySelector(".kansla");
    const visaVald = (n) => { vy.querySelector(".kansla-vald").innerHTML = Delar.kanslaVald(n); };
    const taBort = (r) => { r.checked = false; Lagring.sattKansla(c.id, null); visaVald(null); };
    kansla.addEventListener("click", (e) => {
      const r = e.target;
      if (r.name === "kansla" && Number(r.value) === Lagring.kapitel(c.id).kansla) taBort(r);
    });
    // Mellanslag på en vald radioknapp ger inget klick i webbläsaren, så det sköts här.
    kansla.addEventListener("keydown", (e) => {
      const r = e.target;
      if (e.key !== " " || r.name !== "kansla" || !r.checked) return;
      e.preventDefault();
      taBort(r);
    });
    kansla.addEventListener("change", (e) => {
      if (e.target.name !== "kansla") return;
      Lagring.sattKansla(c.id, Number(e.target.value));
      visaVald(Number(e.target.value));
    });

    // Anteckning
    const ta = vy.querySelector("#anteckning");
    anpassaHojd(ta);
    ta.addEventListener("input", () => { anpassaHojd(ta); sparaAnteckningSnart(c.id, ta.value); });
    ta.addEventListener("blur", sparaAnteckningNu);
  }

  // Tangenter (genvägar, aldrig enda vägen): ← → föregående/nästa kapitel, 1–5 känsla.
  document.addEventListener("keydown", (e) => {
    const vy = document.querySelector(".nu[data-kapitel]");
    if (!vy || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    const t = e.target;
    if (t.isContentEditable || /^(TEXTAREA|SELECT)$/.test(t.tagName) || (t.tagName === "INPUT" && t.type !== "radio")) return;
    const kid = vy.dataset.kapitel;
    // I känslovalet flyttar pilarna mellan nivåerna (som vanliga radioknappar), inte mellan kapitel.
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && t.type !== "radio") {
      const c = e.key === "ArrowLeft" ? Kurs.foregaende(kid) : Kurs.nasta(kid);
      if (c) { e.preventDefault(); location.hash = "#/kapitel/" + c.id; }
    } else if (/^[1-5]$/.test(e.key)) {
      const r = vy.querySelector('input[name="kansla"][value="' + e.key + '"]');
      if (r && !r.checked) {
        e.preventDefault();
        r.checked = true;
        r.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  });

  (window.Vyer = window.Vyer || {}).nu = { rita };
})();
