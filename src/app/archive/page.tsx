import { getSupabase } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Archive | The Rambam Experience",
  description:
    "Browse every d'var Torah in The Rambam Experience — daily insights on the Rambam's Mishneh Torah.",
};

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
}

async function getAllContent(): Promise<ContentRecord[]> {
  const supabase = getSupabase();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("content")
    .select(
      "id,title,hook,summary,rambam_chapters,sefer,hilchot,media_url,rambam_date,published_at"
    )
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .lte("rambam_date", today)
    .order("rambam_date", { ascending: false });

  if (error || !data) return [];
  return data as ContentRecord[];
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default async function ArchivePage() {
  const content = await getAllContent();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-cloud-gray">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
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
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-light-slate hover:text-slate-ink transition-colors"
            >
              Today
            </Link>
            <span className="text-sm font-medium text-slate-ink">Archive</span>
          </nav>
        </div>
      </header>

      {/* Page Title */}
      <section className="pt-10 sm:pt-14 pb-6 sm:pb-8 px-4 sm:px-6">
        <div className="max-w-[680px] mx-auto text-center">
          <h1 className="font-serif text-[28px] sm:text-[36px] font-semibold text-slate-ink leading-[1.15] mb-2">
            Archive
          </h1>
          <p className="text-blue-slate text-sm">
            Every d&#39;var Torah from The Rambam Experience
          </p>
        </div>
      </section>

      {/* Content List */}
      <section className="pb-12 px-4 sm:px-6">
        <div className="max-w-[680px] mx-auto">
          {content.length === 0 ? (
            <p className="text-center text-light-slate text-sm py-12">
              No content published yet.
            </p>
          ) : (
            content.map((item) => (
              <article
                key={item.id}
                className="py-4 border-b border-cloud-gray group"
              >
                <div className="flex items-start justify-between gap-4">
                  <Link href={`/read/${item.id}`} className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-oxide-red tracking-wide uppercase mb-1">
                      {item.rambam_chapters}
                    </p>
                    <h2 className="font-serif text-[16px] sm:text-lg font-medium text-slate-ink mb-1 group-hover:text-oxide-red transition-colors">
                      {item.title}
                    </h2>
                    {item.hook && (
                      <p className="text-xs text-blue-slate leading-relaxed line-clamp-2 mb-1">
                        {item.hook}
                      </p>
                    )}
                    <p className="text-[11px] text-light-slate">
                      {formatFullDate(item.rambam_date || item.published_at)}
                      <span className="mx-1.5 text-cloud-gray">|</span>
                      Sefer {item.sefer}
                    </p>
                  </Link>
                  <div className="flex items-center gap-2 flex-shrink-0 pt-2">
                    <Link
                      href={`/read/${item.id}`}
                      className="w-8 h-8 rounded-full border border-cloud-gray flex items-center justify-center text-light-slate hover:text-slate-ink hover:border-slate-ink transition-colors"
                      title="Read"
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "14px" }}
                      >
                        article
                      </span>
                    </Link>
                    {item.media_url && (
                      <Link
                        href={`/listen/${item.id}`}
                        className="w-8 h-8 rounded-full border border-cloud-gray flex items-center justify-center text-light-slate hover:text-slate-ink hover:border-slate-ink transition-colors"
                        title="Listen"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: "14px",
                            fontVariationSettings: "'FILL' 1",
                          }}
                        >
                          play_arrow
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cloud-gray py-6 px-4">
        <div className="max-w-[980px] mx-auto text-center">
          <p className="text-xs text-light-slate">The Rambam Experience</p>
        </div>
      </footer>
    </div>
  );
}
