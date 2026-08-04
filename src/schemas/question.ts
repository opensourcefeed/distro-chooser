import { z } from "zod";

// ── Score effect: links an option to a distro with a weight ────────────────
export const scoreEffectSchema = z.object({
  distroTag: z.string().min(1),
  weight: z.number().int().min(-5).max(5),
});

// ── A single option within a question ──────────────────────────────────────
export const optionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  scoreEffects: z.array(scoreEffectSchema),
});

// ── A quiz question ──────────────────────────────────────────────────────
// "single-select" auto-advances on choice; "multi-select" lets the user
// check multiple options and requires an explicit Next action.
export const questionTypeSchema = z.enum(["single-select", "multi-select"]);

export const questionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  type: questionTypeSchema,
  options: z.array(optionSchema).min(2),
});

// ── Array schema for a collection of questions ─────────────────────────────
export const questionsSchema = z.array(questionSchema);

// ── Inferred TypeScript types ──────────────────────────────────────────────
export type ScoreEffect = z.infer<typeof scoreEffectSchema>;
export type Option = z.infer<typeof optionSchema>;
export type Question = z.infer<typeof questionSchema>;