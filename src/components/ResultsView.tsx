import { useEffect, useRef, useState } from "react";
import type { ScoredDistro } from "../lib/scoring";
import { getMaxPossibleScore, getWhyRecommended } from "../lib/scoring";
import type { Answers, Question } from "../lib/scoring";
import { generateExplanation } from "../lib/explain";

interface ResultsViewProps {
  results: ScoredDistro[];
  answers: Answers;
  questions: Question[];
  onEditAnswers: () => void;
  onStartOver: () => void;
}

// ── Match confidence tiers ──────────────────────────────────────────────────

function getConfidenceLabel(percent: number): string {
  if (percent >= 85) return "Excellent match";
  if (percent >= 70) return "Great match";
  if (percent >= 50) return "Good match";
  return "Fair match";
}

// ── Animated count-up for the match percentage ──────────────────────────────

function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setValue(target);
      return;
    }

    startedRef.current = true;
    let frame: number;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}

// ── Share button ─────────────────────────────────────────────────────────

function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    const shareData = {
      title: "My Linux distro match — Distro Chooser",
      text: "I just found my perfect Linux distribution. See what fits you:",
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the native share sheet — no action needed.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — silently ignore, link is still visible in the address bar.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-live="polite"
      className="
        inline-flex items-center gap-2 px-6 py-3 min-h-[44px]
        bg-emerald-600 text-white
        rounded-xl text-base font-medium
        hover:bg-emerald-500
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950
      "
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? "Link copied!" : "Share My Results"}
    </button>
  );
}

// ── Result card ──────────────────────────────────────────────────────────

function ResultCard({
  scored,
  index,
  matchPercent,
  reasons,
}: {
  scored: ScoredDistro;
  index: number;
  matchPercent: number;
  reasons: { question: string; answer: string; weight: number }[];
}) {
  const animatedPercent = useCountUp(matchPercent);

  return (
    <div
      className={`
        relative flex flex-col rounded-2xl border overflow-hidden
        animate-fade-in-up
        transition-all duration-150
        focus-within:ring-2 focus-within:ring-emerald-400 focus-within:ring-offset-2 focus-within:ring-offset-gray-50 dark:focus-within:ring-offset-gray-950
        ${
          index === 0
            ? "bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-600/15 dark:to-gray-800 border-emerald-500/40 shadow-lg shadow-emerald-900/10 dark:shadow-emerald-900/20"
            : "bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700"
        }
      `}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* Rank badge */}
      <div
        className={`
          absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10
          ${index === 0 ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}
        `}
        aria-hidden="true"
      >
        {index + 1}
      </div>

      {/* Card body */}
      <div className="p-5 pt-12 flex flex-col flex-1">
        {/* Distro name */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {scored.distro.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {scored.distro.description}
        </p>

        {/* Match percentage bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500 font-medium">Match</span>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {animatedPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-[width] duration-700 ease-out"
              style={{ width: `${Math.min(animatedPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Confidence tier */}
        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-4">
          {getConfidenceLabel(matchPercent)}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {scored.distro.releaseModel}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {scored.distro.experienceLevel}
          </span>
          {scored.distro.nvidiaFriendly && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
              NVIDIA-ready
            </span>
          )}
          {scored.contentDepthMultiplier > 1 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
              +{Math.round((scored.contentDepthMultiplier - 1) * 100)}% depth
            </span>
          )}
        </div>

        {/* Explanation sentence */}
        {reasons.length > 0 && (
          <div className="mb-3 px-3 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/30">
            <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
              {generateExplanation(scored.distro.name, reasons)}
            </p>
          </div>
        )}

        {/* Why recommended details */}
        {reasons.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              How your answers matched
            </h4>
            <ul className="space-y-1.5">
              {reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    <span className="text-gray-500">{reason.question}: </span>
                    {reason.answer}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Spacer to push link to bottom */}
        <div className="flex-1" />

        {/* Link to distro page on OpenSourceFeed */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700/50">
          <a
            href={scored.distro.links.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <span className="truncate">{scored.distro.name} on OpenSourceFeed</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────

/**
 * Renders the top 3 recommended distros as responsive cards, plus a
 * collapsible list of runners-up and actions to share, edit answers, or
 * start over.
 */
export default function ResultsView({ results, answers, questions, onEditAnswers, onStartOver }: ResultsViewProps) {
  const topResults = results.slice(0, 3);
  const runnersUp = results.slice(3, 6);
  const [showRunnersUp, setShowRunnersUp] = useState(false);

  const maxScore = getMaxPossibleScore(questions);

  function getMatchPercent(adjustedScore: number): number {
    if (maxScore <= 0) return 0;
    return Math.round((adjustedScore / maxScore) * 100);
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Top Picks
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Based on your answers, here are the Linux distributions we recommend for you.
        </p>
      </div>

      {/* Cards grid: stack on mobile, 2-col on md, 3-col on lg */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topResults.map((scored, index) => (
          <ResultCard
            key={scored.distro.id}
            scored={scored}
            index={index}
            matchPercent={getMatchPercent(scored.adjustedScore)}
            reasons={getWhyRecommended(scored.distro.id, answers, questions)}
          />
        ))}
      </div>

      {/* Runners-up */}
      {runnersUp.length > 0 && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setShowRunnersUp((v) => !v)}
            aria-expanded={showRunnersUp}
            aria-controls="runners-up-list"
            className="inline-flex items-center justify-center min-h-[44px] px-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline underline-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
          >
            {showRunnersUp ? "Hide other close matches" : `See ${runnersUp.length} more close matches`}
          </button>

          {showRunnersUp && (
            <ul id="runners-up-list" className="mt-4 max-w-xl mx-auto flex flex-col gap-2 text-left animate-fade-in-up">
              {runnersUp.map((scored) => (
                <li
                  key={scored.distro.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700"
                >
                  <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{scored.distro.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">{getMatchPercent(scored.adjustedScore)}% match</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <ShareButton />

        <button
          type="button"
          onClick={onEditAnswers}
          className="
            inline-flex items-center gap-2 px-6 py-3 min-h-[44px]
            bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200
            rounded-xl text-base font-medium
            hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950
          "
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit My Answers
        </button>
      </div>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex items-center justify-center min-h-[44px] px-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline underline-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
        >
          Start a fresh quiz instead
        </button>
      </div>
    </div>
  );
}
