// Recetas del plan de 1800 kcal / ~190 g de proteína.
// Las 4 marcadas `pdf: true` son el "Sample Meal Plan" del PDF. El resto son
// alternativas con los mismos macros por comida para poder rotar sin salirte del plan.
// Macros aproximados por ración (kcal, proteína, carbohidratos, grasa).

export const SLOTS = [
  { id: 'breakfast', name: 'Desayuno', train: 'Pre-entreno', rest: 'Mañana', target: { kcal: 400, p: 40 } },
  { id: 'lunch', name: 'Comida', train: 'Post-entreno', rest: 'Mediodía', target: { kcal: 800, p: 90 } },
  { id: 'snack', name: 'Merienda', train: 'Snack', rest: 'Snack', target: { kcal: 300, p: 30 } },
  { id: 'dinner', name: 'Cena', train: 'Noche', rest: 'Noche', target: { kcal: 300, p: 30 } },
];

export const MACRO_COLORS = { p: '#E84A12', c: '#1E9A8A', f: '#9C72E0' };
export const MACRO_NAMES = { p: 'Proteína', c: 'Carbos', f: 'Grasa' };

// cat: categoría de la lista de la compra
const I = (n, q, u, cat) => ({ n, q, u, cat });
const PROT = 'Carne, pescado y huevos';
const LACT = 'Lácteos';
const CER = 'Pan, cereales y legumbres';
const FV = 'Fruta y verdura';
const DESP = 'Despensa';
const SUP = 'Suplementos';

