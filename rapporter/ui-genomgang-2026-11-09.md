# UI-genomgång 2026-11-09

## Sammanfattning
Utgångspunkt: Jonatans skärmdumpar av Läget (Edge, mörkt läge, 9 nov) och egna renderingar på 1280, 390 och 320 px. Föreläsningskolumnen fungerar, men tre saker drog ner känslan. Läget hade sju olika textstorlekar, och tre av dem låg under 12 px (datumen i föreläsningskolumnen, känsloetiketten och modulnumren i tidslinjen). Föreläsningsgrupperna skildes bara åt med 16 px, alltså knappt mer än raderna inom en grupp. På mobil var varje kapitelrad 58 px hög även när andra raden var tom, så att listan såg glest och jämnt utspridd ut. Det är rättat. Dessutom fanns en bugg: valde man Mörkt i Inställningar (i stället för Auto) saknades åtta färgvariabler, så att kanter, klamrar och pilar blev ljusa på mörk botten. Den är också rättad.

## Mätt
- **Typskala i Läget**, före: 32 · 15 · 14 · 13 · 12 · 11,5 · 11 px (sju storlekar, tre under 12). Efter: 32 · 15 · 13 · 12 (fyra storlekar, inget under 12). Steg: 15/13 = 1,15 och 13/12 = 1,08 är små, men 12 används bara i grafik och på etiketter inne i raderna (tidslinjen, föreläsningskolumnen, känsla, ikryssade). Brödtext och metadata använder 32/15/13 enligt DESIGNLAG §4.
- **Vikter**, före: 400, 500 (Fortsätt, "idag"/"Tenta") och 600. Efter: bara 400 och 600 (DESIGNLAG §4, två vikter).
- **Andel fetstil i Läget**: oförändrad, ungefär 6 % (h1, modulrubriker, dagens föreläsning, modulnummer i tidslinjen).
- **Luft inom och mellan föreläsningsgrupper** (desktop): mellan textraderna i en grupp ca 23 px. Mellan grupperna 23 + 16 = 39 px före och 23 + 24 = 47 px efter, alltså 1,7× före och 2× efter. Målet 3× nås inte utan att raderna blir lägre än 44 px. Klammern bär resten av grupperingen.
- **Luft på mobil**: före var alla rader 58 px (ingen skillnad inom eller mellan grupper). Efter är tomma rader 44 px och rader med stapel eller känsla ca 60 px. Mellan grupperna ca 68 px från rad till rad, inom en grupp 44 px.
- **Sorter av klickbart i Läget**: huvudnav (text), Fortsätt (mörk kapsel), ?-knapp (cirkel), modulrubrik (fet + ▸/▾), kapitelrad (rad + pil →), sidfotslänk (understruken). Sex sorter med sex utseenden. Exakt en huvudhandling.
- **Kontrast**, text mot bakgrunden. Ljust: `--text` 17,4:1, `--tyst` 5,3:1, `--tertiar` 4,5:1 (`--tyst` på `--yta` 4,8:1). Mörkt: `--text` 14,8:1, `--tyst` 7,4:1, `--tertiar` 5,6:1 (`--tyst` på `--yta` 6,5:1). Vit text på känsloetiketterna: 5,1–6,7:1.
- **Sidledsscroll**: ingen på 1280, 390 eller 320 px.
- **Kisa-testet** (bild 09): Fortsätt syns först, sedan modulrubriken och känslorna. Föreläsningsgrupperna syns som block efter ändringen, före flöt de ihop.

