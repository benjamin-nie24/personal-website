import Wordmark from "@/components/Wordmark";
import About from "@/components/About";
import Work from "@/components/Work";
import Contact from "@/components/Contact";

export default function Home() {
  return <main id="main"><section id="home" className="home" aria-label="Introduction"><Wordmark /></section><About /><Work /><Contact /></main>;
}
