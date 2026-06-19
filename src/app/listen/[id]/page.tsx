import { getSupabase } from "@/lib/supabase";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import AudioPlayer from "./AudioPlayer";

interface ContentRecord {
  id: string;
  title: string;
  rambam_chapters: string;
  sefer: string;
  hilchot: string;
  hook: string;
  summary: string;
  media_url: string;
  media_type: string;
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
    description: data.summary || `Daily talk on ${data.rambam_chapters}`,
  };
}

export default async function ListenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("content")
    .select(
      "id,title,rambam_chapters,sefer,hilchot,hook,summary,media_url,media_type,rambam_date,published_at"
    )
    .eq("id", id)
    .single();

  if (error || !data || !data.media_url) {
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
        <div className="max-w-[600px] mx-auto px-5 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 text-[15px] font-medium text-primary hover:text-parchment-gold transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back_ios</span>
            Home
          </Link>
          <Link
            href={`/read/${content.id}`}
            className="text-[15px] font-medium text-primary hover:text-parchment-gold transition-colors"
          >
            Read Essay
          </Link>
        </div>
      </header>

      <div className="max-w-[600px] mx-auto px-5 py-10">
        {/* Content */}
        <div className="mb-10">
          <p
            className="text-[10px] font-semibold tracking-[0.15em] uppercase text-parchment-gold mb-4"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Daily Talk
          </p>
          <h1 className="font-serif text-[28px] font-semibold text-primary leading-tight mb-4">
            {content.title}
          </h1>
          <p className="font-serif text-base text-parchment-gold/80 italic leading-relaxed mb-5">
            {content.hook}
          </p>
          <div className="flex flex-wrap gap-4 text-[13px] text-muted-gray">
            <span>{content.rambam_chapters}</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Audio Player */}
        <AudioPlayer src={content.media_url} title={content.title} />

        {/* Summary */}
        {content.summary && (
          <div className="mt-10 pt-8 border-t border-soft-border">
            <p
              className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-gray mb-4"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              About This Talk
            </p>
            <p className="font-serif text-base text-primary leading-relaxed">
              {content.summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
