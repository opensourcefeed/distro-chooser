# Distro Chooser — Analysis

_Analysis date: 2026-11-09 · Scope: `distro-chooser-src` (Astro source) and `distro-chooser` (gh-pages build output) · Live URL: https://www.opensourcefeed.org/distro-chooser/_

---

## 1. Current state at a glance

| Area | Status |
|---|---|
| Stack | Astro 7 (static) + React 19 islands + Tailwind 4 + Zod 4, Vitest tests |
| Pages | **1** indexable URL (`/distro-chooser/`); results live behind `?a=` query param |
| Content | 6 questions, 42 distros, ~550 hand-written score weights |
| Data/weights consistency | Good: DE, NVIDIA, release model and experience flags match the weights (only Kali has `nvidiaFriendly: true` with no NVIDIA weight) |
| Client JS | ~330 KB raw (React runtime 184 KB + QuizApp 138 KB, which bundles Zod + both JSON files) |
| Analytics | GA4 + Ahrefs, loaded with no consent banner |
| CI | README describes `.github/workflows/ci.yml`, but the file does **not** exist in the source repo |
| Deploy | `scripts/deploy.sh` runs `cp -r dist/. ../distro-chooser` (no clean step, so stale assets pile up; `_astro/index.hKaFSz6u.css` is already orphaned), and it pushes both repos without running tests |

### Persona simulation (current scoring)

| Persona | Top results (match %) | Problem |
|---|---|---|
| Beginner, everyday use, 10+ yr PC, no NVIDIA, stable | **Raspberry Pi OS (42%)**, Mint, MX, Xubuntu… | #1 pick is an ARM OS for Raspberry Pi boards. The x86 "Pi Desktop" build is discontinued |
| Beginner gamer, new PC, NVIDIA, KDE | Ubuntu, Pop!_OS, **CachyOS, Garuda** (31%) | Intermediate Arch-based distros tie with beginner picks. Bazzite/Nobara are not in the dataset |
| Beginner, privacy, GNOME | Ubuntu, Debian, Solus, PureOS, **Tails** (28–31%) | Tails is an amnesic live OS, not a daily-driver install |
| Advanced, privacy, rolling, XFCE | Arch, **Kali (28%)**, Gentoo | Kali gets +3 for "Privacy". Kali's own docs say it is not a general-purpose or privacy OS |
| Any persona | Top match usually **28–45%** ("Fair match") | Max score sums *every* multi-select option, so a typical user can never get near 100%. This erodes trust |

---

## 2. Potential

- **High-intent search demand**: "best linux distro for beginners / gaming / old laptop / programming 2026" and "which linux distro should I use" are evergreen, high-volume queries. Windows 10 end-of-support (Oct 2025) is still pushing Windows switchers toward Linux.
- **Funnel for opensourcefeed.org**: every result links to `/distribution/<slug>`. This tool can be the site's top acquisition page and its strongest internal-linking hub.
- **Shareable/viral loop**: "My Linux distro is X" result cards suit Reddit, Mastodon and X if each result has its own URL and OG image.
- **Data asset**: the structured distro dataset (42 distros, typed schema) can drive "best for X" landing pages and "X vs Y" comparison pages with little extra effort, and can feed spec data back into the existing OSF `/distribution/<slug>` pages. It should not be used to publish a second set of distro profiles (see 5.1, "Content boundary").
- **Low running cost**: fully static on GitHub Pages, so it scales for free.

---

## 3. SWOT

