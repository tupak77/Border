import Icon from '../components/Icon.jsx';
import { Ring, Section, fmtNum } from '../components/ui.jsx';
import { useStore, toKey, toggleMeal } from '../store.js';
import { MEALS, TARGETS, SUPPLEMENTS, SETUP, TIPS, AFTER } from '../data/nutrition.js';

export default function Nutrition() {
  const meals = useStore((s) => s.meals);
  const profile = useStore((s) => s.profile);
  const today = toKey();
  const m = meals[today] || {};
  const kcal = MEALS.filter((x) => m[x.id]).reduce((a, x) => a + x.kcal, 0);
  const prot = MEALS.filter((x) => m[x.id]).reduce((a, x) => a + x.protein, 0);
  const w = profile?.weight;

  return (
    <div className="screen">
      <header className="page-head">
        <span className="eyebrow">Plan de 1800 kcal · 190 g proteína</span>
        <h1 className="display-sm">Nutrición</h1>
      </header>

      <div className="card macro-card">
        <Ring value={kcal / TARGETS.kcal} size={128} stroke={11}>
          <strong className="ring-big">{fmtNum(kcal)}</strong>
          <small>/ {fmtNum(TARGETS.kcal)} kcal</small>
        </Ring>
        <div className="macro-side">
          <div>
            <span className="eyebrow">Proteína</span>
            <strong className="macro-num">
              {prot}
              <small>/{TARGETS.protein} g</small>
            </strong>
            <div className="bar-track">
              <i style={{ width: `${Math.min(100, (prot / TARGETS.protein) * 100)}%` }} />
            </div>
          </div>
          {w && (
            <p className="muted small">
              Para tus {fmtNum(w, 1)} kg: {fmtNum(w * 1.2)}–{fmtNum(w * 2.2)} g de proteína al día.
            </p>
          )}
        </div>
      </div>

      <Section title="Comidas de hoy">
        <div className="meals">
          {MEALS.map((x) => (
            <button key={x.id} className={`meal ${m[x.id] ? 'on' : ''}`} onClick={() => toggleMeal(today, x.id)} aria-pressed={!!m[x.id]}>
              <span className="meal-check">{m[x.id] && <Icon name="check" size={16} stroke={3} />}</span>
              <span className="meal-txt">
                <span className="meal-top">
                  <strong>{x.name}</strong>
                  <em>{x.tag}</em>
                </span>
                <span className="meal-items">{x.items}</span>
                <span className="meal-macros">
                  <b>{x.kcal} kcal</b>
                  <b>{x.protein} g prot</b>
                </span>
              </span>
            </button>
          ))}
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
    </div>
  );
}
