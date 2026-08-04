import { useState, useEffect, useCallback } from "react";
import Quiz from "./Quiz";
import ResultsView from "./ResultsView";
import { scoreDistros, type ScoredDistro } from "../lib/scoring";
import type { Distro } from "../schemas/distro";

// ── Types ──────────────────────────────────────────────────────────────────

interface Question {
  id: string;
  text: string;
  type: "single-select";
  options: {
    id: string;
    label: string;
    scoreEffects: { distroTag: string; weight: number }[];
  }[];
}

interface QuizAppProps {
  questions: Question[];
  distros: Distro[];
}

// ── URL encoding helpers ───────────────────────────────────────────────────

/**
 * Encode answers as a compact query-string value.
 * Format: comma-separated option IDs in question order.
 * Example: "beginner,everyday,less-than-2,yes,stable,gnome"
 */
function encodeAnswers(questions: Question[], answers: Record<string, string>): string {
  return questions.map((q) => answers[q.id] ?? "").join(",");
}

/**
 * Decode a query-string value back into an answers record.
 * Returns null if the format is invalid.
 */
function decodeAnswers(questions: Question[], raw: string): Record<string, string> | null {
  const parts = raw.split(",");
  if (parts.length !== questions.length) return null;
  const answers: Record<string, string> = {};
  for (let i = 0; i < questions.length; i++) {
    const val = parts[i].trim();
    if (!val) return null;
    answers[questions[i].id] = val;
  }
  return answers;
}

// ── Component ──────────────────────────────────────────────────────────────

type View = "quiz" | "results";

export default function QuizApp({ questions, distros }: QuizAppProps) {
  const [view, setView] = useState<View>("quiz");
  const [results, setResults] = useState<ScoredDistro[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string> | null>(null);

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
    (newAnswers: Record<string, string>) => {
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

  const handleRestart = useCallback(() => {
    setView("quiz");
    setResults(null);
    setAnswers(null);
    // Clear the URL param
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  return (
    <>
      {view === "quiz" && (
        <Quiz
          key={results === null ? "fresh" : "restarted"}
          questions={questions}
          onComplete={handleComplete}
        />
      )}
      {view === "results" && results && answers && (
        <ResultsView
          results={results}
          answers={answers}
          questions={questions}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}