import { useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Video, fmtNum, Empty } from '../components/ui.jsx';
import { EXERCISES, MUSCLES, ytThumb, ytSearch } from '../data/exercises.js';
import { WORKOUTS } from '../data/program.js';
import { useStore, bestFor, e1rm } from '../store.js';

const usedIn = (id) =>
  Object.values(WORKOUTS)
    .filter((w) => w.items.some((i) => i.id === id))
    .map((w) => w);

export default function Library({ onOpenExercise }) {
  const [q, setQ] = useState('');
  const [m, setM] = useState('all');
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return Object.entries(EXERCISES).filter(
      ([, e]) =>
        (m === 'all' || e.muscle === m) && (!n || e.name.toLowerCase().includes(n) || e.en.toLowerCase().includes(n)),
    );
  }, [q, m]);
  const muscles = ['all', ...new Set(Object.values(EXERCISES).map((e) => e.muscle))];

  return (
    <div className="screen">
      <header className="page-head">
        <span className="eyebrow">{Object.keys(EXERCISES).length} ejercicios · vídeo de técnica</span>
        <h1 className="display-sm">Ejercicios</h1>
      </header>
      <label className="search">
        <Icon name="search" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar ejercicio" />
        {q && (
          <button onClick={() => setQ('')} aria-label="Borrar">
            <Icon name="x" size={16} />
          </button>
        )}
      </label>
      <div className="chips">
        {muscles.map((k) => (
          <button key={k} className={`fchip ${m === k ? 'on' : ''}`} onClick={() => setM(k)}>
            {k === 'all' ? 'Todos' : MUSCLES[k]}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <Empty icon="search" title="Sin resultados" text="Prueba con otro nombre o grupo muscular." />
      ) : (
        <div className="lib-grid">
          {list.map(([id, e]) => (
            <button key={id} className="lib-card" onClick={() => onOpenExercise(id)}>
              <span className="lib-img">
                <img src={ytThumb(e.yt)} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
                <span className="lib-play">
                  <Icon name="play" size={14} />
                </span>
              </span>
              <span className="lib-txt">
                <small>{MUSCLES[e.muscle]}</small>
                <strong>{e.name}</strong>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ExerciseDetail({ id }) {
  const sessions = useStore((s) => s.sessions);
  const e = EXERCISES[id];
  if (!e) return null;
  const best = bestFor(id, sessions);
  const history = sessions
    .filter((ses) => ses.entries[id]?.some((x) => x.done))
    .slice(-6)
    .reverse();
  const plans = usedIn(id);
  return (
    <div className="exd">
      <Video id={e.yt} title={e.name} />
      <div className="exd-head">
        <span className="eyebrow">{e.en}</span>
        <h2>{e.name}</h2>
        <div className="tags">
          <span className="tag tag-accent">{MUSCLES[e.muscle]}</span>
          {e.secondary.map((s) => (
            <span key={s} className="tag">
              {MUSCLES[s]}
            </span>
          ))}
          <span className="tag">{e.equipment}</span>
        </div>
      </div>

      {plans.map((w) => {
        const it = w.items.find((i) => i.id === id);
        return (
          <div key={w.id} className="exd-plan" style={{ '--c': w.color }}>
            <span>{w.code}</span>
            <strong>{it.block === 'cardio' ? it.reps : `${it.sets} × ${it.reps}`}</strong>
            <em>{it.note}</em>
          </div>
        );
      })}

      <h4 className="exd-h">Técnica</h4>
      <ol className="steps">
        {e.steps.map((s, k) => (
          <li key={k}>
            <span>{k + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      {e.type !== 'cardio' && (
        <>
          <h4 className="exd-h">Tu historial</h4>
          {best ? (
            <div className="exd-best">
              <Icon name="trophy" size={18} />
              <div>
                <strong>{e.type === 'weight' ? `${fmtNum(best.w, 1)} kg × ${best.r}` : `${best.r} reps`}</strong>
                {e.type === 'weight' && <small>e1RM estimado {fmtNum(best.value, 1)} kg</small>}
              </div>
            </div>
          ) : (
            <p className="muted">Aún no has registrado este ejercicio.</p>
          )}
          {history.map((ses) => (
            <div key={ses.id} className="hist">
              <span>{ses.date.slice(8, 10)}/{ses.date.slice(5, 7)}</span>
              <span className="hist-sets">
                {ses.entries[id]
                  .filter((x) => x.done)
                  .map((x, k) => (
                    <b key={k}>{e.type === 'weight' ? `${fmtNum(x.w, 1)}×${x.r}` : x.r}</b>
                  ))}
              </span>
              {e.type === 'weight' && (
                <em>{fmtNum(Math.max(...ses.entries[id].filter((x) => x.done).map((x) => e1rm(+x.w, +x.r))), 0)}</em>
              )}
            </div>
          ))}
        </>
      )}

      <a className="btn btn-ghost" href={ytSearch(e.en)} target="_blank" rel="noreferrer">
        <Icon name="search" size={16} /> Más vídeos en YouTube
      </a>
    </div>
  );
}
