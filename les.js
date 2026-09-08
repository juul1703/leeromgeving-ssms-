/* Lespagina — tabbladen, voortgang, aantekeningen.
   Gebruikt DATA en hulpfuncties uit app.js, blokken uit lesblokken.js,
   lesinhoud uit lesstof.js. */
(function(){
  var p = new URLSearchParams(window.location.search);
  var vakParam = p.get('vak') || '';
  var lesId = p.get('les') || '';
  var vak, sem, index, les;
  var opgelost = false;

  /* De pagina kan starten voordat het rooster binnen is. Zodra de feed er is
     (uit cache of live) probeert start() het opnieuw. */
  function start(){
  if (opgelost) return;

  /* ---- welke les? ---- */
  if (vakParam === 'voorbeeld') {
    vak = VOORBEELD_VAK;
    sem = { naam: 'Voorbeeld' };
    index = 0;
    les = vak.lessen[0];
  } else {
    var hit = vindVak(vakParam);
    if (!hit) {
      var kandidaten = alleVakken().filter(function(x){ return x.vak.lessen.length; });
      hit = kandidaten.filter(function(x){ return procent(x.vak) < 100; })[0] || kandidaten[0];
      if (!hit) return wachtOfMeld();
      var vl = volgendeLes(hit.vak);
      lesId = vl ? vl.id : hit.vak.lessen[0].id;
    }
    vak = hit.vak; sem = hit.sem;
    index = vak.lessen.map(function(x){ return x.id; }).indexOf(lesId);
    if (index < 0) index = 0;
    les = vak.lessen[index];
    if (!les) return wachtOfMeld();
    onthoudVak(vak.id);
    if (typeof onthoudBezoek === 'function') onthoudBezoek(vak.id, les.id);
  }
  opgelost = true;

  var vorige = vak.lessen[index - 1] || null;
  var volgende = vak.lessen[index + 1] || null;
  var basis = 'ssms-' + vak.id + '-' + les.id;
  var onderdelen = lesOnderdelen(vak, les);
  var actief = 0;

  /* ---- kop ---- */
  document.title = les.titel + ' · ' + vak.naam;
  document.getElementById('kruimel').innerHTML = vakParam === 'voorbeeld'
    ? '<a href="index.html">Homescreen</a> · voorbeeld'
    : '<a href="index.html">' + esc(sem.naam) + '</a> · <a href="vak.html?vak=' + encodeURIComponent(vak.id) + '">' + esc(vak.naam) + '</a>';
  document.getElementById('titel').textContent = les.titel;
  document.getElementById('meta').innerHTML =
    '<span class="pil">Les ' + (index + 1) + ' van ' + vak.lessen.length + '</span>' +
    '<span class="pil">' + les.duur + ' min</span>' +
    (les.plek ? '<span class="pil">' + esc(les.plek) + '</span>' : '') +
    '<span class="pil rustig">' + onderdelen.length + ' onderdelen</span>' +
    (typeof lesUitgewerkt === 'function' && !lesUitgewerkt(vak, les)
      ? '<span class="pil open">nog niet uitgewerkt</span>' : '') +
    (les.url ? '<a class="pil nu" href="' + esc(les.url) + '" target="_blank" rel="noopener">Materiaal &rarr;</a>' : '');

  /* ---- voortgang over de tabbladen ---- */
  function tabSleutel(i){ return basis + '-tab-' + onderdelen[i].id; }
  function tabAf(i){ return lokaalWaar(tabSleutel(i)); }
  function aantalTabsAf(){
    var c = 0;
    for (var i = 0; i < onderdelen.length; i++) if (tabAf(i)) c++;
    return c;
  }

  function toonVoortgang(){
    var af = aantalTabsAf(), pct = Math.round(af / onderdelen.length * 100);
    document.getElementById('lesBalk').style.width = pct + '%';
    document.getElementById('lesVoortgang').textContent = af + ' van ' + onderdelen.length +
      ' onderdelen afgerond · ' + pct + '%';
    // les zelf geldt als afgerond zodra alle tabbladen af zijn
    if (vakParam !== 'voorbeeld') zetAf(vak, les, af === onderdelen.length);
  }

  /* ---- tabbladen ---- */
  function toonTabs(){
    document.getElementById('tabs').innerHTML = onderdelen.map(function(o, i){
      return '<button class="tab' + (i === actief ? ' nu' : '') + (tabAf(i) ? ' af' : '') +
        '" data-tab="' + i + '"><span class="tab-nr">' + (i + 1) + '</span>' + esc(o.titel) +
        (tabAf(i) ? '<span class="tab-vink">✓</span>' : '') + '</button>';
    }).join('');

    document.getElementById('tablijst').innerHTML = onderdelen.map(function(o, i){
      return '<button class="tablijst-rij' + (i === actief ? ' nu' : '') + '" data-tab="' + i + '">' +
        '<span class="mini-vink">' + (tabAf(i) ? '✓' : (i + 1)) + '</span>' + esc(o.titel) + '</button>';
    }).join('');
  }

  function toonTab(bewaarPlek){
    var o = onderdelen[actief];
    var ctx = {
      sleutel: basis + '-' + o.id,
      volgendeHref: volgende ? lesUrl(vak, volgende) : 'index.html'
    };
    document.getElementById('tabLabel').textContent = 'Onderdeel ' + (actief + 1) + ' van ' + onderdelen.length;
    document.getElementById('tabTitel').textContent = o.titel;
    document.getElementById('inhoud').innerHTML = blokkenHtml(o.blokken, ctx);
    document.getElementById('notitieTab').textContent = o.titel.toLowerCase();

    var knop = document.getElementById('tabAf');
    var af = tabAf(actief);
    knop.textContent = af ? '✓ Afgerond' : 'Onderdeel afvinken';
    knop.className = af ? 'btn af-knop af' : 'btn af-knop';

    document.getElementById('tabVorige').disabled = actief === 0;
    document.getElementById('tabVolgende').textContent = actief === onderdelen.length - 1
      ? (volgende ? 'Volgende les →' : 'Terug naar overzicht') : 'Volgende →';

    laadNotitie();
    laadOefeningen();
    toonTabs();
    toonVoortgang();
    if (!bewaarPlek) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function naarTab(i){
    if (i < 0 || i >= onderdelen.length) return;
    actief = i;
    onthoudPlek(i);
    toonTab();
  }

  /* ---- waar was je gebleven? ----
     Blijft bewaard tussen sessies (localStorage), zodat je bij het
     openen van een hoofdstuk terugkomt op het onderdeel waar je stopte. */
  function onthoudPlek(i){
    try { localStorage.setItem(basis + '-plek', String(i)); } catch(e){}
  }
  function laatstePlek(){
    var v = null;
    try { v = localStorage.getItem(basis + '-plek'); } catch(e){}
    if (v === null) { try { v = sessionStorage.getItem(basis + '-tab-actief'); } catch(e){} } // oude opslag
    return v === null ? null : +v;
  }
  // andere scripts (lesextra.js) mogen weten in welke les we zitten
  window.LES_BASIS = basis;

  /* ---- aantekening per tabblad ---- */
  var timer;
  function notitieSleutel(){ return 'ssms-notitie-' + vak.id + '-' + les.id + '-' + onderdelen[actief].id; }
  function laadNotitie(){
    var veld = document.getElementById('notitie');
    try { veld.value = localStorage.getItem(notitieSleutel()) || ''; } catch(e){}
    document.getElementById('opslag').textContent = 'wordt bewaard op dit apparaat';
  }
  document.getElementById('notitie').addEventListener('input', function(){
    var veld = this, melding = document.getElementById('opslag');
    clearTimeout(timer);
    melding.textContent = 'bewaren…';
    timer = setTimeout(function(){
      try { localStorage.setItem(notitieSleutel(), veld.value); } catch(e){}
      melding.textContent = 'bewaard';
    }, 400);
  });

  /* ---- eigen antwoorden bij oefeningen ---- */
  function oefSleutel(id){ return basis + '-' + onderdelen[actief].id + '-oef-' + id; }
  function laadOefeningen(){
    document.querySelectorAll('.oef-veld').forEach(function(v){
      var id = v.getAttribute('data-oef') || '0';
      try { v.value = localStorage.getItem(oefSleutel(id)) || ''; } catch(e){}
      v.addEventListener('input', function(){
        try { localStorage.setItem(oefSleutel(id), v.value); } catch(e){}
      });
    });
  }

  /* ---- kopiëren ---- */
  var meldTimer;
  function meld(tekst){
    var el = document.getElementById('melding');
    el.textContent = tekst;
    el.hidden = false;
    clearTimeout(meldTimer);
    meldTimer = setTimeout(function(){ el.hidden = true; }, 1600);
  }
  function kopieer(tekst){
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tekst).then(function(){ meld('Gekopieerd'); },
        function(){ meld('Kopiëren lukte niet'); });
    } else {
      var t = document.createElement('textarea');
      t.value = tekst; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); meld('Gekopieerd'); } catch(e){ meld('Kopiëren lukte niet'); }
      document.body.removeChild(t);
    }
  }

  /* ---- klikgedrag ---- */
  document.addEventListener('click', function(e){
    var t = e.target;

    var kop = t.closest('[data-kopieer]');
    if (kop) { e.preventDefault(); kopieer(kop.getAttribute('data-kopieer')); return; }

    var tab = t.closest('[data-tab]');
    if (tab) { naarTab(+tab.getAttribute('data-tab')); return; }

    var doel = t.closest('[data-vinkdoel]');
    if (doel) {
      var k = doel.getAttribute('data-vinkdoel');
      lokaalZet(k, !lokaalWaar(k));
      doel.textContent = lokaalWaar(k) ? '✓' : '';
      var rij = doel.closest('.doel') || doel.closest('.kun');
      if (rij) rij.classList.toggle('af', lokaalWaar(k));
      return;
    }

    var kaart = t.closest('.kaart');
    if (kaart && !t.closest('[data-kopieer]')) { kaart.classList.toggle('om'); return; }

    var optie = t.closest('.qoptie');
    if (optie) { antwoordQuiz(optie); return; }
  });

  document.getElementById('tabAf').addEventListener('click', function(){
    var k = tabSleutel(actief);
    lokaalZet(k, !lokaalWaar(k));
    toonTab(true);
    if (lokaalWaar(k) && actief < onderdelen.length - 1) naarTab(actief + 1);
  });

  document.getElementById('tabVorige').addEventListener('click', function(){ naarTab(actief - 1); });
  document.getElementById('tabVolgende').addEventListener('click', function(){
    if (actief < onderdelen.length - 1) return naarTab(actief + 1);
    window.location.href = volgende ? lesUrl(vak, volgende) : 'vak.html?vak=' + encodeURIComponent(vak.id);
  });

  /* ---- quiz ---- */
  function antwoordQuiz(knop){
    var vraag = knop.closest('.qvraag');
    if (vraag.classList.contains('beantwoord')) return;
    var juist = +vraag.getAttribute('data-juist');
    var gekozen = +knop.getAttribute('data-optie');
    vraag.classList.add('beantwoord');
    vraag.querySelectorAll('.qoptie').forEach(function(o, i){
      if (i === juist) o.classList.add('goed');
      else if (i === gekozen) o.classList.add('fout');
      o.disabled = true;
    });
    vraag.querySelector('.quitleg').hidden = false;
    if (gekozen === juist) vraag.classList.add('was-goed');
    var quiz = vraag.closest('.quiz');
    var goed = quiz.querySelectorAll('.was-goed').length;
    var totaal = quiz.querySelectorAll('.qvraag').length;
    var score = quiz.querySelector('[data-score]');
    score.textContent = goed + ' / ' + totaal;
    score.classList.add('actief');
  }

  /* ---- menu in-/uitklappen ---- */
  var menuUit = false;
  try { menuUit = localStorage.getItem('ssms-zijkolom') === 'uit'; } catch(e){}
  function toonMenu(){
    document.getElementById('lesBody').classList.toggle('menu-uit', menuUit);
    document.getElementById('menuKnop').textContent = menuUit ? '☰' : '✕';
    document.getElementById('menuKnop').title = menuUit ? 'Menu uitklappen' : 'Menu inklappen';
  }
  document.getElementById('menuKnop').addEventListener('click', function(){
    menuUit = !menuUit;
    try { localStorage.setItem('ssms-zijkolom', menuUit ? 'uit' : 'aan'); } catch(e){}
    toonMenu();
  });
  toonMenu();

  /* ---- lessen in dit vak ---- */
  document.getElementById('vaklijst').innerHTML = vak.lessen.map(function(l, i){
    var af = vakParam === 'voorbeeld' ? false : isAf(vak, l);
    var nu = l.id === les.id;
    var uit = typeof lesUitgewerkt === 'function' ? lesUitgewerkt(vak, l) : true;
    return '<a class="vaklijst-rij' + (nu ? ' nu' : '') + (af ? ' af' : '') +
      '" href="' + lesUrl(vak, l) + '"><span class="mini-vink">' + (af ? '✓' : (i + 1)) +
      '</span><span>' + esc(l.titel) + (uit ? '' : '<span class="niet-uit">nog leeg</span>') +
      '</span></a>';
  }).join('');

  /* ---- vorige/volgende les ---- */
  function zetLink(id, doel, pijl){
    var el = document.getElementById(id);
    if (!doel) { el.className = 'leeg'; el.textContent = pijl + ' geen les'; el.removeAttribute('href'); return; }
    el.className = '';
    el.href = lesUrl(vak, doel);
    el.textContent = pijl + ' ' + doel.titel;
  }
  zetLink('vorigeLink', vorige, '←');
  zetLink('volgendeLink', volgende, '→');

  /* ---- toetsenbord ---- */
  document.addEventListener('keydown', function(e){
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') { actief < onderdelen.length - 1 ? naarTab(actief + 1) : (volgende && (window.location.href = lesUrl(vak, volgende))); }
    if (e.key === 'ArrowLeft') { actief > 0 ? naarTab(actief - 1) : (vorige && (window.location.href = lesUrl(vak, vorige))); }
  });

  /* ---- start waar je gebleven was ---- */
  var bewaard = laatstePlek();
  if (bewaard !== null && bewaard < onderdelen.length) actief = bewaard;
  else {
    for (var i = 0; i < onderdelen.length; i++) if (!tabAf(i)) { actief = i; break; }
  }
  toonTab(true);
  } /* einde start() */

  /* Nog geen rooster binnen? Wachten. Wel binnen en toch niets gevonden? Melden. */
  function wachtOfMeld(){
    var bezig = typeof ROOSTER_STATUS !== 'undefined' && ROOSTER_STATUS.staat === 'laden';
    document.getElementById('titel').textContent = bezig ? 'Les laden…' : 'Deze les bestaat niet meer';
    document.getElementById('kruimel').innerHTML = '<a href="index.html">Homescreen</a>';
    document.getElementById('meta').innerHTML = '';
    document.getElementById('lesBody').hidden = true;
    document.querySelector('.voortgang-strip').hidden = true;
    document.getElementById('tabs').innerHTML = bezig
      ? '<span class="hint">Je rooster wordt opgehaald…</span>'
      : '<a class="btn" href="index.html">Terug naar het overzicht</a>';
  }

  function herstel(){
    document.getElementById('lesBody').hidden = false;
    document.querySelector('.voortgang-strip').hidden = false;
  }

  start();
  if (typeof opFeed === 'function') opFeed(function(){
    if (opgelost) return;
    herstel();
    start();
    if (!opgelost) wachtOfMeld();
  });
})();
