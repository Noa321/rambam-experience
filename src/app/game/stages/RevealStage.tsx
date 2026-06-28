"use client";

import { useState, useEffect } from "react";
import ShareCard from "../ShareCard";
import Link from "next/link";

interface RevealStep {
  step: number;
  chapter: number;
  halacha: number;
  principle_summary: string;
  application_to_case: string;
  source_text: string;
}

interface StageResults {
  identify: { selected: string[]; correct: string[]; points: number };
  apply: Array<{ principle_id: string; selected: number; correct: number; points: number }>;
  ruling: { selected: number; correct: number; points: number };
  total: number;
}

interface Ruling {
  text: string;
  is_correct: boolean;
}

interface PuzzleInfo {
  date: string;
  chaptersLabel: string;
  sefer: string;
  hilchot: string;
}

interface RevealStageProps {
  results: StageResults;
  revealChain: RevealStep[];
  rulingExplanation: string;
  rulings: Ruling[];
  streak: number;
  puzzle: PuzzleInfo;
  contentId?: string | null;
}

function getScoreTitle(score: number): string {
  if (score === 12) return "Perfect Ruling";
  if (score >= 10) return "Exceptional Judgment";
  if (score >= 7) return "Sound Reasoning";
  if (score >= 4) return "Developing Insight";
  return "The Rambam Disagrees";
}

function getScoreSubtext(score: number): string {
  if (score === 12) return "You tracked the Rambam's reasoning across all three chapters.";
  if (score >= 10) return "Your analysis was nearly indistinguishable from the Rambam's.";
  if (score >= 7) return "You understood the key principles. The subtleties will come.";
  if (score >= 4) return "You identified the right direction. Study the reveal closely.";
  return "Every great dayan started here. Read the reasoning below.";
}

