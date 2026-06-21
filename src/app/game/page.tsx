import { getSupabase } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";
import RiddleGame from "./RiddleGame";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Rambam Riddle | The Rambam Experience",
  description: "A daily game to test your knowledge of the Rambam's Mishneh Torah",
};

interface PuzzleRecord {
  id: string;
  rambam_date: string;
  chapters_label: string;
  sefer: string;
  hilchot: string;
  riddle_data: {
    rounds: Array<{
      chapter: number;
      clues: string[];
      options: string[];
      correct_index: number;
      source_text: string;
    }>;
  };
}

export default async function GamePage() {
  const supabase = getSupabase();
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });

  let puzzle: PuzzleRecord | null = null;

  const { data: todayData } = await supabase
    .from("game_puzzles")
    .select("*")
    .eq("rambam_date", today)
    .maybeSingle();

  if (todayData) {
    puzzle = todayData as PuzzleRecord;
  } else {
    const { data: recentData } = await supabase
      .from("game_puzzles")
      .select("*")
      .lte("rambam_date", today)
      .order("rambam_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentData) puzzle = recentData as PuzzleRecord;
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
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                arrow_back_ios
              </span>
              Home
            </Link>
          </div>
        </header>
        <div className="max-w-[600px] mx-auto px-5 py-20 text-center">
          <span
            className="material-symbols-outlined text-parchment-gold mb-4"
            style={{ fontSize: "48px" }}
          >
            quiz
          </span>
          <h1 className="font-serif text-2xl font-semibold text-primary mb-3">
            No Puzzle Yet
          </h1>
          <p className="text-muted-gray mb-8">
            Today&#39;s Rambam Riddle hasn&#39;t been published yet. Check back soon.
          </p>
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

  // Link the day's d'var Torah for the "Go Deeper" section
  let contentId: string | null = null;
  const { data: contentRow } = await supabase
    .from("content")
    .select("id")
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .eq("rambam_date", puzzle.rambam_date)
    .limit(1)
    .maybeSingle();
  if (contentRow) contentId = (contentRow as { id: string }).id;

  return (
    <RiddleGame
      puzzle={{
        date: puzzle.rambam_date,
        chaptersLabel: puzzle.chapters_label,
        sefer: puzzle.sefer,
        hilchot: puzzle.hilchot,
        rounds: puzzle.riddle_data.rounds,
      }}
      contentId={contentId}
    />
  );
}
