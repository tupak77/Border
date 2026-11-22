import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Section, Empty, fmtNum, fmtTime, fmtDate, MONTHS } from '../components/ui.jsx';
import { LineChart, BarChart } from '../components/Charts.jsx';
import { useStore, toKey, logWeight, fromKey, sessionStats, bestFor, addDays } from '../store.js';
import { WORKOUTS, TRAINING_DAYS } from '../data/program.js';
import { EXERCISES } from '../data/exercises.js';
import { TRACKING } from '../data/nutrition.js';

export default function Progress({ onOpenExercise }) {
  const s = useStore();
  const [val, setVal] = useState('');
  const [date, setDate] = useState(toKey());
  const [allPrs, setAllPrs] = useState(false);

  const wKeys = Object.keys(s.weights).sort();
  const points = wKeys.map((k) => {
    // media móvil de 7 días
    const from = addDays(k, -6);
    const win = wKeys.filter((x) => x >= from && x <= k).map((x) => s.weights[x]);
    const d = fromKey(k);
    return {
      label: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
      value: s.weights[k],
      avg: win.length >= 2 ? win.reduce((a, b) => a + b, 0) / win.length : null,
    };
  });
  const first = wKeys.length ? s.weights[wKeys[0]] : null;
  const last = wKeys.length ? s.weights[wKeys[wKeys.length - 1]] : null;
  const delta = first != null && last != null ? last - first : null;

  const stats = s.sessions.map((ses) => ({ ses, st: sessionStats(ses, s.sessions) }));
  const totalVol = stats.reduce((a, x) => a + x.st.volume, 0);
  const totalTime = s.sessions.reduce((a, x) => a + (x.duration || 0), 0);
  const totalLiss =
    stats.reduce((a, x) => a + x.st.cardio, 0) +
    Object.entries(s.habits).filter(([d, h]) => h.liss && !s.sessions.some((x) => x.date === d)).length * 40;

  const bars = stats.slice(-12).map(({ ses, st }) => ({
    label: WORKOUTS[ses.wid].id,
    sub: `Día ${ses.day + 1} · ${WORKOUTS[ses.wid].title}`,
    value: st.volume,
  }));

  const prs = Object.keys(EXERCISES)
    .filter((id) => EXERCISES[id].type === 'weight')
    .map((id) => ({ id, best: bestFor(id, s.sessions) }))
    .filter((x) => x.best)
    .sort((a, b) => b.best.value - a.best.value);

  const save = (e) => {
    e.preventDefault();
    const v = parseFloat(val.replace(',', '.'));
    if (isFinite(v) && v > 20 && v < 400) {
      logWeight(date, v);
      setVal('');
    }
  };

  return (
    <div className="screen">
      <header className="page-head">
        <span className="eyebrow">Lo que se mide, mejora</span>
        <h1 className="display-sm">Progreso</h1>
      </header>

      <div className="kpis">
        <div className="kpi kpi-hero">
          <span>Cambio de peso</span>
          <strong className={delta != null && delta <= 0 ? 'accent' : ''}>
            {delta == null ? '—' : `${delta > 0 ? '+' : ''}${fmtNum(delta, 1)}`}
            <small>kg</small>
          </strong>
          {s.profile.goal && last != null && (
            <em>
              {last > s.profile.goal ? `Faltan ${fmtNum(last - s.profile.goal, 1)} kg para tu objetivo` : 'Objetivo alcanzado'}
            </em>
          )}
        </div>
        <div className="kpi">
          <span>Sesiones</span>
          <strong>
            {s.sessions.length}
            <small>/{TRAINING_DAYS}</small>
          </strong>
        </div>
        <div className="kpi">
          <span>Volumen total</span>
          <strong>
            {totalVol >= 10000 ? fmtNum(totalVol / 1000, 1) : fmtNum(totalVol)}
            <small>{totalVol >= 10000 ? 't' : 'kg'}</small>
          </strong>
        </div>
        <div className="kpi">
          <span>Tiempo</span>
          <strong>
            {fmtNum(totalTime / 3600, 1)}
            <small>h</small>
          </strong>
        </div>
        <div className="kpi">
          <span>LISS</span>
          <strong>
            {fmtNum(totalLiss)}
            <small>min</small>
          </strong>
        </div>
      </div>

      <Section title="Peso corporal">
        <form className="wlog" onSubmit={save}>
          <input type="date" value={date} max={toKey()} onChange={(e) => setDate(e.target.value || toKey())} />
          <div className="input-unit">
            <input inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} placeholder={last ? String(last) : '80,0'} />
            <em>kg</em>
          </div>
          <button className="btn btn-primary btn-sm" type="submit">
            Guardar
          </button>
        </form>
        {points.length >= 2 ? (
          <div className="card">
            <LineChart points={points} goal={s.profile.goal} />
            <div className="chart-key">
              <span>
                <i className="k-raw" /> Pesaje
              </span>
              <span>
                <i className="k-avg" /> Media 7 días
              </span>
            </div>
          </div>
        ) : (
          <Empty icon="scale" title="Pésate a diario" text="Con 2 pesajes verás la gráfica y la media semanal, que es la que importa." />
        )}
        {wKeys.length > 0 && (
          <details className="wlist">
            <summary>Ver registros ({wKeys.length})</summary>
            {[...wKeys].reverse().map((k) => (
              <div key={k} className="wrow">
                <span>{fmtDate(fromKey(k))}</span>
                <strong>{fmtNum(s.weights[k], 1)} kg</strong>
                <button className="icon-btn sm" onClick={() => logWeight(k, null)} aria-label="Borrar">
                  <Icon name="trash" size={16} />
                </button>
              </div>
            ))}
          </details>
        )}
      </Section>

      <Section title="Volumen por sesión">
        {bars.length ? (
          <div className="card">
            <BarChart bars={bars} />
          </div>
        ) : (
          <Empty icon="chart" title="Sin sesiones todavía" text="Completa tu primer entreno para ver tu volumen." />
        )}
      </Section>

      {prs.length > 0 && (
        <Section title="Récords personales">
          <div className="ex-list">
            {(allPrs ? prs : prs.slice(0, 6)).map(({ id, best }) => (
              <button key={id} className="ex-row" onClick={() => onOpenExercise(id)}>
                <span className="ex-idx">
                  <Icon name="trophy" size={16} />
                </span>
                <span className="ex-txt">
                  <strong>{EXERCISES[id].name}</strong>
                  <small>
                    {fmtNum(best.w, 1)} kg × {best.r} · {fmtDate(fromKey(best.date))}
                  </small>
                </span>
                <span className="pr-val">{fmtNum(best.value, 0)}<small>e1RM</small></span>
              </button>
            ))}
            {prs.length > 6 && (
              <button className="more" onClick={() => setAllPrs((v) => !v)}>
                {allPrs ? 'Ver menos' : `Ver los ${prs.length} récords`}
              </button>
            )}
          </div>
        </Section>
      )}

      {s.sessions.length > 0 && (
        <Section title="Historial">
          <div className="ex-list">
            {[...stats].reverse().map(({ ses, st }) => {
              const w = WORKOUTS[ses.wid];
              return (
                <div key={ses.id} className="ex-row static">
                  <span className="ex-idx" style={{ color: w.color }}>
                    {w.id}
                  </span>
                  <span className="ex-txt">
                    <strong>
                      Día {ses.day + 1} · {w.title}
                    </strong>
                    <small>
                      {fmtDate(fromKey(ses.date))} · {fmtTime(ses.duration || 0)} · {st.sets} series · {fmtNum(st.volume)} kg
                    </small>
                  </span>
                  {st.prs.length > 0 && <span className="tag tag-accent">{st.prs.length} PR</span>}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      <Section title="Cómo medir bien">
        <div className="card list-card">
          {TRACKING.map((t) => (
            <p key={t}>
              <Icon name="check" size={14} stroke={3} className="accent" /> {t}
            </p>
          ))}
        </div>
      </Section>
    </div>
  );
}
