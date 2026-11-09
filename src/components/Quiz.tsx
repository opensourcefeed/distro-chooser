import { useState, useRef, useEffect, useCallback } from "react";
import type { Question } from "../schemas/question";
import type { Answers } from "../lib/scoring";
import { Icon } from "./icons";

interface QuizProps {
  questions: Question[];
  initialAnswers?: Answers;
  onComplete: (answers: Answers) => void;
}

// ── Utility ────────────────────────────────────────────────────────────────

/** Share of questions already behind the user: 0% on the first question. */
export function getProgressPercent(currentIndex: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((currentIndex / total) * 100);
}

// ── Step indicator ─────────────────────────────────────────────────────────

function StepIndicator({ questions, currentIndex }: { questions: Question[]; currentIndex: number }) {
  const total = questions.length;
  const percent = getProgressPercent(currentIndex, total);
  const label = `Question ${currentIndex + 1} of ${total}: ${questions[currentIndex].shortLabel}`;

  return (
    <div className="mt-3">
      {/* Phones: compact text + thin bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            Step <span className="font-semibold text-fg tabular-nums">{currentIndex + 1}</span> of {total}
          </span>
          <span className="font-medium">{questions[currentIndex].shortLabel}</span>
        </div>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={label}
          aria-label="Quiz progress"
        >
          <div className="h-full rounded-full bg-brand-500 transition-[width] duration-300 ease-[var(--ease-soft)]" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Wider screens: segmented steps with labels */}
      <ol className="hidden sm:grid gap-2" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }} aria-label={label}>
        {questions.map((q, i) => {
          const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "todo";
          return (
            <li key={q.id} aria-current={state === "current" ? "step" : undefined}>
              <span
                className={`block h-1.5 rounded-full transition-colors duration-300 ${
                  state === "done" ? "bg-brand-500" : state === "current" ? "bg-brand-300 dark:bg-brand-700" : "bg-surface-2"
                }`}
                aria-hidden="true"
              />
              <span className={`mt-2 block truncate text-xs ${state === "current" ? "font-semibold text-fg" : "text-muted"}`}>
                {q.shortLabel}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function Quiz({ questions, initialAnswers, onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers ?? {});
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [transitioning, setTransitioning] = useState(false);
  const isFirstRender = useRef(true);

  const headingRef = useRef<HTMLHeadingElement>(null);

  const currentQuestion = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const isMultiSelect = currentQuestion.type === "multi-select";
  const twoColumns = currentQuestion.options.length >= 4;

  const currentValue = answers[currentQuestion.id];
  const selectedIds = Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : [];

  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Move focus to the question heading when the question changes (not on
  // first render, so the page doesn't jump when the quiz opens).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      headingRef.current?.focus({ preventScroll: true });
      return;
    }
    const timer = setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 50);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Roving focus lands on the previously selected option, or the first one.
  useEffect(() => {
    optionRefs.current = [];
    const firstSelectedId = selectedIds[0];
    const selectedIndex = firstSelectedId ? currentQuestion.options.findIndex((o) => o.id === firstSelectedId) : -1;
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

  // Multi-select: toggling only updates the checked state; Next advances.
  const handleToggleMulti = useCallback(
    (optionId: string) => {
      setAnswers((prev) => {
        const current = prev[currentQuestion.id];
        const currentArr = Array.isArray(current) ? current : [];
        const next = currentArr.includes(optionId) ? currentArr.filter((id) => id !== optionId) : [...currentArr, optionId];
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
        if (isMultiSelect) handleToggleMulti(optionId);
        else handleSingleSelect(optionId);
        return;
      }

      // Roving-tabindex arrow navigation (WAI-ARIA radiogroup pattern).
      let nextIndex: number | null = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") nextIndex = (index + 1) % optionCount;
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") nextIndex = (index - 1 + optionCount) % optionCount;
      else if (e.key === "Home") nextIndex = 0;
      else if (e.key === "End") nextIndex = optionCount - 1;

      if (nextIndex !== null) {
        e.preventDefault();
        setFocusedIndex(nextIndex);
        optionRefs.current[nextIndex]?.focus();
      }
    },
    [currentQuestion.options.length, isMultiSelect, handleToggleMulti, handleSingleSelect],
  );

  // ── Render ──────────────────────────────────────────────────────────────

  const transitionClass = transitioning
    ? direction === "forward"
      ? "animate-slide-out-left"
      : "animate-slide-out-right"
    : direction === "forward"
      ? "animate-slide-in-right"
      : "animate-slide-in-left";

  const headingId = `question-${currentQuestion.id}-heading`;
  const showMobileBar = !isFirst || isMultiSelect;

  return (
    <div className={showMobileBar ? "pb-28 sm:pb-16" : "pb-12 sm:pb-16"}>
      <StepIndicator questions={questions} currentIndex={currentIndex} />

      <div className={`mt-8 sm:mt-10 ${transitionClass}`}>
        <h2
          ref={headingRef}
          tabIndex={-1}
          id={headingId}
          className="text-h2 font-semibold tracking-tight text-fg outline-none"
        >
          {currentQuestion.text}
        </h2>
        {isMultiSelect && <p className="mt-2 text-muted">Pick as many as you like.</p>}

        <div
          role={isMultiSelect ? "group" : "radiogroup"}
          aria-labelledby={headingId}
          className={`mt-6 grid gap-3 ${twoColumns ? "sm:grid-cols-2" : ""}`}
        >
          {currentQuestion.options.map((option, index) => {
            const selected = selectedIds.includes(option.id);
            return (
              <button
                key={option.id}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                type="button"
                role={isMultiSelect ? "checkbox" : "radio"}
                aria-checked={selected}
                tabIndex={index === focusedIndex ? 0 : -1}
                onClick={() => {
                  setFocusedIndex(index);
                  if (isMultiSelect) handleToggleMulti(option.id);
                  else handleSingleSelect(option.id);
                }}
                onKeyDown={(e) => handleKeyDown(e, option.id, index)}
                className={`
                  group relative flex w-full min-h-16 items-center gap-4 rounded-[var(--radius-control)] border p-4 text-left
                  transition-[border-color,background-color,box-shadow,transform] duration-150 ease-[var(--ease-soft)]
                  active:scale-[0.99] focus-ring cursor-pointer
                  ${
                    selected
                      ? "border-brand-500 bg-accent-soft shadow-[0_0_0_1px_var(--color-brand-500)]"
                      : "border-line bg-surface hover:border-line-strong hover:shadow-[var(--shadow-card)]"
                  }
                `}
              >
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    selected ? "bg-primary text-on-primary" : "bg-surface-2 text-accent"
                  }`}
                  aria-hidden="true"
                >
                  <Icon name={option.icon ?? "help"} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug text-fg">{option.label}</span>
                  {option.description && <span className="mt-0.5 block text-sm leading-snug text-muted">{option.description}</span>}
                </span>
                <span
                  aria-hidden="true"
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center border-2 transition-colors ${
                    isMultiSelect ? "rounded-md" : "rounded-full"
                  } ${selected ? "border-brand-500 bg-brand-500 text-white" : "border-line-strong"}`}
                >
                  {selected && <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation: sticky bottom bar on phones, inline from sm up. Kept
          outside the animated wrapper: a transformed ancestor would make
          position: fixed relative to it instead of the viewport. */}
        <div
          className={`
            ${showMobileBar ? "fixed" : "hidden"} inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/90 backdrop-blur-md
            px-[max(1rem,env(safe-area-inset-left))] pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]
            sm:static sm:z-auto sm:mt-8 sm:flex sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none
          `}
        >
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
            {!isFirst ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-ring"
              >
                <Icon name="arrow-left" className="h-4 w-4" />
                Back
              </button>
            ) : (
              <span />
            )}

            {isMultiSelect ? (
              <button
                type="button"
                onClick={handleMultiNext}
                disabled={selectedIds.length === 0}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-primary px-6 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted sm:flex-none focus-ring"
              >
                {isLast ? "See my results" : "Next"}
                <Icon name="arrow-right" className="h-4 w-4" />
              </button>
            ) : (
              <span className="hidden items-center gap-1.5 text-xs text-muted pointer-fine:flex">
                <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono">↑↓</kbd> to move
                <kbd className="ml-2 rounded border border-line bg-surface px-1.5 py-0.5 font-mono">Enter</kbd> to choose
              </span>
            )}
          </div>
        </div>
    </div>
  );
}
