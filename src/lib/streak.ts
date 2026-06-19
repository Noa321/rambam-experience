// Personal practice tracking via localStorage (no account needed).
// Records the local calendar days the learner opened the app.

const KEY = "rambam_visit_dates";

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

export function recordVisit(): void {
  if (typeof window === "undefined") return;
  try {
    const set = readDates();
    set.add(dayStr(new Date()));
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* localStorage unavailable */
  }
}

export interface VisitStats {
  streak: number;
  daysLearned: number;
}

export function getVisitStats(): VisitStats {
  const set = readDates();
  const daysLearned = set.size;

  let streak = 0;
  const d = new Date();
  // Count consecutive days ending today (or yesterday, if today not yet recorded)
  if (!set.has(dayStr(d))) d.setDate(d.getDate() - 1);
  while (set.has(dayStr(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  return { streak, daysLearned };
}
