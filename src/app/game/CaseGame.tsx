"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CaseIntro from "./stages/CaseIntro";
import IdentifyStage from "./stages/IdentifyStage";
import ApplyStage from "./stages/ApplyStage";
import RulingStage from "./stages/RulingStage";
import RevealStage from "./stages/RevealStage";

type GameStage = "intro" | "identify" | "identify_result" | "apply" | "ruling" | "reveal";

interface Principle {
  id: string;
  text: string;
  chapter: number;
  halacha: number;
  is_relevant: boolean;
  why_relevant?: string;
  why_not?: string;
}

interface Application {
  principle_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface Ruling {
  text: string;
  is_correct: boolean;
}

interface RevealStep {
  step: number;
  chapter: number;
  halacha: number;
  principle_summary: string;
  application_to_case: string;
  source_text: string;
}

interface CaseData {
  case_narrative: string;
  case_title: string;
  principles: Principle[];
  applications: Application[];
  rulings: Ruling[];
  reveal_chain: RevealStep[];
  ruling_explanation: string;
}

interface PuzzleProps {
  date: string;
  chaptersLabel: string;
  sefer: string;
  hilchot: string;
  caseData: CaseData;
}

interface StageResults {
  identify: { selected: string[]; correct: string[]; points: number };
  apply: Array<{ principle_id: string; selected: number; correct: number; points: number }>;
  ruling: { selected: number; correct: number; points: number };
  total: number;
}

function makeId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function CaseGame({
  puzzle,
  contentId,
}: {
  puzzle: PuzzleProps;
  contentId?: string | null;
}) {
  const [stage, setStage] = useState<GameStage>("intro");
  const [streak, setStreak] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [results, setResults] = useState<StageResults>({
    identify: { selected: [], correct: [], points: 0 },
    apply: [],
    ruling: { selected: -1, correct: -1, points: 0 },
    total: 0,
  });

  // On mount: restore today's result (prevent replay), streak, device id.
  useEffect(() => {
    if (typeof window === "undefined") return;
    /* eslint-disable react-hooks/set-state-in-effect */
    const saved = localStorage.getItem("rambam_case_today_result");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === puzzle.date && parsed.results) {
          setResults(parsed.results);
          setStage("reveal");
        }
      } catch {
        // ignore malformed cache
      }
    }
    setStreak(parseInt(localStorage.getItem("rambam_case_streak") || "0", 10) || 0);
    if (!localStorage.getItem("rambam_case_device_id")) {
      localStorage.setItem("rambam_case_device_id", makeId());
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const correctPrinciples = puzzle.caseData.principles
    .filter((p) => p.is_relevant)
    .map((p) => p.id);

  const correctRulingIndex = puzzle.caseData.rulings.findIndex((r) => r.is_correct);

  function handleIdentifyComplete(selected: string[]) {
    const correct = selected.filter((id) => correctPrinciples.includes(id));
    const points = correct.length; // 1 point per correct pick, max 3
    setResults((prev) => ({
      ...prev,
      identify: { selected, correct: correctPrinciples, points },
    }));
    setStage("identify_result");
  }

  function handleIdentifyResultContinue() {
    setStage("apply");
  }

  function handleApplyComplete(
    applyResults: Array<{ principle_id: string; selected: number; correct: number; points: number }>
  ) {
    setResults((prev) => ({ ...prev, apply: applyResults }));
    setStage("ruling");
  }

  function handleRulingComplete(selectedIndex: number) {
    const points = selectedIndex === correctRulingIndex ? 6 : 0; // ruling is weighted: max 6
    const newResults: StageResults = {
      ...results,
      ruling: { selected: selectedIndex, correct: correctRulingIndex, points },
      total:
        results.identify.points +
        results.apply.reduce((sum, a) => sum + a.points, 0) +
        points,
    };
    setResults(newResults);
    setStage("reveal");

    localStorage.setItem(
      "rambam_case_today_result",
      JSON.stringify({ date: puzzle.date, results: newResults })
    );

    // Streak
    const lastPlayed = localStorage.getItem("rambam_case_last_played");
    const today = puzzle.date;
    let newStreak = 1;
    if (lastPlayed) {
      const lastDate = new Date(lastPlayed);
      const todayDate = new Date(today);
      const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000);
      if (diffDays === 1) newStreak = streak + 1;
      else if (diffDays === 2 && todayDate.getUTCDay() === 0) newStreak = streak + 1; // Shabbat skip
      else if (diffDays === 0) newStreak = streak || 1;
    }
    setStreak(newStreak);
    localStorage.setItem("rambam_case_streak", String(newStreak));
    localStorage.setItem("rambam_case_last_played", today);

    const deviceId = localStorage.getItem("rambam_case_device_id") || makeId();
    fetch("/api/game/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_id: deviceId,
        rambam_date: puzzle.date,
        score: newResults.total,
        max_score: 12,
        stage_results: newResults,
      }),
    }).catch(() => {});
  }

  const header = (
    <header
      className="sticky top-0 z-50 border-b border-soft-border bottom-nav-blur"
      style={{ backgroundColor: "rgba(253, 251, 247, 0.85)" }}
    >
      <div className="max-w-[600px] mx-auto px-5 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1 text-[15px] font-medium text-primary hover:text-parchment-gold transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back_ios</span>
          Home
        </Link>
        {stage !== "intro" && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-parchment-gold" style={{ fontSize: "18px" }}>
              local_fire_department
            </span>
            <span className="text-[15px] font-semibold text-primary">{streak}</span>
          </div>
        )}
      </div>
    </header>
  );

  const stageLabels = ["Identify", "Apply", "Rule"];
  const stageIndex =
    stage === "identify" || stage === "identify_result" ? 0 :
    stage === "apply" ? 1 :
    stage === "ruling" ? 2 : -1;

  const progressBar = stageIndex >= 0 && (
    <div className="max-w-[600px] mx-auto px-5 py-4">
      <div className="flex items-center gap-2">
        {stageLabels.map((label, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all ${
              i < stageIndex ? "bg-parchment-gold" :
              i === stageIndex ? "bg-primary" :
              "bg-soft-border"
            }`} />
            <p
              className={`text-[9px] font-semibold tracking-[0.1em] uppercase mt-1.5 text-center transition-colors ${
                i <= stageIndex ? "text-primary" : "text-muted-gray"
              }`}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  if (!hydrated) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen pb-28">
      {header}
      {progressBar}

      <main className="max-w-[600px] mx-auto px-5">
        {stage === "intro" && (
          <CaseIntro
            caseTitle={puzzle.caseData.case_title}
            caseNarrative={puzzle.caseData.case_narrative}
            chaptersLabel={puzzle.chaptersLabel}
            sefer={puzzle.sefer}
            date={puzzle.date}
            onContinue={() => setStage("identify")}
          />
        )}

        {(stage === "identify" || stage === "identify_result") && (
          <IdentifyStage
            principles={puzzle.caseData.principles}
            correctIds={correctPrinciples}
            showResults={stage === "identify_result"}
            onLockIn={handleIdentifyComplete}
            onContinue={handleIdentifyResultContinue}
          />
        )}

        {stage === "apply" && (
          <ApplyStage
            applications={puzzle.caseData.applications}
            caseNarrative={puzzle.caseData.case_narrative}
            onComplete={handleApplyComplete}
          />
        )}

        {stage === "ruling" && (
          <RulingStage
            rulings={puzzle.caseData.rulings}
            caseTitle={puzzle.caseData.case_title}
            onLockIn={handleRulingComplete}
          />
        )}

        {stage === "reveal" && (
          <RevealStage
            results={results}
            revealChain={puzzle.caseData.reveal_chain}
            rulingExplanation={puzzle.caseData.ruling_explanation}
            rulings={puzzle.caseData.rulings}
            streak={streak}
            puzzle={puzzle}
            contentId={contentId}
          />
        )}
      </main>
    </div>
  );
}
