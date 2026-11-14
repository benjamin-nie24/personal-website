import Link from "next/link";

const navigation = [
  { label: "Experience", page: "experience", href: "/experience" },
  { label: "Projects", page: "projects", href: "/projects" },
  { label: "About", page: "about", href: "/about" },
] as const;

type Page = "home" | (typeof navigation)[number]["page"];

export function SiteHeader({ currentPage }: { currentPage: Page }) {
  const nameClass = "text-[clamp(1.25rem,3.8vw,2rem)] leading-tight font-normal tracking-[-0.04em]";

  return (
    <header className="flex min-h-[clamp(4.25rem,11svh,7.5rem)] flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-black/15 px-[clamp(1rem,3.6vw,2rem)] py-[17px]">
      {currentPage === "home" ? (
        <h1 className={nameClass}>Benjamin Nie</h1>
      ) : (
        <Link href="/" className={nameClass}>Benjamin Nie</Link>
      )}
      <nav
        aria-label="Portfolio"
        className="flex gap-[clamp(0.875rem,3.6vw,2rem)] text-[clamp(0.875rem,2.3vw,1.1875rem)] tracking-[-0.035em]"
      >
        {navigation.map(({ label, page, href }) => (
          <Link
            key={page}
            href={href}
            aria-current={currentPage === page ? "page" : undefined}
            className="decoration-blue decoration-2 underline-offset-[0.45em] hover:underline aria-[current=page]:underline"
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
