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
    timeZone: "UTC",
  });

  // The essay body is pipeline-generated HTML that ships with its own embedded
  // <style> and document chrome (header/title-block/metadata/footer) in a legacy
  // palette/font. Strip the <style>, keep just the <article> content (the app
  // renders its own title/header), and remap any legacy colors/fonts so the
  // app's .prose-rambam styles govern and the essay matches the rest of the app.
  let essayHtml = content.body || "";
  if (content.body_format === "html") {
    essayHtml = essayHtml
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<title[\s\S]*?<\/title>/gi, "")
      .replace(/<(?:meta|link|base)\b[^>]*\/?>/gi, "");
    const articleMatch = essayHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) essayHtml = articleMatch[1];
    const REMAP: Record<string, string> = {
      "#334155": "#162839", "#2C3E50": "#162839", "#2A2A28": "#1D1D1F",
      "#7A3E3E": "#B8860B", "#C0392B": "#B8860B", "#A93226": "#735C00",
      "#64748B": "#86868B", "#5A5A56": "#86868B", "#718096": "#86868B",
      "#94A3B8": "#A9A9AE", "#E5E7EB": "#E5E5E7", "#E2E2E2": "#E5E5E7",
      "#F1F5F9": "#F3F3F5", "#F8FAFC": "#F3F3F5", "#FFF5F5": "#F7F1E6",
      "#FAFAF8": "#FDFBF7",
    };
    for (const [oldC, newC] of Object.entries(REMAP)) {
      essayHtml = essayHtml.split(oldC).join(newC);
      essayHtml = essayHtml.split(oldC.toLowerCase()).join(newC);
    }
    essayHtml = essayHtml
      .split("Frank Ruhl Libre").join("Source Serif 4")
      .split("Literata").join("Source Serif 4")
      .split("DM Sans").join("Inter");

    // Drop a leading em-dash dateline some legacy essays prefix (redundant with
    // the app's own title header).
    essayHtml = essayHtml.replace(/<p[^>]*>\s*[—–][^<]*<\/p>\s*/i, "");
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-soft-border bottom-nav-blur"
        style={{ backgroundColor: "rgba(253, 251, 247, 0.85)" }}
      >
        <div className="max-w-[620px] mx-auto px-5 h-14 flex items-center justify-between">
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
      <article className="max-w-[620px] mx-auto px-5 py-10">
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
            dangerouslySetInnerHTML={{ __html: essayHtml }}
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
