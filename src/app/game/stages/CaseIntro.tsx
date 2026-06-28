"use client";

interface CaseIntroProps {
  caseTitle: string;
  caseNarrative: string;
  chaptersLabel: string;
  sefer: string;
  date: string;
  onContinue: () => void;
}

export default function CaseIntro({
  caseTitle,
  caseNarrative,
  chaptersLabel,
  sefer,
  date,
  onContinue,
}: CaseIntroProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="py-6 animate-fade-in">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-[20px] bg-primary text-white px-5 py-8 sm:px-8 sm:py-10 mb-6">
        <div className="relative z-10 text-center">
          <p
            className="text-[9px] font-semibold tracking-[0.15em] uppercase mb-3"
            style={{ color: "#ffe088", fontFamily: "var(--font-sans)" }}
          >
            {formattedDate.toUpperCase()}
          </p>
          <span className="material-symbols-outlined mb-3 block" style={{ fontSize: "32px", color: "#ffe088" }}>
            gavel
          </span>
          <h1 className="font-serif font-bold text-[24px] leading-[30px] sm:text-[32px] sm:leading-[38px] mb-2">
            The Rambam Case
          </h1>
          <p className="text-[14px] sm:text-[16px] mb-1" style={{ color: "#d1e4fb" }}>
            {chaptersLabel} | Sefer {sefer}
          </p>
          <p className="text-[12px] italic" style={{ color: "rgba(255,255,255,0.6)" }}>
            A case has arrived at your Beit Din.
          </p>
        </div>
      </div>

      {/* Case Narrative */}
      <div className="bg-white rounded-[20px] border border-soft-border ios-card-shadow p-5 sm:p-6 mb-6">
        <p
          className="text-[11px] font-semibold tracking-[0.1em] uppercase text-parchment-gold mb-4"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {caseTitle.toUpperCase()}
        </p>
        <div className="font-serif text-[16px] leading-[28px] text-primary space-y-4">
          {caseNarrative.split("\n").filter((p) => p.trim()).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-surface-container-low rounded-[16px] p-4 mb-6">
        <p className="text-[13px] leading-[20px] text-muted-gray text-center">
          You will identify the relevant principles, apply them to the facts, and issue a ruling. The
          Rambam&#39;s reasoning will be revealed at the end.
        </p>
      </div>

      {/* Begin Button */}
      <button
        onClick={onContinue}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-medium rounded-full hover:opacity-90 transition-opacity active:scale-[0.98]"
      >
        Begin
        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
      </button>
    </div>
  );
}
