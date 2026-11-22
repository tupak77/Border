import { useSyncExternalStore } from 'react';
import { SCHEDULE, WORKOUTS, TOTAL_DAYS } from './data/program.js';
import { EXERCISES } from './data/exercises.js';
import { WEEK_MEALS, SLOTS } from './data/recipes.js';

const KEY = 'forja:v1';

const initial = {
  v: 1,
  profile: null, // { name, start, weight, goal }
  settings: { rest: 90, sound: true, vibrate: true },
  sessions: [], // finalizadas
  active: null, // sesión en curso
  weights: {}, // { 'YYYY-MM-DD': kg }
  habits: {}, // { date: { liss: true, ... } }
  meals: {}, // { date: { breakfast: true } }
  mealPick: {}, // { date: { lunch: 'recipe-id' } }
  water: {}, // { date: vasos }
  shop: {}, // { 'ingrediente|unidad': true }
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const data = JSON.parse(raw);
    return { ...initial, ...data, settings: { ...initial.settings, ...data.settings } };
  } catch {
    return initial;
  }
}

let state = load();
const listeners = new Set();

export function setState(updater) {
  const next = typeof updater === 'function' ? updater(state) : updater;
  state = { ...state, ...next };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* almacenamiento lleno o bloqueado */
  }
  listeners.forEach((l) => l());
}

export const getState = () => state;

export function useStore(selector = (s) => s) {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => selector(state),
  );
}

export function resetAll() {
  localStorage.removeItem(KEY);
  state = initial;
  listeners.forEach((l) => l());
}

export function importData(json) {
  const data = JSON.parse(json);
  if (!data || typeof data !== 'object' || !('sessions' in data)) throw new Error('Archivo no válido');
  setState({ ...initial, ...data });
}

// ───────── Fechas ─────────
export const toKey = (d = new Date()) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
export const fromKey = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (k, n) => {
  const d = fromKey(k);
  d.setDate(d.getDate() + n);
  return toKey(d);
};
export const diffDays = (a, b) => Math.round((fromKey(b) - fromKey(a)) / 86400000);

export function dayIndexFor(profile, key = toKey()) {
  if (!profile) return 0;
  return diffDays(profile.start, key);
}

/** Estado de cada uno de los 30 días */
export function programDays(s) {
  const today = toKey();
  return SCHEDULE.map((plan, i) => {
    const date = addDays(s.profile.start, i);
    const session = s.sessions.find((x) => x.day === i);
    const isTraining = !!WORKOUTS[plan];
    const habit = s.habits[date] || {};
    let status = 'upcoming';
    if (date === today) status = 'today';
    else if (date < today) {
      if (isTraining) status = session ? 'done' : 'missed';
      else status = habit.liss || plan === 'OFF' ? 'done' : 'rest';
    }
    if (date === today && session) status = 'done-today';
    return { i, date, plan, session, isTraining, status };
  });
}

export function streak(s) {
  // días seguidos (hasta hoy/ayer) cumpliendo el plan del día
  if (!s.profile) return 0;
  const days = programDays(s);
  const today = dayIndexFor(s.profile);
  let n = 0;
  for (let i = Math.min(today, TOTAL_DAYS - 1); i >= 0; i--) {
    const d = days[i];
    const ok = d.status === 'done' || d.status === 'done-today';
    if (ok) n++;
    else if (i === today) continue; // hoy aún no cuenta en contra
    else break;
  }
  return n;
}

// ───────── Sesiones ─────────
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function lastSetsFor(exId, s = state) {
  for (let i = s.sessions.length - 1; i >= 0; i--) {
    const e = s.sessions[i].entries[exId];
    if (e && e.some((x) => x.done)) return e.filter((x) => x.done);
  }
  return null;
}

export const e1rm = (w, r) => (w > 0 && r > 0 ? w * (1 + r / 30) : 0);

export function bestFor(exId, sessions = state.sessions) {
  let best = null;
  for (const ses of sessions) {
    for (const set of ses.entries[exId] || []) {
      if (!set.done) continue;
      const v = EXERCISES[exId].type === 'weight' ? e1rm(+set.w, +set.r) : +set.r;
      if (!best || v > best.value) best = { value: v, w: +set.w, r: +set.r, date: ses.date };
    }
  }
  return best;
}

