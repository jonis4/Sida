// Läget: "Var i kursen är vi och hur känns kapitlen?" (layout.md §4)
// Visar vad man klickat i, men värderar det aldrig.
(function () {
  "use strict";
  const { esc, KANSLOR } = Delar;

  // Synligt namn och fullständigt namn (för skärmläsare) per sortering.
  const SORTERINGAR = { kurs: ["Kursordning"], kansla: ["Efter känsla"], tentan: ["På tentan", "Viktigast på tentan"] };
  // Datum bryts aldrig mitt i ("2–" / "10 nov").
  const datum = (text) => '<span class="hel">' + esc(text) + "</span>";
  let sortering = "kurs";       // minns vald sortering under besöket
  // Bara en modul är utfälld åt gången. null = inget valt än: då är modulen som pågår utfälld
  // (före kursstart den första). "" = man har fällt ihop allt. Minns under besöket.
  let oppen = null;

  function oppenModul(dag) {
    if (oppen !== null) return oppen;
    const K = Kurs.data;
    if (dag < K.forelasningar[0].datum) return K.moduler[0].id;
    const p = Kurs.pagar(dag);
    return p && p.typ !== "tenta" && !p.visas_med ? p.id : "";
  }

  // ---------- Rubriken ----------
  function rubrik(dag) {
    const K = Kurs.data;
    const antal = K.moduler.filter((m) => m.typ !== "tenta").length;
    const forsta = K.forelasningar[0].datum;
    let rad; // färdig HTML
    if (dag < forsta) {
      rad = "Kursen börjar " + datum(Kurs.datumText(forsta, "kort"));
    } else if (dag > K.kurs.tenta) {
      rad = "Tentan har varit (" + datum(Kurs.datumText(K.kurs.tenta, "kort")) + ")";
    } else {
      const p = Kurs.pagar(dag);
      if (p.typ === "tenta" || p.visas_med) {
        const t = Kurs.tentamodul();
        const fran = p.visas_med ? Kurs.modulDatum(p.id).forsta : K.kurs.tenta;
        rad = esc(t.namn) + " · " + datum(Kurs.intervallText(fran, K.kurs.tenta))
          + (p.visas_med ? " · " + esc(p.namn.toLowerCase()) + " inför tentan" : "");
      } else {
        const d = Kurs.modulDatum(p.id);
        rad = "Modul " + Kurs.modulNr(p.id) + " av " + antal + " · " + esc(p.namn) + " · " + datum(Kurs.intervallText(d.forsta, d.sista));
      }
    }
    return "<h1>" + esc(K.kurs.namn) + '</h1><p class="laget-pagar">' + rad + "</p>";
  }

  // ---------- Tidslinjen (layout.md §4.2) ----------
  // Rent visuell: var är jag, hur nära är nästa föreläsning, vilken del av kursen är jag i.
  // I skala från första föreläsningen till slutet av tentadagen. Allt räknas fram ur kurs.json.
  let forklaringOppen = false;

  // Nästa föreläsning: den första som inte har slutat, jämfört med datum och klockslag.
  function nastaForelasning(dag) {
    const tid = Kurs.klockslag();
    return Kurs.data.forelasningar.find((f) => f.datum > dag || (f.datum === dag && f.slut > tid)) || null;
  }

  function tidslinje(dag) {
    const K = Kurs.data;
    const start = K.forelasningar[0].datum;
    const slut = Kurs.plusDagar(K.kurs.tenta, 1); // dagen efter tentadagen
    const total = Kurs.dagarMellan(start, slut);
    const x = (iso) => 100 * Kurs.dagarMellan(start, iso) / total;
    const pos = (iso) => x(iso).toFixed(3) + "%";
    const mitt = (iso) => (x(iso) + 50 / total).toFixed(3) + "%"; // mitt på dagen
    const bredd = (fran, till) => (x(Kurs.plusDagar(till, 1)) - x(fran)).toFixed(3) + "%"; // till räknas med
    const pagar = Kurs.pagar(dag);
    const nasta = nastaForelasning(dag);
    const iKursen = dag >= start && dag <= K.kurs.tenta;

    // Modulband, ett per vanlig modul (även m6: visas_med gäller bara listan). Tentan är ett eget block.
    let band = "";
    for (const m of K.moduler) {
      if (m.typ === "tenta") continue;
      const d = Kurs.modulDatum(m.id);
      if (!d) continue;
      band += '<span class="tl-band' + (pagar && pagar.id === m.id ? " pagar" : "") + '" style="left:' + pos(d.forsta)
        + ";width:calc(" + bredd(d.forsta, d.sista) + ' - 2px)"><span class="tl-nr">' + Kurs.modulNr(m.id) + "</span></span>";
    }
    const jul = Kurs.uppehall().map((u) => '<span class="tl-uppehall" style="left:' + pos(u.fran) + ";width:" + bredd(u.fran, u.till) + '"></span>').join("");
    const tenta = '<span class="tl-tenta" style="left:' + pos(K.kurs.tenta) + ";width:" + bredd(K.kurs.tenta, K.kurs.tenta) + '"></span>';

    // Helger (lör–sön) före tentan, och föreläsningar på samma rad
    let helger = "";
    for (let d = start; d < K.kurs.tenta; d = Kurs.plusDagar(d, 1)) {
      const v = new Date(d + "T00:00:00Z").getUTCDay();
      if (v === 0 || v === 6) helger += '<span class="tl-helg" style="left:' + pos(d) + ";width:" + bredd(d, d) + '"></span>';
    }
    const streck = K.forelasningar.map((f) => '<span class="tl-streck' + (f === nasta ? " nasta" : "") + '" style="left:' + mitt(f.datum) + '"></span>').join("");

    // Idag: bara under kursen. Krockar "idag" med "Tenta" (nära slutet) står bara "idag", se tidslinjeText().
    const idag = iKursen ? '<span class="tl-idag" style="left:' + mitt(dag) + '"></span><span class="tl-text tl-idag-text" style="left:' + mitt(dag) + '">idag</span>' : "";
    const tentaText = '<span class="tl-text tl-tenta-text">Tenta</span>';

    // Samma sak i klartext för skärmläsare
    const lasbart = [];
    if (iKursen) lasbart.push("Idag " + Kurs.datumText(dag, "hel") + ".");
    if (pagar && pagar.typ !== "tenta") lasbart.push("Modul " + Kurs.modulNr(pagar.id) + " av " + K.moduler.filter((m) => m.typ !== "tenta").length + ", " + pagar.namn + ".");
    if (nasta) lasbart.push("Nästa föreläsning " + Kurs.datumText(nasta.datum, "hel") + ".");
    lasbart.push("Tentan " + Kurs.datumText(K.kurs.tenta, "hel") + ".");

    return '<div class="tidslinje" role="img" aria-label="' + esc(lasbart.join(" ")) + '">'
      + tentaText + band + jul + tenta + helger + streck + idag + "</div>"
      + '<div class="tl-hjalp-rad"><button type="button" class="tl-hjalp" aria-label="Vad betyder tidslinjen?" aria-controls="tl-forklaring" aria-expanded="' + forklaringOppen + '">'
      + '<span aria-hidden="true">?</span></button></div>'
      + '<div class="tl-forklaring" id="tl-forklaring"' + (forklaringOppen ? "" : " hidden") + ">" + forklaring() + "</div>";
  }

  // "Tenta" döljs om "idag" står i vägen. Räknas om när bredden ändras.
  function tidslinjeText() {
    const i = document.querySelector(".tl-idag-text"), t = document.querySelector(".tl-tenta-text");
    if (!t) return;
    t.style.visibility = "";
    if (i && i.getBoundingClientRect().right + 4 > t.getBoundingClientRect().left) t.style.visibility = "hidden";
  }
  window.addEventListener("resize", tidslinjeText);

  // Förklaringen ritar sina exempel med samma klasser som tidslinjen, så att de alltid ser likadana ut.
  function forklaring() {
    const ex = (inre, text, klass = "") => '<span class="tl-ex"><span class="tl-exempel' + klass + '" aria-hidden="true">' + inre + "</span>" + text + "</span>";
    return ex('<span class="tl-idag"></span>', "Idag", " smal")
      + ex('<span class="tl-band"><span class="tl-nr">1</span></span>', "Modul")
      + ex('<span class="tl-streck"></span>', "Föreläsning", " smal")
      + ex('<span class="tl-streck nasta"></span>', "Nästa föreläsning", " smal")
      + ex('<span class="tl-helg"></span>', "Helg")
      + ex('<span class="tl-band"></span><span class="tl-uppehall"></span>', "Jul, inga föreläsningar")
      + ex('<span class="tl-tenta"></span>', "Tenta");
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
      + (!tot ? '<span class="tertiar">–</span>'
        : ikr ? '<span class="stapel"><span style="width:' + (100 * ikr / tot) + '%"></span></span><span class="siffror">' + ikr + "/" + tot + "</span>"
        : "") // stapeln visas först när något är ikryssat; antalet står i skärmläsarnamnet
      + "</span>"
      + '<span class="kol-kansla" aria-hidden="true">'
      + (u.kansla ? '<span class="kanslaruta k' + u.kansla + '">' + u.kansla + '</span><span class="kansla-namn">' + esc(KANSLOR[u.kansla]) + "</span>" : "")
      + "</span>"
      + '<span class="kol-tentan siffror" aria-hidden="true">' + (pt.antal ? pt.antal + " av " + pt.av + " tentor" : "") + "</span>"
      + "</a></li>";
  }

  // ---------- Kursordning: grupperad per modul ----------
  function kursordning(dag, senast) {
    const K = Kurs.data;
    const utfalld = oppenModul(dag);
    let h = "";
    for (const m of K.moduler) {
      if (m.visas_med) continue; // visas tillsammans med sin modul (m6 med Tentan)
      if (m.typ === "tenta") { h += tentaRad(m); continue; }
      const d = Kurs.modulDatum(m.id);
      const kap = Kurs.kapitelIModul(m.id);
      // "Modul 1 · Partiella derivator" i fetstil, datumet tyst bredvid.
      // Datumet står bredvid titeln, och på mobil på egen rad med Visa ↓ till höger.
      const titel = '<span class="modul-titel">Modul ' + Kurs.modulNr(m.id) + " · " + esc(m.namn) + "</span>"
        + ' <span class="modul-datum">' + datum(Kurs.intervallText(d.forsta, d.sista)) + "</span>";
      const lista = '<ul class="kapitellista">' + kap.map((c) => kapitelRad(c, senast)).join("") + "</ul>";
      // Hopfälld modul: en liten ruta per kapitel i känslans färg (grå om obedömt), så att man ser läget utan att fälla ut.
      const kanslor = kap.map((c) => Lagring.kapitel(c.id).kansla);
      const bedomda = Object.entries(KANSLOR).map(([n, namn]) => [kanslor.filter((k) => k === Number(n)).length, namn]).filter(([a]) => a);
      const rutor = '<span class="modul-rutor" aria-hidden="true">' + kanslor.map((k) => k ? '<span class="k' + k + '">' + k + "</span>" : "<span></span>").join("") + "</span>"
        + '<span class="dold">, ' + kap.length + " kapitel" + bedomda.map(([a, namn]) => ", " + a + " känns " + namn.toLowerCase()).join("") + "</span>";
      // Alla moduler är hopfällbara, och name gör att bara en kan vara utfälld åt gången.
      h += '<details class="modul" name="moduler" id="modul-' + esc(m.id) + '" data-modul="' + esc(m.id) + '"' + (m.id === utfalld ? " open" : "") + ">"
        + '<summary class="modulrubrik">' + titel + '<span class="modul-meta"><span class="visa">Visa ↓</span><span class="dolj">Dölj ↑</span></span>'
        + rutor + "</summary>" + lista + "</details>";
    }
    return h;
  }

  // "Tentan · repetition från 17 dec · ons 13 jan · 3 gamla tentor · Öppna →"
  function tentaRad(m) {
    const K = Kurs.data;
    const delar = [datum(Kurs.datumText(K.kurs.tenta, "kort"))]; // repetitionen syns i tidslinjen
    const titel = '<span class="modul-titel">' + esc(m.namn) + '</span> <span class="modul-datum">' + delar.join("&nbsp;· ") + "</span>";
    // Så länge Tentan-vyn är en platshållare är raden ingen länk (DESIGNLAG L6: inga skenbara funktioner).
    if (window.Vyer.tentan && window.Vyer.tentan.platshallare) {
      return '<section class="modul" id="modul-' + esc(m.id) + '"><div class="modulrubrik tentarad">' + titel
        + '<span class="modul-meta">Kommer</span></div></section>';
    }
    return '<section class="modul" id="modul-' + esc(m.id) + '"><a class="modulrubrik tentarad" href="#/tentan">' + titel
      + '<span class="modul-meta">Öppna →</span></a></section>';
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
      + '<div class="kapitlen-topp"><h2 id="rubrik-kapitlen" class="dold">Kapitlen</h2>'
      + '<div class="flikar" role="group" aria-label="Sortering">'
      + Object.entries(SORTERINGAR).map(([k, [namn, lang]]) =>
        '<button type="button" class="flik" data-sortering="' + k + '" aria-pressed="' + (k === sortering) + '"'
        + (lang ? ' aria-label="' + lang + '"' : "") + ">" + namn + "</button>").join("")
      + "</div></div>"
      + (tomt ? '<p class="tyst komigang">Öppna ett kapitel för att kryssa i uppgifter och säga hur det känns.</p>' : "")
      + '<div class="lista-innehall">' + listan(dag) + "</div>"
      + "</section></div>";

    const vy = el.querySelector(".laget");
    tidslinjeText();
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

    // ?-knappen fäller ut förklaringen på plats.
    vy.querySelector(".tl-hjalp").addEventListener("click", () => visaForklaring(!forklaringOppen));

    // Minns vilken modul som är utfälld. Fäller man ut en fälls de andra ihop
    // (name på <details> gör det redan i nya webbläsare, det här är för äldre).
    innehall.addEventListener("toggle", (e) => {
      const d = e.target;
      if (!d.dataset || !d.dataset.modul) return;
      if (d.open) {
        oppen = d.dataset.modul;
        innehall.querySelectorAll("details[open]").forEach((x) => { if (x !== d) x.open = false; });
      } else if (oppen === d.dataset.modul || oppen === null) {
        oppen = "";
      }
    }, true);
  }

  // Esc stänger tidslinjens förklaring, eller fäller ihop den utfällda modul som fokus står i.
  // Fokus lämnas på knappen eller rubriken.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const d = document.activeElement && document.activeElement.closest(".laget details[open]");
    if (d) {
      d.open = false;
      d.querySelector("summary").focus();
    } else if (forklaringOppen && document.querySelector(".tl-hjalp")) {
      visaForklaring(false);
      document.querySelector(".tl-hjalp").focus();
    }
  });

  function visaForklaring(oppen) {
    forklaringOppen = oppen;
    const b = document.querySelector(".tl-hjalp");
    if (!b) return;
    b.setAttribute("aria-expanded", oppen);
    document.getElementById("tl-forklaring").hidden = !oppen;
  }

  (window.Vyer = window.Vyer || {}).laget = { rita };
})();
