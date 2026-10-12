"use client";

import { useEffect, useRef, useState } from "react";
const tabs = ["About", "Projects", "Experience", "Contact"] as const;
type Tab = typeof tabs[number];
const roles = [
  { place: "Mount Saint Mary’s University", role: "Computational Software Research Intern", date: "Aug 2025 — present", description: "Building Python pipelines for BACE1 ligand optimization. Ranking molecular interactions by spatial distance and partial charge using Pandas and SciPy." },
  { place: "Johns Hopkins University", role: "Teaching Assistant · S.E.E. Program", date: "Jun — Jul 2025", description: "Guided 20+ students through labs, coursework, and hands-on projects. Prepared experiments and supported assessment." },
  { place: "Urbana High School · FBLA", role: "Programming Projects Lead", date: "Sep 2023 — Jun 2026", description: "Led programming projects and maintained the website for a chapter of 200+ members." },
];

export default function LaptopDesk() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("About");
  const opener = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sync = () => {
      const destination = location.hash.slice(1).toLowerCase();
      const found = tabs.find(t => t.toLowerCase() === (destination === "work" ? "projects" : destination));
      if (found) { setTab(found); setOpen(true); }
      else if (destination === "desk") setOpen(false);
    };
    sync(); window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    if (!open) return;
    const handle = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open]);
  function show(next: Tab) {
    setTab(next); setOpen(true);
    history.replaceState(null, "", `#${next.toLowerCase()}`);
    if (panel.current) panel.current.scrollTop = 0;
    requestAnimationFrame(() => closeButton.current?.focus({ preventScroll: true }));
  }
  function close() {
    setOpen(false); history.replaceState(null, "", "#desk");
    requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }));
  }
  return <main id="main" className={`laptop-desk ${open ? "is-open" : "is-closed"}`}>
    <header className="desk-navigation" aria-hidden={open} inert={open}>
      <h1>Benjamin Nie</h1><nav aria-label="Portfolio sections">{tabs.map(t => <button key={t} onClick={() => show(t)}>{t}</button>)}</nav>
    </header>
    <div className="desk-light" aria-hidden="true" />
    <div className="laptop-camera">
      <div className="laptop-object">
        <div className="laptop-lid">
          <div className="lid-back" aria-hidden="true"><span className="lid-signature">bn.</span></div>
          <div className="lid-front">
            <span className="webcam" aria-hidden="true" />
            <div className="laptop-display" aria-hidden={!open} inert={!open}>
              <div className="screen-wallpaper" aria-hidden="true"><i/><i/><i/></div>
              <header className="screen-navigation"><button ref={closeButton} className="back-to-desk" onClick={close}>← <span>Back to desk</span></button><nav aria-label="Screen sections">{tabs.map(t => <button key={t} aria-current={tab === t ? "page" : undefined} onClick={() => show(t)}>{t}</button>)}</nav><span className="screen-monogram" aria-hidden="true">bn.</span></header>
              <div ref={panel} className="screen-scroll" tabIndex={0} aria-label={`${tab} content`}>
                <section key={tab} className={`screen-content content-${tab.toLowerCase()}`} aria-labelledby="section-heading">
                  {tab === "About" && <><p className="section-index">01 / ABOUT</p><h2 id="section-heading">Benjamin <span>Nie.</span></h2><p className="screen-lead">Computer science student.<br />Software builder. Curious by default.</p><div className="about-body"><p>I’m studying computer science with a focus on machine learning at the University of Maryland, College Park. I like turning interesting problems into things that work.</p><p>My projects span campus navigation and computational research. At Maryland, I’m also a software engineer with the App Dev Club.</p></div><div className="screen-links"><a href="/resume.pdf" target="_blank" rel="noopener noreferrer">Résumé ↗</a><button onClick={() => show("Projects")}>Explore my work →</button></div><p className="quiet-detail">UNIVERSITY OF MARYLAND / CLASS OF 2029</p></>}
                  {tab === "Projects" && <><p className="section-index">02 / SELECTED PROJECTS</p><h2 id="section-heading">Things I’ve <span>built.</span></h2><article className="project-feature"><div className="project-heading"><h3>Scute</h3><span>2026</span></div><p className="screen-lead small-lead">A better way across campus.</p><p>A full-stack navigation app with a custom A* pathfinding engine, interactive walking routes, and secure user accounts. Built with React, Python, Node.js, and PostgreSQL.</p><div className="screen-links"><a href="https://scute.onrender.com/" target="_blank" rel="noopener noreferrer">Visit Scute ↗</a><a href="https://github.com/benjamin-nie24" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></article></>}
                  {tab === "Experience" && <><p className="section-index">03 / EXPERIENCE</p><h2 id="section-heading">Along the <span>way.</span></h2><div className="experience-list">{roles.map(role => <article key={role.place}><div><h3>{role.place}</h3><p>{role.role}</p></div><span className="role-date">{role.date}</span><p className="role-description">{role.description}</p></article>)}</div></>}
                  {tab === "Contact" && <><p className="section-index">04 / CONTACT</p><h2 id="section-heading">Let’s <span>talk.</span></h2><p className="screen-lead">An idea, a question, or a simple hello.</p><a className="email-link" href="mailto:benjamin.nie24@gmail.com">benjamin.nie24@gmail.com <span>↗</span></a><div className="contact-options"><a href="https://github.com/benjamin-nie24" target="_blank" rel="noopener noreferrer"><span>GitHub</span><span>benjamin-nie24 ↗</span></a><a href="tel:+12403907827"><span>Phone</span><span>240-390-7827 ↗</span></a><a href="/resume.pdf" target="_blank" rel="noopener noreferrer"><span>Résumé</span><span>Read PDF ↗</span></a></div></>}
                </section>
              </div>
              <footer className="screen-footer"><span>BENJAMIN NIE / PERSONAL PORTFOLIO</span><span>{tab} <i/></span></footer>
            </div>
          </div>
        </div>
        <div className="laptop-base" aria-hidden="true"><div className="keyboard"><div className="keyboard-keys">{Array.from({length:65},(_,i)=><i key={i}/>)}</div><div className="spacebar"/></div><div className="trackpad"/><div className="base-notch"/></div>
        <button ref={opener} className="open-laptop" onClick={() => show(tab)} tabIndex={open ? -1 : 0} aria-hidden={open} aria-label="Open laptop and explore portfolio" />
      </div>
    </div>
  </main>;
}
