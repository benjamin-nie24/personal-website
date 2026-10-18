export const metadata = { title: "Projects" };

const projectDetails = [
  {
    title: "Route intelligence",
    description: "A custom A* search engine works with a GraphML representation of the campus network to find walking routes. Python handles the routing logic, with Flask connecting that engine to the application.",
  },
  {
    title: "From route to interface",
    description: "The React interface presents interactive walking routes, while the Node.js layer connects the user experience to the app’s services and data.",
  },
  {
    title: "Accounts & persistence",
    description: "JWT authentication supports secure user sessions, with PostgreSQL providing persistent storage for the application.",
  },
];

export default function Projects() {
  return (
    <main id="main" className="portfolio-page projects-page">
      <p className="eyebrow">02 / SELECTED PROJECTS</p>
      <h1>Things I’ve <span>built.</span></h1>
      <article className="project">
        <div className="project-heading">
          <h2>Scute</h2>
          <span>JUN — AUG 2026</span>
        </div>
        <p className="lead project-lead">A better way across campus.</p>
        <p className="body-copy">
          A full-stack campus navigation app that brings route planning, interactive
          walking directions, and secure user accounts into one place. I built
          across the stack, from the pathfinding engine to the interface that
          makes its routes useful.
        </p>
        <div className="technology-list" aria-label="Technologies">
          {["React", "Node.js", "Python / Flask", "PostgreSQL"].map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
        <div className="project-details">
          {projectDetails.map(({ title, description }, index) => (
            <section key={title}>
              <h3><span>{String(index + 1).padStart(2, "0")}</span>{title}</h3>
              <p>{description}</p>
            </section>
          ))}
        </div>
        <div className="page-links">
          <a href="https://scute.onrender.com/" target="_blank" rel="noopener noreferrer">
            Visit Scute ↗
          </a>
          <a href="https://github.com/benjamin-nie24" target="_blank" rel="noopener noreferrer">
            Explore my GitHub ↗
          </a>
        </div>
      </article>
      <p className="footnote">SOFTWARE / PATHFINDING / FULL-STACK DEVELOPMENT</p>
    </main>
  );
}
