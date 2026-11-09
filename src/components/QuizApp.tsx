import { useState, useEffect, useCallback, useRef } from "react";
import Quiz from "./Quiz";
import ResultsView from "./ResultsView";
import DistroMark from "./DistroMark";
import { Icon } from "./icons";
import { scoreDistros, type ScoredDistro, type Answers } from "../lib/scoring";
import { distros, questions, dataLastReviewed, formatDate } from "../lib/data";
import type { Question } from "../schemas/question";

// ── URL encoding helpers ───────────────────────────────────────────────────

/**
 * Encode answers as a compact query-string value.
 * Format: comma-separated per-question slots, in question order. A
 * multi-select question's slot joins its selected option IDs with "+".
 * Example: "pc,beginner,everyday+development,less-than-2,yes,stable,gnome"
 */
function encodeAnswers(questions: Question[], answers: Answers): string {
  return questions
    .map((q) => {
      const value = answers[q.id];
      if (!value) return "";
      return Array.isArray(value) ? value.join("+") : value;
    })
    .join(",");
}

/**
 * Decode a query-string value back into an answers record.
 * Returns null if the format is invalid or refers to unknown options.
 *
 * Links created before the "device" question existed have one slot fewer;
 * they are read as "PC or laptop", which is what every old result assumed.
 */
function decodeAnswers(questions: Question[], raw: string): Answers | null {
  let parts = raw.split(",").map((p) => p.trim());
  if (parts.length === questions.length - 1 && questions[0]?.id === "device") {
    parts = ["pc", ...parts];
  }
  if (parts.length !== questions.length) return null;

  const answers: Answers = {};
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (!parts[i]) return null;
    const ids = question.type === "multi-select" ? parts[i].split("+") : [parts[i]];
    if (!ids.every((id) => question.options.some((o) => o.id === id))) return null;
    answers[question.id] = question.type === "multi-select" ? ids : ids[0];
  }
  return answers;
}

// ── Landing hero ───────────────────────────────────────────────────────────

const FEATURED = ["linux-mint", "ubuntu", "fedora", "pop-os", "debian", "manjaro", "arch-linux", "zorin-os"];

