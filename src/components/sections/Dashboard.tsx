"use client";

import { useState, useMemo } from "react";
import Icon from "../Icon";
import { getDailyStudy, getDailyStudyLabel, getTotalChapters } from "@/lib/daily-study";
import { quests } from "@/data/sample";

interface DashboardProps {
  onNavigate: (section: string, data?: Record<string, unknown>) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [podcastOpen, setPodcastOpen] = useState(false);

  // Calculate today's real study from the Rambam cycle
  const study = useMemo(() => getDailyStudy(), []);
  const studyLabel = useMemo(() => getDailyStudyLabel(study), [study]);
  const totalChapters = getTotalChapters();

  // First chapter of today's study (for the main CTA)
  const firstChapter = study.chapters[0];

  return (
    <section className="animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center bg-white/90 ios-blur px-4 py-3 lg:py-4 justify-between border-b border-gray-100 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="lg:hidden flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
            NR
          </div>
          <div>
            <h1 className="text-primary text-base lg:text-lg font-bold leading-tight">
              The Rambam Experience
            </h1>
            <p className="text-accent-red text-[10px] font-bold uppercase tracking-widest">
              Day {study.dayOfCycle} of {study.totalDays} · Cycle {study.cycleNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent-red/10">
            <Icon name="local_fire_department" className="text-accent-red text-lg streak-glow" filled />
            <span className="text-accent-red text-sm font-bold">12</span>
          </div>
        </div>
      </header>

      <main className="pb-28 lg:pb-8">
        <div className="lg:flex lg:gap-8 lg:p-8">
          {/* ===== LEFT COLUMN ===== */}
          <div className="lg:flex-1 space-y-4">

            {/* ── TODAY'S STUDY HERO ── */}
            <div className="p-4 lg:p-0">
              <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/80 shadow-xl shadow-primary/15">
                {/* Top section with label + cycle progress ring */}
                <div className="relative px-6 pt-6 pb-4">
                  {/* Decorative Hebrew watermark */}
                  <div
                    className="absolute top-3 right-4 text-[72px] leading-none text-white/[0.04] pointer-events-none select-none"
                    style={{ fontFamily: "var(--font-hebrew)" }}
                  >
                    {firstChapter?.treatise.heName || "תורה"}
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1.5 bg-white/15 text-white/90 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                        <Icon name="wb_sunny" className="text-sm" /> Today&apos;s Study
                      </span>
                      <h2 className="text-white text-2xl lg:text-3xl font-bold leading-tight mt-2">
                        {studyLabel}
                      </h2>
                      <p className="text-white/60 text-xs mt-2 font-medium">
                        {study.chapters.length} chapters · ~15 min read
                      </p>
                    </div>

                    {/* Cycle progress ring */}
                    <div className="shrink-0 ml-4">
                      <div className="relative size-16">
                        <svg className="size-16 -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                          <circle
                            cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="4"
                            strokeDasharray={`${(study.cycleProgress / 100) * 176} 176`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{study.cycleProgress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapter cards */}
                <div className="px-4 pb-4 space-y-2">
                  {study.chapters.map((ch, i) => (
                    <button
                      key={`${ch.treatise.id}-${ch.chapter}`}
                      onClick={() => onNavigate("chapter", { treatiseId: ch.treatise.id, chapter: ch.chapter })}
                      className="w-full flex items-center gap-4 bg-white/10 hover:bg-white/[0.18] active:bg-white/[0.22] backdrop-blur-sm rounded-xl p-4 transition-all cursor-pointer group"
                    >
                      <div
                        className="size-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg"
                        style={{ background: ch.bookColor }}
                      >
                        {ch.chapter}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-semibold text-sm leading-tight">
                          {ch.treatise.name}
                        </p>
                        <p className="text-white/50 text-xs mt-0.5">
                          Chapter {ch.chapter} of {ch.treatise.chapters} · Sefer {ch.bookEng}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {i === 0 && (
                          <span className="bg-white/20 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                            Start
                          </span>
                        )}
                        <Icon name="arrow_forward_ios" className="text-white/40 text-sm group-hover:text-white/80 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Start studying CTA */}
                <div className="px-4 pb-5">
                  <button
                    onClick={() => firstChapter && onNavigate("chapter", { treatiseId: firstChapter.treatise.id, chapter: firstChapter.chapter })}
                    className="w-full h-13 rounded-xl bg-white text-primary font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Icon name="play_arrow" className="text-xl" filled />
                    BEGIN TODAY&apos;S STUDY
                  </button>
                </div>
              </div>
            </div>

            {/* ── DAILY INSIGHTS (expandable pill) ── */}
            <div className="px-4 lg:px-0">
              <button
                onClick={() => setInsightsOpen(!insightsOpen)}
                className="w-full flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-4 rounded-2xl hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="size-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-md shadow-amber-200/50 shrink-0">
                  <Icon name="auto_awesome" className="text-white text-xl" filled />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-primary font-bold text-sm">Daily Insights</p>
                  <p className="text-warm-grey text-xs mt-0.5">AI-powered summary &amp; key takeaways</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    New
                  </span>
                  <Icon name={insightsOpen ? "expand_less" : "expand_more"} className="text-warm-grey" />
                </div>
              </button>

              {insightsOpen && (
                <div className="mt-3 p-5 bg-white border border-gray-100 rounded-2xl ios-shadow animate-fade-in space-y-4">
                  <div className="flex items-start gap-3">
                    <Icon name="lightbulb" className="text-amber-500 text-xl shrink-0 mt-0.5" filled />
                    <div>
                      <p className="text-primary text-sm font-bold mb-1">Key Concept</p>
                      <p className="text-slate-grey text-sm leading-relaxed">
                        Today&apos;s study explores foundational principles. Each halacha builds upon the previous,
                        creating a systematic framework for understanding the Rambam&apos;s legal methodology.
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
                        The Rambam&apos;s unique approach here differs from other Rishonim.
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
              )}
            </div>

            {/* ── DAILY PODCAST (expandable pill) ── */}
            <div className="px-4 lg:px-0">
              <button
                onClick={() => setPodcastOpen(!podcastOpen)}
                className="w-full flex items-center gap-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200/60 p-4 rounded-2xl hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="size-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-200/50 shrink-0">
                  <Icon name="headphones" className="text-white text-xl" filled />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-primary font-bold text-sm">Daily Podcast</p>
                  <p className="text-warm-grey text-xs mt-0.5">Listen to today&apos;s study · 8 min</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 items-end h-4">
                    <div className="w-[3px] h-2 bg-violet-400 rounded-full animate-pulse" />
                    <div className="w-[3px] h-3 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: "0.15s" }} />
                    <div className="w-[3px] h-4 bg-violet-600 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
                    <div className="w-[3px] h-2.5 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: "0.45s" }} />
                  </div>
                  <Icon name={podcastOpen ? "expand_less" : "expand_more"} className="text-warm-grey" />
                </div>
              </button>

              {podcastOpen && (
                <div className="mt-3 p-5 bg-white border border-gray-100 rounded-2xl ios-shadow animate-fade-in">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="size-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/50">
                      <Icon name="play_arrow" className="text-white text-3xl" filled />
                    </div>
                    <div className="flex-1">
                      <p className="text-primary text-sm font-bold">{studyLabel}</p>
                      <p className="text-warm-grey text-xs mt-0.5">Episode {study.dayOfCycle} · 8 min</p>
                    </div>
                  </div>

                  {/* Fake waveform / progress bar */}
                  <div className="relative mb-3">
                    <div className="flex items-center gap-0.5 h-8 overflow-hidden">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-full bg-violet-200"
                          style={{ height: `${Math.random() * 24 + 8}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-warm-grey font-medium">
                    <span>0:00</span>
                    <span>8:24</span>
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-4">
                    <button className="text-warm-grey hover:text-primary transition-colors">
                      <Icon name="replay_10" className="text-2xl" />
                    </button>
                    <button className="size-12 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg hover:bg-violet-700 transition-colors">
                      <Icon name="play_arrow" className="text-2xl" filled />
                    </button>
                    <button className="text-warm-grey hover:text-primary transition-colors">
                      <Icon name="forward_30" className="text-2xl" />
                    </button>
                  </div>
                  <p className="text-[10px] text-warm-grey text-center uppercase tracking-widest mt-4">
                    AI-generated podcast · Updated daily
                  </p>
                </div>
              )}
            </div>

            {/* ── INFOGRAPHIC CARD ── */}
            <div className="px-4 lg:px-0">
              <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 p-4 rounded-2xl hover:shadow-sm transition-all cursor-pointer">
                <div className="size-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200/50 shrink-0">
                  <Icon name="image" className="text-white text-xl" filled />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-primary font-bold text-sm">Today&apos;s Infographic</p>
                  <p className="text-warm-grey text-xs mt-0.5">Visual breakdown of key halachot</p>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  View
                </span>
              </div>
            </div>
          </div>

          {/* ===== RIGHT COLUMN (Stats + Progress + Quests) ===== */}
          <div className="lg:w-[340px] xl:w-[380px] lg:shrink-0">

            {/* ── CYCLE PROGRESS ── */}
            <div className="px-4 lg:px-0 pt-4 lg:pt-0 pb-2">
              <div className="rounded-2xl bg-white border border-gray-100 p-5 ios-shadow">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-primary text-sm font-bold">Annual Cycle Progress</p>
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

            {/* ── STREAK + XP ── */}
            <div className="flex gap-3 px-4 lg:px-0 py-2">
              <div className="flex flex-1 flex-col gap-1 rounded-2xl p-4 bg-white border border-gray-100 ios-shadow">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-warm-grey text-[10px] font-bold uppercase tracking-wider">
                    Streak
                  </p>
                  <Icon name="local_fire_department" className="text-accent-red text-lg streak-glow" filled />
                </div>
                <p className="text-primary text-2xl font-bold leading-none">12</p>
                <p className="text-accent-red text-[9px] font-bold mt-1 uppercase">Days</p>
              </div>
              <div className="flex flex-1 flex-col gap-1 rounded-2xl p-4 bg-white border border-gray-100 ios-shadow">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-warm-grey text-[10px] font-bold uppercase tracking-wider">
                    XP
                  </p>
                  <Icon name="stars" className="text-slate-grey text-lg" filled />
                </div>
                <p className="text-primary text-2xl font-bold leading-none">2,450</p>
                <p className="text-warm-grey text-[9px] font-bold mt-1 uppercase">+150 Today</p>
              </div>
              <div className="flex flex-1 flex-col gap-1 rounded-2xl p-4 bg-white border border-gray-100 ios-shadow">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-warm-grey text-[10px] font-bold uppercase tracking-wider">
                    Rank
                  </p>
                  <Icon name="emoji_events" className="text-amber-500 text-lg" filled />
                </div>
                <p className="text-primary text-2xl font-bold leading-none">#142</p>
                <p className="text-green-600 text-[9px] font-bold mt-1 uppercase">Gold</p>
              </div>
            </div>

            {/* ── DAILY QUESTS ── */}
            <div className="px-4 lg:px-0 pt-4 pb-2 flex justify-between items-end">
              <h2 className="text-primary text-sm font-bold tracking-tight uppercase">Daily Quests</h2>
              <span className="text-accent-red text-[10px] font-bold uppercase tracking-wider cursor-pointer">
                See All
              </span>
            </div>
            <div className="px-4 lg:px-0 space-y-2">
              {quests.map((q) => (
                <div
                  key={q.id}
                  className={`flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-xl ios-shadow ${q.locked ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-center rounded-lg bg-slate-bg text-primary shrink-0 size-10">
                    <Icon name={q.id === 1 ? "menu_book" : q.id === 2 ? "history_edu" : "quiz"} className="text-xl" />
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
                    <div className={`size-6 rounded-full border-2 flex items-center justify-center ${q.done ? "bg-primary border-primary" : "border-gray-200"}`}>
                      {q.done && <Icon name="check" className="text-white text-sm" />}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── LEAGUE CARD ── */}
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
                  <p className="text-[8px] text-warm-grey font-bold tracking-wider uppercase">Weekly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
