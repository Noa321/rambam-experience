// Personal practice tracking via localStorage (no account needed).
// Tracks the calendar days the learner has marked their learning complete.

const KEY = "rambam_completed_dates";
const CHAPTERS_PER_DAY = 3;

function dayStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function readDates(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeDates(set: Set<string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* localStorage unavailable */
  }
}

export function isTodayComplete(): boolean {
  return readDates().has(dayStr(new Date()));
}

export function setTodayComplete(complete: boolean): void {
  if (typeof window === "undefined") return;
  const set = readDates();
  const t = dayStr(new Date());
  if (complete) set.add(t);
  else set.delete(t);
  writeDates(set);
}

export interface Progress {
  streak: number;
  daysCompleted: number;
  chapters: number;
}

export function getProgress(): Progress {
  const set = readDates();
  const daysCompleted = set.size;

  let streak = 0;
  const d = new Date();
  // Allow the streak to count even if today isn't marked yet (count from yesterday)
  if (!set.has(dayStr(d))) d.setDate(d.getDate() - 1);
  while (set.has(dayStr(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  return { streak, daysCompleted, chapters: daysCompleted * CHAPTERS_PER_DAY };
}
