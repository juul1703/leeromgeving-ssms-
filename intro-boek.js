/* ============================================================
   Intro to Safety & Security — boek en collegeslides
   ============================================================

   De hoofdstukken van Bieder & Pettersen Gould staan hier niet als
   losse lijst, maar hangen aan de sessie waar de docent ze behandelt.
   Klik je op sessie 2, dan krijg je H1 en H2. Welke hoofdstukken bij
   welke sessie horen staat in VAK_VOORBEREIDING in ssms-inhoud.js,
   in het veld lesIds. Verandert het programma, dan verandert dit mee.

   Het programma koppelt acht hoofdstukken aan een sessie. De vier die
   overblijven (H4, H6, H8 en H11) komen onderaan te staan onder
   'Overige hoofdstukken', zodat ze niet verdwijnen.

   De lesstof zelf staat in ssms-inhoud.js onder
   LESSTOF['intro-to-safety-security/h1'] tot en met h11. Dit bestand
   verwijst er alleen naar en voegt de juiste hoofdstukken samen tot
   een lespagina per sessie.
   ============================================================ */

(function(){
  if (typeof DATA === 'undefined') return;

  var VAK = 'intro-to-safety-security';

  var SLIDES = [
    { id: 'slides-1', groep: 'Lecture slides',
      titel: 'Sessie 1 \u00b7 SSMS & what it\u2019s all about', duur: 45 }
  ];

  var HOOFDSTUKKEN = {
    h1:  'H1 Safety en security samenbrengen',
    h2:  'H2 Risico, safety en security als concept',
    h3:  'H3 Twee kanten van dezelfde medaille',
    h4:  'H4 Safety versus security in de luchtvaart',
    h5:  'H5 Security- en safetycultuur',
    h6:  'H6 Gebruikerservaring op de luchthaven',
    h7:  'H7 De divergentie van safety en security',
    h8:  'H8 Voorbereiden om verrast te worden',
    h9:  'H9 Spanningen en synergie in management',
    h10: 'H10 Het snijvlak op de werkplek',
    h11: 'H11 Onderzoeks- en managementuitdagingen'
  };

  /* Welke hoofdstukken horen bij welke sessie? Uit het programma. */
  function perSessie(){
    var plan = (typeof VAK_VOORBEREIDING !== 'undefined' && VAK_VOORBEREIDING[VAK]) || {};
    var uit = {};
    Object.keys(plan).forEach(function(n){
      var ids = (plan[n].lesIds || []).filter(function(id){ return HOOFDSTUKKEN[id]; });
      if (ids.length) uit[n] = ids;
    });
    return uit;
  }

  /* Twee hoofdstukken achter elkaar plakken tot een lespagina. De
     tabbladen blijven vier: de blokken van H1 en H2 komen per tabblad
     onder elkaar, met een kopje ertussen zodat je ziet waar je bent. */
  function voegSamen(ids){
    var tabs = [];
    ids.forEach(function(id){
      var bron = LESSTOF[VAK + '/' + id];
      if (!bron) return;
      bron.forEach(function(tab){
        var doel = tabs.filter(function(t){ return t.id === tab.id; })[0];
        if (!doel) { doel = { id: tab.id, titel: tab.titel, blokken: [] }; tabs.push(doel); }
        if (ids.length > 1) {
          doel.blokken.push({ type: 'tekst', titel: HOOFDSTUKKEN[id], tekst: '' });
        }
        doel.blokken = doel.blokken.concat(tab.blokken || []);
      });
    });
    return tabs.length ? tabs : null;
  }

  function isIntro(vak){
    if (!vak) return false;
    if (vak.id === VAK) return true;
    var naam = (vak.naam || '').toLowerCase();
    return naam.indexOf('intro') > -1 && naam.indexOf('safety') > -1;
  }

  function zet(){
    var koppeling = perSessie();
    var gebruikt = {};

    /* De lesstof van een sessie klaarzetten onder college-N. */
    Object.keys(koppeling).forEach(function(n){
      var ids = koppeling[n];
      ids.forEach(function(id){ gebruikt[id] = true; });
      var samen = voegSamen(ids);
      if (samen) LESSTOF[VAK + '/college-' + n] = samen;
    });

    /* Wat niet aan een sessie hangt, blijft apart bereikbaar. */
    var rest = Object.keys(HOOFDSTUKKEN)
      .filter(function(id){ return !gebruikt[id]; })
      .map(function(id){
        return { id: id, groep: 'Overige hoofdstukken', titel: HOOFDSTUKKEN[id], duur: 60 };
      });

    var extra = SLIDES.concat(rest);

    DATA.semesters.forEach(function(sem){
      var gevonden = false;
      sem.vakken.forEach(function(vak){
        if (!isIntro(vak)) return;
        gevonden = true;
        var over = (vak.lessen || []).filter(function(l){
          return l.groep !== 'Lecture slides' && l.groep !== 'Boek' && l.groep !== 'Overige hoofdstukken';
        });
        vak.lessen = over.concat(extra);
      });
      if (!gevonden && sem.id === DATA.actiefSemester) {
        sem.vakken.push({ id: VAK, naam: 'Intro to Safety & Security', lessen: extra.slice() });
      }
    });
  }

  zet();
  if (typeof opFeed === 'function') opFeed(zet);
})();
