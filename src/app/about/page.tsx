import Link from "next/link";

export const metadata = { title: "About" };

export default function About() {
  return (
    <main id="main" className="portfolio-page about-page">
      <p className="eyebrow">01 / ABOUT</p>
      <h1>Benjamin <span>Nie.</span></h1>
      <p className="lead">
        Computer science student.<br />
        Software builder. Curious by default.
      </p>
      <div className="body-copy">
        <p>
          I’m studying computer science with a focus on machine learning at the
          University of Maryland, College Park. I like turning interesting
          problems into things that work.
        </p>
        <p>
          My projects span campus navigation and computational research. At
          Maryland, I’m also a software engineer with the App Dev Club.
        </p>
      </div>
      <div className="page-links">
        <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">Résumé ↗</a>
        <Link href="/projects">Explore my work →</Link>
      </div>
      <p className="footnote">UNIVERSITY OF MARYLAND / CLASS OF 2029</p>
    </main>
  );
}
