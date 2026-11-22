// Programa extraído de "The Aggressive Cut Blueprint: 30 Days".
// Split de 4 días, series al fallo en 6–10 reps (salvo indicación), máx. 8 series/músculo.
// Tras cada sesión: superserie de abdomen + 30–45 min de LISS (cinta incl. 15, 4,5 km/h).

const ABS = (n1, n2) => [
  { id: 'cable-crunch', sets: 3, reps: '15–20', note: n1, block: 'abs' },
  { id: 'reverse-crunch', sets: 3, reps: '15–20', note: n2, block: 'abs' },
];
const LISS = { id: 'liss-incline-walk', sets: 1, reps: '30–45 min', note: 'Cinta incl. 15 · 4,5 km/h', block: 'cardio', minutes: 40 };

export const WORKOUTS = {
  D1: {
    id: 'D1',
    code: 'DÍA 1',
    title: 'Pecho y hombro',
    subtitle: 'Pecho · Deltoide anterior · Deltoide lateral',
    color: '#FF5A1F',
    items: [
      { id: 'incline-smith-press', sets: 3, reps: '6–10', note: 'Pesado, excéntrica controlada, al fallo' },
      { id: 'machine-chest-press', sets: 3, reps: '6–10', note: 'Recorrido completo, contracción intensa' },
      { id: 'cable-high-low-fly', sets: 2, reps: '10–15', note: 'Estiramiento profundo + aprieta' },
      { id: 'db-overhead-press', sets: 3, reps: '6–10', note: 'Técnica estricta, ROM completo, pesado' },
      { id: 'db-lateral-raise', sets: 3, reps: '10–15', note: 'Reps controladas, parciales al final si hace falta' },
      ...ABS('Excéntrica lenta, flexión completa', 'Control estricto, sin impulso'),
      LISS,
    ],
  },
  D2: {
    id: 'D2',
    code: 'DÍA 2',
    title: 'Espalda',
    subtitle: 'Espalda · Deltoide posterior',
    color: '#FF8A1F',
    items: [
      { id: 'chest-supported-row', sets: 3, reps: '6–10', note: 'Retracción escapular, estira abajo' },
      { id: 'wide-lat-pulldown', sets: 3, reps: '6–10', note: 'Codos abajo y atrás, pausa abajo' },
      { id: 'single-arm-cable-row', sets: 2, reps: '10–12', note: 'Controla estiramiento y contracción' },
      { id: 'lat-pulldown', sets: 2, reps: '10–12', note: 'Tensión constante, estiramiento profundo' },
      { id: 'reverse-pec-deck', sets: 3, reps: '12–15', note: 'Lento y controlado, deltoide posterior' },
      { id: 'reverse-cable-fly', sets: 2, reps: '12–15', note: 'Técnica estricta, sin impulso' },
      ...ABS('Crunch completo con pausa', 'Rodillas al pecho, baja lento'),
      LISS,
    ],
  },
  D3: {
    id: 'D3',
    code: 'DÍA 3',
    title: 'Brazos',
    subtitle: 'Tríceps · Bíceps',
    color: '#FF3D5A',
    items: [
      { id: 'rope-overhead-extension', sets: 3, reps: '8–12', note: 'Estiramiento profundo, codos fijos' },
      { id: 'vbar-pushdown', sets: 3, reps: '8–12', note: 'Pesado, estricto, extensión completa' },
      { id: 'cable-kickback', sets: 2, reps: '10–12', note: 'Aprieta al bloquear, sin balanceo' },
      { id: 'ez-preacher-curl', sets: 3, reps: '6–10', note: 'Estiramiento completo, al fallo' },
      { id: 'hammer-curl', sets: 3, reps: '8–12', note: 'Alterno estricto, aprieta arriba' },
      { id: 'single-db-preacher-curl', sets: 2, reps: '10–12', note: 'Técnica y contracción máxima' },
      ...ABS('Core firme, flexión fuerte', 'Lento y controlado'),
      LISS,
    ],
  },
  D4: {
    id: 'D4',
    code: 'DÍA 4',
    title: 'Pierna',
    subtitle: 'Cuádriceps · Femoral · Gemelo',
    color: '#FFB21F',
    items: [
      { id: 'lying-leg-curl', sets: 3, reps: '8–12', note: 'Recorrido completo, 2 s arriba' },
      { id: 'leg-extension', sets: 3, reps: '10–15', note: 'Controlado, pausa y contrae arriba' },
      { id: 'smith-squat', sets: 2, reps: '6–10', note: 'Al fallo, profundo y explosivo' },
      { id: 'db-rdl', sets: 2, reps: '10–12', note: 'Estira el femoral, cadera atrás' },
      { id: 'standing-calf-raise', sets: 4, reps: '15–20', note: 'Pausa arriba, estira abajo' },
      ...ABS('Crunch hacia el cinturón, estira arriba', 'Pies fuera del suelo, solo abdomen'),
      LISS,
    ],
  },
};

// Días de descanso: el PDF pide LISS 5–6 días/semana → 1 descanso activo + 1 descanso total.
export const REST = {
  LISS: {
    id: 'LISS',
    code: 'ACTIVO',
    title: 'Descanso activo',
    subtitle: 'Caminar 30–60 min a ritmo conversacional',
    rest: true,
  },
  OFF: {
    id: 'OFF',
    code: 'OFF',
    title: 'Descanso total',
    subtitle: 'Recupera: sueño, comida y pasos suaves',
    rest: true,
  },
};

// Semana tipo: L D1 · M D2 · X activo · J D3 · V D4 · S activo · D off
export const WEEK_PATTERN = ['D1', 'D2', 'LISS', 'D3', 'D4', 'LISS', 'OFF'];
export const TOTAL_DAYS = 30;

export const SCHEDULE = Array.from({ length: TOTAL_DAYS }, (_, i) => WEEK_PATTERN[i % 7]);
export const TRAINING_DAYS = SCHEDULE.filter((d) => WORKOUTS[d]).length;

export const getDayPlan = (key) => WORKOUTS[key] || REST[key];

export const RULES = [
  'Split de 4 días para hipertrofia y pérdida de grasa',
  'Series efectivas al fallo con cargas pesadas en 6–10 reps',
  'Máximo 8 series totales por grupo muscular',
  'Tras cada sesión: superserie de abdomen + 30–45 min de LISS',
];
