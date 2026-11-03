import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * These checks guard two hosting guarantees:
 * 1. The Vercel SPA fallback rewrites every unmatched path to index.html so
 *    deep links (e.g. /reset-password, /terms) never 404 after a hard refresh.
 * 2. Every user-facing route the app advertises is actually registered in
 *    src/App.tsx — a route listed in a link/sitemap but missing from the
 *    router renders NotFound.
 */

const root = resolve(__dirname, "../..");

const REQUIRED_ROUTES = [
  // Public pages
  "/",
  "/about",
  "/blog",
  "/contact",
  "/privacy",
  "/terms",
  "/pricing",
  // Auth flows
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  // Checkout
  "/checkout/success",
  // Affiliate
  "/affiliate",
  "/affiliate/dashboard",
  // Dashboard
  "/dashboard",
  "/dashboard/trades",
  "/dashboard/add-trade",
  "/dashboard/analytics",
  "/dashboard/insights",
  "/dashboard/ai-trainer",
  "/dashboard/strategies",
  "/dashboard/reports",
  "/dashboard/settings",
  "/dashboard/upgrade",
];

function extractRoutePaths(appTsx: string): string[] {
  const paths = new Set<string>();
  const re = /path="([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(appTsx)) !== null) paths.add(match[1]);
  return [...paths];
}

describe("Vercel SPA fallback configuration", () => {
  const vercel = JSON.parse(readFileSync(resolve(root, "vercel.json"), "utf-8"));

  it("rewrites every unmatched path to index.html", () => {
    const rewrites: Array<{ source: string; destination: string }> = vercel.rewrites ?? [];
    const catchAll = rewrites.find((r) => r.source === "/(.*)");
    expect(catchAll).toBeDefined();
    expect(catchAll!.destination).toBe("/index.html");
  });

  it("keeps cleanUrls enabled and trailingSlash disabled", () => {
    expect(vercel.cleanUrls).toBe(true);
    expect(vercel.trailingSlash).toBe(false);
  });

  it("ships the fallback config inside dist on every production build", () => {
    // Vercel deployments built from the dist folder only honor a vercel.json
    // that sits inside that folder, so the build script must copy it in.
    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf-8"));
    expect(pkg.scripts.build).toContain("cp vercel.json dist/vercel.json");
  });
});

describe("Required routes stay registered in App.tsx", () => {
  const appTsx = readFileSync(resolve(root, "src/App.tsx"), "utf-8");
  const registered = extractRoutePaths(appTsx);

  it.each(REQUIRED_ROUTES)("registers %s", (route) => {
    expect(registered).toContain(route);
  });

  it("registers a catch-all NotFound route", () => {
    expect(registered).toContain("*");
  });

  it("has no stale redirect target /admin/trials removed from the UI flow", () => {
    // /admin/trials was removed with trials; it must redirect, not render AdminTrials.
    const line = appTsx.split("\n").find((l) => l.includes('"/admin/trials"'));
    expect(line).toMatch(/Navigate to="\/admin\/users"/);
  });
});
