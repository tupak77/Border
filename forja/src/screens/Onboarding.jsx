import { useState } from 'react';
import { Logo } from '../components/Icon.jsx';
import Icon from '../components/Icon.jsx';
import { setState, toKey, logWeight } from '../store.js';
import { RULES } from '../data/program.js';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [start, setStart] = useState(toKey());
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');

  const finish = () => {
    const w = parseFloat(String(weight).replace(',', '.'));
    const g = parseFloat(String(goal).replace(',', '.'));
    setState({
      profile: {
        name: name.trim() || 'Atleta',
        start,
        weight: isFinite(w) ? w : null,
        goal: isFinite(g) ? g : null,
      },
    });
    if (isFinite(w)) logWeight(toKey(), w);
  };

  return (
    <div className="onb">
      <div className="onb-bg" aria-hidden="true">
        <span>CUT</span>
        <span>30</span>
      </div>
      {step === 0 ? (
        <div className="onb-panel onb-intro">
          <div className="brand-row">
            <Logo size={44} />
            <span className="wordmark">FORJA</span>
          </div>
          <h1 className="display">
            30 días.
            <br />
            <span className="accent">Sin excusas.</span>
          </h1>
          <p className="lead">
            El programa de corte agresivo, en tu bolsillo. Entrena al fallo, registra cada serie, mira la técnica de cada
            ejercicio y llega al día 30 más definido que nunca.
          </p>
          <ul className="onb-rules">
            {RULES.map((r) => (
              <li key={r}>
                <Icon name="check" size={16} stroke={3} /> {r}
              </li>
            ))}
          </ul>
          <button className="btn btn-primary btn-xl" onClick={() => setStep(1)}>
            Empezar <Icon name="right" size={20} stroke={3} />
          </button>
        </div>
      ) : (
        <div className="onb-panel">
          <button className="icon-btn" onClick={() => setStep(0)} aria-label="Atrás">
            <Icon name="left" />
          </button>
          <h2 className="display-sm">Configura tu corte</h2>
          <label className="field">
            <span>¿Cómo te llamas?</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" autoComplete="given-name" />
          </label>
          <label className="field">
            <span>Día 1 del programa</span>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value || toKey())} />
            <small>La semana tipo empieza con el Día 1 (pecho). Ideal: un lunes.</small>
          </label>
          <div className="field-row">
            <label className="field">
              <span>Peso actual</span>
              <div className="input-unit">
                <input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="80" />
                <em>kg</em>
              </div>
            </label>
            <label className="field">
              <span>Objetivo</span>
              <div className="input-unit">
                <input inputMode="decimal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="75" />
                <em>kg</em>
              </div>
            </label>
          </div>
          <button className="btn btn-primary btn-xl" onClick={finish}>
            Forjar mi plan <Icon name="flame" size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
