/* ============================================================
   SSMS leeromgeving — alle inhoud die je aanpast staat hierboven
   in de blokken DATA, ROOSTER, DEADLINES en NOTITIES.
   Voortgang wordt lokaal bewaard (localStorage), dus offline.
   ============================================================ */

var STUDENT = { naam: '' }; // vul je voornaam in voor een persoonlijke groet

/* Vakken en lessen. Voeg lessen toe als objecten: {id, titel, duur, url}
   'url' is optioneel: staat er een link, dan opent de les in een nieuw tabblad. */
var DATA = {
  jaar: 'Jaar 1',
  actiefSemester: 's1',
  semesters: [
    {
      id: 's2', naam: 'Semester 2', status: 'komt nog',
      /* Vul dit zodra je weet welke vakken je in semester 2 krijgt. */
      vakken: []
    },
    {
      id: 's1', naam: 'Semester 1', status: 'lopend',
      /* Leeg gelaten: de vakken van dit semester komen automatisch uit je rooster
         (zie autoVakken in rooster.js). Zodra je zelf lessen wil toevoegen, zet je
         het vak hier neer met hetzelfde id dat je op het homescreen ziet staan. */
      vakken: []
    }
  ]
};

/* Je rooster komt uit MyTimetable (zie rooster.js). Er is geen handmatig
   weekrooster meer: is de feed niet gekoppeld, dan zegt het homescreen dat gewoon. */

/* Je eigen deadlines: inleverdata, opdrachten, dingen die niet in je rooster staan.
   Vorm: { titel, vak, datum: 'JJJJ-MM-DD' }   (of { titel, vak, dagen: 5 }) */
var EIGEN_DEADLINES = [
  // { titel: 'Onderzoeksverslag inleveren', vak: 'Demystifying Research Methods', datum: '2026-10-15' }
];

/* Alles bij elkaar: jouw deadlines + toetsen en tentamens die in je rooster staan. */
function deadlines(){
  var nu = new Date();
  var uit = EIGEN_DEADLINES.map(function(d){
    var wanneer = typeof d.dagen === 'number'
      ? new Date(nu.getTime() + d.dagen * 86400000)
      : new Date(d.datum + 'T23:59');
    return {
      titel: d.titel, vak: d.vak, datum: wanneer,
      dagen: Math.ceil((wanneer - nu) / 86400000)
    };
  }).filter(function(d){ return d.dagen >= 0; });

  if (typeof toetsenUitRooster === 'function') uit = uit.concat(toetsenUitRooster(nu));
  return uit.sort(function(x, y){ return x.dagen - y.dagen; }).slice(0, 5);
}

/* 'Laatst bekeken' vult zich met de aantekeningen die je op lespagina's schrijft. */
function laatsteNotities(max){
  var uit = [];
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (!k || k.indexOf('ssms-notitie-') !== 0) continue;
      var tekst = localStorage.getItem(k);
      if (!tekst || !tekst.trim()) continue;
      var rest = k.slice('ssms-notitie-'.length);
      var hit = alleVakken().filter(function(x){ return rest.indexOf(x.vak.id + '-') === 0; })[0];
      if (!hit) continue;
      var lesId = rest.slice(hit.vak.id.length + 1);
      var les = hit.vak.lessen.filter(function(l){ return l.id === lesId; })[0];
      if (!les) continue;
      uit.push({ vak: hit.vak.naam, vakId: hit.vak.id, lesId: les.id,
                 titel: les.titel, tekst: tekst.trim().slice(0, 140) });
    }
  } catch(e){}
  return uit.slice(0, max || 3);
}

function vulLessen(n){
  var t = ['Kernbegrippen','Theoretisch kader','Casusanalyse','Werkgroep','Literatuur en bronnen','Toetsvoorbereiding','Veldwerk','Reflectie en feedback'];
  var out = [];
  for (var i = 0; i < n; i++) out.push({ id: 'l' + (i + 1), titel: t[i % t.length], duur: 20 + (i * 5) % 30 });
  return out;
}

/* ---------- rooster & actief vak ---------- */
function klok(d){ return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }); }