| **Strengths** | **Weaknesses** |
|---|---|
| Clean, modern stack; fast static output | Only one indexable page with almost no crawlable text |
| Typed Zod schemas + validation scripts + unit tests for scoring | Factual and recommendation errors (Raspberry Pi OS, Kali, Tails, SteamOS) |
| Good accessibility base: roving tabindex, focus management, 44px targets, reduced-motion support, dark mode | Match % is mathematically deflated (top picks show "Fair match") |
| Explainable results ("How your answers matched") | "Content depth" multiplier is meaningless: all 5 link fields point at the same URL, so 39/42 distros get ×1.15 and Garuda, Alpine and Slackware are penalized. Users also see an internal "+15% depth" badge |
| Shareable result URLs without a backend | Generic look: no logos, no hero, no footer, no methodology. Teal brand `#2b6765` vs emerald UI |
| Good SEO basics: canonical, OG/Twitter, JSON-LD, sitemap, robots | Thin dataset: no architecture, base, package manager, min RAM, download URL, version or logo |
| | Missing CI, unsafe deploy script, `lastVerifiedDate` is a placeholder (31 distros say `2026-08-01`) |
| **Opportunities** | **Threats** |
| Programmatic SEO: "best for X" pages, comparisons, FAQ rich results | Established competitors (distrochooser.de, DistroWatch, many listicles) already rank |
| | Keyword cannibalization: new distro-level pages would compete with OSF's own `/distribution/<slug>` pages |
| Windows 10 refugees, Steam Deck/handheld gamers, AI/ML on Linux | Stale data damages credibility quickly (distros release every 6 months; some die) |
| Per-result OG images → social virality | Wrong advice (Kali for privacy, Pi OS on a PC) leads to bad user experiences and negative word of mouth |
| Embeddable widget for other blogs (backlinks) | GDPR/ePrivacy exposure from GA4 + Ahrefs without consent |
| Newsletter / "send me my results" capture | Google sees one thin JS-heavy page and treats it as a "tool page" with little ranking content |
| i18n (DE, ES, PT-BR, FR have large Linux audiences) | Hand-maintained ~550 weights become unmaintainable as the distro count grows |

---

## 4. Quick wins (≤ 1 day each, high impact)

1. **Fix Raspberry Pi OS**: remove it from x86 "old hardware" and "everyday" scoring (or add a hardware-platform question and filter on it). Fix `desktopEnvironments` (it ships the labwc-based PIXEL desktop, not LXDE/XFCE).
2. **Fix Kali**: set the privacy weight to ≤0, give it an explicit "penetration testing" use case, add a note that it is not a daily driver, and remove `nvidiaFriendly` or add the matching weight.
3. **Caveat Tails** ("live USB only, not installed") and **SteamOS** (officially supported only on Steam Deck and select handhelds).
4. **Fix match %**: normalize against the best score achievable *for the user's answers* (for example, top-1 = the reference, or per-question max over the selected options only), and clamp to 0–100.
5. **Remove the content-depth multiplier** and the "+N% depth" badge, or base them on real distinct content.
6. **Remove the duplicate link fields** that all point to `pageUrl`, until real install guide and release URLs exist.
7. **Shorten the title to 60 characters or fewer** (it is currently 70), e.g. "Which Linux Distro Should I Use? Free Quiz | OpenSourceFeed". **Shorten the meta description to 160 characters or fewer** (it is currently ~197).
8. **Add crawlable content under the quiz**: an intro, "How it works / methodology", an FAQ (with `FAQPage` JSON-LD), and an "All 42 distros we consider" list linking to the OSF pages.
9. **Add a footer**: about, methodology, last-updated date, privacy, a link back to OpenSourceFeed, and a GitHub/"suggest a correction" link.
10. **Open the logo link in the same tab** (drop `target="_blank"`) so users flow into the main site.
11. **Hide the keyboard hint on touch devices** (`hidden pointer-fine:inline` / `@media (pointer: fine)`).
12. **Progress bar**: show 0% on Q1, i.e. answered/total, not (index+1)/total.
13. **Fix deploy**: `rsync -a --delete --exclude .git dist/ ../distro-chooser/`, run `validate:all && test && astro check` before deploying, and don't `git add -A` in the source repo automatically.
14. **Restore CI** (`.github/workflows/ci.yml`) or fix the README claim.
15. **Capitalize tags** ("Rolling", "Beginner") and show the release model in readable form.
16. **Add download/website links** to the result cards for distros that have no OSF page (Garuda, Alpine and Slackware currently show no link at all).

