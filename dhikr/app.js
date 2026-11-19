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
  const KEY = 'noor:v1';

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

  let current = counts().findIndex((n) => n < GOAL);
  if (current < 0) current = 0;

  // ---------- ledger ----------
  const list = $('list');
  DHIKR.forEach((d, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button class="row" style="--c:${d.c};--hi:${d.hi};--lo:${d.lo}">
      <span class="gem" aria-hidden="true"></span>
      <span class="name"><span class="ar" lang="ar" dir="rtl">${d.short}</span><span class="lat">${d.tr} · ${d.stone}</span></span>
      <span class="n"><b>0</b> / ${GOAL}</span>
      <span class="bar" aria-hidden="true"></span>
    </button>`;
    li.firstElementChild.addEventListener('click', () => { if (i !== current) { select(i); vibrate(6); } });
    list.appendChild(li);
  });
  const rows = [...list.querySelectorAll('.row')];

  // ---------- render ----------
  function render() {
    const c = counts();
    const d = DHIKR[current];
    document.documentElement.style.setProperty('--stone', d.c);
    document.documentElement.style.setProperty('--stone-hi', d.hi);
    $('phrase').textContent = d.ar;
    $('count').textContent = c[current];
    rows.forEach((r, i) => {
      r.setAttribute('aria-current', i === current);
      r.classList.toggle('full', c[i] >= GOAL);
      r.querySelector('b').textContent = c[i];
      r.querySelector('.bar').style.width = Math.min(100, c[i]) + '%';
    });
    $('total').textContent = sum(c);
    $('streak').textContent = streak().current;
    beads.target(c[current]);
  }
  function select(i) {
    current = i;
    beads.setStone(DHIKR[i]);
    setNote();
    render();
  }

  let noteT;
  function setNote(msg) {
    const n = $('note');
    clearTimeout(noteT);
    if (msg) {
      n.textContent = msg; n.classList.add('flash');
      noteT = setTimeout(() => setNote(), 2200);
    } else {
      const left = GOAL - counts()[current];
      n.textContent = left > 0 ? `de ${GOAL}` : 'completo';
      n.classList.remove('flash');
    }
  }

  // ---------- dates ----------
  function renderDate() {
    const now = new Date();
    let g = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }).replace('.', '');
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

  // ---------- sound & touch ----------
  let ac, noise;
  function audio() {
    if (!state.sound) return null;
    try {
      ac ||= new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      if (!noise) {
        noise = ac.createBuffer(1, ac.sampleRate * 0.05, ac.sampleRate);
        const ch = noise.getChannelData(0);
        for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch.length, 6);
      }
      return ac;
    } catch (_) { return null; }
  }
  // Two stones knocking: a filtered noise transient plus a short resonant body.
  function clack(pitch = 1) {
    const a = audio(); if (!a) return;
    const t = a.currentTime;
    [0, 0.045].forEach((dt, k) => {
      const s = a.createBufferSource(); s.buffer = noise;
      const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = (k ? 2600 : 3400) * pitch; f.Q.value = 6;
      const g = a.createGain(); g.gain.value = k ? 0.35 : 0.6;
      s.connect(f).connect(g).connect(a.destination); s.start(t + dt);
    });
  }
  function bell(freqs) {
    const a = audio(); if (!a) return;
    freqs.forEach((fr, i) => {
      const t = a.currentTime + i * 0.12;
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'sine'; o.frequency.value = fr;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + 1.5);
    });
  }
  const vibrate = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (_) {} };

  // ---------- counting ----------
  function increment() {
    rollover();
    const c = counts();
    if (c[current] >= GOAL) {
      const next = c.findIndex((n) => n < GOAL);
      if (next >= 0) select(next); else setNote('Hoy ya está completo');
      return;
    }
    const n = ++c[current];
    save();
    render();
    const el = $('count'); el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');

    if (n === GOAL) {
      vibrate([30, 60, 30, 60, 100]);
      bell([523.25, 659.25, 783.99]);
      if (isComplete(c)) {
        setNote('completo');
        if (!state.celebrated[today]) { state.celebrated[today] = true; save(); setTimeout(showDone, 1000); }
      } else {
        setNote('Masha’Allah');
        const next = c.findIndex((v) => v < GOAL);
        setTimeout(() => select(next), 1300);
      }
    } else if (MILESTONES[n]) {
      vibrate([18, 50, 18]);
      clack(0.8); bell([880]);
      setNote(MILESTONES[n]);
    } else {
      vibrate(8);
      clack(1 + current * 0.08);
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
  document.addEventListener('keydown', (e) => {
    if (!$('sheet').hidden || !$('done').hidden) { if (e.key === 'Escape') { $('sheet').hidden = true; $('done').hidden = true; } return; }
    if ((e.code === 'Space' || e.code === 'Enter') && (e.target === misbaha || e.target === document.body)) { e.preventDefault(); increment(); }
    if (e.key === 'ArrowDown') select((current + 1) % 3);
    if (e.key === 'ArrowUp') select((current + 2) % 3);
  });

  $('undoBtn').addEventListener('click', () => {
    const c = counts();
    if (c[current] > 0) { c[current]--; if (!isComplete(c)) delete state.celebrated[today]; save(); render(); setNote(); vibrate(5); }
  });

  const soundBtn = $('soundBtn');
  const syncSound = () => {
    soundBtn.setAttribute('aria-pressed', state.sound);
    soundBtn.setAttribute('aria-label', state.sound ? 'Sonido activado' : 'Sonido desactivado');
  };
  soundBtn.addEventListener('click', () => { state.sound = !state.sound; save(); syncSound(); if (state.sound) clack(); });
  syncSound();

  // ---------- constancia sheet ----------
  function openSheet() {
    const s = streak();
    const days = (v) => `${v} ${v === 1 ? 'día' : 'días'}`;
    $('sStreak').textContent = days(s.current);
    $('sBest').textContent = days(s.best);
    $('sAll').textContent = Object.values(state.days).reduce((a, arr) => a + sum(arr), 0).toLocaleString('es-ES');
    $('resetName').textContent = DHIKR[current].tr;
    $('resetConfirm').hidden = true;

    $('calHead').innerHTML = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => `<span>${d}</span>`).join('');
    const cal = $('cal'); cal.innerHTML = '';
    const now = new Date();
    const start = new Date(); start.setDate(now.getDate() - ((now.getDay() + 6) % 7) - 28);
    for (let d = new Date(start), i = 0; i < 35; i++, d.setDate(d.getDate() + 1)) {
      if (d > now) { cal.insertAdjacentHTML('beforeend', '<i class="x"></i>'); continue; }
      const k = dayKey(d), tot = sum(state.days[k]);
      const lvl = tot === 0 ? 0 : tot >= 300 ? 3 : tot >= 150 ? 2 : 1;
      cal.insertAdjacentHTML('beforeend', `<i class="k${lvl}${k === today ? ' today' : ''}" title="${k}: ${tot}/300">${d.getDate()}</i>`);
    }
    $('sheet').hidden = false;
  }
  $('streakBtn').addEventListener('click', openSheet);
  $('closeSheet').addEventListener('click', () => ($('sheet').hidden = true));
  $('sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet') $('sheet').hidden = true; });
  $('resetBtn').addEventListener('click', () => ($('resetConfirm').hidden = false));
  $('resetNo').addEventListener('click', () => ($('resetConfirm').hidden = true));
  $('resetYes').addEventListener('click', () => {
    counts()[current] = 0; delete state.celebrated[today]; save();
    $('sheet').hidden = true; render(); setNote(); vibrate(20);
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
  document.addEventListener('visibilitychange', () => { if (!document.hidden) rollover(); });
  setInterval(rollover, 60_000);

  // ---------- the misbaha ----------
  // 100 beads packed on a loop of string. Counted beads sit on one side, the
  // rest on the other; one free gap travels around the loop as you count, the
  // way a thumb pushes beads along a real misbaha.
  const beads = (() => {
    const cv = $('beads'), ctx = cv.getContext('2d');
    const GAP = 3.2;          // free space on the string, in bead widths
    const TASSEL = 0.26;      // radians left open at the bottom for the knot
    const off = new Float32Array(GOAL).fill(GAP);
    let n = 0, W = 0, H = 0, dpr = 1, stone = DHIKR[current], sprite = {}, raf = 0, sway = 0;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 3);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      buildSprites(); kick();
    }
    function geometry() {
      const R = W * 0.43;
      const cx = W / 2, cy = W / 2;
      const span = Math.PI * 2 - TASSEL;
      const step = span / (GOAL + GAP);
      const br = Math.min(R * step * 0.5, 9);
      return { R, cx, cy, step, br, a0: Math.PI / 2 + TASSEL / 2 };
    }
    function bead(rad, hi, mid, lo, alpha = 1) {
      const s = Math.ceil(rad * 2 * dpr + 4);
      const c = document.createElement('canvas'); c.width = c.height = s;
      const x = c.getContext('2d'); const m = s / 2, r = rad * dpr;
      x.globalAlpha = alpha;
      const g = x.createRadialGradient(m - r * 0.35, m - r * 0.4, r * 0.1, m, m, r);
      g.addColorStop(0, hi); g.addColorStop(0.55, mid); g.addColorStop(1, lo);
      x.fillStyle = g; x.beginPath(); x.arc(m, m, r, 0, 7); x.fill();
      x.globalAlpha = alpha * 0.85; x.fillStyle = 'rgba(255,255,255,.75)';
      x.beginPath(); x.ellipse(m - r * 0.32, m - r * 0.38, r * 0.22, r * 0.13, -0.6, 0, 7); x.fill();
      return c;
    }
    function buildSprites() {
      const { br } = geometry();
      const dark = matchMedia('(prefers-color-scheme: dark)').matches;
      sprite.on = bead(br, stone.hi, stone.c, stone.lo);
      sprite.off = bead(br * 0.94, stone.hi, stone.c, stone.lo, dark ? 0.42 : 0.26);
      sprite.brass = bead(br * 0.78, '#f3dc9e', '#b88a35', '#5a3f0e');
      sprite.imam = bead(br * 1.45, stone.hi, stone.c, stone.lo);
    }

    function draw(t) {
      const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#14211c';
      const { R, cx, cy, step, br, a0 } = geometry();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // string
      ctx.strokeStyle = ink; ctx.globalAlpha = 0.28; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, a0 - step * 0.5, a0 + Math.PI * 2 - TASSEL + step * 0.5); ctx.stroke();

      // knot, imam bead and tassel hanging from the bottom
      const bx = cx, by = cy + R;
      const swing = reduce ? 0 : Math.sin(t / 900) * 0.035 + sway;
      ctx.save(); ctx.translate(bx, by); ctx.rotate(swing);
      ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, br * 5); ctx.stroke();
      const im = sprite.imam; ctx.globalAlpha = 1;
      ctx.drawImage(im, -im.width / dpr / 2, br * 1.2, im.width / dpr, im.height / dpr * 1.35);
      const ty = br * 5.2, tl = Math.min(H - by - ty - 4, W * 0.13);
      ctx.strokeStyle = stone.c; ctx.lineWidth = 0.9; ctx.globalAlpha = 0.75;
      for (let i = -7; i <= 7; i++) {
        ctx.beginPath(); ctx.moveTo(i * 0.25, ty);
        ctx.quadraticCurveTo(i * 0.9, ty + tl * 0.5, i * 1.6 + Math.sin(t / 700 + i) * (reduce ? 0 : 0.6), ty + tl);
        ctx.stroke();
      }
      ctx.fillStyle = '#b88a35'; ctx.globalAlpha = 1;
      ctx.fillRect(-br * 0.75, ty - 1, br * 1.5, br * 0.9);
      ctx.restore();

      // beads
      let moving = false;
      for (let i = 0; i < GOAL; i++) {
        const tgt = i < n ? 0 : GAP;
        const d = tgt - off[i];
        if (Math.abs(d) > 0.002) { off[i] += reduce ? d : d * 0.22; moving = true; } else off[i] = tgt;
        const a = a0 + (i + 0.5 + off[i]) * step;
        const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
        const spacer = i === 32 || i === 65;
        const sp = spacer ? sprite.brass : i < n ? sprite.on : sprite.off;
        const s = sp.width / dpr;
        ctx.globalAlpha = 1;
        ctx.drawImage(sp, x - s / 2, y - s / 2, s, s);
      }
      sway *= 0.92;
      if (moving || !reduce) raf = requestAnimationFrame(draw); else raf = 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(draw); }

    new ResizeObserver(resize).observe(cv);
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { buildSprites(); kick(); });
    return {
      target(v) { if (v > n) sway = 0.06; n = v; kick(); },
      setStone(s) { stone = s; buildSprites(); off.fill(GAP); kick(); },
    };
  })();

  // ---------- boot ----------
  renderDate();
  select(current);
  if ('serviceWorker' in navigator) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
