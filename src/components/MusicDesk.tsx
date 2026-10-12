"use client";

import { useEffect, useState, useRef, type PointerEvent, type FormEvent, type CSSProperties } from "react";

const sections = ["About", "Experience", "Projects", "Toolkit", "Music", "Performances", "Contact"];
const hashes = ["about", "experience", "projects", "toolkit", "music", "performances", "contact"];

function Mute({ type }: { type: number }) {
  return <svg viewBox="0 0 60 65" aria-hidden="true">{type === 0 ? <><path d="M24 8h12l3 14 12 32H9l12-32Z"/><path d="M23 17h14M16 41h28"/></> : type === 1 ? <><path d="M21 20h18l9 10v25H12V30Z"/><path d="M27 7h6v13h-6zM22 40h16"/></> : <><path d="M27 7h6v27h-6z"/><path d="M7 53c0-28 46-28 46 0Z"/><path d="M7 53h46"/></>}</svg>;
}

export default function MusicDesk() {
  const [position, setPosition] = useState(1);
  const [theme, setTheme] = useState("straight");
  const [turn, setTurn] = useState(0);
  const [notice, setNotice] = useState("");
  const drag = useRef<{ x: number; position: number } | null>(null);
  function slideDrag(event: PointerEvent<SVGSVGElement>) {
    if (!drag.current) return;
    const scale = event.currentTarget.getBoundingClientRect().width / 780;
    navigate(Math.max(1, Math.min(7, drag.current.position + Math.round((event.clientX - drag.current.x) / (33 * scale)))));
  }
  useEffect(() => {
    const sync = () => {
      const hash = location.hash.slice(1);
      const index = hashes.indexOf(hash === "work" ? "projects" : hash);
      if (index >= 0) setPosition(index + 1);
    };
    sync(); window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  function navigate(value: number) {
    if (value === position) return;
    setPosition(value); setTurn(t => t + 1); setNotice("");
    window.history.replaceState(null, "", `#${hashes[value - 1]}`);
  }
  function contact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Portfolio hello from ${data.get("name")}`);
    const body = encodeURIComponent(`${data.get("message")}\n\n${data.get("name")}\n${data.get("email")}`);
    window.location.href = `mailto:benjamin.nie24@gmail.com?subject=${subject}&body=${body}`;
    setNotice("Your email app will open with this draft. Send it there when you’re ready.");
  }
  const content = [
    <div key="about"><p className="score-kicker">A short introduction</p><h2>Benjamin<br /><em>Nie.</em></h2><p>I’m a computer science student at the University of Maryland, College Park. I build software, explore computational research, and make room for music.</p><p className="paper-small">Computer Science · Machine Learning<br />Expected graduation, May 2029</p><a className="paper-link" href="/resume.pdf" target="_blank" rel="noopener noreferrer">Read my résumé ↗</a></div>,
    <div key="experience"><p className="score-kicker">The places along the way</p><h2>Experience.</h2><div className="score-entry"><small>Aug 2025 — present</small><h3>Mount Saint Mary’s University</h3><p>Computational Software Research Intern. Python pipelines for BACE1 ligand optimization, ranking molecular interactions by distance and partial charge.</p></div><div className="score-entry"><small>Jun — Jul 2025</small><h3>Johns Hopkins University</h3><p>S.E.E. teaching assistant. Guided 20+ students through labs, coursework, and hands-on projects.</p></div><div className="score-entry"><small>Sep 2023 — Jun 2026</small><h3>Urbana High School · FBLA</h3><p>Programming projects lead; maintained a website for 200+ chapter members.</p></div></div>,
    <div key="projects"><p className="score-kicker">Selected project / 01</p><h2>Scute<span className="title-dot">.</span></h2><p className="paper-subtitle">A better way across campus.</p><p>A full-stack campus navigation application, with a custom A* pathfinding engine, interactive walking routes, and secure user accounts.</p><div className="project-facts"><span>React / Node.js</span><span>Python / PostgreSQL</span><span>June — August 2026</span></div><a className="paper-link" href="https://scute.onrender.com/" target="_blank" rel="noopener noreferrer">Explore Scute ↗</a><a className="paper-link secondary-link" href="https://github.com/benjamin-nie24" target="_blank" rel="noopener noreferrer">More on GitHub ↗</a></div>,
    <div key="toolkit"><p className="score-kicker">In regular rotation</p><h2>The toolkit.</h2><p>Different instruments for different problems.</p><div className="tool-row"><small>Languages</small><p>Python, Java, JavaScript, SQL, HTML & CSS</p></div><div className="tool-row"><small>Frameworks</small><p>React, Node.js, Flask, Express</p></div><div className="tool-row"><small>Research & workflow</small><p>Pandas, SciPy, AutoDock Vina, Git</p></div><p className="paper-small">Also building with the UMD App Dev Club.</p></div>,
    <div key="music"><p className="score-kicker">Away from the keyboard</p><h2>A little<br /><em>brass.</em></h2><div className="large-note" aria-hidden="true">𝄢</div><p>This corner of the desk is for the trombone. Seven slide positions; a different place to explore at each one.</p><p className="paper-small">Try the mutes to change the atmosphere.<br />Everything here is intentionally silent.</p></div>,
    <div key="performances"><p className="score-kicker">The listening room</p><h2>Performances.</h2><div className="empty-score"><span aria-hidden="true">𝄻</span><h3>A rest, for now.</h3><p>Recordings will have a home here.<br />Check back for performances.</p></div><p className="paper-small">No recordings published yet.</p></div>,
    <div key="contact"><p className="score-kicker">Let’s start a conversation</p><h2>Leave a note.</h2><form onSubmit={contact}><label>Your name<input name="name" autoComplete="name" required maxLength={100}/></label><label>Email<input name="email" type="email" autoComplete="email" required maxLength={200}/></label><label>Your message<textarea name="message" required rows={3} maxLength={3000}/></label><button className="paper-link" type="submit">Compose email ↗</button><p className="form-note">Opens your email app with a draft.</p></form><p role="status" className="form-note">{notice}</p><a className="direct-email" href="mailto:benjamin.nie24@gmail.com">benjamin.nie24@gmail.com</a></div>
  ];
  return <main id="main" className={`music-desk theme-${theme}`}>
    <header className="desk-header"><a href="#about" onClick={() => navigate(1)} className="desk-brand">bn<span>♭</span></a><span>THE PERSONAL COLLECTION</span><a href="/resume.pdf" target="_blank" rel="noopener noreferrer">Résumé ↗</a></header>
    <div className="desk-intro"><p className="desk-eyebrow">Software. Research. A little brass.</p><h1>Benjamin<br /><span>Nie.</span></h1><p>A work in progress.<br />An open invitation to explore.</p><div className="intro-rule"/><p className="desk-instruction">Pull the slide. Turn a page.<br />Make yourself at home.</p></div>
    <section className="binder" aria-label="Portfolio sheet music binder">
      <div className="binder-tabs" aria-label="Quick navigation">{[1,3,6,7].map(n=><button key={n} onClick={()=>navigate(n)} aria-pressed={position===n}>{sections[n-1]}</button>)}</div>
      <div className="binder-cover"><div className="binder-rings" aria-hidden="true"><i/><i/><i/></div><article key={turn} className="score-page"><div className="page-top"><span>BENJAMIN NIE / COLLECTED WORKS</span><span>NO. 0{position}</span></div><div className="staff" aria-hidden="true"><span>𝄢</span><i>♪</i><i>♩</i><i>♫</i></div><div className="page-content">{content[position-1]}</div><footer className="page-footer"><span>{sections[position-1]} · {position} / 7</span><div><button onClick={()=>navigate(position-1)} disabled={position===1} aria-label="Previous page">←</button><button onClick={()=>navigate(position+1)} disabled={position===7} aria-label="Next page">→</button></div></footer></article></div>
    </section>
    <section className="trombone-area" aria-label="Trombone slide navigation">
      <div className="instrument-label"><span>01 — THE SLIDE</span><span>{String(position).padStart(2,"0")} / {sections[position-1]}</span></div>
      <svg className="trombone" onPointerDown={event => { drag.current = { x: event.clientX, position }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={slideDrag} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} viewBox="0 0 780 240" aria-hidden="true"><defs><linearGradient id="brass" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#eddb9d"/><stop offset=".3" stopColor="#b28b49"/><stop offset=".5" stopColor="#f3e2ae"/><stop offset=".75" stopColor="#a17a3f"/><stop offset="1" stopColor="#d6bc79"/></linearGradient></defs><g fill="none" stroke="url(#brass)" strokeWidth="10"><path d="M190 91H96a32 32 0 0 0 0 64h166"/><path d="M164 91V58H118"/><path d="M210 94v62M251 94v62"/></g><path d="M176 87C240 87 276 84 314 43L321 153C274 113 234 106 176 106Z" fill="url(#brass)" stroke="#876939" strokeWidth="2"/><ellipse cx="317" cy="98" rx="17" ry="57" fill="#715432" stroke="#dfc991" strokeWidth="4"/><ellipse cx="319" cy="98" rx="10" ry="47" fill="#302c22"/><path d="M257 153H480M258 183H480" stroke="#c5c8c0" strokeWidth="6"/><g style={{transform:`translateX(${(position-1)*33}px)`}} className="moving-slide" fill="none" stroke="url(#brass)" strokeWidth="10"><path d="M283 153H487a15 15 0 0 1 0 30H283"/><path d="M420 150v37" strokeWidth="8"/></g><path d="M260 154v29" stroke="url(#brass)" strokeWidth="9"/><path d="M118 50v16M112 50h12" stroke="#d5d8ce" strokeWidth="7"/></svg>
      <label className="slide-control"><span className="sr-only">Trombone slide position</span><input type="range" min="1" max="7" step="1" value={position} onChange={e=>navigate(Number(e.target.value))} aria-valuetext={`${position}: ${sections[position-1]}`} style={{"--slide":`${(position-1)/6*100}%`} as CSSProperties}/></label>
      <div className="position-stops">{sections.map((label,i)=><button key={label} onClick={()=>navigate(i+1)} aria-label={`Position ${i+1}: ${label}`} aria-pressed={position===i+1}><span>{i+1}</span><small>{label}</small></button>)}</div>
    </section>
    <section className="mute-rack" aria-label="Visual theme"><div><p className="desk-eyebrow">A CHANGE OF TONE</p><p>Same desk. Different mood.</p></div><div className="mute-options">{["Straight","Harmon","Plunger"].map((name,i)=><button key={name} aria-pressed={theme===name.toLowerCase()} onClick={()=>setTheme(name.toLowerCase())}><Mute type={i}/><span>{name}</span></button>)}</div></section>
    <footer className="desk-footer"><span>COLLEGE PARK, MD</span><span>DESIGNED TO BE EXPLORED · ALWAYS SILENT</span><a href="https://github.com/benjamin-nie24" target="_blank" rel="noopener noreferrer">GitHub ↗</a></footer>
  </main>;
}

