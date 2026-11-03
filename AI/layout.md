# Kursverktyget M0068M – layout och navigering

> Beskriver **hur sidan är uppbyggd och navigeras**: vyer, innehåll, ordning och beteende. **Hur** saker ska se ut och bete sig i detalj styrs av `DESIGNLAG.md`, som alltid gäller. Säger de två emot varandra: fråga Jonatan.
>
> Kursdatan (moduler, kapitel, uppgifter, föreläsningar, gamla tentor) finns i `M0068M_planering.md`.
>
> Status: **utkast**. Jonatan putsar i efterhand. Det som är markerat *(öppet)* är inte bestämt.

---

## 0. Grundidén

**Ett verktyg för att hålla koll på en mattekurs: var man är, vilka uppgifter som finns och hur kapitlen känns.**

Sidan är något man *kan* fylla i, inte något som säger åt en vad man ska göra. Den visar vad du har klickat i men värderar det aldrig.

---

## 1. Principer för just den här appen

Utöver `DESIGNLAG.md`:

1. **Verktyget lägger sig inte i.** Ingen takt, ingen "du ligger efter", inga listor över sådant du inte gjort, inga påminnelser. Användaren bestämmer själv vad som räknas som att vara i fas.
2. **Sidan minns var du var, inte vad du borde göra.** "Nu" är det kapitel du senast öppnade, inget annat.
3. **Prioriteringen styr synligheten.**

| Vikt | Vad |
|---|---|
| Viktigt | Vilket kapitel man är på · Vilka uppgifter som finns · Hur man ligger till (det man själv fyllt i) |
| Ganska viktigt | Vilka kapitel som är viktiga |
| Minst viktigt | Facit · Tid kvar till tentan · När föreläsningarna är |

Det minst viktiga får finnas, men det ska vara tyst och aldrig ta plats från det viktiga.

---

## 2. Informationsarkitektur

```
┌────────────────────────────────────────────┐
│  LÄGET        NU                           │   ← huvudnav, alltid synlig
└────────────────────────────────────────────┘

  LÄGET   → startvy. Hela kursen: tidslinje + alla kapitel
  NU      → det kapitel du senast öppnade
  TENTAN  → modul 7. Gamla tentor, fungerar som förra kursens tentasida (utformas senare)

  Inställningar → nås från sidfoten
```

- **Läget** svarar på *"var i kursen är vi och hur känns kapitlen?"*
- **Nu** svarar på *"vad står i kapitlet jag jobbar med?"*
- **Tentan** svarar på *"hur ser tentan ut och hur går det när jag skriver gamla tentor?"*

Tentan är inte en egen flik i huvudnaven. Den är **sista modulen** i kursen och nås som alla andra moduler, från tidslinjen och från listan i Läget.

---

## 3. Byggstenarna

| Sak | Vad det är | Exempel |
|---|---|---|
| **Modul** | Kursens indelning, ungefär en vecka | Modul 1 · Partiella derivator · 2–10 nov |
| **Tentan** | Modul 7, sist i kursen | Tentan · ons 13 jan |
| **Kapitel** | Ett bokavsnitt i Adams & Essex | 13.3 Partiella derivator |
| **Uppgift** | En övningsuppgift i boken, *standard* eller *påbyggnad* | 13.3 uppg. 15 |
| **Föreläsning** | F1–F28 med datum. Kopplad till kapitel | F4 · tors 5 nov |

Det användaren fyller i, per kapitel:

| Fält | Värden |
|---|---|
| Ikryssade uppgifter | Vilka uppgifter som är klickade |
| Känsla | 1 Förstår inte · 2 Osäker · 3 Hänger med · 4 Kan räkna · 5 Kan förklara (eller ingen) |
| Anteckning | Fri text |

Plus en sak sidan själv håller koll på: **senast öppnade kapitel**.

> **Kapitelnumret är nyckeln** (`"13.3"`). All sparad data kopplas till det.
>
> **Modultillhörighet följer föreläsningsplanen.** 16.5 och 16.6 ligger i modul 5, och 17.3 i modul 4, även om övningstabellen säger annat.

---

## 4. Läget (startvy)

