"use client";

import { useState, useMemo } from "react";
import Icon from "../Icon";
import { getDailyStudy, getDailyStudyLabel, getTotalChapters } from "@/lib/daily-study";
import { quests } from "@/data/sample";

interface DashboardProps {
  onNavigate: (section: string, data?: Record<string, unknown>) => void;
}

/* Accent colors for the 14 book-spine bars in the hero graphic */
const SPINE_HEIGHTS = [52, 68, 84, 60, 96, 76, 88, 64, 100, 58, 80, 72, 56, 92];
const SPINE_COLORS = [
  "rgba(192,57,43,0.5)", "rgba(255,255,255,0.2)", "rgba(142,68,173,0.4)",
  "rgba(255,255,255,0.15)", "rgba(192,57,43,0.35)", "rgba(255,255,255,0.25)",
  "rgba(41,128,185,0.4)", "rgba(255,255,255,0.18)", "rgba(192,57,43,0.45)",
  "rgba(255,255,255,0.12)", "rgba(39,174,96,0.35)", "rgba(255,255,255,0.2)",
  "rgba(192,57,43,0.3)", "rgba(255,255,255,0.22)",
];

/* Pill definitions for the quick-action row */
const PILLS = [
  { id: "insights", icon: "auto_awesome", label: "Daily Insights", color: "#D4A574" },
  { id: "podcast", icon: "headphones", label: "Podcast", color: "#8B7EC8" },
  { id: "library", icon: "library_books", label: "Library", color: "#2C3E50" },
  { id: "quiz", icon: "quiz", label: "Quiz", color: "#C0392B" },
  { id: "infographic", icon: "image", label: "Infographic", color: "#5BA68A" },
];

