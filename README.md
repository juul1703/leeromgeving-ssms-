# SSMS Leeromgeving

Homescreen voor mijn leeromgeving — Safety & Security Management Studies, THUAS.
Statische site: geen build, geen dependencies. Werkt offline en is te installeren op je beginscherm.

## Bestanden

| Bestand | Wat het is |
| --- | --- |
| `index.html` | Het homescreen |
| `les.html` | De lespagina (`les.html?vak=<vakId>&les=<lesId>`) |
| `styles.css` | Alle styling; huisstijl staat in de CSS-variabelen bovenaan |
| `app.js` | Alle inhoud (vakken, lessen, rooster, deadlines, notities) + homescreen-logica |
| `les.js` | Logica van de lespagina (tabbladen, voortgang, quiz) |
| `lesblokken.js` | De bouwstenen: kaders, tabellen, flashcards, quiz, enzovoort |
| `lesstof.js` | De inhoud van je lessen |
| `rooster.js` | Haalt je iCal-rooster van mytimetable.hhs.nl op en koppelt het aan je vakken |
| `sw.js` | Service worker voor offline gebruik |
| `manifest.webmanifest` | Zodat het als app op je beginscherm werkt |

## Inhoud aanpassen

Alles wat je normaal wil wijzigen staat bovenaan `app.js`:

- `STUDENT.naam` — je voornaam, voor de groet
- `DATA.semesters` — vakken en lessen; een les is `{ id, titel, duur, inhoud, url }`
  - `inhoud`: HTML-string die op de lespagina komt (`<h2>`, `<p>`, `<ul>` werken)
  - `url`: link naar extern materiaal (Brightspace, pdf, video) — verschijnt als knop
- `DATA.actiefSemester` — welk semester groot in beeld staat; het andere klapt in als archief.
  Staat nu op `'s1'`. De vakken van dat semester komen automatisch uit je rooster:
  elk vak dat in de iCal-feed voorkomt wordt een kaart. Wil je er lessen bij zetten,
  voeg het vak dan in `DATA` toe met hetzelfde id dat je op de kaart ziet.
- `ROOSTER_WEEK` — je weekrooster per weekdag (0 = zondag … 6 = zaterdag).
  Elk moment is `{ van, tot, vakId, soort, plek }`. Het `vakId` bepaalt welk vak groot in beeld staat.
- `EIGEN_DEADLINES` — je eigen inleverdata: `{ titel, vak, datum: 'JJJJ-MM-DD' }`.
  Toetsen en tentamens uit je rooster komen er automatisch bij; het paneel toont de eerste vijf.
- "Laatst bekeken" vult zich met de aantekeningen die je op lespagina's schrijft (niets in te vullen).

## Rooster

`rooster.js` leest je persoonlijke iCal-feed van mytimetable.hhs.nl. Instellingen bovenaan dat bestand:

- Je feed-adres staat **niet in de code**. De site vraagt er de eerste keer om en bewaart hem
  alleen in je eigen browser (`ssms-feed` in localStorage). Daardoor kun je de repository
  publiek zetten zonder je persoonlijke link te delen. Wijzigen of ontkoppelen: tandwiel rechtsboven.
- `FEED_STANDAARD` — alleen invullen als je hem tóch vast in de code wil (privérepo)
- `KOPPELING` — koppelt een stukje tekst uit de roostertitel aan een `vakId` uit `app.js`.
  Zo weet het homescreen bij welk vak een college hoort. Onbekende momenten blijven zichtbaar,
  alleen zonder link naar een vak.
- `PROXIES` — de browser mag mytimetable niet direct uitlezen (CORS); lukt direct ophalen niet,
  dan wordt de feed via een van deze doorgeefluiken gehaald.

Het laatst opgehaalde rooster wordt bewaard onder `ssms-rooster-cache`, dus offline zie je nog
gewoon je dag. Onder het Vandaag-paneel staat of het rooster live is of uit de cache komt.
Lukt niets, dan valt het terug op het handmatige `ROOSTER_WEEK` in `app.js`.

## Hoe wordt het "actieve vak" bepaald?

Op volgorde, de eerste die klopt wint:

1. het college dat op dit moment bezig is
2. het eerstvolgende college van vandaag
3. het laatste college van vandaag, als de dag voorbij is ("vandaag gehad · werk het na")
4. het eerstvolgende college in je rooster daarna (morgen of later)
5. het vak dat je het laatst open had (bewaard onder `ssms-laatst`)
6. het eerste onafgeronde vak van het actieve semester

De kaart vertelt zelf welke regel gold, dus je ziet altijd waaróm dat vak er staat.

Aantekeningen per les staan onder `ssms-notitie-<vakId>-<lesId>`.
Voortgang bewaart de browser lokaal onder sleutels `ssms-les-<vakId>-<lesId>` (zelfde schema als de eerste versie),
en de licht/donker-keuze onder `ssms-modus`.

## Kleuren

De hele huisstijl zit in twee blokken CSS-variabelen in `styles.css`:
`:root` voor licht, `html[data-mode="dark"]` voor donker.
Pas `--accent` aan en de hele interface schuift mee.

