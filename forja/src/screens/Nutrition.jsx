import { useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Ring, Section, Sheet, fmtNum, fmtDate, DOW } from '../components/ui.jsx';
import {
  useStore,
  toKey,
  addDays,
  fromKey,
  toggleMeal,
  mealsFor,
  pickMeal,
  setWater,
  toggleShop,
  clearShop,
  setTargets,
  setState,
  dayIndexFor,
} from '../store.js';
import {
  TARGETS,
  SUPPLEMENTS,
  SETUP,
  TIPS,
  AFTER,
  ACTIVITY,
  WATER_GOAL,
  WATER_GLASS_ML,
} from '../data/nutrition.js';
import {
  RECIPES,
  SLOTS,
  MACRO_COLORS,
  MACRO_NAMES,
  recipesForSlot,
  sumMacros,
  shoppingList,
} from '../data/recipes.js';
import { SCHEDULE, getDayPlan, TOTAL_DAYS } from '../data/program.js';

const TABS = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Semana' },
  { id: 'recipes', label: 'Recetas' },
  { id: 'shop', label: 'Compra' },
  { id: 'guide', label: 'Guía' },
];

const SLOT_ICON = { breakfast: 'bolt', lunch: 'flame', snack: 'target', dinner: 'moon' };

const isTrainingDate = (profile, date) => {
  const i = dayIndexFor(profile, date);
  if (i < 0 || i >= TOTAL_DAYS) return null;
  return !getDayPlan(SCHEDULE[i]).rest;
};

export default function Nutrition() {
  const [tab, setTab] = useState('today');
  const [recipe, setRecipe] = useState(null); // { id, date?, slot? }
  const [swap, setSwap] = useState(null); // { date, slot }

  return (
    <div className="screen">
      <header className="page-head">
        <span className="eyebrow">1800 kcal · 190 g de proteína</span>
        <h1 className="display-sm">Nutrición</h1>
      </header>

      <div className="chips nut-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`fchip ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'today' && <TodayTab onRecipe={setRecipe} onSwap={setSwap} />}
      {tab === 'week' && <WeekTab onRecipe={setRecipe} />}
      {tab === 'recipes' && <RecipesTab onRecipe={setRecipe} />}
      {tab === 'shop' && <ShopTab />}
      {tab === 'guide' && <GuideTab />}

      <Sheet open={!!recipe} onClose={() => setRecipe(null)} full>
        {recipe && <RecipeDetail {...recipe} onDone={() => setRecipe(null)} />}
      </Sheet>
      <Sheet open={!!swap} onClose={() => setSwap(null)} title="Cambiar comida">
        {swap && (
          <SwapList
            {...swap}
            onPick={(id) => {
              pickMeal(swap.date, swap.slot, id);
              setSwap(null);
            }}
            onRecipe={(id) => setRecipe({ id })}
          />
        )}
      </Sheet>
    </div>
  );
}

/* ───────────── piezas ───────────── */

function useTargets() {
  const profile = useStore((s) => s.profile);
  const t = profile?.targets;
  return { kcal: t?.kcal || TARGETS.kcal, protein: t?.protein || TARGETS.protein, custom: !!t };
}

