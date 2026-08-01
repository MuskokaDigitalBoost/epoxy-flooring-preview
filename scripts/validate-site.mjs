import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const allowPlaceholders = process.argv.includes("--allow-placeholders");
const excludedDirectories = new Set(["dist", "node_modules", "templates", ".git"]);
const failures = [];

function collectHtml(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectHtml(full));
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function count(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function resolveLocal(fromFile, target) {
  const clean = target.split("#")[0].split("?")[0];
  if (!clean) return fromFile;
  if (clean === "/") return path.join(root, "index.html");
  if (clean.startsWith("/")) {
    const projectPath = path.join(root, clean.slice(1));
    const publicPath = path.join(root, "public", clean.slice(1));
    return fs.existsSync(projectPath) ? projectPath : publicPath;
  }
  return path.resolve(path.dirname(fromFile), clean);
}

const pages = collectHtml(root);
const indexablePages = [];
const titles = new Map();
const descriptions = new Map();

for (const file of pages) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  const html = fs.readFileSync(file, "utf8");
  const noindex = /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  const titleMatches = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
  const descriptionMatches = [...html.matchAll(/<meta\s+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/gi)];

  if (titleMatches.length !== 1) failures.push(`${relative}: expected one title`);
  if (count(html, /<h1(?:\s[^>]*)?>/gi) !== 1) failures.push(`${relative}: expected one H1`);

  if (!noindex) {
    indexablePages.push(relative);
    if (descriptionMatches.length !== 1) failures.push(`${relative}: expected one meta description`);
    if (count(html, /<link\s+rel=["']canonical["']/gi) !== 1) failures.push(`${relative}: expected one canonical`);

    const title = titleMatches[0]?.[1]?.trim() || "";
    const description = descriptionMatches[0]?.[1]?.trim() || "";
    if (titles.has(title)) failures.push(`${relative}: duplicate title with ${titles.get(title)}`);
    if (descriptions.has(description)) failures.push(`${relative}: duplicate description with ${descriptions.get(description)}`);
    titles.set(title, relative);
    descriptions.set(description, relative);
  }

  if (!allowPlaceholders && /{{[A-Z0-9_]+}}/.test(html)) {
    failures.push(`${relative}: unresolved template token`);
  }

  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      failures.push(`${relative}: invalid JSON-LD (${error.message})`);
    }
  }

  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(target)) continue;
    const resolved = resolveLocal(file, target);
    if (!fs.existsSync(resolved)) failures.push(`${relative}: broken local reference ${target}`);
  }

  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(image[0])) failures.push(`${relative}: image missing alt`);
    if (!/\bwidth=["'][^"']+["']/i.test(image[0]) || !/\bheight=["'][^"']+["']/i.test(image[0])) {
      failures.push(`${relative}: image missing intrinsic dimensions`);
    }
  }
}

const sitemapPath = path.join(root, "public", "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  failures.push("missing public/sitemap.xml");
} else {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  if (!allowPlaceholders && /{{[A-Z0-9_]+}}/.test(sitemap)) failures.push("sitemap: unresolved template token");
}

const sourceText = pages.map((file) => fs.readFileSync(file, "utf8")).join("\n");
for (const leaked of [
  "MuskokaDigitalBoost",
  "Muskoka Digital Boost",
  "hello@muskokadigitalboost.com",
  "hero-background-higgsfield-60fps"
]) {
  if (sourceText.includes(leaked)) failures.push(`client isolation: found ${leaked}`);
}

console.log(JSON.stringify({
  htmlPages: pages.length,
  indexablePages: indexablePages.length,
  uniqueTitles: titles.size,
  uniqueDescriptions: descriptions.size,
  placeholdersAllowed: allowPlaceholders,
  failures
}, null, 2));

if (failures.length) process.exit(1);
