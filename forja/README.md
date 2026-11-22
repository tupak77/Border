# FORJA · Aggressive Cut 30

PWA para seguir el programa **The Aggressive Cut Blueprint: 30 Days**: split de 4 días, abdomen + LISS después de cada sesión, y días de descanso activo/total.

## Qué incluye

- **Hoy**: día X/30, sesión del día, racha, peso rápido, semana y checklist (entreno, LISS, proteína, sueño, agua).
- **Plan**: calendario de 30 días (semana tipo L D1 · M D2 · X LISS · J D3 · V D4 · S LISS · D OFF) y el split completo.
- **Modo entreno**: registro de kg × reps por serie, lo que hiciste la última vez, temporizador de descanso con vibración y sonido, superserie de abdomen, LISS en minutos, récords (e1RM) y resumen al terminar.
- **Ejercicios**: 25 ejercicios con vídeo de técnica de YouTube, pasos en español, tu historial y tu mejor marca.
- **Progreso**: peso con media móvil de 7 días y línea de objetivo, volumen por sesión, récords e historial.
- **Nutrición**: plan de comidas semanal (1800 kcal / 190 g), 16 recetas con ingredientes y pasos (las 4 del PDF marcadas), cambio de comidas, agua, lista de la compra automática y calculadora de TDEE/objetivo.
- **PWA**: instalable, funciona offline (los vídeos necesitan conexión). Datos en el dispositivo, con exportar/importar en Ajustes.

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # genera dist/ con service worker y manifest
npm run preview
npm run icons     # regenera los iconos PNG desde el logo (necesita Playwright)
```

## Instalar en el móvil

Despliega `dist/` en cualquier hosting estático con HTTPS (Vercel, Netlify, GitHub Pages…). Abre la URL en el móvil:
- **iPhone (Safari)**: Compartir → Añadir a pantalla de inicio.
- **Android (Chrome)**: menú ⋮ → Instalar app.

## Estructura

- `src/data/program.js` — rutinas y calendario sacados del PDF
- `src/data/exercises.js` — biblioteca de ejercicios + ID de vídeo de YouTube
- `src/data/recipes.js` — recetas, plan semanal de comidas y lista de la compra
- `src/data/nutrition.js` — objetivos, suplementos y consejos
- `src/store.js` — estado y persistencia (localStorage)
- `src/screens/*` — pantallas
