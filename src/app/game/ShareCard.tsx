"use client";

import { useState } from "react";

interface StageResults {
  identify: { selected: string[]; correct: string[]; points: number };
  apply: Array<{ principle_id: string; selected: number; correct: number; points: number }>;
  ruling: { selected: number; correct: number; points: number };
  total: number;
}

interface ShareCardProps {
  score: number;
  maxScore: number;
  results: StageResults;
  chaptersLabel: string;
  streak: number;
  date: string;
}

export default function ShareCard({ score, maxScore, results, chaptersLabel, streak, date }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  function generateShareText() {
    const formatted = new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

    const mark = (ok: boolean) => (ok ? "✓" : "✗");

    const identifyMarks = results.identify.correct
      .map((cId) => mark(results.identify.selected.includes(cId)))
      .join(" ");
    const applyMarks = results.apply.map((a) => mark(a.points > 0)).join(" ");
    const rulingMark = mark(results.ruling.points > 0);

    return [
      `The Rambam Case — ${formatted}`,
      chaptersLabel,
      "",
      `Identify:  ${identifyMarks}`,
      `Apply:     ${applyMarks}`,
      `Ruling:    ${rulingMark}`,
      "",
      `Score: ${score}/${maxScore}  |  Streak: ${streak}`,
      "",
      "therambamexperience.com/game",
    ].join("\n");
  }

  async function handleShare() {
    const text = generateShareText();

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // user cancelled or unsupported — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <button
      onClick={handleShare}
      className="w-full flex items-center justify-center gap-2 py-3.5 bg-parchment-gold text-white font-medium rounded-full hover:opacity-90 transition-opacity active:scale-[0.98]"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
        {copied ? "check" : "share"}
      </span>
      {copied ? "Copied" : "Share Result"}
    </button>
  );
}
