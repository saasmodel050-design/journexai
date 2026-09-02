import { routes, SITE, OG_IMAGE } from "../../scripts/routes-meta.mjs";

export { SITE, OG_IMAGE, routes };

export interface RouteMeta {
  path: string;
  title: string;
  description: string;
}

/**
 * Metadata for a public route. Same values the build-time prerender writes
 * into the static HTML, so JS and non-JS crawlers always agree.
 */
export const routeMeta = (path: string): RouteMeta => {
  const normalized = path !== "/" ? path.replace(/\/$/, "") : path;
  return (
    routes.find((r) => r.path === normalized) ?? {
      path: normalized,
      title: "Journex Ai — AI Trading Journal & Coach",
      description:
        "Journex Ai is an AI trading journal and coach for crypto, forex, and futures traders.",
    }
  );
};
