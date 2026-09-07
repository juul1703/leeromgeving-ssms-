/* ============================================================
   Lesstof — de inhoud van je lessen.

   Twee manieren om een les te vullen:

   1. LESSTOF['<vakId>/<lesId>']  → deze ene les
   2. LESSTOF['<vakId>']          → geldt voor alle lessen van dat vak
                                    die zelf geen eigen stof hebben

   De vakId's zie je op de kaarten op het homescreen; de lesId van een
   college uit je rooster staat in de adresbalk (les.html?vak=…&les=…).

   Een les is een lijst onderdelen (de tabbladen):
     { id:'kern', titel:'Kernstof', blokken:[ … ] }

   Bloktypes: tekst, leerdoelen, uitleg, waarschuwing, voorbeeld, slimmer,
   hardop, citaat, tabel, stappen, vergelijking, flashcards, begrippen,
   oefening, video, quiz, bronnen, preview.
   Zet toetsstof:true op een blok voor een 'toetsstof'-vlaggetje.
   ============================================================ */

var LESSTOF = {

  /* Voorbeeld — verwijder of overschrijf zodra je eigen stof erin zet.
     Bekijk hem via de link onderaan het homescreen. */
  'voorbeeld/les-1': [
    {
      id: 'inleiding', titel: 'Inleiding',
      blokken: [
        { type: 'leerdoelen', items: [
          'Uitleggen wat een veiligheidsvraagstuk tot een wicked problem maakt',
          'Het verschil benoemen tussen veiligheid en veiligheidsgevoel',
          'Een casus analyseren met de drie voorwaarden uit routine activity theory'
        ]},
        { type: 'uitleg', titel: 'Waar dit onderdeel over gaat',
          tekst: 'Veiligheid is zelden één probleem met één eigenaar. Je werkt met **partijen die elkaar nodig hebben** en tegelijk verschillende belangen hebben: gemeente, politie, ondernemers, bewoners.\n\nDeze les geeft je het vocabulaire om zo\u2019n situatie te ontleden voordat je met oplossingen komt.' },
        { type: 'video', titel: 'Introductie: veiligheid als vraagstuk', duur: '8 min',
          tekst: 'Kijk dit vóór het college, dan kun je in de werkgroep meteen mee.',
          url: 'https://www.dehaagsehogeschool.nl' },
        { type: 'slimmer', titel: 'Sneller door de stof',
          tekst: 'Lees eerst de kopjes en de begrippenlijst, dan de tekst. Je leest dan met een vraag in je hoofd in plaats van van voren af aan — dat scheelt makkelijk een derde van de tijd.' }
      ]
    },
    {
      id: 'kern', titel: 'Kernstof',
      blokken: [
        { type: 'tekst', titel: 'Twee soorten veiligheid', toetsstof: true,
          tekst: 'In de literatuur wordt onderscheid gemaakt tussen *objectieve* veiligheid (wat meetbaar gebeurt) en *subjectieve* veiligheid (wat mensen ervaren). Beleid dat alleen op cijfers stuurt kan objectief succesvol zijn en subjectief mislukken.' },
        { type: 'begrippen', titel: 'Kernbegrippen', items: [
          { begrip: 'Objectieve veiligheid', en: 'objective safety',
            definitie: 'De feitelijke, meetbare kans op schade of slachtofferschap, uitgedrukt in registraties en cijfers.' },
          { begrip: 'Subjectieve veiligheid', en: 'perceived safety',
            definitie: 'De mate waarin mensen zich veilig voelen, los van de gemeten kans op incidenten.' },
          { begrip: 'Wicked problem', en: 'wicked problem',
            definitie: 'Een vraagstuk zonder eenduidige probleemdefinitie of eindoplossing, met veel betrokken partijen en tegenstrijdige belangen.' },
          { begrip: 'Gelegenheidsstructuur', en: 'opportunity structure',
            definitie: 'Het geheel van omstandigheden dat een delict praktisch mogelijk of juist onaantrekkelijk maakt.' }
        ]},
        { type: 'citaat',
          tekst: 'Onveiligheid is niet alleen wat er gebeurt, maar ook wat mensen verwachten dat er kan gebeuren.',
          bron: 'Vrij naar Boutellier, Veiligheidsutopie', jaar: '2011' },
        { type: 'tabel', titel: 'Objectief versus subjectief in beleid',
          kop: ['', 'Objectieve veiligheid', 'Subjectieve veiligheid'],
          rijen: [
            ['Meet je met', 'registraties, incidentcijfers', 'enquêtes, buurtgesprekken'],
            ['Stuurt op', 'aantal delicten', 'vertrouwen en gedrag'],
            ['Valkuil', 'onzichtbare zorgen missen', 'symboolmaatregelen nemen']
          ],
          noot: 'In een adviesrapport benoem je altijd beide kolommen — anders is je advies eenzijdig.' },
        { type: 'vergelijking', titel: 'Twee verklaringsrichtingen',
          links: { titel: 'Dadergericht', tekst: 'Verklaart delicten uit kenmerken en keuzes van de dader.',
            punten: ['Interventie richt zich op personen', 'Denk aan begeleiding en toezicht', 'Risico: stigmatisering'] },
          rechts: { titel: 'Situationeel', tekst: 'Verklaart delicten uit de situatie waarin ze plaatsvinden.',
            punten: ['Interventie richt zich op plaatsen', 'Denk aan zicht, licht, drukte', 'Risico: probleem verplaatst zich'] } },
        { type: 'waarschuwing', titel: 'Veelgemaakte fout',
          tekst: 'Correlatie is geen oorzaak. Meer politie op een plek waar meer incidenten worden gemeld betekent niet dat politie incidenten veroorzaakt — de meldingsbereidheid stijgt mee.' }
      ]
    },
    {
      id: 'verdieping', titel: 'Verdieping',
      blokken: [
        { type: 'tekst', titel: 'Wat de bronnen zeggen',
          tekst: 'Cohen en Felson (1979) leggen de nadruk op de *situatie*: een delict vraagt drie samenlopende voorwaarden. Boutellier (2011) kijkt naar de *maatschappelijke reactie*: hoe de roep om veiligheid zelf beleid vormt.\n\nDat verschil is geen detail. Wie de eerste lijn volgt, ontwerpt maatregelen op plaatsen en momenten. Wie de tweede volgt, kijkt eerst naar wie het probleem agendeert en waarom.' },
        { type: 'vergelijking', titel: 'Twee bronnen naast elkaar',
          links: { titel: 'Cohen & Felson (1979)', tekst: 'Delict als samenloop van omstandigheden.',
            punten: ['Verklaart pieken zonder daderkenmerken', 'Sterk voor plaats- en tijdgebonden analyse', 'Zegt weinig over motieven'] },
          rechts: { titel: 'Boutellier (2011)', tekst: 'Veiligheid als politiek en cultureel vraagstuk.',
            punten: ['Verklaart waarom beleid soms symbolisch is', 'Sterk voor bestuurlijke context', 'Minder houvast voor concrete interventies'] } },
        { type: 'waarschuwing', titel: 'Bij bronnen gebruiken',
          tekst: 'Zet nooit twee bronnen naast elkaar zonder te zeggen **waarin ze verschillen**. Een literatuurparagraaf die alleen samenvat, levert op hbo-niveau geen punten; de vergelijking en jouw keuze daartussen doen dat wel.' },
        { type: 'citaat', tekst: 'Een delict vraagt niet alleen een dader, maar ook een gelegenheid die zich aandient.',
          bron: 'Vrij naar Cohen & Felson', jaar: '1979' }
      ]
    },
    {
      id: 'toepassen', titel: 'Toepassen',
      blokken: [
        { type: 'stappen', titel: 'Een casus analyseren in vier stappen', items: [
          { titel: 'Beschrijf het incident feitelijk', tekst: 'Wie, wat, waar, wanneer. Nog geen interpretatie, nog geen oorzaken.' },
          { titel: 'Benoem de betrokken partijen', tekst: 'Wie heeft er belang bij, wie draagt de kosten, wie beslist? Zet ze naast elkaar met hun belang erbij.' },
          { titel: 'Zoek de drie voorwaarden', tekst: 'Gemotiveerde dader, geschikt doelwit, afwezige toezichthouder. Ontbreekt er één, dan heb je je interventiepunt.' },
          { titel: 'Formuleer één interventie en de prijs ervan', tekst: 'Elke maatregel kost iets: geld, vrijheid, vertrouwen. Noem die prijs expliciet — dat onderscheidt hbo-niveau van een mening.' }
        ]},
        { type: 'hardop', titel: 'Denk dit letterlijk uit',
          tekst: 'Pak de casus uit het college en praat hardop je analyse door. Merk je dat je vastloopt bij een stap, dan is dat precies de stap die je nog niet beheerst.',
          stappen: [
            'Wat is hier feitelijk gebeurd?',
            'Welke partij zou dit als eerste probleem noemen — en waarom die?',
            'Welke van de drie voorwaarden is het makkelijkst weg te halen?',
            'Wat kost die maatregel, en aan wie?'
          ]},
        { type: 'oefening', id: 'oef-1', niveau: 'basis',
          vraag: 'Een winkelstraat heeft weinig geregistreerde incidenten, maar ondernemers voelen zich onveilig. Leg met de begrippen uit deze les uit hoe dat kan.',
          antwoord: 'Objectieve en subjectieve veiligheid lopen hier uiteen. De gemeten kans op slachtofferschap is laag, maar de beleving wordt gevoed door andere signalen: verloedering, leegstand, groepsvorming, of eerdere incidenten die lang bijblijven. Een advies dat alleen naar de cijfers kijkt, adresseert het probleem van de ondernemers niet.' },
        { type: 'oefening', id: 'oef-2', niveau: 'gevorderd',
          vraag: 'De gemeente wil camera\u2019s plaatsen. Noem twee argumenten voor, twee tegen, en benoem welk belang in elk argument leidend is.',
          antwoord: 'Voor: verhoogde pakkans (opsporingsbelang) en toegenomen veiligheidsgevoel bij ondernemers (economisch belang). Tegen: inbreuk op privacy van passanten (grondrechtelijk belang) en verplaatsing van het probleem naar zijstraten (effectiviteitsbelang). Het patroon: elk argument hoort bij een partij, en de afweging is dus politiek — niet puur technisch.' }
      ]
    },
    {
      id: 'checken', titel: 'Checken',
      blokken: [
        { type: 'quiz', titel: 'Check jezelf', vragen: [
          { vraag: 'Wat maakt een veiligheidsvraagstuk een wicked problem?',
            opties: ['Het is technisch ingewikkeld', 'Partijen definiëren het probleem verschillend', 'Er is te weinig geld voor', 'De data ontbreken'],
            juist: 1,
            uitleg: 'Kern is de **probleemdefinitie zelf**: partijen zijn het niet eens over wát het probleem is, dus is er ook geen eindoplossing waar iedereen achter staat.' },
          { vraag: 'Een buurt scoort laag op incidenten maar hoog op onveiligheidsgevoel. Wat is er aan de hand?',
            opties: ['De cijfers zijn fout', 'Objectief en subjectief lopen uiteen', 'De buurt is onveilig', 'Er wordt niets gemeld'],
            juist: 1,
            uitleg: 'Dit is precies het onderscheid uit de kernstof. Beide zijn waar en beide vragen een ander type maatregel.' },
          { vraag: 'Welke voorwaarde hoort *niet* bij routine activity theory?',
            opties: ['Gemotiveerde dader', 'Geschikt doelwit', 'Afwezige toezichthouder', 'Lage sociale cohesie'],
            juist: 3,
            uitleg: 'Sociale cohesie komt uit de sociale-desorganisatietheorie. De drie voorwaarden zijn dader, doelwit en toezicht.' },
          { vraag: 'Wat hoort er in een hbo-advies altijd bij een voorgestelde maatregel?',
            opties: ['Een begroting tot op de euro', 'De prijs: wat het kost en aan wie', 'Een literatuurlijst van tien bronnen', 'Een second opinion'],
            juist: 1,
            uitleg: 'Benoemen wat een maatregel kost — in geld, vrijheid of vertrouwen — en wie dat betaalt. Dat maakt het een afweging in plaats van een mening.' }
        ]},
        { type: 'bronnen', items: [
          { apa: 'Boutellier, H. (2011). De veiligheidsutopie. Boom Juridische uitgevers.' },
          { apa: 'Cohen, L. E., & Felson, M. (1979). Social change and crime rate trends: A routine activity approach. American Sociological Review, 44(4), 588–608.' }
        ]},
        { type: 'preview', titel: 'Van analyse naar advies',
          tekst: 'Volgende keer bouw je op deze analyse verder: van ontleden naar onderbouwd adviseren.',
          punten: ['De opbouw van een adviesrapport', 'Onderscheid bevinding, conclusie, aanbeveling', 'Hoe je een aanbeveling toetsbaar maakt'] }
      ]
    },
    {
      id: 'aantekeningen', titel: 'Aantekeningen',
      blokken: [
        { type: 'uitleg', titel: 'Jouw eigen ruimte',
          tekst: 'Wat de docent nadrukkelijk herhaalde, wat je nog niet snapt, vragen voor de volgende keer. Schrijf rechts \u2014 het wordt per onderdeel bewaard en verschijnt op je homescreen onder *Laatst bekeken*.' },
        { type: 'hardop', titel: 'Voor je afsluit',
          tekst: 'Twee vragen die je aan het eind van elk college even hardop beantwoordt.',
          stappen: ['Wat is in \u00e9\u00e9n zin de kern van dit college?', 'Welk stuk zou ik nu niet aan een medestudent kunnen uitleggen?'] }
      ]
    }
  ]
};

