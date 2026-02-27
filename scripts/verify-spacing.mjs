#!/usr/bin/env node

/**
 * Verifies that the Tailwind spacing config maps to the same pixel values
 * as Tailwind's defaults. Parses CSS vars from src/index.css and compares.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// 1. Parse CSS vars from src/index.css
const css = readFileSync(resolve(ROOT, 'src/index.css'), 'utf-8');
const cssVars = {};
for (const match of css.matchAll(/--spacing-(\d+):\s*(\d+)px/g)) {
  cssVars[`--spacing-${match[1]}`] = parseInt(match[2], 10);
}

console.log('CSS spacing vars found:', cssVars);

// 2. Tailwind default spacing scale (rem * 16 = px)
const tailwindDefaults = {
  'px': 1,
  '0': 0,
  '0.5': 2,    // 0.125rem
  '1': 4,      // 0.25rem
  '2': 8,      // 0.5rem
  '3': 12,     // 0.75rem
  '4': 16,     // 1rem
  '5': 20,     // 1.25rem
  '6': 24,     // 1.5rem
  '8': 32,     // 2rem
  '10': 40,    // 2.5rem
  '12': 48,    // 3rem
  '14': 56,    // 3.5rem
  '16': 64,    // 4rem
  '24': 96,    // 6rem
  '32': 128,   // 8rem
};

// 3. Our mapping from tailwind.config.ts
const ourMapping = {
  'px': { type: 'literal', value: 1 },
  '0': { type: 'literal', value: 0 },
  '0.5': { type: 'var', var: '--spacing-50' },
  '1': { type: 'var', var: '--spacing-100' },
  '2': { type: 'var', var: '--spacing-200' },
  '3': { type: 'var', var: '--spacing-300' },
  '4': { type: 'var', var: '--spacing-400' },
  '5': { type: 'var', var: '--spacing-500' },
  '6': { type: 'var', var: '--spacing-600' },
  '8': { type: 'var', var: '--spacing-700' },
  '10': { type: 'var', var: '--spacing-800' },
  '12': { type: 'var', var: '--spacing-1000' },
  '14': { type: 'var', var: '--spacing-1100' },
  '16': { type: 'var', var: '--spacing-1200' },
  '24': { type: 'var', var: '--spacing-1300' },
  '32': { type: 'var', var: '--spacing-1400' },
};

// 4. Compare
let allMatch = true;
let count = 0;

for (const [key, mapping] of Object.entries(ourMapping)) {
  const expected = tailwindDefaults[key];
  let actual;

  if (mapping.type === 'literal') {
    actual = mapping.value;
  } else {
    actual = cssVars[mapping.var];
    if (actual === undefined) {
      console.error(`❌ CSS var ${mapping.var} not found in src/index.css`);
      allMatch = false;
      continue;
    }
  }

  count++;
  if (actual !== expected) {
    console.error(`❌ Mismatch: spacing '${key}' — Tailwind default: ${expected}px, CSS var (${mapping.var || 'literal'}): ${actual}px`);
    allMatch = false;
  } else {
    console.log(`  ✓ spacing '${key}' = ${actual}px (matches Tailwind default)`);
  }
}

console.log('');
if (allMatch) {
  console.log(`✅ All ${count} spacing mappings match Tailwind defaults exactly.`);
  process.exit(0);
} else {
  console.log(`❌ Some mappings do not match. See errors above.`);
  process.exit(1);
}
