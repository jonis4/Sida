# Instruktion: ny tidslinje i Läget (variant F)

> Till Claude Code. Läs hela innan du börjar. Ändringen gäller **bara tidslinjen i Läget** (`sida/js/vyer/laget.js`, funktionen `tidslinje()`) och dess CSS. Rör inget annat i vyerna. Följ `CLAUDE.md` §4: stanna när du är klar, visa Jonatan och vänta på OK.

---

## 1. Bakgrund

Jonatan behöver *se* var han är i tiden. Datum och veckonummer säger honom ingenting. Tidslinjen är appens viktigaste överblick, och den ska svara på tre frågor med en blick:

1. **Var på linjen är jag?**
2. **Hur nära är nästa moment?**
3. **Vilken del av kursen är jag i?**

Tidslinjen ska vara ett **rent visuellt element**. Man interagerar inte med den, förutom en liten ?-knapp som förklarar vad man ser.

Förlagan är wireframen *"Tidslinje – visuella varianter"*, artboard **F**. Måtten nedan är tagna därifrån.

---

## 2. Beslut (skriv in dem under *Beslut* i `CLAUDE.md`)

1. Tidslinjen är rent visuell. Modulbanden är inte klickbara, och Tentans band är ingen länk. Tentan nås bara via raden "Tentan · Öppna →" i listan.
2. Tidslinjen börjar vid kursstart (första föreläsningen) och **slutar när tentadagen slutar**. Ingen marginal före eller efter, och ingen helg efter tentan.
3. Inga veckoetiketter, inga modulnamn och inga datum i tidslinjen. Bara modulnummer.
4. Föreläsningar och helger ligger på **samma tunna rad** under banden.
5. **Alla föreläsningsstreck är grå, utom nästa föreläsning som är svart och något högre.** Idag-linjen räcker för att skilja före och efter.
6. Modul 6 ritas som ett eget band (nummer 6) i tidslinjen, och Tentan som ett eget svart block på tentadagen. `visas_med` i `kurs.json` styr fortfarande listan, men ignoreras i tidslinjen. **Ändra inte `kurs.json`.**
7. En liten **?-knapp** under tidslinjen fäller ut en förklaring på plats. Det är ett godkänt avsteg från `DESIGNLAG.md` §4 (ikoner utan text), eftersom ? är allmänt begripligt. Logga det som avsteg enligt `DESIGNLAG.md` §10.

---

## 3. Vad som ska bort ur nuvarande `tidslinje()`

- `.tl-veckor` (veckoetiketterna) helt.
- `<button>`/`<a>` på modulbanden. De blir `<span>`.
- Klicklyssnaren på `.tidslinje` i `rita()`, och den delen av `visaModul()` som bara används av tidslinjen. **Behåll** `visaModul` om något annat använder den. Kontrollera först.
- `MARGINAL` (3 dagar före och efter).
- `.tl-namn` i banden.
- Den separata raden `.tl-forelasningar` slås ihop med helgerna till en rad (se §4).
- Hover-stilarna på banden (`--band-hover`).

---

## 4. Uppbyggnad

Tidslinjen är en behållare med `position: relative`. Allt i den är `position: absolute` och placeras i **procent av tiden**:

- `start` = första föreläsningens datum
- `slut` = dagen efter tentadagen
- `total` = antal dagar mellan dem
- `x(datum)` = `100 * dagar(start → datum) / total`

Inget datum hårdkodas. Allt räknas fram ur `Kurs`.

### 4.1 Lager och mått (desktop, uppifrån)

| Lager | Placering | Utseende |
|---|---|---|
| **Textrad** | top 0, höjd ca 11 px | "idag" ovanför idag-linjen, centrerat (`translateX(-40%)`). "Tenta" högerjusterat mot högerkanten. 11 px, vikt 600 |
| **Modulband** | top 16 px, höjd 24 px | En per modul, från modulens första till sista föreläsningsdag (inklusive). 2 px mellanrum till nästa band. Rundning 3 px. Bara numret, 11 px, vikt 600, vänsterställt med 6 px indrag |
| **Jul (uppehåll)** | Samma som banden | Diagonal streckning ovanpå bandet, från `Kurs.uppehall()` |
| **Tentan** | Samma som banden | Svart block, exakt en dag brett, på tentadagen. Ligger alltså i högerkanten |
| **Helger** | top 48 px, höjd 10 px | Lör–sön som ljusgrå block, bara helger före tentan |
| **Föreläsningar** | top 48 px, höjd 10 px | 2 px breda streck mitt på dagen, rundning 1 px, grå |
| **Nästa föreläsning** | top 45 px, höjd 13 px | Samma streck men svart och 3 px högre |
| **Idag** | top 12 px, höjd 48 px | 2 px svart linje mitt på dagen, med `box-shadow: 0 0 0 2px var(--bg)` så att den syns ovanpå banden. Starkast av allt |

Total höjd: ca 62 px. Därunder ?-knappen (§5).

### 4.2 Färger och tokens

Lägg till eller justera i `:root` i `style.css`, och lika i mörkt läge:

| Token | Ljust | Används till |
|---|---|---|
| `--band` | `#e8e8e8` (finns) | Modulband |
| `--band-pagar` | `#d2d2d2` | Modulen som pågår. **Ljusare än idag**, så att Tentan och idag-linjen förblir det mörkaste |
| `--band-pagar-text` | `var(--text)` | Numret i modulen som pågår |
| `--band-text` | `#6b6b6b` | Numret i övriga moduler (kontrollera kontrasten mot `--band`) |
| `--tl-helg` | `#e6e6e6` | Helgblocken |
| `--tl-forelasning` | `#b0b0b0` | Föreläsningsstrecken |
| `--tl-nasta` | `var(--text)` | Nästa föreläsning |
| `--tl-tenta` | `var(--text)` | Tentablocket |

