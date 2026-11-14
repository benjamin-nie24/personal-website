import type { Metadata } from "next";
import { SectionPage } from "../components/section-page";

export const metadata: Metadata = {
  title: "Projects | Benjamin Nie",
  description: "Scute, a campus walking route planner built by Benjamin Nie.",
};

const projects = [
  {
    name: "Scute",
    description: "A walking route planner for the University of Maryland campus. A custom A* algorithm in Python calculates routes, and an interactive React map displays directions. The React frontend, Express API, and Flask routing service run separately on Render.",
    technologies: ["React", "Python", "Express", "Flask", "PostgreSQL"],
    accent: "bg-blue",
    repository: "https://github.com/benjamin-nie24/scute",
  },
];

export default function ProjectsPage() {
  return (
    <SectionPage page="projects">
      <ul className="mt-10 divide-y divide-black/10 border-y border-black/15 sm:mt-14">
        {projects.map(({ name, description, technologies, accent, repository }) => (
          <li key={name}>
            <article className="grid grid-cols-[0.75rem_minmax(0,1fr)] gap-x-4 py-7 sm:gap-x-6 sm:py-9">
              <span aria-hidden="true" className={`mt-[0.65rem] size-3 rounded-full ${accent}`} />
              <div>
                <h2 className="text-2xl leading-tight font-medium tracking-tight sm:text-3xl">{name}</h2>
                <p className="mt-3 max-w-[62ch] leading-relaxed text-black/75">{description}</p>
                <ul aria-label="Technologies" className="mt-4 flex flex-wrap gap-2">
                  {technologies.map((technology) => (
                    <li key={technology} className="rounded-full bg-paper px-3 py-1 text-sm text-black/75">
                      {technology}
                    </li>
                  ))}
                </ul>
                <footer className="mt-5 border-t border-black/10 pt-4">
                  <a
                    href={repository}
                    className="font-medium text-blue underline decoration-blue/50 underline-offset-4 hover:decoration-blue"
                  >
                    View {name} on GitHub <span aria-hidden="true">↗</span>
                  </a>
                </footer>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </SectionPage>
  );
}
