"use client";

import Icon from "../Icon";

interface ProfileProps {
  onNavigate: (section: string, data?: Record<string, unknown>) => void;
}

const achievements = [
  { icon: "local_fire_department", color: "text-accent-red", bg: "bg-accent-red/10", title: "On Fire", desc: "7-day study streak" },
  { icon: "auto_stories", color: "text-primary", bg: "bg-primary/10", title: "Torah Scholar", desc: "Completed Sefer HaMadda" },
  { icon: "emoji_events", color: "text-amber-600", bg: "bg-amber-100", title: "Gold League", desc: "Top 25% of learners" },
];

export default function Profile({ onNavigate }: ProfileProps) {
  return (
    <section className="animate-fade-in">
      <header className="sticky top-0 z-40 bg-white/90 ios-blur border-b border-gray-100 px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate("dashboard")} className="lg:hidden text-primary cursor-pointer">
            <Icon name="arrow_back_ios" />
          </button>
          <h1 className="text-lg font-bold text-primary">Profile</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pb-28 lg:pb-8 px-4 lg:px-8 pt-8">
        <div className="max-w-2xl">
          {/* User card */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8 mb-8">
            <div className="flex flex-col items-center lg:items-start">
              <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold mb-4">
                NR
              </div>
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-primary text-2xl font-bold">Noa Riley</h2>
              <p className="text-warm-grey text-sm mt-1">Scholar Tier · Gold League</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { val: "12", label: "Day Streak" },
              { val: "2,450", label: "Total XP" },
              { val: "34", label: "Chapters" },
            ].map((s) => (
              <div key={s.label} className="text-center p-4 bg-slate-bg rounded-xl">
                <p className="text-primary text-2xl font-bold">{s.val}</p>
                <p className="text-[10px] text-warm-grey uppercase tracking-wider font-bold mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <h3 className="text-primary text-base font-bold mb-3">Achievements</h3>
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {achievements.map((a) => (
              <div
                key={a.title}
                className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-xl ios-shadow"
              >
                <div className={`size-12 rounded-xl ${a.bg} flex items-center justify-center`}>
                  <Icon name={a.icon} className={a.color} filled />
                </div>
                <div>
                  <p className="text-primary text-sm font-bold">{a.title}</p>
                  <p className="text-warm-grey text-xs">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </section>
  );
}