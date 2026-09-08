/* ============================================================
   lesextra.js — aanvullingen op de lespagina

   1. De bovenbalk is inklapbaar (knop naast het menu-icoon).
   2. Subnavigatie als keuzemenu: blijft in beeld, ook bij een
      lang tabblad, en springt naar het gekozen subkopje.
   3. Subkopjes (1.1, 1.2, ...) zijn afvinkbaar, met de titel erbij.

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
      knop.textContent = ingeklapt ? '⌄' : '⌃';
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
  function sleutelVanPagina(){
    var p = new URLSearchParams(window.location.search);
    return 'ssms-sub-' + (p.get('vak') || '') + '-' + (p.get('les') || '');
  }
  function vinkWaar(k){ try { return localStorage.getItem(k) === 'af'; } catch(e){ return false; } }
  function vinkZet(k, v){ try { localStorage.setItem(k, v ? 'af' : 'open'); } catch(e){} }

  /* ---------- 2 en 3. Subkopjes en subnavigatie ---------- */
  function bouwSubkoppen(inhoud){
    var oude = document.getElementById('subnavBalk');
    if (oude) oude.remove();

    var basis = sleutelVanPagina();
    var items = [];

    inhoud.querySelectorAll('h2').forEach(function(h){
      var tekst = h.textContent.trim();
      var m = tekst.match(/^(\d+\.\d+)\s*(.*)$/);
      if (!m) return;

      var nummer = m[1];
      var id = 'sub-' + nummer.replace('.', '-');
      var sectie = h.closest('.blok') || h.parentElement;
      if (sectie) sectie.id = id;

      var sleutel = basis + '-' + nummer;
      var af = vinkWaar(sleutel);

      // kop omzetten naar een afvinkbare regel
      var wrap = document.createElement('div');
      wrap.className = 'subkop' + (af ? ' af' : '');
      var knop = document.createElement('button');
      knop.type = 'button';
      knop.className = 'subvink';
      knop.setAttribute('aria-label', 'Onderdeel ' + nummer + ' afvinken');
      knop.textContent = af ? '✓' : '';
      knop.addEventListener('click', function(){
        var nu = !vinkWaar(sleutel);
        vinkZet(sleutel, nu);
        knop.textContent = nu ? '✓' : '';
        wrap.classList.toggle('af', nu);
        werkTellingBij();
      });
      h.parentNode.insertBefore(wrap, h);
      wrap.appendChild(knop);
      wrap.appendChild(h);

      items.push({ id: id, nummer: nummer, titel: m[2] || tekst, sleutel: sleutel });
    });

    if (items.length < 2) return;

    // keuzemenu in plaats van pilletjes: blijft bruikbaar bij lange tabbladen
    var balk = document.createElement('nav');
    balk.className = 'subnav';
    balk.id = 'subnavBalk';
    balk.setAttribute('aria-label', 'Ga naar een onderdeel');

    var select = document.createElement('select');
    select.id = 'subnavKeuze';
    select.innerHTML = '<option value="">Ga naar een onderdeel…</option>' +
      items.map(function(it){
        return '<option value="' + it.id + '">' + it.nummer + '  ' + it.titel + '</option>';
      }).join('');

    var telling = document.createElement('span');
    telling.className = 'subnav-telling';
    telling.id = 'subnavTelling';

    balk.appendChild(select);
    balk.appendChild(telling);
    inhoud.parentNode.insertBefore(balk, inhoud);

    select.addEventListener('change', function(){
      var doel = document.getElementById(select.value);
      if (doel) {
        var top = doel.getBoundingClientRect().top + window.scrollY - 130;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });

    function werkTellingBij(){
      var af = items.filter(function(it){ return vinkWaar(it.sleutel); }).length;
      telling.textContent = af + ' / ' + items.length;
    }
    werkTellingBij();

    // laat het menu meelopen met waar je bent
    window.addEventListener('scroll', function(){
      clearTimeout(window._subnavTimer);
      window._subnavTimer = setTimeout(function(){
        var beste = '', besteAfstand = Infinity;
        items.forEach(function(it){
          var el = document.getElementById(it.id);
          if (!el) return;
          var t = el.getBoundingClientRect().top;
          if (t < 200 && Math.abs(t - 130) < besteAfstand) {
            besteAfstand = Math.abs(t - 130); beste = it.id;
          }
        });
        if (beste && select.value !== beste) select.value = beste;
      }, 80);
    }, { passive: true });
  }

  /* ---------- opstarten ---------- */
  var inhoud = document.getElementById('inhoud');
  if (!inhoud) return;

  balkInklapbaar();

  var timer;
  new MutationObserver(function(){
    clearTimeout(timer);
    timer = setTimeout(function(){ bouwSubkoppen(inhoud); }, 30);
  }).observe(inhoud, { childList: true });

  bouwSubkoppen(inhoud);
})();
