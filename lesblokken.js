/* ============================================================
   Lesblokken — de bouwstenen waarmee een les is opgebouwd.
   Elk blok is een object met een 'type'. Zie README voor de lijst.
   ============================================================ */

function blokHtml(b, ctx){
  var f = BLOKKEN[b.type];
  if (!f) return '<div class="blok blok-onbekend">Onbekend bloktype: <code>' + esc(b.type) + '</code></div>';
  var stof = b.toetsstof ? '<span class="stof-vlag" title="Dit is toetsstof">toetsstof</span>' : '';
  return '<section class="blok blok-' + esc(b.type) + '">' + stof + f(b, ctx || {}) + '</section>';
}

function blokkenHtml(lijst, ctx){
  if (!lijst || !lijst.length) {
    return '<div class="leegmelding" style="margin:0;"><b>Dit onderdeel is nog leeg</b>' +
      '<span>Vul het in <code>app.js</code>, of gebruik dit tabblad als schrijfblok in je aantekening.</span></div>';
  }
  return lijst.map(function(b){ return blokHtml(b, ctx); }).join('');
}

function rijkeTekst(s){
  // **dik**, *cursief*, `code` en alinea's op lege regels
  var t = esc(s || '');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
       .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
       .replace(/`([^`]+)`/g, '<code>$1</code>');
  return t.split(/\n\s*\n/).map(function(p){
    return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
  }).join('');
}

var KADER_LABEL = { uitleg: 'Uitleg', waarschuwing: 'Let op', voorbeeld: 'Voorbeeld', slimmer: 'Slimmer werken', hardop: 'Hardop redeneren' };

var BLOKKEN = {

  tekst: function(b){
    return (b.titel ? '<h2>' + esc(b.titel) + '</h2>' : '') +
      (b.html ? b.html : rijkeTekst(b.tekst));
  },

  /* ---- kaders ---- */
  uitleg: function(b){ return kader('uitleg', b); },
  waarschuwing: function(b){ return kader('waarschuwing', b); },
  voorbeeld: function(b){ return kader('voorbeeld', b); },
  slimmer: function(b){ return kader('slimmer', b); },
  hardop: function(b){
    return '<div class="kader kader-hardop"><div class="kader-kop">' +
      '<span class="kader-label">' + KADER_LABEL.hardop + '</span>' +
      (b.titel ? '<span class="kader-titel">' + esc(b.titel) + '</span>' : '') + '</div>' +
      '<div class="kader-body">' + rijkeTekst(b.tekst) +
      (b.stappen && b.stappen.length
        ? '<ol class="hardop-lijst">' + b.stappen.map(function(s){
            return '<li>' + esc(s) + '</li>';
          }).join('') + '</ol>'
        : '') + '</div></div>';
  },

  /* ---- leerdoelen ----
     Blijft bestaan voor losse gevallen, maar in een uitgewerkte les worden
     leerdoelen automatisch verplaatst naar het laatste tabblad 'Kun je dit?'
     (zie lesstof.js). */
  leerdoelen: function(b, ctx){
    return '<h2>' + esc(b.titel || 'Na dit onderdeel kun je') + '</h2>' +
      '<ul class="doelen">' + (b.items || []).map(function(d, i){
        var doel = typeof d === 'string' ? d : d.doel;
        var k = ctx.sleutel + '-doel-' + i;
        var af = lokaalWaar(k);
        return '<li class="doel' + (af ? ' af' : '') + '">' +
          '<button class="vink" data-vinkdoel="' + esc(k) + '">' + (af ? '✓' : '') + '</button>' +
          '<span>' + esc(doel) + '</span></li>';
      }).join('') + '</ul>';
  },

  /* ---- afvinklijst met uitleg per vaardigheid (laatste tabblad) ---- */
  checklist: function(b, ctx){
    var items = (b.items || []).map(function(d, i){
      var doel = typeof d === 'string' ? { doel: d } : d;
      var k = (ctx.sleutel || 'check') + '-kun-' + i;
      var af = lokaalWaar(k);
      return '<li class="kun' + (af ? ' af' : '') + '">' +
        '<button class="vink" data-vinkdoel="' + esc(k) + '">' + (af ? '✓' : '') + '</button>' +
        '<div class="kun-tekst"><span class="kun-doel">' + esc(doel.doel) + '</span>' +
        (doel.uitleg
          ? '<details class="kun-uitleg"><summary>Zo doe je dit</summary>' +
            '<div class="kun-body">' + rijkeTekst(doel.uitleg) + '</div></details>'
          : '') +
        '</div></li>';
    }).join('');
    return '<div class="blok-kop"><h2>' + esc(b.titel || 'Kun je dit?') + '</h2>' +
      '<span class="hint">vink alleen af wat je hardop kunt uitleggen</span></div>' +
      (b.tekst ? rijkeTekst(b.tekst) : '') +
      '<ul class="kunlijst">' + items + '</ul>';
  },

  /* ---- citaat ---- */
  citaat: function(b){
    return '<blockquote class="citaat"><p>' + esc(b.tekst) + '</p>' +
      (b.bron ? '<footer>' + esc(b.bron) + (b.jaar ? ' (' + esc(b.jaar) + ')' : '') +
        (b.url ? ' · <a href="' + esc(b.url) + '" target="_blank" rel="noopener">bron</a>' : '') +
        '</footer>' : '') + '</blockquote>';
  },

  /* ---- tabel ---- */
  tabel: function(b){
    return (b.titel ? '<h2>' + esc(b.titel) + '</h2>' : '') +
      '<div class="tabel-wrap"><table><thead><tr>' +
      (b.kop || []).map(function(k){ return '<th>' + esc(k) + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
      (b.rijen || []).map(function(r){
        return '<tr>' + r.map(function(c){ return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>' +
      (b.noot ? '<p class="noot">' + esc(b.noot) + '</p>' : '');
  },

  /* ---- stap-voor-stap accordion ---- */
  stappen: function(b){
    return (b.titel ? '<h2>' + esc(b.titel) + '</h2>' : '') +
      '<div class="stappen">' + (b.items || []).map(function(s, i){
        return '<details class="stap"' + (i === 0 ? ' open' : '') + '><summary>' +
          '<span class="stap-nr">' + (i + 1) + '</span><span>' + esc(s.titel) + '</span></summary>' +
          '<div class="stap-body">' + rijkeTekst(s.tekst) + '</div></details>';
      }).join('') + '</div>';
  },

  /* ---- twee kolommen vergelijken ---- */
  vergelijking: function(b){
    function kolom(k, soort){
      return '<div class="verg-kolom verg-' + soort + '"><h3>' + esc(k.titel) + '</h3>' +
        (k.tekst ? rijkeTekst(k.tekst) : '') +
        (k.punten && k.punten.length
          ? '<ul>' + k.punten.map(function(p){ return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>'
          : '') + '</div>';
    }
    return (b.titel ? '<h2>' + esc(b.titel) + '</h2>' : '') +
      '<div class="vergelijking">' + kolom(b.links || {}, 'links') + kolom(b.rechts || {}, 'rechts') + '</div>';
  },

  /* ---- flashcards ---- */
  flashcards: function(b){
    return '<div class="blok-kop"><h2>' + esc(b.titel || 'Flashcards') + '</h2>' +
      '<span class="hint">klik om te draaien · klik op de tekst om te kopiëren</span></div>' +
      '<div class="kaarten">' + (b.kaarten || []).map(function(k, i){
        return '<div class="kaart" data-kaart="' + i + '">' +
          '<div class="kaart-vlak kaart-voor"><span class="kaart-rol">begrip</span>' +
          '<span class="kopieer" data-kopieer="' + esc(k.begrip) + '">' + esc(k.begrip) + '</span></div>' +
          '<div class="kaart-vlak kaart-achter"><span class="kaart-rol">definitie</span>' +
          '<span class="kopieer" data-kopieer="' + esc(k.definitie) + '">' + esc(k.definitie) + '</span></div>' +
          '</div>';
      }).join('') + '</div>';
  },

  /* ---- kernbegrippen met tooltip ---- */
  begrippen: function(b){
    return '<div class="blok-kop"><h2>' + esc(b.titel || 'Kernbegrippen') + '</h2>' +
      '<span class="hint">hover voor de definitie · klik om te kopiëren</span></div>' +
      '<div class="begrippen">' + (b.items || []).map(function(t){
        return '<button class="begrip" data-kopieer="' + esc(t.definitie) + '">' + esc(t.begrip) +
          (t.en ? '<span class="begrip-en">' + esc(t.en) + '</span>' : '') +
          '<span class="tooltip">' + esc(t.definitie) + '</span></button>';
      }).join('') + '</div>';
  },

  /* ---- oefening met modelantwoord ---- */
  oefening: function(b){
    return '<div class="oefening"><div class="oef-kop"><span class="kader-label">Oefening</span>' +
      (b.niveau ? '<span class="pil">' + esc(b.niveau) + '</span>' : '') + '</div>' +
      rijkeTekst(b.vraag) +
      (b.eigenAntwoord === false ? '' :
        '<textarea class="oef-veld" data-oef="' + esc(b.id || '') + '" placeholder="Schrijf hier je antwoord…"></textarea>') +
      '<details class="model"><summary>Modelantwoord</summary><div class="model-body">' +
      rijkeTekst(b.antwoord) + '</div></details></div>';
  },

  /* ---- video ---- */
  video: function(b){
    return '<div class="videoblok"><div class="video-tekst">' +
      '<span class="kader-label">Video</span>' +
      '<h3>' + esc(b.titel) + '</h3>' +
      (b.tekst ? '<p>' + esc(b.tekst) + '</p>' : '') +
      (b.duur ? '<span class="video-duur">' + esc(b.duur) + '</span>' : '') + '</div>' +
      '<a class="btn" href="' + esc(b.url) + '" target="_blank" rel="noopener">Bekijk video &rarr;</a></div>';
  },

  /* ---- quiz ---- */
  quiz: function(b, ctx){
    return '<div class="quiz" data-quiz="' + esc(ctx.sleutel || '') + '">' +
      '<div class="blok-kop"><h2>' + esc(b.titel || 'Check jezelf') + '</h2>' +
      '<span class="quiz-score" data-score>0 / ' + (b.vragen || []).length + '</span></div>' +
      (b.vragen || []).map(function(v, i){
        return '<div class="qvraag" data-vraag="' + i + '" data-juist="' + v.juist + '">' +
          '<p class="qtekst"><span class="qnr">' + (i + 1) + '</span>' + esc(v.vraag) + '</p>' +
          '<div class="qopties">' + (v.opties || []).map(function(o, j){
            return '<button class="qoptie" data-optie="' + j + '">' + esc(o) + '</button>';
          }).join('') + '</div>' +
          '<div class="quitleg" hidden>' + rijkeTekst(v.uitleg || '') + '</div></div>';
      }).join('') + '</div>';
  },

  /* ---- preview volgende les ---- */
  preview: function(b, ctx){
    var href = b.vakId && b.lesId
      ? 'les.html?vak=' + encodeURIComponent(b.vakId) + '&les=' + encodeURIComponent(b.lesId)
      : (ctx.volgendeHref || 'index.html');
    return '<a class="preview" href="' + href + '"><span class="kader-label">Volgende les</span>' +
      '<h3>' + esc(b.titel) + '</h3>' +
      (b.tekst ? '<p>' + esc(b.tekst) + '</p>' : '') +
      (b.punten && b.punten.length
        ? '<ul>' + b.punten.map(function(p){ return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>'
        : '') +
      '<span class="preview-actie">Vooruitkijken &rarr;</span></a>';
  },

  /* ---- bronnen ---- */
  bronnen: function(b){
    return '<h2>' + esc(b.titel || 'Bronnen') + '</h2><ol class="bronnen">' +
      (b.items || []).map(function(s){
        return '<li><span class="kopieer" data-kopieer="' + esc(s.apa || s.titel) + '">' +
          esc(s.apa || s.titel) + '</span>' +
          (s.url ? ' <a href="' + esc(s.url) + '" target="_blank" rel="noopener">openen</a>' : '') + '</li>';
      }).join('') + '</ol><p class="noot">Klik op een bron om de APA-verwijzing te kopiëren.</p>';
  }
};

function kader(soort, b){
  return '<div class="kader kader-' + soort + '"><div class="kader-kop">' +
    '<span class="kader-label">' + (KADER_LABEL[soort] || soort) + '</span>' +
    (b.titel ? '<span class="kader-titel">' + esc(b.titel) + '</span>' : '') + '</div>' +
    '<div class="kader-body">' + rijkeTekst(b.tekst) +
    (b.punten && b.punten.length
      ? '<ul>' + b.punten.map(function(p){ return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>'
      : '') + '</div></div>';
}

/* kleine opslaghulp voor losse vinkjes */
function lokaalWaar(k){ try { return localStorage.getItem(k) === 'af'; } catch(e){ return false; } }
function lokaalZet(k, v){ try { localStorage.setItem(k, v ? 'af' : 'open'); } catch(e){} }
