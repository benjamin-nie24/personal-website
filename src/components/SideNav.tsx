"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DESTINATIONS } from "@/lib/space/destinations";

export default function SideNav() {
  const pathname = usePathname();

  return (
    <header className="side-nav">
      <Link href="/" className="identity" aria-current={pathname === "/" ? "page" : undefined}>
        Benjamin Nie
        <small>EARTH / HOME</small>
      </Link>
      <nav aria-label="Portfolio pages">
        {DESTINATIONS.slice(1).map(({ path, label, planet }) => (
          <Link key={path} href={path} aria-label={label} aria-current={pathname === path ? "page" : undefined}>
            <span>{label}</span>
            <small>{planet}</small>
          </Link>
        ))}
        <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" aria-label="Résumé (opens PDF in a new tab)">
          <span>Résumé ↗</span>
          <small>PDF / NEW TAB</small>
        </a>
      </nav>
    </header>
  );
}
