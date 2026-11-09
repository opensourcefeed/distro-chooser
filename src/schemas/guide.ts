import { z } from "zod";

/**
 * Schemas for the editorial guide pages:
 *   /best-for/<slug>/  ("Best Linux distro for …")
 *   /compare/<a>-vs-<b>/
 *
 * Content boundary (TODO.md P2): these pages hold decision content only.
 * "What is distro X" lives on the OpenSourceFeed /distribution/<slug> pages,
 * so text here is written for the page's question and links out for the
 * rest. Text fields support **bold** and [links](https://…) only.
 */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const faqSchema = z.object({ q: z.string().min(10), a: z.string().min(40) });
const linkSchema = z.object({ label: z.string().min(1), href: z.string().min(1) });
const sectionSchema = z.object({ title: z.string().min(3), text: z.string().min(80) });

export const bestForGuideSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** Short name used in lists and breadcrumbs, e.g. "Beginners". */
  label: z.string().min(1),
  h1: z.string().min(10),
  metaTitle: z.string().min(10).max(60),
  metaDescription: z.string().min(70).max(160),
  /** One-sentence answer shown at the top of the page. */
  answer: z.string().min(40),
  intro: z.array(z.string().min(40)).min(1),
  /** Quiz answers this guide corresponds to; picks are checked against it. */
  quizProfile: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  criteria: z.array(sectionSchema).min(3),
  picks: z
    .array(
      z.object({
        distroId: z.string().min(1),
        bestFor: z.string().min(3).max(40),
        why: z.string().min(120),
        watchOut: z.string().min(20).optional(),
      }),
    )
    .min(4)
    .max(7),
  beforeYouChoose: z.array(sectionSchema).min(1),
  faqs: z.array(faqSchema).min(3),
  related: z.array(linkSchema).min(2),
  lastReviewed: isoDate,
});

export const comparisonSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+-vs-[a-z0-9-]+$/),
  a: z.string().min(1),
  b: z.string().min(1),
  metaTitle: z.string().min(10).max(60),
  metaDescription: z.string().min(70).max(160),
  /** The short verdict shown at the top of the page. */
  answer: z.string().min(60),
  intro: z.array(z.string().min(40)).min(1),
  chooseA: z.array(z.string().min(15)).min(3),
  chooseB: z.array(z.string().min(15)).min(3),
  differences: z.array(sectionSchema).min(4),
  faqs: z.array(faqSchema).min(3),
  related: z.array(linkSchema).min(2),
  lastReviewed: isoDate,
});

export type BestForGuide = z.infer<typeof bestForGuideSchema>;
export type Comparison = z.infer<typeof comparisonSchema>;
