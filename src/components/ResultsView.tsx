import { useEffect, useState } from "react";
import type { ScoredDistro, Answers, Question } from "../lib/scoring";
import { getMatchPercent, getMaxPossibleScore, getWhyRecommended } from "../lib/scoring";
import { generateExplanation } from "../lib/explain";
import { distros as allDistros, RELEASE_MODEL_LABELS, capitalize } from "../lib/data";
import type { Distro } from "../schemas/distro";
import DistroMark from "./DistroMark";
import { Icon } from "./icons";
import { findComparisonSlug } from "../lib/guide-links";

interface ResultsViewProps {
  results: ScoredDistro[];
  answers: Answers;
  questions: Question[];
  onEditAnswers: () => void;
  onStartOver: () => void;
}

type Reason = { question: string; answer: string; weight: number };

// ── Helpers ────────────────────────────────────────────────────────────────

function getConfidenceLabel(percent: number): string {
  if (percent >= 85) return "Excellent match";
  if (percent >= 70) return "Great match";
  if (percent >= 50) return "Good match";
  return "Fair match";
}

function primaryLink(distro: Distro): { href: string; label: string; external: boolean } {
  return distro.links.pageUrl
    ? { href: distro.links.pageUrl, label: `Read the ${distro.name} guide`, external: false }
    : { href: distro.links.officialUrl, label: `Visit the ${distro.name} website`, external: true };
}

/** Animated count-up for the match percentage (instant with reduced motion). */
function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let frame: number;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);
  return value;
}

// ── Small pieces ───────────────────────────────────────────────────────────

function MatchRing({ percent }: { percent: number }) {
  const value = useCountUp(percent);
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0" role="img" aria-label={`${percent}% match`}>
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" className="stroke-surface-2" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          className="stroke-brand-500"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-2xl font-semibold tabular-nums" aria-hidden="true">
        {value}%
      </span>
    </div>
  );
}

function MatchBar({ percent }: { percent: number }) {
  const value = useCountUp(percent);
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-muted">{getConfidenceLabel(percent)}</span>
        <span className="font-display text-lg font-semibold tabular-nums text-fg" aria-hidden="true">{value}%</span>
        <span className="sr-only">{percent}% match</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Tags({ distro }: { distro: Distro }) {
  const tags = [RELEASE_MODEL_LABELS[distro.releaseModel] ?? capitalize(distro.releaseModel), capitalize(distro.experienceLevel)];
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Key facts">
      {tags.map((t) => (
        <li key={t} className="rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
          {t}
        </li>
      ))}
      {distro.nvidiaFriendly && (
        <li className="rounded-full border border-brand-200 bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent dark:border-brand-800">
          Easy NVIDIA setup
        </li>
      )}
    </ul>
  );
}

function Caveat({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-warn-200 bg-warn-50 px-3.5 py-3 text-sm text-warn-900 dark:border-warn-700/50 dark:bg-warn-900/30 dark:text-warn-200">
      <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="leading-relaxed">
        <span className="sr-only">Note: </span>
        {text}
      </p>
    </div>
  );
}

function CtaLinks({ distro, size = "md" }: { distro: Distro; size?: "md" | "lg" }) {
  const primary = primaryLink(distro);
  const height = size === "lg" ? "min-h-12" : "min-h-11";
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <a
        href={primary.href}
        rel={primary.external ? "noopener" : undefined}
        className={`inline-flex ${height} flex-1 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-primary px-4 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-ring`}
      >
        <Icon name={primary.external ? "external" : "book"} className="h-4 w-4" />
        <span className="truncate">{primary.label}</span>
      </a>
      {distro.links.pageUrl && (
        <a
          href={distro.links.officialUrl}
          rel="noopener"
          className={`inline-flex ${height} items-center justify-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-ring`}
        >
          <Icon name="external" className="h-4 w-4" />
          Official site
          <span className="sr-only">for {distro.name}</span>
        </a>
      )}
    </div>
  );
}

