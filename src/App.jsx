import React, { useEffect, useRef, useState } from "react";
import { copy, contact } from "./content.js";

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

function initialLang() {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "es") return saved;
  } catch (_) {}
  return (navigator.language || "en").toLowerCase().startsWith("es") ? "es" : "en";
}

function Court({ className = "" }) {
  // Top-down padel court, 20m x 10m. Net at 10m, service lines 6.95m from the net.
  return (
    <svg className={className} viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x="1" y="1" width="198" height="98" />
      <line x1="100" y1="-4" x2="100" y2="104" className="net" />
      <line x1="30.5" y1="1" x2="30.5" y2="99" />
      <line x1="169.5" y1="1" x2="169.5" y2="99" />
      <line x1="30.5" y1="50" x2="169.5" y2="50" />
    </svg>
  );
}

function Nav({ t, lang, setLang }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`nav ${scrolled ? "nav--solid" : ""}`}>
      <a href="#top" className="brand" aria-label="Haitam El Harchal">
        <span className="brand__ball" aria-hidden="true" />
        <span className="brand__name">HEH</span>
      </a>
      <nav className="nav__links">
        <a href="#story">{t.nav.story}</a>
        <a href="#playbook">{t.nav.playbook}</a>
        <a href="#projects">{t.nav.projects}</a>
        <a href="#history">{t.nav.history}</a>
      </nav>
      <div className="nav__right">
        <div className="lang" role="group" aria-label="Language">
          {["en", "es"].map((l) => (
            <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)} aria-pressed={lang === l}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <a href="#contact" className="btn btn--ball btn--sm">{t.nav.contact}</a>
      </div>
    </header>
  );
}

function Hero({ t }) {
  return (
    <section className="hero" id="top">
      <Court className="hero__court" />
      <div className="hero__ball" aria-hidden="true"><span /></div>
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="kicker"><span className="dot" />{t.hero.kicker}</p>
          <h1 className="display">
            <span className="display__line">{t.hero.first}</span>
            <span className="display__line display__line--outline">{t.hero.last}</span>
          </h1>
          <p className="hero__role">{t.hero.role}</p>
          <p className="hero__lead">{t.hero.lead}</p>
          <div className="hero__ctas">
            <a className="btn btn--ball" href="#contact">{t.hero.ctaPrimary} <Arrow /></a>
            <a className="btn btn--ghost" href={contact.cv} download>{t.hero.ctaSecondary}</a>
          </div>
        </div>
        <PlayerCard t={t} />
      </div>
    </section>
  );
}

function PlayerCard({ t }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
  };
  const reset = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };
  return (
    <div className="card-stage">
      <article className="pcard" ref={ref} onMouseMove={onMove} onMouseLeave={reset}>
        <div className="pcard__top">
          <span className="pcard__label">{t.card.label}</span>
          <span className="pcard__num">#07</span>
        </div>
        <div className="pcard__photo">
          <img src="./haitam.png" alt="Haitam El Harchal" width="240" height="240" />
          <Court className="pcard__court" />
        </div>
        <h2 className="pcard__name">Haitam<br />El Harchal</h2>
        <dl className="pcard__meta">
          <div><dt>{t.card.position}</dt><dd>{t.card.positionV}</dd></div>
          <div><dt>{t.card.plays}</dt><dd>{t.card.playsV}</dd></div>
          <div><dt>{t.card.base}</dt><dd>{t.card.baseV}</dd></div>
          <div><dt>{t.card.status}</dt><dd className="live"><span className="dot" />{t.card.statusV}</dd></div>
        </dl>
        <div className="pcard__stats">
          {t.card.stats.map((s) => (
            <div key={s.v}><strong>{s.k}</strong><span>{s.v}</span></div>
          ))}
        </div>
        <div className="score" aria-label="Haitam 6-2 6-3 Churn">
          <div className="score__row score__row--win"><span>HAITAM</span><b>6</b><b>6</b></div>
          <div className="score__row"><span>CHURN</span><b>2</b><b>3</b></div>
        </div>
      </article>
    </div>
  );
}

function Ticker({ items }) {
  const row = [...items, ...items];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {row.map((x, i) => (
          <span key={i}>{x}<i className="ticker__ball" /></span>
        ))}
      </div>
    </div>
  );
}

function SectionHead({ tag, title, intro, light }) {
  return (
    <div className={`shead ${light ? "shead--light" : ""}`} data-reveal>
      <p className="tag">{tag}</p>
      <h2 className="h2">{title}</h2>
      {intro && <p className="shead__intro">{intro}</p>}
    </div>
  );
}

