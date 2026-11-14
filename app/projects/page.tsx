import type { Metadata } from "next";
import { SectionPage } from "../components/section-page";

export const metadata: Metadata = {
  title: "Projects | Benjamin Nie",
  description: "Selected software projects by Benjamin Nie, including Scute, CookingMania, and CodeVerse.",
};

const projects = [
  {
    name: "Scute",
    description: "A campus navigation platform that calculates walking routes with a custom Python A* algorithm and displays them on an interactive map.",
    detail: "The React, Express, and Flask services were deployed separately on Render and connected through REST APIs.",
    technologies: ["React", "Python", "Express", "Flask", "PostgreSQL"],
    accent: "bg-blue",
  },
  {
    name: "CookingMania",
    description: "A multiplayer cooking game developed in Unity for the Future Business Leaders of America competition.",
    detail: "Placed seventh nationally.",
    technologies: ["Unity", "Audacity", "GitHub"],
    accent: "bg-brick",
  },
  {
    name: "CodeVerse",
    description: "An Android app for learning programming, built with Flutter and Firebase for the Future Business Leaders of America competition.",
    detail: "Placed third statewide.",
    technologies: ["Flutter", "Firebase", "Android"],
    accent: "bg-lavender",
  },
];

export default function ProjectsPage() {
  return (
    <SectionPage page="projects">
      <ul className="mt-10 divide-y divide-black/10 border-y border-black/15 sm:mt-14">
        {projects.map(({ name, description, detail, technologies, accent }) => (
          <li key={name}>
            <article className="grid grid-cols-[0.75rem_minmax(0,1fr)] gap-x-4 py-7 sm:gap-x-6 sm:py-9">
              <span aria-hidden="true" className={`mt-[0.65rem] size-3 rounded-full ${accent}`} />
              <div>
                <h2 className="text-2xl leading-tight font-medium tracking-tight sm:text-3xl">{name}</h2>
                <p className="mt-3 max-w-[62ch] leading-relaxed text-black/75">{description}</p>
                <p className="mt-2 max-w-[62ch] leading-relaxed text-black/75">{detail}</p>
                <ul aria-label="Technologies" className="mt-4 flex flex-wrap gap-2">
                  {technologies.map((technology) => (
                    <li key={technology} className="rounded-full bg-paper px-3 py-1 text-sm text-black/75">
                      {technology}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </SectionPage>
  );
}
