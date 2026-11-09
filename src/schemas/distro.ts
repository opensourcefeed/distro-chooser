import { z } from "zod";

// ── Exported constants for easy extension ──────────────────────────────────
export const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export const USE_CASES = [
  "everyday",
  "development",
  "gaming",
  "privacy",
  "security-testing",
  "ai-ml",
  "old-hardware",
] as const;
export const RELEASE_MODELS = ["stable", "rolling"] as const;
// Hardware a distro officially supports. Used as a hard filter by the
// "Which device?" question: a distro is only ranked if it lists the device.
export const PLATFORMS = ["pc", "raspberry-pi", "apple-silicon", "handheld"] as const;

// ── Reusable enums ─────────────────────────────────────────────────────────
export const experienceLevelSchema = z.enum(EXPERIENCE_LEVELS);
export const useCaseSchema = z.enum(USE_CASES);
export const releaseModelSchema = z.enum(RELEASE_MODELS);
export const platformSchema = z.enum(PLATFORMS);

// ── Links sub-schema ───────────────────────────────────────────────────────
// pageUrl is the distro's page on opensourcefeed.org, which stays the single
// home for "what is distro X" content. It is optional because a few distros
// don't have an OSF page yet; for those the UI falls back to officialUrl
// rather than linking to a 404.
export const linksSchema = z.object({
  pageUrl: z.string().url().optional(),
  officialUrl: z.string().url(),
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
  platforms: z.array(platformSchema).min(1),
  // "Independent" for distros not derived from another one.
  baseDistro: z.string().min(1),
  packageManager: z.string().min(1),
  nvidiaFriendly: z.boolean(),
  // Short warning shown on the result card when a distro has an important
  // limitation the scoring can't express (e.g. "live USB only").
  caveat: z.string().max(200).optional(),
  lastVerifiedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "lastVerifiedDate must be an ISO date string (YYYY-MM-DD)",
  }),
  links: linksSchema,
});

// ── Array schema for a collection of distros ───────────────────────────────
export const distrosSchema = z.array(distroSchema);

// ── Inferred TypeScript type ───────────────────────────────────────────────
export type Distro = z.infer<typeof distroSchema>;
export type Platform = z.infer<typeof platformSchema>;
