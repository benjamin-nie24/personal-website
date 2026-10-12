import type { Metadata } from "next";
import SideNav from "@/components/SideNav";
import "./globals.css";
export const metadata: Metadata = { title: {default:"Benjamin Nie",template:"%s — Benjamin Nie"}, description: "Benjamin Nie — computer science student, software builder, and computational researcher." };
export default function RootLayout({children}: {children: React.ReactNode}) { return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><SideNav />{children}</body></html>; }
