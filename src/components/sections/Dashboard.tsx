"use client";

import Icon from "../Icon";
import { quests } from "@/data/sample";

interface DashboardProps {
  onNavigate: (section: string, data?: Record<string, unknown>) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
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
              Torah Learning
            </h1>
            <p className="text-accent-red text-[10px] font-bold uppercase tracking-widest">
              Scholar Tier
            </p>
          </div>
        </div>
        <button className="flex size-10 items-center justify-center rounded-full bg-primary/5 text-primary">
          <Icon name="calendar_today" className="text-[22px]" />
        </button>
      </header>

      <main className="pb-28 lg:pb-8">
        <div className="lg:flex lg:gap-6 lg:p-8">
          {/* Left: Study card */}
          <div className="lg:flex-1">
            <div className="p-4 lg:p-0">
              <div
                onClick={() => onNavigate("chapter", { treatiseId: "foundations", chapter: 1 })}
                className="cursor-pointer flex flex-col rounded-xl overflow-hidden bg-slate-bg border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="relative w-full aspect-[16/9] lg:aspect-[2.5/1] bg-gradient-to-br from-primary via-primary/90 to-primary/70">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-accent-red px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider rounded-sm">
                      Current Study
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-4 p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-warm-grey text-xs font-semibold uppercase tracking-wider">
                        Hilchot Yesodei HaTorah
                      </p>
                      <h2 className="text-primary text-xl font-bold leading-tight mt-1">
                        Ch. 1: Foundations of the Torah
                      </h2>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-primary text-lg font-bold">34%</span>
                      <span className="text-[10px] text-warm-grey uppercase font-medium">
                        Complete
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-white h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: "34%" }} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex -space-x-2">
                      <div className="size-6 rounded-full border-2 border-white bg-primary/20" />
                      <div className="size-6 rounded-full border-2 border-white bg-accent-red/20" />
                      <div className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-slate-grey text-[8px] font-bold text-white">
                        +12
                      </div>
                    </div>
                    <button className="flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-white font-bold text-sm shadow-lg shadow-primary/10">
                      Continue Learning
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats + Quests */}
          <div className="lg:w-[340px] xl:w-[380px] lg:shrink-0">
            {/* Streak + XP */}
            <div className="flex gap-4 px-4 lg:px-0 py-2">
              <div className="flex flex-1 flex-col gap-1 rounded-xl p-5 bg-white border border-gray-100 ios-shadow">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-warm-grey text-[11px] font-bold uppercase tracking-wider">
                    Daily Streak
                  </p>
                  <Icon name="local_fire_department" className="text-accent-red streak-glow" filled />
                </div>
                <p className="text-primary text-2xl font-bold leading-none">12 Days</p>
                <p className="text-accent-red text-[10px] font-bold mt-1">NEW RECORD</p>
              </div>
              <div className="flex flex-1 flex-col gap-1 rounded-xl p-5 bg-white border border-gray-100 ios-shadow">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-warm-grey text-[11px] font-bold uppercase tracking-wider">
                    Mitzvah XP
                  </p>
                  <Icon name="stars" className="text-slate-grey" filled />
                </div>
                <p className="text-primary text-2xl font-bold leading-none">2,450</p>
                <p className="text-warm-grey text-[10px] font-bold mt-1">+150 today</p>
              </div>
            </div>

            {/* Quests */}
            <div className="px-4 lg:px-0 pt-5 pb-2 flex justify-between items-end">
              <h2 className="text-primary text-lg font-bold tracking-tight">Daily Quests</h2>
              <span className="text-accent-red text-xs font-bold uppercase tracking-wider cursor-pointer">
                See All
              </span>
            </div>
            <div className="px-4 lg:px-0 space-y-3">
              {quests.map((q) => (
                <div
                  key={q.id}
                  className={`flex items-center gap-4 bg-white border border-gray-100 p-3 rounded-xl ios-shadow ${q.locked ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-center rounded-lg bg-slate-bg text-primary shrink-0 size-12">
                    <Icon name={q.id === 1 ? "menu_book" : q.id === 2 ? "history_edu" : "quiz"} className="text-2xl" />
                  </div>
                  <div className="flex-1">
                    <p className="text-primary text-sm font-bold">{q.text}</p>
                    <p className="text-warm-grey text-xs font-medium">
                      {q.desc} · <span className="text-accent-red font-bold">+{q.xp} XP</span>
                    </p>
                  </div>
                  {q.locked ? (
                    <Icon name="lock" className="text-gray-300" />
                  ) : (
                    <input
                      defaultChecked={q.done}
                      className="h-6 w-6 rounded-full border-gray-200 border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 cursor-pointer"
                      type="checkbox"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* League (desktop only) */}
            <div className="hidden lg:flex items-center justify-between mt-6 p-5 rounded-xl bg-white border border-gray-100 ios-shadow">
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
                <div className="flex gap-1 items-end h-6">
                  <div className="w-1 h-3 bg-primary/20 rounded-full" />
                  <div className="w-1 h-5 bg-primary/40 rounded-full" />
                  <div className="w-1 h-2 bg-primary/20 rounded-full" />
                  <div className="w-1 h-4 bg-primary/60 rounded-full" />
                  <div className="w-1 h-6 bg-primary rounded-full" />
                </div>
                <p className="text-[9px] text-warm-grey font-bold tracking-wider">WEEKLY RANKING</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}