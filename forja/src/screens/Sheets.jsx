import { useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { fmtDate, fmtNum, fmtTime, DOW } from '../components/ui.jsx';
import { useStore, programDays, fromKey, toKey, setState, resetAll, importData, sessionStats } from '../store.js';
import { getDayPlan, WORKOUTS } from '../data/program.js';
import { EXERCISES } from '../data/exercises.js';

export function DayDetail({ i, onStart, onOpenExercise }) {
  const s = useStore();
  const d = programDays(s)[i];
  const p = getDayPlan(d.plan);
  const date = fromKey(d.date);
  const canTrain = !p.rest && !d.session && d.date <= toKey() && !s.active;
  const st = d.session ? sessionStats(d.session, s.sessions) : null;

  return (
    <div className="dayd">
      <span className="eyebrow">
        Día {i + 1}/30 · {DOW[date.getDay()]} {fmtDate(date)}
      </span>
      <h2 className="display-sm" style={!p.rest ? { color: p.color } : undefined}>
        {p.title}
      </h2>
      <p className="muted">{p.subtitle}</p>

      {st && (
        <div className="sum-grid compact">
          <div>
            <span>Duración</span>
            <strong>{fmtTime(d.session.duration || 0)}</strong>
          </div>
          <div>
            <span>Series</span>
            <strong>{st.sets}</strong>
          </div>
          <div>
            <span>Volumen</span>
            <strong>
              {fmtNum(st.volume)}
              <small>kg</small>
            </strong>
          </div>
        </div>
      )}

      {p.rest ? (
        <div className="card list-card">
          {d.plan === 'OFF' ? (
            <>
              <p><Icon name="bed" size={16} className="accent" /> Descanso total: deja que el cuerpo se recupere.</p>
              <p><Icon name="bolt" size={16} className="accent" /> Mantén tu proteína y tus calorías.</p>
              <p><Icon name="moon" size={16} className="accent" /> Duerme 7–9 h. El sueño también quema grasa.</p>
            </>
          ) : (
            <>
              <p><Icon name="walk" size={16} className="accent" /> Camina 30–60 min a ritmo conversacional.</p>
              <p><Icon name="target" size={16} className="accent" /> Intensidad: 50–70 % de tu FC máxima.</p>
              <p><Icon name="drop" size={16} className="accent" /> Electrolitos al terminar.</p>
            </>
          )}
        </div>
      ) : (
        <div className="ex-list">
          {WORKOUTS[d.plan].items.map((it, k) => {
            const done = d.session?.entries[it.id]?.filter((x) => x.done) || [];
            const ex = EXERCISES[it.id];
            return (
              <button key={it.id} className="ex-row" onClick={() => onOpenExercise(it.id)}>
                <span className="ex-idx" style={{ color: p.color }}>
                  {String(k + 1).padStart(2, '0')}
                </span>
                <span className="ex-txt">
                  <strong>{ex.name}</strong>
                  <small>
                    {d.session
                      ? done.length
                        ? done.map((x) => (ex.type === 'weight' ? `${fmtNum(x.w, 1)}×${x.r}` : ex.type === 'cardio' ? `${x.r} min` : x.r)).join(' · ')
                        : 'Sin registrar'
                      : it.block === 'cardio'
                        ? it.reps
                        : `${it.sets} × ${it.reps} · ${it.note}`}
                  </small>
                </span>
                <Icon name="play" size={14} className="muted" />
              </button>
            );
          })}
        </div>
      )}

      {canTrain && (
        <button className="btn btn-primary btn-xl" onClick={() => onStart(i, d.plan)}>
          <Icon name="play" /> {d.status === 'missed' ? 'Recuperar este entreno' : 'Empezar entreno'}
        </button>
      )}
    </div>
  );
}

export function Settings({ onClose }) {
  const s = useStore();
  const fileRef = useRef(null);
  const [msg, setMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const p = s.profile;

  const setProfile = (patch) => setState((st) => ({ profile: { ...st.profile, ...patch } }));
  const setSettings = (patch) => setState((st) => ({ settings: { ...st.settings, ...patch } }));

  const exportData = () => {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `forja-backup-${toKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const onImport = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      importData(await f.text());
      setMsg('Datos importados correctamente');
    } catch (err) {
      setMsg('No se pudo importar: ' + err.message);
    }
    e.target.value = '';
  };

  return (
    <div className="settings">
      <h4 className="exd-h">Perfil</h4>
      <label className="field">
        <span>Nombre</span>
        <input value={p.name} onChange={(e) => setProfile({ name: e.target.value })} />
      </label>
      <label className="field">
        <span>Día 1 del programa</span>
        <input type="date" value={p.start} onChange={(e) => e.target.value && setProfile({ start: e.target.value })} />
      </label>
      <label className="field">
        <span>Peso objetivo</span>
        <div className="input-unit">
          <input
            inputMode="decimal"
            value={p.goal ?? ''}
            onChange={(e) => {
              const v = parseFloat(e.target.value.replace(',', '.'));
              setProfile({ goal: isFinite(v) ? v : null });
            }}
          />
          <em>kg</em>
        </div>
      </label>

      <h4 className="exd-h">Entreno</h4>
      <div className="field">
        <span>Descanso entre series</span>
        <div className="stepper">
          <button onClick={() => setSettings({ rest: Math.max(30, s.settings.rest - 15) })} aria-label="Menos">
            <Icon name="minus" size={18} />
          </button>
          <strong>{fmtTime(s.settings.rest)}</strong>
          <button onClick={() => setSettings({ rest: Math.min(300, s.settings.rest + 15) })} aria-label="Más">
            <Icon name="plus" size={18} />
          </button>
        </div>
        <small>Los ejercicios pesados (6–10) suman 30 s. El abdomen descansa 45 s.</small>
      </div>
      <label className="toggle">
        <span>Sonido al acabar el descanso</span>
        <input type="checkbox" checked={s.settings.sound} onChange={(e) => setSettings({ sound: e.target.checked })} />
        <i />
      </label>
      <label className="toggle">
        <span>Vibración</span>
        <input type="checkbox" checked={s.settings.vibrate} onChange={(e) => setSettings({ vibrate: e.target.checked })} />
        <i />
      </label>

      <h4 className="exd-h">Datos</h4>
      <p className="muted small">Todo se guarda en este dispositivo. Haz copias para no perder nada.</p>
      <div className="btn-row">
        <button className="btn btn-ghost" onClick={exportData}>
          <Icon name="download" size={18} /> Exportar
        </button>
        <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
          <Icon name="upload" size={18} /> Importar
        </button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={onImport} />
      </div>
      {msg && <p className="note">{msg}</p>}
      {confirmReset ? (
        <div className="btn-row">
          <button
            className="btn btn-danger"
            onClick={() => {
              resetAll();
              onClose();
            }}
          >
            Sí, borrar todo
          </button>
          <button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
            Cancelar
          </button>
        </div>
      ) : (
        <button className="btn btn-danger-ghost" onClick={() => setConfirmReset(true)}>
          <Icon name="trash" size={18} /> Reiniciar programa
        </button>
      )}
      <p className="credit">
        Programa basado en <em>The Aggressive Cut Blueprint: 30 Days</em>. Vídeos de técnica de creadores de YouTube.
        Consulta con un profesional antes de empezar un déficit agresivo.
      </p>
    </div>
  );
}
