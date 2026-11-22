export const TARGETS = { kcal: 1800, protein: 190 };

export const HABITS = [
  { id: 'train', label: 'Entreno', hint: 'Sesión del día' },
  { id: 'liss', label: 'LISS', hint: '30–60 min' },
  { id: 'protein', label: 'Proteína', hint: '190 g' },
  { id: 'sleep', label: 'Sueño', hint: '7–9 h' },
  { id: 'water', label: 'Agua', hint: '3 L' },
];

export const SUPPLEMENTS = [
  { name: 'Clear whey', when: 'En la comida post-entreno' },
  { name: 'Pre-entreno', when: '~200 mg de cafeína antes de entrenar' },
  { name: 'Electrolitos', when: 'Después del LISS' },
];

export const SETUP = [
  'Calcula tu TDEE (gasto energético diario total)',
  'Crea un déficit de 500–1000 kcal',
  'Prioriza la proteína: 1,2–2,2 g por kg de peso',
  'Carbohidratos y grasas moderados o bajos',
  'Cardio diario + entreno de fuerza para conservar músculo',
];

export const TIPS = [
  { t: 'No bajes calorías demasiado rápido', d: 'Un déficit brutal desde el día 1 te deja sin gasolina para entrenar.' },
  { t: 'Sé constante', d: 'Registra macros y entrenos todos los días. Lo que no se mide no mejora.' },
  { t: 'Duerme y gestiona el estrés', d: 'La recuperación es la mitad del corte.' },
  { t: 'Sé realista', d: 'La pérdida de grasa no es lineal. Mira la media semanal, no el día a día.' },
];

export const AFTER = [
  'Sube 150–300 kcal por semana',
  'Mantén la proteína alta y reduce el cardio poco a poco',
  'Controla el peso cada semana',
];

export const TRACKING = [
  'Medias semanales mejor que pesajes diarios',
  'Fotos cada dos semanas en las mismas condiciones',
  'Medidas una vez al mes',
  'Registra tu rendimiento en el gym',
];

export const ACTIVITY = [
  { f: 1.2, label: 'Sedentario', hint: 'Trabajo sentado, sin entrenar' },
  { f: 1.375, label: 'Ligero', hint: '1–3 entrenos por semana' },
  { f: 1.55, label: 'Moderado', hint: '4 entrenos + LISS diario (este plan)' },
  { f: 1.725, label: 'Alto', hint: 'Trabajo físico + entreno' },
];

export const WATER_GLASS_ML = 250;
export const WATER_GOAL = 12; // 3 L
