# Distro Chooser — TODO

_Created 2026-11-09. The reasoning behind each item is in [ANALYSIS.md](ANALYSIS.md)._

**Priority:** P0 = do now (correctness, trust, legal) · P1 = next sprint (SEO and core UX) · P2 = growth · P3 = nice to have
**Effort:** S ≤ ½ day · M ≤ 2 days · L > 2 days

---

## P0: Correctness, trust, compliance

_All P0 items were implemented on 2026-11-09. Notes on what was done are under each item._

- [x] **P0-1 · S: Fix Raspberry Pi OS recommendations**
  - It is currently the #1 pick for "beginner + old PC". It is an ARM OS for Raspberry Pi boards, not for x86 PCs.
  - Remove its weights for `everyday`, `old-hardware`, `5-plus` and `10-plus` in `src/data/questions.json` (or gate it behind the device question in P1-8).
  - Fix `desktopEnvironments` in `src/data/distros.json`: it ships PIXEL on labwc, not LXDE/XFCE.
  - _Done: all positive weights removed until P1-8 adds a device filter; desktop set to "PIXEL (labwc)"; caveat added ("Made for Raspberry Pi single-board computers")._
- [x] **P0-2 · S: Fix Kali Linux**
  - Change `primary-use-case:privacy` from +3 to a negative weight.
  - Add a "Penetration testing, not a daily driver" note.
  - Resolve the mismatch between `nvidiaFriendly: true` and the missing NVIDIA weight.
  - _Done: privacy weight is now −3; new "Security testing / penetration testing" use-case option (Kali +5); caveat added; `nvidiaFriendly` set to false (drivers need manual setup)._
- [x] **P0-3 · S: Add caveats for Tails and SteamOS**
  - Tails: live USB only, not installed.
  - SteamOS: official support only on Steam Deck and selected handhelds.
  - Add an optional `caveat` field to the schema and show it on result cards.
  - _Done: `caveat` field added and shown as an amber note on result cards. Also used for Kali, Raspberry Pi OS, Slackware (stable 15.0 is from 2022), Ubuntu MATE (no 26.04 LTS image) and SpiralLinux (no release since 2023)._
- [x] **P0-4 · M: Fix the match-percentage math**
  - `getMaxPossibleScore` adds up every multi-select option, so top picks only reach 28–45% ("Fair match").
  - Normalize against the best score achievable for the user's selected answers, and clamp the result to 0–100.
  - Add unit tests with realistic personas to `src/lib/scoring.test.ts`.
  - _Done: `getMaxPossibleScore(questions, answers)` + `getMatchPercent()`. Beginner/old-PC persona now tops out at 85% (was 42%). Persona tests run against the real data._
- [x] **P0-5 · S: Remove the fake content-depth boost**
  - Delete `getContentDepthMultiplier` and the "+N% depth" badge in `ResultsView.tsx`.
  - Remove the duplicate `overviewUrl`, `installGuideUrl`, `latestReleaseUrl` and `comparisonUrls` fields, which all equal `pageUrl`.
  - _Done. `links` is now `pageUrl` (optional) + `officialUrl` (required). Garuda, Alpine and Slackware cards now link to their official sites._
- [x] **P0-6 · S: Make analytics privacy-compliant**
  - GA4 and Ahrefs currently load with no consent.
  - Either add a consent banner, or switch to cookieless analytics (Plausible or Umami).
  - Add a privacy note to the footer.
  - _Done: consent banner; GA4 and Ahrefs load only after "Accept". Minimal footer with a privacy note and a "Cookie settings" button. P1-3 still owns the full footer._
- [x] **P0-7 · S: Harden `scripts/deploy.sh`**
  - Run `validate:all`, `test` and `astro check` before building.
  - Replace `cp -r` with `rsync -a --delete --exclude .git --exclude .nojekyll dist/ ../distro-chooser/`.
  - Stop the automatic `git add -A` and push in the source repo.
  - Delete the orphaned `_astro/index.hKaFSz6u.css` from gh-pages.
  - _Done. rsync isn't installed on the dev machine, so the script clears the target (keeping `.git`, `.nojekyll`, `CNAME`) and copies `dist/` instead. The orphaned CSS is removed on the next deploy. Deploy commits record the source commit hash._
