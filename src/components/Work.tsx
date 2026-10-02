import Reveal from "@/components/Reveal";

const entries = [
  { name: "Scute", role: "Campus navigation", type: "Independent project", date: "Jun — Aug 2026", description: "Finding a better way across campus. A full-stack navigation app with a custom A* pathfinding engine, interactive walking routes, and secure user accounts.", detail: "React · Python · PostgreSQL · Node.js", href: "https://scute.onrender.com/" },
  { name: "Mount Saint Mary’s University", role: "Computational Software Research Intern", type: "Research", date: "Aug 2025 — present", description: "Developing a Python pipeline for BACE1 ligand optimization. A greedy pairing algorithm ranks thousands of ligand–receptor interactions by distance and partial charge, narrowing them to target atoms for molecular optimization.", detail: "Python · Pandas · SciPy · AutoDock Vina" },
  { name: "Johns Hopkins University", role: "Teaching Assistant · S.E.E. Program", type: "Teaching", date: "Jun — Jul 2025", description: "Guided 20+ students through daily labs, coursework, and projects. Prepared and maintained hands-on experiments and supported assessment, including grading 60 pages of final exams.", detail: "Lab instruction · Student mentorship" },
  { name: "Urbana High School · FBLA", role: "Programming Projects Lead", type: "Leadership", date: "Sep 2023 — Jun 2026", description: "Led programming competition projects and maintained the website for a chapter of 200+ members. Collaborated across software development, game design, and educational technology.", detail: "HTML / CSS · Project leadership · Collaboration" },
];

export default function Work() {
  return <section id="work" className="content-page page-section" aria-labelledby="work-title">
    <p className="eyebrow">Projects & experience / 02</p><h2 id="work-title" className="section-title">Built, researched,<br /><span className="soft">and shared.</span></h2>
    <p className="page-description">Selected projects and the places I’ve put my skills to work.</p>
    {[{ title: "Projects", id: "projects", items: entries.slice(0, 1) }, { title: "Experience", id: "experience", items: entries.slice(1) }].map(group => <section key={group.id} className="work-group" aria-labelledby={`${group.id}-title`}>
    <Reveal><h3 id={`${group.id}-title`} className="work-group-title">{group.title}<span>{String(group.items.length).padStart(2, "0")}</span></h3></Reveal>
    <div className="work-list">{group.items.map((entry, i) => <Reveal key={entry.name}><article className="work-entry">
      <div className="entry-index" aria-hidden="true">0{i + 1}</div>
      <div className="entry-heading"><p className="eyebrow">{entry.type}</p><h4>{entry.name}</h4><p className="entry-role">{entry.role}</p><p className="entry-date">{entry.date}</p></div>
      <div className="entry-details"><p>{entry.description}</p><p className="entry-tools">{entry.detail}</p>{entry.href && <a className="text-link" href={entry.href} target="_blank" rel="noopener noreferrer">Visit project ↗</a>}</div>
    </article></Reveal>)}</div></section>)}
    <Reveal><p className="work-footer">More experiments live on <a href="https://github.com/benjamin-nie24" target="_blank" rel="noopener noreferrer">GitHub ↗</a></p></Reveal>
  </section>;
}

