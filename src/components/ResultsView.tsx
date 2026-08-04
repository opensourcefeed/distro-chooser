import type { ScoredDistro } from "../lib/scoring";
import { getMaxPossibleScore, getWhyRecommended } from "../lib/scoring";
import type { Answers, Question } from "../lib/scoring";
import { generateExplanation } from "../lib/explain";

interface ResultsViewProps {
  results: ScoredDistro[];
  answers: Answers;
  questions: Question[];
  onRestart: () => void;
}

/**
 * Renders the top 2-3 recommended distros as responsive cards with:
 * - Match percentage / score bar
 * - "Why recommended" reasons
 * - Quick links to overview, install guide, and latest release
 */
export default function ResultsView({ results, answers, questions, onRestart }: ResultsViewProps) {
  // Show top 3 results
  const topResults = results.slice(0, 3);

  // Compute max possible score for percentage calculations
  const maxScore = getMaxPossibleScore(questions);

  function getMatchPercent(adjustedScore: number): number {
    if (maxScore <= 0) return 0;
    return Math.round((adjustedScore / maxScore) * 100);
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Your Top Picks
        </h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Based on your answers, here are the Linux distributions we recommend for you.
        </p>
      </div>

      {/* Cards grid: stack on mobile, 2-col on md, 3-col on lg */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topResults.map((scored, index) => {
          const matchPercent = getMatchPercent(scored.adjustedScore);
          const reasons = getWhyRecommended(scored.distro.id, answers, questions);

          return (
            <div
              key={scored.distro.id}
              className={`
                relative flex flex-col rounded-2xl border overflow-hidden
                transition-all duration-150
                focus-within:ring-2 focus-within:ring-emerald-400 focus-within:ring-offset-2 focus-within:ring-offset-gray-950
                ${
                  index === 0
                    ? "bg-gradient-to-b from-emerald-600/15 to-gray-800 border-emerald-500/40 shadow-lg shadow-emerald-900/20"
                    : "bg-gray-800/80 border-gray-700"
                }
              `}
            >
              {/* Rank badge */}
              <div
                className={`
                  absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10
                  ${index === 0 ? "bg-emerald-500 text-white" : "bg-gray-700 text-gray-300"}
                `}
                aria-hidden="true"
              >
                {index + 1}
              </div>

              {/* Card body */}
              <div className="p-5 pt-12 flex flex-col flex-1">
                {/* Distro name */}
                <h3 className="text-xl font-bold text-white mb-1">
                  {scored.distro.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {scored.distro.description}
                </p>

                {/* Match percentage bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 font-medium">Match</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      {matchPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(matchPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
                    {scored.distro.releaseModel}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
                    {scored.distro.experienceLevel}
                  </span>
                  {scored.distro.nvidiaFriendly && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/40 text-green-400">
                      NVIDIA-ready
                    </span>
                  )}
                  {scored.contentDepthMultiplier > 1 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/40 text-blue-400">
                      +{Math.round((scored.contentDepthMultiplier - 1) * 100)}% depth
                    </span>
                  )}
                </div>

                {/* Explanation sentence */}
                {reasons.length > 0 && (
                  <div className="mb-3 px-3 py-2.5 rounded-lg bg-emerald-900/15 border border-emerald-800/30">
                    <p className="text-sm text-emerald-300 leading-relaxed">
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
                            className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0"
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
                          <span className="text-gray-300">
                            <span className="text-gray-500">{reason.question}: </span>
                            {reason.answer}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Spacer to push links to bottom */}
                <div className="flex-1" />

                {/* Quick links */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700/50">
                  {scored.distro.links.overviewUrl && (
                    <a
                      href={scored.distro.links.overviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-medium rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                      aria-label={`Read overview of ${scored.distro.name}`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                      Overview
                    </a>
                  )}
                  {scored.distro.links.installGuideUrl && (
                    <a
                      href={scored.distro.links.installGuideUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-medium rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                      aria-label={`Read install guide for ${scored.distro.name}`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Install
                    </a>
                  )}
                  {scored.distro.links.latestReleaseUrl && (
                    <a
                      href={scored.distro.links.latestReleaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-medium rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                      aria-label={`See latest release of ${scored.distro.name}`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                      </svg>
                      Release
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Retake button */}
      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={onRestart}
          className="
            inline-flex items-center gap-2 px-6 py-3 min-h-[44px]
            bg-gray-800 border border-gray-700 text-gray-200
            rounded-xl text-base font-medium
            hover:bg-gray-700 hover:border-gray-500
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-950
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Retake the Quiz
        </button>
      </div>
    </div>
  );
}