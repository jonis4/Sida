# Designlag

> Regler för hur gränssnittet i Jonatans studieverktyg utformas. Dokumentet är skrivet för att en AI ska kunna följa det utan att gissa.
>
> **Läs hela innan du designar eller bygger något.** Det här är facit för *hur* saker ska se ut och bete sig. Projektets egen spec bestämmer *vad* som ska byggas. Om de säger emot varandra: fråga Jonatan.

---

## 0. Så här används lagboken

1. **Grundsatsen (§1) väger tyngst.** Om två regler krockar vinner den som bäst tjänar grundsatsen.
2. **Reglerna är skrivna för att kunna prövas.** "Ser det rent ut?" är inte en prövning. "Har vyn exakt en huvudhandling?" är det.
3. **Avsteg är tillåtna men aldrig tysta.** Ett avsteg kräver tre saker: en motivering mot grundsatsen, Jonatans OK och en rad i projektets beslutslogg (se §10).
4. **Prejudikat** (markerade *Prejudikat:*) är verkliga beslut från tidigare projekt. De visar hur en regel har tolkats. Följ dem om inget talar emot.
5. **Om du är osäker: fråga.** En fråga för mycket kostar en minut. En timme åt fel håll kostar en timme.

---

## 1. Grundsatsen

> **Simplicitet i syfte av funktion. Verktyget ska fylla sin funktion utan friktion.**

Inspirationen är Dieter Rams och Apple, men som *tankesätt* och inte som stil. Målet är inte att det ska se minimalistiskt ut. Målet är att ingenting ska stå i vägen mellan användaren och det hen ska göra.

Det finns två sätt att misslyckas, och de är lika allvarliga:

| För mycket | För lite |
|---|---|
| Dekoration, ramar, ikoner som inte betyder något | Funktioner gömda så att man måste leta |
| Information som syns hela tiden fast den behövs sällan | Ikoner utan text som man måste gissa vad de gör |
| Flera knappar som ropar lika högt | Extra klick för något man gör varje dag |
| Motivationsgimmickar (streaks, badges) | Interaktioner som bara finns som dolda gester |

**Nerskalning är ett medel, inte ett mål.** Om en förenkling gör verktyget svårare att använda är den fel, hur ren den än ser ut.

---

## 2. Prövningen: varje element ska försvara sin plats

Ställ de här frågorna om varje knapp, rad, text och färg innan den läggs till. Kan du inte svara konkret åker elementet ut, eller så frågar du Jonatan.

1. **Vilken fråga besvarar den, eller vilken handling möjliggör den?**
2. **Vad händer om den tas bort?** Om svaret är "inget" ska den bort.
3. **Hur ofta används den?** Placering och synlighet ska följa svaret (§3, L5).
4. **Förstår man den utan förklaring?** Om den behöver en förklaring är den inte tydlig nog.
5. **Sparar den ett steg eller kostar den ett?**

---

## 3. Lagarna

### L1. Varje vy svarar på en fråga
- Startvyn svarar på **"Vad ska jag göra nu?"** direkt när den öppnas, utan scroll och utan klick.
- Varje huvudvy har sin egen fråga, och vyerna överlappar inte varandra.
- Kan du inte formulera vyns fråga i en mening ska vyn inte finnas.

*Prejudikat:* Tentasidan hade Idag (handling), Kapitel (läget), Bank (materialet) och Tentan (hur står jag till på varje plats i tentan). Strategin blev inte en egen vy utan visas där den behövs.

### L2. Exakt en huvudhandling per vy
- Det stora, tydliga knappelementet används **bara** för vyns huvudhandling, och det finns högst ett sådant per vy.
- Övriga handlingar är textknappar eller länkar ("Starta →").
- Om två handlingar känns lika viktiga är vyn inte färdigtänkt.

*Prejudikat:* I Idag får bara nästa ogjorda pass den stora "Starta"-knappen. Repetera får den bara när dagens pass är klara.

### L3. Friktion bara där den skyddar användaren
Friktion är förbjuden, med två undantag:

1. **Mot självbedrägeri.** Där verktyget annars skulle hjälpa användaren att lura sig själv. Lösningar är dolda tills man aktivt klickar. Status skiljer "gjord med hjälp" från "gjord själv".
2. **Mot oåterkallelig förlust.** Radering av all data, att lämna ett pågående tentaläge.

All annan friktion ska bort: bekräftelser på saker som går att ångra, extra steg, laddningslägen och val som verktyget själv kan göra.

