export const TARGETS = { kcal: 1800, protein: 190 };

export const MEALS = [
  {
    id: 'breakfast',
    name: 'Desayuno',
    tag: 'Pre-entreno',
    items: '2 bagels finos + 2 huevos y 2 lonchas de bacon de pavo + salsa a elegir',
    kcal: 400,
    protein: 40,
  },
  {
    id: 'lunch',
    name: 'Comida',
    tag: 'Post-entreno',
    items: '250 g de pechuga de pollo, 2 tortillas de trigo, ensalada + 1 scoop de clear whey',
    kcal: 800,
    protein: 90,
  },
  {
    id: 'snack',
    name: 'Merienda',
    tag: 'Snack',
    items: '1 lata de atún, ensalada y pan de pita',
    kcal: 300,
    protein: 30,
  },
  {
    id: 'dinner',
    name: 'Cena',
    tag: 'Noche',
    items: '150 g de skyr + granola alta en proteína, fruta y miel',
    kcal: 300,
    protein: 30,
  },
];

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
