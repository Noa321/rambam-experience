"use client";

import { useEffect, useState } from "react";
import { getProgress, isTodayComplete, setTodayComplete, type Progress } from "@/lib/streak";

const TOTAL = 1000;

export default function JourneyStats({ todayChapters = 3 }: { todayChapters?: number }) {
  const [progress, setProgress] = useState<Progress>({ streak: 0, daysCompleted: 0, chapters: 0 });
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = () => {
    setProgress(getProgress());
    setDone(isTodayComplete());
  };

  useEffect(() => {
    refresh();
    setReady(true);
  }, []);

  const toggle = () => {
    setTodayComplete(!done);
    refresh();
  };

  const personalPct = Math.min(100, Math.round((progress.chapters / TOTAL) * 1000) / 10);

  const stats = [
    { value: progress.streak, label: "day streak", icon: "local_fire_department" },
    { value: progress.daysCompleted, label: "days learned", icon: "event_available" },
    { value: progress.chapters, label: "chapters", icon: "menu_book" },
  ];

  return (
    <div>
      <div className="grid grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-soft-border p-3 text-center"
            style={{ borderTop: "3px solid #B8860B" }}
          >
            <span className="material-symbols-outlined text-parchment-gold" style={{ fontSize: "20px" }}>
              {s.icon}
            </span>
            <div className="font-serif text-[24px] leading-none font-semibold text-primary mt-1">
              {ready ? s.value : "—"}
            </div>
            <div className="text-[11px] text-muted-gray mt-1" style={{ fontFamily: "var(--font-sans)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Personal progress through the whole code */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] text-muted-gray" style={{ fontFamily: "var(--font-sans)" }}>
            Your progress
          </span>
          <span className="text-[12px] font-medium text-charcoal-text">{ready ? personalPct : 0}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container-low overflow-hidden">
          <div
            className="h-full rounded-full bg-parchment-gold transition-[width] duration-700 ease-out"
            style={{ width: `${ready ? personalPct : 0}%` }}
          />
        </div>
      </div>

      {/* Mark today complete */}
      <button
        onClick={toggle}
        disabled={!ready}
        className={`mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[15px] font-medium transition-colors active:scale-[0.99] ${
          done
            ? "bg-white border border-parchment-gold text-parchment-gold"
            : "bg-primary text-white hover:opacity-90"
        }`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: done ? "'FILL' 1" : undefined }}>
          {done ? "check_circle" : "radio_button_unchecked"}
        </span>
        {done ? `Completed today · ${todayChapters} chapters` : "Mark today's learning complete"}
      </button>
    </div>
  );
}