Mörkt läge: samma roller, inverterade. Helgen ska vara svagt synlig mot bakgrunden, banden något ljusare än bakgrunden, och idag, nästa och Tentan ska vara de ljusaste. Kontrollera att numren i banden klarar 4,5:1.

### 4.3 Regler för innehållet

- **Modulen som pågår:** använd `Kurs.pagar(dag)`. Under modul 6 och fram till tentan är det band 6 som pågår.
- **Nästa föreläsning:** den första föreläsning som **inte har slutat än**, jämfört med nuvarande datum *och klockslag* (`f.datum` + `f.slut`). En föreläsning som pågår just nu, eller som är senare idag, är alltså "nästa". Finns ingen (efter sista föreläsningen) markeras ingen.
- **Helger:** varje lördag och söndag mellan `start` och tentadagen.
- **Jul:** `Kurs.uppehall()`. Streckningen ritas över hela uppehållet.
- **Modulnummer i smala band:** om bandet är för smalt för numret (mobil, modul 4) ska numret döljas, inte klippas eller flöda över. Lös det med `overflow: hidden` och `text-overflow: clip`, eller ett minsta bredd-villkor.

---

## 5. ?-knappen och förklaringen

- Knappen står **under tidslinjen, högerjusterad**, i linje med tentablocket.
- **Klickytan är 44 × 44 px** (`--klickyta`). Det synliga är en cirkel på 22 px med 1 px kant (`--svag` eller `--tyst`) och ett "?" i 12 px, vikt 600.
- `aria-label="Vad betyder tidslinjen?"`, `aria-expanded`, `aria-controls` mot förklaringen.
- När förklaringen är öppen är cirkeln ifylld (bakgrund `--text`, text `--bg`).
- **Klick fäller ut förklaringen på plats**, direkt under knappen. Ingen modal, ingen popup och ingen tooltip (`DESIGNLAG.md` L8 och §8).
- `Esc` stänger förklaringen och lämnar fokus på knappen.
- Läget (öppen/stängd) behöver inte sparas.

**Förklaringen** är en yta med bakgrund `--yta`, rundning `--rundning`, padding cirka 14 × 16 px, 12 px text i `--tyst`. Den innehåller en rad som radbryts, med ett litet exempel ritat med **samma CSS-klasser som tidslinjen**, så att förklaringen alltid ser ut som det den förklarar:

| Exempel | Text |
|---|---|
| Svart 2 px linje | Idag |
| Litet band med "1" | Modul |
| Grått streck | Föreläsning |
| Svart, högre streck | Nästa föreläsning |
| Ljusgrått block | Helg |
| Streckat band | Jul, inga föreläsningar |
| Svart block | Tenta |

---

## 6. Tillgänglighet

- Själva tidslinjen är `role="img"` med en `aria-label` i klartext som byggs från datan. Exempel:
  *"Idag torsdag 5 november. Modul 1 av 6, Partiella derivator. Nästa föreläsning fredag 6 november. Tentan onsdag 13 januari."*
- Inga fokuserbara element i tidslinjen. Det enda fokusstoppet är ?-knappen.
- Förklaringens exempel är `aria-hidden`. Texten bredvid räcker.

---

## 7. Kanttillstånd

| Läge | Vad som visas |
|---|---|
| Före kursstart | Ingen idag-linje och ingen "idag"-text. Rubriken ovanför säger redan "Kursen börjar …" |
| Under kursen | Som ovan |
| Under jul | Idag-linjen ligger i det streckade uppehållet. Nästa föreläsning är F28 |
| Tentadagen | Idag-linjen ligger på tentablocket. Ingen föreläsning är "nästa" |
| Efter tentan | Ingen idag-linje. Rubriken säger "Tentan har varit" |

Uppdatera `layout.md` §10 så att det stämmer med tabellen.

---

## 8. Mobil

- Samma tidslinje, i full bredd.
- Numren i de smalaste banden döljs (§4.3).
- Ingen sidledsscroll på 320 px.
- ?-knappen behåller klickytan på 44 px.

---

## 9. Dokumentation

- **`layout.md` §4.2:** ersätt beskrivningen av tidslinjen med §2 och §4 här i kortform. Ta bort meningarna om klick på moduler.
- **`layout.md` §10:** enligt §7 ovan.
- **`CLAUDE.md`:** besluten i §2 under *Beslut*, med datum.
- **`index.html`:** byt `?v=`-numret.

---

## 10. Verifiering

Öppna sidan i webbläsaren och kontrollera, med `window.IDAG_DATUM` för varje datum:

| Datum | Förväntat |
|---|---|
| `2026-10-30` | Ingen idag-linje. F1 är svart |
| `2026-11-05` | Idag i modul 1, band 1 mörkare. F4 (14:45) eller F5 är svart beroende på klockslag |
| `2026-11-29` | Idag i glappet mellan modul 3 och 4. F17 är svart |
| `2026-12-24` | Idag i julstreckningen. F28 är svart |
| `2027-01-13` | Idag på tentablocket. Inget streck är svart |
| `2027-01-20` | Ingen idag-linje |

Kontrollera också:
- Ljust och mörkt läge.
- 320 px och 390 px bredd.
- Med bara tangentbord: Tab når ?-knappen, Enter öppnar, Esc stänger och fokus stannar på knappen.
- Inga konsolfel.
- Att listan i Läget fungerar som förut (sortering, hopfällda moduler, Tentan-raden).

**Stanna och visa Jonatan** en skärmdump av tidslinjen för 5 nov och 24 dec, både ljust och mörkt, plus förklaringen utfälld.
