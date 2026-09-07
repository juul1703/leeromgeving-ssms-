/* ============================================================
   Roosterkoppeling — leest je persoonlijke iCal-feed van
   mytimetable.hhs.nl en zet die om in de momenten die het
   homescreen gebruikt.

   Werkt zo:
   1. probeert de feed direct op te halen
   2. lukt dat niet (CORS), dan via een proxy uit PROXIES
   3. lukt niets, dan wordt de laatst opgehaalde versie uit de
      cache gebruikt — en anders het handmatige ROOSTER_WEEK
   ============================================================ */

/* Je feed-adres staat NIET in de code, maar in je browser (localStorage).
   Zo kun je de repo publiek zetten zonder je persoonlijke link te delen:
   de eerste keer vraagt de site erom, daarna onthoudt hij hem.

   Wil je hem toch vast in de code zetten (bv. privérepo), zet hem dan hier:
   var FEED_STANDAARD = 'https://mytimetable.hhs.nl/ical?eu=…&h=…';  */
var FEED_STANDAARD = '';

function feedUrl(){
  try { return localStorage.getItem('ssms-feed') || FEED_STANDAARD; } catch(e){ return FEED_STANDAARD; }
}

function zetFeedUrl(url){
  try {
    if (url) localStorage.setItem('ssms-feed', url.trim());
    else localStorage.removeItem('ssms-feed');
    localStorage.removeItem('ssms-rooster-cache');
  } catch(e){}
}

/* Alleen een mytimetable-achtige iCal-link accepteren. */
function geldigeFeed(url){
  return /^https?:\/\/[^\s]+/i.test(String(url || '').trim()) &&
    /ical|\.ics|timetable/i.test(String(url));
}

/* Browsers mogen een andere site niet zomaar uitlezen. Deze doorgeefluiken
   halen de feed op en sturen hem door met de juiste toestemming. */
var PROXIES = [
  function(u){ return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u); },
  function(u){ return 'https://corsproxy.io/?' + encodeURIComponent(u); },
  function(u){ return 'https://r.jina.ai/' + u; }
];

/* Vakken uit je rooster worden automatisch kaarten op het homescreen.
   KOPPELING is alleen nodig als je een roostertitel aan een vak wil vastpinnen
   dat je zelf in app.js hebt gezet — bijvoorbeeld omdat je daar al lessen bij hebt.
   Links: een stukje tekst uit de roostertitel (kleine letters). Rechts: het vak-id. */
var KOPPELING = {
  // 'psychology': 'psychology-crime',
};

/* Vakken die het rooster onder twee namen kent (afkorting én voluit).
   Links: wat er in het rooster staat (kleine letters). Rechts: de naam die jij wil zien. */
var ALIASSEN = {
  'drm': 'Demystifying Research Methods',
  'drm workshop': 'Demystifying Research Methods',
  'intro ssms': 'Intro to Safety & Security',
  'intro to safety & security': 'Intro to Safety & Security',
  'study skills': 'Study Skills',
  'professional skills': 'Professional Skills'
};

/* Woorden die geen deel van een vaknaam zijn en uit de titel worden geknipt. */
var RUIS = [
  'hoorcollege','werkcollege','werkgroep','practicum','seminar','lecture','tutorial','lab',
  'tentamen','herkansing','toets','exam','begeleiding','coaching','instructie','presentatie',
  'online','hybride','groep','klas','les','bijeenkomst','college'
];

var ROOSTER_STATUS = { staat: 'laden', tijd: null, aantal: 0 };
var ROOSTER_FEED = null; // array met {start: Date, eind: Date, titel, plek, vakId}

/* ---------- iCal parsen ---------- */
function ontvouw(tekst){
  // Regels langer dan 75 tekens worden in iCal afgebroken en beginnen dan met een spatie.
  return tekst.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
}

function icalDatum(waarde, param){
  var m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(waarde.trim());
  if (!m) return null;
  var j = +m[1], mnd = +m[2] - 1, d = +m[3];
  var u = +(m[4] || 0), min = +(m[5] || 0), s = +(m[6] || 0);
  if (m[7]) return new Date(Date.UTC(j, mnd, d, u, min, s)); // UTC-tijd
  return new Date(j, mnd, d, u, min, s); // lokale tijd (TZID van de school = onze tijdzone)
}

