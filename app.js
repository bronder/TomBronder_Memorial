/* ================================================================
   SETTINGS — edit these to taste, then refresh the page.
   ================================================================ */
var CONFIG = {
  name:          "Tom Bronder",
  years:         "",     // e.g. "1947 – 2026" — leave "" to hide
  closingWords:  "forever in our hearts",
  photoSeconds:  4.5,    // how long each photo stays on screen
  fadeSeconds:   2,      // crossfade length between photos
  titleSeconds:  10,     // opening title card duration
  closingSeconds:12,     // closing card duration before looping
  chapterSeconds:8,      // each chapter card duration
  musicVolume:   0.85,   // 0.0 – 1.0
  kenBurns:      true,   // gentle slow zoom/drift on photos
  chapters:      true,   // show the gentle chapter cards from photos.js
  shuffle:       true,   // randomize photo order — a fresh mix of old & new each visit
};
/* ================================================================ */

(function () {
  var music    = document.getElementById('music');
  var layers   = [document.getElementById('layerA'), document.getElementById('layerB')];
  var progress = document.getElementById('progress');
  var hint     = document.getElementById('hint');
  music.volume = CONFIG.musicVolume;

  // Slide deck: title card, every photo (with optional chapter cards
  // inserted between acts), closing card — then loops.
  var chapters = (typeof CHAPTERS !== 'undefined' && CONFIG.chapters) ? CHAPTERS : [];
  var chapterAt = {};
  for (var ci = 0; ci < chapters.length; ci++) chapterAt[chapters[ci].at] = chapters[ci].text;

  // Play order: a shuffled copy when shuffle is on, otherwise photos.js order.
  var deck = PHOTOS.slice();
  if (CONFIG.shuffle) {
    for (var si0 = deck.length - 1; si0 > 0; si0--) {   // Fisher–Yates
      var sj = Math.floor(Math.random() * (si0 + 1));
      var st = deck[si0]; deck[si0] = deck[sj]; deck[sj] = st;
    }
  }

  var slides = [{ type: 'title', dur: CONFIG.titleSeconds * 1000 }];
  for (var pi = 0; pi < deck.length; pi++) {
    if (chapterAt[pi]) {
      slides.push({ type: 'chapter', text: chapterAt[pi], dur: CONFIG.chapterSeconds * 1000 });
    }
    slides.push({ type: 'photo', src: deck[pi], dur: CONFIG.photoSeconds * 1000 });
  }
  slides.push({ type: 'close', dur: CONFIG.closingSeconds * 1000 });

  // Cumulative start times for the progress bar.
  var starts = [], acc = 0;
  for (var si = 0; si < slides.length; si++) { starts.push(acc); acc += slides[si].dur; }
  var TOTAL = acc;

  document.documentElement.style.setProperty('--fade', CONFIG.fadeSeconds + 's');

  var cur = -1, top = 0;          // top = index of the visible layer
  var timer = null, slideT0 = 0;  // timestamp when the current slide began
  var pausedAt = 0, paused = false, started = false;

  var KB = ['kb-a 14s ease-out both', 'kb-b 14s ease-out both', 'kb-c 16s linear both'];

  function render(slide, layer) {
    layer.innerHTML = '';
    if (slide.type === 'photo') {
      var img = document.createElement('img');
      img.src = slide.src;
      img.alt = '';
      if (CONFIG.kenBurns) {
        img.style.animation = KB[Math.floor(Math.random() * KB.length)];
        img.style.animationDuration = (slide.dur / 1000 + CONFIG.fadeSeconds) + 's';
      }
      layer.appendChild(img);
    } else if (slide.type === 'chapter') {
      var chap = document.createElement('div');
      chap.className = 'card';
      chap.innerHTML = '<div class="chapterText"></div><div class="rule"></div>';
      chap.querySelector('.chapterText').textContent = slide.text;
      layer.appendChild(chap);
    } else {
      var card = document.createElement('div');
      card.className = 'card';
      if (slide.type === 'title') {
        card.innerHTML = '<div class="kicker">in loving memory of</div>' +
               '<h1 class="name"></h1>' +
               (CONFIG.years ? '<div class="years"></div>' : '') +
               '<div class="rule"></div>';
        card.querySelector('.name').textContent = CONFIG.name;
        if (CONFIG.years) card.querySelector('.years').textContent = CONFIG.years;
      } else {
        card.innerHTML = '<div class="kicker"></div><h1 class="name"></h1><div class="rule"></div>';
        card.querySelector('.kicker').textContent = CONFIG.name;
        card.querySelector('.name').textContent = CONFIG.closingWords;
      }
      layer.appendChild(card);
    }
  }

  function show(i) {
    cur = ((i % slides.length) + slides.length) % slides.length;
    var slide = slides[cur];
    var incoming = layers[top ^ 1], outgoing = layers[top];
    render(slide, incoming);
    void incoming.offsetWidth;                     // let the fade start fresh
    incoming.classList.add('on');
    outgoing.classList.remove('on');
    top ^= 1;
    setTimeout(function () {
      if (layers[top ^ 1] !== incoming) layers[top ^ 1].innerHTML = '';
    }, CONFIG.fadeSeconds * 1000 + 80);

    progress.style.width = (starts[cur] / TOTAL * 100).toFixed(3) + '%';

    for (var k = 1; k <= 3; k++) {                 // preload what's coming
      var nx = slides[(cur + k) % slides.length];
      if (nx.type === 'photo') { var im = new Image(); im.src = nx.src; }
    }

    slideT0 = performance.now();
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { show(cur + 1); }, slide.dur);
  }

  function setAnimPaused(state) {
    for (var i = 0; i < layers.length; i++) {
      var els = layers[i].querySelectorAll('img,.card *');
      for (var j = 0; j < els.length; j++) els[j].style.animationPlayState = state;
    }
  }

  function setPaused(p) {
    paused = p;
    if (p) {
      if (timer) clearTimeout(timer);
      pausedAt = performance.now();
      music.pause();
      setAnimPaused('paused');
    } else {
      var remaining = slides[cur].dur - (pausedAt - slideT0);
      music.play().catch(function () {});
      setAnimPaused('');
      timer = setTimeout(function () { show(cur + 1); }, Math.max(0, remaining));
    }
  }

  function goFullscreen() {
    try {
      var el = document.documentElement;
      if (el.requestFullscreen) {
        var p = el.requestFullscreen();
        if (p && p.catch) p.catch(function () {});
      }
    } catch (e) { /* fullscreen is best-effort */ }
  }

  function begin() {
    started = true;
    document.getElementById('start').classList.add('gone');
    hint.classList.add('gone');
    goFullscreen();
    music.play().catch(function () {});
    show(0);
    scheduleIdle();
  }
  document.getElementById('begin').addEventListener('click', begin);

  /* ---- controls ---- */
  document.addEventListener('keydown', function (e) {
    if (!started) { if (e.key === 'Enter' || e.key === ' ') begin(); return; }
    if (e.key === ' ') { setPaused(!paused); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { if (paused) setPaused(false); show(cur + 1); }
    else if (e.key === 'ArrowLeft')  { if (paused) setPaused(false); show(Math.max(0, cur - 1)); }
    else if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) {
        var q = document.exitFullscreen();
        if (q && q.catch) q.catch(function () {});
      } else goFullscreen();
    }
    else if (e.key === 'm' || e.key === 'M') { music.muted = !music.muted; }
  });
  document.getElementById('stage').addEventListener('click', function () {
    if (started) setPaused(!paused);
  });

  /* ---- hide cursor & dim chrome while idle ---- */
  var idleT = null;
  function scheduleIdle() {
    document.body.classList.remove('ui-idle');
    progress.classList.remove('dim');
    if (idleT) clearTimeout(idleT);
    idleT = setTimeout(function () {
      document.body.classList.add('ui-idle');
      progress.classList.add('dim');
    }, 4000);
  }
  document.addEventListener('mousemove', scheduleIdle);
  scheduleIdle();
})();
