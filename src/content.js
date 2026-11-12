// All copy lives here so it can be edited without touching layout.
// Items marked "EDIT:" are placeholders worth replacing with real numbers/links.

export const contact = {
  email: "htmelh@gmail.com",
  linkedin: "https://www.linkedin.com/in/haitam-el-harchal-902338211",
  cv: "./CV_Haitam_El_Harchal.pdf",
  padelmaniacos: "", // EDIT: add the Padelmaniacos app URL / store link
};

const en = {
  nav: { story: "Why", playbook: "Playbook", projects: "Projects", history: "Career", contact: "Contact" },
  hero: {
    kicker: "Open application · Playtomic",
    first: "Haitam",
    last: "El Harchal",
    role: "CRM & Lifecycle Manager",
    lead:
      "7+ years building journeys that turn new users into regulars, and regulars into fans. I also play padel every single day. I'd like to do both at Playtomic.",
    ctaPrimary: "Book a call",
    ctaSecondary: "Download CV",
  },
  card: {
    label: "Player card",
    position: "Position",
    positionV: "CRM & Lifecycle",
    plays: "Plays",
    playsV: "Every day",
    base: "Based in",
    baseV: "Spain",
    status: "Status",
    statusV: "Available",
    stats: [
      { k: "7+", v: "years in CRM" },
      { k: "4", v: "channels owned" },
      { k: "1", v: "padel app built" },
    ],
  },
  ticker: [
    "Onboarding", "Activation", "Retention", "Win-back", "A/B & multivariate", "Holdout groups",
    "RFM segmentation", "Braze", "Customer.io", "Optimove", "RevenueCat", "Push · In-app · Email · SMS",
  ],
  story: {
    tag: "Set 01 — Why Playtomic",
    title: "I'm already one of your most active users.",
    paragraphs: [
      "I book courts on Playtomic, join open matches, check my level after every game. I've organised tournaments in my city and ended up building my own app to run them: Padelmaniacos.",
      "By day I run CRM and lifecycle for a high-volume consumer product across Europe. Same problems Playtomic has: get people to their first match, bring them back next week, and win them back when life gets in the way.",
      "There was an opening on your team a while ago. I didn't apply. I was fully committed to a major project at my current company and wanted to see it through. It's now delivered, and it went well. The timing is right.",
    ],
    facts: [
      { k: "Daily", v: "on court" },
      { k: "Tournaments", v: "organised locally" },
      { k: "Padelmaniacos", v: "my own tournament app" },
    ],
  },
  playbook: {
    tag: "Set 02 — Lifecycle playbook",
    title: "How I'd think about the Playtomic player journey.",
    intro:
      "A first pass from the outside, written as a player and a CRM manager. Hypotheses to test, not answers. Every stage gets a holdout group.",
    trigger: "Trigger",
    message: "Play",
    kpi: "KPI",
    stages: [
      {
        name: "Sign-up",
        trigger: "Account created, no booking in 48h",
        message: "Push with the 3 nearest clubs that have a slot tonight. Email explains levels and open matches.",
        kpi: "Time to first booking",
      },
      {
        name: "First match",
        trigger: "First match played",
        message: "In-app: rate your match, get a provisional level. Prompt to follow the players you met.",
        kpi: "2nd match within 14 days",
      },
      {
        name: "Habit",
        trigger: "Plays on the same weekday 2 weeks in a row",
        message: "Weekly 'your slot' reminder before peak hours fill up. Suggest open matches at your level.",
        kpi: "Weekly active players",
      },
      {
        name: "Progression",
        trigger: "Level change or results streak",
        message: "Celebrate the level-up. Point to tournaments and leagues at the new level.",
        kpi: "Competition sign-ups",
      },
      {
        name: "Premium",
        trigger: "High booking frequency, hits a free-tier limit",
        message: "Contextual paywall at the moment of value, not at random. Trial tied to a real benefit.",
        kpi: "Trial-to-paid",
      },
      {
        name: "Win-back",
        trigger: "Usual cadence broken (RFM drop)",
        message: "'Your group played without you': open match with familiar players. Escalate to an offer only if needed.",
        kpi: "Reactivation, incremental vs holdout",
      },
    ],
  },
  projects: {
    tag: "Set 03 — Projects",
    title: "Things I've built and run.",
    items: [
      {
        badge: "Side project · Padel",
        name: "Padelmaniacos",
        desc:
          "An app I built to run padel tournaments in my city: registrations, draws, schedules and results in one place instead of WhatsApp chaos.",
        points: ["Player registration and pairs", "Draws and match scheduling", "Live results for the community"],
        link: "View app",
        accent: true,
      },
      {
        badge: "Community · Padel",
        name: "Local tournaments",
        desc:
          "Organised padel tournaments from zero: venue, format, levels, communication, prizes. I've seen first-hand what makes players sign up and show up again.",
        points: ["Formats by level", "Player comms end-to-end", "Repeat participation"],
      },
      {
        badge: "Entain · Europe",
        name: "Lifecycle & monetisation programme",
        desc:
          "Multi-channel automated journeys across acquisition, conversion, retention and win-back for European markets, in a very high-volume environment.",
        points: ["Structured A/B testing framework", "RFM and behavioural scoring", "Push, in-app, email, SMS"],
      },
      {
        badge: "TOC-TOC · Mobile app",
        name: "Gamified habit loops",
        desc:
          "Mobile CRM for a gamified family fitness app with milestones and leaderboards. Very close to a sports community app: progress, competition, rewards.",
        points: ["Paywalls at milestone moments", "RevenueCat subscriptions", "Event tracking taxonomy"],
      },
    ],
  },
  history: {
    tag: "Set 04 — Career",
    title: "Match history.",
    items: [
      {
        when: "Aug 2022 — Present",
        org: "Entain",
        role: "CRM & Lifecycle Marketing Manager",
        points: [
          "Lead CRM monetisation and lifecycle strategy across European markets.",
          "Own revenue-generating campaigns across acquisition, conversion, retention and win-back.",
          "Build and scale A/B testing frameworks on copy, cadence, offers and channels to lift LTV.",
          "Partner with Analytics, Product and Tech on deliverability and data integrations.",
        ],
      },
      {
        when: "Oct 2021 — Aug 2022",
        org: "Entain",
        role: "CRM Ops Lead Europe",
        points: [
          "Ran real-time CRM operations across multiple European labels, beating SLA targets.",
          "Owned response time, CSAT and operational KPIs across time zones.",
        ],
      },
      {
        when: "Sep 2019 — Oct 2021",
        org: "TOC-TOC Mobile App",
        role: "Marketing & CRM Manager",
        points: [
          "Led mobile CRM, monetisation and growth for a gamified health and fitness app.",
          "Automated push, in-app and email journeys that turned daily tracking into habits and lifted DAU.",
          "Ran A/B and multivariate tests to improve trial-to-paid and reduce churn.",
        ],
      },
    ],
    skillsTitle: "Kit bag",
    skills: [
      { group: "Lifecycle", items: ["Journey architecture", "Onboarding & activation", "Retention & win-back", "Churn prevention", "Monetisation"] },
      { group: "Testing & data", items: ["A/B & multivariate", "Holdout groups", "Cohort analysis", "RFM segmentation", "LTV reporting"] },
      { group: "Tools", items: ["Braze", "Customer.io", "Optimove", "RevenueCat", "HubSpot", "BI tools"] },
    ],
    certsTitle: "Certifications",
    certs: [
      "Marketing & Lifecycle · MiniMBA, 2025",
      "Implementation of Sales with CRM · HubSpot Academy, 2025",
      "Triggers & Workflows · Optimove, 2025",
      "Lifecycles & Segmentation · Optimove, 2024",
    ],
  },
  contact: {
    tag: "Match point",
    title: "Let's book a match.",
    text:
      "If something opens up in CRM, Lifecycle or Growth, I'd love to talk. And if you need a fourth for a match, I'm usually free too.",
    email: "Email me",
    linkedin: "LinkedIn",
    cv: "Download CV",
  },
  footer: "Designed and built by Haitam El Harchal. Not affiliated with Playtomic.",
};

