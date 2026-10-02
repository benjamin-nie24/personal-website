"use client";

import { useEffect, useRef, type PointerEvent, type CSSProperties } from "react";

export default function Wordmark() {
  const word = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const element = word.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    function update() {
      frame = 0;
      element?.style.setProperty("--scroll", motion.matches ? "0" : String(Math.min(window.scrollY / window.innerHeight, 1)));
    }
    function scroll() { if (!frame) frame = requestAnimationFrame(update); }
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    motion.addEventListener("change", update);
    return () => { window.removeEventListener("scroll", scroll); motion.removeEventListener("change", update); cancelAnimationFrame(frame); };
  }, []);

  function move(event: PointerEvent<HTMLHeadingElement>) {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.currentTarget.querySelectorAll<HTMLElement>(".letter").forEach(letter => {
      const rect = letter.getBoundingClientRect();
      const distance = Math.hypot(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2));
      letter.style.setProperty("--pull", String(Math.max(0, 1 - distance / 240)));
    });
  }
  function reset() { word.current?.querySelectorAll<HTMLElement>(".letter").forEach(letter => letter.style.setProperty("--pull", "0")); }
  function renderName(name: string) {
    return name.split("").map((letter, i) => <span className="letter" key={i} style={{ "--i": i } as CSSProperties}><span className="letter-base">{letter}</span><span className="letter-slice slice-top">{letter}</span><span className="letter-slice slice-middle">{letter}</span><span className="letter-slice slice-bottom">{letter}</span></span>);
  }
  return <div className="hero-composition">
    <div className="hero-kicker" aria-hidden="true"><span className="registration-mark">+</span><span>Software / research / curiosity</span><span>Portfolio — 01</span></div>
    <h1 ref={word} className="wordmark" onPointerMove={move} onPointerLeave={reset} aria-label="Benjamin Nie">
      <span className="name-row first-name" aria-hidden="true">{renderName("BENJAMIN")}</span>
      <span className="name-row last-name" aria-hidden="true">{renderName("NIE")}</span>
    </h1>
    <div className="hero-note" aria-hidden="true"><span className="orbit-mark"><i /><i /></span><span>Ideas in motion.<br />Built with intention.</span></div>
    <span className="hero-corner" aria-hidden="true">+</span>
  </div>;
}