- [x] **P0-8 · S: Restore CI**
  - Add `.github/workflows/ci.yml` (validate → test → astro check → build), or remove the claim from the README.
  - _Done. New `pnpm run check` and `pnpm run verify` scripts._
- [x] **P0-9 · M: Factual audit of all 42 distros**
  - Check descriptions, desktop environments, experience level, NVIDIA support and release model against official sources.
  - Replace the placeholder `lastVerifiedDate: 2026-08-01` (31 entries) with real dates.
  - _Done (all entries dated 2026-11-09). Main corrections: Ubuntu → GNOME only; Pop!_OS → COSMIC only (24.04); openSUSE entry is now explicitly Tumbleweed; Solus → rolling, XFCE edition added; Fedora/Debian/CachyOS/EndeavourOS/Garuda/ROSA/antiX/SpiralLinux/Trisquel desktop lists updated; marketing claims removed from Fedora, Mint, elementary OS and Kali descriptions; unsupported privacy use case removed from elementary OS and Garuda; Garuda gets the same −1 beginner weight as other intermediate distros; Puppy's +1 for new hardware removed._
  - _Still open: KDE neon's future is unclear since the KDE Linux announcement (no official end yet), so check it again at the next review. The Leap/Tumbleweed split is tracked in P1-10._

## P1: SEO foundation and core UX

_P1 implemented on 2026-11-09. Items still marked `[ ]` are partly done; the note says what is left._

- [x] **P1-1 · S: Fix meta tags and structured data**
  - _Done: title 59 chars, description 156 chars, `dateModified` + `BreadcrumbList` + `FAQPage` JSON-LD._
  - Shorten the title to 60 characters or fewer (currently 70), e.g. "Which Linux Distro Should I Use? Free Quiz | OpenSourceFeed".
  - Shorten the meta description to 160 characters or fewer (currently ~197).
  - Add `dateModified` to the JSON-LD.
- [x] **P1-2 · M: Add crawlable content to the home page**
  - _Done: How it works, How we score, FAQ (6 questions) and a list of all 50 distros grouped by experience level, linking to OSF pages (or official sites). Per the content boundary, no copied descriptions._
  - Below the quiz: intro, "How it works / methodology", an FAQ with `FAQPage` schema, and a list of all distros linking to their OSF pages.
- [x] **P1-3 · S: Add a footer and fix the logo link**
  - _Done: footer with about links, data-reviewed date, OSF privacy policy, "Report an error" (GitHub issues), cookie settings. Logo opens in the same tab._
  - Footer: about, methodology, last updated, privacy, "Report an error" (GitHub issue), and a link to OpenSourceFeed.
  - The logo link should open in the same tab.
- _P1-4 to P1-6 (hero, layout polish, result cards) have moved into the "Premium look and feel" (LF) and "All screen sizes" (RS) sections below._
- [x] **P1-7 · S: Small quiz fixes**
  - _Done: keyboard hint only on `pointer: fine`; progress = completed / total (0% on Q1). "Not sure" added to device and hardware age; GPU, updates and desktop already had one. Experience and use case have none, as every user can answer them._
  - Hide the keyboard hint on touch devices.
  - Start the progress bar at 0% (answered / total).
  - Add a "Not sure" option to every question.
- [x] **P1-8 · M: Add a "Which device?" question**
  - _Done: first question, hard filter via `platforms` on each distro and `filterPlatform` on each option. "Not sure" = PC. Old six-answer share links still open (read as PC)._
  - Options: x86 PC or laptop, Apple Silicon Mac, Raspberry Pi / ARM, handheld.
  - Use it as a hard filter before scoring.
- [x] **P1-9 · M: Add missing popular distros**
  - _Done: Bazzite, Nobara, Fedora Atomic Desktops, Qubes OS (with caveat), Lubuntu, Linux Lite, Fedora Asahi Remix (Apple Silicon, with caveat). Lubuntu and Linux Lite link to their OSF pages; the rest link to official sites until OSF pages exist._
  - Bazzite, Nobara, Fedora Atomic (Silverblue/Kinoite), Qubes OS, Lubuntu, Linux Lite.
  - Fedora Asahi Remix, if Apple Silicon is supported.