### L4. Det enkla får inte bli svårt
- **Det som används dagligen syns utan att man letar.** Det som används några gånger per termin får ligga ett klick bort.
- **Dolda interaktioner får bara vara genvägar, aldrig enda vägen.** Tangentbordsgenvägar, "klicka igen för att avmarkera" och svep är tillåtna, men samma sak måste också gå att göra med en synlig kontroll.
- **Inget som bara syns vid hover.** Pekskärmar har ingen hover.
- **Etiketter syns alltid.** Ett fält eller val utan synlig text räknas som ett gömt fält.
- **Klickytor är minst 44 × 44 px på pekskärm.**

*Prejudikat:* I trackern ersattes "klicka igen för att ta bort bedömningen" med en synlig knapp, "Ta bort bedömning", eftersom det förra inte gick att upptäcka och inte fungerade med tangentbord.

### L5. Placering följer användningsfrekvens
- Daglig användning: i vyn, synligt.
- Veckovis: ett klick bort, i sammanhanget där det behövs.
- Några gånger per termin (export, import, tema, nollställning): i Inställningar eller i sidfoten.
- Sidfoten är en enda tyst rad. Där syns bara sådant som **kräver handling just nu**, till exempel ett sparfel.

### L6. Ärlighet
- **Siffror och staplar visar verkligheten**, inte vad som känns uppmuntrande. Att ha läst något är inte samma sak som att kunna det.
- **Verktyget bevisar att det har sparat.** En passiv statusrad ("Sparad 14:32") nära innehållet. Att bara påstå det i en README räknas inte.
- **Fel syns tills de är lösta.** Ett sparfel är en beständig rad i varningsfärg, inte en `console.error`.
- **Verktyget låtsas inte vara mer än det är.** Inga skenbara funktioner, inga platshållare som ser klara ut.

### L7. Innehållet går före gränssnittet
- Innehållet (matten, uppgifterna, statusen) är det som ska synas. Krom (ramar, paneler, dekor) är en kostnad.
- **Formler är det viktigaste på sidan och ska se bäst ut av allt.** Rendera dem ordentligt (KaTeX) och låt breda formler gå bredare än textspalten.
- Lösningar och detaljer läggs in i DOM:en först när de visas.

### L8. Progressive disclosure
- Visa det som behövs nu. Gör resten nåbart med ett klick, men visa det inte hela tiden.
- Hopfällt (`<details>`) är standardverktyget: klara pass, kommande pass, metodmallar, strategitips.
- Det som fälls ut ska öppnas **under raden det hör till**, så att det syns var det kom ifrån. Det ska inte öppnas som en svävande modal.

### L9. Konsekvens
- **Samma sak ser likadan ut och beter sig likadant överallt.** En uppgift är samma objekt oavsett om den visas under Idag, Kapitel eller Bank, och har samma vy, status och knappar.
- Samma ord för samma sak. Har något fått ett namn byter det inte namn i en annan vy.
- **Nästa och Tillbaka håller sig i sitt sammanhang.** Nästa går till nästa i *den lista man kom från*. Tillbaka går dit man kom ifrån, inte till en fast plats.

### L10. Feedback utan avbrott
- Statusinformation visas **passivt**: tyst, nära det den beskriver, synlig när man letar efter den.
- Lyckade handlingar bekräftas genom att resultatet syns direkt (rutan byter status), inte med ett meddelande.
- **Bara misslyckanden får ta plats i blickfånget.**
- **Ångra är bättre än att fråga i förväg.** En destruktiv handling som går att ångra (15 sekunder via statusraden) behöver bara en bekräftelse på plats, inte en dialog.

### L11. Kanttillstånd är lika designade som normalfallet
Varje tillstånd har ett medvetet utseende och ingen tom yta. Minst de här ska vara designade:

| Tillstånd | Krav |
|---|---|
| Tomt (inget gjort än) | En rad som säger hur man kommer igång |
| Allt klart | Säg det ("Alla avsnitt bedömda"), visa inte en tom lista |
| Före start / efter slut | "Schemat börjar måndag 9 nov" / "Tentan har varit", inga negativa dagar |
| Dag utan innehåll | Säg vad dagen är ("Ledigt", "Självstudier") |
| Saknad data (t.ex. lösning saknas) | Säg det tydligt, men dölj inte resten |
| Lagring blockerad eller full | Beständig varningsrad med vad som hänt och vad man kan göra |
| Mycket lång text | Växer till en gräns och scrollar sedan; layouten får inte spricka |

### L12. Tillgänglighet är inte en extrafunktion
- **Färg bär aldrig information ensam.** Status har alltid också form, siffra eller text.
- Kontrasten klarar minst WCAG AA (4,5:1 för text) i både ljust och mörkt läge.
- Allt går att nå med tangentbord, och fokus syns alltid.
- Rätt semantik gratis: riktiga radioknappar i en `fieldset` med `legend`, `role="status"` för statusraden.
- Varje kompakt element (ruta, markering, ikon) har ett tillgängligt namn i klartext.
- Allt dimensioneras i `rem`, så att webbläsarens textstorlek skalar hela gränssnittet.