/* ------------------------------------------------------------
   De vaste opzet van een uitgewerkte les.

   Elke les heeft dezelfde zes onderdelen, zodat je altijd weet waar
   je iets zoekt. Een les die nog niet is uitgewerkt toont per
   onderdeel wat er komt — en vervalt niet in een leeg schrijfblok.
   ------------------------------------------------------------ */

var LES_OPZET = [
  { id: 'inleiding', titel: 'Inleiding',
    wat: 'Waar gaat dit college over, wat moet je erna kunnen, en hoe hangt het samen met de vorige les.' },
  { id: 'kern', titel: 'Kernstof',
    wat: 'De uitleg zelf: theorie, kernbegrippen, modellen en de tabellen en schema\u2019s uit de slides.' },
  { id: 'verdieping', titel: 'Verdieping',
    wat: 'De literatuur uitgediept: wat zeggen de bronnen precies, waar spreken ze elkaar tegen, en welke casus hoort erbij.' },
  { id: 'toepassen', titel: 'Toepassen',
    wat: 'Stappenplannen en oefeningen met modelantwoord, zodat je de stof ook echt kunt gebruiken.' },
  { id: 'checken', titel: 'Checken',
    wat: 'Quiz met uitleg per antwoord, de bronnenlijst in APA en een vooruitblik op de volgende les.' },
  { id: 'aantekeningen', titel: 'Aantekeningen',
    wat: 'Jouw eigen ruimte: wat de docent nadrukkelijk herhaalde, wat je nog niet snapt, vragen voor de volgende keer.' }
];