## Publiceren op GitHub Pages

1. **New repository** op github.com, bv. `leeromgeving`. Public mag: je roosterlink zit niet in de code.
2. **Add file → Upload files**, alle bestanden uit deze map erin (de bestanden zelf, niet de map). Commit.
3. **Settings → Pages** → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`. Save.
4. Na een minuut: `https://<gebruikersnaam>.github.io/leeromgeving/`
5. Eerste keer openen: plak je iCal-link uit MyTimetable in het venster dat verschijnt.

De service worker werkt alleen via https of localhost — op GitHub Pages dus meteen goed.
Op je telefoon: openen in de browser → delen → *Zet op beginscherm*. Dan werkt het als app, ook offline.

**Na elke wijziging**: verhoog `VERSIE` in `sw.js` (`ssms-v5` → `v6`), anders blijft de oude
versie in de cache van je browser hangen.

### Bijwerken vanaf je computer

```sh
git clone https://github.com/<gebruikersnaam>/leeromgeving.git
cd leeromgeving
# bestanden aanpassen, dan:
git add . && git commit -m "lesstof bijgewerkt" && git push
```

Lokaal testen (de service worker en `fetch` werken niet vanaf `file://`):

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## De les-template

Elke les heeft dezelfde zes onderdelen (de tabbladen), zodat je altijd weet waar je iets zoekt:

| Onderdeel | Wat erin hoort |
| --- | --- |
| Inleiding | Waar gaat dit college over, leerdoelen, samenhang met de vorige les |
| Kernstof | De uitleg zelf: theorie, kernbegrippen, modellen, schema's uit de slides |
| Verdieping | De literatuur uitgediept: wat zeggen bronnen, waar spreken ze elkaar tegen, casus |
| Toepassen | Stappenplannen en oefeningen met modelantwoord |
| Checken | Quiz met uitleg per antwoord, bronnen in APA, vooruitblik |
| Aantekeningen | Jouw eigen ruimte (los extra, geen vervanging van de uitleg) |

Een college dat nog niet is uitgewerkt toont per onderdeel wát er komt en krijgt het label
**nog leeg** in de lessenlijst — zo zie je in één oogopslag welke colleges nog materiaal missen.

Blokken vul je in `lesstof.js`:

```js
LESSTOF['<vakId>/<lesId>'] = [
  { id: 'kern', titel: 'Kernstof', blokken: [
    { type: 'uitleg', titel: 'Waar dit over gaat', tekst: 'Met **dik**, *cursief* en `code`.' },
    { type: 'quiz', vragen: [{ vraag: '…', opties: ['a','b'], juist: 1, uitleg: '…' }] }
  ]}
];
```

`LESSTOF['<vakId>']` zonder lesId geldt voor alle lessen van dat vak.
Elk college uit je rooster dat nog geen stof heeft, opent met vier lege tabbladen
(Voorbereiding / In het college / Uitwerken / Checken) als schrijfblok.

### Bloktypes

| type | velden |
| --- | --- |
| `tekst` | `titel`, `tekst` (of `html`) |
| `leerdoelen` | `titel`, `items: []` — afvinkbaar |
| `uitleg` / `waarschuwing` / `voorbeeld` / `slimmer` | `titel`, `tekst`, `punten: []` |
| `hardop` | `titel`, `tekst`, `stappen: []` — vragen om hardop door te lopen |
| `citaat` | `tekst`, `bron`, `jaar`, `url` |
| `tabel` | `titel`, `kop: []`, `rijen: [[]]`, `noot` |
| `stappen` | `titel`, `items: [{titel, tekst}]` — uitklapbaar |
| `vergelijking` | `titel`, `links: {titel, tekst, punten}`, `rechts: {…}` |
| `flashcards` | `kaarten: [{begrip, definitie}]` — klik draait, klik op tekst kopieert |
| `begrippen` | `items: [{begrip, en, definitie}]` — hover toont, klik kopieert |
| `oefening` | `id`, `niveau`, `vraag`, `antwoord` — eigen antwoord wordt bewaard |
| `video` | `titel`, `tekst`, `duur`, `url` |
| `quiz` | `vragen: [{vraag, opties, juist, uitleg}]` — directe groen/rood feedback |
| `bronnen` | `items: [{apa, url}]` — klik kopieert de APA-verwijzing |
| `preview` | `titel`, `tekst`, `punten`, `vakId`, `lesId` |

Zet `toetsstof: true` op een blok voor een vlaggetje "toetsstof".

### Wat de pagina zelf bijhoudt

- welk tabblad je afvinkt (voortgangsbalk bovenaan; alle tabs af = les afgerond)
- je aantekening **per tabblad**
- je eigen antwoorden bij oefeningen
- afgevinkte leerdoelen
- of het zijmenu in- of uitgeklapt staat

Pijltjestoetsen ← → bladeren door de tabbladen en daarna door de lessen.
De voorbeeldles met alle blokken staat op `les.html?vak=voorbeeld&les=les-1`
(link onderaan het homescreen).
