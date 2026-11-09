import { z } from "zod";
// Explicit .ts extension so scripts/validate-*.mjs can load this file with
// plain Node (native type stripping), not only through Vite.
import { platformSchema } from "./distro.ts";

// ── Score effect: links an option to a distro with a weight ────────────────
export const scoreEffectSchema = z.object({
  distroTag: z.string().min(1),
  weight: z.number().int().min(-5).max(5),
});

// ── A single option within a question ──────────────────────────────────────
export const optionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  // Short helper line shown under the label.
  description: z.string().max(120).optional(),
  // Icon key from src/components/icons.tsx.
  icon: z.string().optional(),
  // Hard filter: when this option is selected, only distros whose
  // `platforms` include this value are ranked.
  filterPlatform: platformSchema.optional(),
  scoreEffects: z.array(scoreEffectSchema),
});

// ── A quiz question ──────────────────────────────────────────────────────
// "single-select" auto-advances on choice; "multi-select" lets the user
// check multiple options and requires an explicit Next action.
export const questionTypeSchema = z.enum(["single-select", "multi-select"]);

export const questionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  // Short label for the step indicator ("Experience", "Device", …).
  shortLabel: z.string().min(1).max(16),
  type: questionTypeSchema,
  options: z.array(optionSchema).min(2),
});

// ── Array schema for a collection of questions ─────────────────────────────
export const questionsSchema = z.array(questionSchema);

// ── Inferred TypeScript types ──────────────────────────────────────────────
export type ScoreEffect = z.infer<typeof scoreEffectSchema>;
export type Option = z.infer<typeof optionSchema>;
export type Question = z.infer<typeof questionSchema>;