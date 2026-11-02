// Tentan (modul 7): utformas i fas 10 (layout.md §6).
(function () {
  "use strict";
  const { esc } = Delar;

  function rita(el) {
    el.innerHTML = "<h1>Tentan</h1><p>" + esc(Kurs.datumText(Kurs.data.kurs.tenta, "kort"))
      + '</p><p class="platshallare">Vyn tas fram senare.</p>';
  }

  (window.Vyer = window.Vyer || {}).tentan = { rita };
})();
