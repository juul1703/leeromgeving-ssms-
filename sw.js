/* Offline-cache voor de leeromgeving.

   Netwerk eerst, cache als vangnet. Je krijgt altijd de nieuwste versie
   van een bestand zolang je verbinding hebt, en pas als die er niet is
   valt hij terug op wat er lokaal bewaard is.

   De vorige opzet deed het omgekeerd, cache eerst. Daardoor bleef een
   telefoon oude bestanden tonen ook nadat er allang een nieuwe versie
   online stond, en hielp afsluiten en opnieuw openen niet.

   VERSIE hoeft nu niet meer per se omhoog bij elke wijziging, maar het
   blijft handig: het ruimt de oude cache op. */
var VERSIE = 'ssms-v29';
var BESTANDEN = ['./', './index.html', './les.html', './vak.html', './styles.css', './app.js',
  './rooster.js', './les.js', './lesextra.js', './vak.js', './lesblokken.js', './lesstof.js',
  './ssms-inhoud.js', './society-slides.js', './intro-boek.js', './manifest.webmanifest'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(VERSIE).then(function(c){ return c.addAll(BESTANDEN); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== VERSIE; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  // Het rooster nooit uit de cache serveren: dat regelt rooster.js zelf.
  if (e.request.url.indexOf('mytimetable') > -1 || e.request.url.indexOf('ical') > -1) return;
  // Pdf's (course manuals) laten we helemaal met rust.
  if (/\.pdf($|\?)/i.test(e.request.url)) return;

  e.respondWith(
    fetch(e.request).then(function(res){
      /* Gelukt: dit is de verse versie. Meteen als vangnet bewaren voor
         de volgende keer dat je geen verbinding hebt. */
      var kopie = res.clone();
      caches.open(VERSIE).then(function(c){ c.put(e.request, kopie); });
      return res;
    }).catch(function(){
      /* Geen verbinding: pak wat er bewaard is, en anders het homescreen. */
      return caches.match(e.request).then(function(hit){
        return hit || caches.match('./index.html');
      });
    })
  );
});