---

## 4. Visuella regler

### Typografi
- **Ett typsnitt:** systemfont-stacken.
- **Två vikter:** 400 och 600. Inget tunnare än 400.
- **Tre textroller**, och hierarki byggs med dem i stället för med ramar och färg:

| Roll | Används till |
|---|---|
| Primär | Innehåll, rubriker, nyckeltal |
| Sekundär (tyst) | Etiketter, metadata, beskrivningar |
| Tertiär | Statusrad, datum, legend |

- Små versala etiketter med spärrning för sektionsrubriker och huvudnav.
- Siffror som ska jämföras använder `font-variant-numeric: tabular-nums`.
- Textspalten är högst cirka 44rem bred.

### Färg
- **Gråskala är basen.**
- **Färg betyder alltid något, aldrig dekoration.** Används färg för dekoration slutar den betyda något.
- Färgroller namnges efter funktion (`--text`, `--tyst`, `--yta`, `--svag`), inte efter utseende (`--grey-500`).
- Tillåtna betydelser för färg:
  1. Status (säkerhetsnivå, "sitter").
  2. Destruktiv handling eller fel (rött), bara på själva bekräftelseknappen och på fel som kräver handling.
  3. Valt läge och fokus.
- Ljust och mörkt läge följer systemet, och man kan välja manuellt. Temat sätts i `<head>` innan sidan ritas, så att den inte blinkar.

### Yta och gruppering
- **Vitt utrymme är struktur.** Gruppera med avstånd innan du tar till en linje, och med en linje innan du tar till en ram.
- **Inga kortramar, inga skuggor, inget glas.** En egen bakgrundsyta får bara det som är *status*, till exempel "nu"-passet eller den pågående veckan.
- Hårstreck (1px, `--svag`) bara där en gräns behöver markeras som inte är innehåll.

### Ikoner och symboler
- **Inga ikoner utan text**, förutom de helt självklara: ← → och bokmärke.
- Statusmarkeringar ritas i CSS: ○ ej gjord, ◐ med hjälp, ● själv, ● sitter (i statusfärg). Ordet finns alltid i `title` och som dold text för skärmläsare.

### Kontroller
- **Huvudhandling:** ett stort grått block. Bara ett per vy (L2).
- **Sekundära handlingar:** textknappar och länkar med pil ("Starta →").
- **Val mellan några få alternativ:** segmenterade val i iPhone-stil (grått spår, valt alternativ som en upphöjd platta).
- **Inställningar:** rader med namn och kort förklaring till vänster och kontrollen till höger.
- **Filter:** textflikar överst, inga rullgardinsmenyer.
- **Bekräftelseknappar säger vad de gör:** "Radera all data", "Ersätt all data". Aldrig "OK".

### Rörelse
- Rörelse finns bara för att **förklara var något kommer ifrån**, till exempel en panel som fälls ut under sin rad (kort, cirka 140 ms).
- **Ingen rörelse på frekventa interaktioner.** Kryssrutor, statusval och siffror byter värde direkt.
- `prefers-reduced-motion: reduce` stänger av all rörelse.

### Mobil
- Det som används på språng (startvyn, avbockning, repetition) ska fungera fullt ut på mobil.
- Tunga arbetsvyer (fokusläge, materialbank) får vara datorfokuserade men får inte gå sönder på mobil.
- Ingen sidledsscroll på 320 px.

---

## 5. Navigering och interaktion

1. **Huvudnaven syns alltid** och står alltid i samma ordning, utom i fokuslägen.
2. **Fokuslägen** (t.ex. tentaläge) tar över hela skärmen: ingen nav och inget som distraherar. Att lämna dem kräver en bekräftelse på plats.
3. **Högst två klick** från startvyn till det man vill göra. Fler klick kräver en motivering.
4. **URL:en speglar var man är** (`#/kapitel/1.4`), så att bakåtknappen och bokmärken fungerar.
5. **Inga hamburgermenyer och inga sidomenyer.** Några få ord i en rad räcker.
6. **Tangentbordsgenvägar** för det som görs ofta (← → mellan uppgifter, siffror för status, en bokstav för att visa lösningen). De är alltid genvägar, aldrig enda vägen (L4).
7. **Esc** stänger det som är öppet och lämnar tillbaka fokus dit man kom ifrån.
8. **En ändring ritar bara om det som ändrats**, så att fokus och scrolläge överlever.

---

## 6. Språk och text

