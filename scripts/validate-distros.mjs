#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { distrosSchema } = await import("../src/schemas/distro.ts");

// Read and parse the JSON file
const jsonPath = resolve(__dirname, "../src/data/distros.json");
const raw = readFileSync(jsonPath, "utf-8");
let distros;
try {
  distros = JSON.parse(raw);
} catch (err) {
  console.error("❌ Failed to parse distros.json as JSON:");
  console.error(err.message);
  process.exit(1);
}

// Validate
const result = distrosSchema.safeParse(distros);

if (result.success) {
  console.log(`✅ Validation passed! ${result.data.length} distros validated successfully.`);
  process.exit(0);
} else {
  console.error(`❌ Validation failed with ${result.error.issues.length} error(s):\n`);
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    console.error(`  • [${path}] ${issue.message}`);
    if (issue.code === "invalid_union") {
      for (const unionErr of issue.unionErrors) {
        for (const inner of unionErr.issues) {
          const innerPath = inner.path.join(".");
          console.error(`      → [${innerPath}] ${inner.message}`);
        }
      }
    }
  }
  process.exit(1);
}