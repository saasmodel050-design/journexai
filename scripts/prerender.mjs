/**
 * Post-build prerender of per-route <head> metadata.
 *
 * Vite emits a single dist/index.html whose head is identical for every route,
 * so crawlers that don't execute JS see the same title/description/OG tags on
 * every URL. This script clones that HTML once per public route and rewrites
 * the head tags (title, description, canonical, OG, Twitter) with route values.
 *
 * Vercel matches static files before `rewrites`, so dist/pricing/index.html is
 * served for /pricing while the SPA fallback still handles every other route.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { routes, SITE, OG_IMAGE } from "./routes-meta.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function buildHead(route) {
  const url = `${SITE}${route.path === "/" ? "/" : route.path}`;
  return [
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Journex Ai" />`,
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(OG_IMAGE)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(route.title)}" />`,
    `<meta name="twitter:description" content="${esc(route.description)}" />`,
    `<meta name="twitter:image" content="${esc(OG_IMAGE)}" />`,
  ].join("\n    ");
}

function applyMeta(html, route) {
  let out = html;
  // Strip the template's generic head tags so nothing duplicates.
  out = out
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta\s+name="description"[^>]*>\s*/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<meta\s+property="og:(?:type|title|description|url|image|site_name)"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="twitter:(?:card|title|description|image)"[^>]*>\s*/gi, "");
  return out.replace(/<\/head>/i, `  ${buildHead(route)}\n  </head>`);
}

const template = await readFile(path.join(dist, "index.html"), "utf8");

for (const route of routes) {
  const html = applyMeta(template, route);
  const outDir = route.path === "/" ? dist : path.join(dist, route.path.replace(/^\//, ""));
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "index.html"), html, "utf8");
  console.log(`prerendered ${route.path} -> ${path.relative(root, path.join(outDir, "index.html"))}`);
}

console.log(`prerender: ${routes.length} routes written`);
