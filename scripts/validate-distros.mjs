#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { default: z } = await import("zod");

const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"];
const USE_CASES = ["everyday", "development", "gaming", "privacy", "ai-ml", "old-hardware"];
const RELEASE_MODELS = ["stable", "rolling"];

const linksSchema = z.object({
  pageUrl: z.string().url(),
  overviewUrl: z.string().url().optional(),
  installGuideUrl: z.string().url().optional(),
  latestReleaseUrl: z.string().url().optional(),
  comparisonUrls: z.array(z.string().url()).optional(),
});

const distroSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().max(200),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),
  useCases: z.array(z.enum(USE_CASES)).min(1),
  releaseModel: z.enum(RELEASE_MODELS),
  desktopEnvironments: z.array(z.string()).min(1),
  nvidiaFriendly: z.boolean(),
  lastVerifiedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "lastVerifiedDate must be an ISO date string (YYYY-MM-DD)",
  }),
  links: linksSchema,
});

const distrosSchema = z.array(distroSchema);

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