/* Het rooster van vandaag. Komt uit de iCal-feed van mytimetable als die er is,
   anders uit het handmatige ROOSTER_WEEK hieronder. */
function roosterVandaag(nu){
  nu = nu || new Date();

  var uitFeed = (typeof feedVoorDag === 'function') ? feedVoorDag(nu) : null;
  if (!uitFeed) return [];
  return uitFeed.map(function(e){
      var hit = e.vakId ? vindVak(e.vakId) : null;
      return {
        van: klok(e.start), tot: klok(e.eind), plek: e.plek,
        soort: (typeof soortUit === 'function') ? soortUit(e.titel) : 'les',
        vak: hit ? hit.vak : null, sem: hit ? hit.sem : null,
        naam: hit ? hit.vak.naam : e.titel,
        bezig: nu >= e.start && nu < e.eind,
        voorbij: nu >= e.eind,
      start: e.start.getHours() * 60 + e.start.getMinutes()
    };
  });
}

/* Welk vak staat groot in beeld?
   1. het college dat nu bezig is
   2. anders het eerstvolgende college van vandaag
   3. anders het laatste college van vandaag (dag is voorbij)
   4. anders het vak dat je het laatst open had
   5. anders het eerste onafgeronde vak van het actieve semester */
function bepaalActief(nu){
  var dag = roosterVandaag(nu);
  var bezig = dag.filter(function(m){ return m.bezig && m.vak; })[0];
  if (bezig) return { vak: bezig.vak, reden: 'Nu bezig · ' + bezig.van + '–' + bezig.tot + ' · ' + bezig.plek, moment: bezig };

  var komt = dag.filter(function(m){ return !m.voorbij && m.vak; })[0];
  if (komt) return { vak: komt.vak, reden: 'Straks · ' + komt.van + ' · ' + komt.soort + ' · ' + komt.plek, moment: komt };

  var gehad = dag.filter(function(m){ return m.vak; }).pop();
  if (gehad) return { vak: gehad.vak, reden: 'Vandaag gehad · werk het na', moment: gehad };

  // Niets meer vandaag: pak het eerstvolgende moment uit de feed (morgen of later).
  if (typeof feedHierna === 'function') {
    var straks = feedHierna(nu || new Date());
    if (straks && straks.vakId) {
      var sh = vindVak(straks.vakId);
      if (sh) {
        var dagnaam = straks.start.toLocaleDateString('nl-NL', { weekday: 'long' });
        return { vak: sh.vak, reden: 'Hierna · ' + dagnaam + ' ' +
          straks.start.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) +
          ' · ' + straks.plek, moment: null };
      }
    }
  }

  var laatst = null;
  try { laatst = vindVak(localStorage.getItem('ssms-laatst') || ''); } catch(e){}
  if (laatst) return { vak: laatst.vak, reden: 'Waar je gebleven was', moment: null };

  var sem = DATA.semesters.filter(function(s){ return s.id === DATA.actiefSemester; })[0] || DATA.semesters[0];
  var eerste = sem.vakken.filter(function(v){ return procent(v) < 100; })[0] || sem.vakken[0];
  if (!eerste) eerste = (alleVakken()[0] || {}).vak;
  if (!eerste) return { vak: null, reden: null, moment: null };
  return { vak: eerste, reden: 'Op de planning', moment: null };
}

function onthoudVak(id){ try { localStorage.setItem('ssms-laatst', id); } catch(e){} }

