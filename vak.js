/* ============================================================
   vak.js — homescreen per vak

   Toont voor één vak: de hoofdstukken met voortgang, je eigen
   deadlines (bewaard in deze browser) en de course manual.

   Openen via: vak.html?vak=<vakId>
   ============================================================ */
(function(){
  var p = new URLSearchParams(window.location.search);
  var vakParam = p.get('vak') || '';
  var vak, sem;
  var opgelost = false;

  /* ---------- deadlines: opslag per vak ---------- */
  function dlSleutel(){ return 'ssms-deadlines-' + vakParam; }

  function leesDeadlines(){
    try {
      var ruw = localStorage.getItem(dlSleutel());
      return ruw ? JSON.parse(ruw) : [];
    } catch(e){ return []; }
  }
  function schrijfDeadlines(lijst){
    try { localStorage.setItem(dlSleutel(), JSON.stringify(lijst)); } catch(e){}
  }

  function datumNL(iso){
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function dagenTot(iso){
    if (!iso) return null;
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return null;
    var vandaag = new Date();
    vandaag.setHours(0,0,0,0);
    return Math.round((d - vandaag) / 86400000);
  }

  function toonDeadlines(){
    var lijst = leesDeadlines().slice().sort(function(a,b){
      return (a.datum || '9999').localeCompare(b.datum || '9999');
    });
    var el = document.getElementById('deadlines');
    if (!lijst.length) {
      el.innerHTML = '<p class="noot" style="margin:0;">Nog geen deadlines voor dit vak. ' +
        'Voeg er hieronder een toe.</p>';
      return;
    }
    el.innerHTML = lijst.map(function(d, i){
      var dagen = dagenTot(d.datum);
      var extra = '';
      if (dagen !== null) {
        if (dagen < 0) extra = ' · verlopen';
        else if (dagen === 0) extra = ' · vandaag';
        else if (dagen === 1) extra = ' · morgen';
        else if (dagen <= 14) extra = ' · over ' + dagen + ' dagen';
      }
      return '<div class="dl-rij">' +
        '<span>' + esc(d.titel) + '</span>' +
        '<span class="dl-datum">' + datumNL(d.datum) + extra + '</span>' +
        '<button type="button" data-dl="' + i + '" aria-label="Verwijderen" title="Verwijderen">×</button>' +
        '</div>';
    }).join('');
  }

  function koppelDeadlineFormulier(){
    document.getElementById('dlToevoegen').addEventListener('click', function(){
      var titel = document.getElementById('dlTitel').value.trim();
      var datum = document.getElementById('dlDatum').value;
      if (!titel) return;
      var lijst = leesDeadlines();
      lijst.push({ titel: titel, datum: datum });
      schrijfDeadlines(lijst);
      document.getElementById('dlTitel').value = '';
      document.getElementById('dlDatum').value = '';
      toonDeadlines();
    });

    document.getElementById('dlTitel').addEventListener('keydown', function(e){
      if (e.key === 'Enter') document.getElementById('dlToevoegen').click();
    });

    document.getElementById('deadlines').addEventListener('click', function(e){
      var knop = e.target.closest('[data-dl]');
      if (!knop) return;
      var lijst = leesDeadlines().slice().sort(function(a,b){
        return (a.datum || '9999').localeCompare(b.datum || '9999');
      });
      lijst.splice(+knop.getAttribute('data-dl'), 1);
      schrijfDeadlines(lijst);
      toonDeadlines();
    });
  }

  /* ---------- course manual ---------- */
  function toonManual(){
    var blok = document.getElementById('manualBlok');
    var man = (typeof VAK_MANUAL !== 'undefined') ? VAK_MANUAL[vakParam] : null;
    if (!man) {
      blok.querySelector('#manual').innerHTML =
        '<p class="noot" style="margin:0;">Nog geen course manual toegevoegd voor dit vak.</p>';
      return;
    }
    var rijen = (man.regels || []).map(function(r){
      return '<li><strong>' + esc(r.label) + '</strong> ' + esc(r.waarde) + '</li>';
    }).join('');
    blok.querySelector('#manual').innerHTML =
      (man.intro ? '<p style="margin:0 0 14px;font-size:13.5px;line-height:1.6;">' + esc(man.intro) + '</p>' : '') +
      '<ul class="manual-lijst">' + rijen + '</ul>' +
      (man.url ? '<p style="margin:14px 0 0;"><a href="' + esc(man.url) +
        '" target="_blank" rel="noopener">Open de volledige handleiding &rarr;</a></p>' : '');
  }

  /* ---------- hoofdstukken ---------- */
  function toonHoofdstukken(){
    var el = document.getElementById('hoofdstukken');
    if (!vak.lessen || !vak.lessen.length) {
      el.innerHTML = '<p class="noot" style="margin:0;">Dit vak heeft nog geen hoofdstukken.</p>';
      return;
    }
    el.innerHTML = vak.lessen.map(function(l, i){
      var af = isAf(vak, l);
      var uit = typeof lesUitgewerkt === 'function' ? lesUitgewerkt(vak, l) : true;
      return '<a class="hfd-rij' + (af ? ' af' : '') + '" href="' + lesUrl(vak, l) + '">' +
        '<span class="mini-vink">' + (af ? '✓' : (i + 1)) + '</span>' +
        '<span>' + esc(l.titel) +
        (uit ? '' : ' <span class="niet-uit">nog leeg</span>') + '</span></a>';
    }).join('');

    var af = vak.lessen.filter(function(l){ return isAf(vak, l); }).length;
    var pct = Math.round(af / vak.lessen.length * 100);
    document.getElementById('vakBalk').style.width = pct + '%';
    document.getElementById('vakVoortgang').textContent =
      af + ' van ' + vak.lessen.length + ' hoofdstukken afgerond · ' + pct + '%';
  }

  /* ---------- opstarten ---------- */
  function start(){
    if (opgelost) return;
    var hit = vindVak(vakParam);
    if (!hit) return wachtOfMeld();
    vak = hit.vak; sem = hit.sem;
    opgelost = true;

    document.title = vak.naam + ' · SSMS Leeromgeving';
    document.getElementById('vakKicker').textContent = sem.naam || 'Semester';
    document.getElementById('vakTitel').textContent = vak.naam;
    document.getElementById('vakMeta').innerHTML =
      '<span class="pil">' + vak.lessen.length + ' hoofdstukken</span>';

    toonHoofdstukken();
    toonDeadlines();
    toonManual();
    koppelDeadlineFormulier();
  }

  function wachtOfMeld(){
    var bezig = typeof ROOSTER_STATUS !== 'undefined' && ROOSTER_STATUS.staat === 'laden';
    document.getElementById('vakTitel').textContent = bezig ? 'Vak laden…' : 'Dit vak bestaat niet';
    document.getElementById('hoofdstukken').innerHTML = bezig
      ? '<span class="hint">Je rooster wordt opgehaald…</span>'
      : '<a class="btn" href="index.html">Terug naar het overzicht</a>';
  }

  start();
  if (typeof opFeed === 'function') opFeed(function(){
    if (opgelost) return;
    start();
    if (!opgelost) wachtOfMeld();
  });
})();
