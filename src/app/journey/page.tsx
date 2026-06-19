import { getSupabase } from "@/lib/supabase";
import { findTreatise } from "@/data/books";
import {
  cyclePositionFromContent,
  bookProgressList,
  countChapters,
  TOTAL_CHAPTERS,
  TOTAL_TREATISES,
  TOTAL_BOOKS,
} from "@/lib/cycle";
import Header from "@/components/Header";
import JourneyStats from "@/components/JourneyStats";
import BookMap, { type BookMapItem } from "@/components/BookMap";
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
  const todayChapters = today ? countChapters(today.rambam_chapters) : 3;

  const bookMapItems: BookMapItem[] = bookProgress.map((bp) => ({
    id: bp.book.id,
    num: bp.book.num,
    eng: bp.book.eng,
    heb: bp.book.heb,
    color: bp.book.color,
    state: bp.state,
    fillPercent: bp.fillPercent,
    chapters: bp.chapters,
    treatiseCount: bp.book.treatises.length,
    treatises: bp.book.treatises.map((t) => ({ id: t.id, name: t.name, chapters: t.chapters })),
  }));

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
          <div className="relative">
            <div className="flex gap-[2px] h-3 rounded-full overflow-hidden">
              {bookProgress.map((bp, i) => (
                <div
                  key={bp.book.id}
                  className="relative"
                  style={{ flexGrow: bp.chapters, flexBasis: 0, backgroundColor: bp.book.color + "55" }}
                  title={`${bp.book.eng} — ${bp.fillPercent}%`}
                >
                  <div
                    className="absolute inset-y-0 left-0 bar-grow"
                    style={{
                      width: `${bp.fillPercent}%`,
                      backgroundColor: bp.book.color,
                      animationDelay: `${i * 45}ms`,
                    }}
                  />
                </div>
              ))}
            </div>
            {percent > 0 && (
              <div
                className="absolute top-1/2 w-3.5 h-3.5 rounded-full bg-parchment-gold ring-2 ring-white pulse-here"
                style={{ left: `${percent}%`, transform: "translate(-50%, -50%)" }}
                title="Today"
              />
            )}
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
          <JourneyStats todayChapters={todayChapters} />
        </section>

        {/* The 14 books */}
        <section className="mb-8">
          <h2
            className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-3"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            The fourteen books
          </h2>
          <BookMap books={bookMapItems} />
          <p className="text-[12px] text-muted-gray text-center mt-5" style={{ fontFamily: "var(--font-sans)" }}>
            {TOTAL_BOOKS} books · {TOTAL_TREATISES} treatises · {TOTAL_CHAPTERS.toLocaleString()} chapters
          </p>
        </section>
      </main>
    </div>
  );
}
