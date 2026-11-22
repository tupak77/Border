import { useEffect, useState } from 'react';
import Icon from './components/Icon.jsx';
import { Sheet } from './components/ui.jsx';
import { useStore, startSession } from './store.js';
import { EXERCISES } from './data/exercises.js';
import Onboarding from './screens/Onboarding.jsx';
import Today from './screens/Today.jsx';
import Plan from './screens/Plan.jsx';
import Library, { ExerciseDetail } from './screens/Library.jsx';
import Progress from './screens/Progress.jsx';
import Nutrition from './screens/Nutrition.jsx';
import Workout from './screens/Workout.jsx';
import Summary from './screens/Summary.jsx';
import { DayDetail, Settings } from './screens/Sheets.jsx';

const TABS = [
  { id: 'today', label: 'Hoy', icon: 'home' },
  { id: 'plan', label: 'Plan', icon: 'calendar' },
  { id: 'library', label: 'Ejercicios', icon: 'dumbbell' },
  { id: 'progress', label: 'Progreso', icon: 'chart' },
  { id: 'food', label: 'Nutrición', icon: 'fork' },
];

export default function App() {
  const profile = useStore((s) => s.profile);
  const active = useStore((s) => s.active);
  const [tab, setTab] = useState(() => (location.hash.slice(1) && TABS.some((t) => t.id === location.hash.slice(1)) ? location.hash.slice(1) : 'today'));
  const [showWorkout, setShowWorkout] = useState(false);
  const [exercise, setExercise] = useState(null);
  const [day, setDay] = useState(null);
  const [settings, setSettings] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    history.replaceState(null, '', `#${tab}`);
    window.scrollTo(0, 0);
  }, [tab]);

  if (!profile) return <Onboarding />;

  const start = (i, wid) => {
    if (!active) startSession(i, wid);
    setDay(null);
    setShowWorkout(true);
  };
  const openEx = (id) => setExercise(id);

  const screen = {
    today: (
      <Today
        onStart={start}
        onResume={() => setShowWorkout(true)}
        onOpenDay={setDay}
        onSettings={() => setSettings(true)}
        onOpenExercise={openEx}
      />
    ),
    plan: <Plan onOpenDay={setDay} onOpenExercise={openEx} />,
    library: <Library onOpenExercise={openEx} />,
    progress: <Progress onOpenExercise={openEx} />,
    food: <Nutrition />,
  }[tab];

  return (
    <div className="app">
      <main>{screen}</main>

      {active && !showWorkout && (
        <button className="resume" onClick={() => setShowWorkout(true)}>
          <span className="live-dot" /> Entreno en curso
          <strong>Volver</strong>
        </button>
      )}

      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
            <Icon name={t.icon} size={22} stroke={tab === t.id ? 2.4 : 1.8} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {showWorkout && active && (
        <Workout
          onMinimize={() => setShowWorkout(false)}
          onOpenExercise={openEx}
          onFinished={(res) => {
            setShowWorkout(false);
            setSummary(res);
          }}
        />
      )}

      {summary && <Summary result={summary} onClose={() => setSummary(null)} />}

      <Sheet open={day != null} onClose={() => setDay(null)}>
        {day != null && <DayDetail i={day} onStart={start} onOpenExercise={openEx} />}
      </Sheet>
      <Sheet open={!!exercise} onClose={() => setExercise(null)} full>
        {exercise && EXERCISES[exercise] && <ExerciseDetail id={exercise} />}
      </Sheet>
      <Sheet open={settings} onClose={() => setSettings(false)} title="Ajustes">
        <Settings onClose={() => setSettings(false)} />
      </Sheet>
    </div>
  );
}
