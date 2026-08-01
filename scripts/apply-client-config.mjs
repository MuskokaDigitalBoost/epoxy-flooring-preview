import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.resolve(root, process.argv[2] || "client.config.json");

if (!fs.existsSync(configPath)) {
  console.error(`Missing client configuration: ${configPath}`);
  console.error("Copy client.config.example.json to client.config.json, verify every value, then run this command again.");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const fields = {
  projectSlug: "PROJECT_SLUG",
  brandName: "BRAND_NAME",
  brandShort: "BRAND_SHORT",
  domain: "DOMAIN",
  email: "EMAIL",
  baseLocation: "BASE_LOCATION",
  serviceArea: "SERVICE_AREA",
  industry: "INDUSTRY",
  heroKicker: "HERO_KICKER",
  heroHeadline: "HERO_HEADLINE",
  heroSupport: "HERO_SUPPORT",
  primaryCta: "PRIMARY_CTA",
  service1Name: "SERVICE_1_NAME",
  service1Description: "SERVICE_1_DESCRIPTION",
  service2Name: "SERVICE_2_NAME",
  service2Description: "SERVICE_2_DESCRIPTION",
  service3Name: "SERVICE_3_NAME",
  service3Description: "SERVICE_3_DESCRIPTION",
  service4Name: "SERVICE_4_NAME",
  service4Description: "SERVICE_4_DESCRIPTION"
};

const missing = Object.keys(fields).filter((key) => {
  const value = config[key];
  return typeof value !== "string" || !value.trim() || value.includes("{{");
});

if (missing.length) {
  console.error(`Missing or invalid verified fields: ${missing.join(", ")}`);
  process.exit(1);
}

const replacements = new Map(
  Object.entries(fields).map(([key, token]) => [`{{${token}}}`, config[key].trim()])
);

const textExtensions = new Set([".html", ".xml", ".txt", ".webmanifest"]);
const excludedDirectories = new Set(["dist", "node_modules", ".git"]);

function collectFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(full));
    else if (textExtensions.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

let changedFiles = 0;
for (const file of collectFiles(root)) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;
  for (const [token, value] of replacements) content = content.replaceAll(token, value);
  if (content !== original) {
    fs.writeFileSync(file, content);
    changedFiles += 1;
  }
}

const packagePath = path.join(root, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
packageJson.name = config.projectSlug.trim().toLowerCase();
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

console.log(JSON.stringify({
  project: config.projectSlug,
  brand: config.brandName,
  domain: config.domain,
  changedFiles
}, null, 2));
