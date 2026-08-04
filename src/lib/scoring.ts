import type { Distro } from "../schemas/distro";
import { getContentDepthMultiplier } from "../schemas/distro";

/**
 * Shape of a score effect within a question option.
 * Mirrors the Zod schema from src/schemas/question.ts.
 */
export interface ScoreEffect {
  distroTag: string;
  weight: number;
}

/**
 * Shape of a question option as loaded from JSON.
 */
export interface Option {
  id: string;
  label: string;
  scoreEffects: ScoreEffect[];
}

/**
 * Shape of a question as loaded from JSON.
 */
export interface Question {
  id: string;
  text: string;
  type: "single-select";
  options: Option[];
}

/**
 * Answers map: question id → selected option id.
 */
export type Answers = Record<string, string>;

/**
 * A scored distro result.
 */
export interface ScoredDistro {
  distro: Distro;
  score: number;
  contentDepthMultiplier: number;
  adjustedScore: number;
}

/**
 * Pure function that scores every distro based on the user's answers.
 *
 * For each question, the selected option's scoreEffects are iterated and
 * each weight is added to the corresponding distro's running score.
 * After all questions are processed, a content-depth multiplier is applied:
 *   - 1.15 for distros with all 4 link fields populated
 *   - 1.05 for distros with 2-3 fields
 *   - 1.0 for distros with 0-1 fields
 *
 * @returns Distros sorted by adjustedScore descending (highest first).
 */
export function scoreDistros(
  answers: Answers,
  distros: Distro[],
  questions: Question[],
): ScoredDistro[] {
  // Build index: distro id → raw score accumulator
  const rawScores = new Map<string, number>();
  for (const d of distros) {
    rawScores.set(d.id, 0);
  }

  // Process each question
  for (const question of questions) {
    const selectedOptionId = answers[question.id];
    if (!selectedOptionId) continue; // unanswered question → skip

    const option = question.options.find((o) => o.id === selectedOptionId);
    if (!option) continue; // invalid answer → skip

    for (const effect of option.scoreEffects) {
      const current = rawScores.get(effect.distroTag);
      if (current !== undefined) {
        rawScores.set(effect.distroTag, current + effect.weight);
      }
      // If the distroTag doesn't match any known distro, ignore silently
    }
  }

  // Build scored results with content-depth multiplier
  const results: ScoredDistro[] = distros.map((distro) => {
    const raw = rawScores.get(distro.id) ?? 0;
    const multiplier = getContentDepthMultiplier(distro.links);
    return {
      distro,
      score: raw,
      contentDepthMultiplier: multiplier,
      adjustedScore: raw * multiplier,
    };
  });

  // Sort descending by adjustedScore, then by raw score as tiebreaker
  results.sort((a, b) => {
    const diff = b.adjustedScore - a.adjustedScore;
    if (diff !== 0) return diff;
    return b.score - a.score;
  });

  return results;
}

/**
 * Computes the theoretical maximum raw score any distro could achieve
 * by summing the highest positive weight per question.
 * Used to calculate match percentage.
 */
export function getMaxPossibleScore(questions: Question[]): number {
  let max = 0;
  for (const question of questions) {
    let bestForQuestion = 0;
    for (const option of question.options) {
      for (const effect of option.scoreEffects) {
        if (effect.weight > 0 && effect.weight > bestForQuestion) {
          bestForQuestion = effect.weight;
        }
      }
    }
    max += bestForQuestion;
  }
  return max;
}

/**
 * Returns an array of "why recommended" reason strings for a given distro.
 * For each question, if the user's selected option has a positive weight
 * for this distro, include the question text and the option label.
 */
export function getWhyRecommended(
  distroId: string,
  answers: Answers,
  questions: Question[],
): { question: string; answer: string; weight: number }[] {
  const reasons: { question: string; answer: string; weight: number }[] = [];

  for (const question of questions) {
    const selectedOptionId = answers[question.id];
    if (!selectedOptionId) continue;

    const option = question.options.find((o) => o.id === selectedOptionId);
    if (!option) continue;

    const effect = option.scoreEffects.find((e) => e.distroTag === distroId);
    if (effect && effect.weight > 0) {
      reasons.push({
        question: question.text,
        answer: option.label,
        weight: effect.weight,
      });
    }
  }

  return reasons;
}
