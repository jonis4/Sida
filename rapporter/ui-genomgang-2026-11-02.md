# UI-genomgång 2026-11-02

## Sammanfattning
Sidan var redan i gott skick. Det som syntes mest var tre saker i Läget. Hopfällda moduler hade ett tomt band under färgrutorna, ungefär dubbelt så högt som luften ovanför rubriken. Kapitelnumren låg 8 px innanför modulrubrikernas vänsterkant. Och på mobil hamnade känslorutan och "1 av 3 tentor" på olika ställen från rad till rad. Alla tre är rättade. Dessutom: Inställningar har fått samma textstorlek i hela högerspalten, temavalet står i kanten, den tertiära gråtonen klarar 4,5:1 även på ytan bakom "senast öppnad", och långa kapitelrubriker bryts jämnare. Bara `sida/style.css` och `?v=` i `sida/index.html` är ändrade. Ingen text, funktion eller data är rörd.

## Ändrat
| Område | Vad | Varför (regel) | Före / efter |
|---|---|---|---|
| Avstånd | Modulerna i Läget är nu en jämn lista: rubriken har `--steg-3` luft över och under, och bara en utfälld modul får `--steg-4` under sig. Det tomma bandet under färgrutorna är borta (`.modul`, `.modulrubrik`, `.modul-rutor`). | Checklistan: inget tomt utrymme utan betydelse, närhet; §4 Yta | bilder/01-…-fore.png / bilder/01-…-efter.png |
| Linjering | Kapitellistan har negativ marginal lika stor som radens inre luft. Kapitelnumren står nu i linje med "Modul 1", "KAPITLEN" och rubriken, och den grå ytan för "senast öppnad" sticker ut lite på var sida i stället för att flytta texten. | Checklistan: gemensam vänsterkant, markeringsytor flyttar inte texten | bilder/01 |
| Linjering, mobil | Känns och På tentan har fasta spalter (7,25rem och 5,25rem) på smal skärm, så att rutorna och tentatexten står rakt under varandra. "9 uppgifter" bryts aldrig. | Checklistan: kolumner står rakt under varandra; `layout.md` §8 | bilder/02, bilder/03 |
| Linjering | Temavalet (Auto · Ljust · Mörkt) får sin 44 px-klickyta med padding och negativ marginal. Texten står i kanten i stället för att centreras i en 44 px-ruta (Auto låg 6 px in på mobil). | Checklistan: inget ligger 1–3 px fel; L4 klickytor | bilder/05 |
| Avstånd | Inställningar: rubrik till innehåll och grupp till grupp är `--steg-5`, som i Nu (förut `--steg-4` efter rubriken). | L9, samma relation ger samma avstånd | bilder/04 |
| Typografi | Högerspalten i Inställningar har `--storlek-liten` överallt. Förut stod "Välj fil…" och "Ladda ner" i 17 px och temavalet i 15 px, alltså två storlekar för samma roll. | L9, checklistan: samma roll, samma storlek | bilder/04, bilder/05 |
| Typografi | `text-wrap: balance` på `h1` och `h2`, så att långa kapitelrubriker inte lämnar ett ensamt ord (13.6 på 320 px). Provade också på modulrubrikerna, men där bröts "Modul 2 ·" ensamt, så det är bortbackat. | Checklistan: rubriker har `text-wrap: balance` | bilder/06 |
| Färg | `--tertiar` i ljust läge #707070 → #6c6c6c. Förut 4,46:1 mot `--yta` (t.ex. "7 uppgifter" på raden "senast öppnad"), nu 4,73:1. Mot vit bakgrund 5,25:1. | L12, 4,5:1 för text | – (syns knappt) |
| Färg | Tentan-platshållarens "Vyn tas fram senare." är tyst (klassen `platshallare` fanns redan men hade ingen stil). | L6, inga platshållare som ser klara ut | – |
| Enhet | Färgrutorna i hopfällda moduler i rem (0,625rem och 0,1875rem) i stället för px. | L12: allt i rem | – |