/* ---------- voortgang ---------- */
var RING = 163.4;
function sleutel(vak, les){ return 'ssms-les-' + vak.id + '-' + les.id; }
function isAf(vak, les){ try { return localStorage.getItem(sleutel(vak, les)) === 'af'; } catch(e){ return false; } }
function zetAf(vak, les, waarde){ try { localStorage.setItem(sleutel(vak, les), waarde ? 'af' : 'open'); } catch(e){} }
function aantalAf(vak){ var c = 0; vak.lessen.forEach(function(l){ if (isAf(vak, l)) c++; }); return c; }
function procent(vak){ return vak.lessen.length ? Math.round(aantalAf(vak) / vak.lessen.length * 100) : 0; }
function volgendeLes(vak){
  for (var i = 0; i < vak.lessen.length; i++) if (!isAf(vak, vak.lessen[i])) return vak.lessen[i];
  return vak.lessen[vak.lessen.length - 1] || null;
}
function alleVakken(){
  var out = [];
  DATA.semesters.forEach(function(s){ s.vakken.forEach(function(v){ out.push({ vak: v, sem: s }); }); });
  return out;
}
function vindVak(id){
  var hit = alleVakken().filter(function(x){ return x.vak.id === id; })[0];
  return hit || null;
}
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ---------- render ---------- */
function render(){
  var nu = new Date();
  var uur = nu.getHours();
  var groet = uur < 12 ? 'Goedemorgen' : uur < 18 ? 'Goedemiddag' : 'Goedenavond';
  if (STUDENT.naam) groet += ', ' + STUDENT.naam;
  var datum = nu.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

  var actief = DATA.semesters.filter(function(s){ return s.id === DATA.actiefSemester; })[0] || DATA.semesters[0];
  var keuze = bepaalActief(nu);
  var held = keuze.vak;
  var volg = held ? volgendeLes(held) : null;
  var dag = roosterVandaag(nu);
  var gekoppeld = !(typeof feedUrl === 'function' && !feedUrl());
  var bezigMetOphalen = typeof ROOSTER_STATUS !== 'undefined' && ROOSTER_STATUS.staat === 'laden';

  var totAf = 0, totAl = 0;
  alleVakken().forEach(function(x){ totAf += aantalAf(x.vak); totAl += x.vak.lessen.length; });
  var totPct = totAl ? Math.round(totAf / totAl * 100) : 0;

  document.getElementById('datum').textContent = datum;
  document.getElementById('voetDatum').textContent = DATA.jaar + ' · ' + datum;
  document.getElementById('groet').innerHTML = held
    ? esc(groet) + ',<br><em>' + esc(held.naam) + '</em> wacht op je.'
    : esc(groet) + ',<br>' + (gekoppeld
        ? 'je rooster wordt <em>opgehaald</em>.'
        : 'koppel eerst je <em>rooster</em>.');
  var DL = deadlines();
  var dlDeze = DL.filter(function(d){ return d.dagen <= 7; }).length;
  var dagTekst = dag.length
    ? dag.length + (dag.length === 1 ? ' college vandaag' : ' colleges vandaag')
    : 'geen college vandaag';
  document.getElementById('subregel').textContent = held
    ? (totAl ? 'Je hebt ' + totPct + '% van je colleges bijgewerkt. ' : '') +
      dagTekst[0].toUpperCase() + dagTekst.slice(1) +
      (dlDeze ? ' en ' + dlDeze + (dlDeze === 1 ? ' deadline' : ' deadlines') + ' binnen de week' : '') +
      (keuze.reden ? ' — ' + keuze.reden.charAt(0).toLowerCase() + keuze.reden.slice(1) + '.' : '.')
    : gekoppeld
      ? (bezigMetOphalen
          ? 'Je rooster wordt opgehaald bij MyTimetable. Zodra dat klaar is, staan je vakken en colleges hier.'
          : 'Je rooster is niet bereikbaar. Controleer je link via het tandwiel rechtsboven, of probeer het later opnieuw.')
      : 'Plak je iCal-link uit MyTimetable en je vakken, colleges en toetsen verschijnen automatisch — inclusief voortgang per college.';
  document.getElementById('totCijfer').textContent = totPct + '%';
  document.getElementById('totTekst').textContent = totAl
    ? totAf + ' van de ' + totAl + ' colleges bijgewerkt'
    : 'nog geen lessen toegevoegd';
  setTimeout(function(){
    document.getElementById('totRing').setAttribute('stroke-dashoffset', RING * (1 - totPct / 100));
  }, 120);

  document.getElementById('roosterTelling').textContent = dag.length
    ? dag.length + (dag.length === 1 ? ' moment' : ' momenten') : 'vrij';
  document.getElementById('rooster').innerHTML = dag.length
    ? dag.map(function(r){
        var klasse = 'regel' + (r.bezig ? ' bezig' : '') + (r.voorbij ? ' voorbij' : '');
        return '<div class="' + klasse + '"' + (r.vak ? ' data-vak="' + esc(r.vak.id) + '"' : '') + '>' +
          '<span class="tijd">' + esc(r.van) + '</span><span class="titel">' + esc(r.naam) +
          ' · ' + esc(r.soort) + '</span><span class="plek">' + esc(r.plek) + '</span></div>';
      }).join('')
    : '<div class="regel" style="display:block;font-size:13px;line-height:1.6;color:var(--muted);">' +
      (!gekoppeld
        ? 'Nog niet gekoppeld. <button class="tekstknop" id="koppelNu">Plak je roosterlink</button> — daarna staat je dag hier.'
        : bezigMetOphalen ? 'Je rooster wordt opgehaald…'
        : 'Geen college vandaag — goede dag om achterstand weg te werken.') + '</div>';
  var statusEl = document.getElementById('roosterStatus');
  if (statusEl && typeof statusTekst === 'function') statusEl.textContent = statusTekst();

  document.getElementById('dlTelling').textContent = DL.length ? DL.length + ' open' : 'niets open';
  document.getElementById('deadlines').innerHTML = DL.length
    ? DL.map(function(d){
        var klasse = d.dagen <= 3 ? 'pil nu' : d.dagen >= 10 ? 'pil rustig' : 'pil';
        if (d.dagen > 60) klasse = 'pil rustig';
        var telling = d.dagen === 0 ? 'vandaag' : d.dagen === 1 ? 'morgen' : d.dagen + ' dagen';
        var datum = d.datum
          ? d.datum.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })
          : '';
        return '<div class="dl"' + (d.vakId ? ' data-vak="' + esc(d.vakId) + '"' : '') +
          '><div><div class="titel">' + esc(d.titel) + '</div><div class="vak">' +
          esc(d.vak) + '</div></div><span class="wanneer"><span class="' + klasse + '">' + telling +
          '</span>' + (datum ? '<span class="dl-datum">' + esc(datum) + '</span>' : '') + '</span></div>';
      }).join('')
    : '<div class="dl" style="display:block;color:var(--muted);font-size:13px;line-height:1.6;">' +
      (gekoppeld
        ? 'Niets in zicht. Toetsen uit je rooster komen hier automatisch; eigen inleverdata zet je in <code>EIGEN_DEADLINES</code> in app.js.'
        : 'Zodra je rooster gekoppeld is, verschijnen je toetsen en tentamens hier.') + '</div>';

  var html = '';
  var opVolgorde = DATA.semesters.slice().sort(function(x, y){
    return (x.id === DATA.actiefSemester ? -1 : 0) - (y.id === DATA.actiefSemester ? -1 : 0);
  });
  opVolgorde.forEach(function(sem){
    var af = 0, al = 0;
    sem.vakken.forEach(function(v){ af += aantalAf(v); al += v.lessen.length; });

    if (sem.id === actief.id) {
      html += '<div class="sem-kop"><h2>' + esc(sem.naam) + ' <span>· ' + esc(sem.status) +
        '</span></h2><span class="stat">' + af + '/' + al + ' lessen · ' + sem.vakken.length + ' vakken</span></div>';
      if (!sem.vakken.length) {
        html += '<div class="leegmelding" style="margin-top:0;"><b>' +
          (gekoppeld ? 'Je vakken verschijnen hier zodra je rooster is opgehaald'
                     : 'Koppel eerst je rooster') + '</b><span>' +
          (gekoppeld ? 'Elk vak uit je rooster wordt automatisch een kaart, met elk college als afvinkbare les.'
                     : 'Plak je iCal-link uit MyTimetable — <button class="tekstknop" id="koppelNu2">nu koppelen</button>') +
          '</span></div>';
      } else {
        html += '<div class="mozaiek">' + heldKaart(held, keuze.reden) + '<div class="tegels">' +
          sem.vakken.filter(function(v){ return v.id !== held.id; }).map(tegelKaart).join('') +
          '</div></div>';
      }
    } else {
      html += '<div class="archief"><button class="archief-kop" data-archief="' + esc(sem.id) + '">' +
        '<span><b>' + esc(sem.naam) + '</b><span class="sub">' + esc(sem.status) + ' · ' +
        sem.vakken.length + ' vakken · ' + af + '/' + al + ' lessen</span></span>' +
        '<span class="actie">' + (sem.vakken.length ? 'Bekijk ' + sem.vakken.length + ' vakken' : 'nog geen vakken') + '</span></button>' +
        '<div class="archief-lijst" id="lijst-' + esc(sem.id) + '" hidden>' +
        sem.vakken.map(function(v){
          var p = procent(v);
          return '<div class="mini" data-vak="' + esc(v.id) + '"><span>' + esc(v.naam) +
            '</span><b>' + p + '%</b></div>';
        }).join('') + '</div></div>';
    }
  });
  document.getElementById('semesters').innerHTML = html;

  var notities = laatsteNotities(3);
  document.getElementById('notities').innerHTML = notities.length
    ? notities.map(function(n){
        return '<a class="notitie" href="les.html?vak=' + encodeURIComponent(n.vakId) +
          '&les=' + encodeURIComponent(n.lesId) + '"><div class="vak">' + esc(n.vak) +
          '</div><div class="titel">' + esc(n.titel) + '</div><div class="tekst">' + esc(n.tekst) + '</div></a>';
      }).join('')
    : '<div class="leegmelding" style="margin-top:0;grid-column:1/-1;"><b>Nog geen aantekeningen</b>' +
      '<span>Open een college en schrijf er iets bij — het verschijnt hier.</span></div>';

  var verderKnop = document.getElementById('verder');
  var roosterKnop = document.getElementById('naarRooster');
  if (held) {
    verderKnop.textContent = volg ? 'Ga naar ' + (keuze.moment ? 'dit college' : 'de volgende les') : 'Bekijk dit vak';
    verderKnop.onclick = function(){
      onthoudVak(held.id);
      if (volg) window.location.href = lesUrl(held, volg); else openVak(held.id);
    };
    roosterKnop.hidden = false;
  } else {
    verderKnop.textContent = gekoppeld ? 'Roosterlink controleren' : 'Koppel je rooster';
    verderKnop.onclick = function(){ document.getElementById('instellingen').click(); };
    roosterKnop.hidden = true;
  }

  // voortgangsring verbergen zolang er niets te meten is
  document.querySelector('.ring-blok').hidden = !totAl;
  document.getElementById('naarRooster').onclick = function(){
    var duo = document.querySelector('.duo');
    if (duo) window.scrollTo({ top: duo.getBoundingClientRect().top + window.pageYOffset - 30, behavior: 'smooth' });
  };
}

