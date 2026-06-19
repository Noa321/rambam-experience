// Cycle math for the journey map: where today's daily-Rambam learning sits
// within the full Mishneh Torah (14 books, 83 treatises, ~1000 chapters).

import { books, getBookChapterCount, type Book } from "@/data/books";

export const TOTAL_CHAPTERS = books.reduce((s, b) => s + getBookChapterCount(b), 0);
export const TOTAL_TREATISES = books.reduce((s, b) => s + b.treatises.length, 0);
export const TOTAL_BOOKS = books.length;

// treatise display name (lowercased) -> id
const NAME_TO_ID: Record<string, string> = {};
for (const b of books) {
  for (const t of b.treatises) NAME_TO_ID[t.name.toLowerCase()] = t.id;
}

// Variant / transliterated names the content uses for treatises
const ALIASES: Record<string, string> = {
  "foundations of the torah": "foundations", "yesodei hatorah": "foundations",
  "human dispositions": "dispositions", "deot": "dispositions", "de'ot": "dispositions",
  "torah study": "torah-study", "talmud torah": "torah-study",
  "foreign worship": "foreign-worship", "avodah zarah": "foreign-worship", "idolatry": "foreign-worship",
  "repentance": "repentance", "teshuvah": "repentance",
  "reading the shema": "shema", "kriat shema": "shema", "shema": "shema",
  "prayer": "prayer", "tefillah": "prayer", "prayer and the priestly blessing": "prayer",
  "tefillin": "tefillin", "tefillin, mezuzah and the torah scroll": "tefillin",
  "fringes": "fringes", "tzitzit": "fringes",
  "blessings": "blessings", "berachot": "blessings",
  "circumcision": "circumcision", "milah": "circumcision",
  "sabbath": "sabbath", "shabbat": "sabbath",
  "eruvin": "eruvin",
  "rest on the tenth of tishrei": "yom-kippur",
  "rest on a holiday": "yom-tov",
  "leavened and unleavened bread": "chametz", "chametz umatzah": "chametz", "chametz u'matzah": "chametz",
  "shofar, sukkah and lulav": "shofar", "shofar sukkah and lulav": "shofar",
  "sheqel dues": "shekel", "shekalim": "shekel",
  "sanctification of the new month": "new-month", "kiddush hachodesh": "new-month",
  "fasts": "fasts", "taaniyot": "fasts",
  "scroll of esther and hanukkah": "megillah", "megillah and chanukah": "megillah",
  "marriage": "marriage", "ishut": "marriage",
  "divorce": "divorce", "gerushin": "divorce",
  "levirate marriage and release": "levirate", "yibbum": "levirate",
  "virgin maiden": "virgin", "naarah betulah": "virgin",
  "woman suspected of infidelity": "sotah", "sotah": "sotah",
  "forbidden intercourse": "intercourse", "issurei biah": "intercourse",
  "forbidden foods": "forbidden-foods", "maachalot assurot": "forbidden-foods",
  "ritual slaughter": "slaughter", "shechitah": "slaughter",
  "oaths": "oaths", "shevuot": "oaths",
  "vows": "vows", "nedarim": "vows",
  "nazirite": "nazirite", "nezirut": "nazirite",
  "appraisals and devoted property": "appraisals",
  "diverse species": "diverse-species", "kilayim": "diverse-species",
  "gifts to the poor": "gifts-poor", "matnot aniyim": "gifts-poor",
  "heave offerings": "heave-offerings", "terumot": "heave-offerings", "terumah": "heave-offerings",
  "tithes": "tithes", "maaser": "tithes", "maaserot": "tithes",
  "second tithes and fourth year's fruit": "second-tithes", "second tithes": "second-tithes",
  "second tithe": "second-tithes", "maaser sheini": "second-tithes", "maaser sheni": "second-tithes",
  "first fruits": "first-fruits", "bikkurim": "first-fruits",
  "sabbatical year and the jubilee": "sabbatical", "shemitah": "sabbatical", "shmita": "sabbatical",
};

export function resolveTreatiseId(name: string | null | undefined): string | null {
  if (!name) return null;
  const key = name.trim().toLowerCase();
  return NAME_TO_ID[key] || ALIASES[key] || null;
}

// Flat ordered treatises with the chapter offset that precedes each one
interface FlatTreatise { id: string; bookIndex: number; offset: number; chapters: number }
const FLAT: FlatTreatise[] = [];
{
  let offset = 0;
  books.forEach((b, bi) => {
    b.treatises.forEach((t) => {
      FLAT.push({ id: t.id, bookIndex: bi, offset, chapters: t.chapters });
      offset += t.chapters;
    });
  });
}

export interface CyclePosition {
  bookIndex: number;
  treatiseId: string;
  globalChapter: number; // 1-based index across the whole Mishneh Torah
  percent: number;       // 0-100 through the full cycle
}

// Resolve today's content (e.g. "Maaser Sheini 5-7") to a position in the cycle.
export function cyclePositionFromContent(
  rambamChapters: string,
  hilchot?: string
): CyclePosition | null {
  let treatiseId: string | null = null;
  let chapter = 1;

  const parts = (rambamChapters || "").split(",").map((s) => s.trim());
  for (const part of parts) {
    const m = part.match(/^(.+?)\s+(\d+)(?:\s*[-–]\s*(\d+))?$/);
    if (!m) continue;
    const id = resolveTreatiseId(m[1]);
    if (!id) continue;
    treatiseId = id;
    chapter = parseInt(m[3] || m[2], 10); // furthest chapter reached today
  }

  if (!treatiseId) treatiseId = resolveTreatiseId(hilchot);
  if (!treatiseId) return null;

  const flat = FLAT.find((f) => f.id === treatiseId);
  if (!flat) return null;

  const globalChapter = Math.min(flat.offset + chapter, TOTAL_CHAPTERS);
  return {
    bookIndex: flat.bookIndex,
    treatiseId,
    globalChapter,
    percent: Math.round((globalChapter / TOTAL_CHAPTERS) * 1000) / 10,
  };
}

// Count how many chapters today's learning covers (e.g. "Maaser Sheini 5-7" = 3).
export function countChapters(rambamChapters: string): number {
  let n = 0;
  for (const part of (rambamChapters || "").split(",")) {
    const m = part.trim().match(/(\d+)(?:\s*[-–]\s*(\d+))?$/);
    if (!m) continue;
    const a = parseInt(m[1], 10);
    const b = m[2] ? parseInt(m[2], 10) : a;
    n += Math.max(1, b - a + 1);
  }
  return n || 3;
}

export interface BookProgress {
  book: Book;
  index: number;
  startChapter: number;
  endChapter: number;
  chapters: number;
  state: "done" | "current" | "upcoming";
  fillPercent: number; // how much of this book the cycle has covered
}

export function bookProgressList(globalChapter: number): BookProgress[] {
  const res: BookProgress[] = [];
  let cursor = 0;
  books.forEach((b, i) => {
    const chapters = getBookChapterCount(b);
    const start = cursor + 1;
    const end = cursor + chapters;
    let state: BookProgress["state"];
    let fillPercent: number;
    if (globalChapter >= end) {
      state = "done";
      fillPercent = 100;
    } else if (globalChapter < start) {
      state = "upcoming";
      fillPercent = 0;
    } else {
      state = "current";
      fillPercent = Math.round(((globalChapter - start + 1) / chapters) * 100);
    }
    res.push({ book: b, index: i, startChapter: start, endChapter: end, chapters, state, fillPercent });
    cursor = end;
  });
  return res;
}
