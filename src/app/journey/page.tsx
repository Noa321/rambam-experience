import { getSupabase } from "@/lib/supabase";
import { findTreatise, getBookTreatiseCount } from "@/data/books";
import {
  cyclePositionFromContent,
  bookProgressList,
  TOTAL_CHAPTERS,
  TOTAL_TREATISES,
  TOTAL_BOOKS,
} from "@/lib/cycle";
import Header from "@/components/Header";
import JourneyStats from "@/components/JourneyStats";
import Link from "next/link";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Journey | The Rambam Experience",
  description:
    "Where today's learning sits in the Rambam's Mishneh Torah — the full arc of 14 books and 1,000 chapters.",
};

interface TodayRow {
  rambam_chapters: string;
  hilchot: string;
  sefer: string;
  rambam_date: string;
  published_at: string;
}

async function getToday(): Promise<TodayRow | null> {
  const supabase = getSupabase();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const { data } = await supabase
    .from("content")
    .select("rambam_chapters,hilchot,sefer,rambam_date,published_at")
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .not("rambam_date", "is", null)
    .lte("rambam_date", today)
    .order("rambam_date", { ascending: false })
    .limit(1)
    .single();
  return (data as TodayRow) || null;
}

export default async function JourneyPage() {
  const today = await getToday();
  const pos = today
    ? cyclePositionFromContent(today.rambam_chapters, today.hilchot)
    : null;

  const globalChapter = pos?.globalChapter ?? 0;
  const percent = pos?.percent ?? 0;
  const bookProgress = bookProgressList(globalChapter);
  const current = pos ? findTreatise(pos.treatiseId) : null;

  return (
    <div className="min-h-screen pb-28">
      <Header />

      <main className="max-w-[800px] mx-auto px-5 mt-6">
        {/* Eyebrow + title */}
        <p
          className="text-[11px] font-semibold tracking-[0.1em] uppercase text-parchment-gold mb-2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          The Journey
        </p>
        <h1 className="font-serif text-[28px] sm:text-[34px] font-semibold text-primary leading-tight">
          Through the Mishneh Torah
        </h1>
        <p className="text-[14px] text-muted-gray mt-1 mb-6">
          One ordered code, three chapters a day. Here is the whole arc — and where today sits within it.
        </p>

        {/* Overall progress */}
        <section className="bg-primary text-white rounded-2xl px-5 py-6 sm:px-8 sm:py-8 mb-6">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="font-serif text-[44px] sm:text-[52px] leading-none font-bold">
                {percent}%
              </div>
              <p className="text-[13px] mt-2" style={{ color: "#d1e4fb" }}>
                through the Mishneh Torah
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-[20px] font-semibold leading-none">
                {globalChapter > 0 ? globalChapter.toLocaleString() : "—"}
                <span className="text-[14px] font-normal opacity-70"> / {TOTAL_CHAPTERS.toLocaleString()}</span>
              </p>
              <p className="text-[12px] mt-1.5" style={{ color: "#96a9be", fontFamily: "var(--font-sans)" }}>
                chapters
              </p>
            </div>
          </div>

          {/* Segmented 14-book map */}
          <div className="flex gap-[2px] h-3 rounded-full overflow-hidden">
            {bookProgress.map((bp) => (
              <div
                key={bp.book.id}
                className="relative"
                style={{ flexGrow: bp.chapters, flexBasis: 0, backgroundColor: bp.book.color + "55" }}
                title={`${bp.book.eng} — ${bp.fillPercent}%`}
              >
                <div
                  className="absolute inset-y-0 left-0"
                  style={{ width: `${bp.fillPercent}%`, backgroundColor: bp.book.color }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2.5">
            <span className="text-[10px] tracking-[0.08em] uppercase" style={{ color: "#96a9be", fontFamily: "var(--font-sans)" }}>
              Book I · Knowledge
            </span>
            <span className="text-[10px] tracking-[0.08em] uppercase" style={{ color: "#96a9be", fontFamily: "var(--font-sans)" }}>
              Book XIV · Judges
            </span>
          </div>

          {current && (
            <p className="text-[14px] leading-[22px] mt-5" style={{ color: "#d1e4fb" }}>
              Today you are in{" "}
              <span className="font-semibold text-white">{current.treatise.name}</span>, Book{" "}
              {current.book.num} · {current.book.eng}.
            </p>
          )}
        </section>

        {/* Personal practice */}
        <section className="mb-8">
          <h2
            className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-3"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Your practice
          </h2>
          <JourneyStats />
          <Link
            href="/"
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-[15px] font-medium hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              menu_book
            </span>
            Continue today&#39;s learning
          </Link>
        </section>

        {/* The 14 books */}
        <section className="mb-8">
          <h2
            className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-3"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            The fourteen books
          </h2>
          <div className="space-y-2.5">
            {bookProgress.map((bp) => (
              <div
                key={bp.book.id}
                className="rounded-xl border bg-white p-4"
                style={
                  bp.state === "current"
                    ? { borderColor: "#B8860B", borderLeft: "3px solid #B8860B" }
                    : { borderColor: "#E5E5E7" }
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span
                      className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted-gray shrink-0"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      Book {bp.book.num}
                    </span>
                    <h3 className="font-serif text-[17px] font-semibold text-primary truncate">
                      {bp.book.eng}
                    </h3>
                    <span className="font-serif text-[15px] text-muted-gray shrink-0">{bp.book.heb}</span>
                  </div>

                  {bp.state === "current" ? (
                    <span
                      className="shrink-0 text-[9px] font-semibold tracking-[0.1em] uppercase px-2 py-1 rounded-full"
                      style={{ backgroundColor: "rgba(184,134,11,0.12)", color: "#B8860B", fontFamily: "var(--font-sans)" }}
                    >
                      You are here
                    </span>
                  ) : bp.state === "done" ? (
                    <span className="material-symbols-outlined text-parchment-gold shrink-0" style={{ fontSize: "18px" }}>
                      check_circle
                    </span>
                  ) : null}
                </div>

                <div className="h-1.5 rounded-full bg-surface-container-low overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${bp.fillPercent}%`, backgroundColor: bp.book.color }}
                  />
                </div>
                <p
                  className="text-[11px] text-muted-gray mt-1.5"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {bp.chapters} chapters · {getBookTreatiseCount(bp.book)} treatises
                  {bp.state === "current" && ` · ${bp.fillPercent}% in`}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-muted-gray text-center mt-5" style={{ fontFamily: "var(--font-sans)" }}>
            {TOTAL_BOOKS} books · {TOTAL_TREATISES} treatises · {TOTAL_CHAPTERS.toLocaleString()} chapters
          </p>
        </section>
      </main>
    </div>
  );
}