- [x] **P1-10 · S: Fix data modelling issues**
  - _Done: openSUSE Leap is its own entry; Ubuntu GNOME-only and Puppy fix were done in P0-9._
  - Split openSUSE into Leap (stable) and Tumbleweed (rolling).
  - Limit Ubuntu's desktop list to GNOME, since the flavours have their own entries.
  - Remove Puppy's +1 for "<2 years old" hardware.
- [x] **P1-11 · M: Performance**
  - _Done: Zod validates at build time in index.astro, not in the browser (QuizApp bundle 138 KB → 94 KB with more data and UI). ThemeToggle React island replaced by a plain script. Analytics load on idle after consent._
  - Validate the JSON at build time and drop Zod from the client bundle (QuizApp is 138 KB).
  - Use lighter hydration for ThemeToggle.
  - Defer the analytics scripts.

## P1: Premium look and feel (LF)

The UI today is a clean but generic Tailwind look: system fonts, hard-coded `emerald-*` / `gray-*` classes that don't match the brand teal `#2b6765`, two floating pills instead of a header, no logos and no landing state. These items give it a designed, branded feel. LF-1 and LF-2 come first because everything else builds on them.

- [x] **LF-1 · M: Design tokens and brand alignment**
  - _Done in `global.css` (`@theme` brand scale + semantic `canvas/surface/fg/muted/accent/primary` tokens that switch in dark mode). All components use them._
  - Define tokens in `src/styles/global.css` with Tailwind 4 `@theme`: a brand teal scale (50–950) built around `#2b6765`, a neutral surface scale, accent and status colours (success, warning), radii (sm / md / xl), shadows (sm / md / lg) and motion durations.
  - Replace the hard-coded `emerald-*` and `gray-*` classes in `Quiz.tsx`, `ResultsView.tsx`, `QuizApp.tsx`, `ThemeToggle.tsx` and `Layout.astro` with token-based utilities (e.g. `bg-brand-600`, `ring-brand-400`).
  - Check contrast for every text/background pair in light and dark mode (WCAG AA: 4.5:1 for body text, 3:1 for large text and UI). Teal on dark surfaces will need a lighter step.
  - Dark mode: use slightly teal-tinted dark surfaces instead of flat `gray-950`, and show elevation with lighter surfaces rather than shadows alone.