function Story({ t }) {
  return (
    <section className="section section--light" id="story">
      <div className="wrap story">
        <SectionHead tag={t.story.tag} title={t.story.title} light />
        <div className="story__body">
          <div className="story__text">
            {t.story.paragraphs.map((p, i) => (
              <p key={i} data-reveal style={{ "--d": `${i * 80}ms` }}>{p}</p>
            ))}
          </div>
          <ul className="facts">
            {t.story.facts.map((f, i) => (
              <li key={f.k} data-reveal style={{ "--d": `${i * 90}ms` }}>
                <strong>{f.k}</strong><span>{f.v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Playbook({ t }) {
  return (
    <section className="section section--court" id="playbook">
      <Court className="section__court" />
      <div className="wrap">
        <SectionHead tag={t.playbook.tag} title={t.playbook.title} intro={t.playbook.intro} />
        <ol className="journey">
          {t.playbook.stages.map((s, i) => (
            <li className="stage" key={s.name} data-reveal style={{ "--d": `${(i % 3) * 90}ms` }}>
              <div className="stage__head">
                <span className="stage__n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.name}</h3>
              </div>
              <dl>
                <dt>{t.playbook.trigger}</dt><dd>{s.trigger}</dd>
                <dt>{t.playbook.message}</dt><dd>{s.message}</dd>
              </dl>
              <p className="stage__kpi"><span>{t.playbook.kpi}</span>{s.kpi}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Projects({ t }) {
  return (
    <section className="section section--light" id="projects">
      <div className="wrap">
        <SectionHead tag={t.projects.tag} title={t.projects.title} light />
        <div className="projects">
          {t.projects.items.map((p, i) => (
            <article key={p.name} className={`proj ${p.accent ? "proj--accent" : ""}`} data-reveal style={{ "--d": `${(i % 2) * 90}ms` }}>
              {p.accent && <Court className="proj__court" />}
              <p className="proj__badge">{p.badge}</p>
              <h3 className="proj__name">{p.name}</h3>
              <p className="proj__desc">{p.desc}</p>
              <ul className="proj__points">
                {p.points.map((x) => <li key={x}>{x}</li>)}
              </ul>
              {p.link && contact.padelmaniacos && (
                <a className="btn btn--dark btn--sm" href={contact.padelmaniacos} target="_blank" rel="noreferrer">{p.link} <Arrow /></a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function History({ t }) {
  return (
    <section className="section section--dark" id="history">
      <div className="wrap">
        <SectionHead tag={t.history.tag} title={t.history.title} />
        <ol className="timeline">
          {t.history.items.map((h, i) => (
            <li key={h.when} data-reveal style={{ "--d": `${i * 80}ms` }}>
              <div className="timeline__when">{h.when}</div>
              <div className="timeline__body">
                <h3>{h.role}</h3>
                <p className="timeline__org">{h.org}</p>
                <ul>{h.points.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
            </li>
          ))}
        </ol>
        <div className="kit">
          <div data-reveal>
            <h3 className="kit__title">{t.history.skillsTitle}</h3>
            <div className="kit__groups">
              {t.history.skills.map((g) => (
                <div key={g.group}>
                  <p className="kit__group">{g.group}</p>
                  <ul className="chips">{g.items.map((x) => <li key={x}>{x}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
          <div data-reveal style={{ "--d": "90ms" }}>
            <h3 className="kit__title">{t.history.certsTitle}</h3>
            <ul className="certs">{t.history.certs.map((c) => <li key={c}>{c}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact({ t }) {
  return (
    <section className="contact" id="contact">
      <Court className="contact__court" />
      <div className="wrap contact__inner" data-reveal>
        <p className="tag tag--dark">{t.contact.tag}</p>
        <h2 className="contact__title">{t.contact.title}</h2>
        <p className="contact__text">{t.contact.text}</p>
        <div className="contact__ctas">
          <a className="btn btn--dark" href={`mailto:${contact.email}?subject=Playtomic%20%C2%B7%20Haitam%20El%20Harchal`}>{t.contact.email} <Arrow /></a>
          <a className="btn btn--outline-dark" href={contact.linkedin} target="_blank" rel="noreferrer">{t.contact.linkedin}</a>
          <a className="btn btn--outline-dark" href={contact.cv} download>{t.contact.cv}</a>
        </div>
        <p className="contact__mail">{contact.email}</p>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function App() {
  const [lang, setLangState] = useState(initialLang);
  const t = copy[lang];
  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch (_) {}
  };
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useReveal();

  return (
    <>
      <Nav t={t} lang={lang} setLang={setLang} />
      <main>
        <Hero t={t} />
        <Ticker items={t.ticker} />
        <Story t={t} />
        <Playbook t={t} />
        <Projects t={t} />
        <History t={t} />
        <Contact t={t} />
      </main>
      <footer className="footer">
        <div className="wrap footer__inner">
          <span className="brand"><span className="brand__ball" aria-hidden="true" /><span className="brand__name">HEH</span></span>
          <span>{t.footer}</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </>
  );
}
