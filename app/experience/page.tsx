import type { Metadata } from "next";
import { SectionPage } from "../components/section-page";

export const metadata: Metadata = {
  title: "Experience | Benjamin Nie",
  description: "Benjamin Nie’s experience in software engineering, computational research, and teaching.",
};

const experience = [
  {
    title: "Software Engineer",
    organization: "Ajamais AI",
    location: "College Park, MD",
    dates: "Sep 2026 – Present",
    color: "bg-blue",
    description: "Developing the Assessments dashboard for Structora through UMD’s App Dev Club. The dashboard gives building design teams one place to review decisions and track risks.",
  },
  {
    title: "Computational Software Research Intern",
    organization: "Mount Saint Mary’s University",
    location: "Frederick, MD",
    dates: "Aug 2025 – Present",
    color: "bg-lavender",
    description: "Built a Python workflow for BACE1 binding research. Screened 20,384 distances between atoms to identify 12 candidate pairings and used RDKit to explore changes at three positions.",
  },
  {
    title: "Programming Projects Lead",
    organization: "Future Business Leaders of America",
    location: "Ijamsville, MD",
    dates: "Sep 2023 – Jun 2026",
    color: "bg-brick",
    description: "Maintained and updated the chapter website for more than 200 members using HTML and CSS.",
  },
  {
    title: "S.E.E. Program Teaching Assistant",
    organization: "Johns Hopkins University",
    location: "Frederick, MD",
    dates: "Jun 2025 – Jul 2025",
    color: "bg-sage",
    description: "Supported more than 20 students per day with lab work and coursework. Helped run two to three lab sessions each week by preparing equipment, calibrating instruments, and enforcing safety procedures.",
  },
];

export default function ExperiencePage() {
  return (
    <SectionPage page="experience">
      <ol className="mt-10 divide-y divide-black/10 border-y border-black/15 sm:mt-14">
        {experience.map(({ title, organization, location, dates, color, description }) => (
          <li
            key={organization}
            className="grid grid-cols-[0.75rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-7 sm:grid-cols-[0.75rem_minmax(0,1fr)_10rem] sm:gap-x-6 sm:py-9"
          >
            <span aria-hidden="true" className={`mt-[0.65rem] size-3 rounded-full ${color}`} />
            <div>
              <p className="text-sm font-medium text-blue">{organization}</p>
              <h2 className="mt-1 text-xl leading-tight font-medium tracking-tight sm:text-[1.65rem]">
                {title}
              </h2>
            </div>
            <div className="col-start-2 text-sm leading-relaxed text-black/65 sm:col-start-3 sm:text-right">
              <p>{dates}</p>
              <p>{location}</p>
            </div>
            <p className="col-start-2 max-w-[62ch] text-[0.95rem] leading-relaxed text-black/75 sm:text-base">
              {description}
            </p>
          </li>
        ))}
      </ol>
    </SectionPage>
  );
}
