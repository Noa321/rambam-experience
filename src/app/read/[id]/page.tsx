import { getSupabase } from "@/lib/supabase";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

interface ContentRecord {
  id: string;
  title: string;
  rambam_chapters: string;
  sefer: string;
  hilchot: string;
  hook: string;
  summary: string;
  body: string;
  body_format: string;
  media_url: string | null;
  rambam_date: string;
  published_at: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = getSupabase();
  const { data } = await supabase
    .from("content")
    .select("title,rambam_chapters,summary")
    .eq("id", id)
    .single();

  if (!data) return { title: "The Rambam Experience" };

  return {
    title: `${data.title} | The Rambam Experience`,
    description: data.summary || `D'var Torah on ${data.rambam_chapters}`,
  };
}

export default async function ReadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("content")
    .select(
      "id,title,rambam_chapters,sefer,hilchot,hook,summary,body,body_format,media_url,rambam_date,published_at"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const content = data as ContentRecord;

  const formattedDate = new Date(
    content.rambam_date || content.published_at
  ).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-cloud-gray">
        <div className="max-w-[680px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg
              width="24"
              height="24"
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
            </svg>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-base font-semibold text-slate-ink leading-none">
                The Rambam
              </span>
              <span className="text-[9px] font-semibold tracking-[2.5px] text-oxide-red leading-none">
                EXPERIENCE
              </span>
            </div>
          </Link>

          {content.media_url && (
            <Link
              href={`/listen/${content.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-ink hover:text-oxide-red transition-colors"
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
      </header>

      {/* Article */}
      <article className="max-w-[680px] mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold tracking-[3px] uppercase text-oxide-red mb-6">
            {formattedDate}
          </p>
          <h1 className="font-serif text-[32px] sm:text-[40px] font-semibold text-slate-ink leading-[1.15] mb-4">
            {content.title}
          </h1>
          <p className="text-blue-slate text-sm">
            {content.rambam_chapters}
            <span className="mx-2 text-cloud-gray">|</span>
            Sefer {content.sefer}
          </p>
        </div>

        {/* Body - render HTML */}
        {content.body_format === "html" ? (
          <div
            className="prose-rambam"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        ) : (
          <div className="font-serif text-base text-slate-ink leading-[1.75] whitespace-pre-wrap">
            {content.body}
          </div>
        )}
      </article>

      {/* Footer */}
      <footer className="border-t border-cloud-gray py-10 px-6">
        <div className="max-w-[680px] mx-auto text-center">
          <p className="text-sm text-light-slate">
            The Rambam Experience
          </p>
        </div>
      </footer>
    </div>
  );
}
