# Distro Chooser

An interactive quiz that recommends GNU/Linux distributions based on a user's experience level, use cases, hardware, and preferences — then links out to the matching distribution pages on [OpenSourceFeed](https://www.opensourcefeed.org/distribution/).

## 🧰 Stack

| Technology | Purpose |
|-----------|---------|
| [Astro](https://astro.build) v7 | Static site generation, SEO metadata, sitemap |
| [React](https://react.dev) | Quiz UI (island-hydrated) |
| [Zod](https://zod.dev) | Runtime validation + inferred types for data and schemas |
| [Tailwind CSS](https://tailwindcss.com) v4 | Styling, light/dark theme via `dark:` variants |
| [Vitest](https://vitest.dev) | Unit tests for the scoring engine |
| [Playwright](https://playwright.dev) | End-to-end and layout tests at 10 screen sizes |
| [Fontsource](https://fontsource.org) | Self-hosted Inter and Space Grotesk |
| [pnpm](https://pnpm.io) | Package manager |

## 🧠 How it works

1. **Questions** (`src/data/questions.json`) are either `single-select` (auto-advances on click) or `multi-select` (checkboxes + explicit Next). Each option carries `scoreEffects`: a list of `{ distroTag, weight }` pairs (weight range roughly -5..5).
2. **Distros** (`src/data/distros.json`) each have metadata (experience level, use cases, release model, desktop environments, NVIDIA-friendliness), an optional `caveat` shown on the result card, a `lastVerifiedDate`, and `links`: `pageUrl` (their OpenSourceFeed page, when one exists) and `officialUrl` (used as the fallback link).
3. **Device filter**: options with a `filterPlatform` (the first question, "What will you install Linux on?") are hard filters. Only distros whose `platforms` include that value are ranked.
4. **Scoring** (`src/lib/scoring.ts`) sums the `scoreEffects` of every selected option across all questions per distro and sorts descending (ties keep the `distros.json` order). The match percentage divides a distro's score by `getMaxPossibleScore(questions, answers)`: the sum of the best positive weight of each option the user actually selected, so a distro that is the top pick on every answer scores 100%. The result is clamped to 0–100.
5. **Guide pages**: `/best-for/<need>/` and `/compare/<a>-vs-<b>/` are static pages generated from `src/content/best-for.ts` and `src/content/compare.ts` (schemas in `src/schemas/guide.ts`). They hold decision content only and link to the OpenSourceFeed distribution pages for "what is X". `src/content/guides.test.ts` blocks topics OSF already covers, enforces a minimum amount of original text and checks picks against the quiz scoring.
6. **Answers are shareable**: completed quizzes encode answers into a `?a=` query param (comma-separated per question, `+`-joined for multi-select), so results can be bookmarked or shared without a backend.
7. Both `src/data/*.json` files are validated against the Zod schemas (`src/schemas/`) at build time (in `src/pages/index.astro`), in the unit tests and via `pnpm run validate:all`. The browser bundle doesn't include Zod — this also cross-checks that every `distroTag` referenced in `questions.json` exists in `distros.json`.

## 🚀 Project structure

```
/
├── public/                  # robots.txt, OG image, favicons
├── scripts/
│   ├── validate-distros.mjs   # validates distros.json against src/schemas/distro.ts
│   └── validate-questions.mjs # validates questions.json + cross-checks distroTags
├── src/
│   ├── components/
│   │   ├── QuizApp.tsx         # landing / quiz / results views, URL encode/decode
│   │   ├── Quiz.tsx            # question flow, keyboard nav, step indicator
│   │   ├── ResultsView.tsx     # hero + runner-up cards, share, edit/restart
│   │   ├── DistroMark.tsx      # monogram tile used instead of distro logos
│   │   ├── icons.tsx           # inline SVG icons (adapted from Lucide)
│   │   ├── Header.astro        # sticky header, theme toggle, "Start over"
│   │   ├── Footer.astro        # about, data-reviewed date, privacy, report an error
│   │   └── ContentSections.astro # how it works, methodology, FAQ, all distros
│   ├── content/
│   │   ├── best-for.ts         # "Best Linux distro for …" guides
│   │   ├── compare.ts          # "X vs Y" comparisons
│   │   └── guides.test.ts      # duplicate/thin-content guard rails
│   ├── data/
│   │   ├── distros.json        # 50 curated distros
│   │   └── questions.json      # quiz questions + scoring weights
│   ├── layouts/
│   │   └── Layout.astro        # SEO meta, JSON-LD, theme init, consent banner
│   ├── lib/
│   │   ├── scoring.ts          # scoring engine + device filter (unit tested)
│   │   ├── explain.ts          # "why recommended" sentence generation
│   │   ├── data.ts             # typed data for client code, labels, dates
│   │   ├── faq.ts              # FAQ content + FAQPage JSON-LD
│   │   └── distro-mark.ts      # monogram initials and tile colours
│   ├── pages/
│   │   ├── index.astro         # entry point, build-time data validation
│   │   ├── best-for/           # hub + [slug].astro
│   │   └── compare/            # hub + [slug].astro
│   ├── schemas/
│   │   ├── distro.ts           # Zod schema + Distro type (single source of truth)
│   │   └── question.ts         # Zod schema + Question type
│   └── styles/
│       └── global.css          # design tokens (@theme), fonts, animations
├── e2e/                        # Playwright tests
├── astro.config.mjs
└── package.json
```

## 🧞 Commands

| Command | Action |
|---------|--------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start local dev server at `localhost:4321/distro-chooser/` |
| `pnpm build` | Build production site to `./dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm test` | Run the scoring engine's unit tests |
| `pnpm run test:e2e` | Build, then run the Playwright tests (run `pnpm exec playwright install chromium` once first) |
| `pnpm run og:render` | Re-render `public/og-image.png` from `scripts/og-image.html` |
| `pnpm run validate:all` | Validate `distros.json` + `questions.json` against the Zod schemas |
| `pnpm run check` | Type-check the whole project (`astro check`) |
| `pnpm run verify` | Validate, test, type-check and build in one go |
| `pnpm run deploy "<message>"` | Verify, build and publish to the `gh-pages` checkout in `../distro-chooser` |

CI (`.github/workflows/ci.yml`) runs validate → unit tests → type-check → build → Playwright on every push to `main` and every PR.

## ✏️ Adding or editing distros / questions

- **New distro**: add an entry to `src/data/distros.json` following the existing shape, using the real slug from `opensourcefeed.org/distribution/<slug>` for `links.pageUrl` (omit it if there is no OSF page yet) and the project's website for `links.officialUrl`. Set `lastVerifiedDate` to the day you checked the facts against official sources. Then add `scoreEffects` entries for that distro's `id` across relevant question options in `questions.json`.
- **New question**: add to `src/data/questions.json` with `type: "single-select"` or `"multi-select"`, and `scoreEffects` for however many distros it should influence.
- Run `pnpm run validate:all` after either change — it will catch schema violations and any `scoreEffects` referencing a distro `id` that doesn't exist.

## 🌐 Deployment

- **Base path:** `/distro-chooser/`
- **Production site:** `https://www.opensourcefeed.org`
- Sitemap and `robots.txt` are generated at build time via `@astrojs/sitemap`.
- `scripts/deploy.sh` runs validation, tests and type-checking, builds, replaces the contents of the `../distro-chooser` gh-pages checkout (keeping `.git`, `.nojekyll` and `CNAME`), then commits and pushes that checkout only. Commit and push this source repo yourself.

## 🔒 Analytics and consent

Google Analytics and Ahrefs Web Analytics load only after the visitor clicks **Accept** in the consent banner (`src/layouts/Layout.astro`). The choice is stored in `localStorage` under `analytics-consent`; the footer's **Cookie settings** button reopens the banner. Declining removes GA cookies and, if analytics had already loaded, reloads the page.
