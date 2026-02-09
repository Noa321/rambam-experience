"use client";

import { useState } from "react";
import Icon from "../Icon";
import { sampleHalachot } from "@/data/sample";

interface ChapterStudyProps {
  onNavigate: (section: string) => void;
}

const tabs = ["Source", "Summary", "Commentary", "Insights"];

export default function ChapterStudy({ onNavigate }: ChapterStudyProps) {
  const [activeTab, setActiveTab] = useState("Source");

  return (
    <section className="animate-fade-in">
      <header className="sticky top-0 z-40 bg-white/95 ios-blur border-b border-gray-100">
        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-100">
          <div className="h-full bg-muted-red w-1/3" />
        </div>

        <div className="flex items-center px-4 lg:px-8 pt-4 pb-2 justify-between">
          {/* Mobile back */}
          <button
            onClick={() => onNavigate("dashboard")}
            className="lg:hidden text-primary cursor-pointer"
          >
            <Icon name="arrow_back_ios" className="text-2xl" />
          </button>
          {/* Desktop back */}
          <button
            onClick={() => onNavigate("library")}
            className="hidden lg:flex items-center gap-1 text-primary cursor-pointer text-sm font-medium hover:text-deep-red transition-colors"
          >
            <Icon name="arrow_back_ios" className="text-lg" /> Hilchot Shabbat
          </button>

          <div className="flex-1 text-center lg:text-left lg:flex-none lg:ml-4">
            <h2 className="text-lg font-bold tracking-tight text-primary">Chapter 4</h2>
          </div>

          <button className="flex items-center justify-center size-10 rounded-full bg-muted-red/10 text-muted-red">
            <Icon name="emoji_events" className="text-xl" />
          </button>
        </div>

        <nav className="px-4 lg:px-8 pb-2">
          <p className="text-light-grey text-[10px] font-bold tracking-widest uppercase">
            Mishneh Torah · Sabbath
          </p>
        </nav>

        {/* Content tabs */}
        <div className="flex gap-2 px-4 lg:px-8 pb-3 overflow-x-auto hide-scrollbar">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex h-9 shrink-0 items-center justify-center rounded-full px-5 transition-all ${
                activeTab === t
                  ? "bg-primary shadow-sm"
                  : "bg-surface-grey"
              }`}
            >
              <span
                className={`text-sm ${
                  activeTab === t ? "text-white font-semibold" : "text-light-grey font-medium"
                }`}
              >
                {t}
              </span>
            </button>
          ))}
        </div>
      </header>

      <main className="pb-28 lg:pb-8">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 py-4 lg:py-6 space-y-4">
          {sampleHalachot.map((h) => (
            <article
              key={h.number}
              className="rounded-xl p-5 lg:p-6 bg-white border border-gray-100 shadow-sm hover:border-primary/20 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="size-8 rounded bg-primary/5 flex items-center justify-center text-primary font-bold text-sm">
                  {h.number}
                </div>
                <button className="text-light-grey hover:text-muted-red transition-colors">
                  <Icon name="bookmark" className="text-xl" />
                </button>
              </div>

              {/* Mobile: stacked. Desktop: side by side */}
              <div className="flex flex-col lg:flex-row lg:gap-8">
                <div className="lg:flex-1 text-right mb-5 lg:mb-0" dir="rtl">
                  <p
                    className="text-2xl lg:text-[22px] leading-relaxed text-primary"
                    style={{ fontFamily: "var(--font-hebrew)" }}
                  >
                    {h.hebrew}
                  </p>
                </div>
                <div className="hidden lg:block w-px bg-muted-red/20 self-stretch" />
                <div className="lg:hidden h-0.5 w-12 bg-muted-red/30 mb-5" />
                <div className="lg:flex-1 text-left">
                  <p className="text-base leading-relaxed text-primary/70">{h.english}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Next Chapter buttons */}
        <div className="fixed lg:static bottom-0 left-0 right-0 lg:max-w-3xl lg:mx-auto lg:px-8 lg:py-4 p-4 bg-gradient-to-t from-white via-white/95 to-transparent lg:bg-none z-40">
          <div className="flex gap-3">
            <button className="flex-1 flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/10 active:scale-95 transition-transform">
              <span className="text-sm tracking-wide">NEXT CHAPTER</span>
              <Icon name="arrow_forward" />
            </button>
            <button className="flex size-14 items-center justify-center rounded-2xl bg-white border border-gray-200 text-muted-red shadow-sm active:scale-95 transition-transform">
              <Icon name="check_circle" className="text-2xl" />
            </button>
          </div>
        </div>
      </main>
    </section>
  );
}