function ontsnapping(s){
  return String(s || '').replace(/\\n/gi, ' ').replace(/\\,/g, ',')
    .replace(/\\;/g, ';').replace(/\\\\/g, '\\').trim();
}

function parseIcal(tekst){
  var regels = ontvouw(tekst).split('\n');
  var uit = [], huidig = null;
  for (var i = 0; i < regels.length; i++) {
    var r = regels[i];
    if (r.indexOf('BEGIN:VEVENT') === 0) { huidig = {}; continue; }
    if (r.indexOf('END:VEVENT') === 0) {
      if (huidig && huidig.start) uit.push(huidig);
      huidig = null; continue;
    }
    if (!huidig) continue;
    var dp = r.indexOf(':');
    if (dp < 0) continue;
    var kop = r.slice(0, dp), waarde = r.slice(dp + 1);
    var naam = kop.split(';')[0].toUpperCase();
    if (naam === 'DTSTART') huidig.start = icalDatum(waarde, kop);
    else if (naam === 'DTEND') huidig.eind = icalDatum(waarde, kop);
    else if (naam === 'SUMMARY') huidig.titel = ontsnapping(waarde);
    else if (naam === 'LOCATION') huidig.plek = ontsnapping(waarde);
    else if (naam === 'DESCRIPTION') huidig.omschrijving = ontsnapping(waarde);
  }
  return uit.filter(function(e){ return e.start; }).map(function(e){
    return {
      start: e.start,
      eind: e.eind || new Date(e.start.getTime() + 90 * 60000),
      titel: e.titel || 'Onderwijsmoment',
      plek: e.plek || '—',
      omschrijving: e.omschrijving || '',
      vakId: koppelVak(e.titel + ' ' + (e.omschrijving || ''))
    };
  }).sort(function(a, b){ return a.start - b.start; });
}

function koppelVak(tekst){
  var t = String(tekst || '').toLowerCase();
  var keys = Object.keys(KOPPELING);
  // langste treffer eerst, dat is preciezer
  keys.sort(function(a, b){ return b.length - a.length; });
  for (var i = 0; i < keys.length; i++) if (t.indexOf(keys[i]) > -1) return KOPPELING[keys[i]];
  return null;
}

/* ---------- soort moment uit de titel halen ---------- */
function soortUit(titel){
  var t = String(titel).toLowerCase();
  if (t.indexOf('hoorcollege') > -1 || t.indexOf('lecture') > -1) return 'hoorcollege';
  if (t.indexOf('werkgroep') > -1 || t.indexOf('seminar') > -1) return 'werkgroep';
  if (t.indexOf('practicum') > -1 || t.indexOf('lab') > -1) return 'practicum';
  if (t.indexOf('tentamen') > -1 || t.indexOf('exam') > -1 || t.indexOf('toets') > -1) return 'toets';
  if (t.indexOf('begeleiding') > -1 || t.indexOf('coach') > -1) return 'begeleiding';
  return 'les';
}

/* ---------- cache ---------- */
function bewaarFeed(events){
  try {
    localStorage.setItem('ssms-rooster-cache', JSON.stringify({
      opgehaald: Date.now(),
      events: events.map(function(e){
        return { start: e.start.toISOString(), eind: e.eind.toISOString(),
                 titel: e.titel, plek: e.plek, omschrijving: e.omschrijving, vakId: e.vakId };
      })
    }));
  } catch(e){}
}

function leesCache(){
  try {
    var raw = localStorage.getItem('ssms-rooster-cache');
    if (!raw) return null;
    var d = JSON.parse(raw);
    return {
      opgehaald: d.opgehaald,
      events: d.events.map(function(e){
        return { start: new Date(e.start), eind: new Date(e.eind), titel: e.titel,
                 plek: e.plek, omschrijving: e.omschrijving, vakId: e.vakId };
      })
    };
  } catch(e){ return null; }
}

/* ---------- ophalen ---------- */
function haalTekst(url){
  return fetch(url, { cache: 'no-store' }).then(function(res){
    if (!res.ok) throw new Error(res.status);
    return res.text();
  });
}

