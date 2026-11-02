# Kursverktyget M0068M – struktur och data

> Beskriver **hur sidan är byggd under ytan**: var datan ligger, hur den kontrolleras, hur det du fyller i sparas och hur koden är uppdelad. Layouten står i `layout.md` och designreglerna i `DESIGNLAG.md`.
>
> Status: **utkast**.

---

## 0. Grundidén

Det finns ingen server, ingen databas och ingen inloggning. Datan ligger lokalt i webbläsaren (se `layout.md` §9). "Backend" är här tre saker:

1. **Kursdatan:** en fil som beskriver kursen.
2. **Byggskriptet:** kontrollerar kursdatan och gör den läsbar för sidan.
3. **Lagringsmodulen:** sparar det du fyller i.

Målet är att kursen, layouten och din sparade data ska gå att ändra **var för sig**, utan att något annat går sönder.

---

## 1. Tre lager som aldrig blandas

| Lager | Vad | Vem ändrar | Hur ofta |
|---|---|---|---|
| **Kursdata** | Moduler, kapitel, uppgifter, föreläsningar, tentor | **Bara Jonatan**, för hand i `kurs.json` | När kursen ändras |
| **Användardata** | Ikryssade, känsla, anteckning, senast öppnat | Sidan, i webbläsaren | Hela tiden |
| **Gränssnitt** | Vyer, CSS, navigering | Jonatan eller Claude | När layouten putsas |

**Huvudregeln:** en ändring i ett lager får aldrig kräva en ändring i ett annat.

- Ett datum ändras → bara `kurs.json` ändras.
- Layouten ändras → bara vyer och CSS ändras.
- Sparad data rörs aldrig av någon av dem.

Sidan har ingen funktion för att redigera kursdatan. Den läser den bara.

---

## 2. Mappstruktur

```
projekt/
├── AI/                     ← underlag (ändras inte av bygget)
│   ├── CLAUDE.md
│   ├── DESIGNLAG.md
│   ├── layout.md
│   ├── backend.md          ← den här filen
│   └── M0068M_planering.md
│
├── kurs.json               ← KURSDATAN. Det enda som redigeras när kursen ändras
├── build.py                ← validerar kurs.json och skriver sida/data/kurs.js
│
└── sida/
    ├── index.html
    ├── style.css           ← alla färger, avstånd och typsnitt som variabler överst
    ├── data/
    │   └── kurs.js         ← GENERERAD. Redigeras aldrig för hand
    ├── js/
    │   ├── lagring.js      ← localStorage, kopia på disken, export/import, migrering
    │   ├── kurs.js         ← härledningar ur kursdatan (se §4)
    │   ├── router.js       ← hash-adresser → vy
    │   ├── delar.js        ← återkommande delar: uppgiftsknappar, känsloval
    │   └── vyer/
    │       ├── laget.js
    │       ├── nu.js
    │       └── tentan.js
    └── vendor/
        └── katex/          ← lokal kopia, låst version
```

---

## 3. Kursdatan: `kurs.json`

En handredigerad fil som är facit för kursen. Den skrivs för hand. `M0068M_planering.md` var underlaget när den togs fram, men det är `kurs.json` som underhålls.

### 3.1 Form

```json
{
  "version": 1,
  "kurs": {
    "kod": "M0068M",
    "namn": "Flervariabelanalys",
    "tenta": "2027-01-13"
  },
  "moduler": [
    { "id": "m1", "namn": "Partiella derivator" },
    { "id": "m2", "namn": "Extremvärdesproblem" },
    { "id": "tentan", "namn": "Tentan", "typ": "tenta" }
  ],
  "forelasningar": [
    { "nr": 4, "datum": "2026-11-05", "start": "14:45", "slut": "16:15", "sal": "E231", "kapitel": ["13.3"] }
  ],
  "kapitel": [
    {
      "id": "13.3",
      "titel": "Partiella derivator",
      "modul": "m1",
      "sida": 714,
      "standard": ["2", "3", "4", "7", "13", "15", "17"],
      "pabyggnad": ["11", "23"]
    }
  ],
  "tentor": []
}
```

