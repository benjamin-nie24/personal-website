"use client";

import { useEffect, useRef, useState } from "react";

// Recorded from Scute's A* search at 2493115, after obsolete heap entries are skipped.
import search from "./scute-search.json";

// Register the updated map screenshots to the campus vector map at the route pins.
const overviewBounds = { x: 106.6, y: 27.9, width: 1060.6, height: 546.4 };
const overviewViewBox = Object.values(overviewBounds).join(" ");
const distance = `${search.miles.toFixed(2)} miles`;
const walkingTime = `${search.minutes} min`;

const typingFields = [
  { value: "Brendan Iribe Center", start: 650, selected: 3950,
    address: "Brendan Iribe Center for Computer Science and Engineering, 8125, Paint Branch Drive, Lakeland, College Park, Prince George's County, Maryland, 20742, United States" },
  { value: "Chemistry Building", start: 4400, selected: 7750,
    address: "Chemistry Building, 8051, Regents Drive, Old Town, College Park, Prince George's County, Maryland, 20742, United States" },
];
const characterTime = 55;
const zoomStart = 8900;
// Times follow the interaction in Scute's SearchBox: submit, receive a match, select it.
const formSteps = [
  { time: 1850, x: 429, y: 78, pressed: true, loading: 0 },
  { time: 2130, x: 429, y: 78, result: 0 },
  { time: 3650, x: 283, y: 145, result: 0, pressed: true },
  { time: typingFields[0].selected },
  { time: 5550, x: 429, y: 161, pressed: true, loading: 1 },
  { time: 5880, x: 429, y: 161, result: 1 },
  { time: 7450, x: 283, y: 228, result: 1, pressed: true },
  { time: typingFields[1].selected },
  { time: 8100, x: 282, y: 271 },
  { time: 8500, x: 282, y: 271, pressed: true },
  { time: zoomStart },
];
const searchStart = zoomStart + 2700;
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
  "Entering the start and destination",
  "Starting at the Brendan Iribe Center",
  "A* is exploring campus paths",
  `Shortest route found · ${distance}`,
  "Following the shortest route to Chemistry",
  `Arriving at the Chemistry Building · ${walkingTime} estimated walk`,
  `Iribe Center to Chemistry Building · ${distance} · ${walkingTime} walk`,
];
const stageStarts = [0, zoomStart, searchStart, routeFound, walkStart, arrival, overviewStart];

// Index the recorded branches once so playback only reveals a prefix.
const branchPath = search.explored.join(" ");
let branchOffset = 0;
const branchEnds = [0, ...search.explored.map((branch) => {
  branchOffset += branch.length + 1;
  return branchOffset - 1;
})];

