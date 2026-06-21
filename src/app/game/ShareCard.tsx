"use client";

import { useState } from "react";

interface ShareCardProps {
  score: number;
  maxScore: number;
  roundResults: Array<{ chapter: number; clues_used: number; points: number; correct: boolean }>;
  chaptersLabel: string;
  streak: number;
  date: string;
}

export default function ShareCard({
  score,
  maxScore,
  roundResults,
  chaptersLabel,
  streak,
  date,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  function generateShareText() {
    const formatted = new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const squares = roundResults
      .map((r) => {
        if (!r.correct) return "⬛"; // black square — missed
        if (r.clues_used === 1) return "🟨"; // yellow — first clue
        if (r.clues_used === 2) return "🟦"; // blue — second clue
        return "⬜"; // white — third clue
      })
      .join(" ");

    return [
      `Rambam Riddle — ${formatted}`,
      chaptersLabel,
      "",
      squares,
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
        // User cancelled or unsupported — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — nothing more to do
    }
  }

  return (
    <button
      onClick={handleShare}
      className="w-full flex items-center justify-center gap-2 py-3.5 bg-parchment-gold text-white font-medium rounded-full hover:opacity-90 transition-opacity active:scale-[0.99]"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
        {copied ? "check" : "share"}
      </span>
      {copied ? "Copied" : "Share Result"}
    </button>
  );
}