const es = {
  nav: { story: "Por qué", playbook: "Playbook", projects: "Proyectos", history: "Trayectoria", contact: "Contacto" },
  hero: {
    kicker: "Candidatura abierta · Playtomic",
    first: "Haitam",
    last: "El Harchal",
    role: "CRM & Lifecycle Manager",
    lead:
      "Más de 7 años creando journeys que convierten usuarios nuevos en habituales, y habituales en fans. Además juego al pádel todos los días. Me gustaría hacer las dos cosas en Playtomic.",
    ctaPrimary: "Hablemos",
    ctaSecondary: "Descargar CV",
  },
  card: {
    label: "Ficha de jugador",
    position: "Posición",
    positionV: "CRM & Lifecycle",
    plays: "Juega",
    playsV: "A diario",
    base: "Desde",
    baseV: "España",
    status: "Estado",
    statusV: "Disponible",
    stats: [
      { k: "7+", v: "años en CRM" },
      { k: "4", v: "canales" },
      { k: "1", v: "app de pádel" },
    ],
  },
  ticker: en.ticker,
  story: {
    tag: "Set 01 — Por qué Playtomic",
    title: "Ya soy uno de vuestros usuarios más activos.",
    paragraphs: [
      "Reservo pista en Playtomic, me apunto a partidos abiertos y miro mi nivel después de cada partido. He organizado torneos en mi ciudad y acabé creando mi propia app para gestionarlos: Padelmaniacos.",
      "En mi día a día llevo CRM y lifecycle de un producto de consumo de alto volumen en Europa. Los mismos retos que tiene Playtomic: llevar a la gente a su primer partido, que vuelva la semana siguiente y recuperarla cuando deja de jugar.",
      "Hace un tiempo salió una vacante en vuestro equipo y no me presenté. Estaba volcado en un proyecto grande e importante en mi empresa y quería terminarlo. Ya está entregado, y con éxito. Ahora es el momento.",
    ],
    facts: [
      { k: "A diario", v: "en la pista" },
      { k: "Torneos", v: "organizados en mi ciudad" },
      { k: "Padelmaniacos", v: "mi app de torneos" },
    ],
  },
  playbook: {
    tag: "Set 02 — Playbook de lifecycle",
    title: "Cómo pensaría el journey del jugador en Playtomic.",
    intro:
      "Una primera idea desde fuera, escrita como jugador y como CRM manager. Hipótesis para testear, no respuestas. Cada fase con su grupo de control.",
    trigger: "Trigger",
    message: "Jugada",
    kpi: "KPI",
    stages: [
      {
        name: "Registro",
        trigger: "Cuenta creada, sin reserva en 48 h",
        message: "Push con los 3 clubes más cercanos con hueco esta noche. Email que explica niveles y partidos abiertos.",
        kpi: "Tiempo hasta la 1ª reserva",
      },
      {
        name: "Primer partido",
        trigger: "Primer partido jugado",
        message: "In-app: valora el partido y obtén tu nivel provisional. Invitación a seguir a los jugadores con los que has jugado.",
        kpi: "2º partido en 14 días",
      },
      {
        name: "Hábito",
        trigger: "Juega el mismo día de la semana 2 semanas seguidas",
        message: "Recordatorio semanal de «tu hueco» antes de que se llenen las horas punta. Partidos abiertos de tu nivel.",
        kpi: "Jugadores activos semanales",
      },
      {
        name: "Progresión",
        trigger: "Cambio de nivel o racha de resultados",
        message: "Celebrar la subida de nivel. Mostrar torneos y ligas del nuevo nivel.",
        kpi: "Inscripciones a competiciones",
      },
      {
        name: "Premium",
        trigger: "Alta frecuencia de reservas, llega a un límite gratuito",
        message: "Paywall contextual en el momento de valor, no al azar. Prueba ligada a un beneficio real.",
        kpi: "Trial-to-paid",
      },
      {
        name: "Recuperación",
        trigger: "Rompe su frecuencia habitual (caída en RFM)",
        message: "«Tu grupo jugó sin ti»: partido abierto con jugadores conocidos. Oferta solo si hace falta.",
        kpi: "Reactivación incremental vs control",
      },
    ],
  },
  projects: {
    tag: "Set 03 — Proyectos",
    title: "Cosas que he creado y llevado.",
    items: [
      {
        badge: "Proyecto personal · Pádel",
        name: "Padelmaniacos",
        desc:
          "Una app que creé para organizar torneos de pádel en mi ciudad: inscripciones, cuadros, horarios y resultados en un solo sitio, sin el caos de WhatsApp.",
        points: ["Inscripción de jugadores y parejas", "Cuadros y calendario de partidos", "Resultados en directo para la comunidad"],
        link: "Ver app",
        accent: true,
      },
      {
        badge: "Comunidad · Pádel",
        name: "Torneos locales",
        desc:
          "He organizado torneos de pádel desde cero: club, formato, niveles, comunicación y premios. He visto de primera mano qué hace que un jugador se apunte y repita.",
        points: ["Formatos por nivel", "Comunicación con jugadores", "Participación recurrente"],
      },
      {
        badge: "Entain · Europa",
        name: "Programa de lifecycle y monetización",
        desc:
          "Journeys automatizados multicanal en captación, conversión, retención y recuperación para mercados europeos, en un entorno de muy alto volumen.",
        points: ["Framework de A/B testing", "RFM y scoring de comportamiento", "Push, in-app, email, SMS"],
      },
      {
        badge: "TOC-TOC · App móvil",
        name: "Gamificación y hábitos",
        desc:
          "CRM móvil de una app de fitness familiar gamificada con logros y rankings. Muy parecido a una app de comunidad deportiva: progreso, competición y recompensas.",
        points: ["Paywalls en momentos de logro", "Suscripciones con RevenueCat", "Taxonomía de eventos"],
      },
    ],
  },
  history: {
    tag: "Set 04 — Trayectoria",
    title: "Historial de partidos.",
    items: [
      {
        when: "Ago 2022 — Actualidad",
        org: "Entain",
        role: "CRM & Lifecycle Marketing Manager",
        points: [
          "Lidero la estrategia de monetización y lifecycle CRM en mercados europeos.",
          "Responsable de campañas de captación, conversión, retención y recuperación.",
          "Creo y escalo frameworks de A/B testing en copy, cadencia, ofertas y canales para subir el LTV.",
          "Trabajo con Analytics, Producto y Tech en entregabilidad e integraciones de datos.",
        ],
      },
      {
        when: "Oct 2021 — Ago 2022",
        org: "Entain",
        role: "CRM Ops Lead Europe",
        points: [
          "Operaciones CRM en tiempo real para varias marcas europeas, superando los SLA.",
          "Responsable de tiempos de respuesta, CSAT y KPIs operativos entre zonas horarias.",
        ],
      },
      {
        when: "Sep 2019 — Oct 2021",
        org: "TOC-TOC Mobile App",
        role: "Marketing & CRM Manager",
        points: [
          "Lideré CRM móvil, monetización y crecimiento de una app gamificada de salud y fitness.",
          "Automaticé journeys de push, in-app y email que convirtieron el registro diario en hábito y subieron los DAU.",
          "Tests A/B y multivariantes para mejorar trial-to-paid y reducir churn.",
        ],
      },
    ],
    skillsTitle: "Paletero",
    skills: [
      { group: "Lifecycle", items: ["Arquitectura de journeys", "Onboarding y activación", "Retención y recuperación", "Prevención de churn", "Monetización"] },
      { group: "Testing y datos", items: ["A/B y multivariante", "Grupos de control", "Análisis de cohortes", "Segmentación RFM", "Reporting de LTV"] },
      { group: "Herramientas", items: ["Braze", "Customer.io", "Optimove", "RevenueCat", "HubSpot", "Herramientas BI"] },
    ],
    certsTitle: "Certificaciones",
    certs: en.history.certs,
  },
  contact: {
    tag: "Punto de partido",
    title: "¿Jugamos?",
    text:
      "Si se abre algo en CRM, Lifecycle o Growth, me encantaría hablar. Y si os falta uno para un partido, normalmente también estoy libre.",
    email: "Escríbeme",
    linkedin: "LinkedIn",
    cv: "Descargar CV",
  },
  footer: "Diseñada y creada por Haitam El Harchal. Sin afiliación con Playtomic.",
};

export const copy = { en, es };
