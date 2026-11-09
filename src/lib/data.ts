/**
 * Typed access to the quiz data for client code.
 *
 * The JSON is validated against the Zod schemas at build time (in
 * src/pages/index.astro), by `pnpm run validate:all` and in the unit tests,
 * so the browser bundle doesn't need to ship Zod just to re-check it.
 */
import type { Distro } from "../schemas/distro";
import type { Question } from "../schemas/question";
import distrosJson from "../data/distros.json";
import questionsJson from "../data/questions.json";

export const distros = distrosJson as unknown as Distro[];
export const questions = questionsJson as unknown as Question[];

/** Most recent `lastVerifiedDate` across all distros (YYYY-MM-DD). */
export const dataLastReviewed = distros.reduce(
  (latest, d) => (d.lastVerifiedDate > latest ? d.lastVerifiedDate : latest),
  "",
);

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const RELEASE_MODEL_LABELS: Record<string, string> = {
  stable: "Fixed releases",
  rolling: "Rolling release",
};

export const USE_CASE_LABELS: Record<string, string> = {
  everyday: "Everyday use",
  development: "Development",
  gaming: "Gaming",
  privacy: "Privacy",
  "security-testing": "Security testing",
  "ai-ml": "AI/ML",
  "old-hardware": "Old hardware",
};

export const PLATFORM_LABELS: Record<string, string> = {
  pc: "PC",
  "raspberry-pi": "Raspberry Pi",
  "apple-silicon": "Apple Silicon",
  handheld: "Handheld",
};

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
