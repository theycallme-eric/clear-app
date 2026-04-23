/**
 * registry-check.ts — Verify component.md registry matches actual src/components/.
 *
 * Compares primary component exports from src/components/ against
 * the registry table in .claude/skills/component.md.
 *
 * Only checks "primary" exports — where the export name matches the filename
 * (e.g., Card.tsx → Card, CTAButton.tsx → CTAButton). This filters out icons,
 * internal sub-components, and helper exports.
 *
 * Usage: npx tsx scripts/registry-check.ts
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";

const COMPONENTS_DIR = join(
  import.meta.dirname ?? __dirname,
  "..",
  "src",
  "components"
);
const REGISTRY_FILE = join(
  import.meta.dirname ?? __dirname,
  "..",
  ".claude",
  "skills",
  "component.md"
);

// Files to skip entirely — these are utilities, not components
const SKIP_FILES = new Set(["icons.tsx", "utils.ts", "index.ts", "index.tsx"]);

// Get primary component exports (where export name matches filename)
function getPrimaryComponents(dir: string): string[] {
  const components: string[] = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      components.push(...getPrimaryComponents(fullPath));
      continue;
    }

    if (!entry.endsWith(".tsx") || SKIP_FILES.has(entry)) continue;

    const fileBaseName = basename(entry, ".tsx");
    const content = readFileSync(fullPath, "utf-8");

    // Look for an export whose name matches the filename
    const exportPattern =
      /export\s+(?:function|const)\s+([A-Z][a-zA-Z0-9]+)/g;
    let match: RegExpExecArray | null;
    while ((match = exportPattern.exec(content)) !== null) {
      const name = match[1];
      if (name.endsWith("Props") || name.endsWith("Type") || name.endsWith("Context")) continue;

      // Primary export: name matches filename (e.g., Card from Card.tsx)
      if (name === fileBaseName) {
        components.push(name);
      }
    }
  }

  return components;
}

// Extract component names from the registry table in component.md
function getRegistryComponents(): string[] {
  const content = readFileSync(REGISTRY_FILE, "utf-8");
  const components: string[] = [];

  // Match table rows like: | `ComponentName` | description | props |
  const tablePattern = /\|\s*`([A-Z][a-zA-Z0-9.]+)`\s*\|/g;
  let match: RegExpExecArray | null;
  while ((match = tablePattern.exec(content)) !== null) {
    const name = match[1];
    if (name === "icons.tsx") continue;
    components.push(name);
  }

  return components;
}

const actual = new Set(getPrimaryComponents(COMPONENTS_DIR));
const registered = new Set(getRegistryComponents());

const missing = [...actual].filter((c) => !registered.has(c)).sort();
const stale = [...registered].filter((c) => !actual.has(c)).sort();

if (missing.length === 0 && stale.length === 0) {
  console.log("Component registry is in sync with src/components/.");
} else {
  if (missing.length > 0) {
    console.log(`\n--- Missing from registry (${missing.length}) ---`);
    console.log(
      "Components in src/components/ not listed in component.md:"
    );
    for (const c of missing) {
      console.log(`  + ${c}`);
    }
  }

  if (stale.length > 0) {
    console.log(`\n--- Stale registry entries (${stale.length}) ---`);
    console.log(
      "Listed in component.md but not found in src/components/:"
    );
    for (const c of stale) {
      console.log(`  - ${c}`);
    }
  }

  console.log("\nUpdate .claude/skills/component.md to match.");
}
