import type { Distro } from "../schemas/distro";
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
}

/**
 * Pure function that scores every distro based on the user's answers.
 *
 * For each question, the selected option's scoreEffects are iterated and
 * each weight is added to the corresponding distro's running score.
 *
 * Distros excluded by a hard filter (see getEligibleDistros) are not returned.
 *
 * @returns Distros sorted by score descending (highest first). Ties keep the
 * order of the input array (Array.prototype.sort is stable), so the curated
 * order of distros.json acts as a deterministic tie-break.
 */
/**
 * Applies hard filters: if any selected option has a `filterPlatform`, only
 * distros that list that platform are kept. Everything else is unfiltered.
 */
export function getEligibleDistros(answers: Answers, distros: Distro[], questions: Question[]): Distro[] {
  const required = new Set<string>();
  for (const question of questions) {
    for (const selectedOptionId of getSelectedOptionIds(answers, question.id)) {
      const option = question.options.find((o) => o.id === selectedOptionId);
      if (option?.filterPlatform) required.add(option.filterPlatform);
    }
  }
  if (required.size === 0) return distros;
  return distros.filter((d) => [...required].every((p) => (d.platforms as string[]).includes(p)));
}

export function scoreDistros(
  answers: Answers,
  allDistros: Distro[],
  questions: Question[],
): ScoredDistro[] {
  const distros = getEligibleDistros(answers, allDistros, questions);
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

  const results: ScoredDistro[] = distros.map((distro) => ({
    distro,
    score: rawScores.get(distro.id) ?? 0,
  }));

  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Computes the best raw score a distro could achieve for *these* answers.
 * Used as the denominator of the match percentage.
 *
 * For every option the user actually selected, the highest positive weight
 * that option gives to any distro is added. Options with no positive effects
 * (e.g. "No preference") add nothing, so they neither help nor penalise the
 * percentage. An ideal distro that is the top pick on every selected option
 * would therefore score 100%.
 */
export function getMaxPossibleScore(questions: Question[], answers: Answers, distros?: Distro[]): number {
  // When distros are given, only weights for distros that pass the hard
  // filters count, so a filtered-out distro can't inflate the denominator.
  const eligible = distros ? new Set(getEligibleDistros(answers, distros, questions).map((d) => d.id)) : null;
  let max = 0;
  for (const question of questions) {
    for (const selectedOptionId of getSelectedOptionIds(answers, question.id)) {
      const option = question.options.find((o) => o.id === selectedOptionId);
      if (!option) continue;
      let best = 0;
      for (const effect of option.scoreEffects) {
        if (eligible && !eligible.has(effect.distroTag)) continue;
        if (effect.weight > best) best = effect.weight;
      }
      max += best;
    }
  }
  return max;
}

/**
 * Converts a raw score into a 0–100 match percentage relative to the best
 * score achievable for the given answers.
 */
export function getMatchPercent(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  const percent = Math.round((score / maxScore) * 100);
  return Math.min(100, Math.max(0, percent));
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
