// Daily Rambam study cycle calculator
// The traditional 3-chapters-per-day cycle covers the entire Mishneh Torah in ~1 year
// This module computes which 3 chapters to study on any given day.

import { books, type Treatise } from "@/data/books";

export interface DailyChapter {
  treatise: Treatise;
  chapter: number;
  bookId: string;
  bookColor: string;
  bookHeb: string;
  bookEng: string;
}

export interface DailyStudy {
  dayOfCycle: number;      // Which day in the ~334-day cycle
  totalDays: number;       // Total days in the cycle
  cycleNumber: number;     // Which cycle (44th, 45th, etc.)
  cycleProgress: number;   // 0-100 percentage through the cycle
  chapters: DailyChapter[];
  dateHebrew?: string;     // Could add Hebrew date later
}

/**
 * Build a flat sequential list of every chapter in the Mishneh Torah.
 * Each entry has the treatise info and chapter number.
 */
function buildChapterSequence(): DailyChapter[] {
  const sequence: DailyChapter[] = [];

  for (const book of books) {
    for (const treatise of book.treatises) {
      for (let ch = 1; ch <= treatise.chapters; ch++) {
        sequence.push({
          treatise,
          chapter: ch,
          bookId: book.id,
          bookColor: book.color,
          bookHeb: book.heb,
          bookEng: book.eng,
        });
      }
    }
  }

  return sequence;
}

// Pre-compute the full chapter sequence (982 chapters across 83 treatises)
const CHAPTER_SEQUENCE = buildChapterSequence();

// 3 chapters per day means ~327 days per cycle
const CHAPTERS_PER_DAY = 3;
const TOTAL_DAYS = Math.ceil(CHAPTER_SEQUENCE.length / CHAPTERS_PER_DAY);

// Cycle 44 start date: approximately Iyar 5784 / April 2024
// We use a fixed epoch to calculate which day of the cycle we're on.
// The actual date doesn't matter much — what matters is consistency.
const CYCLE_EPOCH = new Date("2024-04-23"); // Start of a known cycle

/**
 * Calculate the number of days between two dates (ignoring time).
 */
function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86400000;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utcB - utcA) / msPerDay);
}

/**
 * Get today's daily study — the 3 chapters to learn today.
 *
 * @param date - Optional date override (defaults to today)
 */
export function getDailyStudy(date?: Date): DailyStudy {
  const today = date || new Date();
  const totalDaysSinceEpoch = daysBetween(CYCLE_EPOCH, today);

  // Which day within the current cycle (0-indexed)
  const dayOfCycle = ((totalDaysSinceEpoch % TOTAL_DAYS) + TOTAL_DAYS) % TOTAL_DAYS;

  // Which cycle number
  const cycleNumber = 44 + Math.floor(totalDaysSinceEpoch / TOTAL_DAYS);

  // Get this day's 3 chapters
  const startIndex = dayOfCycle * CHAPTERS_PER_DAY;
  const chapters = CHAPTER_SEQUENCE.slice(startIndex, startIndex + CHAPTERS_PER_DAY);

  // Progress through the cycle
  const cycleProgress = Math.round((dayOfCycle / TOTAL_DAYS) * 100);

  return {
    dayOfCycle: dayOfCycle + 1, // 1-indexed for display
    totalDays: TOTAL_DAYS,
    cycleNumber,
    cycleProgress,
    chapters,
  };
}

/**
 * Get a friendly label for today's study portion.
 * e.g. "Hilchot Sabbath, Ch. 4–6" or "Hilchot Sabbath Ch.30 – Eruvin Ch.1–2"
 */
export function getDailyStudyLabel(study: DailyStudy): string {
  const chapters = study.chapters;
  if (chapters.length === 0) return "";

  // Check if all chapters are from the same treatise
  const allSameTreatise = chapters.every(c => c.treatise.id === chapters[0].treatise.id);

  if (allSameTreatise) {
    const t = chapters[0].treatise;
    const chNums = chapters.map(c => c.chapter);
    return `Hilchot ${t.name}, Ch. ${chNums.join("–")}`;
  }

  // Chapters span two treatises (boundary day)
  const groups: Map<string, DailyChapter[]> = new Map();
  for (const ch of chapters) {
    const key = ch.treatise.id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ch);
  }

  const parts: string[] = [];
  for (const [, group] of groups) {
    const t = group[0].treatise;
    const chNums = group.map(c => c.chapter);
    if (chNums.length === 1) {
      parts.push(`${t.name} Ch. ${chNums[0]}`);
    } else {
      parts.push(`${t.name} Ch. ${chNums[0]}–${chNums[chNums.length - 1]}`);
    }
  }

  return parts.join(" · ");
}

/**
 * Get total chapters in the entire Mishneh Torah
 */
export function getTotalChapters(): number {
  return CHAPTER_SEQUENCE.length;
}