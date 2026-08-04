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
| [pnpm](https://pnpm.io) | Package manager |

## 🧠 How it works

1. **Questions** (`src/data/questions.json`) are either `single-select` (auto-advances on click) or `multi-select` (checkboxes + explicit Next). Each option carries `scoreEffects`: a list of `{ distroTag, weight }` pairs (weight range roughly -5..5).
2. **Distros** (`src/data/distros.json`) each have metadata (experience level, use cases, release model, desktop environments, NVIDIA-friendliness) and `links` back to their OpenSourceFeed page.
3. **Scoring** (`src/lib/scoring.ts`) sums the `scoreEffects` of every selected option across all questions per distro, applies a small content-depth multiplier (distros with more populated `links` fields rank slightly higher on ties), and sorts descending. `getMaxPossibleScore` computes a rough denominator for the match-percentage display.
4. **Answers are shareable**: completed quizzes encode answers into a `?a=` query param (comma-separated per question, `+`-joined for multi-select), so results can be bookmarked or shared without a backend.
5. Both `src/data/*.json` files are validated against the same Zod schemas (`src/schemas/`) used at runtime, via `pnpm run validate:all` — this also cross-checks that every `distroTag` referenced in `questions.json` exists in `distros.json`.

## 🚀 Project structure

```
/
├── public/                  # robots.txt, OG image, favicons
├── scripts/
│   ├── validate-distros.mjs   # validates distros.json against src/schemas/distro.ts
│   └── validate-questions.mjs # validates questions.json + cross-checks distroTags
├── src/
│   ├── components/
│   │   ├── Quiz.tsx          # question flow, keyboard nav, single/multi-select
│   │   ├── QuizApp.tsx       # view state, URL encode/decode, scoring orchestration
│   │   ├── ResultsView.tsx   # results cards, share, edit-answers/restart
│   │   └── ThemeToggle.tsx   # light/dark toggle
│   ├── data/
│   │   ├── distros.json      # ~40 curated distros
│   │   └── questions.json    # quiz questions + scoring weights
│   ├── layouts/
│   │   └── Layout.astro      # SEO meta, JSON-LD, theme-init script
│   ├── lib/
│   │   ├── scoring.ts        # scoring engine (unit tested)
│   │   └── explain.ts        # "why recommended" sentence generation
│   ├── pages/
│   │   └── index.astro       # entry point
│   ├── schemas/
│   │   ├── distro.ts         # Zod schema + Distro type (single source of truth)
│   │   └── question.ts       # Zod schema + Question type
│   └── styles/
│       └── global.css        # Tailwind import, animations, dark-mode variant
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
| `pnpm run validate:all` | Validate `distros.json` + `questions.json` against the Zod schemas |
| `pnpm exec astro check` | Type-check the whole project |

CI (`.github/workflows/ci.yml`) runs validate → test → type-check → build on every push and PR.

## ✏️ Adding or editing distros / questions

- **New distro**: add an entry to `src/data/distros.json` following the existing shape, using the real slug from `opensourcefeed.org/distribution/<slug>` for `links.pageUrl`. Then add `scoreEffects` entries for that distro's `id` across relevant question options in `questions.json`.
- **New question**: add to `src/data/questions.json` with `type: "single-select"` or `"multi-select"`, and `scoreEffects` for however many distros it should influence.
- Run `pnpm run validate:all` after either change — it will catch schema violations and any `scoreEffects` referencing a distro `id` that doesn't exist.

## 🌐 Deployment

- **Base path:** `/distro-chooser/`
- **Production site:** `https://www.opensourcefeed.org`
- Sitemap and `robots.txt` are generated at build time via `@astrojs/sitemap`.
