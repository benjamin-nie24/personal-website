export const metadata = { title: "Projects" };

export default function Projects() {
 return <main id="main" className="portfolio-page">
  <p className="eyebrow">02 / SELECTED PROJECTS</p>
  <h1>Things I’ve <span>built.</span></h1>
  <article className="project">
   <div className="project-heading"><h2>Scute</h2><span>JUN — AUG 2026</span></div>
   <p className="lead project-lead">A better way across campus.</p>
   <p className="body-copy">A full-stack campus navigation app that brings route planning, interactive walking directions, and secure user accounts into one place. I built across the stack, from the pathfinding engine to the interface that makes its routes useful.</p>
   <div className="technology-list" aria-label="Technologies"><span>React</span><span>Node.js</span><span>Python / Flask</span><span>PostgreSQL</span></div>
   <div className="project-details">
    <section><h3><span>01</span> Route intelligence</h3><p>A custom A* search engine works with a GraphML representation of the campus network to find walking routes. Python handles the routing logic, with Flask connecting that engine to the application.</p></section>
    <section><h3><span>02</span> From route to interface</h3><p>The React interface presents interactive walking routes, while the Node.js layer connects the user experience to the app’s services and data.</p></section>
    <section><h3><span>03</span> Accounts & persistence</h3><p>JWT authentication supports secure user sessions, with PostgreSQL providing persistent storage for the application.</p></section>
   </div>
   <div className="page-links"><a href="https://scute.onrender.com/" target="_blank" rel="noopener noreferrer">Visit Scute ↗</a><a href="https://github.com/benjamin-nie24" target="_blank" rel="noopener noreferrer">Explore my GitHub ↗</a></div>
  </article>
  <p className="footnote">SOFTWARE / PATHFINDING / FULL-STACK DEVELOPMENT</p>
 </main>;
}
