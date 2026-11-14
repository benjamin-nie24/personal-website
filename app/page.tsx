import { CircleCluster } from "./components/circle-cluster";
import { SiteHeader } from "./components/site-header";

export default function HomePage() {
  return (
    <div className="grid h-svh grid-rows-[auto_minmax(0,1fr)] bg-white">
      <SiteHeader currentPage="home" />
      <main className="relative min-w-0">
        <CircleCluster />
      </main>
    </div>
  );
}
