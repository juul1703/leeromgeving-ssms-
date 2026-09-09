/* ============================================================
   vak.js — homescreen per vak

   Toont voor één vak: de hoofdstukken met voortgang, je eigen
   deadlines (bewaard in deze browser), de voorbereiding voor het
   volgende college, de course manual (met knop naar de pdf en een
   samenvatting per onderdeel) en de studiegids-informatie.

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

  /* De voorbereiding voor het eerstvolgende college van dit vak, uit
     VAK_VOORBEREIDING. Read-only: dit komt uit het leesschema, niet van jou. */
  function voorbereidingRegel(){
    if (typeof voorbereidingDeadlines !== 'function') return '';
    var mijn = voorbereidingDeadlines(new Date()).filter(function(d){ return d.vakId === vakParam; })[0];
    if (!mijn) return '';
    var wanneer = mijn.dagen === 0 ? 'vandaag' : mijn.dagen === 1 ? 'morgen' : 'over ' + mijn.dagen + ' dagen';
    return '<div class="dl-rij voorbereiding">' +
      '<span>' + esc(mijn.titel) + '<span class="dl-soort voorbereiding">voorbereiding</span></span>' +
      '<span class="dl-datum">' + esc(wanneer) + '</span></div>';
  }

  function dlRij(d, i, klaar){
    var dagen = dagenTot(d.datum);
    var extra = '';
    if (dagen !== null && !klaar) {
      if (dagen < 0) extra = ' \u00b7 verlopen';
      else if (dagen === 0) extra = ' \u00b7 vandaag';
      else if (dagen === 1) extra = ' \u00b7 morgen';
      else if (dagen <= 14) extra = ' \u00b7 over ' + dagen + ' dagen';
    }
    return '<div class="dl-rij' + (klaar ? ' af' : '') + '">' +
      '<button type="button" class="dl-vink" data-dlvink="' + i + '" ' +
      'aria-label="' + (klaar ? 'Terugzetten' : 'Afvinken') + '" title="' +
      (klaar ? 'Terugzetten' : 'Afvinken') + '">' + (klaar ? '\u2713' : '') + '</button>' +
      '<span>' + esc(d.titel) + '</span>' +
      '<span class="dl-datum">' + datumNL(d.datum) + extra + '</span>' +
      '<button type="button" data-dl="' + i + '" aria-label="Verwijderen" title="Verwijderen">\u00d7</button>' +
      '</div>';
  }

  /* Gesorteerd op datum, maar met de oorspronkelijke plek in de opslag erbij,
     zodat afvinken en verwijderen het juiste item raken. */
  function gesorteerd(){
    return leesDeadlines().map(function(d, i){ return { d: d, i: i }; })
      .sort(function(a, b){ return (a.d.datum || '9999').localeCompare(b.d.datum || '9999'); });
  }

  function toonDeadlines(){
    var alles = gesorteerd();
    var open = alles.filter(function(x){ return !x.d.af; });
    var klaar = alles.filter(function(x){ return x.d.af; });
    var el = document.getElementById('deadlines');
    var voor = voorbereidingRegel();

    var lijst = open.length
      ? open.map(function(x){ return dlRij(x.d, x.i, false); }).join('')
      : '<p class="noot" style="margin:' + (voor ? '12px 0 0' : '0') + ';">' +
        'Nog geen eigen deadlines voor dit vak. Voeg er hieronder een toe; hij komt ook op je homescreen te staan.</p>';

    var archief = klaar.length
      ? '<details class="dl-archief"><summary>Afgerond <span>' + klaar.length + '</span></summary>' +
        klaar.map(function(x){ return dlRij(x.d, x.i, true); }).join('') + '</details>'
      : '';

    el.innerHTML = voor + lijst + archief;
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
      var vink = e.target.closest('[data-dlvink]');
      if (vink) {
        var lijst = leesDeadlines();
        var n = +vink.getAttribute('data-dlvink');
        if (lijst[n]) { lijst[n].af = !lijst[n].af; schrijfDeadlines(lijst); toonDeadlines(); }
        return;
      }
      var knop = e.target.closest('[data-dl]');
      if (!knop) return;
      var alles = leesDeadlines();
      alles.splice(+knop.getAttribute('data-dl'), 1);
      schrijfDeadlines(alles);
      toonDeadlines();
    });
  }

  /* ---------- course manual + studiegids ----------
     Eén blok: de knop naar de pdf, de kerngegevens, en daaronder alles per
     onderdeel uitklapbaar. De studiegids-onderdelen uit ssms-inhoud.js komen
     in dezelfde lijst te staan, zodat je niet twee bijna gelijke kaarten hebt. */
  function toonManual(){
    var blok = document.getElementById('manualBlok');
    var man = (typeof VAK_MANUAL !== 'undefined') ? VAK_MANUAL[vakParam] : null;
    if (!man) {
      blok.querySelector('#manual').innerHTML =
        '<p class="noot" style="margin:0;">Nog geen course manual toegevoegd voor dit vak.</p>';
      return;
    }

    var knop = man.pdf
      ? '<a class="btn manual-knop" href="' + esc(man.pdf) + '" target="_blank" rel="noopener">' +
        'Open de course manual (pdf) &rarr;</a>' +
        (man.pdfNaam ? '<span class="manual-bestand">' + esc(man.pdfNaam) + '</span>' : '')
      : '';

    var rijen = (man.regels || []).map(function(r){
      return '<li><strong>' + esc(r.label) + '</strong> ' + esc(r.waarde) + '</li>';
    }).join('');

    var nr = 0;
    function deel(titel, body, open){
      nr++;
      return '<details class="man-deel"' + (open ? ' open' : '') + '>' +
        '<summary><span class="man-deel-nr">' + nr + '</span><span>' + esc(titel) + '</span></summary>' +
        '<div class="man-deel-body">' + body + '</div></details>';
    }

    /* 1. korte samenvattingen uit VAK_MANUAL */
    var delen = (man.samenvatting || []).map(function(sv, i){
      return deel(sv.titel,
        rijkeTekst(sv.tekst || '') +
        (sv.punten && sv.punten.length
          ? '<ul>' + sv.punten.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'
          : '') +
        (sv.bladzijde ? '<span class="man-bron">handleiding \u00b7 ' + esc(sv.bladzijde) + '</span>' : ''),
        i === 0);
    }).join('');

    /* 2. de studiegids van dit vak, in dezelfde lijst */
    var gids = (man.studiegids && typeof LESSTOF !== 'undefined')
      ? LESSTOF['studiegids/' + man.studiegids] : null;
    if (gids) {
      delen += gids.map(function(o){
        var ctx = { sleutel: 'gids-' + vakParam + '-' + o.id };
        return deel('Studiegids \u00b7 ' + o.titel,
          '<div class="inhoud gids-body">' + blokkenHtml(o.blokken, ctx) + '</div>', false);
      }).join('');
    }

    blok.querySelector('#manual').innerHTML =
      (man.intro ? '<p class="manual-intro">' + esc(man.intro) + '</p>' : '') +
      knop +
      (rijen ? '<ul class="manual-lijst">' + rijen + '</ul>' : '') +
      (delen ? '<div class="man-delen"><span class="label">Per onderdeel</span>' + delen + '</div>' : '');
  }

  /* ---------- hoofdstukken ---------- */
  function toonHoofdstukken(){
    var el = document.getElementById('hoofdstukken');
    if (!vak.lessen || !vak.lessen.length) {
      el.innerHTML = '<p class="noot" style="margin:0;">Dit vak heeft nog geen onderdelen.</p>';
      return;
    }
    var groepen = [];
    vak.lessen.forEach(function(l, i){
      var deel = l.titel.split(' \u00b7 ');
      var bron = deel.length > 1 ? deel[0] : 'Oefeningen';
      var kort = deel.length > 1 ? deel.slice(1).join(' \u00b7 ') : l.titel;
      var g = groepen.filter(function(x){ return x.bron === bron; })[0];
      if (!g) { g = { bron: bron, items: [] }; groepen.push(g); }
      g.items.push({ les: l, nr: i + 1, kort: kort });
    });

    el.innerHTML = groepen.map(function(g, gi){
      var afg = g.items.filter(function(x){ return isAf(vak, x.les); }).length;
      var rijen = g.items.map(function(x){
        var isafg = isAf(vak, x.les);
        var uit = typeof lesUitgewerkt === 'function' ? lesUitgewerkt(vak, x.les) : true;
        return '<a class="hfd-rij' + (isafg ? ' af' : '') + '" href="' + lesUrl(vak, x.les) + '">' +
          '<span class="mini-vink">' + (isafg ? '\u2713' : x.nr) + '</span>' +
          '<span>' + esc(x.kort) +
          (uit ? '' : ' <span class="niet-uit">nog leeg</span>') + '</span></a>';
      }).join('');
      return '<details class="bron-groep"' + (gi === 0 ? ' open' : '') + '>' +
        '<summary><span class="bron-naam">' + esc(g.bron) + '</span>' +
        '<span class="bron-telling">' + afg + ' / ' + g.items.length + '</span></summary>' +
        '<div class="bron-inhoud">' + rijen + '</div></details>';
    }).join('');

    var af = vak.lessen.filter(function(l){ return isAf(vak, l); }).length;
    var pct = Math.round(af / vak.lessen.length * 100);
    document.getElementById('vakBalk').style.width = pct + '%';
    document.getElementById('vakVoortgang').textContent =
      af + ' van ' + vak.lessen.length + ' onderdelen afgerond · ' + pct + '%';
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
      '<span class="pil">' + vak.lessen.length + ' onderdelen</span>';

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

  /* kopieerbare stukjes en vinkjes werken ook hier */
  document.addEventListener('click', function(e){
    var doel = e.target.closest && e.target.closest('[data-vinkdoel]');
    if (doel) {
      var k = doel.getAttribute('data-vinkdoel');
      lokaalZet(k, !lokaalWaar(k));
      doel.textContent = lokaalWaar(k) ? '\u2713' : '';
      var rij = doel.closest('.doel') || doel.closest('.kun');
      if (rij) rij.classList.toggle('af', lokaalWaar(k));
    }
  });

  start();
  if (typeof opFeed === 'function') opFeed(function(){
    if (opgelost) return;
    start();
    if (!opgelost) wachtOfMeld();
  });
})();
