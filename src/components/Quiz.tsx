import { useState, useRef, useEffect, useCallback } from "react";

// ── Types (mirrors src/schemas/question.ts) ────────────────────────────────

interface ScoreEffect {
  distroTag: string;
  weight: number;
}

interface Option {
  id: string;
  label: string;
  scoreEffects: ScoreEffect[];
}

interface Question {
  id: string;
  text: string;
  type: "single-select";
  options: Option[];
}

interface QuizProps {
  questions: Question[];
  onComplete: (answers: Record<string, string>) => void;
}

// ── Utility ────────────────────────────────────────────────────────────────

function getProgressPercent(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round(((current + 1) / total) * 100);
}

// ── Component ──────────────────────────────────────────────────────────────

export default function Quiz({ questions, onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [transitioning, setTransitioning] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const optionListRef = useRef<HTMLFieldSetElement>(null);

  const currentQuestion = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const totalQuestions = questions.length;

  // Focus the heading when the question changes
  useEffect(() => {
    // Small delay to let the transition start then focus
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleAnswer = useCallback(
    (optionId: string) => {
      const newAnswers = { ...answers, [currentQuestion.id]: optionId };
      setAnswers(newAnswers);

      if (isLast) {
        // Small delay so the user sees the selection briefly
        setTimeout(() => onComplete(newAnswers), 200);
      } else {
        setDirection("forward");
        setTransitioning(true);
        setTimeout(() => {
          setCurrentIndex((i) => i + 1);
          setTransitioning(false);
        }, 150);
      }
    },
    [answers, currentQuestion.id, isLast, onComplete],
  );

  const handleBack = useCallback(() => {
    if (isFirst) return;
    setDirection("backward");
    setTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((i) => i - 1);
      setTransitioning(false);
    }, 150);
  }, [isFirst]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, optionId: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleAnswer(optionId);
      }
    },
    [handleAnswer],
  );

  // ── Render ──────────────────────────────────────────────────────────────

  const transitionClass =
    transitioning
      ? direction === "forward"
        ? "animate-slide-out-left"
        : "animate-slide-out-right"
      : direction === "forward"
        ? "animate-slide-in-right"
        : "animate-slide-in-left";

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-400">{getProgressPercent(currentIndex, totalQuestions)}%</span>
        </div>
        <div
          className="w-full h-2 bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={getProgressPercent(currentIndex, totalQuestions)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Quiz progress: question ${currentIndex + 1} of ${totalQuestions}`}
        >
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${getProgressPercent(currentIndex, totalQuestions)}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className={`transition-all duration-150 ease-in-out ${transitionClass}`}>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-xl md:text-2xl font-semibold text-white mb-6 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-950 rounded"
          id={`question-${currentQuestion.id}-heading`}
        >
          {currentQuestion.text}
        </h2>

        <fieldset
          ref={optionListRef}
          className="border-0 p-0 m-0"
          aria-labelledby={`question-${currentQuestion.id}-heading`}
        >
          <legend className="sr-only">{currentQuestion.text}</legend>
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={answers[currentQuestion.id] === option.id}
                aria-label={option.label}
                tabIndex={0}
                onClick={() => handleAnswer(option.id)}
                onKeyDown={(e) => handleKeyDown(e, option.id)}
                className={`
                  w-full min-h-[44px] px-5 py-3 rounded-xl text-left text-base
                  transition-all duration-150 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-950
                  cursor-pointer border
                  ${
                    answers[currentQuestion.id] === option.id
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-medium"
                      : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 hover:border-gray-500"
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          {!isFirst ? (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back to the previous question"
              className="
                inline-flex items-center gap-2 px-4 py-2 min-h-[44px]
                text-sm text-gray-400 hover:text-white
                transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-950 rounded
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </button>
          ) : (
            <div /> /* Spacer to keep the layout balanced */
          )}

          <span className="text-xs text-gray-500">
            Press&nbsp;<kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 font-mono">Enter</kbd>&nbsp;to select
          </span>
        </div>
      </div>
    </div>
  );
}