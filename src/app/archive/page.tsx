import { getSupabase } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Archive | The Rambam Experience",
  description: "Browse every d'var Torah in The Rambam Experience.",
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
    .select("id,title,hook,summary,rambam_chapters,sefer,hilchot,media_url,rambam_date,published_at")
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .lte("rambam_date", today)
    .order("rambam_date", { ascending: false });
  if (error || !data) return [];
  return data as ContentRecord[];
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default async function ArchivePage() {
  const content = await getAllContent();
  return (
    <div className="min-h-screen pb-28">
      <Header />

      <div className="max-w-[800px] mx-auto px-5">
        <div className="pt-8 pb-6">
          <h1 className="font-serif text-[28px] sm:text-[34px] font-semibold text-primary leading-tight">Archive</h1>
          <p className="text-[15px] text-muted-gray mt-1">Every d&#39;var Torah from The Rambam Experience</p>
        </div>

        {content.length === 0 ? (
          <p className="text-center text-muted-gray text-[15px] py-12">No content published yet.</p>
        ) : (
          <div className="bg-surface-container-low rounded-xl border border-soft-border divide-y divide-soft-border overflow-hidden">
            {content.map((item) => (
              <Link
                key={item.id}
                href={`/read/${item.id}`}
                className="block p-4 hover:bg-white transition-colors active:scale-[0.99] group"
              >
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-parchment-gold mb-1" style={{ fontFamily: "var(--font-sans)" }}>
                  {item.rambam_chapters}
                </p>
                <h2 className="font-serif text-[17px] font-semibold text-primary mb-1 group-hover:text-parchment-gold transition-colors">{item.title}</h2>
                {item.hook && <p className="text-[13px] text-muted-gray line-clamp-2 mb-1.5">{item.hook}</p>}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-gray" style={{ fontFamily: "var(--font-sans)" }}>
                    {formatFullDate(item.rambam_date || item.published_at)}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-soft-border" />
                  <span className="text-[11px] text-muted-gray" style={{ fontFamily: "var(--font-sans)" }}>
                    Sefer {item.sefer}
                  </span>
                  {item.media_url && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-soft-border" />
                      <span className="material-symbols-outlined text-parchment-gold" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
