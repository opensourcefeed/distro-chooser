import { useState, useEffect, useCallback } from "react";
import Quiz from "./Quiz";
import ResultsView from "./ResultsView";
import { scoreDistros, type ScoredDistro, type Answers } from "../lib/scoring";
import type { Question } from "../schemas/question";
import { questionsSchema } from "../schemas/question";
import { distrosSchema } from "../schemas/distro";
import questionsData from "../data/questions.json";
import distrosData from "../data/distros.json";

// Parsed once at module load, inside the client JS bundle — not serialized
// into the page HTML as island props (which would double-ship ~100KB of
// data: once in the HTML, once in the JS that reads it).
const questions = questionsSchema.parse(questionsData);
const distros = distrosSchema.parse(distrosData);

// ── URL encoding helpers ───────────────────────────────────────────────────

/**
 * Encode answers as a compact query-string value.
 * Format: comma-separated per-question slots, in question order. A
 * multi-select question's slot joins its selected option IDs with "+".
 * Example: "beginner,everyday+development,less-than-2,yes,stable,gnome"
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
 * Returns null if the format is invalid.
 */
function decodeAnswers(questions: Question[], raw: string): Answers | null {
  const parts = raw.split(",");
  if (parts.length !== questions.length) return null;
  const answers: Answers = {};
  for (let i = 0; i < questions.length; i++) {
    const val = parts[i].trim();
    if (!val) return null;
    const question = questions[i];
    answers[question.id] = question.type === "multi-select" ? val.split("+") : val;
  }
  return answers;
}

// ── Component ──────────────────────────────────────────────────────────────

type View = "quiz" | "results";

export default function QuizApp() {
  const [view, setView] = useState<View>("quiz");
  const [results, setResults] = useState<ScoredDistro[] | null>(null);
  const [answers, setAnswers] = useState<Answers | null>(null);
  // Seeds the Quiz component when re-entering it (undefined = start blank).
  const [quizInitialAnswers, setQuizInitialAnswers] = useState<Answers | undefined>(undefined);
  // Bumped on every re-entry into the quiz to force Quiz to remount with the new seed.
  const [resetNonce, setResetNonce] = useState(0);

  // On mount, check for ?a= param in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("a");
    if (encoded) {
      const decoded = decodeAnswers(questions, encoded);
      if (decoded) {
        const scored = scoreDistros(decoded, distros, questions);
        setAnswers(decoded);
        setResults(scored);
        setView("results");
      }
    }
  }, [questions, distros]);

  const handleComplete = useCallback(
    (newAnswers: Answers) => {
      const scored = scoreDistros(newAnswers, distros, questions);
      setAnswers(newAnswers);
      setResults(scored);
      setView("results");

      // Update URL with encoded answers (replace, not push, so back button works naturally)
      const encoded = encodeAnswers(questions, newAnswers);
      const url = `${window.location.pathname}?a=${encodeURIComponent(encoded)}`;
      window.history.replaceState(null, "", url);
    },
    [questions, distros],
  );

  // Re-enters the quiz with the previous answers pre-filled, so the user can
  // revise specific questions instead of starting from a blank slate.
  const handleEditAnswers = useCallback(() => {
    setQuizInitialAnswers(answers ?? undefined);
    setResetNonce((n) => n + 1);
    setView("quiz");
  }, [answers]);

  // Fully resets the quiz, discarding all previous answers.
  const handleStartOver = useCallback(() => {
    setQuizInitialAnswers(undefined);
    setResetNonce((n) => n + 1);
    setResults(null);
    setAnswers(null);
    setView("quiz");
    // Clear the URL param
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const heading =
    view === "results"
      ? { title: "Your Top Picks", subtitle: "Based on your answers, here are the Linux distributions we recommend for you." }
      : {
          title: "Find Your Perfect Linux Distribution",
          subtitle: `Answer a few quick questions and get personalized GNU/Linux distro recommendations from ${distros.length} options.`,
        };

  return (
    <>
      <div className="w-full max-w-lg mx-auto px-4 pt-20 pb-8 sm:pt-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">{heading.title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">{heading.subtitle}</p>
      </div>

      {view === "quiz" && (
        <Quiz
          key={resetNonce}
          questions={questions}
          initialAnswers={quizInitialAnswers}
          onComplete={handleComplete}
        />
      )}
      {view === "results" && results && answers && (
        <ResultsView
          results={results}
          answers={answers}
          questions={questions}
          onEditAnswers={handleEditAnswers}
          onStartOver={handleStartOver}
        />
      )}
    </>
  );
}