function heldKaart(vak, reden){
  var p = procent(vak), volg = volgendeLes(vak);
  var voet = vak.lessen.length
    ? '<svg class="ring" viewBox="0 0 64 64" width="62" height="62" aria-hidden="true">' +
      '<circle class="baan" cx="32" cy="32" r="26" stroke-width="6"></circle>' +
      '<circle class="waarde" cx="32" cy="32" r="26" stroke-width="6" stroke-dasharray="163.4" stroke-dashoffset="' +
      (RING * (1 - p / 100)) + '"></circle></svg><div><div class="groot">' + p +
      '% bijgewerkt</div><div class="klein">' + aantalAf(vak) + ' van ' + vak.lessen.length + ' colleges</div></div>'
    : '<div><div class="groot">Nog geen lessen</div><div class="klein">voeg dit vak toe in app.js</div></div>';
  return '<div class="held" data-vak="' + esc(vak.id) + '"><div class="bol"></div>' +
    '<div class="binnen"><div class="kicker">' + esc(reden || 'Actief vak') + '</div><h3>' + esc(vak.naam) + '</h3>' +
    (volg ? '<div class="volgende">Eerstvolgend · ' + esc(volg.titel) + '</div>' : '') + '</div>' +
    '<div class="voet">' + voet + '</div></div>';
}

