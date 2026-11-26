"use client";

import { useEffect, useRef, useState } from "react";

// Precomputed on Scute's directed campus graph, using edge lengths in meters.
import search from "./scute-search.json";

const searchStart = 4200;
const routeFound = searchStart + 4800;
const walkStart = routeFound + 1200;
const arrival = walkStart + 6400;
const pullbackStart = arrival + 2000;
const pullbackDuration = 3000;
const overviewStart = pullbackStart + pullbackDuration;
const resetStart = overviewStart + 3000;
const duration = resetStart + 800;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => value * value * (3 - 2 * value);

const captions = [
  "University of Maryland · Campus map",
  "Starting at the Brendan Iribe Center",
  "A* is exploring campus paths",
  "Shortest route found · 0.30 miles",
  "Following the shortest route to Chemistry",
  "Arriving at the Chemistry Building · 6 min estimated walk",
  "Iribe Center to Chemistry Building · 0.30 miles · 6 min walk",
];
const stageStarts = [0, 1500, searchStart, routeFound, walkStart, arrival, overviewStart];

export function ScutePreview() {
  const frame = useRef<HTMLDivElement>(null);
  const map = useRef<SVGSVGElement>(null);
  const plane = useRef<SVGGElement>(null);
  const detail = useRef<SVGGElement>(null);
  const result = useRef<SVGImageElement>(null);
  const path = useRef<SVGPathElement>(null);
  const marker = useRef<SVGCircleElement>(null);
  const explored = useRef<SVGPathElement>(null);
  const elapsed = useRef(0);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const viewport = frame.current;
    const scene = map.current;
    const line = path.current;
    const dot = marker.current;
    if (!viewport || !scene || !line || !dot) return;

    const length = line.getTotalLength();
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let request = 0;
    let previous = 0;
    let displayedEdges = -1;
    let displayedStage = -1;
    let lastZoom = -1;
    let lastTravel = -1;

    function draw(time: number) {
      const pullback = ease(clamp((time - pullbackStart) / pullbackDuration));
      const zoom = ease(clamp((time - 1500) / 2700)) * (1 - pullback);
      const progress = clamp((time - searchStart) / (routeFound - searchStart));
      const edgeCount = Math.floor(search.explored.length * progress);
      if (edgeCount !== displayedEdges) {
        explored.current?.setAttribute("d", search.explored.slice(0, edgeCount).join(" "));
        displayedEdges = edgeCount;
      }
      const highlight = ease(clamp((time - routeFound) / (walkStart - routeFound)));
      explored.current?.setAttribute("opacity", String(0.8 * (1 - highlight)));
      const travel = ease(clamp((time - walkStart) / (arrival - walkStart)));
      const overview = ease(clamp((pullback - 0.7) / 0.3));
      result.current?.setAttribute("opacity", String(overview * (1 - ease(clamp((time - resetStart) / 800)))));
      if (zoom !== lastZoom || travel !== lastTravel) {
        const point = line!.getPointAtLength(travel * length);
        const scale = 1 + 4.2 * zoom;
        const x = 640 + (point.x - 640) * zoom;
        const y = 303 + (point.y - 303) * zoom;
        const width = 1280 / scale;
        const height = 606 / scale;
        scene!.setAttribute("viewBox", `${x - width / 2} ${y - height / 2} ${width} ${height}`);
        plane.current?.setAttribute("transform",
          `translate(${x} ${y}) skewX(${-8 * zoom}) scale(1 ${1 - 0.12 * zoom}) translate(${-x} ${-y})`);
        detail.current?.setAttribute("opacity", String(ease(clamp((scale - 1.15) / 1.85))));
        dot!.setAttribute("cx", String(point.x));
        dot!.setAttribute("cy", String(point.y));
        dot!.style.opacity = String(zoom);
        lastZoom = zoom;
        lastTravel = travel;
      }
      line!.style.strokeDashoffset = String(1 - highlight);
      line!.style.opacity = String(time >= routeFound ? 1 - overview : 0);
      if (displayedStage < 0 || time < stageStarts[displayedStage] || time >= stageStarts[displayedStage + 1]) {
        displayedStage = stageStarts.filter((start) => start <= time).length - 1;
        setStage(displayedStage);
      }
    }

    function tick(now: number) {
      if (previous) elapsed.current = (elapsed.current + now - previous) % duration;
      previous = now;
      draw(elapsed.current);
      request = requestAnimationFrame(tick);
    }

    function sync() {
      cancelAnimationFrame(request);
      previous = 0;
      if (preference.matches) return;
      draw(elapsed.current);
      if (playing && visible && !document.hidden) {
        request = requestAnimationFrame(tick);
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(viewport);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(request);
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [playing]);

  return (
    <figure className="mt-6">
      <div ref={frame} className="relative aspect-[1280/606] overflow-hidden rounded-md bg-paper">
        <svg ref={map} viewBox="0 0 1280 606" className="block size-full motion-reduce:hidden"
          role="img" aria-label="Animated campus map following the walk from the Iribe Center to the Chemistry Building">
          <g ref={plane}>
            <image href="/ScuteMainPage.webp" width="1280" height="606" preserveAspectRatio="none" />
            <image ref={result} href="/ScuteRouteGenerated.webp" width="1280" height="606"
              preserveAspectRatio="none" opacity="0" />
            <g ref={detail} opacity="0">
              <rect width="1280" height="606" fill="#e7ece5" />
              <use href="/scute-campus.svg#campus" />
              <g fontSize="3.5" fontWeight="600" fill="#364b44" stroke="#e7ece5"
                strokeWidth="1.1" paintOrder="stroke" textAnchor="middle">
                <text x="772" y="315">Iribe Center</text>
                <text x="682" y="305">Chemistry Building</text>
              </g>
            </g>
            <path ref={explored} fill="none" stroke="#B46258" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            <path d={search.route} fill="none" stroke="#35627a" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset="1" ref={path} />
            <circle ref={marker} r="2.1" fill="#35627a" stroke="white" strokeWidth="0.8" opacity="0" />
          </g>
        </svg>
        <img src="/ScuteRouteGenerated.webp" width="1280" height="606"
          className="hidden size-full motion-reduce:block" alt="Scute’s completed walking route from the Iribe Center to the Chemistry Building." />
        <a href="https://www.openstreetmap.org/copyright"
          className="absolute right-0 bottom-0 bg-white/95 px-1.5 text-[10px] text-black/75">
          © OpenStreetMap contributors
        </a>
      </div>
      <figcaption className="flex min-h-12 items-center justify-between gap-3 text-sm leading-snug text-black/65">
        <span className="motion-reduce:hidden">{captions[stage]}</span>
        <span className="hidden motion-reduce:inline">Iribe Center to the Chemistry Building · 0.30 miles · 6 min walk</span>
        <button type="button" onClick={() => setPlaying((active) => !active)}
          aria-label={playing ? "Pause route tour" : "Resume route tour"}
          className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-sm font-medium text-blue hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:hidden">
          <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3 fill-current">
            <path d={playing ? "M2 1h3v10H2z M7 1h3v10H7z" : "M2 1l9 5-9 5z"} />
          </svg>
          {playing ? "Pause" : "Resume"}
        </button>
      </figcaption>
    </figure>
  );
}
