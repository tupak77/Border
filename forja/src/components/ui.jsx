import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { ytEmbed, ytThumb, ytWatch } from '../data/exercises.js';

export function Sheet({ open, onClose, children, title, full = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    document.body.classList.add('lock');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('lock');
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className={`sheet ${full ? 'sheet-full' : ''}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sheet-grab" />
        <div className="sheet-head">
          {title && <h3 className="sheet-title">{title}</h3>}
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

export function Ring({ value, size = 120, stroke = 10, children, color = 'var(--accent)' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div className="ring-inner">{children}</div>
    </div>
  );
}

export function Video({ id, title }) {
  const [play, setPlay] = useState(false);
  useEffect(() => setPlay(false), [id]);
  return (
    <div className="video">
      {play ? (
        <iframe
          src={ytEmbed(id)}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button className="video-poster" onClick={() => setPlay(true)} aria-label={`Ver técnica: ${title}`}>
          <img src={ytThumb(id)} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
          <span className="video-play">
            <Icon name="play" size={26} />
          </span>
          <span className="video-label">Ver técnica</span>
        </button>
      )}
      <a className="video-ext" href={ytWatch(id)} target="_blank" rel="noreferrer">
        <Icon name="external" size={14} /> Abrir en YouTube
      </a>
    </div>
  );
}

export function Stat({ label, value, unit, sub }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">
        {value}
        {unit && <small>{unit}</small>}
      </span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

export function Empty({ icon = 'info', title, text, children }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={26} />
      </div>
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

export function Section({ title, action, children }) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export const fmtTime = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
};

export const fmtNum = (n, d = 0) =>
  Number(n).toLocaleString('es-ES', { maximumFractionDigits: d, minimumFractionDigits: 0 });

export const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const fmtDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
