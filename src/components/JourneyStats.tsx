"use client";

import { useEffect, useState } from "react";
import { recordVisit, getVisitStats } from "@/lib/streak";

export default function JourneyStats() {
  const [stats, setStats] = useState({ streak: 0, daysLearned: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    recordVisit();
    setStats(getVisitStats());
    setReady(true);
  }, []);

  const items = [
    { value: stats.streak, label: stats.streak === 1 ? "day streak" : "day streak", icon: "local_fire_department" },
    { value: stats.daysLearned, label: "days learned", icon: "event_available" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="bg-white rounded-xl border border-soft-border p-4 flex items-center gap-3"
          style={{ borderLeft: "3px solid #B8860B" }}
        >
          <span className="material-symbols-outlined text-parchment-gold" style={{ fontSize: "26px" }}>
            {it.icon}
          </span>
          <div>
            <div className="font-serif text-[26px] leading-none font-semibold text-primary">
              {ready ? it.value : "—"}
            </div>
            <div className="text-[12px] text-muted-gray mt-1" style={{ fontFamily: "var(--font-sans)" }}>
              {it.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
