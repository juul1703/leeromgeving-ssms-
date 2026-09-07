/* Simpele offline-cache. Verhoog VERSIE na elke wijziging. */
var VERSIE = 'ssms-v7';
var BESTANDEN = ['./', './index.html', './les.html', './styles.css', './app.js', './rooster.js', './les.js', './lesblokken.js', './lesstof.js', './ssms-inhoud.js', './manifest.webmanifest'];

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
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(function(res){
        var kopie = res.clone();
        caches.open(VERSIE).then(function(c){ c.put(e.request, kopie); });
        return res;
      }).catch(function(){ return caches.match('./index.html'); });
    })
  );
});