---

## 5. Gap analysis by goal

### 5.1 SEO-friendly
- **Content boundary: do not duplicate the OSF distribution pages.** opensourcefeed.org already has a `/distribution/<slug>` page for most distros. Those pages stay the single canonical home for "what is distro X" content (overview, features, install guide, releases). The chooser must not publish its own distro profile pages or copy those descriptions, or the two will compete for the same queries and Google may pick the wrong one or treat both as thin/duplicate.
  - The chooser owns **decision content**: which distro fits which person, ranked lists by need, head-to-head trade-offs and the methodology behind the scores.
  - Per-distro text in the chooser stays short (one or two sentences on *why it matched*), written separately from the OSF page text, and always links to the OSF page for details.
  - Spec data from `distros.json` (base, package manager, release model, min RAM) can be fed into the OSF pages instead of building new ones.
  - Distros with no OSF page (Garuda, Alpine, Slackware) get an OSF page first, or link to the official site; the chooser does not fill the gap with its own profile.
  - Before building any new page type, check that OSF doesn't already cover the same query (for example existing "best distro for …" or "X vs Y" articles). If it does, link to or improve that article rather than adding a second one.
- **One URL = one ranking opportunity.** Generate static pages from `distros.json`, within the boundary above:
  - `/distro-chooser/best-for/<use-case>/` landing pages (beginners, gaming, old laptops, programming, privacy, AI/ML, Windows switchers), each with a pre-filtered ranked list, short "why it fits" notes linking to the OSF pages, and a quiz CTA.
  - `/distro-chooser/compare/<a>-vs-<b>/` for top pairs (Ubuntu vs Mint, Fedora vs Ubuntu, Arch vs EndeavourOS, Pop!_OS vs Mint…), focused on the trade-offs between the two rather than re-describing each distro. Only where OSF has no comparison article for that pair.
  - Static `/distro-chooser/result/<slug>/` share pages, `noindex` with a canonical to the OSF `/distribution/<slug>` page, carrying per-distro OG images.
- On-page: 300–800 words of real explanatory content on the home page, FAQ, visible "Last updated" date, author/publisher byline (E-E-A-T), breadcrumbs.
- Structured data: `FAQPage`, `BreadcrumbList`, `ItemList` on "best-for" pages (items pointing to the OSF distribution URLs); leave `SoftwareApplication` markup to the OSF distribution pages; add `dateModified` to `WebApplication`.
- Sitemap: include all generated pages with `lastmod`.
- Internal links: OSF distribution pages ↔ quiz ↔ best-for pages. Add quiz CTAs inside OSF articles.
- Performance (Core Web Vitals): validate data at build time and drop Zod from the client bundle; consider `client:idle` for ThemeToggle or a vanilla script; consider Preact compat; self-host or defer analytics.

### 5.2 Premium look & feel
- Design system: align the palette with the brand teal (`#2b6765`), define tokens, pick a distinctive type pairing (e.g. Inter/Geist + a display face), and use consistent radii and shadows.
- **Landing/hero state** before Q1: value prop, "42 distros · 6 questions · 60 seconds", trust line, Start button, distro logo strip.
- **Distro logos** on result cards (official SVGs where license permits) plus a screenshot thumbnail of the default desktop.
- Option cards with icons/illustrations (DE previews for the desktop question, hardware icons, etc.).
- Results: a hero card for #1 with a spec table (base, package manager, DE, release model, min RAM, support length), pros/cons, and "Download" + "Read guide" CTAs. The runners-up should be clickable cards, not plain text.
- A consistent header (logo + theme toggle in one bar) instead of two floating pills. Add a footer.
- Micro-interactions: subtle option selection feedback, an animated results reveal, a skeleton for the share image.

