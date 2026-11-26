import type { Metadata } from "next";
import { SectionPage } from "../components/section-page";
import { ScutePreview } from "../components/scute-preview";

export const metadata: Metadata = {
  title: "Projects | Benjamin Nie",
  description: "Scute, a campus walking route planner built by Benjamin Nie.",
};

const projects = [
  {
    name: "Scute",
    preview: ScutePreview,
    description: "Built an interactive map for finding walking directions across the University of Maryland campus. Wrote a Python routing algorithm that calculated paths in a median of 14.4 milliseconds across 300 local test routes.",
    technologies: ["React", "Python", "Express", "Flask", "PostgreSQL", "Render"],
    accent: "bg-blue",
    repository: "https://github.com/benjamin-nie24/scute",
  },
];

export default function ProjectsPage() {
  return (
    <SectionPage page="projects">
      <ul className="mt-10 divide-y divide-black/10 border-y border-black/15 sm:mt-14">
        {projects.map(({ name, description, technologies, accent, repository, preview: Preview }) => (
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
                <Preview />
                <footer className="border-t border-black/10 pt-4">
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
