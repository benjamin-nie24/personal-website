/** Navigation and rendering share this list so page/planet assignments cannot drift. */
export const DESTINATIONS = [
  { path: "/", label: "Home", planet: "Earth", texture: "/planets/earth.png" },
  { path: "/about", label: "About", planet: "Mars", texture: "/planets/mars.png" },
  { path: "/projects", label: "Projects", planet: "Jupiter", texture: "/planets/jupiter.png" },
  { path: "/experience", label: "Experience", planet: "Saturn", texture: "/planets/saturn.png" },
  { path: "/contact", label: "Contact", planet: "Uranus", texture: "/planets/uranus.png" },
] as const;

export function getDestinationIndex(pathname: string): number {
  const index = DESTINATIONS.findIndex((destination) => destination.path === pathname);
  return Math.max(index, 0);
}