- [x] **LF-2 · S: Typography**
  - _Done: Inter (body) + Space Grotesk (headings), self-hosted via Fontsource, Latin Inter preloaded. Fluid `text-display/h1/h2/h3/lead` scale._
  - Choose a type pairing: a variable sans for body text (e.g. Inter or Geist) and a display face for headings.
  - Self-host WOFF2 files (e.g. via `@fontsource-variable/*`), Latin subset, `font-display: swap`, and preload the main weight. No Google Fonts request.
  - Define a type scale (display, h1–h3, body, small, caption) with fluid `clamp()` sizes and line heights.
  - Use `tabular-nums` for percentages, `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs.
- [x] **LF-3 · M: Sticky header (replaces the floating pills)**
  - _Done: `Header.astro`._
  - One header bar: OSF logo + "Distro Chooser" wordmark on the left, theme toggle on the right, and a "Start over" link while the quiz is in progress.
  - Translucent background with backdrop blur; a bottom border appears once the page scrolls.
  - Remove the `fixed top-4 left-4` logo pill in `Layout.astro`, the `fixed top-4 right-4` button in `ThemeToggle.tsx`, and the `pt-20` offset in `QuizApp.tsx` that exists only to clear them.
  - Style the footer from P1-3 to match the header.
- [x] **LF-4 · M: Landing hero before Q1** _(was P1-4)_
  - _Done. Logo strip uses monogram tiles (see LF-6)._
  - Headline with the value proposition, a one-line subhead, "42 distros · 6 questions · about 60 seconds", a large primary Start button, and a trust line ("Independent · no sign-up · data reviewed <date>").
  - A subtle strip of distro logos (muted, full colour on hover).
  - A light background treatment in pure CSS (soft brand gradient or grid pattern). No large hero images.
- [ ] **LF-5 · M: Quiz screen polish**
  - _Partly done. Done except desktop screenshots: icons + helper text per option, segmented step indicator, new buttons. Real DE screenshots still need sourcing (licence-clean images)._
  - Option cards: one icon per option from a single icon set (inline SVG, e.g. Lucide), a title plus a one-line helper text, and a clear selected state (brand border, tinted background, check badge). Add hover and pressed states.
  - Desktop-environment question: small screenshot thumbnails of each desktop (AVIF/WebP, fixed aspect ratio, lazy loaded). _(Replaces P3-5.)_
  - Progress: a segmented step indicator with step labels on wide screens, a thin bar on phones.
  - Back and Next styled as consistent secondary and primary buttons, with a clearly styled disabled state.
- [ ] **LF-6 · L: Results page v2** _(was P1-6)_
  - _Partly done. Done except logos and some spec fields: hero card + #2/#3 cards + clickable runners-up, spec list (base, package manager, desktops, updates), toast on copy. Logos are monogram tiles until each project's trademark rules are checked. `minRamGB`/`supportPeriod`/`downloadUrl` not added yet: they need sourcing per distro (P2-5)._
  - A hero card for the #1 match: logo, name, match % (ring or bar), a short "why it matched" summary, a spec table (base, package manager, desktop, release model, minimum RAM, support period), and two CTAs: "Read on OpenSourceFeed" (primary) and "Download" (secondary).
  - #2 and #3 as smaller cards; the runners-up as clickable rows with logo and match %.
  - Logos: use official SVGs only where each project's trademark guidelines allow it. Store them as `public/logos/<slug>.svg` in a fixed-size box, with a monogram tile in brand colours as the fallback.
  - Capitalised tags ("Rolling", "Beginner") in one consistent tag style.
  - Garuda, Alpine and Slackware link to their official sites until their OSF pages exist (see P2-1).
  - Keep per-distro text short and original, linking to OSF for details (content boundary, see P2).
  - Share: a "Copied!" toast for the copy-link action, and a preview of the share card once P2-4 lands.
  - Depends on the spec fields from P2-5 (`baseDistro`, `packageManager`, `minRamGB`, `supportPeriod`, `downloadUrl`); pull those fields forward into this sprint.
- [x] **LF-7 · S: Motion and micro-interactions**
  - _Done: shared easing token, staggered reveal, ring/bar count-up, press scale; all transform/opacity; reduced motion respected._
  - Shared easing and duration tokens (about 150 ms for UI feedback, 300 ms for reveals).
  - Staggered results reveal, match bars animating from 0, and a slight press effect on buttons.
  - Animate only `transform` and `opacity` so nothing causes layout shift.
  - Every new animation must respect `prefers-reduced-motion`.
- [x] **LF-8 · S: Brand assets and edge states**
  - _Done: new OG image (`scripts/og-image.html`, `pnpm run og:render`); the old one used the Astro logo. Light/dark `theme-color` + `color-scheme`. Broken `?a=` links show a friendly message._
  - Update the OG image, favicons and `theme-color` to the new palette; add light and dark `theme-color` variants with `media` queries and set `color-scheme`.
  - Design the edge states: an invalid or outdated `?a=` share link should show a friendly message with a "Start the quiz" button, not a blank or broken page.

## P1: All screen sizes (RS)

The base is mobile-first and already uses 44 px touch targets. The gaps are the page shell (`min-h-screen` + vertical centring), floating elements that overlap content on short screens, a large fixed H1 on small phones, the orphaned third result card at `md`, and no testing beyond ad-hoc checks.

- [x] **RS-1 · S: Viewport and page shell**
  - _Done: `min-h-dvh` body, top-aligned content, `viewport-fit=cover` + safe-area padding, wider quiz with 2-column options, no sideways scroll at 320 px (tested)._
  - In `src/pages/index.astro`, replace `min-h-screen ... justify-center` on `<main>` with `min-h-dvh` (keeping `min-h-screen` as a fallback). Only centre vertically on tall viewports, so content isn't cut off or jumping on short ones.
  - Add `viewport-fit=cover` to the viewport meta and `env(safe-area-inset-*)` padding to the header, footer and any sticky bar.
  - Container widths: widen the quiz from `max-w-lg` to `max-w-2xl` at `lg`, with options in two columns where labels are short. Results go up to `max-w-6xl`, with extra side padding at 1440 px and above. Cap prose at about 65–75 characters per line.
  - No horizontal scrolling at 320 px: add `min-w-0` and `break-words` where long distro names or URLs sit in flex items.
- [x] **RS-2 · S: Fluid typography and spacing**
  - _Done (clamp scale, rem units). 200% zoom still to check by hand._
  - The H1 is `text-4xl md:text-5xl` (36 px on a 320 px screen). Switch to the `clamp()` scale from LF-2 and use fluid section spacing.
  - Use `rem` units throughout; check the layout at 200% zoom and with a larger browser font size.
- [x] **RS-3 · M: Mobile quiz ergonomics**
  - _Done: sticky bottom Back/Next bar on phones. Tailwind 4 `hover:` already only applies on hover-capable devices._
  - On phones, put Back / Next in a sticky bottom action bar within thumb reach (with safe-area padding). Keep them inline from `sm` up.
  - Keep touch targets at 44 × 44 px or larger, with at least 8 px between them.
  - Wrap hover styles in `@media (hover: hover)` so hover and selected states don't get stuck on touch screens.
  - The keyboard-hint fix stays in P1-7.
- [x] **RS-4 · S: Results layout per breakpoint**
  - _Done._
  - `md:grid-cols-2 lg:grid-cols-3` leaves the third card on its own row at `md`. Use instead: one column on phones; at `md` the hero card full width with #2 and #3 side by side below; at `xl` the hero on the left with #2 and #3 stacked on the right.
  - Equal card heights per row, with CTAs pinned to the bottom of each card.
  - The spec table turns into a stacked list on narrow screens.
- [ ] **RS-5 · S: Landscape phones, tablets and large screens**
  - _Partly done. Landscape 667×375 / 844×390 and 1920 px pass the automated checks. Container queries not used yet; cards use `auto-fill` grids instead._
  - Landscape phones (about 360–430 px tall): the header compacts, and the question, its options and the Next button all fit without hidden controls.
  - Tablets and iPad split view (about 500–900 px wide): use container queries (`@container`) on cards so they adapt to the width of their column, not the viewport.
  - 1920 px and wider: sensible max widths and larger spacing, with no stretched lines or tiny centred islands.
- [ ] **RS-6 · S: Responsive media**
  - _Partly done. No raster images on the page besides the 32 px logo; revisit when screenshots/logos land._
  - Logos as SVG. Screenshots through Astro's `<Picture>` with AVIF/WebP, `srcset`/`sizes`, 2× assets for high-DPI screens, explicit `width`/`height` to avoid layout shift, and `loading="lazy"` below the fold.
- [ ] **RS-7 · M: Test matrix and visual regression** _(replaces P3-4)_
  - _Partly done. Done: Playwright (`pnpm run test:e2e`) at 10 screen sizes × light/dark: no sideways scroll, key elements visible, screenshots saved to `test-results/`; plus quiz-flow, old-link, broken-link, consent and theme tests. Not done: pixel-diff baselines, real-device checks, Lighthouse CI._
  - Playwright snapshots of the landing state, one question and the results page at 320, 375, 414, 768, 1024, 1280, 1440 and 1920 px, plus landscape 667 × 375 and 844 × 390, in both light and dark mode.
  - Manual checks on iOS Safari (dynamic toolbar, safe areas), Android Chrome and desktop Firefox, at 200% zoom and with reduced motion enabled.
  - Lighthouse CI on mobile settings: performance ≥ 90, accessibility = 100, CLS < 0.1.

## P2: Growth and programmatic SEO

> **Guard rails (enforced by `src/content/guides.test.ts`):** OSF-covered topics/pairs are blocked; minimum original text per page (800 words best-for, 550 compare); no distro description copied into guide text; internal links must resolve.
>
> **Content boundary (applies to every P2 page):** the OSF `/distribution/<slug>` pages are the only distro profile pages. The chooser publishes decision content (rankings, fit, trade-offs) and links to OSF for "what is X". No copied descriptions, no competing profile URLs. See ANALYSIS.md §5.1.

- [ ] **P2-1 · M: Feed chooser data into the OSF distribution pages (no new profile pages)**
  - Do **not** build `/distro-chooser/distro/<slug>/`; it would duplicate and compete with `/distribution/<slug>`.
  - Expose spec data from `distros.json` (base, package manager, release model, min RAM) for use on the OSF pages, and add a "Is X right for you? Take the quiz" CTA there.
  - Create OSF pages for Garuda, Alpine and Slackware instead of covering them in the chooser.
- [x] **P2-2 · L: "Best Linux distro for …" landing pages**
  - One page each for beginners, gaming, old laptops, programming, privacy, AI/ML and Windows switchers, with `ItemList` schema pointing at the OSF distribution URLs.
  - Per-distro text is a short, original "why it fits this need" note plus a link to the OSF page.
  - First check whether OSF already has a "best distro for …" article for that need; if so, improve and link that article instead.
  - _Done 2026-11-09: 5 guides at /best-for/ (beginners, gaming, programming, privacy, Windows switchers) + hub. Skipped old PCs and local AI/LLM because OSF already has articles for them (the hub links to those). Picks are hand-written and a test checks they agree with the quiz scoring._
- [x] **P2-3 · L: "X vs Y" comparison pages**
  - The top 15–20 pairs, e.g. Ubuntu vs Mint, Fedora vs Ubuntu, Arch vs EndeavourOS.
  - Focus on the trade-offs between the two; link to each OSF page rather than repeating its overview.
  - Skip any pair OSF already covers in an article.
  - _Done 2026-11-09: 10 comparisons at /compare/ + hub. Skipped Ubuntu vs Fedora because OSF has an article (linked from the hub and related links). Results page links a comparison when two of the top three have one._
- [ ] **P2-4 · M: Per-distro share pages**
  - Static share pages with generated OG images ("My Linux match: Fedora"). The Share button links to them.
  - `noindex`, with a canonical to the OSF `/distribution/<slug>` page, so they never compete in search.
- [ ] **P2-5 · M: Extend the distro schema**
  - Add `baseDistro`, `packageManager`, `architectures`, `minRamGB`, `initSystem`, `immutable`, `supportPeriod`, `latestVersion`, `officialUrl`, `downloadUrl` and `status`.
  - Change NVIDIA support to three levels: `out-of-box | easy | manual`.
- [ ] **P2-6 · L: Derive weights from metadata**
  - Generate most weights from the distro metadata (one source of truth) and keep hand-tuned overrides.
  - Add a weight-coverage report to CI.
- [ ] **P2-7 · M: More questions**
  - Coming from (Windows / macOS / Linux), RAM amount, gaming detail (Proton / anti-cheat / handheld), software freedom, immutable systems.
- [ ] **P2-8 · M: Richer results page**
  - A "Try it safely" panel (live USB, VM, dual boot guides).
  - A side-by-side comparison of the top 3.
  - "Why not X?" for popular distros that were left out.
- [ ] **P2-9 · S: Measure what works**
  - A 👍/👎 feedback event on each result.
  - Funnel tracking: quiz start → complete → outbound click.
- [ ] **P2-10 · S: CI freshness check**
  - Warn when any `lastVerifiedDate` is older than 180 days.

## P3: Nice to have

- [ ] **P3-1 · M:** Save in-progress answers in `sessionStorage`
- [ ] **P3-2 · M:** Embeddable widget / iframe for other blogs (backlinks)
- [ ] **P3-3 · L:** Translations (DE, ES, PT-BR, FR)
- _P3-4 (visual regression tests) moved to RS-7; P3-5 (option illustrations) moved to LF-5._
- [ ] **P3-6 · S:** "Email me my results" / newsletter signup
- [ ] **P3-7 · S:** Accessibility polish
  - Add a `role="radiogroup"` wrapper.
  - Remove `aria-label` values that repeat the visible text.
  - Add an axe check to CI.

---

## Suggested order

1. **Sprint 1:** P0-1 → P0-9 (trust and correctness first; most items are S)
2. **Sprint 2:** P1-1, P1-2, P1-3, P1-7, P1-10, P1-11 (fast SEO and UX wins)
3. **Sprint 3:** LF-1, LF-2, LF-3, RS-1, RS-2, P1-8, P1-9 (design foundation, page shell and better recommendations)
4. **Sprint 4:** LF-4 → LF-8 and RS-3 → RS-7, with the P2-5 spec fields pulled forward for LF-6 (premium screens, verified on every screen size)
5. **Then:** P2 in the order listed, with P3 as capacity allows
