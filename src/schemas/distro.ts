import { z } from "zod";

// ── Exported constants for easy extension ──────────────────────────────────
export const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export const USE_CASES = [
  "everyday",
  "development",
  "gaming",
  "privacy",
  "ai-ml",
  "old-hardware",
] as const;
export const RELEASE_MODELS = ["stable", "rolling"] as const;

// ── Reusable enums ─────────────────────────────────────────────────────────
export const experienceLevelSchema = z.enum(EXPERIENCE_LEVELS);
export const useCaseSchema = z.enum(USE_CASES);
export const releaseModelSchema = z.enum(RELEASE_MODELS);

// ── Links sub-schema ───────────────────────────────────────────────────────
// pageUrl is the only field opensourcefeed.org guarantees today; the rest are
// optional and populated once dedicated install/release/comparison pages exist.
export const linksSchema = z.object({
  pageUrl: z.string().url(),
  overviewUrl: z.string().url().optional(),
  installGuideUrl: z.string().url().optional(),
  latestReleaseUrl: z.string().url().optional(),
  comparisonUrls: z.array(z.string().url()).optional(),
});

// ── Main distro schema ─────────────────────────────────────────────────────
export const distroSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().max(200),
  experienceLevel: experienceLevelSchema,
  useCases: z.array(useCaseSchema).min(1),
  releaseModel: releaseModelSchema,
  desktopEnvironments: z.array(z.string()).min(1),
  nvidiaFriendly: z.boolean(),
  lastVerifiedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "lastVerifiedDate must be an ISO date string (YYYY-MM-DD)",
  }),
  links: linksSchema,
});

// ── Array schema for a collection of distros ───────────────────────────────
export const distrosSchema = z.array(distroSchema);

// ── Inferred TypeScript type ───────────────────────────────────────────────
export type Distro = z.infer<typeof distroSchema>;

// ── Helper to check content depth ──────────────────────────────────────────
// Counts populated optional link fields (beyond the required pageUrl) to
// reward distros with richer opensourcefeed.org content: full (all 4) → 1.15,
// partial (1-3) → 1.05, sparse (none) → 1.0.
const OPTIONAL_LINK_FIELDS = [
  "overviewUrl",
  "installGuideUrl",
  "latestReleaseUrl",
  "comparisonUrls",
] as const;

export function getContentDepthMultiplier(links: Distro["links"]): number {
  const populatedCount = OPTIONAL_LINK_FIELDS.filter((field) => links[field] !== undefined).length;

  if (populatedCount === OPTIONAL_LINK_FIELDS.length) return 1.15;
  if (populatedCount > 0) return 1.05;
  return 1.0;
}