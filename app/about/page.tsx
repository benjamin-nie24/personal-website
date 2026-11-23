import type { Metadata } from "next";
import { SectionPage } from "../components/section-page";

export const metadata: Metadata = {
  title: "About | Benjamin Nie",
  description: "About Benjamin Nie, a computer science student at the University of Maryland.",
};

export default function AboutPage() {
  return (
    <SectionPage page="about">
      <div className="mt-8 max-w-[46rem] sm:mt-10">
        <p className="text-xl leading-relaxed tracking-tight sm:text-3xl">
          I’m Benjamin Nie, a computer science student at the University of Maryland, College Park.
        </p>
        <p className="mt-4 max-w-[62ch] leading-relaxed text-black/75">
          My work spans full-stack development and computational research. Through UMD’s App Dev Club, I’m helping develop Structora’s Assessments dashboard, including shared state, data integrity, and AI-generated project briefs.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 font-medium text-blue underline-offset-4">
          <a href="/benjamin-nie-resume.pdf" className="underline decoration-blue/50 hover:decoration-blue">
            Résumé (PDF)
          </a>
          <a href="https://github.com/benjamin-nie24" className="underline decoration-blue/50 hover:decoration-blue">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className="mt-12 grid gap-8 border-t border-black/15 pt-8 sm:grid-cols-2 sm:gap-10">
        <section aria-labelledby="education">
          <h2 id="education" className="flex items-center gap-3 text-xl font-medium tracking-tight">
            <span aria-hidden="true" className="size-3 rounded-full bg-sage" />
            Education
          </h2>
          <p className="mt-3 font-medium">University of Maryland, College Park</p>
          <p className="mt-1 leading-relaxed text-black/75">
            B.S. in Computer Science · Expected May 2029
          </p>
          <p className="mt-3 leading-relaxed text-black/75">
            Coursework includes Data Structures, Object-Oriented Programming, and Discrete Structures.
          </p>
        </section>
        <section aria-labelledby="skills">
          <h2 id="skills" className="flex items-center gap-3 text-xl font-medium tracking-tight">
            <span aria-hidden="true" className="size-3 rounded-full bg-rose" />
            Technical skills
          </h2>
          <p className="mt-3 leading-relaxed text-black/75">
            Java, Python, JavaScript, TypeScript, SQL, HTML, and CSS.
          </p>
          <p className="mt-3 leading-relaxed text-black/75">
            React, Next.js, Flask, Express, Flutter, NumPy, Pandas, and Matplotlib.
          </p>
          <p className="mt-3 leading-relaxed text-black/75">
            PostgreSQL, MongoDB, Firebase, Supabase, Git, Postman, Node.js, Vite, Render, and Vercel.
          </p>
        </section>
      </div>
    </SectionPage>
  );
}