function tegelKaart(vak){
  var p = procent(vak), klaar = p === 100 ? ' klaar' : '';
  var onder = vak.lessen.length
    ? '<div class="meta"><span>' + aantalAf(vak) + ' van ' + vak.lessen.length + ' colleges</span><b class="' +
      (p === 100 ? 'klaar' : '') + '">' + p + '%</b></div><div class="balk"><i class="' + klaar.trim() +
      '" style="width:' + p + '%"></i></div>'
    : '<div class="meta"><span>nog geen lessen</span></div>';
  return '<div class="tegel" data-vak="' + esc(vak.id) + '"><div class="vaknaam">' + esc(vak.naam) + '</div>' +
    '<div>' + onder + '</div></div>';
}

function lesUrl(vak, les){ return 'les.html?vak=' + encodeURIComponent(vak.id) + '&les=' + encodeURIComponent(les.id); }

/* ---------- detailpaneel ---------- */
var huidigVak = null;

function openVak(id){
  var hit = vindVak(id);
  if (!hit) return;
  huidigVak = hit;
  onthoudVak(hit.vak.id);
  document.getElementById('ladeSem').textContent = hit.sem.naam;
  document.getElementById('ladeTitel').textContent = hit.vak.naam;
  document.getElementById('lade').hidden = false;
  document.body.style.overflow = 'hidden';
  renderLade();
}

