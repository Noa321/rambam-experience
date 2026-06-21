"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ShareCard from "./ShareCard";

interface Round {
  chapter: number;
  clues: string[];
  options: string[];
  correct_index: number;
  source_text: string;
}

interface Puzzle {
  date: string;
  chaptersLabel: string;
  sefer: string;
  hilchot: string;
  rounds: Round[];
}

interface RoundResult {
  chapter: number;
  clues_used: number;
  points: number;
  correct: boolean;
}

const LS = {
  deviceId: "rambam_riddle_device_id",
  streak: "rambam_riddle_streak",
  lastPlayed: "rambam_riddle_last_played",
  todayResult: "rambam_riddle_today_result",
};

function makeId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function diffDays(a: string, b: string): number {
  const pa = a.split("-").map(Number);
  const pb = b.split("-").map(Number);
  const da = Date.UTC(pa[0], pa[1] - 1, pa[2]);
  const db = Date.UTC(pb[0], pb[1] - 1, pb[2]);
  return Math.round((db - da) / 86400000);
}

function dayOfWeekUTC(s: string): number {
  const p = s.split("-").map(Number);
  return new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay();
}

function computeStreak(lastPlayed: string | null, prevStreak: number, today: string): number {
  if (!lastPlayed) return 1;
  if (lastPlayed === today) return prevStreak || 1;
  const gap = diffDays(lastPlayed, today);
  if (gap === 1) return (prevStreak || 0) + 1;
  // Shabbat awareness: Friday -> Sunday (Saturday skipped) keeps the streak alive
  if (dayOfWeekUTC(today) === 0 && gap <= 2) return (prevStreak || 0) + 1;
  return 1;
}

function getScoreMessage(score: number): string {
  if (score >= 9) return "Perfect. You know the Rambam.";
  if (score >= 7) return "Impressive.";
  if (score >= 5) return "Solid.";
  if (score >= 3) return "Getting there.";
  return "Tomorrow is another day.";
}

