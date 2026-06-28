"use client";

import { useState } from "react";

interface Principle {
  id: string;
  text: string;
  chapter: number;
  halacha: number;
  is_relevant: boolean;
  why_relevant?: string;
  why_not?: string;
}

interface IdentifyStageProps {
  principles: Principle[];
  correctIds: string[];
  showResults: boolean;
  onLockIn: (selected: string[]) => void;
  onContinue: () => void;
}

export default function IdentifyStage({
  principles,
  correctIds,
  showResults,
  onLockIn,
  onContinue,
}: IdentifyStageProps) {
  const [selected, setSelected] = useState<string[]>([]);

  function togglePrinciple(id: string) {
    if (showResults) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  }

  return (
    <div className="py-4 animate-fade-in">
      <p
        className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        STAGE 1 — IDENTIFY
      </p>
      <h2 className="font-serif text-[20px] sm:text-[24px] font-semibold text-primary mb-2">
        Which principles apply?
      </h2>
      <p className="text-[14px] text-muted-gray mb-6">
        Select the 3 principles from the Rambam that are relevant to this case. Three are real. Three are distractors.
      </p>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-muted-gray">{selected.length} of 3 selected</p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i < selected.length ? "bg-parchment-gold" : "bg-soft-border"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {principles.map((p) => {
          const isSelected = selected.includes(p.id);
          const isCorrect = correctIds.includes(p.id);

          let cardStyle = "border-soft-border bg-white";
          if (showResults) {
            if (isSelected && isCorrect) cardStyle = "border-parchment-gold bg-[#fdf8ef]";
            else if (isSelected && !isCorrect) cardStyle = "border-red-300 bg-red-50";
            else if (!isSelected && isCorrect) cardStyle = "border-parchment-gold bg-[#fdf8ef] opacity-70";
            else cardStyle = "border-soft-border bg-white opacity-40";
          } else if (isSelected) {
            cardStyle = "border-parchment-gold bg-[#fdf8ef]";
          }

          return (
            <button
              key={p.id}
              onClick={() => togglePrinciple(p.id)}
              disabled={showResults}
              className={`w-full text-left p-4 rounded-[16px] border transition-all ${cardStyle} ${
                !showResults && !isSelected
                  ? "hover:border-outline-variant hover:bg-surface-container-low active:scale-[0.98]"
                  : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    showResults && isSelected && isCorrect
                      ? "bg-parchment-gold border-parchment-gold"
                      : showResults && isSelected && !isCorrect
                      ? "bg-red-400 border-red-400"
                      : showResults && !isSelected && isCorrect
                      ? "bg-parchment-gold border-parchment-gold"
                      : isSelected
                      ? "bg-parchment-gold border-parchment-gold"
                      : "border-outline-variant"
                  }`}
                >
                  {(isSelected || (showResults && isCorrect)) && (
                    <span className="material-symbols-outlined text-white" style={{ fontSize: "14px" }}>
                      {showResults && isSelected && !isCorrect ? "close" : "check"}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-[14px] leading-[22px] text-charcoal-text">{p.text}</p>
                  <p className="text-[11px] text-muted-gray mt-1.5" style={{ fontFamily: "var(--font-sans)" }}>
                    Chapter {p.chapter}, Halacha {p.halacha}
                  </p>

                  {showResults && isSelected && !isCorrect && p.why_not && (
                    <p className="text-[12px] text-red-500 mt-2 leading-[18px]">{p.why_not}</p>
                  )}
                  {showResults && isCorrect && p.why_relevant && (
                    <p className="text-[12px] text-parchment-gold mt-2 leading-[18px]">{p.why_relevant}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {!showResults ? (
        <button
          onClick={() => onLockIn(selected)}
          disabled={selected.length !== 3}
          className={`w-full flex items-center justify-center gap-2 py-3.5 font-medium rounded-full transition-all ${
            selected.length === 3
              ? "bg-primary text-white hover:opacity-90 active:scale-[0.98]"
              : "bg-soft-border text-muted-gray cursor-not-allowed"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>lock</span>
          Lock In
        </button>
      ) : (
        <div className="animate-slide-up">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-[20px] font-bold text-parchment-gold" style={{ fontFamily: "var(--font-sans)" }}>
              {selected.filter((id) => correctIds.includes(id)).length}/3
            </span>
            <span className="text-[14px] text-muted-gray">identified correctly</span>
          </div>
          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-medium rounded-full hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            Apply the Law
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}
