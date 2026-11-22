import Icon from '../components/Icon.jsx';
import { fmtTime, fmtNum } from '../components/ui.jsx';
import { WORKOUTS } from '../data/program.js';
import { EXERCISES } from '../data/exercises.js';

export default function Summary({ result, onClose }) {
  const { ses, stats } = result;
  const w = WORKOUTS[ses.wid];
  return (
    <div className="summary">
      <div className="burst" aria-hidden="true">
        {Array.from({ length: 18 }, (_, k) => (
          <i key={k} style={{ '--a': `${k * 20}deg`, '--d': `${(k % 5) * 40}ms` }} />
        ))}
      </div>
      <span className="eyebrow" style={{ color: w.color }}>
        Día {ses.day + 1}/30 · {w.title}
      </span>
      <h1 className="display">
        Sesión
        <br />
        <span className="accent">forjada.</span>
      </h1>
      <div className="sum-grid">
        <div>
          <span>Duración</span>
          <strong>{fmtTime(ses.duration)}</strong>
        </div>
        <div>
          <span>Series</span>
          <strong>{stats.sets}</strong>
        </div>
        <div>
          <span>Volumen</span>
          <strong>
            {fmtNum(stats.volume)}
            <small>kg</small>
          </strong>
        </div>
        <div>
          <span>LISS</span>
          <strong>
            {stats.cardio}
            <small>min</small>
          </strong>
        </div>
      </div>
      {stats.prs.length > 0 && (
        <div className="sum-prs">
          <h3>
            <Icon name="trophy" size={18} /> {stats.prs.length} {stats.prs.length === 1 ? 'récord personal' : 'récords personales'}
          </h3>
          {stats.prs.map((p) => (
            <div key={p.exId} className="sum-pr">
              <span>{EXERCISES[p.exId].name}</span>
              <strong>{fmtNum(p.value, 1)} kg e1RM</strong>
            </div>
          ))}
        </div>
      )}
      <p className="muted center">Electrolitos, comida post-entreno y a descansar.</p>
      <button className="btn btn-primary btn-xl" onClick={onClose}>
        Hecho
      </button>
    </div>
  );
}