function Landing({ onStart, invalidLink }: { onStart: () => void; invalidLink: boolean }) {
  const featured = FEATURED.map((id) => distros.find((d) => d.id === id)).filter((d) => d !== undefined);

  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-heading">
      <div className="hero-backdrop absolute inset-0 -z-10" aria-hidden="true" />
      <div className="mx-auto max-w-3xl px-4 pt-14 pb-16 text-center sm:px-6 sm:pt-20 sm:pb-24">
        {invalidLink && (
          <div
            role="status"
            className="mx-auto mb-8 flex max-w-xl items-start gap-3 rounded-[var(--radius-control)] border border-warn-200 bg-warn-50 px-4 py-3 text-left text-sm text-warn-900 dark:border-warn-700/50 dark:bg-warn-900/30 dark:text-warn-200"
          >
            <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>That results link is out of date or incomplete, so we couldn't restore it. Take the quiz again to get fresh results.</p>
          </div>
        )}

        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs font-medium text-muted shadow-sm backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
          Free · No sign-up · Answers stay in your browser
        </p>

        <h1 id="hero-heading" className="mt-6 text-display font-semibold">
          Which Linux distro <span className="text-accent">should you use?</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[46ch] text-lead text-muted">
          Answer {questions.length} quick questions and get a ranked shortlist from {distros.length} Linux distributions, with the reasons behind every match.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={onStart}
            className="group inline-flex min-h-13 items-center gap-2 rounded-[var(--radius-control)] bg-primary px-7 text-base font-semibold text-on-primary shadow-[var(--shadow-lift)] transition-[background-color,transform] duration-150 hover:bg-primary-hover active:scale-[0.98] focus-ring"
          >
            Start the quiz
            <Icon name="arrow-right" className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted" aria-label="Quiz facts">
            <li><strong className="font-semibold text-fg">{distros.length}</strong> distros</li>
            <li aria-hidden="true">·</li>
            <li><strong className="font-semibold text-fg">{questions.length}</strong> questions</li>
            <li aria-hidden="true">·</li>
            <li>about <strong className="font-semibold text-fg">60</strong> seconds</li>
          </ul>
        </div>

        <div className="mt-12">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Includes</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {featured.map((d) => (
              <li key={d.id} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3 pl-1 text-sm text-fg">
                <DistroMark id={d.id} name={d.name} size="sm" />
                {d.name}
              </li>
            ))}
            <li className="inline-flex items-center rounded-full px-3 py-1 text-sm text-muted">+ {distros.length - featured.length} more</li>
          </ul>
          <p className="mt-6 text-xs text-muted">
            Independent · no sponsored placements · data reviewed <time dateTime={dataLastReviewed}>{formatDate(dataLastReviewed)}</time>
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

type View = "landing" | "quiz" | "results";

export default function QuizApp() {
  const [view, setView] = useState<View>("landing");
  const [invalidLink, setInvalidLink] = useState(false);
  const [results, setResults] = useState<ScoredDistro[] | null>(null);
  const [answers, setAnswers] = useState<Answers | null>(null);
  // Seeds the Quiz component when re-entering it (undefined = start blank).
  const [quizInitialAnswers, setQuizInitialAnswers] = useState<Answers | undefined>(undefined);
  // Bumped on every re-entry into the quiz to force Quiz to remount with the new seed.
  const [resetNonce, setResetNonce] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  // On mount, restore results from the ?a= param.
  useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get("a");
    if (!encoded) return;
    const decoded = decodeAnswers(questions, encoded);
    if (decoded) {
      setAnswers(decoded);
      setResults(scoreDistros(decoded, distros, questions));
      setView("results");
    } else {
      setInvalidLink(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Tell the header which view is showing (it toggles "Start over").
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("dc:view", { detail: view }));
  }, [view]);

  const scrollToTop = useCallback(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, []);

  const handleStart = useCallback(() => {
    setInvalidLink(false);
    setQuizInitialAnswers(undefined);
    setResetNonce((n) => n + 1);
    setView("quiz");
    scrollToTop();
  }, [scrollToTop]);

  const handleComplete = useCallback(
    (newAnswers: Answers) => {
      setAnswers(newAnswers);
      setResults(scoreDistros(newAnswers, distros, questions));
      setView("results");
      scrollToTop();
      // Replace, not push, so the back button leaves the page naturally.
      // Commas are valid in a query string, so keep them readable in shared links.
      const encoded = encodeURIComponent(encodeAnswers(questions, newAnswers)).replace(/%2C/g, ",");
      const url = `${window.location.pathname}?a=${encoded}`;
      window.history.replaceState(null, "", url);
    },
    [scrollToTop],
  );

  // Re-enters the quiz with the previous answers pre-filled.
  const handleEditAnswers = useCallback(() => {
    setQuizInitialAnswers(answers ?? undefined);
    setResetNonce((n) => n + 1);
    setView("quiz");
    scrollToTop();
  }, [answers, scrollToTop]);

  // Fully resets to the landing screen, discarding all answers.
  const handleStartOver = useCallback(() => {
    setQuizInitialAnswers(undefined);
    setResetNonce((n) => n + 1);
    setResults(null);
    setAnswers(null);
    setInvalidLink(false);
    setView("landing");
    window.history.replaceState(null, "", window.location.pathname);
    scrollToTop();
  }, [scrollToTop]);

  useEffect(() => {
    window.addEventListener("dc:start-over", handleStartOver);
    return () => window.removeEventListener("dc:start-over", handleStartOver);
  }, [handleStartOver]);

  return (
    <div ref={topRef}>
      {view === "landing" && <Landing onStart={handleStart} invalidLink={invalidLink} />}

      {view === "quiz" && (
        <section aria-labelledby="quiz-heading" className="mx-auto w-full max-w-2xl px-4 pt-8 sm:px-6 sm:pt-12">
          <h1 id="quiz-heading" className="text-sm font-semibold uppercase tracking-wider text-accent font-sans">
            Find your Linux distro
          </h1>
          <Quiz key={resetNonce} questions={questions} initialAnswers={quizInitialAnswers} onComplete={handleComplete} />
        </section>
      )}

      {view === "results" && results && answers && (
        <section aria-labelledby="results-heading" className="mx-auto w-full max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Your results</p>
            <h1 id="results-heading" className="mt-2 text-h1 font-semibold tracking-tight">
              Your top Linux matches
            </h1>
            <p className="mt-3 text-lead text-muted">
              Ranked from {results.length} {results.length === 1 ? "distribution" : "distributions"} that fit your device. Each card shows why it matched and anything you should know first.
            </p>
          </div>
          <ResultsView
            results={results}
            answers={answers}
            questions={questions}
            onEditAnswers={handleEditAnswers}
            onStartOver={handleStartOver}
          />
        </section>
      )}
    </div>
  );
}