function haalRooster(){
  var url = feedUrl();
  if (!url) return Promise.reject(new Error('geen feed'));
  var pogingen = [url].concat(PROXIES.map(function(p){ return p(url); }));
  var index = 0;

  function volgende(){
    if (index >= pogingen.length) return Promise.reject(new Error('geen route'));
    var url = pogingen[index++];
    return haalTekst(url).then(function(tekst){
      if (tekst.indexOf('BEGIN:VCALENDAR') < 0) throw new Error('geen ical');
      return tekst;
    }).catch(volgende);
  }

  return volgende();
}

/* Wordt aangeroepen zodra de feed verandert (cache én live).
   Bouwt de vakken op en laat de pagina zich verversen — welke pagina dan ook. */
var FEED_LUISTERAARS = [];
function opFeed(fn){
  FEED_LUISTERAARS.push(fn);
  if (ROOSTER_FEED && typeof DATA !== 'undefined') { autoVakken(); fn(); }
}

function feedKlaar(){
  // DATA komt uit app.js, dat later in de pagina wordt geladen; dan wachten we even.
  if (typeof DATA === 'undefined') return;
  autoVakken();
  FEED_LUISTERAARS.forEach(function(fn){ try { fn(); } catch(e){} });
  if (typeof render === 'function' && document.getElementById('semesters')) render();
}
document.addEventListener('DOMContentLoaded', feedKlaar);

function startRooster(){
  if (!feedUrl()) {
    ROOSTER_STATUS = { staat: 'geen-feed', tijd: null, aantal: 0 };
    document.addEventListener('DOMContentLoaded', feedKlaar);
    return;
  }
  var cache = leesCache();
  if (cache && cache.events.length) {
    ROOSTER_FEED = cache.events;
    koppelFeed();
    ROOSTER_STATUS = { staat: 'cache', tijd: cache.opgehaald, aantal: cache.events.length };
    feedKlaar();
  }

  haalRooster().then(function(tekst){
    var events = parseIcal(tekst);
    if (!events.length) throw new Error('leeg');
    ROOSTER_FEED = events;
    koppelFeed();
    ROOSTER_STATUS = { staat: 'live', tijd: Date.now(), aantal: events.length };
    bewaarFeed(events);
  }).catch(function(){
    ROOSTER_STATUS = ROOSTER_FEED
      ? { staat: 'cache', tijd: ROOSTER_STATUS.tijd, aantal: ROOSTER_STATUS.aantal }
      : { staat: 'fout', tijd: null, aantal: 0 };
  }).then(feedKlaar);
}

/* ---------- vaknaam uit een roostertitel halen ---------- */
function slug(s){
  return String(s).toLowerCase()
    .replace(/[àáâä]/g,'a').replace(/[èéêë]/g,'e').replace(/[ìíîï]/g,'i')
    .replace(/[òóôö]/g,'o').replace(/[ùúûü]/g,'u')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0, 42);
}

/* "society & politics" -> "Society & Politics" */
function titelCasing(s){
  var klein = ['en','of','the','a','an','in','to','for','van','de','het','op','bij','&'];
  return String(s).split(/\s+/).map(function(w, i){
    var laag = w.toLowerCase();
    if (w.length > 1 && w === w.toUpperCase() && /[A-Z]/.test(w)) return w; // afkorting laten staan
    if (i > 0 && klein.indexOf(laag) > -1) return laag;
    return laag.charAt(0).toUpperCase() + laag.slice(1);
  }).join(' ');
}

/* Is 'kort' de afkorting van 'lang'? (DRM ↔ Demystifying Research Methods) */
function isAfkortingVan(kort, lang){
  var k = kort.replace(/[^a-z]/gi, '').toLowerCase();
  if (k.length < 2 || k.length > 5) return false;
  var initialen = lang.split(/\s+/).filter(function(w){ return /[a-z]/i.test(w); })
    .map(function(w){ return w[0].toLowerCase(); }).join('');
  return initialen.indexOf(k) === 0 || k === initialen;
}

