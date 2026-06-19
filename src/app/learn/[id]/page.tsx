import { getSupabase } from "@/lib/supabase";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface ContentRecord {
  id: string;
  title: string;
  rambam_chapters: string;
  sefer: string;
  hilchot: string;
  hook: string;
  summary: string;
  media_url: string | null;
  rambam_date: string;
  published_at: string;
}

function deriveLearnSlug(chapters: string): string {
  return chapters
    .toLowerCase()
    .replace(/,\s*/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
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
    .select("title,rambam_chapters")
    .eq("id", id)
    .single();

  if (!data) return { title: "The Rambam Experience" };

  return {
    title: `One-Page Learn: ${data.title} | The Rambam Experience`,
    description: `One-page study overview of ${data.rambam_chapters}`,
  };
}

export default async function LearnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("content")
    .select(
      "id,title,rambam_chapters,sefer,hilchot,hook,summary,media_url,rambam_date,published_at"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const content = data as ContentRecord;
  const slug = deriveLearnSlug(content.rambam_chapters);
  const learnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://htwyavvzmcmlucpmqytb.supabase.co"}/storage/v1/object/public/media/learns/learn-${slug}.html`;

  let learnHtml: string | null = null;
  try {
    const res = await fetch(learnUrl, { next: { revalidate: 0 } });
    if (res.ok) {
      const fullHtml = await res.text();
      const styleMatch = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const styleTag = styleMatch ? `<style>${styleMatch[1]}</style>` : "";
      const bodyContent = bodyMatch ? bodyMatch[1] : fullHtml;
      learnHtml = styleTag + bodyContent;
    }
  } catch {
    /* Storage file not found */
  }

  if (!learnHtml) {
    return (
      <div className="min-h-screen pb-28">
        <header
          className="sticky top-0 z-50 border-b border-soft-border bottom-nav-blur"
          style={{ backgroundColor: "rgba(253, 251, 247, 0.85)" }}
        >
          <div className="max-w-[800px] mx-auto px-5 h-14 flex items-center">
            <Link
              href="/"
              className="flex items-center gap-1 text-[15px] font-medium text-primary hover:text-parchment-gold transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back_ios</span>
              Home
            </Link>
          </div>
        </header>
        <div className="max-w-[680px] mx-auto px-5 py-20 text-center">
          <h1 className="font-serif text-2xl font-semibold text-primary mb-4">One-Page Learn coming soon</h1>
          <p className="text-muted-gray mb-8">The One-Page Learn for {content.rambam_chapters} is not yet available.</p>
          <Link
            href={`/read/${content.id}`}
            className="inline-flex items-center gap-2 bg-primary text-white text-[15px] font-medium px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
          >
            Read the essay instead
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-soft-border bottom-nav-blur"
        style={{ backgroundColor: "rgba(253, 251, 247, 0.85)" }}
      >
        <div className="max-w-[800px] mx-auto px-5 h-14 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-1 text-[15px] font-medium text-primary hover:text-parchment-gold transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back_ios</span>
            Home
          </Link>
        </div>
      </header>

      {/* One-Page Learn content */}
      <div dangerouslySetInnerHTML={{ __html: learnHtml }} />

      {/* Continue with today's learning */}
      <div className="max-w-[680px] mx-auto px-5 pb-6 -mt-2">
        <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-3" style={{ fontFamily: "var(--font-sans)" }}>
          Continue
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/read/${content.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-[15px] font-medium hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>article</span>
            Read the full essay
          </Link>
          {content.media_url && (
            <Link
              href={`/listen/${content.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-soft-border bg-white text-primary text-[15px] font-medium hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              Listen
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