/* Een nog niet uitgewerkte les: dezelfde structuur, met per onderdeel
   wat er komt en wat ik daarvoor nodig heb. */
function leegSkelet(les){
  return LES_OPZET.map(function(o, i){
    if (o.id === 'aantekeningen') {
      return { id: o.id, titel: o.titel, blokken: [
        { type: 'uitleg', titel: 'Jouw aantekeningen',
          tekst: o.wat + '\n\nSchrijf rechts in het veld; het wordt per onderdeel bewaard en verschijnt op je homescreen onder *Laatst bekeken*.' },
        { type: 'slimmer', titel: 'Zelfde dag, tien minuten',
          tekst: 'Werk je aantekening dezelfde dag bij en schrijf \u00e9\u00e9n samenvattende regel. Dat is het verschil tussen aantekeningen die je later nog snapt en aantekeningen die je weggooit.' }
      ]};
    }
    return { id: o.id, titel: o.titel, blokken: [
      { type: 'uitleg', titel: 'Wat hier komt', tekst: o.wat },
      i === 0
        ? { type: 'waarschuwing', titel: 'Dit college is nog niet uitgewerkt',
            tekst: 'Stuur de **slides**, het **lesmateriaal** of de **literatuur** van dit college, dan schrijf ik de uitleg uit: theorie, begrippen met definities, oefeningen met modelantwoord en een quiz.\n\nTot die tijd kun je het tabblad *Aantekeningen* gebruiken.',
            punten: ['Slides of hand-out (pdf, ppt, foto\u2019s)', 'De opgegeven literatuur of hoofdstukken', 'De opdracht of casus als die er is'] }
        : { type: 'tekst', tekst: 'Nog niet uitgewerkt \u2014 dit onderdeel vult zich zodra het materiaal van dit college er is.' }
    ]};
  });
}

/* Is deze les uitgewerkt, of staat er nog het skelet? */
function lesUitgewerkt(vak, les){
  if (les && les.onderdelen) return true;
  return !!(LESSTOF[vak.id + '/' + les.id] || LESSTOF[vak.id]);
}

/* De onderdelen van een les ophalen: eigen stof > vakstof > leeg skelet. */
function lesOnderdelen(vak, les){
  if (les && les.onderdelen) return les.onderdelen;
  var eigen = LESSTOF[vak.id + '/' + les.id];
  if (eigen) return eigen;
  var perVak = LESSTOF[vak.id];
  if (perVak) return perVak;
  return leegSkelet(les);
}

/* De voorbeeldles is geen echt vak; hij is los opvraagbaar via ?vak=voorbeeld */
var VOORBEELD_VAK = {
  id: 'voorbeeld', naam: 'Voorbeeldles · zo werkt de template',
  lessen: [{ id: 'les-1', titel: 'Veiligheid als vraagstuk', duur: 90 }]
};