function renderLade(){
  var vak = huidigVak.vak, p = procent(vak);
  document.getElementById('ladeBalk').style.width = p + '%';
  document.getElementById('ladeLabel').textContent = aantalAf(vak) + '/' + vak.lessen.length + ' afgerond';
  var box = document.getElementById('ladeLessen');
  var naarVak = document.getElementById('naarVakHome');
  if (!naarVak) {
    naarVak = document.createElement('a');
    naarVak.id = 'naarVakHome';
    naarVak.className = 'btn';
    naarVak.style.cssText = 'display:inline-block;margin-bottom:18px;';
    box.parentNode.insertBefore(naarVak, box);
  }
  naarVak.href = 'vak.html?vak=' + encodeURIComponent(vak.id);
  naarVak.textContent = 'Open het vak-homescreen \u2192';
  if (!vak.lessen.length) {
    box.innerHTML = '<div class="leegmelding"><b>Nog geen lessen</b><span>Voeg lessen toe in app.js, ' +
      'ze verschijnen hier automatisch.</span></div>';
    return;
  }
  box.innerHTML = vak.lessen.map(function(l, i){
    var af = isAf(vak, l);
    var uit = typeof lesUitgewerkt === 'function' ? lesUitgewerkt(vak, l) : true;
    return '<div class="les' + (af ? ' af' : '') + '">' +
      '<button class="vink" data-vink="' + esc(l.id) + '" title="Markeer als afgerond">' + (af ? '✓' : '') + '</button>' +
      '<a class="les-link" href="' + lesUrl(vak, l) + '"><span class="titel">' + esc(l.titel) +
      (uit ? '' : '<span class="niet-uit">nog leeg</span>') +
      '</span><span class="meta">Les ' + (i + 1) + ' · ' + l.duur + ' min · open les &rarr;</span></a></div>';
  }).join('');
}

function sluitLade(){
  document.getElementById('lade').hidden = true;
  document.body.style.overflow = '';
  huidigVak = null;
  render();
}

/* ---------- zoeken ---------- */
function zoek(term){
  var box = document.getElementById('resultaten');
  var q = term.trim().toLowerCase();
  if (!q) { box.hidden = true; box.innerHTML = ''; return; }
  var treffers = [];
  alleVakken().forEach(function(x){
    if (x.vak.naam.toLowerCase().indexOf(q) > -1) {
      treffers.push({ id: x.vak.id, naam: x.vak.naam, sub: x.sem.naam + ' · ' + procent(x.vak) + '%' });
    }
    x.vak.lessen.forEach(function(l){
      if (l.titel.toLowerCase().indexOf(q) > -1) {
        treffers.push({ id: x.vak.id, naam: l.titel, sub: x.vak.naam });
      }
    });
  });
  box.hidden = false;
  box.innerHTML = treffers.length
    ? treffers.slice(0, 8).map(function(t){
        return '<div class="res" data-vak="' + esc(t.id) + '"><b>' + esc(t.naam) + '</b><span>' +
          esc(t.sub) + '</span></div>';
      }).join('')
    : '<div class="res" style="cursor:default"><span>Geen resultaat. Probeer een andere term.</span></div>';
}

