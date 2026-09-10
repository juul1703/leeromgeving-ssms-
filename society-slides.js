/* ============================================================
   Society & Politics — collegeslides
   ============================================================

   Apart bestand, met opzet. Alles wat hier staat gaat over de
   collegeslides van dit vak: de uitgewerkte les en het onderdeel
   dat ervoor zorgt dat hij onder 'Lecture slides' op de vakpagina
   verschijnt.

   Nieuwe slides erbij na een college? Dan komt daar een blok bij
   met id 'slides-2', 'slides-3', enzovoort, en een regel in
   SLIDES hieronder. Verder verandert er niets.

   Collegeslides tellen niet mee voor de voortgangsbalk. Dat regelt
   app.js aan de hand van de groepsnaam 'Lecture slides'.
   ============================================================ */

LESSTOF['society-politics/slides-1'] = [
  {
    id: 'voor', titel: 'Voorbereiding',
    blokken: [
      { type: 'leerdoelen', items: [
        'Uitleggen wat sociologie is en waarom het een manier van kijken is, geen verzameling feiten',
        'De vijf soorten samenleving van Lenski benoemen en zeggen wat er per stap verandert',
        'Bergers "invitation to sociology" en Mills\u2019 sociological imagination uit elkaar houden en toepassen',
        'Het verschil tussen een persoonlijke trouble en een publiek issue aanwijzen in een concreet geval',
        'De drie klassieke perspectieven (functionalisme, conflicttheorie, symbolisch interactionisme) omschrijven, inclusief hun kritiek',
        'Zeggen wat hedendaagse perspectieven daaraan toevoegen, en wat glocalisering betekent'
      ]},

      { type: 'uitleg', titel: 'Waar dit college over gaat',
        tekst: 'Dit is het openingscollege van Society & Politics. Het bestaat uit twee helften die je niet door elkaar moet halen.\n\nDe **eerste helft van het semester is sociologie** (Dr. Abanes, boek Macionis & Plummer). De **tweede helft is politicologie** (Dr. Trigo de Sousa, boek McCormick, Hague & Harrop). De midterm gaat alleen over de sociologie.\n\nDit college legt het fundament: wat is sociologie, welke soorten samenleving zijn er, hoe leer je sociologisch kijken, en met welke drie brillen doe je dat.' },

      { type: 'waarschuwing', titel: 'De datum die je nu al moet weten',
        tekst: 'Op de slides staat de midterm op **13 november 2026**. Dat is dezelfde datum als in de module manual. Het vak telt 6 ECTS met midterm en eindtoets elk 50%, en voor allebei heb je minimaal een 5,5 nodig.' },

      { type: 'tabel', titel: 'Het leesschema van de eerste helft', toetsstof: true,
        kop: ['Week', 'Onderwerp', 'Macionis & Plummer'],
        rijen: [
          ['1', 'Introductie en sociologische perspectieven', 'H1, H2, H4'],
          ['2', 'Sociale constructie van het dagelijks leven', 'H7'],
          ['3', 'Etniciteit en migratie (gastcollege)', 'H11'],
          ['4', 'Cultuur en sociale bewegingen', 'H5, H16'],
          ['5', 'Controle en deviantie', 'H17'],
          ['6', 'Groepen, organisaties en werk', 'H6'],
          ['7', 'Sociale scheidslijnen en stratificatie', 'H8'],
          ['8', 'Risicosamenleving, steden en ruimte, plus review', 'H23, H24']
        ],
        noot: 'De slides geven per hoofdstuk soms preciezere paginanummers dan de manual. Bij verschil: houd de slides aan, dat is wat de docent toetst.' }
    ]
  },

  {
    id: 'kern', titel: 'Kernstof',
    blokken: [
      { type: 'tekst', titel: '1. Wat sociologie is', toetsstof: true,
        tekst: 'De definitie op de slide is kort: **sociologie is de systematische studie van de menselijke samenleving**. Het woord dat je moet onthouden is *systematisch*. Iedereen heeft meningen over hoe mensen samenleven; sociologie is de poging om dat methodisch te onderzoeken in plaats van er iets over te vinden.\n\nDe docent zet er vier omschrijvingen naast die allemaal hetzelfde punt maken: sociologie is een **vorm van bewustzijn**, een **manier van denken**, een **kritische manier van kijken**, een **perspectief**. Vier woorden voor één idee: sociologie is geen onderwerp maar een bril.\n\nDe openingsvraag van het college maakt dat concreet: waarom zit jij vandaag in de collegezaal? Je eerste antwoord is persoonlijk (ik wil dit diploma). Het sociologische antwoord gaat over leerplicht, over een arbeidsmarkt die diploma\u2019s vraagt, over wat er in jouw omgeving normaal wordt gevonden. Dezelfde handeling, een ander verklaringsniveau.' },

      { type: 'uitleg', titel: 'Waarom dit in een safety- en securityopleiding staat',
        tekst: 'De tweede openingsvraag is: hoe kan sociologie onze samenleving veiliger maken? Het antwoord loopt door het hele vak heen. Criminaliteit, radicalisering, wantrouwen in instituties, ongelijk verdeelde risico\u2019s: dat zijn geen optelsommen van individuele keuzes maar patronen. Als je alleen naar het individu kijkt, ontwerp je interventies die op het verkeerde niveau ingrijpen.' },

      { type: 'tekst', titel: '2. Samenleving en de typologie van Lenski', toetsstof: true,
        tekst: 'De definitie: **een samenleving is mensen die met elkaar omgaan in een afgebakende ruimte en een cultuur delen**. Drie elementen dus: interactie, ruimte, gedeelde cultuur.\n\nLenski\u2019s **socioculturele evolutie** stelt dat samenlevingen veranderen naarmate hun technologie verandert, en dat het tempo van verandering meebeweegt: hoe meer technologische informatie beschikbaar is, hoe sneller het gaat. Dat is meteen de kern van waarom onze eeuw zo onrustig aanvoelt en die van een agrarische samenleving niet.' },

      { type: 'tabel', titel: 'De vijf typen van Lenski', toetsstof: true,
        kop: ['Type', 'Waar het op draait'],
        rijen: [
          ['Hunting & gathering', 'Eenvoudige technologie'],
          ['Horticultural & pastoral', 'Gereedschap, land en vee'],
          ['Agrarian', 'Technologie en landbouw'],
          ['Industrial', 'Technologie en machines'],
          ['Post-industrial', 'Netwerken, risico en surveillance']
        ],
        noot: 'Let op de laatste rij. Netwerken, risico en surveillance zijn precies de drie woorden waar jouw opleiding over gaat. Dat is geen toeval: het is de brug naar week 8 over de risicosamenleving.' },

      { type: 'tekst', titel: '3. Berger: de uitnodiging tot sociologie', toetsstof: true,
        tekst: 'Peter Berger beschrijft sociologie als **erdoorheen kijken** en **achter gesloten deuren kijken**. Zijn bekendste formulering is **"het algemene zien in het bijzondere"**: in één concreet geval het patroon herkennen.\n\nDe opwinding van sociologie zit volgens Berger in het moment dat het vertrouwde plotseling betekenis krijgt. Iets waar je duizend keer langs bent gelopen blijkt ergens over te gaan.\n\nDe zin die je uit je hoofd moet kennen is de **eerste wijsheid van de sociologie: "things are not what they seem"**. Berger vergelijkt het met cadeautjes uitpakken: er zit steeds een laag onder.' },

      { type: 'tekst', titel: '4. Mills: de sociologische verbeelding', toetsstof: true,
        tekst: 'C. Wright Mills noemt de **sociological imagination** een kwaliteit van geest waarmee je het samenspel ziet tussen het individu en de samenleving. De structuur van de samenleving kan verpletterend aanvoelen; deze denkgewoonte geeft je er grip op.\n\nHet schema op de slide heeft twee assen die elkaar kruisen. **Biografie** tegenover **geschiedenis**, en **persoonlijke omgeving (troubles)** tegenover **publieke kwesties (issues)**. Waar die elkaar raken zit de sociologische verbeelding.\n\nHet voorbeeld van de docent: één student die het collegegeld niet kan betalen is een **persoonlijke trouble**. Miljoenen studenten met torenhoge studieschuld is een **publiek issue**. Dezelfde ervaring, maar op het tweede niveau is het geen pech meer maar een kenmerk van het systeem.' },

      { type: 'slimmer', titel: 'Zo hou je Berger en Mills uit elkaar',
        tekst: 'Ze lijken op elkaar en dat is precies waar een toetsvraag op mikt.\n\n**Berger** gaat over *diepte*: onder de oppervlakte kijken, het algemene in het bijzondere zien. **Mills** gaat over *schaal*: van het individuele geval opschalen naar structuur en geschiedenis.\n\nEzelsbruggetje: Berger kijkt naar beneden, Mills kijkt naar buiten.' },

      { type: 'tekst', titel: '5. Global village: als de wereld 100 mensen was', toetsstof: true,
        tekst: 'De slide schaalt de wereldbevolking terug naar honderd mensen, omdat ongelijkheid op die schaal zichtbaar wordt.\n\n**Demografie:** 61 wonen in Azië, 13 in Afrika, 12 in Europa, 14 in Amerika.\n**Welvaart:** 20 mensen bezitten 80% van het wereldinkomen.\n**Kansen:** 50 hebben geen vaste voedselzekerheid of vast werk, en slechts 8 bereiken hoger onderwijs.\n\nDe sociologische vraag die de docent eraan hangt is niet "wat erg", maar: **welke structurele krachten produceren deze verdeling en houden haar in stand?** Dat is de vraagvorm die je in dit vak moet leren stellen.' },

      { type: 'tekst', titel: '6. Theorie en theoretisch perspectief', toetsstof: true,
        tekst: 'Twee definities die makkelijk door elkaar lopen en daarom vaak getoetst worden.\n\nEen **theorie** is "een uitspraak over hoe en waarom specifieke feiten met elkaar samenhangen". Concreet en toetsbaar.\n\nEen **theoretisch perspectief** is "een basisbeeld dat het denken en het onderzoek stuurt". Veel ruimer: het bepaalt welke vragen je überhaupt stelt.\n\nHet schoolvoorbeeld is **Durkheims studie naar zelfdoding**: hij verbindt de mate van sociale integratie aan het risico, en onderscheidt daarbij onder meer altruïstische en egoïstische vormen. Waarom het zo vaak wordt aangehaald: het koppelt een sociaal feit aan een sociale oorzaak, in plaats van aan een individuele.' },

      { type: 'vergelijking', titel: 'De drie klassieke perspectieven', toetsstof: true,
        kop: ['Functionalisme', 'Conflicttheorie', 'Symbolisch interactionisme'],
        rijen: [
          ['Een wereld van evenwicht', 'Een wereld van verschil', 'Een wereld van betekenis'],
          ['De samenleving is een systeem waarvan de delen samenwerken voor stabiliteit en solidariteit', 'De samenleving bestaat uit groepen die strijden om schaarse middelen als werk en macht', 'De samenleving is het product van alledaagse interactie tussen mensen in een gedeelde werkelijkheid'],
          ['Durkheim, Spencer, Merton', 'Marx en latere conflicttheoretici', 'Weber en Goffman'],
          ['Macroniveau', 'Macroniveau', 'Microniveau'],
          ['Kritiek: het praat ongelijkheid binnen de samenleving weg', 'Kritiek: het praat gedeelde waarden en onderlinge afhankelijkheid weg', 'Kritiek: het verliest grotere structuren en context uit het oog']
        ] },

      { type: 'tekst', titel: '7. Functionalisme in detail', toetsstof: true,
        tekst: 'Het beeld is dat van een **menselijk lichaam**: organen, oftewel onderdelen, houden het geheel in leven. Bij **Durkheim** draait het om sociale banden en solidariteit die de samenleving bijeenhouden.\n\n**Structuren** zijn hoe de delen in elkaar passen; **functies** zijn hoe elk deel bijdraagt aan het geheel. Dat onderscheid komt van Spencer en loopt door bij Merton.\n\n**Merton** voegt het onderscheid toe dat je zeker moet kennen: **manifeste functies** zijn de bedoelde gevolgen, **latente functies** de onbedoelde, en **dysfuncties** de ongewenste gevolgen. Een universiteit heeft als manifeste functie kennisoverdracht, als latente functie het vormen van vriendschappen en relaties, en als dysfunctie bijvoorbeeld het reproduceren van ongelijkheid tussen wie wel en niet kan studeren.' },

      { type: 'tekst', titel: '8. Conflicttheorie in detail', toetsstof: true,
        tekst: 'Het beeld is een **arena van ongelijkheid** waarin groepen strijden om schaarse middelen. Die strijd is geen storing in het systeem maar de motor van verandering.\n\n**Marx**: de geschiedenis van alle bestaande samenlevingen is de geschiedenis van klassenstrijd. Latere conflicttheoretici hebben dat verbreed voorbij sociale klasse naar **gender, ras en andere vormen van gestructureerde ongelijkheid**.\n\nDat "voorbij klasse" is belangrijk voor de toets: conflicttheorie is niet hetzelfde als marxisme.' },

      { type: 'tekst', titel: '9. Symbolisch interactionisme in detail', toetsstof: true,
        tekst: 'Dit is het enige van de drie op **microniveau**. De samenleving is wat mensen samen doen, soms **social action** genoemd.\n\n**Weber**: menselijk handelen, ideeën, overtuigingen en betekenissen vormen de samenleving actief, niet alleen andersom. Dat is een directe tegenzet tegen een puur structurele verklaring.\n\n**Goffman**: we doen aan **presentation of self**, we gebruiken symbolen om een beeld van onszelf te projecteren, alsof we op een toneel staan. Kleding, taalgebruik, een uniform: allemaal rekwisieten.' },

      { type: 'tekst', titel: '10. Hedendaagse perspectieven', toetsstof: true,
        tekst: 'De drie klassieke perspectieven zijn niet het eindpunt. Wat er sinds de tweede helft van de twintigste eeuw bij is gekomen:\n\n**Meerdere perspectieven tegelijk**, een multidisciplinaire aanpak in plaats van één verklaringsmodel.\n\n**Andere posities aan het woord**: vrouwen, minderheden, gekoloniseerde bevolkingen, LHBTQ-personen, kinderen. Het punt is niet alleen "ook hun mening", maar dat je vanuit een andere positie andere patronen ziet.\n\n**Andere stemmen**: postmodernisme, en risicobewustzijn als apart thema.\n\n**Globale perspectieven**: onderlinge verbondenheid over grenzen heen. En daarbinnen **glocalisering**: de lokale reactie op globale verandering. Een mondiale trend landt overal net iets anders, en die vertaalslag is zelf het onderzoeksobject.' },

      { type: 'begrippen', items: [
        { begrip: 'Sociologie', definitie: 'de systematische studie van de menselijke samenleving; een manier van denken en kritisch kijken, geen verzameling feiten' },
        { begrip: 'Samenleving', definitie: 'mensen die met elkaar omgaan in een afgebakende ruimte en een cultuur delen' },
        { begrip: 'Socioculturele evolutie (Lenski)', definitie: 'samenlevingen veranderen naarmate hun technologie verandert; meer technologische informatie betekent een sneller tempo van verandering' },
        { begrip: 'Het algemene zien in het bijzondere (Berger)', definitie: 'in één concreet geval het onderliggende patroon herkennen' },
        { begrip: 'Sociological imagination (Mills)', definitie: 'de kwaliteit van geest waarmee je het samenspel ziet tussen biografie en geschiedenis, tussen persoonlijke troubles en publieke issues' },
        { begrip: 'Personal trouble tegenover public issue', definitie: 'hetzelfde probleem op individueel niveau tegenover hetzelfde probleem als kenmerk van de structuur' },
        { begrip: 'Theorie', definitie: 'een uitspraak over hoe en waarom specifieke feiten met elkaar samenhangen' },
        { begrip: 'Theoretisch perspectief', definitie: 'een basisbeeld dat het denken en het onderzoek stuurt' },
        { begrip: 'Manifeste en latente functies', definitie: 'de bedoelde tegenover de onbedoelde gevolgen van een sociaal onderdeel; ongewenste gevolgen heten dysfuncties' },
        { begrip: 'Presentation of self (Goffman)', definitie: 'het gebruik van symbolen om een beeld van jezelf te projecteren, als een optreden op een podium' },
        { begrip: 'Glocalisering', definitie: 'de lokale reactie op globale veranderingen' }
      ]}
    ]
  },

  {
    id: 'toepassen', titel: 'Toepassen',
    blokken: [
      { type: 'stappen', titel: 'Hoe je een verschijnsel sociologisch analyseert',
        items: [
          { titel: '1. Beschrijf het verschijnsel zo feitelijk mogelijk', tekst: 'Nog geen verklaring, alleen wat er te zien is. Wie doet wat, waar, hoe vaak.' },
          { titel: '2. Vraag: is dit een trouble of een issue?', tekst: 'Gaat het om losse gevallen of om een patroon dat zich herhaalt over veel mensen heen? Dat bepaalt op welk niveau je verder zoekt.' },
          { titel: '3. Kijk erdoorheen (Berger)', tekst: 'Wat is de vanzelfsprekende uitleg, en wat zit daaronder? Formuleer minstens één verklaring die niet over individuele keuze gaat.' },
          { titel: '4. Zet er drie brillen op', tekst: 'Wat zou een functionalist zeggen dat dit bijdraagt aan het geheel? Welke groepen strijden hier volgens een conflicttheoreticus om wat? Welke betekenissen construeren de betrokkenen zelf?' },
          { titel: '5. Benoem de blinde vlek', tekst: 'Elke bril heeft een bekende kritiek. Zeg welke je gebruikt en wat je daarmee niet ziet. Dat is precies wat een goed antwoord onderscheidt van een half antwoord.' }
        ] },

      { type: 'oefening', id: 'sp-c1-oef-1', niveau: 'basis',
        vraag: 'Een gemeente ziet dat jongeren in één wijk vaker betrokken zijn bij overlast dan elders. Formuleer dit eerst als personal trouble en daarna als public issue, en leg uit wat er verandert.',
        antwoord: 'Als personal trouble: deze specifieke jongeren maken slechte keuzes, hebben weinig zelfbeheersing, of komen uit gezinnen waar het misgaat. De verklaring ligt bij het individu en het gezin, en de interventie ligt dan ook daar: gesprekken, straffen, hulpverlening per geval.\n\nAls public issue: in deze wijk is de concentratie van overlast structureel hoger, en dat hangt samen met kenmerken van de wijk zelf, zoals werkloosheid, weinig voorzieningen voor jongeren, slechte woningvoorraad, weinig doorstroommogelijkheden en mogelijk een gespannen verhouding met de politie. Het patroon herhaalt zich over generaties jongeren heen, ook als de individuen wisselen.\n\nWat er verandert is het verklaringsniveau en daarmee het aangrijpingspunt van beleid. Bij de eerste formulering blijf je gevallen behandelen; bij de tweede vraag je waarom deze wijk zulke gevallen blijft produceren. Voor een safety- en securityprofessional is dat het verschil tussen symptoombestrijding en een interventie die kans van slagen heeft. Dit is precies Mills\u2019 punt: het gaat niet om de vraag of individuele verantwoordelijkheid bestaat, maar om de constatering dat je een terugkerend patroon niet verklaart met de eigenschappen van steeds andere individuen.' },

      { type: 'oefening', id: 'sp-c1-oef-2', niveau: 'basis',
        vraag: 'Leg met Mertons begrippenpaar uit welke manifeste functie, latente functie en dysfunctie cameratoezicht in een winkelstraat kan hebben.',
        antwoord: 'De manifeste, dus bedoelde, functie is het voorkomen en oplossen van winkeldiefstal en het vergroten van het veiligheidsgevoel: dat is waarvoor de camera\u2019s expliciet zijn opgehangen.\n\nEen latente, onbedoelde functie kan zijn dat ondernemers elkaar beter leren kennen doordat ze samen over het toezicht moeten beslissen, of dat de beelden achteraf worden gebruikt voor iets waarvoor ze niet waren bedoeld, zoals verkeersonderzoek of het monitoren van drukte.\n\nEen dysfunctie is een ongewenst gevolg: verplaatsing van de criminaliteit naar de zijstraten zonder camera, een gevoel van wantrouwen bij bezoekers, of juist een afname van informeel toezicht doordat mensen ervan uitgaan dat de camera het wel regelt. Dat laatste is sociologisch het interessantst, omdat de maatregel dan een deel van de veiligheid ondermijnt die hij moest vergroten.' },

      { type: 'oefening', id: 'sp-c1-oef-3', niveau: 'gevorderd',
        vraag: 'De slide over de global village stelt dat 20 van de 100 mensen 80% van het inkomen bezitten, en vraagt welke structurele krachten die verdeling produceren en in stand houden. Beantwoord die vraag vanuit conflicttheorie, en leg daarna uit wat een functionalist hierop zou tegenwerpen.',
        antwoord: 'Vanuit conflicttheorie is deze verdeling geen toevallige uitkomst maar het resultaat van een strijd om schaarse middelen waarin sommige groepen structureel in het voordeel zijn. Bezit van kapitaal levert opnieuw inkomen op, wat de voorsprong vergroot; de regels van handel, belasting en eigendom worden mede vastgesteld door partijen die belang hebben bij het behoud van hun positie; en toegang tot onderwijs, waarvan de slide zegt dat maar 8 van de 100 hoger onderwijs bereiken, werkt als filter dat de verdeling doorgeeft aan de volgende generatie. In de verbrede versie van conflicttheorie speelt niet alleen klasse mee maar ook gender, ras en de nawerking van kolonisatie, wat verklaart waarom de verdeling ook geografisch zo scheef is.\n\nEen functionalist zou tegenwerpen dat ongelijke beloning een functie vervult: het motiveert mensen om lang te studeren en moeilijke, belangrijke posities in te nemen, en houdt zo het geheel draaiend. Vanuit dat perspectief is stratificatie een mechanisme dat talent naar de plekken leidt waar het het meeste oplevert voor de samenleving.\n\nDe kritiek op het functionalisme is hier precies van toepassing: het glost ongelijkheid weg. Het verklaart waarom er verschil in beloning is, maar niet waarom dat verschil zo extreem is, waarom het zo sterk erfelijk blijkt, en waarom 50 van de 100 geen voedselzekerheid of vast werk hebben terwijl dat volgens de eigen logica niemand motiveert. Het sterkste antwoord gebruikt beide brillen en benoemt die grens.' },

      { type: 'oefening', id: 'sp-c1-oef-4', niveau: 'gevorderd',
        vraag: 'Leg uit waarom Lenski\u2019s laatste categorie, de post-industriële samenleving, met "netwerken, risico en surveillance" wordt omschreven, en wat dat betekent voor jouw vakgebied.',
        antwoord: 'Bij Lenski verandert het karakter van een samenleving met haar technologie. Bij jagers en verzamelaars, tuinbouw, landbouw en industrie draait de kerntechnologie steeds om het produceren van goederen: gereedschap, land en vee, landbouwtechniek, machines. In de post-industriële samenleving is de kerntechnologie het verwerken van informatie, en dan verschuift wat schaars en waardevol is van goederen naar kennis, verbindingen en toegang.\n\nDaaruit volgen de drie woorden. Netwerken, omdat de samenleving zich organiseert in verbindingen in plaats van in vaste plaatsen en hiërarchieën. Risico, omdat de belangrijkste bedreigingen niet meer voortkomen uit natuurlijke schaarste maar uit onze eigen technologie en organisatie: ze zijn door mensen gemaakt, grootschalig en niet netjes begrensd. En surveillance, omdat een samenleving die op informatie draait ook op informatie stuurt, en dus toezicht ontwikkelt op wat mensen doen.\n\nVoor safety en security betekent dit dat je vakgebied geen tijdloos verschijnsel bestudeert maar een specifiek historisch type samenleving. Risico\u2019s beheersen, gegevens verzamelen en netwerken beveiligen zijn precies de kenmerkende bezigheden van dit stadium. Dat is ook waarom Lenski\u2019s schema in week 8 terugkomt bij de risicosamenleving: de theorie die je in week 1 als achtergrond krijgt, blijkt aan het eind de beschrijving van je eigen beroepspraktijk te zijn.' }
    ]
  },

  {
    id: 'checken', titel: 'Checken',
    blokken: [
      { type: 'quiz', titel: 'Check jezelf op college 1', vragen: [
        { vraag: 'Wat is volgens de slide de definitie van sociologie?',
          opties: ['De studie van individueel gedrag', 'De systematische studie van de menselijke samenleving', 'De studie van politieke systemen', 'De studie van culturele gebruiken'],
          juist: 1,
          uitleg: 'Het woord **systematisch** is het scharnier: het onderscheidt sociologie van gewone meningen over hoe mensen samenleven.' },
        { vraag: 'Wat stelt Lenski over socioculturele evolutie?',
          opties: ['Samenlevingen doorlopen altijd dezelfde vijf fasen in dezelfde tijd', 'Samenlevingen veranderen naarmate hun technologie verandert, en sneller naarmate er meer technologische informatie is', 'Samenlevingen veranderen vooral door oorlog', 'Samenlevingen veranderen door bevolkingsgroei'],
          juist: 1,
          uitleg: 'Technologie is bij Lenski de motor, en het tempo van verandering beweegt mee met de hoeveelheid beschikbare technologische informatie.' },
        { vraag: 'Wat is de eerste wijsheid van de sociologie volgens Berger?',
          opties: ['Alles hangt met alles samen', '"Things are not what they seem"', 'De mens is een sociaal dier', 'Structuur gaat boven handeling'],
          juist: 1,
          uitleg: 'Berger vergelijkt sociologie met het uitpakken van cadeautjes: onder elke laag zit een volgende.' },
        { vraag: 'Iemand raakt werkloos in een regio waar één op de vijf werkloos is. Hoe noemt Mills dat?',
          opties: ['Alleen een personal trouble', 'Een public issue', 'Een latente functie', 'Social action'],
          juist: 1,
          uitleg: 'Bij die schaal verklaar je het niet meer uit de eigenschappen van de persoon; het is een kenmerk van de structuur geworden.' },
        { vraag: 'Welk perspectief werkt op microniveau?',
          opties: ['Functionalisme', 'Conflicttheorie', 'Symbolisch interactionisme', 'Alle drie'],
          juist: 2,
          uitleg: 'Weber en Goffman kijken naar alledaagse interactie en betekenisgeving; de andere twee kijken naar de samenleving als geheel.' },
        { vraag: 'Wat is een latente functie?',
          opties: ['Een ongewenst gevolg', 'Een bedoeld gevolg', 'Een onbedoeld gevolg', 'Een gevolg dat nooit optreedt'],
          juist: 2,
          uitleg: 'Onbedoeld is niet hetzelfde als ongewenst: dat laatste heet bij Merton een **dysfunctie**.' },
        { vraag: 'Wat is de standaardkritiek op het functionalisme?',
          opties: ['Het verliest grotere structuren uit het oog', 'Het praat ongelijkheid binnen de samenleving weg', 'Het praat gedeelde waarden weg', 'Het is niet empirisch toetsbaar'],
          juist: 1,
          uitleg: 'Wie de samenleving als samenwerkend geheel beschrijft, heeft moeite met de vraag voor wie dat geheel eigenlijk werkt.' },
        { vraag: 'Wat betekent glocalisering?',
          opties: ['De wereldwijde verspreiding van één cultuur', 'De lokale reactie op globale veranderingen', 'Het verdwijnen van landsgrenzen', 'Lokale politiek die mondiaal wordt'],
          juist: 1,
          uitleg: 'Een mondiale trend landt overal net anders, en juist die vertaalslag is het onderzoeksobject.' },
        { vraag: 'Waarom wordt Durkheims studie naar zelfdoding in dit college genoemd?',
          opties: ['Omdat het de eerste sociologische studie ooit was', 'Als voorbeeld van een theorie die een sociaal feit aan een sociale oorzaak koppelt', 'Omdat het functionalisme ermee werd weerlegd', 'Als voorbeeld van symbolisch interactionisme'],
          juist: 1,
          uitleg: 'Hij verbindt sociale integratie aan het risico, in plaats van de verklaring bij het individu te zoeken. Dat is wat een theorie in sociologische zin doet.' }
      ]},

      { type: 'bronnen', items: [
        { apa: 'Abanes, M. S. (2026). Society & Politics, Lecture 1 [Collegeslides]. De Haagse Hogeschool.' },
        { apa: 'Macionis, J. J., & Plummer, K. (2012). Sociology: A global introduction (5th ed., Ch. 1, 2, 4). Pearson Education.' }
      ]},

      { type: 'preview', titel: 'Volgende keer', vakId: 'society-politics', lesId: 'slides-1',
        tekst: 'Hoofdstuk 7: de sociale constructie van het dagelijks leven. Daar wordt het microniveau van vandaag uitgewerkt: hoe de werkelijkheid die zo vanzelfsprekend voelt, in interactie wordt gemaakt.',
        punten: ['Lees Macionis & Plummer hoofdstuk 7', 'De opdracht over de toepassing van sociologische perspectieven hoort bij die week'] }
    ]
  }
];

/* Het onderdeel dat op de vakpagina verschijnt, onder Colleges. */
(function(){
  if (typeof DATA === 'undefined') return;

  var SLIDES = [
    { id: 'slides-1', groep: 'Lecture slides',
      titel: 'Sessie 1 \u00b7 Introductie en sociologische perspectieven', duur: 60 }
  ];

  function isSp(vak){
    if (!vak) return false;
    if (vak.id === 'society-politics') return true;
    var naam = (vak.naam || '').toLowerCase();
    return naam.indexOf('society') > -1 && naam.indexOf('politic') > -1;
  }

  function zet(){
    DATA.semesters.forEach(function(sem){
      var gevonden = false;
      sem.vakken.forEach(function(vak){
        if (!isSp(vak)) return;
        gevonden = true;
        var rest = (vak.lessen || []).filter(function(l){ return l.groep !== 'Lecture slides'; });
        vak.lessen = rest.concat(SLIDES);
      });
      if (!gevonden && sem.id === DATA.actiefSemester) {
        sem.vakken.push({ id: 'society-politics', naam: 'Society & Politics', lessen: SLIDES.slice() });
      }
    });
  }

  zet();
  if (typeof opFeed === 'function') opFeed(zet);
})();
