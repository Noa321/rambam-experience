import { getSupabase } from "@/lib/supabase";
import Link from "next/link";

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

  const { data, error } = await supabase
    .from("content")
    .select(
      "id,title,hook,summary,rambam_chapters,sefer,hilchot,media_url,rambam_date,published_at,body"
    )
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as ContentRecord;
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
    year: "numeric",
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-cloud-gray">
        <div className="max-w-[980px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <svg
              width="28"
              height="28"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 8C8 6.9 8.9 6 10 6H18V34H10C8.9 34 8 33.1 8 32V8Z"
                fill="#334155"
              />
              <path
                d="M22 6H30C31.1 6 32 6.9 32 8V32C32 33.1 31.1 34 30 34H22V6Z"
                fill="#334155"
                opacity="0.7"
              />
              <path d="M18 6H22V34H18V6Z" fill="#334155" opacity="0.4" />
              <line
                x1="11"
                y1="12"
                x2="16"
                y2="12"
                stroke="white"
                strokeWidth="1.2"
              />
              <line
                x1="11"
                y1="16"
                x2="15"
                y2="16"
                stroke="white"
                strokeWidth="1.2"
              />
              <line
                x1="11"
                y1="20"
                x2="16"
                y2="20"
                stroke="white"
                strokeWidth="1.2"
              />
              <line
                x1="24"
                y1="12"
                x2="29"
                y2="12"
                stroke="white"
                strokeWidth="1.2"
                opacity="0.8"
              />
              <line
                x1="24"
                y1="16"
                x2="28"
                y2="16"
                stroke="white"
                strokeWidth="1.2"
                opacity="0.8"
              />
              <line
                x1="24"
                y1="20"
                x2="29"
                y2="20"
                stroke="white"
                strokeWidth="1.2"
                opacity="0.8"
              />
            </svg>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-lg font-semibold text-slate-ink leading-none">
                The Rambam
              </span>
              <span
                className="text-[10px] font-semibold tracking-[3px] text-oxide-red leading-none"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                EXPERIENCE
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-8">
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
        <section className="pt-20 pb-16 px-6">
          <div className="max-w-[680px] mx-auto text-center">
            <p className="text-xs font-semibold tracking-[3px] uppercase text-oxide-red mb-6">
              {formatDate(today.rambam_date || today.published_at)}
            </p>

            <h1 className="font-serif text-[40px] sm:text-[52px] font-semibold text-slate-ink leading-[1.1] mb-6">
              {today.title}
            </h1>

            <p className="text-blue-slate text-base mb-3">
              {today.rambam_chapters}
              <span className="mx-2 text-cloud-gray">|</span>
              Sefer {today.sefer}
            </p>
            <p className="text-light-slate text-sm mb-10">
              {today.hilchot}
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href={`/read/${today.id}`}
                className="inline-flex items-center gap-2 bg-slate-ink text-white text-sm font-medium px-8 py-3 hover:opacity-90 transition-opacity"
                style={{ borderRadius: "980px" }}
              >
                Read today&#39;s essay
              </Link>
              {today.media_url && (
                <Link
                  href={`/listen/${today.id}`}
                  className="inline-flex items-center gap-2 border border-slate-ink text-slate-ink text-sm font-medium px-8 py-3 hover:bg-ice-white transition-colors"
                  style={{ borderRadius: "980px" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "18px",
                      fontVariationSettings: "'FILL' 1",
                    }}
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
        <section className="pt-20 pb-16 px-6">
          <div className="max-w-[680px] mx-auto text-center">
            <h1 className="font-serif text-[40px] font-semibold text-slate-ink leading-[1.1] mb-6">
              The Rambam Experience
            </h1>
            <p className="text-blue-slate text-lg">
              Daily Torah insights on the Rambam&#39;s Mishneh Torah.
            </p>
          </div>
        </section>
      )}

      {/* Hook Quote */}
      {today?.hook && (
        <section className="pb-16 px-6">
          <div className="max-w-[600px] mx-auto text-center">
            <div className="w-12 h-px bg-cloud-gray mx-auto mb-8" />
            <p className="font-serif text-lg text-blue-slate italic leading-relaxed">
              {today.hook}
            </p>
            <div className="w-12 h-px bg-cloud-gray mx-auto mt-8" />
          </div>
        </section>
      )}

      {/* Archive */}
      {recent.length > 1 && (
        <section id="archive" className="pb-20 px-6">
          <div className="max-w-[680px] mx-auto">
            <h2 className="font-serif text-2xl font-semibold text-slate-ink mb-8 text-center">
              Recent
            </h2>
            <div className="space-y-0">
              {recent.slice(1).map((item) => (
                <article
                  key={item.id}
                  className="py-6 border-b border-cloud-gray group"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-oxide-red tracking-wide uppercase mb-2">
                        {item.rambam_chapters}
                      </p>
                      <h3 className="font-serif text-lg font-medium text-slate-ink mb-2 group-hover:text-oxide-red transition-colors">
                        {item.title}
                      </h3>
                      {item.hook && (
                        <p className="text-sm text-blue-slate leading-relaxed line-clamp-2">
                          {item.hook}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 pt-1">
                      {item.media_url && (
                        <Link
                          href={`/listen/${item.id}`}
                          className="w-9 h-9 rounded-full border border-cloud-gray flex items-center justify-center text-light-slate hover:text-slate-ink hover:border-slate-ink transition-colors"
                          title="Listen"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: "16px",
                              fontVariationSettings: "'FILL' 1",
                            }}
                          >
                            play_arrow
                          </span>
                        </Link>
                      )}
                      <span className="text-xs text-light-slate whitespace-nowrap">
                        {formatShortDate(
                          item.rambam_date || item.published_at
                        )}
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
      <footer className="border-t border-cloud-gray py-10 px-6">
        <div className="max-w-[980px] mx-auto text-center">
          <p className="text-sm text-light-slate">
            The Rambam Experience
          </p>
        </div>
      </footer>
    </div>
  );
}
