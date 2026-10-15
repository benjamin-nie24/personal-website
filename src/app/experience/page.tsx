export const metadata = { title: "Experience" };

const roles = [
 { place: "Mount Saint Mary’s University", role: "Computational Software Research Intern", date: "Aug 2025 — present", description: "Developing Python pipelines for BACE1 ligand optimization, bringing software tools to computational molecular research.", details: ["Built a greedy pairing algorithm to rank thousands of ligand–receptor interactions using spatial distance and partial charge.", "Narrowed the resulting interactions to target atoms for molecular optimization, using Pandas and SciPy to process and analyze the data."], tools: "Python · Pandas · SciPy · AutoDock Vina" },
 { place: "Johns Hopkins University", role: "Teaching Assistant · S.E.E. Program", date: "Jun — Jul 2025", description: "Supported 20+ students through daily labs, coursework, and hands-on projects in the S.E.E. program.", details: ["Prepared and maintained experiments and helped students work through practical lab activities and course material.", "Supported assessment and feedback, including grading 60 pages of final exams."], tools: "Lab instruction · Student mentorship · Assessment" },
 { place: "Urbana High School · FBLA", role: "Programming Projects Lead", date: "Sep 2023 — Jun 2026", description: "Led programming competition projects and maintained a website serving a chapter of 200+ members.", details: ["Collaborated on projects spanning software development, game design, and educational technology.", "Combined hands-on web development with project leadership and teamwork across the chapter."], tools: "HTML / CSS · Project leadership · Collaboration" },
];

export default function Experience() {
 return <main id="main" className="portfolio-page">
  <p className="eyebrow">03 / EXPERIENCE</p><h1>Along the <span>way.</span></h1>
  <p className="section-intro">Research, teaching, and building with others.</p>
  <div className="experience-list">{roles.map((role,i)=><article key={role.place}>
   <span className="timeline-node" aria-hidden="true"/>
   <p className="entry-number">0{i+1} / {role.date}</p>
   <h2>{role.place}</h2><p className="entry-role">{role.role}</p>
   <p className="role-description">{role.description}</p>
   <ul className="role-details">{role.details.map(detail=><li key={detail}>{detail}</li>)}</ul>
   <p className="entry-tools">{role.tools}</p>
  </article>)}</div>
  <div className="page-links"><a href="/resume.pdf" target="_blank" rel="noopener noreferrer">Read my résumé ↗</a></div>
 </main>;
}