export function MacroBar({ p, c, f, showLegend = true }) {
  const kp = p * 4;
  const kc = c * 4;
  const kf = f * 9;
  const tot = kp + kc + kf || 1;
  return (
    <div className="mbar-wrap">
      <div className="mbar" role="img" aria-label={`Proteína ${p} g, carbohidratos ${c} g, grasa ${f} g`}>
        <i style={{ width: `${(kp / tot) * 100}%`, background: MACRO_COLORS.p }} />
        <i style={{ width: `${(kc / tot) * 100}%`, background: MACRO_COLORS.c }} />
        <i style={{ width: `${(kf / tot) * 100}%`, background: MACRO_COLORS.f }} />
      </div>
      {showLegend && (
        <div className="mbar-legend">
          {[
            ['p', p],
            ['c', c],
            ['f', f],
          ].map(([k, v]) => (
            <span key={k}>
              <b style={{ background: MACRO_COLORS[k] }} />
              {MACRO_NAMES[k]} <strong>{Math.round(v)} g</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeTile({ id, size = 56 }) {
  const r = RECIPES[id];
  return (
    <span className={`rtile rtile-${r.slot}`} style={{ width: size, height: size }}>
      <strong>{r.kcal}</strong>
      <small>kcal</small>
    </span>
  );
}

/* ───────────── HOY ───────────── */

function TodayTab({ onRecipe, onSwap }) {
  const s = useStore();
  const today = toKey();
  const plan = mealsFor(s, today);
  const eaten = s.meals[today] || {};
  const tgt = useTargets();
  const ids = SLOTS.map((sl) => plan[sl.id]);
  const done = sumMacros(SLOTS.filter((sl) => eaten[sl.id]).map((sl) => plan[sl.id]));
  const planned = sumMacros(ids);
  const training = isTrainingDate(s.profile, today);
  const water = s.water?.[today] || 0;

  return (
    <>
      <div className="card nut-hero">
        <div className="nut-hero-top">
          <Ring value={done.kcal / tgt.kcal} size={132} stroke={12}>
            <strong className="ring-big">{fmtNum(done.kcal)}</strong>
            <small>/ {fmtNum(tgt.kcal)} kcal</small>
          </Ring>
          <div className="nut-hero-side">
            <span className="day-badge">
              <Icon name={training ? 'dumbbell' : 'walk'} size={14} /> {training ? 'Día de entreno' : 'Día de descanso'}
            </span>
            <div>
              <span className="eyebrow">Proteína</span>
              <strong className="macro-num">
                {done.p}
                <small>/{tgt.protein} g</small>
              </strong>
              <div className="bar-track">
                <i style={{ width: `${Math.min(100, (done.p / tgt.protein) * 100)}%`, background: MACRO_COLORS.p }} />
              </div>
            </div>
            <p className="muted small">
              Te quedan <strong className="ink">{fmtNum(Math.max(0, tgt.kcal - done.kcal))} kcal</strong> y{' '}
              <strong className="ink">{Math.max(0, tgt.protein - done.p)} g</strong> de proteína.
            </p>
          </div>
        </div>
        <MacroBar {...(done.kcal ? done : planned)} />
        {!done.kcal && <p className="muted small center">Reparto de macros del plan de hoy</p>}
      </div>

      <Section title="Comidas de hoy" action={<span className="muted">{SLOTS.filter((sl) => eaten[sl.id]).length}/4</span>}>
        <div className="timeline">
          {SLOTS.map((sl) => {
            const id = plan[sl.id];
            const r = RECIPES[id];
            const on = !!eaten[sl.id];
            return (
              <div key={sl.id} className={`tl-item ${on ? 'on' : ''}`}>
                <button className="tl-dot" onClick={() => toggleMeal(today, sl.id)} aria-pressed={on} aria-label={`Marcar ${sl.name} como comido`}>
                  {on ? <Icon name="check" size={16} stroke={3} /> : <Icon name={SLOT_ICON[sl.id]} size={15} />}
                </button>
                <div className="tl-card">
                  <button className="tl-main" onClick={() => onRecipe({ id, date: today, slot: sl.id })}>
                    <RecipeTile id={id} />
                    <span className="tl-txt">
                      <span className="tl-slot">
                        {sl.name} · <em>{training === false ? sl.rest : sl.train}</em>
                      </span>
                      <strong>
                        {r.name}
                        {r.pdf && <span className="pdf-badge">PDF</span>}
                      </strong>
                      <small>
                        {r.p} g prot · {r.c} g carb · {r.f} g grasa · {r.time} min
                      </small>
                    </span>
                  </button>
                  <div className="tl-actions">
                    <button onClick={() => onSwap({ date: today, slot: sl.id })}>
                      <Icon name="list" size={14} /> Cambiar
                    </button>
                    <button className={on ? 'done' : ''} onClick={() => toggleMeal(today, sl.id)}>
                      <Icon name="check" size={14} stroke={3} /> {on ? 'Comido' : 'Marcar comido'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Agua" action={<span className="muted">{fmtNum((water * WATER_GLASS_ML) / 1000, 2)} / 3 L</span>}>
        <div className="card water">
          <div className="glasses">
            {Array.from({ length: WATER_GOAL }, (_, k) => (
              <button
                key={k}
                className={`glass ${k < water ? 'on' : ''}`}
                onClick={() => setWater(today, k < water ? k : k + 1)}
                aria-label={`${k + 1} vasos`}
              >
                <Icon name="drop" size={18} fill={k < water} stroke={1.8} />
              </button>
            ))}
          </div>
          <div className="water-row">
            <button className="icon-btn sm" onClick={() => setWater(today, water - 1)} aria-label="Quitar vaso">
              <Icon name="minus" size={16} />
            </button>
            <span>
              <strong>{water}</strong> de {WATER_GOAL} vasos de 250 ml
            </span>
            <button className="icon-btn sm" onClick={() => setWater(today, water + 1)} aria-label="Añadir vaso">
              <Icon name="plus" size={16} />
            </button>
          </div>
        </div>
      </Section>

      <Section title="Suplementos">
        <div className="supps">
          {SUPPLEMENTS.map((x) => (
            <div key={x.name} className="supp">
              <Icon name="bolt" size={16} className="accent" />
              <strong>{x.name}</strong>
              <small>{x.when}</small>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

/* ───────────── SEMANA ───────────── */

function WeekTab({ onRecipe }) {
  const s = useStore();
  const today = toKey();
  const idx = Math.max(0, Math.min(TOTAL_DAYS - 1, dayIndexFor(s.profile, today)));
  const weekStart = idx - (idx % 7);
  const [offset, setOffset] = useState(0);
  const start = Math.max(0, Math.min(28, weekStart + offset * 7));
  const days = Array.from({ length: 7 }, (_, k) => start + k).filter((i) => i < TOTAL_DAYS);
  const weekNo = Math.floor(start / 7) + 1;

  return (
    <>
      <div className="week-nav">
        <button className="icon-btn" disabled={start === 0} onClick={() => setOffset((o) => o - 1)} aria-label="Semana anterior">
          <Icon name="left" size={18} />
        </button>
        <div>
          <span className="eyebrow">Plan de comidas</span>
          <strong>Semana {weekNo}</strong>
        </div>
        <button className="icon-btn" disabled={start >= 28} onClick={() => setOffset((o) => o + 1)} aria-label="Semana siguiente">
          <Icon name="right" size={18} />
        </button>
      </div>

      <div className="wplan">
        {days.map((i) => {
          const date = addDays(s.profile.start, i);
          const d = fromKey(date);
          const plan = mealsFor(s, date);
          const tot = sumMacros(SLOTS.map((sl) => plan[sl.id]));
          const dp = getDayPlan(SCHEDULE[i]);
          const eaten = s.meals[date] || {};
          return (
            <article key={i} className={`wday ${date === today ? 'is-today' : ''}`}>
              <header>
                <div>
                  <span className="wday-dow">
                    {DOW[d.getDay()]} {fmtDate(d)}
                  </span>
                  <strong>Día {i + 1}</strong>
                </div>
                <span className="wday-type" style={!dp.rest ? { color: dp.color, borderColor: dp.color } : undefined}>
                  {dp.rest ? (SCHEDULE[i] === 'OFF' ? 'Descanso' : 'Activo') : dp.title}
                </span>
              </header>
              {SLOTS.map((sl) => {
                const r = RECIPES[plan[sl.id]];
                return (
                  <button key={sl.id} className={`wmeal ${eaten[sl.id] ? 'on' : ''}`} onClick={() => onRecipe({ id: plan[sl.id], date, slot: sl.id })}>
                    <span className={`wdot wdot-${sl.id}`} />
                    <span className="wmeal-slot">{sl.name}</span>
                    <span className="wmeal-name">{r.name}</span>
                    <span className="wmeal-k">{r.kcal}</span>
                  </button>
                );
              })}
              <footer>
                <span>
                  <strong>{fmtNum(tot.kcal)}</strong> kcal
                </span>
                <span>
                  <strong>{tot.p}</strong> g prot
                </span>
                <span>
                  <strong>{tot.c}</strong> g carb
                </span>
                <span>
                  <strong>{tot.f}</strong> g grasa
                </span>
              </footer>
            </article>
          );
        })}
      </div>
      <p className="muted small center pad">
        El primer día de cada semana es el plan de ejemplo del PDF. Los demás días rotan recetas con los mismos macros. Toca
        una comida para ver la receta y cambiarla.
      </p>
    </>
  );
}

/* ───────────── RECETAS ───────────── */

function RecipesTab({ onRecipe }) {
  const [slot, setSlot] = useState('all');
  const list = Object.entries(RECIPES).filter(([, r]) => slot === 'all' || r.slot === slot);
  return (
    <>
      <div className="seg seg-4">
        {[{ id: 'all', name: 'Todas' }, ...SLOTS].map((sl) => (
          <button key={sl.id} className={slot === sl.id ? 'on' : ''} onClick={() => setSlot(sl.id)}>
            {sl.id === 'all' ? 'Todas' : sl.name}
          </button>
        ))}
      </div>
      <div className="rgrid">
        {list.map(([id, r]) => (
          <button key={id} className={`rcard rcard-${r.slot}`} onClick={() => onRecipe({ id })}>
            <span className="rcard-top">
              <span className="rcard-slot">{SLOTS.find((x) => x.id === r.slot).name}</span>
              {r.pdf && <span className="pdf-badge">PDF</span>}
            </span>
            <span className="rcard-kcal">
              {r.kcal}
              <small>kcal</small>
            </span>
            <strong className="rcard-name">{r.name}</strong>
            <span className="rcard-meta">
              <span>{r.p} g prot</span>
              <span>
                <Icon name="timer" size={12} /> {r.time}′
              </span>
            </span>
            <MacroBar p={r.p} c={r.c} f={r.f} showLegend={false} />
          </button>
        ))}
      </div>
    </>
  );
}

function RecipeDetail({ id, date, slot, onDone }) {
  const r = RECIPES[id];
  const s = useStore();
  const [have, setHave] = useState({});
  const [servings, setServings] = useState(1);
  const today = toKey();
  const slotInfo = SLOTS.find((x) => x.id === r.slot);
  const plannedToday = mealsFor(s, today)[r.slot] === id;
  const fmtQ = (q, u) => {
    const v = q * servings;
    if (u === 'g' && v >= 1000) return `${fmtNum(v / 1000, 2)} kg`;
    if (u === 'ml' && v >= 1000) return `${fmtNum(v / 1000, 2)} L`;
    return `${fmtNum(v, 1)} ${u}`;
  };
  return (
    <div className="recd">
      <div className={`recd-hero rcard-${r.slot}`}>
        <div className="recd-tags">
          <span className="tag">{slotInfo.name}</span>
          {r.pdf && <span className="tag tag-accent">Plan original del PDF</span>}
          <span className="tag">
            <Icon name="timer" size={12} /> {r.time} min
          </span>
        </div>
        <h2>{r.name}</h2>
        <p>{r.tagline}</p>
        <div className="recd-macros">
          <div>
            <strong>{r.kcal * servings}</strong>
            <span>kcal</span>
          </div>
          {['p', 'c', 'f'].map((k) => (
            <div key={k}>
              <strong>{r[k] * servings}</strong>
              <span>
                <i style={{ background: MACRO_COLORS[k] }} />
                {k === 'p' ? 'prot' : k === 'c' ? 'carb' : 'grasa'}
              </span>
            </div>
          ))}
        </div>
        <MacroBar p={r.p} c={r.c} f={r.f} showLegend={false} />
      </div>

      <div className="recd-head">
        <h4 className="exd-h">Ingredientes</h4>
        <div className="servings">
          <button onClick={() => setServings((v) => Math.max(1, v - 1))} aria-label="Menos raciones">
            <Icon name="minus" size={14} />
          </button>
          <span>
            {servings} {servings === 1 ? 'ración' : 'raciones'}
          </span>
          <button onClick={() => setServings((v) => Math.min(7, v + 1))} aria-label="Más raciones">
            <Icon name="plus" size={14} />
          </button>
        </div>
      </div>
      <ul className="ings">
        {r.ingredients.map((ing, k) => (
          <li key={k}>
            <button className={have[k] ? 'on' : ''} onClick={() => setHave((h) => ({ ...h, [k]: !h[k] }))} aria-pressed={!!have[k]}>
              <span className="ing-check">{have[k] && <Icon name="check" size={12} stroke={3} />}</span>
              <span className="ing-n">{ing.n}</span>
              <span className="ing-q">{fmtQ(ing.q, ing.u)}</span>
            </button>
          </li>
        ))}
      </ul>

      <h4 className="exd-h">Preparación</h4>
      <ol className="steps">
        {r.steps.map((st, k) => (
          <li key={k}>
            <span>{k + 1}</span>
            {st}
          </li>
        ))}
      </ol>
      {r.tip && (
        <div className="recd-tip">
          <Icon name="info" size={18} />
          <p>{r.tip}</p>
        </div>
      )}

      {date && slot ? (
        <button
          className="btn btn-primary btn-lg"
          onClick={() => {
            if (!(s.meals[date] || {})[slot]) toggleMeal(date, slot);
            onDone();
          }}
        >
          <Icon name="check" stroke={3} /> {(s.meals[date] || {})[slot] ? 'Ya está marcada como comida' : 'Marcar como comida'}
        </button>
      ) : (
        !plannedToday && (
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              pickMeal(today, r.slot, id);
              onDone();
            }}
          >
            <Icon name="calendar" size={18} /> Usar hoy como {slotInfo.name.toLowerCase()}
          </button>
        )
      )}
    </div>
  );
}

function SwapList({ date, slot, onPick, onRecipe }) {
  const s = useStore();
  const current = mealsFor(s, date)[slot];
  const sl = SLOTS.find((x) => x.id === slot);
  return (
    <div className="swap">
      <p className="muted small">
        Todas las opciones de {sl.name.toLowerCase()} tienen ~{sl.target.kcal} kcal y ~{sl.target.p} g de proteína. Cambia sin
        salirte del plan.
      </p>
      {recipesForSlot(slot).map(([id, r]) => (
        <div key={id} className={`swap-row ${id === current ? 'on' : ''}`}>
          <button className="swap-main" onClick={() => onPick(id)}>
            <RecipeTile id={id} size={48} />
            <span className="tl-txt">
              <strong>
                {r.name} {r.pdf && <span className="pdf-badge">PDF</span>}
              </strong>
              <small>
                {r.p} g prot · {r.c} g carb · {r.f} g grasa
              </small>
            </span>
            {id === current && <Icon name="check" stroke={3} className="accent" />}
          </button>
          <button className="icon-btn sm" onClick={() => onRecipe(id)} aria-label={`Ver receta de ${r.name}`}>
            <Icon name="info" size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ───────────── COMPRA ───────────── */

function ShopTab() {
  const s = useStore();
  const [days, setDays] = useState(7);
  const today = toKey();
  const ids = useMemo(() => {
    const out = [];
    for (let k = 0; k < days; k++) {
      const plan = mealsFor(s, addDays(today, k));
      SLOTS.forEach((sl) => out.push(plan[sl.id]));
    }
    return out;
  }, [s, days, today]);
  const groups = shoppingList(ids);
  const all = Object.values(groups).flat();
  const checked = all.filter((it) => s.shop?.[`${it.n}|${it.u}`]).length;
  const fmtQ = (q, u) => {
    if (u === 'g' && q >= 1000) return `${fmtNum(q / 1000, 2)} kg`;
    if (u === 'ml' && q >= 1000) return `${fmtNum(q / 1000, 2)} L`;
    return `${fmtNum(q, 1)} ${u}`;
  };

  return (
    <>
      <div className="card shop-head">
        <div>
          <span className="eyebrow">Lista de la compra</span>
          <strong>
            {checked}/{all.length} productos
          </strong>
        </div>
        <div className="seg seg-inline">
          {[3, 7].map((n) => (
            <button key={n} className={days === n ? 'on' : ''} onClick={() => setDays(n)}>
              {n} días
            </button>
          ))}
        </div>
      </div>
      <div className="bar-track shop-progress">
        <i style={{ width: `${all.length ? (checked / all.length) * 100 : 0}%` }} />
      </div>
      {Object.entries(groups).map(([cat, items]) => (
        <Section key={cat} title={cat}>
          <div className="ex-list">
            {items.map((it) => {
              const key = `${it.n}|${it.u}`;
              const on = !!s.shop?.[key];
              return (
                <button key={key} className={`shop-row ${on ? 'on' : ''}`} onClick={() => toggleShop(key)} aria-pressed={on}>
                  <span className="ing-check">{on && <Icon name="check" size={12} stroke={3} />}</span>
                  <span className="ing-n">{it.n}</span>
                  <span className="ing-q">{fmtQ(it.q, it.u)}</span>
                </button>
              );
            })}
          </div>
        </Section>
      ))}
      <button className="btn btn-ghost shop-reset" onClick={clearShop}>
        <Icon name="trash" size={16} /> Vaciar marcados
      </button>
      <p className="muted small center pad">
        Calculada con tu plan de los próximos {days} días, incluidos los cambios de comida que hayas hecho.
      </p>
    </>
  );
}

/* ───────────── GUÍA ───────────── */

function GuideTab() {
  const profile = useStore((s) => s.profile);
  const weights = useStore((s) => s.weights);
  const tgt = useTargets();
  const body = profile.body || {};
  const wKeys = Object.keys(weights).sort();
  const lastW = wKeys.length ? weights[wKeys[wKeys.length - 1]] : profile.weight;
  const [sex, setSex] = useState(body.sex || 'm');
  const [age, setAge] = useState(body.age || '');
  const [height, setHeight] = useState(body.height || '');
  const [weight, setWeight] = useState(lastW || '');
  const [act, setAct] = useState(body.act ?? 2);
  const [deficit, setDeficit] = useState(body.deficit || 750);

  const w = parseFloat(String(weight).replace(',', '.'));
  const h = parseFloat(height);
  const a = parseFloat(age);
  const valid = w > 30 && h > 120 && a > 12;
  const bmr = valid ? 10 * w + 6.25 * h - 5 * a + (sex === 'm' ? 5 : -161) : 0;
  const tdee = bmr * ACTIVITY[act].f;
  const kcal = Math.round((tdee - deficit) / 10) * 10;
  const minKcal = sex === 'm' ? 1500 : 1200;
  const safeKcal = Math.max(kcal, minKcal);
  const protein = valid ? Math.round(w * 2) : 0;

  const save = () => {
    setState((s) => ({ profile: { ...s.profile, body: { sex, age: a, height: h, act, deficit } } }));
    setTargets({ kcal: safeKcal, protein });
  };

  return (
    <>
      <Section title="Calcula tu objetivo">
        <div className="card calc">
          <div className="seg">
            <button className={sex === 'm' ? 'on' : ''} onClick={() => setSex('m')}>
              Hombre
            </button>
            <button className={sex === 'f' ? 'on' : ''} onClick={() => setSex('f')}>
              Mujer
            </button>
          </div>
          <div className="field-row three">
            <label className="field">
              <span>Edad</span>
              <input inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))} placeholder="28" />
            </label>
            <label className="field">
              <span>Altura</span>
              <div className="input-unit">
                <input inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value.replace(/\D/g, ''))} placeholder="178" />
                <em>cm</em>
              </div>
            </label>
            <label className="field">
              <span>Peso</span>
              <div className="input-unit">
                <input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="80" />
                <em>kg</em>
              </div>
            </label>
          </div>
          <div className="field">
            <span>Actividad</span>
            <div className="act">
              {ACTIVITY.map((x, k) => (
                <button key={k} className={act === k ? 'on' : ''} onClick={() => setAct(k)}>
                  <strong>{x.label}</strong>
                  <small>{x.hint}</small>
                </button>
              ))}
            </div>
          </div>
          <label className="field">
            <span>
              Déficit: <strong className="accent">−{deficit} kcal</strong>
            </span>
            <input className="range" type="range" min="500" max="1000" step="50" value={deficit} onChange={(e) => setDeficit(+e.target.value)} />
            <small>El PDF recomienda entre 500 y 1000 kcal por debajo de tu TDEE.</small>
          </label>

          {valid ? (
            <div className="calc-out">
              <div>
                <span>Metabolismo basal</span>
                <strong>{fmtNum(bmr)}</strong>
              </div>
              <div>
                <span>TDEE</span>
                <strong>{fmtNum(tdee)}</strong>
              </div>
              <div className="hl">
                <span>Tu objetivo</span>
                <strong>{fmtNum(safeKcal)}</strong>
              </div>
              <div className="hl">
                <span>Proteína</span>
                <strong>
                  {protein}
                  <small>g</small>
                </strong>
              </div>
            </div>
          ) : (
            <p className="muted small center">Rellena edad, altura y peso para calcularlo.</p>
          )}
          {valid && kcal < minKcal && (
            <p className="warn">
              <Icon name="info" size={16} /> El cálculo bajaba de {minKcal} kcal; lo hemos subido a ese mínimo. No bajes más sin
              supervisión.
            </p>
          )}
          {valid && (
            <p className="muted small">
              Proteína a 2 g/kg (el PDF recomienda 1,2–2,2 g/kg: {fmtNum(w * 1.2)}–{fmtNum(w * 2.2)} g). Si tu objetivo no es
              1800 kcal, ajusta sobre todo las raciones de carbohidratos (pan, arroz, pasta, avena).
            </p>
          )}
          <div className="btn-row">
            <button className="btn btn-primary" disabled={!valid} onClick={save}>
              Usar como mi objetivo
            </button>
            {tgt.custom && (
              <button className="btn btn-ghost" onClick={() => setTargets(null)}>
                Volver a 1800
              </button>
            )}
          </div>
          <p className="muted small center">
            Objetivo actual: <strong className="ink">{fmtNum(tgt.kcal)} kcal · {tgt.protein} g de proteína</strong>
          </p>
        </div>
      </Section>

      <Section title="Monta tu corte">
        <div className="card list-card">
          {SETUP.map((t, k) => (
            <p key={t}>
              <span className="num">{k + 1}</span> {t}
            </p>
          ))}
        </div>
      </Section>

      <Section title="Errores comunes">
        <div className="tips">
          {TIPS.map((t) => (
            <div key={t.t} className="tip-card">
              <strong>{t.t}</strong>
              <p>{t.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Después del corte">
        <div className="card list-card">
          {AFTER.map((t) => (
            <p key={t}>
              <Icon name="right" size={14} stroke={3} className="accent" /> {t}
            </p>
          ))}
        </div>
      </Section>
    </>
  );
}
