import Reveal from "@/components/Reveal";

export default function Contact() {
  return <section id="contact" className="content-page page-section contact-section" aria-labelledby="contact-title">
    <Reveal><p className="eyebrow">Say hello / 03</p><h2 id="contact-title" className="section-title">Good things start<br /><span className="soft">with a conversation.</span></h2><p className="page-description">Have an idea, a question, or something interesting to share?</p></Reveal>
    <Reveal><a className="contact-email" href="mailto:benjamin.nie24@gmail.com">benjamin.nie24@gmail.com <span>↗</span></a><div className="contact-links"><a href="https://github.com/benjamin-nie24" target="_blank" rel="noopener noreferrer"><span>GitHub</span><span>benjamin-nie24 ↗</span></a><a href="tel:+12403907827"><span>Phone</span><span>240-390-7827 ↗</span></a><a href="/resume.pdf" target="_blank" rel="noopener noreferrer"><span>Résumé</span><span>View PDF ↗</span></a></div><p className="contact-signoff">Thanks for stopping by.<br /><span>— Benjamin</span></p></Reveal>
  </section>;
}
