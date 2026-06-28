"use client";

import { useState } from "react";

interface Ruling {
  text: string;
  is_correct: boolean;
}

interface RulingStageProps {
  rulings: Ruling[];
  caseTitle: string;
  onLockIn: (selectedIndex: number) => void;
}

export default function RulingStage({ rulings, onLockIn }: RulingStageProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  function handleLockIn() {
    if (selected === null) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onLockIn(selected);
  }

  return (
    <div className="py-4 animate-fade-in">
      <p
        className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        STAGE 3 — THE RULING
      </p>
      <h2 className="font-serif text-[20px] sm:text-[24px] font-semibold text-primary mb-2">
        Issue your ruling
      </h2>
      <p className="text-[14px] text-muted-gray mb-6">
        Based on your analysis, what should the Beit Din rule?
      </p>

      <div className="space-y-3 mb-6">
        {rulings.map((ruling, i) => (
          <button
            key={i}
            onClick={() => {
              setSelected(i);
              setConfirming(false);
            }}
            className={`w-full text-left p-5 rounded-[20px] border-2 transition-all active:scale-[0.98] ${
              selected === i
                ? "border-parchment-gold bg-[#fdf8ef] ios-card-shadow"
                : "border-soft-border bg-white hover:border-outline-variant"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-bold flex-shrink-0 mt-0.5 ${
                  selected === i ? "bg-parchment-gold text-white" : "bg-surface-container text-muted-gray"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {i + 1}
              </div>
              <p className="font-serif text-[15px] leading-[24px] text-primary">{ruling.text}</p>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleLockIn}
        disabled={selected === null}
        className={`w-full flex items-center justify-center gap-2 py-4 font-semibold rounded-full transition-all ${
          selected === null
            ? "bg-soft-border text-muted-gray cursor-not-allowed"
            : confirming
            ? "bg-parchment-gold text-white hover:opacity-90 active:scale-[0.98]"
            : "bg-primary text-white hover:opacity-90 active:scale-[0.98]"
        }`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
          {confirming ? "gavel" : "lock"}
        </span>
        {confirming ? "Confirm Ruling" : "Lock In Ruling"}
      </button>

      {confirming && (
        <p className="text-[12px] text-parchment-gold text-center mt-3 animate-fade-in">
          Tap again to confirm. This is your final ruling.
        </p>
      )}
    </div>
  );
}