export const RECIPES = {
  // ───────── DESAYUNOS (~400 kcal · 40 g) ─────────
  'bagel-stack': {
    slot: 'breakfast',
    pdf: true,
    name: 'Bagels de huevo y bacon de pavo',
    tagline: 'El desayuno pre-entreno del plan original',
    time: 10,
    kcal: 400,
    p: 40,
    c: 40,
    f: 10,
    ingredients: [
      I('Bagels finos (thin bagels)', 2, 'ud', CER),
      I('Huevos', 2, 'ud', PROT),
      I('Bacon de pavo (lonchas)', 2, 'ud', PROT),
      I('Salsa a elegir (light)', 1, 'cda', DESP),
    ],
    steps: [
      'Tuesta los bagels.',
      'Haz las lonchas de bacon de pavo en una sartén antiadherente 2 min por lado, sin aceite.',
      'En la misma sartén, haz los huevos a la plancha o revueltos.',
      'Monta los bagels con el huevo, el bacon y una cucharada de salsa.',
    ],
    tip: 'Tómalo 60–90 min antes de entrenar. Si usas spray de aceite, que sea poca cantidad.',
  },
  'egg-white-oats': {
    slot: 'breakfast',
    name: 'Tortilla de claras + avena con frutos rojos',
    tagline: 'Saciante y con carbohidratos lentos',
    time: 12,
    kcal: 400,
    p: 40,
    c: 36,
    f: 9,
    ingredients: [
      I('Claras de huevo', 250, 'ml', PROT),
      I('Huevos', 1, 'ud', PROT),
      I('Copos de avena', 40, 'g', CER),
      I('Frutos rojos', 80, 'g', FV),
      I('Espinacas', 30, 'g', FV),
    ],
    steps: [
      'Bate las claras con el huevo, sal y pimienta.',
      'Saltea las espinacas 1 min y añade el batido. Cuaja a fuego medio y dobla la tortilla.',
      'Mezcla la avena con agua o leche desnatada y caliéntala 1 min en el microondas.',
      'Pon los frutos rojos por encima de la avena.',
    ],
    tip: 'Las claras de brik ahorran tiempo y salen más baratas.',
  },
  'overnight-oats': {
    slot: 'breakfast',
    name: 'Overnight oats proteicos',
    tagline: 'Lo dejas hecho la noche anterior',
    time: 5,
    kcal: 380,
    p: 41,
    c: 42,
    f: 5,
    ingredients: [
      I('Copos de avena', 40, 'g', CER),
      I('Proteína whey (sabor a elegir)', 25, 'g', SUP),
      I('Skyr natural', 150, 'g', LACT),
      I('Leche desnatada', 80, 'ml', LACT),
      I('Fruta (plátano o fresas)', 80, 'g', FV),
    ],
    steps: [
      'En un bote, mezcla la avena, la whey, el skyr y la leche.',
      'Tápalo y déjalo en la nevera toda la noche (mínimo 4 h).',
      'Por la mañana, añade la fruta troceada y listo.',
    ],
    tip: 'Prepara 3 botes el domingo y tienes desayuno hasta el miércoles.',
  },
  'turkey-toast': {
    slot: 'breakfast',
    name: 'Tostadas con revuelto y pavo',
    tagline: 'El clásico salado, versión corte',
    time: 10,
    kcal: 400,
    p: 43,
    c: 30,
    f: 12,
    ingredients: [
      I('Pan integral (rebanadas)', 2, 'ud', CER),
      I('Huevos', 2, 'ud', PROT),
      I('Claras de huevo', 100, 'ml', PROT),
      I('Pechuga de pavo en lonchas', 60, 'g', PROT),
      I('Tomate', 1, 'ud', FV),
    ],
    steps: [
      'Tuesta el pan y frota medio tomate por encima.',
      'Haz un revuelto con los huevos y las claras a fuego bajo, removiendo sin parar.',
      'Pon el pavo sobre las tostadas y el revuelto encima.',
    ],
  },

  // ───────── COMIDAS (~800 kcal · 90 g) ─────────
  'chicken-wraps': {
    slot: 'lunch',
    pdf: true,
    name: 'Wraps de pollo + clear whey',
    tagline: 'La comida post-entreno del plan original',
    time: 20,
    kcal: 800,
    p: 90,
    c: 70,
    f: 16,
    ingredients: [
      I('Pechuga de pollo', 250, 'g', PROT),
      I('Tortillas de trigo', 2, 'ud', CER),
      I('Ensalada (lechuga, tomate, pepino)', 150, 'g', FV),
      I('Clear whey', 1, 'scoop', SUP),
      I('Especias (pimentón, ajo, comino)', 1, 'cdta', DESP),
    ],
    steps: [
      'Corta el pollo en tiras y sazónalo con las especias.',
      'Hazlo a la plancha a fuego fuerte 6–8 min hasta que esté dorado.',
      'Calienta las tortillas 20 s por lado en la sartén.',
      'Rellena con la ensalada y el pollo, y enrolla.',
      'Toma la clear whey con agua fría junto a la comida.',
    ],
    tip: 'Haz el doble de pollo y guarda la mitad para la cena o el día siguiente.',
  },
  'beef-rice-bowl': {
    slot: 'lunch',
    name: 'Bowl de ternera, arroz y verduras',
    tagline: 'Estilo teriyaki, sin pasarte de grasa',
    time: 20,
    kcal: 790,
    p: 82,
    c: 72,
    f: 18,
    ingredients: [
      I('Carne picada de ternera 5 % grasa', 250, 'g', PROT),
      I('Arroz (en crudo)', 60, 'g', CER),
      I('Brócoli y pimiento', 200, 'g', FV),
      I('Salsa de soja baja en sal', 2, 'cda', DESP),
      I('Aceite de oliva', 5, 'ml', DESP),
      I('Clear whey', 1, 'scoop', SUP),
    ],
    steps: [
      'Cuece el arroz (o usa un vasito de arroz cocido de 125 g).',
      'Dora la carne en una sartén con el aceite. Escurre la grasa que suelte.',
      'Añade las verduras y saltea 4 min. Echa la soja al final.',
      'Sirve sobre el arroz. Acompaña con la clear whey.',
    ],
  },
  'turkey-bolognese': {
    slot: 'lunch',
    name: 'Pasta boloñesa de pavo',
    tagline: 'Comfort food con 90 g de proteína',
    time: 25,
    kcal: 760,
    p: 92,
    c: 68,
    f: 11,
    ingredients: [
      I('Pasta (en crudo)', 80, 'g', CER),
      I('Carne picada de pavo', 250, 'g', PROT),
      I('Tomate triturado', 150, 'g', FV),
      I('Cebolla y ajo', 60, 'g', FV),
      I('Parmesano rallado', 15, 'g', LACT),
      I('Clear whey', 1, 'scoop', SUP),
    ],
    steps: [
      'Cuece la pasta al dente.',
      'Sofríe la cebolla y el ajo con un poco de agua (o spray de aceite).',
      'Añade el pavo y deshazlo con la cuchara hasta que se dore.',
      'Echa el tomate, sal, pimienta y orégano. Deja 10 min a fuego bajo.',
      'Mezcla con la pasta y termina con el parmesano. Clear whey de acompañamiento.',
    ],
    tip: 'Se congela bien: haz 3 raciones y guarda 2 en tuppers.',
  },
  'cod-potato': {
    slot: 'lunch',
    name: 'Merluza al horno con patata',
    tagline: 'Pescado blanco, mucho volumen',
    time: 35,
    kcal: 780,
    p: 84,
    c: 78,
    f: 12,
    ingredients: [
      I('Merluza o bacalao (lomos)', 300, 'g', PROT),
      I('Patata', 300, 'g', FV),
      I('Judías verdes', 150, 'g', FV),
      I('Aceite de oliva', 10, 'ml', DESP),
      I('Limón', 1, 'ud', FV),
      I('Clear whey', 1, 'scoop', SUP),
    ],
    steps: [
      'Precalienta el horno a 200 °C. Corta la patata en rodajas finas.',
      'Hornea la patata con la mitad del aceite y sal durante 20 min.',
      'Pon el pescado encima con el resto del aceite, ajo y limón. Hornea 12 min más.',
      'Cuece las judías al vapor 6 min. Clear whey de acompañamiento.',
    ],
  },

  // ───────── MERIENDAS (~300 kcal · 30 g) ─────────
  'tuna-pita': {
    slot: 'snack',
    pdf: true,
    name: 'Pita de atún con ensalada',
    tagline: 'El snack del plan original',
    time: 5,
    kcal: 300,
    p: 31,
    c: 36,
    f: 3,
    ingredients: [
      I('Atún al natural (lata)', 1, 'ud', PROT),
      I('Pan de pita', 1, 'ud', CER),
      I('Ensalada (lechuga, tomate, cebolla)', 100, 'g', FV),
    ],
    steps: [
      'Escurre bien el atún.',
      'Calienta la pita 1 min en la tostadora y ábrela.',
      'Rellénala con la ensalada y el atún. Sal, pimienta y unas gotas de limón.',
    ],
  },
  'skyr-banana': {
    slot: 'snack',
    name: 'Skyr con plátano y crema de cacahuete',
    tagline: 'Dulce, rápido y con 30 g de proteína',
    time: 2,
    kcal: 310,
    p: 30,
    c: 34,
    f: 6,
    ingredients: [
      I('Skyr natural', 250, 'g', LACT),
      I('Plátano', 1, 'ud', FV),
      I('Crema de cacahuete', 10, 'g', DESP),
      I('Canela', 1, 'pizca', DESP),
    ],
    steps: ['Pon el skyr en un bol.', 'Añade el plátano en rodajas, la crema de cacahuete y canela.'],
  },
  'rice-cakes-turkey': {
    slot: 'snack',
    name: 'Tortitas de arroz con pavo',
    tagline: 'Crujiente y para llevar',
    time: 3,
    kcal: 295,
    p: 29,
    c: 40,
    f: 2,
    ingredients: [
      I('Tortitas de arroz', 4, 'ud', CER),
      I('Pechuga de pavo en lonchas', 100, 'g', PROT),
      I('Queso fresco batido 0 %', 60, 'g', LACT),
      I('Manzana', 1, 'ud', FV),
    ],
    steps: ['Unta las tortitas con el queso batido.', 'Pon el pavo por encima.', 'La manzana, de postre.'],
  },
  'protein-shake': {
    slot: 'snack',
    name: 'Batido de proteína y plátano',
    tagline: 'Para cuando no hay tiempo',
    time: 2,
    kcal: 290,
    p: 33,
    c: 36,
    f: 1,
    ingredients: [
      I('Proteína whey', 30, 'g', SUP),
      I('Leche desnatada', 250, 'ml', LACT),
      I('Plátano', 1, 'ud', FV),
      I('Hielo', 4, 'ud', DESP),
    ],
    steps: ['Mete todo en la batidora.', 'Bate 30 s y listo.'],
  },

  // ───────── CENAS (~300 kcal · 30 g) ─────────
  'skyr-granola': {
    slot: 'dinner',
    pdf: true,
    name: 'Skyr con granola proteica, fruta y miel',
    tagline: 'La cena del plan original',
    time: 3,
    kcal: 300,
    p: 30,
    c: 35,
    f: 4,
    ingredients: [
      I('Skyr natural', 150, 'g', LACT),
      I('Granola alta en proteína', 30, 'g', CER),
      I('Fruta (frutos rojos o kiwi)', 80, 'g', FV),
      I('Miel', 10, 'g', DESP),
    ],
    steps: ['Pon el skyr en un bol.', 'Añade la granola, la fruta y un hilo de miel por encima.'],
    tip: 'La caseína del skyr se digiere despacio: va bien antes de dormir.',
  },
  'egg-white-scramble': {
    slot: 'dinner',
    name: 'Revuelto de claras con champiñones',
    tagline: 'Mucho volumen, pocas calorías',
    time: 10,
    kcal: 290,
    p: 36,
    c: 19,
    f: 6,
    ingredients: [
      I('Claras de huevo', 200, 'ml', PROT),
      I('Huevos', 1, 'ud', PROT),
      I('Champiñones y espinacas', 200, 'g', FV),
      I('Pan integral (rebanadas)', 1, 'ud', CER),
    ],
    steps: [
      'Saltea los champiñones 4 min y añade las espinacas hasta que se ablanden.',
      'Echa las claras y el huevo batidos y remueve a fuego bajo.',
      'Sirve con la tostada.',
    ],
  },
  'prawn-salad': {
    slot: 'dinner',
    name: 'Ensalada de gambas y garbanzos',
    tagline: 'Fresca y con fibra',
    time: 10,
    kcal: 300,
    p: 33,
    c: 22,
    f: 9,
    ingredients: [
      I('Gambas peladas', 120, 'g', PROT),
      I('Garbanzos cocidos', 100, 'g', CER),
      I('Hojas verdes, tomate y pepino', 200, 'g', FV),
      I('Aceite de oliva', 5, 'ml', DESP),
      I('Limón', 1, 'ud', FV),
    ],
    steps: [
      'Haz las gambas a la plancha 2 min con ajo.',
      'Enjuaga los garbanzos.',
      'Mezcla todo con las verduras y aliña con el aceite, limón y sal.',
    ],
  },
  'chicken-cream': {
    slot: 'dinner',
    name: 'Pechuga a la plancha con crema de calabacín',
    tagline: 'Cena caliente y ligera',
    time: 25,
    kcal: 300,
    p: 38,
    c: 23,
    f: 6,
    ingredients: [
      I('Pechuga de pollo', 150, 'g', PROT),
      I('Calabacín', 300, 'g', FV),
      I('Cebolla', 50, 'g', FV),
      I('Kiwi', 1, 'ud', FV),
    ],
    steps: [
      'Cuece el calabacín y la cebolla en poca agua 12 min y tritúralos con sal y pimienta.',
      'Haz la pechuga a la plancha 4–5 min por lado.',
      'El kiwi, de postre.',
    ],
    tip: 'La crema dura 4 días en la nevera: haz una olla.',
  },
};

