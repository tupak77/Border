import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Section, DOW, fmtDate } from '../components/ui.jsx';
import { useStore, programDays, fromKey } from '../store.js';
import { getDayPlan, WORKOUTS, RULES, WEEK_PATTERN } from '../data/program.js';
import { EXERCISES } from '../data/exercises.js';

export default function Plan({ onOpenDay, onOpenExercise }) {
  const s = useStore();
  const days = programDays(s);
  const [tab, setTab] = useState('cal');

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div className="screen">
      <header className="page-head">
        <span className="eyebrow">Aggressive Cut · 30 días</span>
        <h1 className="display-sm">Tu plan</h1>
      </header>

      <div className="seg">
        <button className={tab === 'cal' ? 'on' : ''} onClick={() => setTab('cal')}>
          Calendario
        </button>
        <button className={tab === 'split' ? 'on' : ''} onClick={() => setTab('split')}>
          Split 4 días
        </button>
      </div>

      {tab === 'cal' ? (
        <>
          <div className="legend">
            <span>
              <i className="lg lg-train" /> Entreno
            </span>
            <span>
              <i className="lg lg-liss" /> Descanso activo
            </span>
            <span>
              <i className="lg lg-off" /> Off
            </span>
            <span>
              <i className="lg lg-done" /> Hecho
            </span>
          </div>
          {weeks.map((wk, n) => (
            <Section key={n} title={`Semana ${n + 1}`}>
              <div className="cal">
                {wk.map((d) => {
                  const p = getDayPlan(d.plan);
                  const date = fromKey(d.date);
                  const done = d.status === 'done' || d.status === 'done-today';
                  return (
                    <button
                      key={d.i}
                      className={`cal-day ${p.rest ? (d.plan === 'OFF' ? 'is-off' : 'is-liss') : 'is-train'} st-${d.status}`}
                      style={!p.rest ? { '--c': p.color } : undefined}
                      onClick={() => onOpenDay(d.i)}
                    >
                      <span className="cal-top">
                        <span>{DOW[date.getDay()]}</span>
                        <span>{fmtDate(date)}</span>
                      </span>
                      <span className="cal-num">{String(d.i + 1).padStart(2, '0')}</span>
                      <span className="cal-name">{p.rest ? p.title : p.title}</span>
                      <span className="cal-badge">
                        {done ? <Icon name="check" size={14} stroke={3} /> : d.status === 'missed' ? '!' : p.rest ? '' : p.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>
          ))}
        </>
      ) : (
        <>
          <div className="card rules">
            {RULES.map((r) => (
              <p key={r}>
                <Icon name="bolt" size={14} className="accent" /> {r}
              </p>
            ))}
            <div className="pattern">
              {WEEK_PATTERN.map((k, i) => {
                const p = getDayPlan(k);
                return (
                  <span key={i} style={!p.rest ? { background: p.color, color: '#0B0B0C' } : undefined}>
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]}
                    <b>{p.rest ? (k === 'OFF' ? 'OFF' : 'LISS') : k}</b>
                  </span>
                );
              })}
            </div>
          </div>
          {Object.values(WORKOUTS).map((w) => (
            <Section key={w.id} title={`${w.code} — ${w.title}`}>
              <div className="ex-list" style={{ '--c': w.color }}>
                {w.items.map((it, k) => (
                  <button key={it.id} className="ex-row" onClick={() => onOpenExercise(it.id)}>
                    <span className="ex-idx" style={{ color: w.color }}>
                      {String(k + 1).padStart(2, '0')}
                    </span>
                    <span className="ex-txt">
                      <strong>{EXERCISES[it.id].name}</strong>
                      <small>
                        {it.block === 'cardio' ? it.reps : `${it.sets} × ${it.reps}`} · {it.note}
                      </small>
                    </span>
                    <Icon name="right" size={16} className="muted" />
                  </button>
                ))}
              </div>
            </Section>
          ))}
        </>
      )}
    </div>
  );
}
