/* ============================================================
   lesextra.js — aanvullingen op de lespagina

   1. De bovenbalk is inklapbaar (pijl-knop naast het menu-icoon).
   2. Subkopjes (1.1, 1.2, ...) worden echte tabbladen: je ziet één
      onderdeel tegelijk, met een tabbalk die in beeld blijft.
   3. Elk subonderdeel is afvinkbaar, met nummer en titel erbij.

   Laden na les.js.
   ============================================================ */
(function(){

  /* ---------- 1. Bovenbalk inklappen ---------- */
  function balkInklapbaar(){
    var top = document.querySelector('.les-top');
    var tools = top && top.querySelector('.tools');
    if (!top || !tools || document.getElementById('balkKnop')) return;

    var knop = document.createElement('button');
    knop.id = 'balkKnop';
    knop.className = 'balk-knop';
    knop.type = 'button';
    knop.setAttribute('aria-label', 'Balk in- of uitklappen');
    tools.insertBefore(knop, tools.firstChild);

    var ingeklapt = false;
    try { ingeklapt = localStorage.getItem('ssms-balk') === 'in'; } catch(e){}

    function toon(){
      top.classList.toggle('ingeklapt', ingeklapt);
      knop.textContent = ingeklapt ? '\u2304' : '\u2303';
      knop.title = ingeklapt ? 'Balk uitklappen' : 'Balk inklappen';
    }
    knop.addEventListener('click', function(){
      ingeklapt = !ingeklapt;
      try { localStorage.setItem('ssms-balk', ingeklapt ? 'in' : 'uit'); } catch(e){}
      toon();
    });
    toon();
  }

  /* ---------- hulpjes ---------- */
  function paginaSleutel(){
    var p = new URLSearchParams(window.location.search);
    return 'ssms-sub-' + (p.get('vak') || '') + '-' + (p.get('les') || '');
  }
  function vinkWaar(k){ try { return localStorage.getItem(k) === 'af'; } catch(e){ return false; } }
  function vinkZet(k, v){ try { localStorage.setItem(k, v ? 'af' : 'open'); } catch(e){} }

  /* ---------- 2 en 3. Subtabbladen ---------- */
  function bouwSubtabs(inhoud){
    var oude = document.getElementById('subtabBalk');
    if (oude) oude.remove();

    var basis = paginaSleutel();
    var koppen = [];

    inhoud.querySelectorAll('h2').forEach(function(h){
      var m = h.textContent.trim().match(/^(\d+\.\d+)\s*(.*)$/);
      if (m) koppen.push({ h: h, nummer: m[1], titel: m[2] || h.textContent.trim() });
    });

    if (koppen.length < 2) return;

    var blokken = Array.prototype.slice.call(inhoud.children);
    var groepen = [];
    var huidige = null;

    blokken.forEach(function(blok){
      var kop = koppen.filter(function(k){ return blok.contains(k.h); })[0];
      if (kop) {
        huidige = { nummer: kop.nummer, titel: kop.titel, elementen: [] };
        groepen.push(huidige);
      }
      if (huidige) huidige.elementen.push(blok);
    });

    if (groepen.length < 2) return;

    groepen.forEach(function(g, i){
      var vak = document.createElement('div');
      vak.className = 'subvak';
      vak.setAttribute('data-subvak', i);
      g.elementen[0].parentNode.insertBefore(vak, g.elementen[0]);
      g.elementen.forEach(function(el){ vak.appendChild(el); });
      g.container = vak;
      g.sleutel = basis + '-' + g.nummer;
    });

    var balk = document.createElement('nav');
    balk.className = 'subtabs';
    balk.id = 'subtabBalk';
    balk.setAttribute('aria-label', 'Onderdelen van dit tabblad');
    balk.innerHTML = groepen.map(function(g, i){
      return '<button type="button" class="subtab" data-subtab="' + i + '">' +
        '<span class="subtab-nr">' + g.nummer + '</span>' +
        '<span class="subtab-titel">' + g.titel + '</span>' +
        '<span class="subtab-vink"></span></button>';
    }).join('');
    inhoud.parentNode.insertBefore(balk, inhoud);

    groepen.forEach(function(g){
      var rij = document.createElement('div');
      rij.className = 'subkop-rij';
      rij.innerHTML = '<button type="button" class="subvink" aria-label="Onderdeel afvinken"></button>' +
        '<span class="subkop-label">' + g.nummer + ' \u00b7 ' + g.titel + '</span>';
      g.container.insertBefore(rij, g.container.firstChild);
      g.vinkKnop = rij.querySelector('.subvink');
      g.vinkRij = rij;

      g.vinkKnop.addEventListener('click', function(){
        vinkZet(g.sleutel, !vinkWaar(g.sleutel));
        werkBij();
      });
    });

    var actief = 0;
    try {
      var bewaard = sessionStorage.getItem(basis + '-subtab');
      if (bewaard !== null && +bewaard < groepen.length) actief = +bewaard;
    } catch(e){}

    function werkBij(){
      groepen.forEach(function(g, i){
        var af = vinkWaar(g.sleutel);
        g.container.hidden = (i !== actief);
        g.vinkKnop.textContent = af ? '\u2713' : '';
        g.vinkRij.classList.toggle('af', af);

        var tab = balk.querySelector('[data-subtab="' + i + '"]');
        tab.classList.toggle('nu', i === actief);
        tab.classList.toggle('af', af);
        tab.querySelector('.subtab-vink').textContent = af ? '\u2713' : '';
      });
    }

    balk.addEventListener('click', function(e){
      var tab = e.target.closest('[data-subtab]');
      if (!tab) return;
      actief = +tab.getAttribute('data-subtab');
      try { sessionStorage.setItem(basis + '-subtab', String(actief)); } catch(err){}
      werkBij();
      var top = balk.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });

    werkBij();
  }

  /* ---------- opstarten ---------- */
  var inhoud = document.getElementById('inhoud');
  if (!inhoud) return;

  balkInklapbaar();

  var timer;
  new MutationObserver(function(){
    clearTimeout(timer);
    timer = setTimeout(function(){ bouwSubtabs(inhoud); }, 30);
  }).observe(inhoud, { childList: true });

  bouwSubtabs(inhoud);
})();
