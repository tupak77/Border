// Genera los iconos PNG de la PWA a partir del logo SVG (usa Playwright/Chromium).
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(require('node:child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
import { writeFileSync } from 'node:fs';

const mark = (pad) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#FF5A1F"/>
  <g transform="translate(${32 - 32 * pad} ${32 - 32 * pad}) scale(${pad})">
    <path d="M18 14h30l-4 9H28v6h14l-4 9H28v12H18z" fill="#0B0B0C"/>
    <path d="M40 50 52 22" stroke="#0B0B0C" stroke-width="5" stroke-linecap="round"/>
  </g>
</svg>`;
const jobs = [
  ['public/icons/icon-192.png', 192, 1],
  ['public/icons/icon-512.png', 512, 1],
  ['public/icons/maskable-512.png', 512, 0.72],
  ['public/icons/apple-touch-icon.png', 180, 0.9],
];
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [file, size, pad] of jobs) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>*{margin:0}svg{width:${size}px;height:${size}px;display:block}</style>${mark(pad)}`);
  writeFileSync(file, await page.screenshot({ omitBackground: false }));
}
await browser.close();
console.log('iconos ok');
