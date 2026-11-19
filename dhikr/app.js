(() => {
  'use strict';

  const GOAL = 100;
  // Each dhikr gets its own misbaha stone.
  const DHIKR = [
    { ar: 'أَسْتَغْفِرُ ٱللَّٰهَ', short: 'أستغفر الله', tr: 'Astaghfirullah', stone: 'malaquita',
      c: '#2e7d5b', hi: '#9ad6b4', lo: '#0c3324' },
    { ar: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', short: 'لا إله إلا الله', tr: 'La ilaha illa Allah', stone: 'lapislázuli',
      c: '#2d4c9c', hi: '#a3b6ee', lo: '#0f1c4a' },
    { ar: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', short: 'صلوات على النبي ﷺ', tr: 'Salawat <span class="saw" lang="ar">ﷺ</span>', stone: 'ámbar',
      c: '#c07a1e', hi: '#f6d08a', lo: '#5e3206' },
  ];
  const MILESTONES = { 33: 'Un tercio', 50: 'La mitad', 66: 'Dos tercios', 90: 'Quedan diez' };

  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const KEY = 'noor:v1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const darkMQ = matchMedia('(prefers-color-scheme: dark)');

  // ---------- storage ----------
  let state = { days: {}, sound: true, best: 0, celebrated: {} };
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (_) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} };

  const dayKey = (d = new Date()) => {
    const z = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  };
  let today = dayKey();
  const counts = () => (state.days[today] ||= [0, 0, 0]);
  const sum = (arr) => (arr || []).reduce((a, b) => a + Math.min(b, GOAL), 0);
  const isComplete = (arr) => !!arr && arr.every((n) => n >= GOAL);
  const everCounted = () => Object.values(state.days).some((a) => sum(a) > 0);

  let current = counts().findIndex((n) => n < GOAL);
  if (current < 0) current = 0;

  // ---------- ledger ----------
  const list = $('list');
  DHIKR.forEach((d, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button class="row" style="--c:${d.c};--hi:${d.hi};--lo:${d.lo}">
      <span class="gem" aria-hidden="true"></span>
      <span class="name"><span class="ar" lang="ar" dir="rtl">${d.short}</span><span class="lat">${d.tr} · ${d.stone}</span></span>
      <span class="n"><b>0</b><span class="of"> / ${GOAL}</span></span>
      <span class="track" aria-hidden="true"><span class="bar"></span></span>
    </button>`;
    li.firstElementChild.addEventListener('click', () => { if (i !== current) { select(i); haptic(); } });
    list.appendChild(li);
  });
  const rows = [...list.querySelectorAll('.row')];

  // ---------- count display (rolling digits) ----------
  const countEl = $('count');
  let shown = null;
  function showCount(v) {
    if (v === shown) return;
    const dir = shown == null ? 0 : v > shown ? 1 : -1;
    shown = v;
    const nu = document.createElement('span');
    nu.textContent = v;
    if (dir && !reduce) nu.className = dir > 0 ? 'in-up' : 'in-down';
    [...countEl.children].forEach((old) => {
      if (!dir || reduce) return old.remove();
      old.className = dir > 0 ? 'out-up' : 'out-down';
      setTimeout(() => old.remove(), 190);
    });
    while (countEl.children.length > 1) countEl.firstElementChild.remove();
    countEl.appendChild(nu);
    countEl.setAttribute('aria-label', `${v} de ${GOAL}`);
  }

  // ---------- render ----------
  function render() {
    const c = counts();
    showCount(c[current]);
    rows.forEach((r, i) => {
      r.setAttribute('aria-current', i === current);
      r.classList.toggle('full', c[i] >= GOAL);
      r.querySelector('b').textContent = c[i];
      r.querySelector('.bar').style.transform = `scaleX(${Math.min(1, c[i] / GOAL)})`;
    });
    $('total').textContent = sum(c);
    $('streak').textContent = streak().current;
    beads.target(c[current]);
  }

  function select(i, first = false) {
    const changed = i !== current || first;
    current = i;
    const d = DHIKR[i];
    root.style.setProperty('--stone', d.c);
    root.style.setProperty('--stone-hi', d.hi);
    const ph = $('phrase');
    if (changed && !first && !reduce) {
      ph.classList.remove('swap'); void ph.offsetWidth; ph.classList.add('swap');
    }
    ph.textContent = d.ar;
    shown = null; countEl.textContent = '';
    beads.setStone(d, counts()[i]);
    setNote();
    render();
  }

  let noteT;
  function setNote(msg) {
    const n = $('note');
    clearTimeout(noteT);
    if (msg) {
      n.textContent = msg; n.classList.add('flash');
      noteT = setTimeout(() => setNote(), 2400);
      return;
    }
    n.classList.remove('flash');
    const v = counts()[current];
    n.textContent = v >= GOAL ? 'completo' : !everCounted() ? 'toca para empezar' : `de ${GOAL}`;
  }

  // ---------- dates ----------
  function renderDate() {
    const now = new Date();
    const g = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }).replace('.', '');
    $('dateG').textContent = g.charAt(0).toUpperCase() + g.slice(1);
    try {
      const p = new Intl.DateTimeFormat('es-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(now);
      const get = (t) => (p.find((x) => x.type === t) || {}).value || '';
      $('dateH').textContent = `${get('day')} ${get('month')} ${get('year').replace(/\D/g, '')} H`;
    } catch (_) { $('dateH').textContent = ''; }
  }

  // ---------- streaks ----------
  function streak() {
    const d = new Date();
    let cur = 0;
    if (!isComplete(state.days[dayKey(d)])) d.setDate(d.getDate() - 1);
    while (isComplete(state.days[dayKey(d)])) { cur++; d.setDate(d.getDate() - 1); }
    const keys = Object.keys(state.days).filter((k) => isComplete(state.days[k])).sort();
    let best = 0, run = 0, prev = null;
    for (const k of keys) {
      const t = new Date(k + 'T12:00:00');
      run = prev && Math.round((t - prev) / 864e5) === 1 ? run + 1 : 1;
      best = Math.max(best, run); prev = t;
    }
    state.best = Math.max(state.best || 0, best);
    return { current: cur, best: state.best };
  }

  // ---------- sound ----------
  let ac, noise;
  function audio() {
    if (!state.sound) return null;
    try {
      ac ||= new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      if (!noise) {
        noise = ac.createBuffer(1, Math.round(ac.sampleRate * 0.05), ac.sampleRate);
        const ch = noise.getChannelData(0);
        for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch.length, 6);
      }
      return ac;
    } catch (_) { return null; }
  }
  // Two stones knocking: a filtered noise transient with a short echo.
  function clack(pitch = 1) {
    const a = audio(); if (!a) return;
    const t = a.currentTime;
    [0, 0.042].forEach((dt, k) => {
      const s = a.createBufferSource(); s.buffer = noise;
      const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = (k ? 2500 : 3300) * pitch; f.Q.value = 7;
      const g = a.createGain(); g.gain.value = k ? 0.3 : 0.55;
      s.connect(f).connect(g).connect(a.destination); s.start(t + dt);
    });
  }
  function bell(freqs, vol = 0.06) {
    const a = audio(); if (!a) return;
    freqs.forEach((fr, i) => {
      const t = a.currentTime + i * 0.13;
      [1, 2.76].forEach((h, k) => {
        const o = a.createOscillator(), g = a.createGain();
        o.type = 'sine'; o.frequency.value = fr * h;
        const v = k ? vol * 0.18 : vol;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + (k ? 0.5 : 1.6));
        o.connect(g).connect(a.destination); o.start(t); o.stop(t + 1.7);
      });
    });
  }

  // ---------- haptics ----------
  // Android: Vibration API. iOS Safari 18+: toggling a native switch gives a tick.
  const canVibrate = typeof navigator.vibrate === 'function';
  let hapLabel;
  function iosTick() {
    try {
      if (!hapLabel) {
        hapLabel = document.createElement('label');
        hapLabel.setAttribute('aria-hidden', 'true');
        hapLabel.style.display = 'none';
        const inp = document.createElement('input');
        inp.type = 'checkbox'; inp.setAttribute('switch', '');
        hapLabel.appendChild(inp);
        document.body.appendChild(hapLabel);
      }
      hapLabel.click();
    } catch (_) {}
  }
  function haptic(pattern = 8) {
    if (canVibrate) { try { navigator.vibrate(pattern); } catch (_) {} return; }
    const pulses = Array.isArray(pattern) ? Math.ceil(pattern.length / 2) : 1;
    iosTick();
    for (let i = 1; i < pulses; i++) setTimeout(iosTick, i * 110);
  }

  // ---------- keep the screen on while counting ----------
  let wake = null;
  async function keepAwake() {
    try { if (!wake && 'wakeLock' in navigator && !document.hidden) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => (wake = null)); } } catch (_) {}
  }

  // ---------- counting ----------
  function increment() {
    rollover();
    keepAwake();
    const c = counts();
    if (c[current] >= GOAL) {
      const next = c.findIndex((n) => n < GOAL);
      if (next >= 0) { select(next); haptic(); } else setNote('Hoy ya está completo');
      return;
    }
    const n = ++c[current];
    save();
    render();

    if (n === GOAL) {
      haptic([30, 70, 30, 70, 120]);
      bell([523.25, 659.25, 783.99]);
      beads.shimmer();
      if (isComplete(c)) {
        setNote('completo');
        if (!state.celebrated[today]) { state.celebrated[today] = true; save(); setTimeout(showDone, 1500); }
      } else {
        setNote('Masha’Allah');
        const next = c.findIndex((v) => v < GOAL);
        setTimeout(() => { if (counts()[current] >= GOAL) select(next); }, 1700);
      }
    } else if (MILESTONES[n]) {
      haptic([18, 60, 18]);
      clack(0.85); bell([880], 0.045);
      setNote(MILESTONES[n]);
    } else {
      haptic(8);
      clack(1 + current * 0.08);
      if (n === 1) setNote();
    }
  }

  const misbaha = $('misbaha');
  misbaha.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    e.preventDefault();
    misbaha.classList.add('press');
    increment();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => misbaha.addEventListener(ev, () => misbaha.classList.remove('press')));
  misbaha.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('keydown', (e) => {
    if (!$('sheet').hidden || !$('done').hidden) { if (e.key === 'Escape') { closeSheet(); $('done').hidden = true; } return; }
    if ((e.code === 'Space' || e.code === 'Enter') && (e.target === misbaha || e.target === document.body)) { e.preventDefault(); increment(); }
    if (e.key === 'ArrowDown') select((current + 1) % 3);
    if (e.key === 'ArrowUp') select((current + 2) % 3);
  });

  $('undoBtn').addEventListener('click', () => {
    const c = counts();
    if (c[current] > 0) { c[current]--; if (!isComplete(c)) delete state.celebrated[today]; save(); render(); setNote(); haptic(5); }
  });

  const soundBtn = $('soundBtn');
  const syncSound = () => {
    soundBtn.setAttribute('aria-pressed', state.sound);
    soundBtn.setAttribute('aria-label', state.sound ? 'Sonido activado' : 'Sonido desactivado');
  };
  soundBtn.addEventListener('click', () => { state.sound = !state.sound; save(); syncSound(); if (state.sound) clack(); haptic(); });
  syncSound();

  // ---------- constancia sheet ----------
  function openSheet() {
    const s = streak();
    const days = (v) => `${v} ${v === 1 ? 'día' : 'días'}`;
    $('sStreak').textContent = days(s.current);
    $('sBest').textContent = days(s.best);
    $('sAll').textContent = Object.values(state.days).reduce((a, arr) => a + sum(arr), 0).toLocaleString('es-ES');
    $('resetName').textContent = DHIKR[current].tr.replace(/<[^>]+>/g, '');
    $('resetConfirm').hidden = true;

    $('calHead').innerHTML = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => `<span>${d}</span>`).join('');
    const cal = $('cal'); cal.innerHTML = '';
    const now = new Date();
    const start = new Date(); start.setDate(now.getDate() - ((now.getDay() + 6) % 7) - 28);
    for (let d = new Date(start), i = 0; i < 35; i++, d.setDate(d.getDate() + 1)) {
      if (d > now) { cal.insertAdjacentHTML('beforeend', '<i class="x"></i>'); continue; }
      const k = dayKey(d), tot = sum(state.days[k]);
      const lvl = tot === 0 ? 0 : tot >= 300 ? 3 : tot >= 150 ? 2 : 1;
      cal.insertAdjacentHTML('beforeend', `<i class="k${lvl}${k === today ? ' today' : ''}" style="--i:${i}" title="${k}: ${tot}/300">${d.getDate()}</i>`);
    }
    const sh = $('sheet');
    sh.hidden = false; sh.classList.remove('closing');
  }
  function closeSheet() {
    const sh = $('sheet');
    if (sh.hidden) return;
    if (reduce) { sh.hidden = true; return; }
    sh.classList.add('closing');
    setTimeout(() => { sh.hidden = true; sh.classList.remove('closing'); }, 220);
  }
  $('streakBtn').addEventListener('click', openSheet);
  $('closeSheet').addEventListener('click', closeSheet);
  $('sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet') closeSheet(); });
  // drag the sheet down to close
  (() => {
    const body = $('sheet').querySelector('.sheet-body');
    let y0 = null, dy = 0;
    body.addEventListener('touchstart', (e) => { if (body.scrollTop <= 0) { y0 = e.touches[0].clientY; dy = 0; body.style.transition = 'none'; } }, { passive: true });
    body.addEventListener('touchmove', (e) => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); body.style.transform = `translateY(${dy}px)`; }, { passive: true });
    body.addEventListener('touchend', () => {
      if (y0 == null) return;
      body.style.transition = 'transform .25s cubic-bezier(.2,.9,.2,1)';
      body.style.transform = '';
      if (dy > 90) closeSheet();
      y0 = null;
    });
  })();
  $('resetBtn').addEventListener('click', () => ($('resetConfirm').hidden = false));
  $('resetNo').addEventListener('click', () => ($('resetConfirm').hidden = true));
  $('resetYes').addEventListener('click', () => {
    counts()[current] = 0; delete state.celebrated[today]; save();
    closeSheet(); render(); setNote(); haptic(20);
  });

  function showDone() {
    const s = streak().current;
    $('doneStreak').textContent = s;
    $('doneDays').textContent = s === 1 ? 'día' : 'días';
    $('done').hidden = false;
  }
  $('closeDone').addEventListener('click', () => ($('done').hidden = true));

  // ---------- day rollover ----------
  function rollover() {
    const k = dayKey();
    if (k !== today) { today = k; renderDate(); select(0); }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { rollover(); if (wake === null && everCounted()) keepAwake(); } });
  setInterval(rollover, 60_000);

  // ---------- the misbaha ----------
  // 100 beads packed on a loop of string. Counted beads sit on one side, the
  // rest on the other; one free gap travels round the loop as you count, the
  // way a thumb pushes beads along a real misbaha. Each bead is a damped
  // spring, so a pushed bead knocks into its neighbour and settles. The loop
  // only runs while something is moving.
  const beads = (() => {
    const cv = $('beads'), ctx = cv.getContext('2d', { alpha: true });
    const GAP = 3.4;          // free space on the string, in bead widths
    const TASSEL = 0.27;      // radians left open at the bottom for the knot
    const pos = new Float32Array(GOAL).fill(GAP);
    const vel = new Float32Array(GOAL);
    const wakeAt = new Float32Array(GOAL);
    let n = 0, W = 0, H = 0, dpr = 1, stone = DHIKR[current];
    let sprite = {}, ink = '#14211c', paper = '#eceee7';
    let raf = 0, last = 0;
    let swing = 0, swingV = 0, shimmerT = -1;

    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };

    function readTheme() {
      const cs = getComputedStyle(root);
      ink = cs.getPropertyValue('--ink').trim() || ink;
      paper = cs.getPropertyValue('--paper').trim() || paper;
    }
    function resize() {
      const r = cv.getBoundingClientRect();
      if (!r.width) return;
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      readTheme(); buildSprites(); kick();
    }
    function geometry() {
      const R = W * 0.43, cx = W / 2, cy = W / 2;
      const step = (Math.PI * 2 - TASSEL) / (GOAL + GAP);
      const br = Math.min(R * step * 0.5, 10);
      return { R, cx, cy, step, br, a0: Math.PI / 2 + TASSEL / 2 };
    }
    function bead(rad, hi, mid, lo, gloss = 0.8) {
      const s = Math.ceil((rad * 2 + 3) * dpr);
      const c = document.createElement('canvas'); c.width = c.height = s;
      const x = c.getContext('2d'); const m = s / 2, r = rad * dpr;
      // contact shadow
      x.fillStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.arc(m + r * 0.08, m + r * 0.16, r, 0, 7); x.fill();
      const g = x.createRadialGradient(m - r * 0.35, m - r * 0.4, r * 0.08, m, m, r);
      g.addColorStop(0, hi); g.addColorStop(0.55, mid); g.addColorStop(1, lo);
      x.fillStyle = g; x.beginPath(); x.arc(m, m, r, 0, 7); x.fill();
      if (gloss) {
        x.globalAlpha = gloss; x.fillStyle = '#fff';
        x.beginPath(); x.ellipse(m - r * 0.32, m - r * 0.4, r * 0.24, r * 0.13, -0.6, 0, 7); x.fill();
      }
      return c;
    }
    function glow(rad) {
      const s = Math.ceil(rad * 6 * dpr), c = document.createElement('canvas'); c.width = c.height = s;
      const x = c.getContext('2d'), m = s / 2;
      const g = x.createRadialGradient(m, m, 0, m, m, m);
      g.addColorStop(0, 'rgba(255,248,225,.95)'); g.addColorStop(0.25, 'rgba(255,240,200,.45)'); g.addColorStop(1, 'rgba(255,240,200,0)');
      x.fillStyle = g; x.fillRect(0, 0, s, s);
      return c;
    }
    function buildSprites() {
      if (!W) return;
      const { br } = geometry();
      const dark = darkMQ.matches;
      // Uncounted beads are matte and opaque, so the string never shows through.
      const t = dark ? 0.55 : 0.7;
      sprite.on = bead(br, stone.hi, stone.c, stone.lo);
      sprite.off = bead(br * 0.92, mix(stone.hi, paper, t), mix(stone.c, paper, t), mix(stone.lo, paper, t * 0.85), 0.25);
      sprite.brass = bead(br * 0.8, '#f3dc9e', '#b88a35', '#5a3f0e');
      sprite.imam = bead(br * 1.5, stone.hi, stone.c, stone.lo);
      sprite.glow = glow(br);
    }

    function step(dt) {
      // fixed 4ms sub-steps keep the springs stable at any refresh rate
      const K = 0.0011, C = 0.04, now = performance.now();
      let moving = false;
      for (let s = 0; s < dt; s += 4) {
        const h = Math.min(4, dt - s);
        for (let i = 0; i < GOAL; i++) {
          if (wakeAt[i] > now) { moving = true; continue; }
          const tgt = i < n ? 0 : GAP;
          const x = pos[i] - tgt;
          if (Math.abs(x) < 0.0005 && Math.abs(vel[i]) < 0.00002) { pos[i] = tgt; vel[i] = 0; continue; }
          vel[i] += (-K * x - C * vel[i]) * h;
          pos[i] += vel[i] * h;
          moving = true;
        }
        swingV += (-0.00006 * swing - 0.008 * swingV) * h;
        swing += swingV * h;
      }
      if (Math.abs(swing) > 0.0004 || Math.abs(swingV) > 0.00001) moving = true; else { swing = 0; swingV = 0; }
      return moving;
    }

    function draw() {
      const { R, cx, cy, step: st, br, a0 } = geometry();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // string
      ctx.strokeStyle = ink; ctx.globalAlpha = 0.22; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, a0 - st * 0.4, a0 + Math.PI * 2 - TASSEL + st * 0.4); ctx.stroke();

      // knot, imam bead and tassel
      const by = cy + R;
      ctx.save(); ctx.translate(cx, by); ctx.rotate(swing);
      ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(0, br * 1.6); ctx.stroke();
      ctx.globalAlpha = 1;
      const im = sprite.imam, iw = im.width / dpr;
      ctx.drawImage(im, -iw / 2, br * 1.2, iw, iw * 1.3);
      const ty = br * 1.2 + iw * 1.3 - 1, tl = Math.max(10, Math.min(H - by - ty - 4, W * 0.14));
      ctx.fillStyle = '#b08433';
      ctx.fillRect(-br * 0.7, ty - 1, br * 1.4, br * 0.8);
      ctx.strokeStyle = stone.c; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.85;
      ctx.beginPath();
      for (let i = -8; i <= 8; i++) {
        ctx.moveTo(i * 0.28, ty + br * 0.6);
        ctx.quadraticCurveTo(i * 0.9 - swing * 30, ty + tl * 0.55, i * 1.7 - swing * 70, ty + tl);
      }
      ctx.stroke();
      ctx.restore();

      // beads
      ctx.globalAlpha = 1;
      const sh = shimmerT >= 0 ? (performance.now() - shimmerT) / 1100 * (GOAL + 14) : -99;
      for (let i = 0; i < GOAL; i++) {
        const a = a0 + (i + 0.5 + pos[i]) * st;
        const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
        const spacer = i === 32 || i === 65;
        const sp = spacer ? sprite.brass : i < n ? sprite.on : sprite.off;
        const s = sp.width / dpr;
        ctx.drawImage(sp, x - s / 2, y - s / 2, s, s);
        const d = sh - i;
        if (d > 0 && d < 14) {
          ctx.globalAlpha = Math.sin((d / 14) * Math.PI) * 0.9;
          const gs = sprite.glow.width / dpr;
          ctx.drawImage(sprite.glow, x - gs / 2, y - gs / 2, gs, gs);
          ctx.globalAlpha = 1;
        }
      }
      if (shimmerT >= 0 && sh > GOAL + 14) shimmerT = -1;
    }

    function frame(t) {
      const dt = Math.min(48, last ? t - last : 16);
      last = t;
      const moving = reduce ? false : step(dt);
      if (reduce) for (let i = 0; i < GOAL; i++) pos[i] = i < n ? 0 : GAP;
      draw();
      if (moving || shimmerT >= 0) raf = requestAnimationFrame(frame);
      else { raf = 0; last = 0; }
    }
    function kick() { if (!raf && W) raf = requestAnimationFrame(frame); }

    new ResizeObserver(resize).observe(cv);
    darkMQ.addEventListener?.('change', () => { requestAnimationFrame(() => { readTheme(); buildSprites(); kick(); }); });

    return {
      target(v) {
        if (v > n) {
          // the pushed bead travels fast and knocks its new neighbour
          vel[v - 1] = -0.012;
          if (v >= 2) vel[v - 2] -= 0.0016;
          swingV += 0.00045;
        } else if (v < n) {
          vel[v] = 0.01;
        }
        n = v; kick();
      },
      setStone(s, v) {
        stone = s; buildSprites();
        const now = performance.now();
        // restring: all beads slide back in a quick wave
        for (let i = 0; i < GOAL; i++) { pos[i] = GAP + 1.2; vel[i] = 0; wakeAt[i] = reduce ? 0 : now + i * 3.2; }
        n = v; swingV += 0.0003; kick();
      },
      shimmer() { if (!reduce) { shimmerT = performance.now(); kick(); } },
    };
  })();

  // ---------- boot ----------
  renderDate();
  select(current, true);
  if ('serviceWorker' in navigator) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
