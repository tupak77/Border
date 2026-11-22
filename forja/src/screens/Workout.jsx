import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { fmtTime, fmtNum, Ring } from '../components/ui.jsx';
import {
  useStore,
  updateSet,
  addSet,
  removeSet,
  finishSession,
  discardSession,
  lastSetsFor,
  bestFor,
} from '../store.js';
import { WORKOUTS } from '../data/program.js';
import { EXERCISES, ytThumb } from '../data/exercises.js';

function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

let audioCtx;
function beep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime;
    [0, 0.18, 0.36].forEach((d, k) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.value = k === 2 ? 1320 : 880;
      g.gain.setValueAtTime(0.0001, t + d);
      g.gain.exponentialRampToValueAtTime(0.3, t + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.15);
      o.connect(g).connect(audioCtx.destination);
      o.start(t + d);
      o.stop(t + d + 0.16);
    });
  } catch {
    /* sin audio */
  }
}

export default function Workout({ onMinimize, onFinished, onOpenExercise }) {
  const active = useStore((s) => s.active);
  const settings = useStore((s) => s.settings);
  const now = useNow(500);
  const [rest, setRest] = useState(null); // { end, total }
  const [confirm, setConfirm] = useState(null); // 'finish' | 'discard'
  const firedRef = useRef(false);

  const remaining = rest ? Math.max(0, Math.ceil((rest.end - now) / 1000)) : 0;
  useEffect(() => {
    if (!rest) return;
    if (remaining === 0 && !firedRef.current) {
      firedRef.current = true;
      if (settings.vibrate && navigator.vibrate) navigator.vibrate([200, 100, 200]);
      if (settings.sound) beep();
      const t = setTimeout(() => setRest(null), 1500);
      return () => clearTimeout(t);
    }
  }, [remaining, rest, settings]);

  if (!active) return null;
  const w = WORKOUTS[active.wid];
  const elapsed = Math.floor((now - active.start) / 1000);

  let total = 0;
  let doneN = 0;
  for (const it of w.items) {
    const list = active.entries[it.id] || [];
    total += list.length;
    doneN += list.filter((x) => x.done).length;
  }

  const startRest = (sec) => {
    firedRef.current = false;
    // desbloquea el audio en iOS con el gesto del usuario
    if (settings.sound && !audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        /* */
      }
    }
    setRest({ end: Date.now() + sec * 1000, total: sec });
  };

  const toggleDone = (exId, k, set, ex, it) => {
    const willBeDone = !set.done;
    const patch = { done: willBeDone };
    // si no ha escrito reps, usa el mínimo del rango como valor por defecto
    if (willBeDone && !set.r && ex.type !== 'cardio') patch.r = String(parseInt(it.reps, 10) || '');
    const list = active.entries[exId];
    // sin kilos escritos: reutiliza los de la serie anterior
    if (willBeDone && ex.type === 'weight' && !set.w && k > 0 && list[k - 1].w) patch.w = list[k - 1].w;
    updateSet(exId, k, patch);
    // arrastra los kilos a la siguiente serie si está vacía
    const wNow = patch.w ?? set.w;
    if (willBeDone && ex.type === 'weight' && wNow && list[k + 1] && !list[k + 1].w && !list[k + 1].done)
      updateSet(exId, k + 1, { w: wNow });
    if (willBeDone && ex.type !== 'cardio') {
      if (navigator.vibrate && settings.vibrate) navigator.vibrate(15);
      const sec = it.block === 'abs' ? 45 : it.reps.startsWith('6') ? settings.rest + 30 : settings.rest;
      startRest(sec);
    }
  };

  const doFinish = () => {
    const res = finishSession();
    setRest(null);
    onFinished(res);
  };

  let lastBlock = null;

  return (
    <div className="workout">
      <header className="wk-head">
        <button className="icon-btn" onClick={onMinimize} aria-label="Minimizar">
          <Icon name="down" />
        </button>
        <div className="wk-title">
          <span className="eyebrow" style={{ color: w.color }}>
            Día {active.day + 1}/30 · {w.code}
          </span>
          <strong>{w.title}</strong>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setConfirm('finish')}>
          Terminar
        </button>
      </header>
      <div className="wk-bar">
        <div className="wk-clock">
          <Icon name="timer" size={16} /> {fmtTime(elapsed)}
        </div>
        <div className="wk-progress">
          <i style={{ width: `${total ? (doneN / total) * 100 : 0}%` }} />
        </div>
        <span className="wk-count">
          {doneN}/{total}
        </span>
      </div>

      <div className="wk-body">
        {w.items.map((it) => {
          const ex = EXERCISES[it.id];
          const sets = active.entries[it.id] || [];
          const prev = lastSetsFor(it.id);
          const best = bestFor(it.id);
          const allDone = sets.length && sets.every((x) => x.done);
          const header =
            it.block && it.block !== lastBlock ? (
              <div className="wk-block" key={`b-${it.block}`}>
                {it.block === 'abs' ? 'Superserie abdomen · alterna los dos' : 'Cardio final'}
              </div>
            ) : null;
          lastBlock = it.block;
          return (
            <div key={it.id}>
              {header}
              <article className={`wk-card ${allDone ? 'complete' : ''}`}>
                <button className="wk-card-head" onClick={() => onOpenExercise(it.id)}>
                  <span className="wk-thumb">
                    <img src={ytThumb(ex.yt)} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
                    <Icon name="play" size={14} />
                  </span>
                  <span className="wk-card-txt">
                    <strong>{ex.name}</strong>
                    <small>
                      {ex.type === 'cardio' ? it.reps : `${it.sets} × ${it.reps}`} · {it.note}
                    </small>
                    {best && ex.type === 'weight' && (
                      <small className="pr">
                        <Icon name="trophy" size={12} /> Mejor: {fmtNum(best.w, 1)} kg × {best.r}
                      </small>
                    )}
                  </span>
                  {allDone ? <Icon name="check" stroke={3} className="accent" /> : <Icon name="info" size={18} className="muted" />}
                </button>

                {ex.type === 'cardio' ? (
                  <div className="cardio-row">
                    <div className="cardio-inputs">
                      <label>
                        <input
                          inputMode="numeric"
                          value={sets[0]?.r ?? ''}
                          onChange={(e) => updateSet(it.id, 0, { r: e.target.value.replace(/[^\d]/g, '') })}
                        />
                        <span>min</span>
                      </label>
                      <div className="cardio-preset">
                        <span>Incl. 15</span>
                        <span>4,5 km/h</span>
                      </div>
                    </div>
                    <button
                      className={`set-check big ${sets[0]?.done ? 'on' : ''}`}
                      onClick={() => toggleDone(it.id, 0, sets[0], ex, it)}
                      aria-label="Marcar cardio hecho"
                    >
                      <Icon name="check" stroke={3} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="set-head">
                      <span>Serie</span>
                      <span>Anterior</span>
                      {ex.type === 'weight' && <span>kg</span>}
                      <span>Reps</span>
                      <span />
                    </div>
                    {sets.map((set, k) => {
                      const p = prev?.[k];
                      return (
                        <div key={k} className={`set-row ${set.done ? 'on' : ''} ${ex.type !== 'weight' ? 'bw' : ''}`}>
                          <span className="set-n">{k + 1}</span>
                          <span className="set-prev">{p ? (ex.type === 'weight' ? `${fmtNum(p.w, 1)}×${p.r}` : `${p.r}`) : '—'}</span>
                          {ex.type === 'weight' && (
                            <input
                              className="set-in"
                              inputMode="decimal"
                              placeholder={p ? String(p.w) : '0'}
                              value={set.w}
                              onChange={(e) => updateSet(it.id, k, { w: e.target.value.replace(',', '.').replace(/[^\d.]/g, '') })}
                            />
                          )}
                          <input
                            className="set-in"
                            inputMode="numeric"
                            placeholder={it.reps.split('–')[0]}
                            value={set.r}
                            onChange={(e) => updateSet(it.id, k, { r: e.target.value.replace(/[^\d]/g, '') })}
                          />
                          <button
                            className={`set-check ${set.done ? 'on' : ''}`}
                            onClick={() => toggleDone(it.id, k, set, ex, it)}
                            aria-label={`Marcar serie ${k + 1}`}
                          >
                            <Icon name="check" stroke={3} size={18} />
                          </button>
                        </div>
                      );
                    })}
                    <div className="set-actions">
                      <button className="link" onClick={() => removeSet(it.id)} disabled={sets.length <= 1}>
                        <Icon name="minus" size={16} /> Quitar
                      </button>
                      <button className="link" onClick={() => addSet(it.id)}>
                        <Icon name="plus" size={16} /> Añadir serie
                      </button>
                    </div>
                  </>
                )}
              </article>
            </div>
          );
        })}

        <button className="btn btn-primary btn-xl" onClick={() => setConfirm('finish')}>
          <Icon name="check" stroke={3} /> Terminar entreno
        </button>
        <button className="btn btn-danger-ghost" onClick={() => setConfirm('discard')}>
          Descartar sesión
        </button>
      </div>

      {rest && (
        <div className={`rest ${remaining === 0 ? 'rest-done' : ''}`}>
          <Ring value={rest.total ? remaining / rest.total : 0} size={58} stroke={5}>
            <Icon name="timer" size={18} />
          </Ring>
          <div className="rest-txt">
            <span className="eyebrow">{remaining === 0 ? '¡A por la siguiente!' : 'Descanso'}</span>
            <strong>{fmtTime(remaining)}</strong>
          </div>
          <button className="rest-btn" onClick={() => setRest((r) => ({ ...r, end: r.end - 15000 }))}>
            −15
          </button>
          <button className="rest-btn" onClick={() => setRest((r) => ({ total: r.total + 15, end: r.end + 15000 }))}>
            +15
          </button>
          <button className="rest-btn" onClick={() => setRest(null)} aria-label="Saltar descanso">
            <Icon name="skip" size={18} />
          </button>
        </div>
      )}

      {confirm && (
        <div className="confirm-wrap" onClick={() => setConfirm(null)}>
          <div className="confirm" onClick={(e) => e.stopPropagation()}>
            {confirm === 'finish' ? (
              <>
                <h3>¿Terminar el entreno?</h3>
                <p>
                  {doneN < total
                    ? `Te quedan ${total - doneN} series sin marcar. Solo se guardan las series marcadas.`
                    : 'Todas las series completadas. Brutal.'}
                </p>
                <button className="btn btn-primary btn-lg" onClick={doFinish}>
                  Guardar y terminar
                </button>
              </>
            ) : (
              <>
                <h3>¿Descartar la sesión?</h3>
                <p>Se borrará todo lo registrado en este entreno.</p>
                <button
                  className="btn btn-danger btn-lg"
                  onClick={() => {
                    discardSession();
                    onMinimize();
                  }}
                >
                  Descartar
                </button>
              </>
            )}
            <button className="btn btn-ghost" onClick={() => setConfirm(null)}>
              Seguir entrenando
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
