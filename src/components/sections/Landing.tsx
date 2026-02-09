"use client";

import Icon from "../Icon";

interface LandingProps {
  onBegin: () => void;
  onResume: () => void;
}

export default function Landing({ onBegin, onResume }: LandingProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 animate-fade-in">
      <div className="text-center mb-10 lg:mb-14">
        <Icon name="auto_stories" className="text-deep-red text-4xl lg:text-5xl mb-3" />
        <h1 className="hero-serif text-primary text-[40px] lg:text-[56px] font-bold leading-[1.1] tracking-tight">
          The Rambam
        </h1>
        <h1 className="hero-serif text-deep-red text-[40px] lg:text-[56px] font-bold leading-[1.1] tracking-tight uppercase">
          Experience
        </h1>
        <p className="mt-4 text-light-grey text-sm lg:text-base max-w-[320px] lg:max-w-[400px] mx-auto leading-relaxed">
          Master the entire Mishneh Torah with a gamified, daily learning path.
        </p>
      </div>

      {/* Stats */}
      <div className="w-full max-w-sm lg:max-w-md flex items-center justify-between py-8 border-y border-primary/10 mb-10">
        {[
          { label: "Books", val: "14" },
          { label: "Sections", val: "83" },
          { label: "Chapters", val: "1,000" },
        ].map((s, i) => (
          <div key={s.label} className="flex items-center">
            {i > 0 && <div className="h-8 w-px bg-primary/10 mr-4 lg:mr-6" />}
            <div className={`flex-1 text-center ${i > 0 ? "ml-4 lg:ml-6" : ""}`}>
              <p className="text-[10px] uppercase tracking-widest text-light-grey mb-1">
                {s.label}
              </p>
              <p className="text-xl lg:text-2xl font-bold text-primary">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="w-full max-w-sm">
        <button
          onClick={onBegin}
          className="w-full bg-primary hover:bg-slate-900 transition-colors text-white h-14 lg:h-16 rounded flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer"
        >
          <span className="text-sm font-bold tracking-[0.4em] ml-[0.4em]">BEGIN</span>
        </button>
        <div className="mt-5 text-center">
          <button
            onClick={onResume}
            className="text-[11px] uppercase tracking-widest text-light-grey hover:text-deep-red transition-colors cursor-pointer"
          >
            Resume Chapter 4
          </button>
        </div>
      </div>

      {/* Decorative */}
      <div className="w-full max-w-lg h-24 mt-12 relative overflow-hidden flex justify-center opacity-15 pointer-events-none">
        <div className="absolute bottom-[-40px] flex items-end gap-1">
          {[12,16,20,14,24,18,22,16,26,14,20,16,12,22].map((h, i) => (
            <div
              key={i}
              className={`w-4 rounded-t-sm ${
                i % 3 === 1 ? "bg-deep-red/30" : i % 7 === 0 ? "bg-primary/40" : "bg-primary/20"
              }`}
              style={{ height: `${h * 4}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
