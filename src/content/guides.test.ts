import { describe, it, expect } from "vitest";
import { bestForGuides } from "./best-for";
import { comparisons } from "./compare";
import { bestForGuideSchema, comparisonSchema, type BestForGuide, type Comparison } from "../schemas/guide";
import { distrosSchema } from "../schemas/distro";
import { questionsSchema } from "../schemas/question";
import { scoreDistros } from "../lib/scoring";
import { countWords } from "../lib/inline-text";
import { COMPARISON_PAIRS } from "../lib/guide-links";
import distrosData from "../data/distros.json";
import questionsData from "../data/questions.json";

/**
 * Guard rails for the guide pages:
 *  - no duplicate content with OpenSourceFeed articles (blocked topics/pairs),
 *  - no thin pages (minimum amount of hand-written text),
 *  - no copying of distro descriptions into guide text,
 *  - picks stay consistent with the quiz's own scoring.
 */

// Needs and pairs OpenSourceFeed already covers in its own articles. Guides
// for these must not be added here; link to the OSF article instead.
const OSF_COVERED_TOPICS = ["old-hardware", "old-pcs", "old-laptops", "ai-ml", "local-llm", "llm"];
const OSF_COVERED_PAIRS = [["ubuntu", "fedora"]];

const MIN_WORDS_BEST_FOR = 800;
const MIN_WORDS_COMPARE = 550;

const distros = distrosSchema.parse(distrosData);
const questions = questionsSchema.parse(questionsData);
const byId = new Map(distros.map((d) => [d.id, d]));

function bestForWords(g: BestForGuide): number {
  const parts = [
    g.answer,
    ...g.intro,
    ...g.criteria.flatMap((c) => [c.title, c.text]),
    ...g.picks.flatMap((p) => [p.bestFor, p.why, p.watchOut ?? ""]),
    ...g.beforeYouChoose.flatMap((s) => [s.title, s.text]),
    ...g.faqs.flatMap((f) => [f.q, f.a]),
  ];
  return parts.reduce((n, t) => n + countWords(t), 0);
}

function compareWords(c: Comparison): number {
  const parts = [c.answer, ...c.intro, ...c.chooseA, ...c.chooseB, ...c.differences.flatMap((s) => [s.title, s.text]), ...c.faqs.flatMap((f) => [f.q, f.a])];
  return parts.reduce((n, t) => n + countWords(t), 0);
}

function allText(obj: unknown): string[] {
  if (typeof obj === "string") return [obj];
  if (Array.isArray(obj)) return obj.flatMap(allText);
  if (obj && typeof obj === "object") return Object.values(obj).flatMap(allText);
  return [];
}

describe("best-for guides", () => {
  it("are valid, unique and don't duplicate OSF-covered topics", () => {
    const slugs = new Set<string>();
    for (const g of bestForGuides) {
      bestForGuideSchema.parse(g);
      expect(slugs.has(g.slug), `duplicate slug ${g.slug}`).toBe(false);
      slugs.add(g.slug);
      expect(OSF_COVERED_TOPICS, `${g.slug} is covered by an OSF article`).not.toContain(g.slug);
      const uses = g.quizProfile["primary-use-case"];
      for (const u of Array.isArray(uses) ? uses : uses ? [uses] : []) {
        expect(OSF_COVERED_TOPICS, `${g.slug} targets a use case OSF already covers`).not.toContain(u);
      }
    }
  });

  it.each(bestForGuides.map((g) => [g.slug, g] as const))("%s has enough original text", (_slug, g) => {
    expect(bestForWords(g)).toBeGreaterThanOrEqual(MIN_WORDS_BEST_FOR);
  });

  it.each(bestForGuides.map((g) => [g.slug, g] as const))("%s picks are real and match the quiz scoring", (_slug, g) => {
    const ranked = scoreDistros(g.quizProfile, distros, questions);
    const rankOf = new Map(ranked.map((r, i) => [r.distro.id, { rank: i, score: r.score }]));
    const seen = new Set<string>();
    for (const p of g.picks) {
      expect(byId.has(p.distroId), `unknown distro ${p.distroId}`).toBe(true);
      expect(seen.has(p.distroId), `duplicate pick ${p.distroId}`).toBe(false);
      seen.add(p.distroId);
      const r = rankOf.get(p.distroId);
      expect(r, `${p.distroId} is filtered out by the quiz for this profile`).toBeDefined();
      expect(r!.score, `${p.distroId} scores <= 0 for this profile`).toBeGreaterThan(0);
      expect(r!.rank, `${p.distroId} ranks too low (${r!.rank + 1}) for this profile`).toBeLessThan(20);
    }
    // The first pick must be one of the quiz's own top matches.
    const topScore = ranked[0].score;
    expect(rankOf.get(g.picks[0].distroId)!.score).toBeGreaterThanOrEqual(topScore - 1);
  });
});

describe("comparisons", () => {
  it("are valid, unique (in either order) and skip OSF-covered pairs", () => {
    const keys = new Set<string>();
    for (const c of comparisons) {
      comparisonSchema.parse(c);
      expect(byId.has(c.a) && byId.has(c.b), `${c.slug}: unknown distro`).toBe(true);
      expect(c.a).not.toBe(c.b);
      const key = [c.a, c.b].sort().join("|");
      expect(keys.has(key), `duplicate pair ${c.slug}`).toBe(false);
      keys.add(key);
      for (const [x, y] of OSF_COVERED_PAIRS) {
        expect(key, `${c.slug} is covered by an OSF article`).not.toBe([x, y].sort().join("|"));
      }
    }
  });

  it.each(comparisons.map((c) => [c.slug, c] as const))("%s has enough original text", (_slug, c) => {
    expect(compareWords(c)).toBeGreaterThanOrEqual(MIN_WORDS_COMPARE);
  });

  it("client-side pair index matches the comparison content", () => {
    expect(COMPARISON_PAIRS.map(([a, b, slug]) => `${a}|${b}|${slug}`).sort()).toEqual(
      comparisons.map((c) => `${c.a}|${c.b}|${c.slug}`).sort(),
    );
  });
});

describe("content boundary", () => {
  it("guide text never copies a distro description", () => {
    const text = allText([bestForGuides, comparisons]).join("\n");
    for (const d of distros) {
      expect(text.includes(d.description), `${d.id} description copied into guide text`).toBe(false);
    }
  });

  it("internal links point at pages that exist", () => {
    const valid = new Set([
      "/distro-chooser/",
      "/distro-chooser/best-for/",
      "/distro-chooser/compare/",
      ...bestForGuides.map((g) => `/distro-chooser/best-for/${g.slug}/`),
      ...comparisons.map((c) => `/distro-chooser/compare/${c.slug}/`),
    ]);
    const links = allText([bestForGuides, comparisons])
      .flatMap((t) => [...t.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]).concat(t.startsWith("/distro-chooser") ? [t] : []))
      .map((l) => l.split("#")[0]);
    for (const l of links) expect(valid.has(l), `broken internal link ${l}`).toBe(true);
  });
});
