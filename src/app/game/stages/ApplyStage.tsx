"use client";

import { useState } from "react";

interface Application {
  principle_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface ApplyStageProps {
  applications: Application[];
  caseNarrative: string;
  onComplete: (
    results: Array<{ principle_id: string; selected: number; correct: number; points: number }>
  ) => void;
}

export default function ApplyStage({ applications, caseNarrative, onComplete }: ApplyStageProps) {
  const [currentApp, setCurrentApp] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showCaseRef, setShowCaseRef] = useState(false);

  function handleCommit() {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);

    if (currentApp < applications.length - 1) {
      setCurrentApp(currentApp + 1);
    } else {
      const results = applications.map((app, i) => ({
        principle_id: app.principle_id,
        selected: newAnswers[i],
        correct: app.correct_index,
        points: newAnswers[i] === app.correct_index ? 1 : 0,
      }));
      onComplete(results);
    }
  }

  const app = applications[currentApp];

  return (
    <div className="py-4 animate-fade-in" key={currentApp}>
      <p
        className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        STAGE 2 — APPLY
      </p>
      <h2 className="font-serif text-[20px] sm:text-[24px] font-semibold text-primary mb-2">
        Apply to the case
      </h2>

      <div className="flex items-center gap-2 mb-6">
        {applications.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              i < currentApp ? "bg-parchment-gold" : i === currentApp ? "bg-primary" : "bg-soft-border"
            }`}
          />
        ))}
      </div>

      <button
        onClick={() => setShowCaseRef(!showCaseRef)}
        className="flex items-center gap-2 text-[13px] text-parchment-gold font-medium mb-4 hover:opacity-80 transition-opacity"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
          {showCaseRef ? "expand_less" : "description"}
        </span>
        {showCaseRef ? "Hide case" : "Review the case"}
      </button>

      {showCaseRef && (
        <div className="bg-surface-container-low rounded-[16px] p-4 mb-4 animate-fade-in">
          <p className="font-serif text-[13px] leading-[22px] text-primary">{caseNarrative}</p>
        </div>
      )}

      <div className="bg-white rounded-[20px] border border-soft-border ios-card-shadow p-5 sm:p-6 mb-6">
        <p
          className="text-[10px] font-semibold tracking-[0.15em] uppercase text-parchment-gold mb-3"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          PRINCIPLE {currentApp + 1} OF {applications.length}
        </p>
        <p className="font-serif text-[16px] leading-[26px] text-primary">{app.question}</p>
      </div>

      <div className="space-y-3 mb-6">
        {app.options.map((option, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`w-full text-left p-4 rounded-[16px] border transition-all active:scale-[0.98] ${
              selected === i
                ? "border-parchment-gold bg-[#fdf8ef]"
                : "border-soft-border bg-white hover:border-outline-variant hover:bg-surface-container-low"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 mt-0.5 ${
                  selected === i ? "bg-parchment-gold text-white" : "bg-surface-container text-muted-gray"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {String.fromCharCode(65 + i)}
              </div>
              <span className="text-[14px] leading-[22px] text-charcoal-text">{option}</span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-[12px] text-muted-gray text-center mb-4 italic">
        No feedback until the final reveal.
      </p>

      <button
        onClick={handleCommit}
        disabled={selected === null}
        className={`w-full flex items-center justify-center gap-2 py-3.5 font-medium rounded-full transition-all ${
          selected !== null
            ? "bg-primary text-white hover:opacity-90 active:scale-[0.98]"
            : "bg-soft-border text-muted-gray cursor-not-allowed"
        }`}
      >
        {currentApp < applications.length - 1 ? "Commit and Continue" : "Commit and Rule"}
        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
      </button>
    </div>
  );
}