/* Community avatars (placeholder) */
const COMMUNITY = [
  { bg: "#C0392B", initials: "SR" },
  { bg: "#2C3E50", initials: "DK" },
  { bg: "#8E44AD", initials: "ML" },
  { bg: "#27AE60", initials: "AB" },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  /* Daily study calculation */
  const study = useMemo(() => getDailyStudy(), []);
  const studyLabel = useMemo(() => getDailyStudyLabel(study), [study]);
  const totalChapters = getTotalChapters();
  const firstChapter = study.chapters[0];

  const togglePanel = (panel: string) =>
    setActivePanel((prev) => (prev === panel ? null : panel));

  return (
    <section className="animate-fade-in">
      {/* ─── TOPBAR ─── */}
      <header className="sticky top-0 z-40 flex items-center bg-white/90 ios-blur px-4 py-3 lg:py-4 justify-between border-b border-gray-100 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="lg:hidden size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            NR
          </div>
          <div>
            <h1 className="text-primary text-base lg:text-lg font-bold leading-tight">
              Torah Learning
            </h1>
            <p className="text-accent-red text-[10px] font-bold uppercase tracking-widest">
              Scholar Tier · Day {study.dayOfCycle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent-red/10">
          <Icon name="local_fire_department" className="text-accent-red text-lg streak-glow" filled />
          <span className="text-accent-red text-sm font-bold">12</span>
        </div>
      </header>

      <main className="pb-28 lg:pb-8">
        <div className="lg:flex lg:gap-8 lg:p-8">
          {/* ═══════════ LEFT COLUMN ═══════════ */}
          <div className="lg:flex-1 space-y-4">

            {/* ─── HERO INFOGRAPHIC + STUDY CARD ─── */}
            <div className="p-4 lg:p-0">
              {/* Dark graphic area */}
              <div
                className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a2a3a] via-primary to-[#34495e]"
                style={{ minHeight: "280px" }}
              >
                {/* Hebrew watermark */}
                <div
                  className="absolute top-4 right-5 text-[80px] leading-none text-white/[0.04] pointer-events-none select-none"
                  style={{ fontFamily: "var(--font-hebrew)" }}
                >
                  {firstChapter?.treatise.heName || "תורה"}
                </div>

                {/* Subtle geometric connection lines */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
                  <line x1="8%" y1="22%" x2="38%" y2="38%" stroke="white" strokeWidth="1" />
                  <line x1="38%" y1="38%" x2="65%" y2="28%" stroke="white" strokeWidth="1" />
                  <line x1="65%" y1="28%" x2="92%" y2="42%" stroke="white" strokeWidth="1" />
                  <circle cx="8%" cy="22%" r="3" fill="rgba(255,255,255,0.3)" />
                  <circle cx="38%" cy="38%" r="4" fill="rgba(255,255,255,0.2)" />
                  <circle cx="65%" cy="28%" r="3" fill="rgba(255,255,255,0.3)" />
                  <circle cx="92%" cy="42%" r="3" fill="rgba(255,255,255,0.2)" />
                </svg>

                {/* CURRENT STUDY badge */}
                <div className="absolute top-5 left-5">
                  <span className="inline-flex items-center gap-2 bg-accent-red text-white px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] shadow-lg shadow-accent-red/30">
                    <span className="size-1.5 rounded-full bg-white animate-pulse" />
                    Current Study
                  </span>
                </div>

                {/* Cycle progress ring */}
                <div className="absolute top-5 right-5 flex flex-col items-center">
                  <div className="relative size-14">
                    <svg className="size-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                      <circle
                        cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="3"
                        strokeDasharray={`${(study.cycleProgress / 100) * 151} 151`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">{study.cycleProgress}%</span>
                    </div>
                  </div>
                  <p className="text-white/40 text-[8px] font-bold mt-1 uppercase tracking-wider">
                    Cycle {study.cycleNumber}
                  </p>
                </div>

                {/* Decorative book-spine bars along bottom */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[3px] px-6 opacity-20 pointer-events-none">
                  {SPINE_HEIGHTS.map((h, i) => (
                    <div
                      key={i}
                      className="rounded-t-sm"
                      style={{ width: 14, height: h, background: SPINE_COLORS[i] }}
                    />
                  ))}
                </div>

                {/* Bottom spacer so the card overlaps neatly */}
                <div className="h-24" />
              </div>

              {/* White study card — overlaps hero bottom */}
              <div className="-mt-16 mx-2 relative z-10">
                <div className="bg-white rounded-2xl p-5 shadow-xl shadow-black/[0.08] border border-gray-100/50">
                  <p className="text-warm-grey text-[10px] font-bold uppercase tracking-widest mb-1">
                    Day {study.dayOfCycle} of {study.totalDays} · Cycle {study.cycleNumber}
                  </p>
                  <h2 className="text-primary text-xl lg:text-2xl font-bold leading-tight">
                    {studyLabel}
                  </h2>
                  <p className="text-warm-grey text-xs mt-1">
                    {study.chapters.length} chapters · ~15 min read
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 mt-3 mb-4">
                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-deep-red h-full rounded-full transition-all duration-700"
                        style={{ width: `${study.cycleProgress}%` }}
                      />
                    </div>
                    <span className="text-primary text-xs font-bold shrink-0">
                      {study.cycleProgress}%
                    </span>
                  </div>

                  {/* Community avatars + CTA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {COMMUNITY.map((u, i) => (
                          <div
                            key={i}
                            className="size-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-bold"
                            style={{ background: u.bg }}
                          >
                            {u.initials}
                          </div>
                        ))}
                      </div>
                      <span className="text-warm-grey text-[10px] font-bold hidden sm:inline">
                        +12 studying now
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        firstChapter &&
                        onNavigate("chapter", {
                          treatiseId: firstChapter.treatise.id,
                          chapter: firstChapter.chapter,
                        })
                      }
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-[0.97] text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide shadow-lg shadow-primary/20 transition-all cursor-pointer"
                    >
                      <Icon name="play_arrow" className="text-base" filled />
                      Continue Learning
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── COMPACT PILLS ROW ─── */}
            <div className="px-4 lg:px-0">
              <div className="flex flex-wrap gap-2">
                {PILLS.map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => {
                      if (pill.id === "library") {
                        onNavigate("library");
                      } else {
                        togglePanel(pill.id);
                      }
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border
                      ${
                        activePanel === pill.id
                          ? "bg-primary/[0.06] border-primary/20 text-primary shadow-sm"
                          : "bg-[#FAF8F5] border-gray-100 text-slate-grey hover:border-gray-200 hover:shadow-sm"
                      }`}
                  >
                    <Icon name={pill.icon} className="text-base" style={{ color: pill.color }} />
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── EXPANDABLE PANEL: Daily Insights ─── */}
            {activePanel === "insights" && (
              <div className="px-4 lg:px-0 animate-fade-in">
                <div className="p-5 bg-white border border-gray-100 rounded-2xl ios-shadow space-y-4">
                  <div className="flex items-start gap-3">
                    <Icon name="lightbulb" className="text-amber-500 text-xl shrink-0 mt-0.5" filled />
                    <div>
                      <p className="text-primary text-sm font-bold mb-1">Key Concept</p>
                      <p className="text-slate-grey text-sm leading-relaxed">
                        Today's study explores foundational principles. Each halacha builds
                        upon the previous, creating a systematic framework for understanding the
                        Rambam's legal methodology.
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div className="flex items-start gap-3">
                    <Icon name="link" className="text-primary text-xl shrink-0 mt-0.5" />
                    <div>
                      <p className="text-primary text-sm font-bold mb-1">Connections</p>
                      <p className="text-slate-grey text-sm leading-relaxed">
                        Related to concepts in Sefer HaMitzvot and echoed in the Shulchan Aruch.
                        The Rambam's unique approach here differs from other Rishonim.
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div className="flex items-start gap-3">
                    <Icon name="psychology" className="text-deep-red text-xl shrink-0 mt-0.5" />
                    <div>
                      <p className="text-primary text-sm font-bold mb-1">Practical Takeaway</p>
                      <p className="text-slate-grey text-sm leading-relaxed">
                        Understanding these principles has direct application to daily observance
                        and provides the philosophical underpinning for many mitzvot.
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-warm-grey text-center uppercase tracking-widest pt-1">
                    AI-generated · Updated daily
                  </p>
                </div>
              </div>
            )}

            {/* ─── EXPANDABLE PANEL: Podcast ─── */}
            {activePanel === "podcast" && (
              <div className="px-4 lg:px-0 animate-fade-in">
                <div className="p-5 bg-white border border-gray-100 rounded-2xl ios-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="size-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/50">
                      <Icon name="play_arrow" className="text-white text-2xl" filled />
                    </div>
                    <div className="flex-1">
                      <p className="text-primary text-sm font-bold">{studyLabel}</p>
                      <p className="text-warm-grey text-xs mt-0.5">
                        Episode {study.dayOfCycle} · 8 min
                      </p>
                    </div>
                  </div>

                  {/* Waveform visualizer */}
                  <div className="relative mb-3">
                    <div className="flex items-center gap-0.5 h-8 overflow-hidden">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-full bg-violet-200"
                          style={{ height: `${8 + ((i * 7 + 13) % 24)}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-warm-grey font-medium">
                    <span>0:00</span>
                    <span>8:24</span>
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-4">
                    <button className="text-warm-grey hover:text-primary transition-colors cursor-pointer">
                      <Icon name="replay_10" className="text-2xl" />
                    </button>
                    <button className="size-12 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg hover:bg-violet-700 transition-colors cursor-pointer">
                      <Icon name="play_arrow" className="text-2xl" filled />
                    </button>
                    <button className="text-warm-grey hover:text-primary transition-colors cursor-pointer">
                      <Icon name="forward_30" className="text-2xl" />
                    </button>
                  </div>
                  <p className="text-[10px] text-warm-grey text-center uppercase tracking-widest mt-4">
                    AI-generated podcast · Updated daily
                  </p>
                </div>
              </div>
            )}

            {/* ─── TODAY'S CHAPTERS ─── */}
            <div className="px-4 lg:px-0">
              <p className="text-warm-grey text-[10px] font-bold uppercase tracking-widest mb-2">
                Today's Chapters
              </p>
              <div className="space-y-2">
                {study.chapters.map((ch) => (
                  <button
                    key={`${ch.treatise.id}-${ch.chapter}`}
                    onClick={() =>
                      onNavigate("chapter", {
                        treatiseId: ch.treatise.id,
                        chapter: ch.chapter,
                      })
                    }
                    className="w-full flex items-center gap-3 bg-[#FAF8F5] hover:bg-[#F5F0EA] border border-gray-100 p-3 rounded-xl transition-all cursor-pointer group"
                  >
                    <div
                      className="size-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                      style={{ background: ch.bookColor }}
                    >
                      {ch.chapter}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-primary font-semibold text-sm leading-tight">
                        {ch.treatise.name}
                      </p>
                      <p className="text-warm-grey text-[10px] mt-0.5">
                        Chapter {ch.chapter} of {ch.treatise.chapters} · Sefer {ch.bookEng}
                      </p>
                    </div>
                    <Icon
                      name="arrow_forward_ios"
                      className="text-gray-300 text-sm group-hover:text-primary transition-colors"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════ RIGHT COLUMN ═══════════ */}
          <div className="lg:w-[340px] xl:w-[380px] lg:shrink-0">

            {/* ─── STREAK + XP + RANK ─── */}
            <div className="flex gap-3 px-4 lg:px-0 py-2">
              <div className="flex flex-1 flex-col gap-1 rounded-2xl p-4 bg-white border border-gray-100 ios-shadow">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-warm-grey text-[10px] font-bold uppercase tracking-wider">Streak</p>
                  <Icon name="local_fire_department" className="text-accent-red text-lg streak-glow" filled />
                </div>
                <p className="text-primary text-2xl font-bold leading-none">12</p>
                <p className="text-accent-red text-[9px] font-bold mt-1 uppercase">Days</p>
              </div>
              <div className="flex flex-1 flex-col gap-1 rounded-2xl p-4 bg-white border border-gray-100 ios-shadow">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-warm-grey text-[10px] font-bold uppercase tracking-wider">XP</p>
                  <Icon name="stars" className="text-slate-grey text-lg" filled />
                </div>
                <p className="text-primary text-2xl font-bold leading-none">2,450</p>
                <p className="text-warm-grey text-[9px] font-bold mt-1 uppercase">+150 Today</p>
              </div>
              <div className="flex flex-1 flex-col gap-1 rounded-2xl p-4 bg-white border border-gray-100 ios-shadow">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-warm-grey text-[10px] font-bold uppercase tracking-wider">Rank</p>
                  <Icon name="emoji_events" className="text-amber-500 text-lg" filled />
                </div>
                <p className="text-primary text-2xl font-bold leading-none">#142</p>
                <p className="text-green-600 text-[9px] font-bold mt-1 uppercase">Gold</p>
              </div>
            </div>

            {/* ─── ANNUAL CYCLE PROGRESS ─── */}
            <div className="px-4 lg:px-0 pt-2 pb-2">
              <div className="rounded-2xl bg-white border border-gray-100 p-5 ios-shadow">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-primary text-sm font-bold">Annual Cycle</p>
                  <span className="text-accent-red text-xs font-bold">{study.cycleProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-gradient-to-r from-primary to-deep-red h-full rounded-full transition-all duration-1000"
                    style={{ width: `${study.cycleProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-warm-grey">
                  <span>Day {study.dayOfCycle}</span>
                  <span>{totalChapters} total chapters</span>
                </div>
              </div>
            </div>

            {/* ─── DAILY QUESTS ─── */}
            <div className="px-4 lg:px-0 pt-4 pb-2 flex justify-between items-end">
              <h2 className="text-primary text-sm font-bold tracking-tight uppercase">
                Daily Quests
              </h2>
              <span className="text-accent-red text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:underline">
                See All
              </span>
            </div>
            <div className="px-4 lg:px-0 space-y-2">
              {quests.map((q) => (
                <div
                  key={q.id}
                  className={`flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-xl ios-shadow ${
                    q.locked ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-center rounded-lg bg-slate-bg text-primary shrink-0 size-10">
                    <Icon
                      name={q.id === 1 ? "menu_book" : q.id === 2 ? "history_edu" : "quiz"}
                      className="text-xl"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-primary text-xs font-bold">{q.text}</p>
                    <p className="text-warm-grey text-[10px] font-medium">
                      {q.desc} · <span className="text-accent-red font-bold">+{q.xp} XP</span>
                    </p>
                  </div>
                  {q.locked ? (
                    <Icon name="lock" className="text-gray-300 text-lg" />
                  ) : (
                    <div
                      className={`size-6 rounded-full border-2 flex items-center justify-center ${
                        q.done ? "bg-primary border-primary" : "border-gray-200"
                      }`}
                    >
                      {q.done && <Icon name="check" className="text-white text-sm" />}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ─── LEAGUE CARD ─── */}
            <div className="px-4 lg:px-0 mt-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 ios-shadow">
                <div className="flex items-center gap-3">
                  <div className="size-10 flex items-center justify-center bg-primary text-white rounded-full font-bold text-xs ring-4 ring-primary/10">
                    #142
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">Gold League</h4>
                    <div className="flex items-center gap-1">
                      <Icon name="trending_up" className="text-green-600 text-[14px]" />
                      <span className="text-[10px] text-green-600 font-bold uppercase tracking-tight">
                        Moving Up
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex gap-1 items-end h-5">
                    <div className="w-1 h-2 bg-primary/20 rounded-full" />
                    <div className="w-1 h-4 bg-primary/40 rounded-full" />
                    <div className="w-1 h-1.5 bg-primary/20 rounded-full" />
                    <div className="w-1 h-3 bg-primary/60 rounded-full" />
                    <div className="w-1 h-5 bg-primary rounded-full" />
                  </div>
                  <p className="text-[8px] text-warm-grey font-bold tracking-wider uppercase">
                    Weekly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}