export function ScutePreview() {
  const frame = useRef<HTMLDivElement>(null);
  const map = useRef<SVGSVGElement>(null);
  const plane = useRef<SVGGElement>(null);
  const detail = useRef<SVGGElement>(null);
  const result = useRef<SVGImageElement>(null);
  const path = useRef<SVGPathElement>(null);
  const marker = useRef<SVGCircleElement>(null);
  const explored = useRef<SVGPathElement>(null);
  const form = useRef<SVGSVGElement>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const elapsed = useRef(0);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [formStep, setFormStep] = useState(-1);
  const action = formSteps[formStep];

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
    const typedCounts = [-1, -1];
    let lastHighlight = -1;
    let lastOverview = -1;
    let lastResult = -1;
    let lastFocus = -1;
    let lastFormStep = -2;

    function draw(time: number) {
      if (lastFormStep === -2 || time < (formSteps[lastFormStep]?.time ?? 0) ||
          time >= (formSteps[lastFormStep + 1]?.time ?? Infinity)) {
        lastFormStep = formSteps.filter((step) => step.time <= time).length - 1;
        setFormStep(lastFormStep);
      }
      typingFields.forEach(({ value, address, selected, start }, index) => {
        const count = time >= pullbackStart ? 0 : time >= selected ? address.length :
          Math.min(value.length, Math.max(0, Math.floor((time - start) / characterTime) + 1));
        const field = inputs.current[index];
        if (field && count !== typedCounts[index]) {
          field.value = count === address.length ? address : value.slice(0, count);
          if (index === 0) form.current?.setAttribute("visibility", count ? "visible" : "hidden");
          typedCounts[index] = count;
        }
      });
      const pullback = ease(clamp((time - pullbackStart) / pullbackDuration));
      const zoom = ease(clamp((time - zoomStart) / (searchStart - zoomStart))) * (1 - pullback);
      const focus = ease(clamp(time / 650)) * (1 - ease(clamp((time - zoomStart) / 1800)));
      const progress = clamp((time - searchStart) / (routeFound - searchStart));
      const edgeCount = Math.floor(search.explored.length * progress);
      if (edgeCount !== displayedEdges) {
        explored.current?.setAttribute("d", branchPath.slice(0, branchEnds[edgeCount]));
        displayedEdges = edgeCount;
      }
      const highlight = ease(clamp((time - routeFound) / (walkStart - routeFound)));
      if (highlight !== lastHighlight) {
        explored.current?.setAttribute("opacity", String(0.8 * (1 - highlight)));
        line!.style.strokeDashoffset = String(1 - highlight);
        lastHighlight = highlight;
      }
      const travel = ease(clamp((time - walkStart) / (arrival - walkStart)));
      const overview = ease(clamp((pullback - 0.7) / 0.3));
      const resultOpacity = overview * (1 - ease(clamp((time - resetStart) / 800)));
      if (resultOpacity !== lastResult) {
        result.current?.setAttribute("opacity", String(resultOpacity));
        lastResult = resultOpacity;
      }
      if (zoom !== lastZoom || travel !== lastTravel || focus !== lastFocus) {
        const point = line!.getPointAtLength(travel * length);
        const scale = 1 + 4.2 * zoom + 1.3 * focus;
        const centerX = overviewBounds.x + overviewBounds.width / 2;
        const centerY = overviewBounds.y + overviewBounds.height / 2;
        const width = overviewBounds.width / scale;
        const height = overviewBounds.height / scale;
        const x = centerX + (point.x - centerX) * zoom - (overviewBounds.width - width) * focus / 2;
        const y = centerY + (point.y - centerY) * zoom - (overviewBounds.height - height) * focus / 2;
        scene!.setAttribute("viewBox", `${x - width / 2} ${y - height / 2} ${width} ${height}`);
        plane.current?.setAttribute("transform",
          `translate(${x} ${y}) skewX(${-8 * zoom}) scale(1 ${1 - 0.12 * zoom}) translate(${-x} ${-y})`);
        detail.current?.setAttribute("opacity", String(ease(clamp((4.2 * zoom - 0.15) / 1.85))));
        dot!.setAttribute("cx", String(point.x));
        dot!.setAttribute("cy", String(point.y));
        dot!.style.opacity = String(zoom);
        lastZoom = zoom;
        lastTravel = travel;
        lastFocus = focus;
      }
      const routeOpacity = time >= routeFound ? 1 - overview : 0;
      if (routeOpacity !== lastOverview) {
        line!.style.opacity = String(routeOpacity);
        lastOverview = routeOpacity;
      }
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
      <div ref={frame} className="relative aspect-[1916/987] overflow-hidden rounded-md bg-paper">
        <svg ref={map} viewBox={overviewViewBox} className="block size-full motion-reduce:hidden"
          role="img" aria-label="Animated campus map following the walk from the Iribe Center to the Chemistry Building">
          <g ref={plane}>
            <image href="/ScuteMainPage.webp" {...overviewBounds} preserveAspectRatio="none" />
            <svg ref={form} {...overviewBounds} viewBox="0 0 1750 902" visibility="hidden" aria-hidden="true">
              <g transform="translate(38 26) scale(1.6)">
                <foreignObject width="300" height="280">
                  <div inert className="relative h-[200px] rounded-2xl bg-white text-[#202124] shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
                    style={{ fontFamily: "'Google Sans', Roboto, Arial, sans-serif" }}>
                    {typingFields.map(({ value, address }, index) => (
                      <div key={value}
                        style={{ top: index === 0 ? 12 : 64, zIndex: action?.result === index || action?.loading === index ? 2 : 1 }}
                        className="absolute left-[25px] h-10 w-[250px] rounded-xl bg-[#f1f3f4] px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <input readOnly tabIndex={-1} ref={(element) => { inputs.current[index] = element; }}
                            placeholder={index === 0 ? "Choose starting point" : "Choose ending point"}
                            className="peer min-w-0 flex-1 bg-transparent text-[14px] leading-5 placeholder:text-[#9aa0a6]" />
                          <span className={`text-[11px] text-blue-700 peer-placeholder-shown:opacity-50 ${action?.loading === index ? "opacity-50" : ""}`}>Search</span>
                        </div>
                        {action?.loading === index && (
                          <p className="rounded-lg bg-white px-2 py-2 text-[10px]">Searching...</p>
                        )}
                        {action?.result === index && (
                          <div className={`my-1 w-full rounded-lg px-2 py-2 text-center text-[12px] leading-normal ${action.pressed ? "bg-[#f7f7f7]" : "bg-white"}`}>
                            {address}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="absolute top-[132px] left-[25px] w-[250px] px-3">
                      <div className="rounded-xl bg-[#1a73e8] py-3 text-center text-[14px] font-medium text-white">
                        Calculate Route
                      </div>
                    </div>
                  </div>
                </foreignObject>
              </g>
              {action?.x !== undefined && (
                <g transform={`translate(${action.x} ${action.y})`} strokeLinejoin="round">
                  {action.pressed && <circle r="15" fill="#35627a" fillOpacity=".14" stroke="#35627a" strokeWidth="2" />}
                  <path d="M0 0 3 21 8 15 14 24 18 21 12 13 20 12Z" fill="#202124" stroke="white" strokeWidth="2" />
                </g>
              )}
            </svg>
            <image ref={result} href="/ScuteRouteGenerated.webp" {...overviewBounds}
              preserveAspectRatio="none" opacity="0" />
            <g ref={detail} opacity="0">
              <rect width="1280" height="606" fill="#e7ece5" />
              <image href="/scute-campus-detail.webp" x="470" y="165" width="500" height="270" />
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
        <img src="/ScuteRouteGenerated.webp" width="1916" height="987"
          className="hidden size-full motion-reduce:block" alt="Scute’s completed walking route from the Iribe Center to the Chemistry Building." />
        <a href="https://www.openstreetmap.org/copyright"
          className="absolute right-0 bottom-0 bg-white/95 px-1.5 text-[10px] text-black/75">
          © OpenStreetMap contributors
        </a>
      </div>
      <figcaption className="flex min-h-12 items-center justify-between gap-3 text-sm leading-snug text-black/65">
        <span className="motion-reduce:hidden">{captions[stage]}</span>
        <span className="hidden motion-reduce:inline">{captions[captions.length - 1]}</span>
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
