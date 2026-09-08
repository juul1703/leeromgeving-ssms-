/* ============================================================
   lesextra.js — aanvullingen op de lespagina

   1. De bovenbalk is inklapbaar (pijl-knop naast het menu-icoon).
   2. Subkopjes (1.1, 1.2, ...) worden echte tabbladen: je ziet één
      onderdeel tegelijk, met een tabbalk die in beeld blijft.
   3. Elk subonderdeel is afvinkbaar, met nummer en titel erbij.
   4. Onderaan elk subonderdeel staat een knop 'Verder': die vinkt
      het onderdeel af en springt naar het volgende. Bij het laatste
      subonderdeel rondt hij het hele tabblad af.
   5. Waar je gebleven was blijft bewaard, ook na afsluiten.

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
    var tab = document.getElementById('tabTitel');
    var tabDeel = tab ? tab.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
    return 'ssms-sub-' + (p.get('vak') || '') + '-' + (p.get('les') || '') + '-' + tabDeel;
  }
  function vinkWaar(k){ try { return localStorage.getItem(k) === 'af'; } catch(e){ return false; } }
  function vinkZet(k, v){ try { localStorage.setItem(k, v ? 'af' : 'open'); } catch(e){} }

  /* ---------- 2, 3 en 4. Subtabbladen ---------- */
  function bouwSubtabs(inhoud){
    var oude = document.getElementById('subtabBalk');
    if (oude) oude.remove();

    // al opgebouwd? dan eerst terug naar de platte inhoud
    inhoud.querySelectorAll('.subvak').forEach(function(vak){
      var rij = vak.querySelector('.subkop-rij'); if (rij) rij.remove();
      var voet = vak.querySelector('.subverder'); if (voet) voet.remove();
      while (vak.firstChild) vak.parentNode.insertBefore(vak.firstChild, vak);
      vak.remove();
    });

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

    var actief = 0;
    try {
      var bewaard = localStorage.getItem(basis + '-plek');
      if (bewaard !== null && +bewaard < groepen.length) actief = +bewaard;
    } catch(e){}

    /* kopregel met vinkje, en onderaan de verder-knop */
    groepen.forEach(function(g, i){
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

      var laatste = i === groepen.length - 1;
      var voet = document.createElement('div');
      voet.className = 'subverder';
      voet.innerHTML = '<button type="button" class="btn">' +
        (laatste ? 'Afvinken en tabblad afronden \u2192' : 'Afvinken en verder \u2192') +
        '</button><span class="subverder-hint">' +
        (laatste ? 'hiermee is dit tabblad klaar' : 'volgende: ' + groepen[i + 1].nummer + ' \u00b7 ' + groepen[i + 1].titel) +
        '</span>';
      g.container.appendChild(voet);

      voet.querySelector('button').addEventListener('click', function(){
        vinkZet(g.sleutel, true);
        werkBij();
        if (!laatste) return naarSub(i + 1);
        rondTabblad();
      });
    });

    function naarSub(i){
      actief = i;
      try { localStorage.setItem(basis + '-plek', String(i)); } catch(e){}
      werkBij();
      var top = balk.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }

    /* Alles afgevinkt? Dan het hele tabblad afronden via de knop van les.js,
       die zelf al doorspringt naar het volgende onderdeel. */
    function rondTabblad(){
      var af = document.getElementById('tabAf');
      if (af && af.className.indexOf('af') < 0) return af.click();
      var volg = document.getElementById('tabVolgende');
      if (volg) volg.click();
    }

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
      naarSub(+tab.getAttribute('data-subtab'));
    });

    werkBij();
  }

  /* ---------- opstarten ---------- */
  var inhoud = document.getElementById('inhoud');
  if (!inhoud) return;

  balkInklapbaar();

  /* De observer kijkt of les.js een nieuw tabblad heeft neergezet. Tijdens
     het opbouwen zetten we hem uit: bouwSubtabs verplaatst zelf blokken, en
     dat liet hem vroeger opnieuw afgaan — met dubbele rijen tot gevolg. */
  var timer;
  var waker = new MutationObserver(function(){
    clearTimeout(timer);
    timer = setTimeout(opnieuw, 30);
  });

  function opnieuw(){
    waker.disconnect();
    try { bouwSubtabs(inhoud); } catch(e){}
    waker.observe(inhoud, { childList: true });
  }

  opnieuw();
})();