## Förslag som kräver Jonatans beslut
1. **De fem kända brotten i beslutsloggen** (huvudnaven utan versaler, bredden 50rem, temavalet som textflikar, siffror utan namn i känsloraden på mobil, färgrutor utan siffra i hopfällda moduler). Ingenting är ändrat. Min bedömning:
   - *Bredden 50rem:* det märks mest i Nu, där anteckningsfältet och sammanfattningen i Inställningar blir cirka 95 tecken breda (högst cirka 75 enligt checklistan). Förslag: behåll 50rem för Läget men ge `.nu` och `.installningar` `max-width: 44rem`. Gör man inget blir långa anteckningar tyngre att läsa på stor skärm.
   - *Färgrutor utan siffra:* i mörkt läge har grön (5) bara 2,9:1 och grå (obedömd) 1,3:1 mot bakgrunden, så rutorna är svåra att skilja åt för den som ser dåligt. Förslag: en siffra i rutan (kräver större rutor, cirka 1rem) eller att rutorna tas bort och ersätts av "3 av 7 bedömda". Gör man inget fortsätter rutorna att bära information med bara färg (L12).
   - *Temavalet:* ett segmenterat val som känsloraden (spår + platta) vore i linje med §4. Det är billigt att byta, men det är ett utseendebeslut.
2. **Tidslinjens text är 11 px** (`0.6875rem`: "idag", "Tenta", modulnumren). Checklistan säger att ingen text får vara under 12 px. Måtten är godkända i `tidslinje-instruktion.md`, så de är inte ändrade. Förslag: 0,75rem. Gör man inget är etiketterna svårlästa på mobil.
3. **Modulrubriker på 320 px** bryts som "Modul 2 · / Extremvärdesproblem". Det är inte fel, men ett alternativ är att låta "Modul 2" stå på en egen tyst rad på smal skärm. Det kräver en ändring i strukturen och är inget jag gjort.
4. **`--utfallning` (140 ms) används inte**, eftersom sidan inte har några animationer. Variabeln är kvar som dokumentation av regeln i §4. Den kan tas bort om du vill ha `:root` helt utan döda värden.
5. **Tentan-raden på 320 px** bryter efter "repetition från 17 dec ·", så att en punkt hamnar sist på raden. Det går att lösa genom att lägga avgränsaren inne i nästa `hel`-span (en liten ändring i `laget.js`, bara markup). Jag har inte gjort det, eftersom det rör vyns textbygge.

## Designvariabler
| Variabel | Före | Efter |
|---|---|---|
| `--tertiar` (ljust) | `#707070` | `#6c6c6c` |

Inga andra variabler är ändrade. Avståndsskalan `--steg-1` … `--steg-5` räckte till allt.

## Kontrollerat
- **Vyer:** Läget (kursordning och Efter känsla), Nu (13.2 vanligt med anteckning och påbyggnad ikryssad, 13.6 längsta titeln, 15.3 utan standarduppgifter), Inställningar och Tentan.
- **Bredder:** 1280, 768, 390 och 320 px. **Teman:** ljust och mörkt. **Data:** tom och ifylld (via `Lagring`). **Datum:** 2026-11-05 och 2026-12-24. Sammanlagt 76 bilder före och 76 efter.
- Ingen sidledsscroll och inga konsolfel i någon kombination.
- Regressionstester: fas3 (35 ok, 0 fel), fas4 (36 ok, 0 fel), fas5 (37 ok, 0 fel), tl, en och b (allt ok). Inga tester är ändrade.

**Kontrast (WCAG), efter ändringen:**

| Par | Ljust | Mörkt |
|---|---|---|
| Primär `--text` / `--bg` | 17,4 | 14,8 |
| Sekundär `--tyst` / `--bg` | 6,4 | 7,4 |
| Sekundär `--tyst` / `--kontroll` (känsloraden) | 5,2 | 5,7 |
| Tertiär `--tertiar` / `--bg` | 5,3 | 5,6 |
| Tertiär `--tertiar` / `--yta` | 4,7 (förut 4,46) | 4,9 |
| Modulnummer `--band-text` / `--band` | 4,7 | 5,4 |
| Ikryssad uppgift (`--bg` på `--tyst`) | 6,4 | 7,4 |
| Fel `--fel` / `--bg` | 6,5 | 7,9 |
| Vit text på känsla 1–5 | 5,1–8,6 | 4,8–6,3 |
| Uppgiftsknappens kant `--tertiar` / `--bg` | 5,3 | 5,6 |
| Obedömd ruta `--svag` / `--bg` (grafik) | 1,3 | 1,3 (se förslag 1) |
