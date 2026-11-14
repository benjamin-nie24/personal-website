import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";

const titles = {
  experience: "Experience",
  projects: "Projects",
  about: "About",
} as const;

export function SectionPage({ page, children }: { page: keyof typeof titles; children: ReactNode }) {
  return (
    <div className="min-h-svh bg-white">
      <SiteHeader currentPage={page} />
      <main className="mx-auto max-w-5xl px-[clamp(1.25rem,5vw,4rem)] pt-[clamp(3rem,9vh,7rem)] pb-20">
        <h1 className="text-[clamp(3rem,9vw,7rem)] leading-[0.95] tracking-[-0.065em]">
          {titles[page]}
        </h1>
        {children}
      </main>
    </div>
  );
}
