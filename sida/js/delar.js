// Delar som återkommer i flera vyer. Finns på ett ställe så att de ser likadana ut överallt.
(function () {
  "use strict";

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const tid = (d) => String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");

  // "5", "5 och 6", "5, 6 och 7"
  function ochLista(lista) {
    return lista.length < 2 ? lista.join("") : lista.slice(0, -1).join(", ") + " och " + lista[lista.length - 1];
  }

  // Känsla 1–5 (layout.md §3). Samma namn överallt.
  const KANSLOR = { 1: "Förstår inte", 2: "Osäker", 3: "Hänger med", 4: "Kan räkna", 5: "Kan förklara" };

  // ---------- Uppgifter ----------
  // Visningsnamn: "24∗" om uppgiften har ∗ i studiehandledningen. Id:t är alltid utan ∗.
  const uppgiftNamn = (c, nr) => nr + ((c.stjarna || []).includes(nr) ? "∗" : "");

  function uppgiftKnapp(c, nr, ikryssad) {
    const namn = uppgiftNamn(c, nr);
    return '<button type="button" class="uppgift" data-uppgift="' + esc(nr) + '" aria-pressed="' + ikryssad + '"'
      + ' aria-label="Uppgift ' + esc(namn) + '">' + esc(namn) + "</button>";
  }

  // Standarduppgifterna som stora knappar, påbyggnad på en egen rad (layout.md §5.1).
  function uppgifter(c) {
    const ikr = new Set(Lagring.kapitel(c.id).ikryssade);
    let h = '<section class="uppgifter" aria-labelledby="rubrik-uppgifter">'
      + '<h2 id="rubrik-uppgifter" class="etikett">Uppgifter</h2>';
    if (c.anmarkning) h += '<p class="anmarkning">' + esc(c.anmarkning) + "</p>";
    if (c.standard.length) {
      h += '<div class="uppgiftsrad" role="group" aria-label="Standarduppgifter">'
        + c.standard.map((nr) => uppgiftKnapp(c, nr, ikr.has(nr))).join("") + "</div>";
    } else {
      h += '<p class="tyst">Bara påbyggnadsuppgifter</p>';
    }
    if (c.pabyggnad.length) {
      h += '<div class="uppgiftsrad pabyggnad" role="group" aria-labelledby="etikett-pab">'
        + '<span id="etikett-pab" class="rad-etikett">Påbyggnad</span>'
        + c.pabyggnad.map((nr) => uppgiftKnapp(c, nr, ikr.has(nr))).join("") + "</div>";
    }
    return h + "</section>";
  }

  // ---------- Känsla ----------
  // Riktiga radioknappar i en fieldset, plus en synlig "Ta bort bedömning" (DESIGNLAG L4, L12).
  function kansla(c) {
    const vald = Lagring.kapitel(c.id).kansla;
    let h = '<fieldset class="kansla"><legend class="etikett">Hur känns kapitlet?</legend><div class="segment">';
    for (const [n, namn] of Object.entries(KANSLOR)) {
      h += '<label class="segment-val"><input type="radio" name="kansla" value="' + n + '"'
        + (Number(n) === vald ? " checked" : "") + ">"
        + '<span class="kanslaruta k' + n + '" aria-hidden="true">' + n + "</span>"
        + '<span class="segment-namn">' + esc(namn) + "</span></label>";
    }
    h += "</div>"
      + '<button type="button" class="textknapp ta-bort"' + (vald ? "" : " hidden") + ">Ta bort bedömning</button>"
      + "</fieldset>";
    return h;
  }

  // Sidfoten: Inställningar och sparstatus. Ett sparfel blir en beständig varning (DESIGNLAG L6).
  function sidfot(el) {
    const s = Lagring.status;
    let text;
    if (s.fel === "blockerad") {
      text = '<span class="varning">Webbläsaren tillåter inte sparande. Det du fyller i försvinner när fliken stängs.</span>';
    } else if (s.fel === "full") {
      text = '<span class="varning">Lagringen i webbläsaren är full. Det senaste sparades inte.</span>';
    } else if (s.fel === "nyare") {
      text = '<span class="varning">Datan är sparad av en nyare version av sidan och skrivs inte över. Ladda om sidan.</span>';
    } else if (s.senast) {
      text = "Sparad i webbläsaren " + tid(s.senast);
    } else {
      text = "Sparas i webbläsaren";
    }
    el.innerHTML = '<a href="#/installningar">Inställningar</a><span class="sep" aria-hidden="true">·</span>'
      + '<span role="status">' + text + "</span>";
  }

  window.Delar = { esc, ochLista, KANSLOR, uppgiftNamn, uppgifter, kansla, sidfot };
})();