```
┌──────────────────────────────────────────────────────────┐
│  LÄGET   Nu                              Torsdag 5 nov    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Flervariabelanalys                                      │
│  Modul 1 av 6 · Partiella derivator · 2–10 nov           │
│                                                          │
│  v45    v46    v47    v48    v49 ...           v2        │
│  [  1  ][  2  ][  3  ]  [4]  [  5  ][   6  /jul/ ][T]    │
│  ||||| ||| |  || ||  | |||  ||| |||  |          |        │  ← föreläsningar, omärkta streck
│     ↑idag                                                │
│                                                          │
│  ┌──────────────────────────────────────┐                │
│  │ Fortsätt med 13.3 Partial Derivatives →│              │  ← huvudhandlingen
│  └──────────────────────────────────────┘                │
│                                                          │
│  (från modul 6: Kursordning · Efter känsla · På tentan)  │
│                                                          │
│  ▾ Modul 1 · Partiella derivator · 2–10 nov              │
│  13.1 Funktioner av flera var.  ██████░ 6/7  [4] Kan räkna →│
│  8.2  Parametriserade kurvor    ███████ 5/5  [3] Hänger med →│
│  13.3 Partiella derivator  senast öppnad  ...            │
│  ...                                                     │
│  Modul 2 · Extremvärdesproblem · 11–18 nov               │
│  ...                                                     │
│  ▸ Modul 3 · Multipelintegraler · 19–27 nov              │
│  ...                                                     │
│  Tentan · ons 13 jan · 3 gamla tentor            Öppna → │
│                                                          │
│  Inställningar · Sparad i webbläsaren 14:32              │
└──────────────────────────────────────────────────────────┘
```

### 4.1 Rubriken
- Kursens namn, och under den modulen som pågår med datum.
- Inga siffror om hur mycket som är gjort.

### 4.2 Tidslinjen
- **Rent visuell.** Den svarar på tre frågor: var på linjen är jag, hur nära är nästa föreläsning, och vilken del av kursen är jag i. Inget i den är klickbart, utom en liten ?-knapp under den.
- **I skala**, från första föreläsningen till slutet av tentadagen. Ingen marginal före eller efter.
- **Inga veckoetiketter, modulnamn eller datum.** Bara modulnummer.
- **Moduler:** ett band per modul (även modul 6), från modulens första till sista föreläsningsdag. Modulen som pågår är något mörkare, men ljusare än idag och Tentan. I för smala band döljs numret.
- **Tentan:** ett svart block, en dag brett, på tentadagen. "Tenta" står ovanför, högerställt.
- **Föreläsningar och helger** på samma tunna rad under banden. Föreläsningar är grå streck. **Nästa föreläsning** (den första som inte har slutat, med klockslag) är svart och något högre.
- **Jul:** diagonal streckning över uppehållet.
- **Idag:** en svart linje genom allt, med "idag" ovanför. Den syns bara under kursen.
- **?-knappen** fäller ut en förklaring på plats, med små exempel ritade som tidslinjen. Esc stänger.
- För skärmläsare är tidslinjen en bild med en beskrivning i klartext (idag, modulen som pågår, nästa föreläsning, tentan).
- Tidslinjen är en karta, inte en värdering. Den visar aldrig hur mycket du har gjort.

### 4.2b Fortsätt
- **Läget har en huvudhandling** direkt under tidslinjen: ett stort grått block, "Fortsätt med 13.3 Partial Derivatives →", som går till det senast öppnade kapitlet. Innan något kapitel öppnats står det "Börja med 13.1 … →".

### 4.3 Kapitellistan
- **Grupperad per modul** i kursordning. Modulrubriken visar nummer, namn och datum.
- **Moduler är hopfällbara**, och bara en är utfälld åt gången. En triangel före namnet visar läget: ▸ hopfälld, ▾ utfälld. Under en hopfälld modul står en ruta per kapitel i känslans färg, men bara om minst ett kapitel i modulen är bedömt.
- **Kapitelraderna** har en pil → längst till höger, så att de syns som vägar in.
- **Tentan** står sist som en egen modulrad: "Tentan · ons 13 jan · 3 gamla tentor · Öppna →".
- **En rad per kapitel**, med kolumnerna:

| Kolumn | Innehåll |
|---|---|
| Kapitel | Nummer i fast bredd + titel. "senast öppnad" på den raden |
| Ikryssade | Tunn stapel + `x/y` (standarduppgifter). Bara det man klickat i |
| Känns | Siffran i en ruta (gråskala 1→5) + nivåns namn. Tom om inget är valt |
| På tentan | "3 av 3" om kapitlet förekommit på gamla tentor, annars tomt |