### 5.3 Factually correct
- Audit all 42 entries against official sources. Add `officialUrl`, `downloadUrl`, `baseDistro`, `packageManager`, `architectures`, `minRamGB`, `initSystem`, `immutable`, `supportPeriod`, `latestVersion`, `secureBoot`, `status` (active/discontinued).
- Known items to correct or review:
  - Raspberry Pi OS: ARM-only, default desktop is PIXEL on labwc (Wayland), not for x86 PCs.
  - Kali: not for privacy or daily use. Tails: live-only. SteamOS: limited official hardware support.
  - openSUSE: one entry can't be both Leap (stable) and Tumbleweed (rolling). Split it into two entries.
  - Ubuntu entry lists every flavor's DE while Kubuntu/Xubuntu/etc. also exist. Restrict Ubuntu to GNOME.
  - Solus also ships an XFCE edition. Puppy "advanced" and Manjaro "beginner" are debatable. Garuda "privacy" use case is unsupported. Puppy gets a +1 for "<2 years old" hardware.
  - Fedora/Debian "NVIDIA-friendly" needs nuance (requires RPM Fusion / non-free). Consider a 3-level value: `out-of-box | easy | manual`.
  - Descriptions: avoid marketing claims ("industry-standard", "privacy-respecting" for elementary OS) unless sourced.
- Missing popular distros (2026): **Bazzite, Nobara, Fedora Atomic (Silverblue/Kinoite), Bluefin/Aurora, Qubes OS, Lubuntu, Linux Lite, AlmaLinux/Rocky (if servers are in scope), Asahi/Fedora Asahi Remix (Apple Silicon), Ubuntu Studio, Ultramarine**.
- Process: a real `lastVerifiedDate` per entry, a visible "Data last reviewed" date, a quarterly review checklist, a "Report an error" link (GitHub issue template), and a CI check that flags entries not verified in more than 180 days.

### 5.4 Useful for users
- Better questions:
  - "Which device?" (PC/laptop x86, Apple Silicon Mac, Raspberry Pi/ARM, handheld) → **hard filter**.
  - "Coming from?" (Windows / macOS / another Linux) → look-and-feel affinity.
  - RAM amount instead of / in addition to hardware age (more objective).
  - Gaming detail (Steam/Proton, anti-cheat titles, handheld).
  - Software freedom vs proprietary drivers/codecs out of the box.
  - Immutable/atomic system preference; "I want an install-and-forget system".
  - Optional "Advanced filters" (init system, package format, Secure Boot).
- Scoring model: hard filters + derived weights from metadata (one source of truth) + hand-tuned overrides. A meaningful match % with a calibrated confidence label. Deterministic tie-break.
- Results: "Why not X?" for popular distros that were excluded, a "try it safely" box (live USB, VM, dual boot) linking to OSF guides, a side-by-side compare of the top 3, and printable/saveable results.
- Persist in-progress answers in `sessionStorage`. Add a "Skip / not sure" option on every question.
- Feedback loop: "Was this helpful? 👍/👎" per result to tune weights (privacy-respecting analytics event).

### 5.5 Adaptive to all screen sizes
- Current base is OK (mobile-first, grid 1→2→3). Gaps:
  - Floating logo/theme pills overlap content on short or landscape phones. Use a proper sticky header.
  - `text-4xl` H1 is large on 320 px screens. Use `clamp()` fluid typography.
  - Results grid at `md` (2 columns) leaves an orphan third card. Use a 1-column hero + 2-column layout, or 3 columns only at `lg`.
  - Add `100dvh` handling (avoid `min-h-screen` jump on mobile browsers), `safe-area-inset` padding for notched devices, and large-screen max widths for 1440p+.
  - Test matrix: 320, 375, 414, 768, 1024, 1280, 1920 px, landscape phones, iPad split view; add Playwright visual snapshots.

---

## 6. Prioritized TODO

See [TODO.md](TODO.md).