export default function RiddleGame({
  puzzle,
  contentId,
}: {
  puzzle: Puzzle;
  contentId?: string | null;
}) {
  const [currentRound, setCurrentRound] = useState(0);
  const [currentClue, setCurrentClue] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [selectedWrong, setSelectedWrong] = useState<number | null>(null);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showScorePop, setShowScorePop] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const submittedRef = useRef(false);

  const round = puzzle.rounds[currentRound];
  const totalScore = roundResults.reduce((a, r) => a + r.points, 0);

  // On mount: device id, streak, and restore today's result if already played.
  // Reading from localStorage requires syncing into state after mount (SSR renders
  // defaults first to avoid a hydration mismatch), so setState here is intentional.
  useEffect(() => {
    if (typeof window === "undefined") return;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!localStorage.getItem(LS.deviceId)) {
      localStorage.setItem(LS.deviceId, makeId());
    }
    setStreak(parseInt(localStorage.getItem(LS.streak) || "0", 10) || 0);

    const saved = localStorage.getItem(LS.todayResult);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.date === puzzle.date && Array.isArray(parsed.roundResults)) {
          setRoundResults(parsed.roundResults);
          setStreak(parsed.streak ?? 0);
          submittedRef.current = true;
          setShowResults(true);
        }
      } catch {
        // ignore malformed cache
      }
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function recordResult(r: RoundResult) {
    setRoundResults((prev) => [...prev, r]);
  }

  function handleAnswer(i: number) {
    if (answered || disabledOptions.includes(i)) return;

    if (i === round.correct_index) {
      const points = 3 - currentClue;
      setPointsEarned(points);
      setShowScorePop(true);
      setTimeout(() => setShowScorePop(false), 1000);
      recordResult({
        chapter: round.chapter,
        clues_used: currentClue + 1,
        points,
        correct: true,
      });
      setAnswered(true);
      return;
    }

    // Wrong answer
    setSelectedWrong(i);
    setDisabledOptions((prev) => [...prev, i]);

    if (currentClue < 2) {
      setTimeout(() => {
        setSelectedWrong(null);
        setCurrentClue((c) => c + 1);
      }, 600);
    } else {
      // Wrong on the final clue — reveal the correct answer, 0 points
      setTimeout(() => {
        setSelectedWrong(null);
        recordResult({
          chapter: round.chapter,
          clues_used: 3,
          points: 0,
          correct: false,
        });
        setAnswered(true);
      }, 600);
    }
  }

  function finalize(finalResults: RoundResult[]) {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const today = puzzle.date;
    const prevStreak = parseInt(localStorage.getItem(LS.streak) || "0", 10) || 0;
    const lastPlayed = localStorage.getItem(LS.lastPlayed);
    const newStreak = computeStreak(lastPlayed, prevStreak, today);

    localStorage.setItem(LS.streak, String(newStreak));
    localStorage.setItem(LS.lastPlayed, today);
    const score = finalResults.reduce((a, r) => a + r.points, 0);
    localStorage.setItem(
      LS.todayResult,
      JSON.stringify({ date: today, roundResults: finalResults, score, streak: newStreak })
    );
    setStreak(newStreak);

    const deviceId = localStorage.getItem(LS.deviceId) || makeId();
    fetch("/api/game/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_id: deviceId,
        rambam_date: today,
        score,
        max_score: 9,
        round_results: finalResults,
      }),
    }).catch(() => {
      // best effort — score still saved locally
    });
  }

  function nextRound() {
    if (currentRound < puzzle.rounds.length - 1) {
      setCurrentRound((r) => r + 1);
      setCurrentClue(0);
      setAnswered(false);
      setDisabledOptions([]);
      setSelectedWrong(null);
    } else {
      finalize(roundResults);
      setShowResults(true);
    }
  }

  // Avoid hydration flicker
  if (!hydrated) {
    return <div className="min-h-screen" />;
  }

  /* ───────────────────────── RESULTS ───────────────────────── */
  if (showResults) {
    return (
      <div className="min-h-screen pb-28">
        <GameHeader streak={streak} />
        <div className="max-w-[600px] mx-auto px-5 py-8 animate-slide-up">
          {/* Score circle */}
          <div className="text-center mb-8">
            <div className="w-28 h-28 mx-auto rounded-full border-4 border-parchment-gold flex items-center justify-center mb-4">
              <div>
                <span
                  className="text-[36px] font-bold text-primary"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {totalScore}
                </span>
                <span className="text-[16px] text-muted-gray">/9</span>
              </div>
            </div>
            <h2 className="font-serif text-[22px] font-semibold text-primary mb-1">
              {getScoreMessage(totalScore)}
            </h2>
            <p className="text-[14px] text-muted-gray">
              {puzzle.chaptersLabel} | Sefer {puzzle.sefer}
            </p>
          </div>

          {/* Round breakdown */}
          <div className="bg-white rounded-[20px] border border-soft-border ios-card-shadow p-5 mb-6">
            <p
              className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-4"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              ROUND BY ROUND
            </p>
            <div className="space-y-3">
              {roundResults.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-[13px] font-semibold ${
                        r.points === 3
                          ? "bg-parchment-gold"
                          : r.points === 2
                          ? "bg-primary"
                          : r.points === 1
                          ? "bg-muted-gray"
                          : "bg-soft-border text-muted-gray"
                      }`}
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      Ch {r.chapter}
                    </div>
                    <span className="text-[14px] text-charcoal-text">
                      {r.correct ? `Solved on clue ${r.clues_used}` : "Not solved"}
                    </span>
                  </div>
                  <span
                    className={`text-[15px] font-semibold ${
                      r.points > 0 ? "text-parchment-gold" : "text-soft-border"
                    }`}
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    +{r.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-[20px] border border-soft-border ios-card-shadow p-5 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-parchment-gold"
                style={{ fontSize: "24px" }}
              >
                local_fire_department
              </span>
              <div>
                <p className="text-[15px] font-semibold text-charcoal-text">
                  {streak} Day Streak
                </p>
                <p className="text-[13px] text-muted-gray">Keep it going tomorrow</p>
              </div>
            </div>
          </div>

          {/* Share */}
          <ShareCard
            score={totalScore}
            maxScore={9}
            roundResults={roundResults}
            chaptersLabel={puzzle.chaptersLabel}
            streak={streak}
            date={puzzle.date}
          />

          {/* Go Deeper */}
          <div className="mt-8">
            <p
              className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-3"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              GO DEEPER
            </p>
            <div className="space-y-3">
              {contentId ? (
                <>
                  <DeepLink href={`/read/${contentId}`} icon="article" iconBg="#d1e4fb" iconColor="#162839" title="Read the Essay" sub="Today's d'var Torah" />
                  <DeepLink href={`/listen/${contentId}`} icon="headset" iconBg="#ffddb7" iconColor="#362308" title="Listen" sub="A quick spoken talk" />
                  <DeepLink href={`/learn/${contentId}`} icon="summarize" iconBg="#ffe088" iconColor="#735c00" title="One Page Summary" sub="On today's chapters" />
                </>
              ) : (
                <DeepLink href="/" icon="calendar_today" iconBg="#d1e4fb" iconColor="#162839" title="Back to Today" sub="Read, listen, and learn" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────────────────── PLAYING / ROUND RESULT ───────────────────────── */
  return (
    <div className="min-h-screen pb-28">
      <GameHeader streak={streak} />

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-3 py-4">
        {puzzle.rounds.map((_, i) => (
          <div
            key={i}
            className={`h-2.5 rounded-full transition-all ${
              i < currentRound
                ? "w-2.5 bg-parchment-gold"
                : i === currentRound
                ? "w-6 bg-primary"
                : "w-2.5 bg-soft-border"
            }`}
          />
        ))}
      </div>

      <div className="max-w-[600px] mx-auto px-5">
        <p
          className="text-[10px] font-semibold tracking-[0.15em] uppercase text-parchment-gold mb-2 text-center"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          CHAPTER {round.chapter}
        </p>

        {/* Clue card */}
        <div className="bg-white rounded-[20px] border border-soft-border ios-card-shadow p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="material-symbols-outlined text-parchment-gold"
              style={{ fontSize: "20px" }}
            >
              lightbulb
            </span>
            <p
              className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              CLUE {currentClue + 1} OF 3
            </p>
          </div>
          <p className="font-serif text-[17px] leading-[28px] text-primary">
            {round.clues[currentClue]}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {round.options.map((option, i) => {
            const isCorrect = answered && i === round.correct_index;
            const isDisabled = disabledOptions.includes(i);
            const isJustWrong = selectedWrong === i;
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={isDisabled || answered}
                className={`w-full text-left p-4 rounded-[16px] border transition-all ${
                  isCorrect
                    ? "border-parchment-gold bg-[#fdf8ef] animate-pulse-gold"
                    : isDisabled
                    ? "border-soft-border bg-surface-container-low opacity-40"
                    : isJustWrong
                    ? "border-red-400 bg-red-50 animate-shake"
                    : "border-soft-border bg-white hover:border-outline-variant hover:bg-surface-container-low active:scale-[0.98]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 mt-0.5 ${
                      isCorrect
                        ? "bg-parchment-gold text-white"
                        : "bg-surface-container text-muted-gray"
                    }`}
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-[15px] leading-[22px] text-charcoal-text">
                    {option}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Source reveal + next */}
        {answered && (
          <div className="mt-6 animate-slide-up">
            <div className="bg-surface-container-low rounded-[16px] p-5 border border-soft-border">
              <p
                className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-gray mb-3"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                FROM THE RAMBAM
              </p>
              <p className="font-serif text-[15px] leading-[24px] text-primary italic">
                {round.source_text}
              </p>
            </div>
            <button
              onClick={nextRound}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-medium rounded-full hover:opacity-90 transition-opacity active:scale-[0.99]"
            >
              {currentRound < puzzle.rounds.length - 1 ? "Next Round" : "See Results"}
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                arrow_forward
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Score pop */}
      {showScorePop && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 animate-score-pop pointer-events-none z-50">
          <span
            className="text-[48px] font-bold text-parchment-gold"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            +{pointsEarned}
          </span>
        </div>
      )}
    </div>
  );
}

function GameHeader({ streak }: { streak: number }) {
  return (
    <header
      className="sticky top-0 z-50 border-b border-soft-border bottom-nav-blur"
      style={{ backgroundColor: "rgba(253, 251, 247, 0.85)" }}
    >
      <div className="max-w-[600px] mx-auto px-5 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1 text-[15px] font-medium text-primary hover:text-parchment-gold transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            arrow_back_ios
          </span>
          Home
        </Link>
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-parchment-gold"
            style={{ fontSize: "18px" }}
          >
            local_fire_department
          </span>
          <span className="text-[15px] font-semibold text-primary">{streak}</span>
        </div>
      </div>
    </header>
  );
}

function DeepLink({
  href,
  icon,
  iconBg,
  iconColor,
  title,
  sub,
}: {
  href: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-soft-border hover:bg-surface-container-low transition-colors active:scale-[0.99]"
      style={{ borderLeft: "3px solid #B8860B" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px", color: iconColor }}>
            {icon}
          </span>
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-charcoal-text">{title}</h3>
          <p className="text-[13px] text-muted-gray">{sub}</p>
        </div>
      </div>
      <span className="material-symbols-outlined text-muted-gray" style={{ fontSize: "20px" }}>
        chevron_right
      </span>
    </Link>
  );
}
