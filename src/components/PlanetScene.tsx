"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createPlanetScene, type PlanetSceneController } from "@/lib/space/createPlanetScene";
import { DESTINATIONS, getDestinationIndex } from "@/lib/space/destinations";

function JourneyShip() {
  return (
    <svg className="journey-ship" viewBox="0 0 80 160" fill="none" aria-hidden="true">
      <path className="ship-exhaust" d="M34 108L40 154L46 108" />
      <path
        d="M40 12C28 31 28 57 29 90L20 108L31 104L35 111H45L49 104L60 108L51 90C52 57 52 31 40 12Z"
        fill="#141e1a" stroke="#c0cfb9" strokeWidth="1.1"
      />
      <path d="M40 27V97M30 83H50M34 106H46" stroke="#748e7d" strokeWidth=".7" />
      <ellipse cx="40" cy="55" rx="4" ry="7" fill="#b5c6a4" opacity=".6" />
    </svg>
  );
}

export default function PlanetScene() {
  const index = getDestinationIndex(usePathname());
  const destination = DESTINATIONS[index];
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const flightStatus = useRef<HTMLSpanElement>(null);
  const controller = useRef<PlanetSceneController | null>(null);
  const latestDestination = useRef(index);

  useEffect(() => {
    latestDestination.current = index;
    controller.current?.navigate(index);
  }, [index]);

  useEffect(() => {
    if (!canvas.current) return;

    // Update animation frames outside React. Keep the arriving page out of the
    // keyboard focus order until the camera reaches its destination.
    controller.current = createPlanetScene(canvas.current, latestDestination.current, {
      onPhaseChange({ phase, from, to }) {
        if (root.current) root.current.dataset.journey = phase;
        document.documentElement.dataset.voyage = phase;
        document.getElementById("main")?.toggleAttribute("inert", phase === "flight");
        if (flightStatus.current) {
          flightStatus.current.textContent = phase === "flight"
            ? `${DESTINATIONS[from].planet} → ${DESTINATIONS[to].planet}`
            : `In orbit / ${DESTINATIONS[to].planet}`;
        }
      },
      onFlightProgress(progress) {
        root.current?.style.setProperty("--flight-progress", String(progress));
        // Navigation may mount a new main element during an existing flight.
        const main = document.getElementById("main");
        if (main && !main.hasAttribute("inert")) main.setAttribute("inert", "");
      },
    });

    return () => {
      controller.current?.dispose();
      controller.current = null;
      delete document.documentElement.dataset.voyage;
      document.getElementById("main")?.removeAttribute("inert");
    };
  }, []);

  return (
    <div ref={root} className="planet-scene" data-planet={destination.planet.toLowerCase()} data-journey="orbit">
      <div className="planet-fallback" aria-hidden="true" />
      <canvas ref={canvas} role="img" aria-label={`${destination.planet} slowly rotating in space.`} />
      <div className="flight-status" role="status" aria-live="polite">
        <small aria-hidden="true">FLIGHT IN PROGRESS</small>
        <span ref={flightStatus}>In orbit / {destination.planet}</span>
        <span className="flight-track" aria-hidden="true" />
      </div>
      <JourneyShip />
      <span className="planet-caption" aria-hidden="true">
        <span className="orbit-dot" />
        {String(index + 1).padStart(2, "0")} / {destination.planet}
      </span>
    </div>
  );
}
