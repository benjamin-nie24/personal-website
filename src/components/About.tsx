
import Reveal from "@/components/Reveal";

export default function About() {
  return <section id="about" className="content-page page-section home-about" aria-labelledby="about-title">
    <Reveal><p className="eyebrow">A little context / 01</p><h2 id="about-title" className="section-title">Curiosity,<br /><span className="soft">put into practice.</span></h2></Reveal>
    <Reveal className="about-grid">
      <p className="intro">I’m Benjamin Nie, a computer science student at the University of Maryland, College Park. I build software and explore how computation can help solve problems in the real world.</p>
      <div><p className="body-copy">My work spans campus navigation, molecular optimization, educational apps, and multiplayer games. I’m studying computer science with a focus on machine learning, with an expected graduation in May 2029.</p><p className="body-copy">At Maryland, I’m also a software engineer in the App Dev Club.</p><div className="about-actions"><a className="text-link" href="#work">Explore my work ↗</a><a className="text-link" href="/resume.pdf" target="_blank" rel="noopener noreferrer">View résumé ↗</a></div></div>
    </Reveal>
    <Reveal className="skills"><h3>Tools I work with</h3><p>Python / Java / JavaScript / SQL / React / Node.js / Flask / Express / Git</p></Reveal>
  </section>;
}