function vakNaamUit(titel){
  var t = String(titel || '');
  // splits op scheidingstekens die HHS gebruikt en pak het langste zinvolle stuk
  var delen = t.split(/\s[-–|/]\s|,|\(|\)/).map(function(d){ return d.trim(); }).filter(Boolean);
  var beste = '';
  delen.forEach(function(d){
    var schoon = d
      .replace(/\b[A-Z]{2,}[-_ ]?\d{2,}[A-Za-z0-9-]*\b/g, '') // vakcodes zoals SSMS-1234
      .replace(/\b\d{4,}\b/g, '')
      .replace(/\s+/g, ' ').trim();
    var laag = schoon.toLowerCase();
    var isRuis = RUIS.some(function(w){ return laag === w || laag.indexOf(w) === 0 && laag.length < w.length + 4; });
    if (!isRuis && schoon.length > beste.length) beste = schoon;
  });
  if (!beste) beste = t.trim();
  // losse ruiswoorden aan het eind weghalen
  RUIS.forEach(function(w){
    beste = beste.replace(new RegExp('\\s*\\b' + w + '\\b\\s*$', 'i'), '').trim();
  });
  beste = beste.replace(/\s+/g, ' ').trim();
  if (!beste) return 'Onbekend vak';
  var alias = ALIASSEN[beste.toLowerCase()];
  return alias || titelCasing(beste);
}

/* Zet elk vak uit je rooster als kaart in het actieve semester.
   Vakken die je zelf in app.js hebt gezet blijven staan en worden niet gedupliceerd. */
/* Elk moment in de feed een vak-id geven. Draait na élke keer dat de feed
   verandert (cache én live), zodat de koppeling nooit op oude objecten blijft hangen. */
function koppelFeed(){
  if (!ROOSTER_FEED) return;

  var namen = [];
  ROOSTER_FEED.forEach(function(e){
    var naam = vakNaamUit(e.titel);
    if (namen.indexOf(naam) < 0) namen.push(naam);
  });

  // afkortingen samenvouwen met hun volledige naam (DRM -> Demystifying Research Methods)
  var vervang = {};
  namen.forEach(function(kort){
    namen.forEach(function(lang){
      if (kort !== lang && lang.length > kort.length && isAfkortingVan(kort, lang)) vervang[kort] = lang;
    });
  });

  ROOSTER_FEED.forEach(function(e){
    var naam = vakNaamUit(e.titel);
    e.vakNaam = vervang[naam] || naam;
    e.vakId = slug(e.vakNaam);
  });
}

/* Vakken uit de feed als kaarten neerzetten, met elk college als afvinkbare les.
   Idempotent: bij een nieuwe ophaal worden bestaande rooster-vakken bijgewerkt,
   niet gedupliceerd. Vakken die jij zelf in app.js zet blijven ongemoeid. */
function autoVakken(){
  if (!ROOSTER_FEED || typeof DATA === 'undefined') return;
  var sem = DATA.semesters.filter(function(s){ return s.id === DATA.actiefSemester; })[0];
  if (!sem) return;
  koppelFeed();

  var eigen = {};
  DATA.semesters.forEach(function(s){
    s.vakken.forEach(function(v){ if (!v.uitRooster) eigen[v.id] = v; });
  });

  var perVak = {};
  ROOSTER_FEED.forEach(function(e){
    if (!e.vakId || eigen[e.vakId]) return; // jouw eigen vak met eigen lessen wint
    if (!perVak[e.vakId]) perVak[e.vakId] = { id: e.vakId, naam: e.vakNaam, lessen: [], uitRooster: true };
    perVak[e.vakId].lessen.push(lesUitMoment(e));
  });

  Object.keys(perVak).forEach(function(id){
    var v = perVak[id], zien = {};
    v.lessen = v.lessen.filter(function(l){
      if (zien[l.id]) return false;
      zien[l.id] = true; return true;
    }).sort(function(a, b){ return a.id < b.id ? -1 : 1; });
  });

  // bestaande rooster-vakken vervangen door de verse versie, rest laten staan
  sem.vakken = sem.vakken.filter(function(v){ return !v.uitRooster; });
  Object.keys(perVak).forEach(function(id){ sem.vakken.push(perVak[id]); });
  sem.vakken.sort(function(a, b){ return a.naam.localeCompare(b.naam, 'nl'); });
}

