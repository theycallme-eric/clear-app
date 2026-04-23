/**
 * token-lint.ts — Scan component files for design system violations.
 *
 * Flags:
 * 1. Hex colors (#xxx, #xxxxxx, #xxxxxxxx) in style props or CSS
 * 2. Primitive token references (--color-orange-*, --color-blue-*, etc.) in component files
 * 3. border-radius usage (CLEAR uses chamfered corners, never rounded)
 * 4. lucide-react imports
 *
 * Usage: npx tsx scripts/token-lint.ts
 *
 * Not a blocker — a safety net. Exit code 0 always; prints violations.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const SRC_DIR = join(import.meta.dirname ?? __dirname, "..", "src");

// Files to skip (these legitimately use primitives or hex values)
const SKIP_FILES = new Set(["index.css", "utils.ts"]);
const SKIP_DIRS = new Set(["node_modules", ".git", "dist"]);

interface Violation {
  file: string;
  line: number;
  rule: string;
  match: string;
}

const violations: Violation[] = [];

// Patterns to check
const rules: { name: string; pattern: RegExp; fileFilter: (f: string) => boolean }[] = [
  {
    name: "hex-color",
    pattern: /(?:color|background|fill|stroke|border|shadow|outline)\s*[:=]\s*[^;]*?(#[0-9A-Fa-f]{3,8})\b/g,
    fileFilter: (f) => f.endsWith(".tsx") || f.endsWith(".ts") || f.endsWith(".css"),
  },
  {
    name: "primitive-token",
    pattern: /var\(--color-(?:orange|blue|green|red|purple|neutral)-(?:alpha-)?[0-9]+\)/g,
    fileFilter: (f) => f.endsWith(".tsx") || f.endsWith(".ts"),
  },
  {
    name: "border-radius",
    pattern: /border-?[Rr]adius\s*[:=]/g,
    fileFilter: (f) => f.endsWith(".tsx") || f.endsWith(".ts"),
  },
  {
    name: "lucide-import",
    pattern: /from\s+["']lucide-react["']/g,
    fileFilter: (f) => f.endsWith(".tsx") || f.endsWith(".ts"),
  },
];

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

const files = walk(SRC_DIR);

for (const filePath of files) {
  const fileName = filePath.split("/").pop() ?? "";
  if (SKIP_FILES.has(fileName)) continue;

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  for (const rule of rules) {
    if (!rule.fileFilter(filePath)) continue;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comments
      if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) continue;

      let match: RegExpExecArray | null;
      rule.pattern.lastIndex = 0;
      while ((match = rule.pattern.exec(line)) !== null) {
        violations.push({
          file: relative(join(SRC_DIR, ".."), filePath),
          line: i + 1,
          rule: rule.name,
          match: match[1] ?? match[0],
        });
      }
    }
  }
}

// Report
if (violations.length === 0) {
  console.log("No design system violations found.");
} else {
  console.log(`Found ${violations.length} potential violation(s):\n`);

  const grouped = new Map<string, Violation[]>();
  for (const v of violations) {
    const key = v.rule;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(v);
  }

  for (const [rule, items] of grouped) {
    console.log(`--- ${rule} (${items.length}) ---`);
    for (const v of items) {
      console.log(`  ${v.file}:${v.line}  ${v.match}`);
    }
    console.log();
  }
}
