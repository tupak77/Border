import { useState } from 'react';
import Icon, { Logo } from '../components/Icon.jsx';
import { Ring, Section, fmtNum, DOW, fmtDate } from '../components/ui.jsx';
import { useStore, programDays, dayIndexFor, streak, toKey, toggleHabit, logWeight, fromKey } from '../store.js';
import { getDayPlan, TOTAL_DAYS, TRAINING_DAYS, WORKOUTS } from '../data/program.js';
import { EXERCISES } from '../data/exercises.js';
import { HABITS } from '../data/nutrition.js';

const HABIT_ICON = { train: 'dumbbell', liss: 'walk', protein: 'bolt', sleep: 'moon', water: 'drop' };

export default function Today({ onStart, onResume, onOpenDay, onSettings, onOpenExercise }) {
  const s = useStore();
  const today = toKey();
  const idx = dayIndexFor(s.profile, today);
  const days = programDays(s);
  const before = idx < 0;
  const after = idx >= TOTAL_DAYS;
  const cur = days[Math.max(0, Math.min(TOTAL_DAYS - 1, idx))];
  const plan = getDayPlan(cur.plan);
  const done = s.sessions.length;
  const st = streak(s);
  const habits = s.habits[today] || {};
  const doneToday = s.sessions.find((x) => x.date === today);
  const hour = new Date().getHours();
  const hello = hour < 6 ? 'Buenas noches' : hour < 13 ? 'Buenos días' : hour < 21 ? 'Buenas tardes' : 'Buenas noches';

  // semana actual (7 días alrededor de hoy dentro del programa)
  const wStart = Math.max(0, Math.min(TOTAL_DAYS - 7, idx - (((idx % 7) + 7) % 7)));
  const week = days.slice(wStart, wStart + 7);

  return (
    <div className="screen">
      <header className="top">
        <div className="brand-row">
          <Logo size={30} />
          <div>
            <span className="eyebrow">{hello}</span>
            <strong className="hello">{s.profile.name}</strong>
          </div>
        </div>
        <button className="icon-btn" onClick={onSettings} aria-label="Ajustes">
          <Icon name="gear" />
        </button>
      </header>

      {/* HERO */}
      <div className="hero" style={{ '--day': plan.color || 'var(--ink-3)' }}>
        <div className="hero-top">
          <div>
            <span className="eyebrow">
              {before ? 'Empieza pronto' : after ? 'Programa completado' : `Día ${idx + 1} de ${TOTAL_DAYS}`}
            </span>
            <div className="hero-day">
              <span className="hero-num">{before ? '00' : String(Math.min(idx + 1, TOTAL_DAYS)).padStart(2, '0')}</span>
              <span className="hero-of">/{TOTAL_DAYS}</span>
            </div>
          </div>
          <Ring value={Math.min(1, Math.max(0, idx + (doneToday ? 1 : 0)) / TOTAL_DAYS)} size={84} stroke={8}>
            <span className="ring-pct">{Math.round((Math.max(0, Math.min(TOTAL_DAYS, idx + (doneToday ? 1 : 0))) / TOTAL_DAYS) * 100)}%</span>
          </Ring>
        </div>

        {before ? (
          <p className="hero-msg">
            Tu corte arranca el {fmtDate(fromKey(s.profile.start))}. Mira el plan y prepara la cocina.
          </p>
        ) : after ? (
          <div className="hero-msg">
            <strong>Lo has forjado.</strong> 30 días completados. Revisa tu progreso y planifica la transición: sube
            150–300 kcal por semana.
          </div>
        ) : (
          <>
            <div className="hero-plan">
              <span className="chip" style={{ background: plan.color || 'var(--surface-3)' }}>
                {plan.code}
              </span>
              <h1 className="hero-title">{plan.title}</h1>
              <p className="hero-sub">{plan.subtitle}</p>
            </div>
            {plan.rest ? (
              <div className="hero-rest">
                <Icon name={cur.plan === 'OFF' ? 'bed' : 'walk'} size={20} />
                {cur.plan === 'OFF'
                  ? 'Hoy toca recuperar. Duerme bien, come tu proteína y camina suave si te apetece.'
                  : 'Camina 30–60 min al 50–70 % de tu FC máx. Marca el LISS abajo cuando lo hagas.'}
              </div>
            ) : doneToday ? (
              <button className="btn btn-ghost btn-lg" onClick={() => onOpenDay(cur.i)}>
                <Icon name="check" stroke={3} /> Sesión completada · ver resumen
              </button>
            ) : s.active ? (
              <button className="btn btn-primary btn-xl pulse" onClick={onResume}>
                <Icon name="play" /> Continuar entreno
              </button>
            ) : (
              <>
                <div className="hero-meta">
                  <span>
                    <Icon name="list" size={16} /> {WORKOUTS[cur.plan].items.length} ejercicios
                  </span>
                  <span>
                    <Icon name="timer" size={16} /> ~95 min
                  </span>
                  <span>
                    <Icon name="flame" size={16} /> Al fallo
                  </span>
                </div>
                <button className="btn btn-primary btn-xl" onClick={() => onStart(cur.i, cur.plan)}>
                  <Icon name="play" /> Empezar entreno
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* STATS */}
      <div className="stats-row">
        <div className="mini">
          <Icon name="flame" size={18} className="accent" />
          <strong>{st}</strong>
          <span>racha</span>
        </div>
        <div className="mini">
          <Icon name="dumbbell" size={18} className="accent" />
          <strong>
            {done}
            <small>/{TRAINING_DAYS}</small>
          </strong>
          <span>sesiones</span>
        </div>
        <WeightMini />
      </div>

      {/* WEEK */}
      <Section title="Esta semana">
        <div className="week">
          {week.map((d) => {
            const p = getDayPlan(d.plan);
            const date = fromKey(d.date);
            return (
              <button key={d.i} className={`wd wd-${d.status}`} onClick={() => onOpenDay(d.i)}>
                <span className="wd-dow">{DOW[date.getDay()]}</span>
                <span className="wd-num">{d.i + 1}</span>
                <span className="wd-tag" style={!p.rest ? { color: p.color } : undefined}>
                  {p.rest ? (d.plan === 'OFF' ? 'OFF' : 'LISS') : p.id}
                </span>
                {(d.status === 'done' || d.status === 'done-today') && <i className="wd-check" />}
              </button>
            );
          })}
        </div>
      </Section>

      {/* HABITS */}
      <Section title="Checklist de hoy" action={<span className="muted">{HABITS.filter((h) => habits[h.id]).length}/{HABITS.length}</span>}>
        <div className="habits">
          {HABITS.map((h) => (
            <button
              key={h.id}
              className={`habit ${habits[h.id] ? 'on' : ''}`}
              onClick={() => toggleHabit(today, h.id)}
              aria-pressed={!!habits[h.id]}
            >
              <span className="habit-ico">
                <Icon name={habits[h.id] ? 'check' : HABIT_ICON[h.id]} size={18} stroke={habits[h.id] ? 3 : 2} />
              </span>
              <span className="habit-txt">
                <strong>{h.label}</strong>
                <small>{h.hint}</small>
              </span>
            </button>
          ))}
        </div>
      </Section>

      {!plan.rest && !before && !after && (
        <Section title="Sesión de hoy">
          <div className="ex-list">
            {WORKOUTS[cur.plan].items.map((it, k) => {
              const ex = EXERCISES[it.id];
              return (
                <button key={it.id} className="ex-row" onClick={() => onOpenExercise(it.id)}>
                  <span className="ex-idx">{String(k + 1).padStart(2, '0')}</span>
                  <span className="ex-txt">
                    <strong>{ex.name}</strong>
                    <small>
                      {it.block === 'cardio' ? it.reps : `${it.sets} × ${it.reps}`}
                      {it.block === 'abs' ? ' · Superserie abdomen' : ''}
                    </small>
                  </span>
                  <Icon name="play" size={14} className="muted" />
                </button>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

function WeightMini() {
  const weights = useStore((s) => s.weights);
  const today = toKey();
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState('');
  const keys = Object.keys(weights).sort();
  const last = keys.length ? weights[keys[keys.length - 1]] : null;
  const save = () => {
    const v = parseFloat(val.replace(',', '.'));
    if (isFinite(v) && v > 20 && v < 400) logWeight(today, v);
    setEdit(false);
  };
  if (edit)
    return (
      <form
        className="mini mini-edit"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input autoFocus inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} onBlur={save} placeholder={last ? String(last) : 'kg'} />
        <span>kg hoy</span>
      </form>
    );
  return (
    <button
      className="mini"
      onClick={() => {
        setVal(weights[today] ? String(weights[today]) : '');
        setEdit(true);
      }}
    >
      <Icon name="scale" size={18} className="accent" />
      <strong>{last ? fmtNum(last, 1) : '—'}</strong>
      <span>{weights[today] ? 'kg hoy' : '+ pesarme'}</span>
    </button>
  );
}
