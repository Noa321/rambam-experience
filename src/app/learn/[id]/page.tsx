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

/* Slug map — maps hilchot names to the storage filename pattern */
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

  /* Fetch the One-Page Learn HTML from storage */
  let learnHtml: string | null = null;
  try {
    const res = await fetch(learnUrl, { next: { revalidate: 0 } });
    if (res.ok) {
      const fullHtml = await res.text();
      /* Extract just the <body> inner content and <style> block */
      const styleMatch = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const styleTag = styleMatch ? `<style>${styleMatch[1]}</style>` : "";
      const bodyContent = bodyMatch ? bodyMatch[1] : fullHtml;
      learnHtml = styleTag + bodyContent;
    }
  } catch {
    /* Storage file not found — learn page not available */
  }

  if (!learnHtml) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-50 bg-white border-b border-cloud-gray">
          <div className="max-w-[980px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <path d="M8 8C8 6.9 8.9 6 10 6H18V34H10C8.9 34 8 33.1 8 32V8Z" fill="#334155" />
                <path d="M22 6H30C31.1 6 32 6.9 32 8V32C32 33.1 31.1 34 30 34H22V6Z" fill="#334155" opacity="0.7" />
                <path d="M18 6H22V34H18V6Z" fill="#334155" opacity="0.4" />
              </svg>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-base font-semibold text-slate-ink leading-none">The Rambam</span>
                <span className="text-[8px] font-semibold tracking-[2px] text-oxide-red leading-none hidden sm:inline" style={{ fontFamily: "var(--font-sans)" }}>EXPERIENCE</span>
              </div>
            </Link>
          </div>
        </header>
        <div className="max-w-[680px] mx-auto px-6 py-20 text-center">
          <h1 className="font-serif text-2xl font-semibold text-slate-ink mb-4">One-Page Learn coming soon</h1>
          <p className="text-blue-slate mb-8">The One-Page Learn for {content.rambam_chapters} is not yet available.</p>
          <Link href={`/read/${content.id}`} className="inline-flex items-center gap-2 bg-slate-ink text-white text-sm font-medium px-6 py-2.5 hover:opacity-90 transition-opacity" style={{ borderRadius: "980px" }}>
            Read the essay instead
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ice-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-cloud-gray">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path d="M8 8C8 6.9 8.9 6 10 6H18V34H10C8.9 34 8 33.1 8 32V8Z" fill="#334155" />
              <path d="M22 6H30C31.1 6 32 6.9 32 8V32C32 33.1 31.1 34 30 34H22V6Z" fill="#334155" opacity="0.7" />
              <path d="M18 6H22V34H18V6Z" fill="#334155" opacity="0.4" />
            </svg>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-base font-semibold text-slate-ink leading-none">The Rambam</span>
              <span className="text-[8px] font-semibold tracking-[2px] text-oxide-red leading-none hidden sm:inline" style={{ fontFamily: "var(--font-sans)" }}>EXPERIENCE</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href={`/read/${content.id}`} className="text-sm font-medium text-light-slate hover:text-slate-ink transition-colors">
              Read essay
            </Link>
            {content.media_url && (
              <Link href={`/listen/${content.id}`} className="text-sm font-medium text-light-slate hover:text-slate-ink transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Listen
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* One-Page Learn content */}
      <div dangerouslySetInnerHTML={{ __html: learnHtml }} />
    </div>
  );
}