`tentor` fylls i när Tentan utformas (`layout.md` §6).

### 3.2 Regler för kursdatan

1. **Varje fakta finns på ett ställe.**
   - Modulernas datum lagras inte. De räknas fram från första och sista föreläsningen i modulen.
   - Veckonummer lagras inte. De räknas fram från datum.
   - Flyttas en föreläsning ändras ett datum, och tidslinjen, moduldatumen och "pågår" följer med av sig själva.
2. **Besluten ligger i datan, inte i koden.** Att 17.3 hör till modul 4 står som `"modul": "m4"` i kapitlet. Det finns inga specialregler för enskilda kapitel i JavaScript.
3. **Ordningen är listans ordning.** Kursordning och "nästa kapitel" kommer från ordningen i `kapitel`. För att flytta ett kapitel flyttar man raden.
4. **Uppgiftsnummer är strängar**, så att `"24*"` går att skriva utan att något går sönder.
5. **Id ändras aldrig i onödan.** Kapitel-id (`"13.3"`) och uppgiftsnummer är nycklarna som all sparad data hänger på. Måste ett id ändras: se §5.3.
6. **Ingen kurskod hårdkodas i koden.** Allt kursspecifikt står i `kurs.json`. Nästa kurs är en ny `kurs.json`, inte ny kod.

---

## 4. Byggskriptet: `build.py`

Samma idé som `build.py` i förra kursens tentasida.

### 4.1 Vad det gör
1. Läser `kurs.json`.
2. Kontrollerar allt (se nedan).
3. Om allt stämmer: skriver `sida/data/kurs.js` (`window.KURS = {...}`) och en kort sammanfattning.
4. Om något är fel: **skriver ingenting**, listar felen och avslutas med felkod.

Skriptet behövs också för att sidan ska fungera via `file://`, där `fetch()` inte kan läsa lokala filer.

### 4.2 Vad det kontrollerar
- Varje kapitel hör till en modul som finns.
- Varje föreläsning pekar bara på kapitel som finns.
- Inga dubbletter av kapitel-id, föreläsningsnummer eller uppgiftsnummer inom ett kapitel.
- Datumen är giltiga och föreläsningarna ligger i datumordning.
- Tentan ligger efter sista föreläsningen.
- Varje modul utom Tentan har minst en föreläsning (annars går dess datum inte att räkna fram).
- `tidigare_id` (§5.3) krockar inte med något befintligt id.

### 4.3 Härledningar: i sidan, inte i bygget
Det som räknas fram ligger i `sida/js/kurs.js`, inte i `kurs.js`-filen som bygget skriver. Då går det att ändra *hur* något räknas utan att bygga om datan.

| Härledning | Från |
|---|---|
| Modulens första och sista datum | Modulens föreläsningar |
| Vecka för ett datum | Datumet (ISO-vecka) |
| Modulen som pågår | Dagens datum + moduldatumen |
| Kapitlets föreläsning(ar) | `forelasningar[].kapitel` |
| Föregående och nästa kapitel | Ordningen i `kapitel` |
| "På tentan" per kapitel | `tentor` (när de finns) |

---

## 5. Användardatan

### 5.1 Form

```json
{
  "version": 1,
  "senast": "13.3",
  "kapitel": {
    "13.3": {
      "ikryssade": ["2", "3", "4"],
      "kansla": 3,
      "anteckning": "Kolla tangentplanet igen."
    }
  }
}
```

- `kansla` är `1`–`5`, eller saknas om inget är valt.
- Ett kapitel som inte har något ifyllt finns inte med alls.

### 5.2 Regler
1. **Allt kopplas till id**, aldrig till position. Inte "tredje kapitlet" eller "femte knappen", utan `"13.3"` och `"15"`.
2. **Inget härlett sparas.** Stapelvärden, "pågår" och liknande räknas fram varje gång och kan därför aldrig bli fel.
3. **Allt som läses och skrivs ligger i `try/catch`.** Fungerar inte localStorage fungerar sidan ändå, men den säger att inget sparas.
4. **Läs in innan du skriver**, så att två öppna flikar inte skriver över varandra.
5. **Nyckeln innehåller kurskoden** (`m0068m.v1`), så att nästa kurs inte krockar med den här.
6. **`version` i datan:** ändras formatet migreras gammal data när den läses in, och sparas sedan i det nya formatet.

