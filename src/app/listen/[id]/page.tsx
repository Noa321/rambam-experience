import { getSupabase } from "@/lib/supabase";
import { Metadata } from "next";
import { notFound } from "next/navigation";
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

  const formattedDate = new Date(content.rambam_date).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-[600px] mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex items-center gap-3 mb-12 pb-6 border-b-2 border-[#E2E2E2]">
          <span
            className="material-symbols-outlined text-[#2C3E50]"
            style={{
              fontSize: "32px",
              fontVariationSettings: "'FILL' 1",
            }}
          >
            auto_stories
          </span>
          <div className="font-[family-name:var(--font-dm-sans)] text-lg font-semibold text-[#2C3E50] tracking-wide">
            The Rambam / Experience
          </div>
        </header>

        {/* Content */}
        <div className="mb-10">
          <p className="font-[family-name:var(--font-dm-sans)] text-xs uppercase tracking-[2px] text-[#C0392B] font-semibold mb-3">
            Daily Talk
          </p>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-[28px] font-semibold text-[#2C3E50] leading-tight mb-4">
            {content.title}
          </h1>
          <p className="font-[family-name:var(--font-literata)] text-base text-[#C0392B] italic leading-relaxed mb-5">
            {content.hook}
          </p>
          <div className="font-[family-name:var(--font-dm-sans)] text-sm text-[#718096] flex flex-wrap gap-4">
            <span>{content.rambam_chapters}</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Audio Player */}
        <AudioPlayer src={content.media_url} title={content.title} />

        {/* Summary */}
        {content.summary && (
          <div className="mt-10 pt-8 border-t border-[#E2E2E2]">
            <p className="font-[family-name:var(--font-dm-sans)] text-xs uppercase tracking-[2px] text-[#718096] font-semibold mb-3">
              About This Talk
            </p>
            <p className="font-[family-name:var(--font-literata)] text-base text-[#2A2A28] leading-relaxed">
              {content.summary}
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t-2 border-[#E2E2E2] text-center">
          <p className="font-[family-name:var(--font-dm-sans)] text-sm text-[#718096]">
            The Rambam Experience &middot; therambamexperience.com
          </p>
        </footer>
      </div>
    </div>
  );
}
