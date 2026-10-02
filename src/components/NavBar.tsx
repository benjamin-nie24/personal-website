"use client";

import { useEffect, useState } from "react";
const sections = [{ label: "Home", id: "home" }, { label: "About", id: "about" }, { label: "Work", id: "work" }, { label: "Contact", id: "contact" }];

export default function NavBar() {
  const [active, setActive] = useState("home");
  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      let current = "home";
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= window.innerHeight * .35) current = section.id;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = "contact";
      setActive(current);
    }
    function scroll() { if (!frame) frame = requestAnimationFrame(update); }
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    return () => { window.removeEventListener("scroll", scroll); window.removeEventListener("resize", scroll); cancelAnimationFrame(frame); };
  }, []);
  return <header className="site-header"><a className="monogram" href="#home" aria-label="Benjamin Nie home">bn<span>.</span></a><nav aria-label="Page sections">{sections.map(section => <a key={section.id} href={`#${section.id}`} aria-current={active === section.id ? "location" : undefined}>{section.label}</a>)}</nav></header>;
}
