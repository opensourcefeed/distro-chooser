import { useState, useEffect, useCallback } from "react";
import Quiz from "./Quiz";
import ResultsView from "./ResultsView";
import { scoreDistros, type ScoredDistro, type Answers } from "../lib/scoring";
import type { Distro } from "../schemas/distro";
import type { Question } from "../schemas/question";

// ── Types ──────────────────────────────────────────────────────────────────

interface QuizAppProps {
  questions: Question[];
  distros: Distro[];
}

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

export default function QuizApp({ questions, distros }: QuizAppProps) {
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

  return (
    <>
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