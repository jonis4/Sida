// Läget: "Var i kursen är vi och hur känns kapitlen?" (layout.md §4)
// Visar vad man klickat i, men värderar det aldrig.
(function () {
  "use strict";
  const { esc, KANSLOR } = Delar;

  const SORTERINGAR = { kurs: "Kursordning", kansla: "Efter känsla", tentan: "Viktigast på tentan" };
  let sortering = "kurs";       // minns vald sortering under besöket
  const utfallda = new Set();   // moduler som inte börjat men som man fällt ut

  const harBorjat = (mid, dag) => { const d = Kurs.modulDatum(mid); return d && d.forsta <= dag; };

  // ---------- Rubriken ----------
  function rubrik(dag) {
    const K = Kurs.data;
    const antal = K.moduler.filter((m) => m.typ !== "tenta").length;
    const forsta = K.forelasningar[0].datum;
    let rad;
    if (dag < forsta) {
      rad = "Kursen börjar " + Kurs.datumText(forsta, "kort");
    } else if (dag > K.kurs.tenta) {
      rad = "Tentan har varit (" + Kurs.datumText(K.kurs.tenta, "kort") + ")";
    } else {
      const p = Kurs.pagar(dag);
      if (p.typ === "tenta" || p.visas_med) {
        const t = Kurs.tentamodul();
        const fran = p.visas_med ? Kurs.modulDatum(p.id).forsta : K.kurs.tenta;
        rad = t.namn + " · " + Kurs.intervallText(fran, K.kurs.tenta)
          + (p.visas_med ? " · " + p.namn.toLowerCase() + " inför tentan" : "");
      } else {
        const d = Kurs.modulDatum(p.id);
        rad = "Modul " + Kurs.modulNr(p.id) + " av " + antal + " · " + p.namn + " · " + Kurs.intervallText(d.forsta, d.sista);
      }
    }
    return "<h1>" + esc(K.kurs.namn) + '</h1><p class="laget-pagar">' + esc(rad) + "</p>";
  }

  // ---------- Tidslinjen (layout.md §4.2) ----------
  // I skala från kursstart till tentan, med några dagars marginal så att idag-linjen
  // kan ligga före första modulen och efter tentan. En karta, aldrig en värdering.
  const MARGINAL = 3;

  function tidslinje(dag) {
    const K = Kurs.data;
    const start = Kurs.plusDagar(K.forelasningar[0].datum, -MARGINAL);
    const slut = Kurs.plusDagar(K.kurs.tenta, MARGINAL + 1); // dagen efter sista dagen
    const total = Kurs.dagarMellan(start, slut);
    const x = (iso) => (100 * Kurs.dagarMellan(start, iso) / total);
    const pos = (iso) => x(iso).toFixed(3) + "%";
    const bredd = (fran, till) => (x(Kurs.plusDagar(till, 1)) - x(fran)).toFixed(3) + "%"; // till räknas med
    const pagar = Kurs.pagar(dag);

    // Veckor: en liten etikett vid varje måndag
    let veckor = "";
    let man = Kurs.plusDagar(start, (8 - new Date(start + "T00:00:00Z").getUTCDay()) % 7);
    for (let i = 0; man < slut; man = Kurs.plusDagar(man, 7), i++) {
      veckor += '<span class="tl-vecka' + (i % 2 ? " udda" : "") + '" style="left:' + pos(man) + '">v' + Kurs.vecka(man) + "</span>";
    }

    // Uppehåll (jul): svagt streckad yta
    let ytor = "";
    for (const u of Kurs.uppehall()) {
      ytor += '<span class="tl-uppehall" style="left:' + pos(u.fran) + ";width:" + bredd(u.fran, u.till) + '">'
        + '<span class="dold">' + (u.jul ? "Jul" : "Uppehåll") + " "
        + esc(Kurs.intervallText(u.fran, u.till)) + "</span></span>";
    }

    // Modulband. Moduler som visas med en annan (m6) blir en del av den modulens band.
    let band = "";
    for (const m of K.moduler) {
      if (m.visas_med) continue;
      const d = Kurs.modulDatum(m.id);
      const med = Kurs.visasMed(m.id);
      const fran = med.reduce((a, v) => (Kurs.modulDatum(v.id).forsta < a ? Kurs.modulDatum(v.id).forsta : a), d.forsta);
      const arPagar = pagar && (pagar.id === m.id || pagar.visas_med === m.id);
      const tid = Kurs.intervallText(fran, d.sista);
      const stil = ' style="left:' + pos(fran) + ";width:" + bredd(fran, d.sista) + '"';
      const klass = "tl-band" + (arPagar ? " pagar" : "");
      if (m.typ === "tenta") {
        band += '<a class="' + klass + '" href="#/tentan"' + stil + ' aria-label="' + esc(m.namn + " · " + tid + (arPagar ? ", pågår" : "") + ". Öppna Tentan") + '">'
          + '<span class="tl-namn">' + esc(m.namn) + "</span></a>";
      } else {
        const nr = Kurs.modulNr(m.id);
        band += '<button type="button" class="' + klass + '" data-modul="' + esc(m.id) + '"' + stil
          + ' aria-label="' + esc("Modul " + nr + " · " + m.namn + " · " + tid + (arPagar ? ", pågår" : "") + ". Visa i listan") + '">'
          + '<span class="tl-nr">' + nr + '</span><span class="tl-namn">' + esc(m.namn) + "</span></button>";
      }
    }

    // Föreläsningar: korta, omärkta streck mitt på dagen
    const streck = K.forelasningar.map((f) =>
      '<span class="tl-streck" style="left:calc(' + pos(f.datum) + " + " + (50 / total).toFixed(3) + '%)"></span>').join("");

    // Idag: en tunn linje genom banden (mitt på dagen). Utanför kursen hamnar den i marginalen.
    let idag = "";
    const d = dag < start ? start : dag >= slut ? Kurs.plusDagar(slut, -1) : dag;
    idag = '<span class="tl-idag" style="left:calc(' + pos(d) + " + " + (50 / total).toFixed(3) + '%)"><span class="dold">Idag, '
      + esc(Kurs.datumText(dag, "kort")) + "</span></span>";

    return '<div class="tidslinje" role="group" aria-label="Tidslinje från kursstart till tentan">'
      + '<div class="tl-veckor" aria-hidden="true">' + veckor + "</div>"
      + '<div class="tl-banden">' + band + ytor + idag + "</div>"
      + '<div class="tl-forelasningar" aria-hidden="true">' + streck + "</div>"
      + "</div>";
  }

  // ---------- En kapitelrad ----------
  function kapitelRad(c, senast) {
    const u = Lagring.kapitel(c.id);
    const ikr = c.standard.filter((n) => u.ikryssade.includes(n)).length; // bara standarduppgifter räknas
    const tot = c.standard.length;
    const pt = Kurs.paTentan(c.id);
    const arSenast = c.id === senast;

    const namn = [c.id + " " + c.titel];
    namn.push(tot ? ikr + " av " + tot + " uppgifter ikryssade" : "inga standarduppgifter");
    if (u.kansla) namn.push("känns " + u.kansla + " " + KANSLOR[u.kansla]);
    if (pt.antal) namn.push("på " + pt.antal + " av " + pt.av + " gamla tentor");
    if (arSenast) namn.push("senast öppnad");

    return '<li><a class="kapitelrad' + (arSenast ? " senast" : "") + '" href="#/kapitel/' + esc(c.id) + '" aria-label="' + esc(namn.join(", ")) + '">'
      + '<span class="kol-kapitel"><span class="kapitelnr">' + esc(c.id) + '</span><span class="kapiteltitel">' + esc(c.titel) + "</span>"
      + (arSenast ? '<span class="senast-etikett">senast öppnad</span>' : "") + "</span>"
      + '<span class="kol-ikryssade" aria-hidden="true">'
      + (tot
        ? '<span class="stapel"><span style="width:' + (100 * ikr / tot) + '%"></span></span><span class="siffror">' + ikr + "/" + tot + "</span>"
        : '<span class="tertiar">–</span>')
      + "</span>"
      + '<span class="kol-kansla" aria-hidden="true">'
      + (u.kansla ? '<span class="kanslaruta k' + u.kansla + '">' + u.kansla + '</span><span class="kansla-namn">' + esc(KANSLOR[u.kansla]) + "</span>" : "")
      + "</span>"
      + '<span class="kol-tentan siffror" aria-hidden="true">' + (pt.antal ? pt.antal + " av " + pt.av : "") + "</span>"
      + "</a></li>";
  }

  const kolumnRubriker = () => '<div class="kolumnrubriker" aria-hidden="true"><span class="kol-kapitel">Kapitel</span>'
    + '<span class="kol-ikryssade">Ikryssade</span><span class="kol-kansla">Känns</span><span class="kol-tentan">På tentan</span></div>';

  // ---------- Kursordning: grupperad per modul ----------
  function kursordning(dag, senast) {
    const K = Kurs.data;
    let h = "";
    for (const m of K.moduler) {
      if (m.visas_med) continue; // visas tillsammans med sin modul (m6 med Tentan)
      if (m.typ === "tenta") { h += tentaRad(m); continue; }
      const d = Kurs.modulDatum(m.id);
      const kap = Kurs.kapitelIModul(m.id);
      const titel = "Modul " + Kurs.modulNr(m.id) + " · " + m.namn + " · " + Kurs.intervallText(d.forsta, d.sista);
      const lista = '<ul class="kapitellista">' + kap.map((c) => kapitelRad(c, senast)).join("") + "</ul>";
      if (harBorjat(m.id, dag)) {
        h += '<section class="modul" id="modul-' + esc(m.id) + '"><h3 class="modulrubrik">' + esc(titel) + "</h3>" + lista + "</section>";
      } else {
        // Moduler som inte har börjat är hopfällda till en rad (layout.md §4.3).
        h += '<details class="modul" id="modul-' + esc(m.id) + '" data-modul="' + esc(m.id) + '"' + (utfallda.has(m.id) ? " open" : "") + ">"
          + '<summary class="modulrubrik"><span>' + esc(titel) + '</span><span class="tyst">' + kap.length + " kapitel"
          + ' · <span class="visa">Visa ↓</span><span class="dolj">Dölj ↑</span></span></summary>' + lista + "</details>";
      }
    }
    return h;
  }

  // "Tentan · repetition från 17 dec · ons 13 jan · 3 gamla tentor · Öppna →"
  function tentaRad(m) {
    const K = Kurs.data;
    const delar = [m.namn];
    for (const v of Kurs.visasMed(m.id)) delar.push(v.namn.toLowerCase() + " från " + Kurs.datumText(Kurs.modulDatum(v.id).forsta));
    delar.push(Kurs.datumText(K.kurs.tenta, "kort"));
    if (K.tentor.length) delar.push(K.tentor.length + (K.tentor.length === 1 ? " gammal tenta" : " gamla tentor"));
    return '<section class="modul" id="modul-' + esc(m.id) + '"><a class="modulrubrik tentarad" href="#/tentan"><span>'
      + esc(delar.join(" · ")) + '</span><span class="tyst">Öppna →</span></a></section>';
  }

  // ---------- Sorterat utan grupper ----------
  function sorterat(senast) {
    const K = Kurs.data;
    const ordning = new Map(K.kapitel.map((c, i) => [c.id, i]));
    const kap = K.kapitel.slice();
    if (sortering === "kansla") {
      // Lägst först, obedömda sist. Lika: kursordning.
      const v = (c) => Lagring.kapitel(c.id).kansla || 99;
      kap.sort((a, b) => v(a) - v(b) || ordning.get(a.id) - ordning.get(b.id));
    } else {
      // Flest förekomster först. Lika: kursordning.
      kap.sort((a, b) => Kurs.paTentan(b.id).antal - Kurs.paTentan(a.id).antal || ordning.get(a.id) - ordning.get(b.id));
    }
    let h = '<ul class="kapitellista platt">' + kap.map((c) => kapitelRad(c, senast)).join("") + "</ul>";
    if (sortering === "tentan" && !K.tentor.length) h = '<p class="tyst">Inga gamla tentor är inlagda än.</p>' + h;
    return h;
  }

  function listan(dag) {
    const senast = Lagring.senast();
    return sortering === "kurs" ? kursordning(dag, senast) : sorterat(senast);
  }

  function rita(el) {
    const dag = Kurs.idag();
    const tomt = Kurs.data.kapitel.every((c) => {
      const u = Lagring.kapitel(c.id);
      return !u.ikryssade.length && !u.kansla && !u.anteckning;
    });
    el.innerHTML = '<div class="laget">' + rubrik(dag) + tidslinje(dag)
      + '<section class="kapitlen" aria-labelledby="rubrik-kapitlen">'
      + '<div class="kapitlen-topp"><h2 id="rubrik-kapitlen" class="etikett">Kapitlen</h2>'
      + '<div class="flikar" role="group" aria-label="Sortering">'
      + Object.entries(SORTERINGAR).map(([k, namn]) =>
        '<button type="button" class="flik" data-sortering="' + k + '" aria-pressed="' + (k === sortering) + '">' + namn + "</button>").join("")
      + "</div></div>"
      + (tomt ? '<p class="tyst komigang">Öppna ett kapitel för att kryssa i uppgifter och säga hur det känns.</p>' : "")
      + kolumnRubriker()
      + '<div class="lista-innehall">' + listan(dag) + "</div>"
      + "</section></div>";

    const vy = el.querySelector(".laget");
    const innehall = vy.querySelector(".lista-innehall");

    function sattSortering(s) {
      sortering = s;
      vy.querySelectorAll(".flik").forEach((f) => f.setAttribute("aria-pressed", f.dataset.sortering === sortering));
      innehall.innerHTML = listan(dag); // bara listan ritas om, fokus stannar kvar
    }

    vy.querySelector(".flikar").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-sortering]");
      if (b && b.dataset.sortering !== sortering) sattSortering(b.dataset.sortering);
    });

    // Klick på ett modulband gör samma sak som modulens rubrik i listan: fäller ut och scrollar dit.
    // Listan måste stå i kursordning för att modulen ska finnas där.
    vy.querySelector(".tidslinje").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-modul]");
      if (!b) return;
      if (sortering !== "kurs") sattSortering("kurs");
      visaModul(b.dataset.modul);
    });

    // Minns vilka hopfällda moduler man fällt ut.
    innehall.addEventListener("toggle", (e) => {
      const d = e.target;
      if (!d.dataset || !d.dataset.modul) return;
      if (d.open) utfallda.add(d.dataset.modul); else utfallda.delete(d.dataset.modul);
    }, true);
  }

  // Esc fäller ihop den utfällda modul som fokus står i, och lämnar fokus på dess rubrik.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const d = document.activeElement && document.activeElement.closest(".laget details[open]");
    if (!d) return;
    d.open = false;
    d.querySelector("summary").focus();
  });

  // Fäller ut en modul och scrollar dit. Fokus flyttas till modulens rubrik, så att man kan fortsätta med tangentbordet.
  function visaModul(mid) {
    const d = document.querySelector("#modul-" + CSS.escape(mid));
    if (!d) return;
    if (d.tagName === "DETAILS") d.open = true;
    const r = d.querySelector(".modulrubrik");
    if (r.tagName === "H3") r.setAttribute("tabindex", "-1");
    r.focus({ preventScroll: true });
    d.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  (window.Vyer = window.Vyer || {}).laget = { rita, visaModul };
})();
