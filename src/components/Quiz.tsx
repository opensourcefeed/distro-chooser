import { useState, useRef, useEffect, useCallback } from "react";
import type { Question } from "../schemas/question";
import type { Answers } from "../lib/scoring";

interface QuizProps {
  questions: Question[];
  initialAnswers?: Answers;
  onComplete: (answers: Answers) => void;
}

// ── Utility ────────────────────────────────────────────────────────────────

function getProgressPercent(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round(((current + 1) / total) * 100);
}

// ── Component ──────────────────────────────────────────────────────────────

export default function Quiz({ questions, initialAnswers, onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers ?? {});
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [transitioning, setTransitioning] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const optionListRef = useRef<HTMLFieldSetElement>(null);

  const currentQuestion = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const totalQuestions = questions.length;
  const isMultiSelect = currentQuestion.type === "multi-select";

  const currentValue = answers[currentQuestion.id];
  const selectedIds = Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : [];

  const isOptionSelected = useCallback(
    (optionId: string) => selectedIds.includes(optionId),
    [selectedIds],
  );

  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Focus the heading when the question changes
  useEffect(() => {
    // Small delay to let the transition start then focus
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Reset roving focus index when the question changes: land on the
  // previously-selected option if there is one, otherwise the first option.
  useEffect(() => {
    optionRefs.current = [];
    const firstSelectedId = selectedIds[0];
    const selectedIndex = firstSelectedId
      ? currentQuestion.options.findIndex((o) => o.id === firstSelectedId)
      : -1;
    setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const goToNextOrComplete = useCallback(
    (newAnswers: Answers) => {
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
    [isLast, onComplete],
  );

  // Single-select: choosing an option commits it and immediately advances.
  const handleSingleSelect = useCallback(
    (optionId: string) => {
      const newAnswers = { ...answers, [currentQuestion.id]: optionId };
      setAnswers(newAnswers);
      goToNextOrComplete(newAnswers);
    },
    [answers, currentQuestion.id, goToNextOrComplete],
  );

  // Multi-select: toggling an option only updates the checked state;
  // advancing requires the explicit Next action.
  const handleToggleMulti = useCallback(
    (optionId: string) => {
      setAnswers((prev) => {
        const current = prev[currentQuestion.id];
        const currentArr = Array.isArray(current) ? current : [];
        const next = currentArr.includes(optionId)
          ? currentArr.filter((id) => id !== optionId)
          : [...currentArr, optionId];
        return { ...prev, [currentQuestion.id]: next };
      });
    },
    [currentQuestion.id],
  );

  const handleMultiNext = useCallback(() => {
    if (selectedIds.length === 0) return;
    goToNextOrComplete(answers);
  }, [answers, selectedIds.length, goToNextOrComplete]);

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
    (e: React.KeyboardEvent, optionId: string, index: number) => {
      const optionCount = currentQuestion.options.length;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (isMultiSelect) {
          handleToggleMulti(optionId);
        } else {
          handleSingleSelect(optionId);
        }
        return;
      }

      // Roving-tabindex arrow key navigation per the WAI-ARIA pattern for
      // radiogroups/listboxes: arrow keys move focus without submitting.
      let nextIndex: number | null = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        nextIndex = (index + 1) % optionCount;
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        nextIndex = (index - 1 + optionCount) % optionCount;
      } else if (e.key === "Home") {
        nextIndex = 0;
      } else if (e.key === "End") {
        nextIndex = optionCount - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        setFocusedIndex(nextIndex);
        optionRefs.current[nextIndex]?.focus();
      }
    },
    [currentQuestion.options.length, isMultiSelect, handleToggleMulti, handleSingleSelect],
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
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{getProgressPercent(currentIndex, totalQuestions)}%</span>
        </div>
        <div
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
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
          className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-6 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 rounded"
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
            {currentQuestion.options.map((option, index) => {
              const selected = isOptionSelected(option.id);
              return (
                <button
                  key={option.id}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  role={isMultiSelect ? "checkbox" : "radio"}
                  aria-checked={selected}
                  aria-label={option.label}
                  tabIndex={index === focusedIndex ? 0 : -1}
                  onClick={() => {
                    setFocusedIndex(index);
                    if (isMultiSelect) {
                      handleToggleMulti(option.id);
                    } else {
                      handleSingleSelect(option.id);
                    }
                  }}
                  onKeyDown={(e) => handleKeyDown(e, option.id, index)}
                  className={`
                    w-full min-h-[44px] px-5 py-3 rounded-xl text-left text-base
                    transition-all duration-150 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950
                    cursor-pointer border flex items-center gap-3
                    ${
                      selected
                        ? "bg-emerald-50 dark:bg-emerald-600/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-medium"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
                    }
                  `}
                >
                  {isMultiSelect && (
                    <span
                      aria-hidden="true"
                      className={`
                        flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center
                        ${selected ? "bg-emerald-500 border-emerald-400" : "border-gray-400 dark:border-gray-500"}
                      `}
                    >
                      {selected && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                  )}
                  {option.label}
                </button>
              );
            })}
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
                text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 rounded
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

          {isMultiSelect ? (
            <button
              type="button"
              onClick={handleMultiNext}
              disabled={selectedIds.length === 0}
              className="
                inline-flex items-center gap-2 px-5 py-2 min-h-[44px]
                bg-emerald-600 text-white text-sm font-medium rounded-lg
                transition-colors duration-150
                hover:bg-emerald-500
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-600
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950
              "
            >
              {isLast ? "See results" : "Next"}
            </button>
          ) : (
            <span className="text-xs text-gray-500">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400 font-mono">↑↓</kbd>&nbsp;to navigate,&nbsp;
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400 font-mono">Enter</kbd>&nbsp;to select
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