export default function RevealStage({
  results,
  revealChain,
  rulingExplanation,
  rulings,
  streak,
  puzzle,
  contentId,
}: RevealStageProps) {
  const [revealedSteps, setRevealedSteps] = useState(0);

  useEffect(() => {
    if (revealedSteps < revealChain.length + 1) {
      const timer = setTimeout(() => {
        setRevealedSteps((prev) => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [revealedSteps, revealChain.length]);

  const correctRulingIndex = rulings.findIndex((r) => r.is_correct);

  return (
    <div className="py-6">
      {/* Score */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-28 h-28 mx-auto rounded-full border-4 border-parchment-gold flex items-center justify-center mb-4">
          <div>
            <span className="text-[36px] font-bold text-primary block" style={{ fontFamily: "var(--font-sans)" }}>
              {results.total}
            </span>
            <span className="text-[14px] text-muted-gray">/12</span>
          </div>
        </div>
        <h2 className="font-serif text-[22px] font-semibold text-primary mb-1">{getScoreTitle(results.total)}</h2>
        <p className="text-[14px] text-muted-gray max-w-[400px] mx-auto">{getScoreSubtext(results.total)}</p>
      </div>

      {/* Scorecard */}
      <div className="bg-white rounded-[20px] border border-soft-border ios-card-shadow p-5 mb-6 animate-fade-in">
        <p
          className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-4"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          YOUR SCORECARD
        </p>

        <div className="flex items-center justify-between py-2.5 border-b border-soft-border">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-muted-gray" style={{ fontSize: "18px" }}>search</span>
            <span className="text-[14px] text-charcoal-text">Identify Principles</span>
          </div>
          <span className={`text-[15px] font-semibold ${results.identify.points > 0 ? "text-parchment-gold" : "text-soft-border"}`}>
            {results.identify.points}/3
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 border-b border-soft-border">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-muted-gray" style={{ fontSize: "18px" }}>psychology</span>
            <span className="text-[14px] text-charcoal-text">Apply the Law</span>
          </div>
          <span className={`text-[15px] font-semibold ${
            results.apply.reduce((s, a) => s + a.points, 0) > 0 ? "text-parchment-gold" : "text-soft-border"
          }`}>
            {results.apply.reduce((s, a) => s + a.points, 0)}/3
          </span>
        </div>

        {results.apply.map((a, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 pl-9">
            <span className="text-[12px] text-muted-gray">Principle {i + 1}</span>
            <span className="material-symbols-outlined" style={{ fontSize: "16px", color: a.points > 0 ? "#B8860B" : "#E5E5E7" }}>
              {a.points > 0 ? "check_circle" : "cancel"}
            </span>
          </div>
        ))}

        <div className="flex items-center justify-between py-2.5 mt-1">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-muted-gray" style={{ fontSize: "18px" }}>gavel</span>
            <span className="text-[14px] text-charcoal-text">The Ruling</span>
          </div>
          <span className={`text-[15px] font-semibold ${results.ruling.points > 0 ? "text-parchment-gold" : "text-soft-border"}`}>
            {results.ruling.points}/6
          </span>
        </div>
      </div>

      {/* Reasoning chain */}
      <div className="mb-6">
        <p
          className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-4"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          THE RAMBAM&#39;S REASONING
        </p>

        <div className="relative">
          <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-soft-border" />

          <div className="space-y-4">
            {revealChain.map((step, i) => {
              if (i >= revealedSteps) return null;
              const appResult = results.apply[i];
              const playerGotIt = (appResult?.points ?? 0) > 0;

              return (
                <div key={i} className="relative pl-10 animate-slide-up">
                  <div
                    className={`absolute left-[8px] top-1 w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center ${
                      playerGotIt ? "bg-parchment-gold border-parchment-gold" : "bg-white border-soft-border"
                    }`}
                  >
                    {playerGotIt && (
                      <span className="material-symbols-outlined text-white" style={{ fontSize: "10px" }}>check</span>
                    )}
                  </div>

                  <div className="bg-white rounded-[16px] border border-soft-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p
                        className="text-[10px] font-semibold tracking-[0.15em] uppercase text-parchment-gold"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        STEP {step.step} — CHAPTER {step.chapter}:{step.halacha}
                      </p>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "16px", color: playerGotIt ? "#B8860B" : "#E5E5E7" }}
                      >
                        {playerGotIt ? "check_circle" : "cancel"}
                      </span>
                    </div>
                    <p className="text-[14px] font-semibold text-primary mb-2">{step.principle_summary}</p>
                    <p className="text-[13px] leading-[21px] text-charcoal-text mb-3">{step.application_to_case}</p>
                    <div className="bg-surface-container-low rounded-[10px] p-3">
                      <p className="font-serif text-[13px] leading-[21px] text-primary italic">
                        &#34;{step.source_text}&#34;
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {revealedSteps > revealChain.length && correctRulingIndex >= 0 && (
              <div className="relative pl-10 animate-slide-up">
                <div className="absolute left-[8px] top-1 w-[16px] h-[16px] rounded-full bg-parchment-gold border-2 border-parchment-gold flex items-center justify-center">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: "10px" }}>gavel</span>
                </div>
                <div className="bg-primary rounded-[16px] p-5 text-white">
                  <p
                    className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3"
                    style={{ color: "#ffe088", fontFamily: "var(--font-sans)" }}
                  >
                    THE RAMBAM&#39;S RULING
                  </p>
                  <p className="font-serif text-[15px] leading-[24px] mb-4">{rulings[correctRulingIndex].text}</p>
                  <div className="rounded-[10px] p-3" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                    <p className="text-[13px] leading-[21px]" style={{ color: "#d1e4fb" }}>{rulingExplanation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="bg-white rounded-[20px] border border-soft-border ios-card-shadow p-5 mb-6 flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-parchment-gold" style={{ fontSize: "24px" }}>
            local_fire_department
          </span>
          <div>
            <p className="text-[15px] font-semibold text-charcoal-text">{streak} Day Streak</p>
            <p className="text-[13px] text-muted-gray">Keep it going tomorrow</p>
          </div>
        </div>
      </div>

      <ShareCard
        score={results.total}
        maxScore={12}
        results={results}
        chaptersLabel={puzzle.chaptersLabel}
        streak={streak}
        date={puzzle.date}
      />

      {/* Go Deeper */}
      <div className="mt-6 mb-4">
        <p
          className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-3"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          GO DEEPER
        </p>
        <div className="space-y-3">
          <Link
            href={contentId ? `/read/${contentId}` : "/"}
            className="w-full flex items-center justify-between p-4 bg-white rounded-[20px] ios-card-shadow border border-soft-border hover:bg-surface-container-low transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: "#d1e4fb" }}>
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>article</span>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-charcoal-text">Read Today&#39;s Essay</h3>
                <p className="text-[13px] text-muted-gray">{puzzle.chaptersLabel}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-muted-gray" style={{ fontSize: "20px" }}>chevron_right</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
