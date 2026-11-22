import { useRef, useState } from 'react';
import { fmtNum } from './ui.jsx';

// Gráficas en SVG: marcas finas, rejilla discreta, tooltip al tocar/pasar.

function useHover(n, padL, innerW) {
  const ref = useRef(null);
  const [i, setI] = useState(null);
  const onMove = (e) => {
    const svg = ref.current;
    if (!svg || n === 0) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * svg.viewBox.baseVal.width - padL;
    const idx = n === 1 ? 0 : Math.round((x / innerW) * (n - 1));
    setI(Math.max(0, Math.min(n - 1, idx)));
  };
  return { ref, i, onMove, onLeave: () => setI(null) };
}

function niceRange(min, max, pad = 0.15) {
  if (min === max) return [min - 1, max + 1];
  const span = max - min;
  return [min - span * pad, max + span * pad];
}

/** points: [{label, value, avg?}] */
export function LineChart({ points, unit = 'kg', height = 180, goal }) {
  const W = 340;
  const padL = 8;
  const padR = 40;
  const padT = 14;
  const padB = 24;
  const innerW = W - padL - padR;
  const innerH = height - padT - padB;
  const vals = points.flatMap((p) => [p.value, p.avg].filter((v) => v != null));
  if (goal) vals.push(goal);
  const [lo, hi] = niceRange(Math.min(...vals), Math.max(...vals));
  const x = (k) => padL + (points.length === 1 ? innerW / 2 : (k / (points.length - 1)) * innerW);
  const y = (v) => padT + (1 - (v - lo) / (hi - lo)) * innerH;
  const { ref, i, onMove, onLeave } = useHover(points.length, padL, innerW);

  const path = points.map((p, k) => `${k ? 'L' : 'M'}${x(k)},${y(p.value)}`).join(' ');
  const avgPts = points.map((p, k) => (p.avg != null ? [x(k), y(p.avg)] : null)).filter(Boolean);
  const avgPath = avgPts.map((p, k) => `${k ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  const area = `${path} L${x(points.length - 1)},${padT + innerH} L${x(0)},${padT + innerH} Z`;
  const ticks = [lo + (hi - lo) * 0.2, (lo + hi) / 2, lo + (hi - lo) * 0.8];
  const hp = i != null ? points[i] : null;

  return (
    <div className="chart">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${height}`}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={onLeave}
        role="img"
        aria-label="Evolución del peso"
      >
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity=".28" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} className="grid" />
            <text x={W - padR + 6} y={y(t) + 4} className="axis">
              {fmtNum(t, 1)}
            </text>
          </g>
        ))}
        {goal && (
          <g>
            <line x1={padL} x2={W - padR} y1={y(goal)} y2={y(goal)} className="goal" />
            <text x={padL + 4} y={y(goal) - 5} className="axis goal-label">
              Objetivo {fmtNum(goal, 1)}
            </text>
          </g>
        )}
        <path d={area} fill="url(#lg)" />
        <path d={path} className="line-raw" />
        {avgPts.length > 1 && <path d={avgPath} className="line-avg" />}
        {points.map((p, k) => (
          <circle key={k} cx={x(k)} cy={y(p.value)} r={points.length > 20 ? 2.5 : 4} className="dot" />
        ))}
        {points.length > 0 && (
          <>
            <text x={padL} y={height - 6} className="axis">
              {points[0].label}
            </text>
            <text x={W - padR} y={height - 6} className="axis" textAnchor="end">
              {points[points.length - 1].label}
            </text>
          </>
        )}
        {hp && (
          <g>
            <line x1={x(i)} x2={x(i)} y1={padT} y2={padT + innerH} className="cross" />
            <circle cx={x(i)} cy={y(hp.value)} r={6} className="dot-hover" />
          </g>
        )}
      </svg>
      {hp && (
        <div className="tip" style={{ left: `${(x(i) / W) * 100}%` }}>
          <span>{hp.label}</span>
          <strong>
            {fmtNum(hp.value, 1)} {unit}
          </strong>
          {hp.avg != null && <em>Media 7 d: {fmtNum(hp.avg, 1)}</em>}
        </div>
      )}
    </div>
  );
}

/** bars: [{label, value, sub}] */
export function BarChart({ bars, unit = 'kg', height = 160 }) {
  const W = 340;
  const padL = 4;
  const padR = 4;
  const padT = 12;
  const padB = 22;
  const innerW = W - padL - padR;
  const innerH = height - padT - padB;
  const max = Math.max(1, ...bars.map((b) => b.value));
  const gap = 4;
  const bw = Math.min(28, (innerW - gap * (bars.length - 1)) / Math.max(1, bars.length));
  const total = bw * bars.length + gap * (bars.length - 1);
  const x0 = padL + (innerW - total) / 2;
  const [i, setI] = useState(null);
  const hb = i != null ? bars[i] : null;

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${height}`} onPointerLeave={() => setI(null)} role="img" aria-label="Volumen por sesión">
        <line x1={padL} x2={W - padR} y1={padT + innerH} y2={padT + innerH} className="grid" />
        {bars.map((b, k) => {
          const h = Math.max(2, (b.value / max) * innerH);
          const bx = x0 + k * (bw + gap);
          const by = padT + innerH - h;
          return (
            <g key={k} onPointerEnter={() => setI(k)} onPointerDown={() => setI(k)}>
              <rect x={bx - gap / 2} y={padT} width={bw + gap} height={innerH} fill="transparent" />
              <path
                d={`M${bx},${padT + innerH} V${by + 4} a4,4 0 0 1 4,-4 H${bx + bw - 4} a4,4 0 0 1 4,4 V${padT + innerH} Z`}
                className={`bar ${i === k ? 'bar-on' : ''}`}
                style={b.color ? { fill: b.color } : undefined}
              />
              {bars.length <= 12 && (
                <text x={bx + bw / 2} y={height - 6} className="axis" textAnchor="middle">
                  {b.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hb && (
        <div className="tip" style={{ left: `${((x0 + i * (bw + gap) + bw / 2) / W) * 100}%` }}>
          <span>{hb.sub || hb.label}</span>
          <strong>
            {fmtNum(hb.value)} {unit}
          </strong>
        </div>
      )}
    </div>
  );
}