## Ändrat
| Område | Vad | Varför (mål eller smak) | Bilder |
|---|---|---|---|
| Mörkt läge | `:root[data-theme="dark"]` fick de åtta variabler som saknades (`--svag-modul`, `--pil`, `--klammer-*`, `--kant-kontroll`, `--kant-kontroll-streckad`, `--yta-grupp`). Dubbletterna i Auto-blocket är borttagna. | Mörkt läge ska vara lika genomarbetat som ljust (§4 grundkrav). Valt Mörkt gav ljusa kanter och klamrar. | – |
| Typskala | Ny variabel `--storlek-minst` (12 px). Föreläsningskolumnen, känsloetiketten, modulnumren i tidslinjen, rutorna och ikryssade använder den. Alla lösa `0.875rem`, `0.75rem`, `0.6875rem` och `0.71875rem` är ersatta med variabler. | Ingen text under 12 px, högst fyra storlekar per vy, inga lösa värden. | 07 |
| Typskala | Raden under rubriken i Läget är 15 px (var 14). Metaraden i Nu och påbyggnadsuppgifterna är 13 px (var 14). | Ett steg på 14 mellan 13 och 15 syns inte (§1: "små texter är inte små"). | 07 |
| Vikt | Fortsätt och "idag"/"Tenta" i tidslinjen har vikt 400 (var 500). Fortsätt är 15 px (var 14). | Två vikter. Kapseln bär huvudhandlingen, inte vikten. | 07 |
| Föreläsningskolumnen | Kolumnen är 5rem (var 4.5rem) och klammern ligger på 4.25rem (var 3.75rem). | Med 12 px text krockade "mån 30 nov" och "mån 14 dec" med klammern (mätt: 62 px text, klammer på 60 px). | 07 |
| Luft | Föreläsningsgrupperna har 24 px mellan sig (var 16 px), som variabeln `--luft-fl`. | Tätt inom en grupp, mer luft mellan grupper (§1: "allt sitter med samma mellanrum"). | 07, 09 |
| Mobil | Kapitelrader utan stapel och känsla är en rad och 44 px. Rader med något ifyllt får sin andra rad. `--rad-h: 3.625rem` på mobil är borttagen. | Raderna i en föreläsning hänger ihop, och luften mellan föreläsningarna syns. Det ifyllda står ut. | 08 |
| Cache | `?v=20261109b` i `index.html`. | CSS:en har ändrats. | – |

Bilderna ligger i `rapporter/bilder/`:
- `07-laget-1280-mork-typ-och-grupper.png`: Läget, desktop, mörkt, före och efter.
- `08-laget-390-mork-raderna.png`: Läget, mobil, mörkt, före och efter.
- `09-laget-1280-ljus-kisa.png`: kisa-testet (suddat), före och efter.

## Förslag som väntar på Jonatan

1. **Ta bort hårstrecken mellan modulerna i Läget.** Modulrubrikerna är feta och har luft runt sig, så linjerna behövs inte för att se var en modul börjar ("ta bort en linje hellre än att lägga till en"). Gör man det inte står sex linjer kvar som delar upp listan i lika stora lådor, och sidan ser mer ut som en tabell. Strecken infördes i beslutet om föreläsningskolumnen (`--hårstreck-modul`), så det är Jonatans beslut.
   Bild: `rapporter/bilder/forslag-1-utan-harstreck-mellan-moduler.png`

2. **Fortsätt på en rad på mobil.** På 390 px bryts "Fortsätt med 13.1 Functions of Several Variables" över två rader, och kapseln blir ett tungt block. Förslaget: kapseln går över hela bredden och titeln klipps med …, som kapiteltitlarna i listan. Gör man det inte är huvudhandlingen 66 px hög på mobil och tar mer plats än tidslinjen. Det klipper text i huvudhandlingen, och därför är det Jonatans beslut.
   Bild: `rapporter/bilder/forslag-2-fortsatt-en-rad-mobil.png`

Inget av förslagen bryter mot designlagen.

## Designvariabler
| Variabel | Före | Efter |
|---|---|---|
| `--storlek-minst` | – | `0.75rem` (12 px) |
| `--fl-kol` | `4.5rem` | `5rem` |
| `--fl-klammer-x` | `3.75rem` | `4.25rem` |
| `--luft-fl` | – (`--steg-3`, 16 px) | `1.5rem` (24 px) |
| `--rad-h` på mobil | `3.625rem` | borttagen (raderna är `auto`, minst 44 px) |
| `:root[data-theme="dark"]` | saknade `--svag-modul`, `--pil`, `--klammer-forbi`, `--klammer-kommer`, `--klammer-idag`, `--kant-kontroll`, `--kant-kontroll-streckad`, `--yta-grupp` | samma värden som Auto-mörkt |

## Test
fl, lu, b, en, tl, fas4 och fas5 slutar med "allt ok" eller "0 fel". fv har ett fel: "20 dec: Efter känsla sorterar". Testet letar efter `.kapitelrad .kapitelnr`, men den klassen heter `.kol-nr` sedan föreläsningskolumnen kom. Felet beror alltså inte på den här genomgången, och testet är inte ändrat.