/* Elk college in je rooster wordt een les die je kunt afvinken. */
function lesUitMoment(e){
  var d = e.start;
  var pad = function(n){ return (n < 10 ? '0' : '') + n; };
  var id = '' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes());
  var dag = d.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });
  var soort = soortUit(e.titel);
  return {
    id: id,
    titel: soort.charAt(0).toUpperCase() + soort.slice(1) + ' · ' + dag,
    duur: Math.max(15, Math.round((e.eind - e.start) / 60000)),
    plek: e.plek,
    datum: d.toISOString(),
    inhoud: '<h2>' + soort.charAt(0).toUpperCase() + soort.slice(1) + '</h2>' +
      '<p>' + dag + ' · ' + d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) +
      '–' + e.eind.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) +
      ' · ' + (e.plek || 'locatie onbekend') + '</p>' +
      (e.omschrijving ? '<p>' + e.omschrijving + '</p>' : '') +
      '<h2>Aantekeningen</h2><p>Schrijf rechts wat je uit dit college meeneemt. ' +
      'Vink het college af zodra je het hebt bijgewerkt.</p>'
  };
}

/* ---------- hulp voor het homescreen ---------- */
function zelfdeDag(a, b){
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function feedVoorDag(datum){
  if (!ROOSTER_FEED) return null;
  return ROOSTER_FEED.filter(function(e){ return zelfdeDag(e.start, datum); });
}

/* Het eerstvolgende moment na 'nu', ongeacht welke dag. */
function feedHierna(nu){
  if (!ROOSTER_FEED) return null;
  return ROOSTER_FEED.filter(function(e){ return e.eind > nu; })[0] || null;
}

/* Toetsen en tentamens uit je rooster, als deadline.
   Meerdere zittingen van dezelfde toets (verschillende zalen of dagen naast elkaar)
   worden één regel, op de eerste datum. */
function toetsenUitRooster(nu){
  if (!ROOSTER_FEED) return [];
  nu = nu || new Date();

  var perToets = {};
  ROOSTER_FEED.forEach(function(e){
    if (e.start <= nu || soortUit(e.titel) !== 'toets') return;
    var sleutel = (e.vakId || slug(e.titel)) + '|' + soortLabel(e.titel);
    var dagen = Math.ceil((e.start - nu) / 86400000);
    if (!perToets[sleutel] || dagen < perToets[sleutel].dagen) {
      var hit = (typeof vindVak === 'function' && e.vakId) ? vindVak(e.vakId) : null;
      perToets[sleutel] = {
        titel: soortLabel(e.titel),
        vak: (hit ? hit.vak.naam : e.vakNaam) || 'uit je rooster',
        vakId: e.vakId || null,
        dagen: dagen,
        datum: e.start
      };
    }
  });

  return Object.keys(perToets).map(function(k){ return perToets[k]; })
    .sort(function(a, b){ return a.dagen - b.dagen; });
}

/* "Professional skills exam - RZ3.25" -> "Tentamen" / "Herkansing" / "Toets" */
function soortLabel(titel){
  var t = String(titel).toLowerCase();
  if (t.indexOf('herkansing') > -1 || t.indexOf('resit') > -1) return 'Herkansing';
  if (t.indexOf('tentamen') > -1 || t.indexOf('exam') > -1) return 'Tentamen';
  return 'Toets';
}

function statusTekst(){
  var t = ROOSTER_STATUS.tijd ? new Date(ROOSTER_STATUS.tijd) : null;
  var klok = t ? t.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : '';
  if (ROOSTER_STATUS.staat === 'live') return 'rooster bijgewerkt · ' + klok;
  if (ROOSTER_STATUS.staat === 'cache') return 'offline · rooster van ' + klok;
  if (ROOSTER_STATUS.staat === 'laden') return 'rooster ophalen…';
  if (ROOSTER_STATUS.staat === 'geen-feed') return 'rooster nog niet gekoppeld';
  return 'rooster niet bereikbaar · handmatig weekrooster';
}

startRooster();
