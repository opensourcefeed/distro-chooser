import type { Distro } from "../schemas/distro";
import { getContentDepthMultiplier } from "../schemas/distro";
import type { Question } from "../schemas/question";

export type { Question, Option, ScoreEffect } from "../schemas/question";

/**
 * Answers map: question id → selected option id, or option ids for
 * multi-select questions.
 */
export type Answers = Record<string, string | string[]>;

/**
 * Normalizes an answer value into an array of selected option ids,
 * regardless of whether the question was single- or multi-select.
 */
function getSelectedOptionIds(answers: Answers, questionId: string): string[] {
  const value = answers[questionId];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

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

  // Process each question — sums effects across all selected options,
  // so multi-select questions can contribute more than one option's weight.
  for (const question of questions) {
    const selectedOptionIds = getSelectedOptionIds(answers, question.id);

    for (const selectedOptionId of selectedOptionIds) {
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
 * Computes the theoretical maximum raw score any distro could achieve.
 * Used to calculate match percentage.
 *
 * For single-select questions, only one option can be chosen, so this is
 * the single highest positive weight found anywhere in the question.
 * For multi-select questions, every option can be chosen simultaneously,
 * so this sums each option's own best positive weight.
 */
export function getMaxPossibleScore(questions: Question[]): number {
  let max = 0;
  for (const question of questions) {
    if (question.type === "multi-select") {
      for (const option of question.options) {
        let bestForOption = 0;
        for (const effect of option.scoreEffects) {
          if (effect.weight > bestForOption) bestForOption = effect.weight;
        }
        max += bestForOption;
      }
    } else {
      let bestForQuestion = 0;
      for (const option of question.options) {
        for (const effect of option.scoreEffects) {
          if (effect.weight > bestForQuestion) bestForQuestion = effect.weight;
        }
      }
      max += bestForQuestion;
    }
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
    const selectedOptionIds = getSelectedOptionIds(answers, question.id);

    for (const selectedOptionId of selectedOptionIds) {
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
  }

  return reasons;
}
