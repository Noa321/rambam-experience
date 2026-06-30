import { getSupabase } from "@/lib/supabase";
import { getActiveTrack } from "@/lib/track-server";
import { Metadata } from "next";
import Link from "next/link";
import CaseGame from "./CaseGame";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Rambam Case",
  description: "A daily case to test your reasoning against the Rambam's Mishneh Torah",
};

interface CaseRecord {
  id: string;
  rambam_date: string;
  chapters_label: string;
  sefer: string;
  hilchot: string;
  case_data: {
    case_narrative: string;
    case_title: string;
    principles: Array<{
      id: string;
      text: string;
      chapter: number;
      halacha: number;
      is_relevant: boolean;
      why_relevant?: string;
      why_not?: string;
    }>;
    applications: Array<{
      principle_id: string;
      question: string;
      options: string[];
      correct_index: number;
      explanation: string;
    }>;
    rulings: Array<{ text: string; is_correct: boolean }>;
    reveal_chain: Array<{
      step: number;
      chapter: number;
      halacha: number;
      principle_summary: string;
      application_to_case: string;
      source_text: string;
    }>;
    ruling_explanation: string;
  };
}

export default async function GamePage() {
  const supabase = getSupabase();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const track = await getActiveTrack();

  let puzzle: CaseRecord | null = null;

  const { data: todayData } = await supabase
    .from("game_cases")
    .select("*")
    .eq("track", track)
    .eq("rambam_date", today)
    .maybeSingle();

  if (todayData) {
    puzzle = todayData as CaseRecord;
  } else {
    const { data: recentData } = await supabase
      .from("game_cases")
      .select("*")
      .eq("track", track)
      .lte("rambam_date", today)
      .order("rambam_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recentData) puzzle = recentData as CaseRecord;
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen pb-28">
        <header
          className="sticky top-0 z-50 border-b border-soft-border bottom-nav-blur"
          style={{ backgroundColor: "rgba(253, 251, 247, 0.85)" }}
        >
          <div className="max-w-[600px] mx-auto px-5 h-14 flex items-center">
            <Link
              href="/"
              className="flex items-center gap-1 text-[15px] font-medium text-primary hover:text-parchment-gold transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back_ios</span>
              Home
            </Link>
          </div>
        </header>
        <div className="max-w-[600px] mx-auto px-5 py-20 text-center">
          <span className="material-symbols-outlined text-parchment-gold mb-4" style={{ fontSize: "48px" }}>gavel</span>
          <h1 className="font-serif text-2xl font-semibold text-primary mb-3">No Case Yet</h1>
          <p className="text-muted-gray mb-8">Today&#39;s case hasn&#39;t been published yet. Check back soon.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white text-[15px] font-medium px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
          >
            Back to Today
          </Link>
        </div>
      </div>
    );
  }

  // Link the day's d'var Torah for the "Read Today's Essay" card
  let contentId: string | null = null;
  const { data: contentRow } = await supabase
    .from("content")
    .select("id")
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .eq("track", track)
    .eq("rambam_date", puzzle.rambam_date)
    .limit(1)
    .maybeSingle();
  if (contentRow) contentId = (contentRow as { id: string }).id;

  return (
    <CaseGame
      puzzle={{
        date: puzzle.rambam_date,
        chaptersLabel: puzzle.chapters_label,
        sefer: puzzle.sefer,
        hilchot: puzzle.hilchot,
        caseData: puzzle.case_data,
      }}
      contentId={contentId}
    />
  );
}
