(() => {
  'use strict';

  const GOAL = 100;
  const DHIKR = [
    { ar: 'أَسْتَغْفِرُ ٱللَّٰهَ', tab: 'أستغفر الله', tr: 'Astaghfirullah', es: '«Pido perdón a Allah»', color: '#8fd3c1' },
    { ar: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', tab: 'لا إله إلا الله', tr: 'La ilaha illa Allah', es: '«No hay más divinidad que Allah»', color: '#e8c77a' },
    { ar: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ ﷺ', tab: 'صلوات ﷺ', tr: 'Allahumma salli ʿala Muhammad', es: '«Oh Allah, envía Tus bendiciones sobre Muhammad ﷺ»', color: '#c9a8f0' },
  ];
  const MILESTONES = {
    33: 'Un tercio · sigue así',
    50: 'La mitad · Masha’Allah',
    66: 'Dos tercios',
    90: '¡Solo quedan 10!',
  };

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
  const isComplete = (arr) => arr && arr.every((n) => n >= GOAL);

  let current = counts().findIndex((n) => n < GOAL);
  if (current < 0) current = 0;

  // ---------- ring ----------
  const ring = $('ring');
  const NS = 'http://www.w3.org/2000/svg';
  const beads = [];
  (() => {
    const cx = 160, cy = 160, R = 148;
    const g = document.createElementNS(NS, 'circle');
    g.setAttribute('cx', cx); g.setAttribute('cy', cy); g.setAttribute('r', R);
    g.setAttribute('class', 'glow');
    ring.appendChild(g);
    for (let i = 0; i < GOAL; i++) {
      const a = (i / GOAL) * Math.PI * 2 - Math.PI / 2;
      const c = document.createElementNS(NS, 'circle');
      const big = i === 32 || i === 65 || i === 99;
      c.setAttribute('cx', (cx + R * Math.cos(a)).toFixed(2));
      c.setAttribute('cy', (cy + R * Math.sin(a)).toFixed(2));
      c.setAttribute('r', big ? 5.6 : 4);
      c.setAttribute('class', 'bead' + (big ? ' big' : ''));
      ring.appendChild(c);
      beads.push(c);
    }
  })();

  // ---------- tabs ----------
  const tabs = $('tabs');
  DHIKR.forEach((d, i) => {
    const b = document.createElement('button');
    b.className = 'tab';
    b.setAttribute('role', 'tab');
    b.style.setProperty('--c', d.color);
    b.innerHTML = `<span class="t-ar">${d.tab}</span><span class="t-n"></span><span class="bar"></span>`;
    b.addEventListener('click', () => { select(i); tick(4); });
    tabs.appendChild(b);
  });

  // ---------- render ----------
  function render(popIndex = -1) {
    const c = counts();
    const n = c[current];
    const d = DHIKR[current];
    document.body.dataset.d = current;
    document.querySelector('meta[name=theme-color]').content = '#070f1c';

    $('arabic').textContent = d.ar;
    $('translit').textContent = d.tr;
    $('meaning').textContent = d.es;
    $('count').textContent = n;
    $('tap').classList.toggle('complete', n >= GOAL);

    beads.forEach((b, i) => {
      b.classList.toggle('on', i < n);
      b.classList.toggle('next', i === n);
      if (i === popIndex) { b.classList.remove('pop'); void b.getBBox(); b.classList.add('pop'); }
    });

    [...tabs.children].forEach((t, i) => {
      t.classList.toggle('active', i === current);
      t.classList.toggle('done', c[i] >= GOAL);
      t.setAttribute('aria-selected', i === current);
      t.querySelector('.t-n').textContent = `${c[i]}/${GOAL}`;
      t.querySelector('.bar').style.width = `${Math.min(100, c[i])}%`;
    });

    const total = c.reduce((a, b) => a + Math.min(b, GOAL), 0);
    $('total').textContent = total;
    $('streak').textContent = streak().current;

    // Moon waxes as the day fills: crescent → full
    const p = total / (GOAL * 3);
    $('moonShadow').setAttribute('cx', (26 + p * 26).toFixed(1));
  }

  function select(i) {
    current = i;
    render();
  }

  // ---------- date ----------
  function renderDate() {
    const now = new Date();
    let s = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }).replace('.', '');
    s = s[0].toUpperCase() + s.slice(1);
    try {
      const h = new Intl.DateTimeFormat('es-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(now);
      const get = (t) => (h.find((p) => p.type === t) || {}).value;
      if (get('month')) s += ` · ${get('day')} ${get('month')} ${String(get('year')).replace(/\D/g, '')} H`;
    } catch (_) {}
    $('date').textContent = s;
  }

  // ---------- streaks ----------
  function streak() {
    const d = new Date();
    let cur = 0;
    if (!isComplete(state.days[dayKey(d)])) d.setDate(d.getDate() - 1);
    while (isComplete(state.days[dayKey(d)])) { cur++; d.setDate(d.getDate() - 1); }
    // best
    const keys = Object.keys(state.days).filter((k) => isComplete(state.days[k])).sort();
    let best = 0, run = 0, prev = null;
    for (const k of keys) {
      const t = new Date(k + 'T12:00:00');
      if (prev && Math.round((t - prev) / 864e5) === 1) run++; else run = 1;
      best = Math.max(best, run); prev = t;
    }
    return { current: cur, best };
  }

  // ---------- feedback ----------
  let ac;
  function tone(freq, dur = 0.12, vol = 0.08, type = 'sine', delay = 0) {
    if (!state.sound) return;
    try {
      ac ||= new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      const t = ac.currentTime + delay;
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ac.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (_) {}
  }
  const vibrate = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (_) {} };
  const tick = (v = 8) => vibrate(v);

  // Pentatonic-ish bead clicks so a round of 100 sounds like a soft melody
  const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  function beadSound(n) {
    tone(SCALE[n % SCALE.length] * (current === 0 ? 0.75 : current === 2 ? 1.12 : 1), 0.16, 0.05, 'triangle');
    tone(2400, 0.02, 0.015, 'square');
  }
  function chime() { [659.25, 783.99, 987.77, 1318.5].forEach((f, i) => tone(f, 0.9, 0.06, 'sine', i * 0.11)); }

  let toastT;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1800);
  }

  function floatPlus(x, y) {
    const el = document.createElement('div');
    el.className = 'plus'; el.textContent = '+1';
    el.style.left = x + 'px'; el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  // ---------- counting ----------
  let firstTap = true;
  function increment(x, y) {
    rollover();
    const c = counts();
    if (c[current] >= GOAL) {
      const next = c.findIndex((n) => n < GOAL);
      if (next >= 0) { select(next); toast('Seguimos con ' + DHIKR[next].tr); }
      else toast('Ya completaste hoy ✦');
      return;
    }
    c[current]++;
    const n = c[current];
    save();
    render(n - 1);

    const cb = $('count'); cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump');
    if (firstTap) { firstTap = false; $('hint').classList.add('gone'); }
    if (x != null) { floatPlus(x, y); sky.burst(x, y, 6, DHIKR[current].color); }

    // bead burst on the ring
    const r = beads[n - 1].getBoundingClientRect();
    sky.burst(r.left + r.width / 2, r.top + r.height / 2, 4, DHIKR[current].color);

    if (n === GOAL) {
      vibrate([30, 50, 30, 50, 90]);
      chime();
      const rr = $('tap').getBoundingClientRect();
      sky.burst(rr.left + rr.width / 2, rr.top + rr.height / 2, 70, DHIKR[current].color, 1.6);
      if (isComplete(c)) {
        render();
        if (!state.celebrated[today]) {
          state.celebrated[today] = true; save();
          setTimeout(celebrate, 900);
        }
      } else {
        toast('Masha’Allah · ' + DHIKR[current].tr + ' completo');
        const next = c.findIndex((v) => v < GOAL);
        setTimeout(() => select(next), 1100);
      }
    } else if (MILESTONES[n]) {
      vibrate([15, 40, 15]);
      tone(1046.5, 0.4, 0.05); tone(1318.5, 0.5, 0.04, 'sine', 0.08);
      toast(MILESTONES[n]);
    } else {
      tick(9);
      beadSound(n);
    }
  }

  const wrap = document.querySelector('.ring-wrap');
  wrap.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    $('tap').classList.add('press');
    increment(e.clientX, e.clientY);
  });
  const unpress = () => $('tap').classList.remove('press');
  wrap.addEventListener('pointerup', unpress);
  wrap.addEventListener('pointercancel', unpress);
  wrap.addEventListener('pointerleave', unpress);
  $('tap').addEventListener('click', (e) => { if (e.detail === 0) increment(); }); // keyboard
  document.addEventListener('keydown', (e) => {
    if (!$('sheet').hidden || !$('celebrate').hidden) return;
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); increment(); }
    if (e.key === 'ArrowRight') select((current + 1) % 3);
    if (e.key === 'ArrowLeft') select((current + 2) % 3);
    if (e.key === 'Backspace') $('undoBtn').click();
  });

  $('undoBtn').addEventListener('click', () => {
    const c = counts();
    if (c[current] > 0) { c[current]--; save(); render(); tick(5); }
  });
  $('resetBtn').addEventListener('click', () => {
    if (confirm(`¿Reiniciar ${DHIKR[current].tr} a 0?`)) {
      counts()[current] = 0; delete state.celebrated[today]; save(); render(); tick(20);
    }
  });

  const soundBtn = $('soundBtn');
  const syncSound = () => soundBtn.classList.toggle('off', !state.sound);
  soundBtn.addEventListener('click', () => {
    state.sound = !state.sound; save(); syncSound();
    toast(state.sound ? 'Sonido activado' : 'Silencio');
    if (state.sound) tone(880, 0.15, 0.05);
  });
  syncSound();

  // ---------- history sheet ----------
  function openSheet() {
    const s = streak();
    state.best = Math.max(state.best || 0, s.best);
    $('sStreak').textContent = s.current;
    $('sBest').textContent = state.best;
    $('sAll').textContent = Object.values(state.days).reduce((a, arr) => a + arr.reduce((x, y) => x + Math.min(y, GOAL), 0), 0).toLocaleString('es-ES');

    $('calHead').innerHTML = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => `<span>${d}</span>`).join('');
    const cal = $('cal'); cal.innerHTML = '';
    const now = new Date();
    const start = new Date(); start.setDate(now.getDate() - ((now.getDay() + 6) % 7) - 28); // Monday, 4 weeks back
    for (let d = new Date(start), i = 0; i < 35; i++, d.setDate(d.getDate() + 1)) {
      if (d > now) { cal.insertAdjacentHTML('beforeend', '<i class="empty"></i>'); continue; }
      const k = dayKey(d);
      const arr = state.days[k];
      const tot = arr ? arr.reduce((a, b) => a + Math.min(b, GOAL), 0) : 0;
      const lvl = tot === 0 ? 0 : tot >= 300 ? 3 : tot >= 150 ? 2 : 1;
      cal.insertAdjacentHTML('beforeend', `<i class="l${lvl}${k === today ? ' today' : ''}" title="${k}: ${tot}/300">${d.getDate()}</i>`);
    }
    $('sheet').hidden = false;
  }
  $('streakBtn').addEventListener('click', openSheet);
  $('closeSheet').addEventListener('click', () => ($('sheet').hidden = true));
  $('sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet') $('sheet').hidden = true; });

  function celebrate() {
    $('celebrate').hidden = false;
    const w = innerWidth, h = innerHeight;
    for (let i = 0; i < 6; i++) setTimeout(() => sky.burst(Math.random() * w, Math.random() * h * 0.6, 40, ['#e8c77a', '#8fd3c1', '#c9a8f0'][i % 3], 1.8), i * 250);
  }
  $('closeCel').addEventListener('click', () => ($('celebrate').hidden = true));

  // ---------- day rollover ----------
  function rollover() {
    const k = dayKey();
    if (k !== today) {
      today = k; current = 0; renderDate(); render();
      toast('Nuevo día · Bismillah');
    }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) rollover(); });
  setInterval(rollover, 60_000);

  // ---------- sky (stars + particles) ----------
  const sky = (() => {
    const cv = $('sky'), ctx = cv.getContext('2d');
    let W, H, dpr, stars = [], parts = [];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.round((W * H) / 5200) }, () => ({
        x: Math.random() * W, y: Math.random() * H * 0.9,
        r: Math.random() * 1.1 + 0.2, p: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 1.2,
      }));
    }
    addEventListener('resize', resize); resize();

    let shoot = null, nextShoot = performance.now() + 4000;
    function frame(t) {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const a = reduce ? 0.6 : 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t / 1000 * s.s + s.p));
        ctx.globalAlpha = a; ctx.fillStyle = '#f3ead6';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      }
      // shooting star
      if (!reduce && !shoot && t > nextShoot) {
        shoot = { x: Math.random() * W * 0.7 + W * 0.3, y: Math.random() * H * 0.3, life: 1 };
      }
      if (shoot) {
        shoot.x -= 9; shoot.y += 4; shoot.life -= 0.02;
        const g = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x + 90, shoot.y - 40);
        g.addColorStop(0, `rgba(246,220,154,${shoot.life})`); g.addColorStop(1, 'rgba(246,220,154,0)');
        ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(shoot.x + 90, shoot.y - 40); ctx.stroke();
        if (shoot.life <= 0) { shoot = null; nextShoot = t + 6000 + Math.random() * 12000; }
      }
      // particles
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.vx *= 0.985; p.life -= p.decay;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = p.life; ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life + 0.3, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return {
      burst(x, y, n, c, power = 1) {
        if (reduce) return;
        for (let i = 0; i < n; i++) {
          const a = Math.random() * 6.283, v = (0.6 + Math.random() * 2.4) * power;
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.8, r: 1 + Math.random() * 2, life: 1, decay: 0.012 + Math.random() * 0.02, c });
        }
      },
    };
  })();

  // ---------- boot ----------
  renderDate();
  render();
  if ('serviceWorker' in navigator) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