- **Klick på en rad** öppnar kapitlet i Nu.
- **Sortering** som textflikar ovanför listan, men **först när modul 6 (repetitionen) har börjat**. Innan dess är listan alltid i kursordning:
  - *Kursordning* (standard, med modulgrupper)
  - *Efter känsla* (lägst först, obedömda sist, utan grupper)
  - *Viktigast på tentan* (flest förekomster först, utan grupper)

### 4.4 Sidfoten
En tyst rad: *Inställningar* och sparstatus ("Sparad i webbläsaren 14:32"). Bara det som kräver handling får ta mer plats (se §9).

---

## 5. Nu

Det kapitel du senast öppnade. Samma vy oavsett om du kommer från Läget, från tidslinjen eller via Nästa kapitel.

```
┌──────────────────────────────────────────────────────────┐
│  Läget   NU                              Torsdag 5 nov    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Modul 1 · Föreläsning 4, tors 5 nov 14:45, E231 · s. 714│
│  13.3 Partiella derivator                                │
│                                                          │
│  UPPGIFTER                                               │
│  [2] [3] [4] [7] [13] [15] [17]                          │
│  Påbyggnad  [11] [23]                                    │
│                                                          │
│  HUR KÄNNS KAPITLET?                                     │
│  [1 Förstår inte][2 Osäker][3 Hänger med][4 Kan räkna]   │
│  [5 Kan förklara]                                        │
│  Ta bort bedömning                                       │
│                                                          │
│  ANTECKNING                                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ────────────────────────────────────────────────────    │
│  ← Föregående                       Nästa kapitel →      │
│  13.2 Gränsvärden            13.4 Högre ordningens der.  │
└──────────────────────────────────────────────────────────┘
```

### 5.1 Innehåll uppifrån
1. **Metarad** (tyst), en rad: modul · föreläsning med datum, tid och sal · sidan i boken · *Facit*. Facit syns bara när det finns ett facit att länka till. Raden bryts bara mellan delar.
2. **Kapitlet** som sidans rubrik: nummer och titel.
3. **Uppgifter:** standarduppgifterna som stora knappar som går att klicka i och ur. Påbyggnad på en egen rad, med streckad kant och mindre storlek.
4. **Hur känns kapitlet?** De fem nivåerna med namn. Alltid synliga. *Ta bort bedömning* syns när en nivå är vald.
5. **Anteckning:** ett textfält som sparas medan man skriver. Växer till en gräns och scrollar sedan.
6. **Föregående / Nästa kapitel** i kursordning, med titlar. Nästa är något tydligare.

### 5.2 Regler
- Att öppna ett kapitel, oavsett hur, gör det till "senast öppnat".
- **Första besöket**, innan något kapitel öppnats: Nu visar kursens första kapitel (13.1).
- Kapitel som saknar standarduppgifter (15.3) visar bara påbyggnadsraden, plus texten "Bara påbyggnadsuppgifter".
- Uppgifter med ∗ i studiehandledningen visas med ∗ efter numret *(öppet: vad ∗ betyder)*.
- Inget i Nu reagerar på vad du klickat i. Inga frågor dyker upp, och inget ändras när allt är ikryssat.

---

## 6. Tentan (modul 7)

> **Platshållare.** Layouten tas fram senare. Det här är vad som redan är bestämt.

- Tentan är **kursens sista modul**: sist i tidslinjen och sist i kapitellistan, klickbar som de andra.
- Den öppnar en egen vy, **Tentan**, som fungerar ungefär som förra kursens tentasida (M0067M):
  - **Gamla tentor** med alla uppgifter (3 st, 6 uppgifter à 5 p).
  - **Uppgiftsvy** med lösningen dold tills man klickar (illusion av kompetens).
  - **Status per uppgift:** gjord med hjälp · gjord själv · sitter.
  - **Tentaläge:** helskärm, timer, lämna in → genomgång.
  - **Vad som brukar komma:** typ av uppgift kopplad till kapitel. Det är samma underlag som kolumnen "På tentan" och sorteringen "Viktigast på tentan" i Läget.
  - **Tentans form:** 30 p, betygsgränser 14/20/25, bonus 0–2 p från quizzarna.
- Underlaget finns i `M0068M_planering.md` §11. Uppgiftstexter och lösningar behöver transkriberas, som i förra kursens kunskapsbas.