function ReasonsList({ reasons }: { reasons: Reason[] }) {
  if (reasons.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">How your answers matched</h4>
      <ul className="mt-2 space-y-1.5">
        {reasons.map((reason, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" strokeWidth={2.5} />
            <span>
              <span className="text-muted">{reason.question} </span>
              <span className="font-medium text-fg">{reason.answer}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Cards ──────────────────────────────────────────────────────────────────

function HeroCard({ scored, percent, reasons }: { scored: ScoredDistro; percent: number; reasons: Reason[] }) {
  const d = scored.distro;
  const specs: [string, string][] = [
    ["Based on", d.baseDistro],
    ["Package manager", d.packageManager],
    ["Desktops", d.desktopEnvironments.slice(0, 4).join(", ") + (d.desktopEnvironments.length > 4 ? " and more" : "")],
    ["Updates", RELEASE_MODEL_LABELS[d.releaseModel] ?? d.releaseModel],
  ];

  return (
    <article
      className="animate-fade-in-up relative flex flex-col gap-6 overflow-hidden rounded-[var(--radius-card)] border border-brand-300/60 bg-surface p-5 shadow-[var(--shadow-lift)] sm:p-7 md:col-span-2 xl:col-span-1 xl:row-span-2 dark:border-brand-800"
      aria-labelledby={`result-${d.id}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-accent-soft to-transparent" aria-hidden="true" />

      <div className="relative flex items-start gap-4">
        <DistroMark id={d.id} name={d.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-on-primary">
            <Icon name="trophy" className="h-3.5 w-3.5" />
            Best match
          </p>
          <h3 id={`result-${d.id}`} className="mt-2 text-h2 font-semibold tracking-tight break-words">
            {d.name}
          </h3>
          <p className="mt-1 hidden text-sm font-medium text-accent sm:block">{getConfidenceLabel(percent)}</p>
        </div>
        <div className="hidden sm:block">
          <MatchRing percent={percent} />
        </div>
      </div>

      <div className="relative sm:hidden">
        <MatchBar percent={percent} />
      </div>

      <p className="relative text-muted">{d.description}</p>

      {reasons.length > 0 && (
        <p className="relative rounded-xl bg-accent-soft px-4 py-3 text-sm leading-relaxed text-fg">{generateExplanation(d.name, reasons)}</p>
      )}

      {d.caveat && <Caveat text={d.caveat} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm min-[420px]:grid-cols-2 lg:grid-cols-1">
          {specs.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{k}</dt>
              <dd className="mt-0.5 break-words font-medium text-fg">{v}</dd>
            </div>
          ))}
        </dl>
        <ReasonsList reasons={reasons} />
      </div>

      <div className="mt-auto">
        <CtaLinks distro={d} size="lg" />
      </div>
    </article>
  );
}

function RunnerCard({
  scored,
  rank,
  percent,
  reasons,
}: {
  scored: ScoredDistro;
  rank: number;
  percent: number;
  reasons: Reason[];
}) {
  const d = scored.distro;
  return (
    <article
      className="animate-fade-in-up flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]"
      style={{ animationDelay: `${rank * 90}ms` }}
      aria-labelledby={`result-${d.id}`}
    >
      <div className="flex items-center gap-3">
        <DistroMark id={d.id} name={d.name} />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">#{rank}</p>
          <h3 id={`result-${d.id}`} className="text-h3 font-semibold tracking-tight break-words">
            {d.name}
          </h3>
        </div>
      </div>
      <MatchBar percent={percent} />
      <p className="text-sm text-muted line-clamp-3">{d.description}</p>
      {reasons.length > 0 && <p className="text-sm text-fg">{generateExplanation(d.name, reasons)}</p>}
      {d.caveat && <Caveat text={d.caveat} />}
      <Tags distro={d} />
      <div className="mt-auto pt-1">
        <CtaLinks distro={d} />
      </div>
    </article>
  );
}

// ── Share ──────────────────────────────────────────────────────────────────

function ShareButton({ topName }: { topName?: string }) {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleShare() {
    const url = window.location.href;
    const text = topName ? `My best Linux match is ${topName}. Find yours:` : "Find the Linux distribution that fits you:";
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Linux distro match | Distro Chooser", text, url });
      } catch {
        // User cancelled the native share sheet.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast("Link copied to clipboard");
    } catch {
      setToast("Couldn't copy. You can copy the link from the address bar.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-primary px-6 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-ring"
      >
        <Icon name="share" className="h-4 w-4" />
        Share my results
      </button>
      <div aria-live="polite" className="contents">
        {toast && (
          <div className="animate-toast-in fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-50 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-fg px-4 py-2.5 text-sm font-medium text-canvas shadow-[var(--shadow-lift)]">
            <Icon name="check" className="h-4 w-4" />
            {toast}
          </div>
        )}
      </div>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * Top match as a hero card, #2 and #3 as smaller cards, then up to five
 * clickable runners-up and the share / edit / start-over actions.
 *
 * Layout: one column on phones; from md the hero spans the full width with
 * #2 and #3 side by side below; from xl the hero sits on the left with #2
 * and #3 stacked on the right.
 */
export default function ResultsView({ results, answers, questions, onEditAnswers, onStartOver }: ResultsViewProps) {
  const [hero, ...rest] = results;
  const runners = rest.slice(0, 2);
  const more = rest.slice(2, 7);
  const [showMore, setShowMore] = useState(false);

  const maxScore = getMaxPossibleScore(questions, answers, allDistros);
  const pct = (s: ScoredDistro) => getMatchPercent(s.score, maxScore);
  const why = (s: ScoredDistro) => getWhyRecommended(s.distro.id, answers, questions);

  // Link a head-to-head comparison if any two of the top three have one.
  const top3 = results.slice(0, 3);
  const comparison = [
    [0, 1],
    [0, 2],
    [1, 2],
  ]
    .map(([i, j]) => top3[i] && top3[j] && { slug: findComparisonSlug(top3[i].distro.id, top3[j].distro.id), a: top3[i].distro.name, b: top3[j].distro.name })
    .find((c) => c && c.slug) as { slug: string; a: string; b: string } | undefined;

  if (!hero) {
    return (
      <div className="mt-10 rounded-[var(--radius-card)] border border-line bg-surface p-6">
        <p className="text-fg">No distribution in our list supports that device yet.</p>
        <button type="button" onClick={onEditAnswers} className="mt-4 inline-flex min-h-11 items-center gap-2 font-medium text-accent underline underline-offset-4 focus-ring rounded">
          Change my answers
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 sm:mt-10">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <HeroCard scored={hero} percent={pct(hero)} reasons={why(hero)} />
        {runners.map((s, i) => (
          <RunnerCard key={s.distro.id} scored={s} rank={i + 2} percent={pct(s)} reasons={why(s)} />
        ))}
      </div>

      {comparison && (
        <a
          href={`/distro-chooser/compare/${comparison.slug}/`}
          className="mt-6 flex min-h-14 items-center justify-between gap-3 rounded-[var(--radius-control)] border border-line bg-surface px-4 py-3 transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-[var(--shadow-card)] focus-ring"
        >
          <span>
            <span className="block text-sm text-muted">Torn between your top picks?</span>
            <span className="block font-semibold text-fg">
              Read our {comparison.a} vs {comparison.b} comparison
            </span>
          </span>
          <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-muted" />
        </a>
      )}

      {more.length > 0 && (
        <div className="mt-10">
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            aria-expanded={showMore}
            aria-controls="more-matches"
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] px-1 font-semibold text-fg hover:text-accent focus-ring"
          >
            <Icon name="chevron-down" className={`h-5 w-5 transition-transform ${showMore ? "rotate-180" : ""}`} />
            {showMore ? "Hide other close matches" : `Show ${more.length} more close matches`}
          </button>
          {showMore && (
            <ol id="more-matches" start={4} className="animate-fade-in-up mt-4 grid gap-2 md:grid-cols-2">
              {more.map((s, i) => {
                const link = primaryLink(s.distro);
                return (
                  <li key={s.distro.id}>
                    <a
                      href={link.href}
                      rel={link.external ? "noopener" : undefined}
                      className="flex min-h-16 items-center gap-3 rounded-[var(--radius-control)] border border-line bg-surface p-3 transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-[var(--shadow-card)] focus-ring"
                    >
                      <span className="w-6 text-center text-sm font-semibold text-muted tabular-nums">{i + 4}</span>
                      <DistroMark id={s.distro.id} name={s.distro.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-fg">{s.distro.name}</span>
                        {s.distro.caveat && <span className="block truncate text-xs text-warn-700 dark:text-warn-200">Has a caveat: check before installing</span>}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-fg">{pct(s)}%</span>
                      <Icon name={link.external ? "external" : "arrow-right"} className="h-4 w-4 text-muted" />
                    </a>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}

      <div className="mt-12 flex flex-col items-stretch gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-center">
        <ShareButton topName={hero.distro.name} />
        <button
          type="button"
          onClick={onEditAnswers}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface px-6 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-ring"
        >
          <Icon name="edit" className="h-4 w-4" />
          Edit my answers
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 text-sm font-medium text-muted transition-colors hover:text-fg focus-ring"
        >
          <Icon name="rotate" className="h-4 w-4" />
          Start over
        </button>
      </div>
    </div>
  );
}