/* ---------- modus ---------- */
function zetModus(m){
  document.documentElement.setAttribute('data-mode', m);
  document.getElementById('modus').textContent = m === 'dark' ? '☀' : '☾';
  var kleur = m === 'dark' ? '#171316' : '#F6F2EE';
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', kleur);
  try { localStorage.setItem('ssms-modus', m); } catch(e){}
}

/* ---------- start ---------- */
(function init(){
  var opgeslagen;
  try { opgeslagen = localStorage.getItem('ssms-modus'); } catch(e){}
  zetModus(opgeslagen || 'light');

  var knop = document.getElementById('modus');
  if (knop) knop.addEventListener('click', function(){
    zetModus(document.documentElement.getAttribute('data-mode') === 'dark' ? 'light' : 'dark');
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
  }

  // Alleen het homescreen heeft deze onderdelen; les.html gebruikt dezelfde data via les.js.
  if (!document.getElementById('semesters')) return;
  render();
  document.getElementById('zoek').addEventListener('input', function(e){ zoek(e.target.value); });

  /* ---- roosterlink instellen ---- */
  var feedLade = document.getElementById('feedLade');
  var feedVeld = document.getElementById('feedVeld');
  var feedMelding = document.getElementById('feedMelding');

  function openFeed(){
    feedVeld.value = (typeof feedUrl === 'function' ? feedUrl() : '') || '';
    feedMelding.textContent = '';
    feedMelding.className = 'feed-melding';
    feedLade.hidden = false;
    document.body.style.overflow = 'hidden';
    feedVeld.focus();
  }
  function sluitFeed(){
    feedLade.hidden = true;
    document.body.style.overflow = '';
  }

  document.getElementById('instellingen').addEventListener('click', openFeed);
  document.getElementById('feedSluit').addEventListener('click', sluitFeed);
  document.getElementById('feedSluier').addEventListener('click', sluitFeed);

  document.getElementById('feedOpslaan').addEventListener('click', function(){
    var url = feedVeld.value.trim();
    if (!geldigeFeed(url)) {
      feedMelding.textContent = 'Dat lijkt geen iCal-link. Hij begint met https:// en bevat "ical" of ".ics".';
      feedMelding.className = 'feed-melding fout';
      return;
    }
    zetFeedUrl(url);
    feedMelding.textContent = 'Gekoppeld. Je rooster wordt opgehaald…';
    feedMelding.className = 'feed-melding goed';
    setTimeout(function(){ window.location.reload(); }, 700);
  });

  document.getElementById('feedWissen').addEventListener('click', function(){
    zetFeedUrl('');
    window.location.reload();
  });

  // Nog geen rooster gekoppeld? Meteen vragen.
  if (typeof feedUrl === 'function' && !feedUrl()) openFeed();
  document.getElementById('sluit').addEventListener('click', sluitLade);
  document.getElementById('sluier').addEventListener('click', sluitLade);
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && huidigVak) sluitLade(); });

  document.addEventListener('click', function(e){
    var vink = e.target.closest ? e.target.closest('[data-vink]') : null;
    if (vink && huidigVak) {
      var l = huidigVak.vak.lessen.filter(function(x){ return x.id === vink.getAttribute('data-vink'); })[0];
      if (l) { zetAf(huidigVak.vak, l, !isAf(huidigVak.vak, l)); renderLade(); }
      return;
    }
    if (e.target.closest && e.target.closest('a')) return;
    var arch = e.target.closest ? e.target.closest('[data-archief]') : null;
    if (arch) {
      var lijst = document.getElementById('lijst-' + arch.getAttribute('data-archief'));
      lijst.hidden = !lijst.hidden;
      arch.querySelector('.actie').textContent = lijst.hidden
        ? 'Bekijk ' + lijst.children.length + ' vakken' : 'Inklappen';
      return;
    }
    if (e.target.id === 'koppelNu' || e.target.id === 'koppelNu2') {
      document.getElementById('instellingen').click(); return;
    }

    var kaart = e.target.closest ? e.target.closest('[data-vak]') : null;
    if (kaart) openVak(kaart.getAttribute('data-vak'));
  });

})();