*(Öppet: ska vanliga moduler också få en egen vy när man klickar på dem, för att det ska vara konsekvent med Tentan? Idag fäller de bara ut sina kapitel i Läget.)*

---

## 7. Navigering

1. **Huvudnaven** är *Läget · Nu*. Den syns alltid, utom i Tentans tentaläge.
2. **URL:en speglar läget:**
   - `#/` → Läget
   - `#/kapitel/13.3` → Nu med det kapitlet
   - `#/nu` → senast öppnade kapitlet
   - `#/tentan` → Tentan
3. **Tillbaka** går dit man kom ifrån. Webbläsarens bakåtknapp fungerar.
4. **Högst två klick** från Läget till vilket kapitel som helst.
5. **Tangentbord** (genvägar, aldrig enda vägen):
   - `←` `→` föregående och nästa kapitel i Nu
   - `1`–`5` känsla
   - `Esc` stänger det som är utfällt

---

## 8. Mobil

- **Nu** ska fungera fullt ut på mobil. Klickytor minst 44 px. Känslan blir en kompakt rad 1–5 med nivåns namn under.
- **Läget** ska fungera på mobil men får vara enklare. Varje kapitelrad blir två rader: kapitlet överst, sedan stapel, känsla och tenta. Tidslinjen visar banden med nummer, utan namn.
- Ingen sidledsscroll på 320 px.

---

## 9. Data och sparande

Samma modell som förra kursens tentasida:

- **localStorage** alltid. All läsning och skrivning ligger i `try/catch`.
- **Kopia på disken** (valfritt, Edge/Chrome): en JSON-fil man väljer en gång, som skrivs vid varje ändring.
- **Ladda ner / Läs in** under Inställningar, för backup och flytt mellan datorer.
- **Ingen synk** mellan enheter. Mobil och dator har var sin data.
- **Sparstatus** syns tyst i sidfoten. Om sparandet misslyckas blir raden en beständig varning tills det är löst.
- Rensa all data går att ångra i 15 sekunder.

---

## 10. Kanttillstånd

| Tillstånd | Vad som visas |
|---|---|
| Före kursstart | Läget som vanligt. Ingen idag-linje i tidslinjen. Rubriken säger "Kursen börjar …" |
| Inget kapitel öppnat än | Nu visar 13.1 |
| Jul (inga föreläsningar) | Inget särskilt. Idag-linjen ligger i den streckade julen, och nästa föreläsning är den efter jul |
| Tentadagen | Idag-linjen ligger på tentablocket. Ingen föreläsning är "nästa" |
| Efter tentan | Läget som vanligt. Ingen idag-linje. Rubriken säger "Tentan har varit" |
| Kapitel utan standarduppgifter | Bara påbyggnad, med en förklarande rad |
| Inget bedömt | Känns-kolumnen är tom, inte noll |
| Sparandet misslyckas | Beständig varningsrad i sidfoten |

---

## 11. Medvetet inte med

- ❌ Takt, "i fas", "efter schemat", eller procent klart totalt
- ❌ Listor över sådant du inte gjort ("att ta igen")
- ❌ Frågor eller meddelanden som dyker upp av vad du klickat i
- ❌ Påminnelser och notiser
- ❌ Synk mellan enheter (för nu)
- ❌ Numrerade föreläsningar eller schema i tidslinjen
- ❌ Det som `DESIGNLAG.md` §8 förbjuder

---

## 12. Öppna frågor

- Vad betyder ∗ efter vissa uppgiftsnummer i studiehandledningen?
- Ska påbyggnadsuppgifter räknas med i stapeln "Ikryssade"? (Utkastet: nej.)
- Ska vanliga moduler få en egen vy när man klickar på dem (se §6)?
- Hur ska Tentans vy se ut? Utformas när kursen närmar sig modul 6.
- Bonusquizzar och räkneövningar har inga datum i underlaget. Ska de synas alls?

---

## 13. Byggordning (förslag)

Så att sidan går att använda tidigt:

1. **Data:** byggskript som läser `M0068M_planering.md` och skriver en JS-fil, med validering.
2. **Nu:** kapitelvyn med uppgifter, känsla och anteckning, plus sparande.
3. **Läget:** kapitellistan med sorteringar.
4. **Tidslinjen** i Läget.
5. **Inställningar:** kopia på disken, ladda ner och läs in, tema.
6. **Mobil** och kanttillstånd.
7. **Tentan** (egen spec senare).
