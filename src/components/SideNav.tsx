"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [{ label: "About", href: "/about" }, { label: "Projects", href: "/projects" }, { label: "Experience", href: "/experience" }, { label: "Contact", href: "/contact" }];
export default function SideNav() {
  const path = usePathname();
  return <header className="side-nav"><Link href="/" className="identity">Benjamin Nie</Link><nav aria-label="Portfolio pages">{links.map(link => <Link key={link.href} href={link.href} aria-current={path === link.href ? "page" : undefined}>{link.label}</Link>)}</nav></header>;
}