export function startSession(dayIndex, wid) {
  const w = WORKOUTS[wid];
  const entries = {};
  for (const it of w.items) {
    const ex = EXERCISES[it.id];
    const prev = lastSetsFor(it.id);
    entries[it.id] = Array.from({ length: it.sets }, (_, k) => {
      if (ex.type === 'cardio') return { w: '', r: String(it.minutes || 40), done: false };
      const p = prev?.[k] || prev?.[prev.length - 1];
      return { w: p?.w ?? '', r: '', done: false };
    });
  }
  const active = { id: uid(), day: dayIndex, wid, date: toKey(), start: Date.now(), entries };
  setState({ active });
  return active;
}

export function updateSet(exId, k, patch) {
  setState((s) => {
    const sets = s.active.entries[exId].map((x, j) => (j === k ? { ...x, ...patch } : x));
    return { active: { ...s.active, entries: { ...s.active.entries, [exId]: sets } } };
  });
}

export function addSet(exId) {
  setState((s) => {
    const sets = s.active.entries[exId];
    const last = sets[sets.length - 1] || { w: '', r: '' };
    return {
      active: { ...s.active, entries: { ...s.active.entries, [exId]: [...sets, { w: last.w, r: '', done: false }] } },
    };
  });
}

export function removeSet(exId) {
  setState((s) => {
    const sets = s.active.entries[exId];
    if (sets.length <= 1) return {};
    return { active: { ...s.active, entries: { ...s.active.entries, [exId]: sets.slice(0, -1) } } };
  });
}

export function sessionStats(ses, before = state.sessions) {
  let sets = 0;
  let volume = 0;
  let cardio = 0;
  const prs = [];
  for (const [exId, list] of Object.entries(ses.entries)) {
    const ex = EXERCISES[exId];
    const done = list.filter((x) => x.done);
    sets += ex.type === 'cardio' ? 0 : done.length;
    if (ex.type === 'cardio') cardio += done.reduce((a, x) => a + (+x.r || 0), 0);
    if (ex.type === 'weight') volume += done.reduce((a, x) => a + (+x.w || 0) * (+x.r || 0), 0);
    if (ex.type === 'weight' && done.length) {
      const prev = bestFor(exId, before.filter((b) => b.id !== ses.id));
      const top = Math.max(...done.map((x) => e1rm(+x.w, +x.r)));
      if (prev && top > prev.value + 0.01) prs.push({ exId, value: top });
    }
  }
  return { sets, volume: Math.round(volume), cardio, prs };
}

export function finishSession() {
  const s = state;
  if (!s.active) return null;
  const end = Date.now();
  const ses = { ...s.active, end, duration: Math.round((end - s.active.start) / 1000) };
  const stats = sessionStats(ses);
  const habits = { ...s.habits };
  const today = habits[ses.date] || {};
  habits[ses.date] = { ...today, train: true, ...(stats.cardio >= 30 ? { liss: true } : {}) };
  setState({
    sessions: [...s.sessions.filter((x) => x.day !== ses.day), ses],
    active: null,
    habits,
  });
  return { ses, stats };
}

export function discardSession() {
  setState({ active: null });
}

export function toggleHabit(date, id) {
  setState((s) => {
    const h = { ...(s.habits[date] || {}) };
    h[id] = !h[id];
    return { habits: { ...s.habits, [date]: h } };
  });
}

export function toggleMeal(date, id) {
  setState((s) => {
    const m = { ...(s.meals[date] || {}) };
    m[id] = !m[id];
    return { meals: { ...s.meals, [date]: m } };
  });
}

export function logWeight(date, kg) {
  setState((s) => {
    const weights = { ...s.weights };
    if (kg === null) delete weights[date];
    else weights[date] = kg;
    return { weights };
  });
}

// ───────── Nutrición ─────────

/** Recetas planificadas para una fecha (plan semanal + cambios del usuario) */
export function mealsFor(s, date) {
  const idx = s.profile ? diffDays(s.profile.start, date) : 0;
  const base = WEEK_MEALS[((idx % 7) + 7) % 7];
  const picks = s.mealPick?.[date] || {};
  return Object.fromEntries(SLOTS.map((sl) => [sl.id, picks[sl.id] || base[sl.id]]));
}

export function pickMeal(date, slot, id) {
  setState((s) => ({ mealPick: { ...s.mealPick, [date]: { ...(s.mealPick?.[date] || {}), [slot]: id } } }));
}

export function setWater(date, n) {
  setState((s) => ({ water: { ...s.water, [date]: Math.max(0, Math.min(16, n)) } }));
}

export function toggleShop(key) {
  setState((s) => ({ shop: { ...s.shop, [key]: !s.shop?.[key] } }));
}

export function clearShop() {
  setState({ shop: {} });
}

export function setTargets(targets) {
  setState((s) => ({ profile: { ...s.profile, targets } }));
}
