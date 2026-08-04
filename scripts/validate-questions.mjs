#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { questionsSchema } = await import("../src/schemas/question.ts");

// ── Load distros.json to get valid distro IDs ──────────────────────────────

const distrosPath = resolve(__dirname, "../src/data/distros.json");
const validTags = new Set(
  JSON.parse(readFileSync(distrosPath, "utf-8")).map((d) => d.id)
);

// ── Load questions.json ────────────────────────────────────────────────────

const questionsPath = resolve(__dirname, "../src/data/questions.json");
let questions;
try {
  questions = JSON.parse(readFileSync(questionsPath, "utf-8"));
} catch (err) {
  console.error("❌ Failed to parse questions.json as JSON:");
  console.error(err.message);
  process.exit(1);
}

// ── Validate schema ────────────────────────────────────────────────────────

const schemaResult = questionsSchema.safeParse(questions);

if (!schemaResult.success) {
  console.error(`❌ Schema validation failed with ${schemaResult.error.issues.length} error(s):\n`);
  for (const issue of schemaResult.error.issues) {
    const path = issue.path.join(".");
    console.error(`  • [${path}] ${issue.message}`);
  }
  process.exit(1);
}

console.log(`✅ Schema validation passed — ${schemaResult.data.length} questions.`);

// ── Cross-check distroTags against valid distro IDs ────────────────────────

const unknownTags = new Map(); // tag -> locations (question.option)
let totalEffects = 0;

for (const question of questions) {
  for (const option of question.options) {
    for (const effect of option.scoreEffects) {
      totalEffects++;
      if (!validTags.has(effect.distroTag)) {
        const location = `"${question.id}" → "${option.id}" → "${effect.distroTag}"`;
        if (!unknownTags.has(effect.distroTag)) {
          unknownTags.set(effect.distroTag, []);
        }
        unknownTags.get(effect.distroTag).push(location);
      }
    }
  }
}

if (unknownTags.size > 0) {
  console.error(`\n❌ Cross-check failed — found ${unknownTags.size} unknown distroTag(s) across ${totalEffects} total scoreEffects:\n`);
  for (const [tag, locations] of unknownTags) {
    console.error(`  • Unknown tag "${tag}" used in:`);
    for (const loc of locations) {
      console.error(`      → ${loc}`);
    }
  }
  process.exit(1);
} else {
  console.log(`✅ Cross-check passed — all ${totalEffects} scoreEffects reference valid distro IDs.`);
  process.exit(0);
}