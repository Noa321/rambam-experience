import { getSupabase } from "@/lib/supabase";
import { getDailyStudy } from "@/lib/daily-study";
import Link from "next/link";


// Revalidate every 5 minutes so new content appears without a redeploy
export const revalidate = 300;
interface ContentRecord {
  id: string;
  title: string;
  hook: string;
  summary: string;
  rambam_chapters: string;
  sefer: string;
  hilchot: string;
  media_url: string | null;
  rambam_date: string;
  published_at: string;
  body: string;
}

async function getTodaysContent(): Promise<ContentRecord | null> {
  const supabase = getSupabase();

  // Today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // First try: get content matching today's rambam_date
  const { data: todayData } = await supabase
    .from("content")
    .select(
      "id,title,hook,summary,rambam_chapters,sefer,hilchot,media_url,rambam_date,published_at,body"
    )
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .eq("rambam_date", today)
    .limit(1)
    .single();

  if (todayData) return todayData as ContentRecord;

  // Fallback: get the most recently published content
  const { data: recentData } = await supabase
    .from("content")
    .select(
      "id,title,hook,summary,rambam_chapters,sefer,hilchot,media_url,rambam_date,published_at,body"
    )
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  if (recentData) return recentData as ContentRecord;
  return null;
}

async function getRecentContent(): Promise<ContentRecord[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("content")
    .select(
      "id,title,hook,summary,rambam_chapters,sefer,hilchot,media_url,rambam_date,published_at,body"
    )
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(7);

  if (error || !data) return [];
  return data as ContentRecord[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}


export default async function Home() {
  const today = await getTodaysContent();
  const recent = await getRecentContent();
  const dailyStudy = getDailyStudy();

  return (
    <div className="min-h-screen bg-white">
      {/* Header — solid white, no transparency */}
      <header className="sticky top-0 z-50 bg-white border-b border-cloud-gray">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
            >
              <path d="M8 8C8 6.9 8.9 6 10 6H18V34H10C8.9 34 8 33.1 8 32V8Z" fill="#334155" />
              <path d="M22 6H30C31.1 6 32 6.9 32 8V32C32 33.1 31.1 34 30 34H22V6Z" fill="#334155" opacity="0.7" />
              <path d="M18 6H22V34H18V6Z" fill="#334155" opacity="0.4" />
              <line x1="11" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1.2" />
              <line x1="11" y1="16" x2="15" y2="16" stroke="white" strokeWidth="1.2" />
              <line x1="24" y1="12" x2="29" y2="12" stroke="white" strokeWidth="1.2" opacity="0.8" />
              <line x1="24" y1="16" x2="28" y2="16" stroke="white" strokeWidth="1.2" opacity="0.8" />
            </svg>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-base font-semibold text-slate-ink leading-none">
                The Rambam
              </span>
              <span
                className="text-[8px] font-semibold tracking-[2px] text-oxide-red leading-none hidden sm:inline"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                EXPERIENCE
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-6">
            <span className="text-sm font-medium text-slate-ink">Today</span>
            <a
              href="#archive"
              className="text-sm font-medium text-light-slate hover:text-slate-ink transition-colors"
            >
              Archive
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      {today ? (
        <section className="pt-10 sm:pt-16 pb-6 sm:pb-10 px-4 sm:px-6">
          <div className="max-w-[680px] mx-auto text-center">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[2px] sm:tracking-[3px] uppercase text-oxide-red mb-3 sm:mb-5">
              {formatDate(today.rambam_date || today.published_at)}
            </p>

            <h1 className="font-serif text-[26px] sm:text-[44px] font-semibold text-slate-ink leading-[1.15] mb-3 sm:mb-5">
              {today.title}
            </h1>

            <p className="text-blue-slate text-sm mb-1">
              {today.rambam_chapters}
              <span className="mx-2 text-cloud-gray">|</span>
              Sefer {today.sefer}
            </p>
            <p className="text-light-slate text-xs mb-5 sm:mb-7">
              {today.hilchot}
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-3">
              <Link
                href={`/read/${today.id}`}
                className="inline-flex items-center gap-2 bg-slate-ink text-white text-sm font-medium px-6 py-2.5 hover:opacity-90 transition-opacity"
                style={{ borderRadius: "980px" }}
              >
                Read today&#39;s essay
              </Link>
              {today.media_url && (
                <Link
                  href={`/listen/${today.id}`}
                  className="inline-flex items-center gap-1.5 border border-slate-ink text-slate-ink text-sm font-medium px-6 py-2.5 hover:bg-ice-white transition-colors"
                  style={{ borderRadius: "980px" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}
                  >
                    play_arrow
                  </span>
                  Listen
                </Link>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="pt-12 pb-8 px-4">
          <div className="max-w-[680px] mx-auto text-center">
            <h1 className="font-serif text-[26px] sm:text-[40px] font-semibold text-slate-ink leading-[1.1] mb-4">
              The Rambam Experience
            </h1>
            <p className="text-blue-slate text-base">
              Daily Torah insights on the Rambam&#39;s Mishneh Torah.
            </p>
          </div>
        </section>
      )}

      {/* Hook Quote */}
      {today?.hook && (
        <section className="pb-6 sm:pb-10 px-4 sm:px-6">
          <div className="max-w-[480px] mx-auto text-center">
            <div className="w-10 h-px bg-cloud-gray mx-auto mb-4" />
            <p className="font-serif text-[14px] sm:text-base text-blue-slate italic leading-relaxed">
              {today.hook}
            </p>
            <div className="w-10 h-px bg-cloud-gray mx-auto mt-4" />
          </div>
        </section>
      )}

      {/* Today's Chapters — from daily-study.ts cycle calculator, linked to Sefaria reader */}
      <section className="pb-6 sm:pb-10 px-4 sm:px-6">
        <div className="max-w-[480px] mx-auto">
          <h2 className="font-serif text-lg font-semibold text-slate-ink mb-3 text-center">
            Today&#39;s chapters
          </h2>
          <div className="bg-ice-white rounded-xl overflow-hidden">
            {dailyStudy.chapters.map((ch, i, arr) => (
              <Link
                key={`${ch.treatise.id}-${ch.chapter}`}
                href={`/study/${ch.treatise.id}/${ch.chapter}`}
                className={`flex items-center justify-between px-4 py-3 hover:bg-cloud-gray/40 transition-colors ${
                  i < arr.length - 1 ? "border-b border-cloud-gray" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-ink">
                    {ch.treatise.name}, Chapter {ch.chapter}
                  </p>
                  <p className="text-[11px] text-light-slate mt-0.5">
                    Sefer {ch.bookEng}
                  </p>
                </div>
                <span
                  className="material-symbols-outlined text-light-slate"
                  style={{ fontSize: "16px" }}
                >
                  chevron_right
                </span>
              </Link>
            ))}
          </div>
          <p className="text-[10px] text-light-slate text-center mt-1.5">
            Day {dailyStudy.dayOfCycle} of {dailyStudy.totalDays} in cycle {dailyStudy.cycleNumber}
          </p>
        </div>
      </section>

      {/* Archive */}
      {recent.length > 1 && (
        <section id="archive" className="pb-8 sm:pb-12 px-4 sm:px-6">
          <div className="max-w-[680px] mx-auto">
            <h2 className="font-serif text-lg font-semibold text-slate-ink mb-4 text-center">
              Recent
            </h2>
            <div>
              {recent.slice(1).map((item) => (
                <article
                  key={item.id}
                  className="py-3.5 border-b border-cloud-gray group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-oxide-red tracking-wide uppercase mb-1">
                        {item.rambam_chapters}
                      </p>
                      <h3 className="font-serif text-[15px] sm:text-lg font-medium text-slate-ink mb-1 group-hover:text-oxide-red transition-colors">
                        {item.title}
                      </h3>
                      {item.hook && (
                        <p className="text-xs text-blue-slate leading-relaxed line-clamp-2 hidden sm:block">
                          {item.hook}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                      {item.media_url && (
                        <Link
                          href={`/listen/${item.id}`}
                          className="w-8 h-8 rounded-full border border-cloud-gray flex items-center justify-center text-light-slate hover:text-slate-ink hover:border-slate-ink transition-colors"
                          title="Listen"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}
                          >
                            play_arrow
                          </span>
                        </Link>
                      )}
                      <span className="text-[10px] text-light-slate whitespace-nowrap">
                        {formatShortDate(item.rambam_date || item.published_at)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-cloud-gray py-6 px-4">
        <div className="max-w-[980px] mx-auto text-center">
          <p className="text-xs text-light-slate">The Rambam Experience</p>
        </div>
      </footer>
    </div>
  );
}