### 5.3 Vad som händer när kursdatan ändras

| Ändring i `kurs.json` | Vad som händer med sparad data |
|---|---|
| Uppgift läggs till | Visas oikryssad |
| Uppgift tas bort | Den sparade bocken ligger kvar men visas inte. Inget går sönder, och den kommer tillbaka om uppgiften läggs till igen |
| Datum eller sal ändras | Ingenting |
| Kapitel flyttas till en annan modul | Ingenting |
| Kapitel byter titel | Ingenting |
| **Kapitel byter id** | Det enda farliga. Lägg `"tidigare_id": ["gammalt-id"]` på kapitlet i `kurs.json`, så flyttar lagringen över datan när den läses in |

### 5.4 Sparsätt
Samma modell som förra kursens tentasida:
- **localStorage**, alltid.
- **Kopia på disken** (valfritt, Edge/Chrome): en JSON-fil som skrivs vid varje ändring. Filhandtaget sparas i IndexedDB.
- **Ladda ner / Läs in** för backup och flytt mellan datorer. Filen kontrolleras innan den ersätter något.
- **Rensa** går att ångra i 15 sekunder.
- **Ingen synk** mellan enheter.

---

## 6. Gränssnittet

### 6.1 Vyer som bara läser
Varje vy är en funktion av **kursdata + användardata + adress → HTML**.

- Ingen vy ändrar kursdatan.
- Bara `lagring.js` skriver användardata. Vyerna anropar den och ritar sedan om.
- En ändring ritar bara om det som ändrats, så att fokus och scrolläge överlever.

### 6.2 Så går layouten att ändra
- **Delar som återkommer finns på ett ställe** (`delar.js`): uppgiftsknapparna och känslovalet ser likadana ut i alla vyer, eftersom de *är* samma kod.
- **Designbeslut är variabler** överst i `style.css`: färger, avstånd, typsnitt och storlekar. Ändra på ett ställe så ändras allt.
- **Vyerna är separata filer.** En ny vy, som Tentan, är en ny fil plus en rad i `router.js`.

### 6.3 Tekniska ramar
- Vanilla HTML, CSS och JS. Inga ramverk, ingen bundler, ingen npm-kedja för själva sidan.
- Sidan fungerar genom att dubbelklicka på `index.html` (`file://`).
- KaTeX som lokal kopia, låst version.
- Hash-routing (`#/kapitel/13.3`).
- CSS och JS laddas med `?v=<datum>`, och numret byts vid varje ändring, så att webbläsaren inte kör gammal kod. Det var ett verkligt problem i förra projektet.

---

## 7. Arbetsflöden

### Kursen ändras (nytt datum, ny uppgift, flyttat kapitel)
1. Ändra i `kurs.json`.
2. Kör `python build.py`.
3. Läser skriptet fel: rätta det som står och kör igen.
4. Ladda om sidan.

### Layouten ändras
1. Ändra i `sida/js/vyer/`, `delar.js` eller `style.css`.
2. Byt `?v=`-numret i `index.html`.
3. Ladda om sidan. Kursdatan behöver inte byggas om.

### Kompisar har förslag
De berättar för Jonatan, som avgör och gör ändringen i `kurs.json` själv.

### Ny kurs
Ny `kurs.json` i ett nytt projekt, samma kod. localStorage-nyckeln skiljer kurserna åt.

---

## 8. Publicering (valfritt)

Som förra kursen: Git-repo och GitHub Pages. Varje person som använder den publicerade sidan får sin egen data i sin egen webbläsare. Bara Jonatan pushar.

---

## 9. Öppna frågor

- Ska `kurs.json` vara en fil, eller delas upp (t.ex. `forelasningar.json` och `kapitel.json`) om den blir lång?
- Format för `tentor` och tentauppgifterna: bestäms när Tentan utformas.
- Ska byggskriptet skrivas i Python som förra gången? (Förslag: ja, det fanns redan installerat.)
