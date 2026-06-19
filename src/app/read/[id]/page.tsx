import { getSupabase } from "@/lib/supabase";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 300;

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
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-soft-border bottom-nav-blur"
        style={{ backgroundColor: "rgba(253, 251, 247, 0.85)" }}
      >
        <div className="max-w-[680px] mx-auto px-5 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 text-[15px] font-medium text-primary hover:text-parchment-gold transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back_ios</span>
            Home
          </Link>

          {content.media_url && (
            <Link
              href={`/listen/${content.id}`}
              className="flex items-center gap-1.5 text-[15px] font-medium text-primary hover:text-parchment-gold transition-colors"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}
              >
                play_arrow
              </span>
              Listen
            </Link>
          )}
        </div>
      </header>

      {/* Article */}
      <article className="max-w-[680px] mx-auto px-5 py-10">
        <div className="mb-8 text-center">
          <p
            className="text-[10px] font-semibold tracking-[0.15em] uppercase text-parchment-gold mb-4"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {formattedDate}
          </p>
          <h1 className="font-serif text-[28px] sm:text-[36px] font-semibold text-primary leading-[1.15] mb-3">
            {content.title}
          </h1>
          <p className="text-[14px] text-muted-gray">
            {content.rambam_chapters}
            <span className="mx-2 text-soft-border">|</span>
            Sefer {content.sefer}
          </p>
        </div>

        {/* Body */}
        {content.body_format === "html" ? (
          <div
            className="prose-rambam"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        ) : (
          <div className="font-serif text-base text-primary leading-[1.75] whitespace-pre-wrap">
            {content.body}
          </div>
        )}
      </article>
    </div>
  );
}