- Svenska, kort och vardagligt.
- **Knappar är verb som säger vad som händer:** "Starta", "Visa lösningsförslag", "Spara kopia…".
- Tre punkter (…) betyder att ett klick leder till ett val till (filväljare, dialog).
- Säg vad något *är*, förklara inte gränssnittet. Behöver en kontroll en förklaring är det kontrollen som ska ändras.
- Inga utropstecken, inget peppande, inga emojis.
- Felmeddelanden säger vad som hänt och vad man kan göra: "Filen hittades inte – koppla om den."
- Siffror skrivs som siffror ("3 dagar kvar"), med rätt singular och plural ("1 uppgift").

---

## 7. Data och förtroende

- **Allt sparas automatiskt.** Det finns ingen spara-knapp för det vanliga flödet.
- All läsning och skrivning till lagring ligger i `try/catch`, och verktyget fungerar även om lagringen är blockerad (men säger det, L6).
- **Användarens data går alltid att ta med sig:** export och import som JSON i ett läsbart format, med kontroll av filen innan den ersätter något.
- Flera flikar får inte skriva över varandra. Läs in senaste data innan du skriver.
- Datan är versionerad, och äldre format migreras vid inläsning.

---

## 8. Förbjudet, och varför

| Förbjudet | Varför |
|---|---|
| Poäng, streaks, badges | Motiverar till fel sak: att hålla serien vid liv i stället för att lära sig |
| Stor nedräkningsklocka | Skapar stress utan att hjälpa. "7 dagar kvar" räcker |
| "Procent klart totalt" som huvudsiffra | Säger inget om var man är svag. Visa läget per del i stället |
| Synliga lösningar i listor | Lockar till att läsa i stället för att räkna (illusion av kompetens) |
| `alert()`, `confirm()`, `prompt()` | Modala, går inte att formge, knapparna säger "OK" |
| Modaler för vanliga flöden | Bryter sammanhanget. Fäll ut på plats i stället (L8) |
| Hamburgermeny, sidomeny | Gömmer navigeringen (L4) |
| Ikoner utan text | Man måste gissa (L4) |
| Kortramar, skuggor, glaseffekter | Krom som konkurrerar med innehållet (L7) |
| Dekorativ färg | Färgen slutar betyda något |
| Dekorativa animationer | Stör och fördröjer |
| Tooltips som enda förklaring | Kräver hover och syns inte på pekskärm |
| Onboarding-turer i flera steg | En kort hjälpruta första gången räcker, och den går att öppna igen |
| Kalendervy när en lista räcker | En lista är snabbare att läsa. Kalender bara om tidsavstånd över veckor verkligen måste synas |
| Tomma ytor utan text | Varje tillstånd ska vara designat (L11) |

---

## 9. Checklista innan något visas för Jonatan

- [ ] Varje vy har en fråga den besvarar (L1) och högst en huvudhandling (L2).
- [ ] Varje nytt element klarar prövningen i §2.
- [ ] Inget dagligt behov kräver att man letar (L4), och inget sällsynt tar plats (L5).
- [ ] Ingen friktion finns utom den som skyddar (L3).
- [ ] Alla kanttillstånd i L11 är designade och kontrollerade.
- [ ] Färg bär aldrig information ensam, och kontrasten håller AA i ljust och mörkt läge.
- [ ] Allt går att göra med tangentbord, och fokus syns.
- [ ] Det fungerar på 320 px bredd utan sidledsscroll.
- [ ] Inga konsolfel, och all matte renderar.
- [ ] Inget från §8 har smugit sig in.
- [ ] Det är verifierat genom att sidan öppnats och klickats igenom. "Det kompilerar" räcker inte.

---

## 10. Avsteg

Ett avsteg från lagboken är okej om det gör verktyget bättre på sin funktion. Gör så här:

1. Formulera avsteget och motivera det mot grundsatsen (§1).
2. Fråga Jonatan innan du bygger det.
3. Skriv det i projektets beslutslogg: vad, varför och datum.
4. Om samma avsteg dyker upp i flera projekt ska lagboken ändras, inte projektet.

*Prejudikat:* Tentasidan skulle ha tre vyer, men fick en fjärde flik, *Tentan*, eftersom den besvarade en egen fråga ("hur står jag till på varje plats i tentan?") som ingen annan vy svarade på. Avsteget var godkänt och loggat.

---

## Ursprung

Det här byggde från början på Dieter Rams tio teser (särskilt *begriplig*, *diskret*, *ärlig*, *genomförd in i minsta detalj* och *så lite design som möjligt*) och på Apples Human Interface Guidelines (*clarity*, *deference*, *depth*, feedback, ångra, tillgänglighet). Det har sedan utvecklats till en egen, mer funktionell hållning genom två egna projekt: en kurstracker och en tentapluggsida för M0067M.

Medvetet bortvalt från förebilderna: Liquid Glass och materiallager, skuggor och z-lager som utseende, haptik och ljud, samt iOS-specifika mekanismer som Dynamic Type (webbmotsvarigheten är `rem` och flytande layout).