// Semana tipo: el lunes es el plan original del PDF; el resto rota con las alternativas.
// Índice 0 = Día 1 del programa (mismo orden que WEEK_PATTERN).
export const WEEK_MEALS = [
  { breakfast: 'bagel-stack', lunch: 'chicken-wraps', snack: 'tuna-pita', dinner: 'skyr-granola' },
  { breakfast: 'overnight-oats', lunch: 'beef-rice-bowl', snack: 'skyr-banana', dinner: 'egg-white-scramble' },
  { breakfast: 'egg-white-oats', lunch: 'cod-potato', snack: 'rice-cakes-turkey', dinner: 'skyr-granola' },
  { breakfast: 'bagel-stack', lunch: 'turkey-bolognese', snack: 'protein-shake', dinner: 'chicken-cream' },
  { breakfast: 'turkey-toast', lunch: 'chicken-wraps', snack: 'tuna-pita', dinner: 'prawn-salad' },
  { breakfast: 'overnight-oats', lunch: 'cod-potato', snack: 'skyr-banana', dinner: 'egg-white-scramble' },
  { breakfast: 'egg-white-oats', lunch: 'beef-rice-bowl', snack: 'rice-cakes-turkey', dinner: 'skyr-granola' },
];

export const recipesForSlot = (slot) => Object.entries(RECIPES).filter(([, r]) => r.slot === slot);

export const sumMacros = (ids) =>
  ids.reduce(
    (a, id) => {
      const r = RECIPES[id];
      if (!r) return a;
      return { kcal: a.kcal + r.kcal, p: a.p + r.p, c: a.c + r.c, f: a.f + r.f };
    },
    { kcal: 0, p: 0, c: 0, f: 0 },
  );

/** Lista de la compra agregada a partir de una lista de IDs de receta */
export function shoppingList(ids) {
  const map = new Map();
  for (const id of ids) {
    for (const ing of RECIPES[id]?.ingredients || []) {
      const key = `${ing.n}|${ing.u}`;
      const cur = map.get(key) || { ...ing, q: 0 };
      cur.q += ing.q;
      map.set(key, cur);
    }
  }
  const groups = {};
  for (const it of map.values()) (groups[it.cat] ||= []).push(it);
  for (const k of Object.keys(groups)) groups[k].sort((a, b) => a.n.localeCompare(b.n, 'es'));
  return groups;
}
