// Cycle math for the journey map: where today's daily-Rambam learning sits
// within the full Mishneh Torah (14 books, 83 treatises, ~1000 chapters).

import { books, getBookChapterCount, type Book } from "@/data/books";

export const TOTAL_CHAPTERS = books.reduce((s, b) => s + getBookChapterCount(b), 0);
export const TOTAL_TREATISES = books.reduce((s, b) => s + b.treatises.length, 0);
export const TOTAL_BOOKS = books.length;

// Normalize a treatise name for lookup: lowercase, apostrophes stripped,
// punctuation-and-whitespace collapsed — so "Ma'akhalot Assurot", "Maachalot
// Assurot" and "ma’akhalot  assurot" all resolve identically.
const norm = (s: string) =>
  s.toLowerCase().replace(/[’'"]/g, "").replace(/[,.]/g, " ").replace(/\s+/g, " ").trim();

// treatise display name (normalized) -> id
const NAME_TO_ID: Record<string, string> = {};
for (const b of books) {
  for (const t of b.treatises) NAME_TO_ID[norm(t.name)] = t.id;
}

// Every name the content may carry for each treatise: common transliterations
// (what the pipeline stores in `hilchot`/`rambam_chapters`) plus Sefaria display
// names. Keys are written pre-normalized (lowercase, no apostrophes). Covers the
// FULL Mishneh Torah so the journey never goes dark as the cycle advances.
const ALIASES: Record<string, string> = {
  // Sefer HaMadda
  "yesodei hatorah": "foundations", "yesodei torah": "foundations", "foundations of the torah": "foundations",
  "deot": "dispositions", "human dispositions": "dispositions",
  "talmud torah": "torah-study", "torah study": "torah-study",
  "avodah zarah": "foreign-worship", "avodat kochavim": "foreign-worship", "idolatry": "foreign-worship",
  "foreign worship": "foreign-worship", "foreign worship and customs of the nations": "foreign-worship",
  "teshuvah": "repentance",
  // Sefer Ahavah
  "kriat shema": "shema", "keriat shema": "shema", "shema": "shema", "reading the shema": "shema",
  "tefilah": "prayer", "tefillah": "prayer", "prayer": "prayer", "prayer and blessings": "prayer",
  "tefillin mezuzah and the torah scroll": "tefillin", "tefillin mezuzah and torah scroll": "tefillin",
  "tefillin mezuzah and sefer torah": "tefillin", "tefillin": "tefillin",
  "tzitzit": "fringes", "berakhot": "blessings", "berachot": "blessings", "milah": "circumcision",
  // Sefer Zemanim
  "shabbat": "sabbath",
  "shevitat asor": "yom-kippur", "shvitat asor": "yom-kippur", "rest on the tenth of tishrei": "yom-kippur",
  "shevitat yom tov": "yom-tov", "yom tov": "yom-tov", "rest on a holiday": "yom-tov",
  "chametz umatzah": "chametz", "chametz u matzah": "chametz", "leavened and unleavened bread": "chametz",
  "shofar sukkah vlulav": "shofar", "shofar sukkah and lulav": "shofar", "sukkah": "shofar", "lulav": "shofar",
  "shekalim": "shekel", "sheqel dues": "shekel",
  "kiddush hachodesh": "new-month", "sanctification of the new month": "new-month",
  "taaniyot": "fasts", "taanit": "fasts", "fasts": "fasts",
  "megillah vchanukah": "megillah", "megillah and chanukah": "megillah",
  "scroll of esther and hanukkah": "megillah", "megillah": "megillah",
  // Sefer Nashim
  "ishut": "marriage", "gerushin": "divorce",
  "yibbum vchalitzah": "levirate", "yibbum": "levirate", "levirate marriage and release": "levirate",
  "naarah betulah": "virgin", "virgin maiden": "virgin",
  "sotah": "sotah", "woman suspected of infidelity": "sotah",
  // Sefer Kedushah
  "issurei biah": "intercourse", "forbidden intercourse": "intercourse",
  "maakhalot assurot": "forbidden-foods", "maachalot assurot": "forbidden-foods", "forbidden foods": "forbidden-foods",
  "shechitah": "slaughter", "ritual slaughter": "slaughter",
  // Sefer Haflaah
  "shevuot": "oaths", "nedarim": "vows", "nezirut": "nazirite",
  "arakhin": "appraisals", "arachin": "appraisals", "erchin": "appraisals",
  "arakhin vacharamin": "appraisals", "appraisals and devoted property": "appraisals",
  // Sefer Zeraim
  "kilayim": "diverse-species", "diverse kinds": "diverse-species", "diverse species": "diverse-species",
  "matnot aniyim": "gifts-poor", "gifts to the poor": "gifts-poor",
  "terumot": "heave-offerings", "terumah": "heave-offerings", "heave offerings": "heave-offerings",
  "maaser": "tithes", "maaserot": "tithes", "tithes": "tithes",
  "maaser sheini": "second-tithes", "maaser sheni": "second-tithes", "second tithes": "second-tithes",
  "second tithe": "second-tithes", "second tithes and fourth years fruit": "second-tithes",
  "second tithes and fourth year produce": "second-tithes",
  "bikkurim": "first-fruits", "first fruits": "first-fruits",
  "first fruits and other gifts to priests outside the sanctuary": "first-fruits",
  "shemittah": "sabbatical", "shemitah": "sabbatical", "shmita": "sabbatical",
  "shemittah vyovel": "sabbatical", "sabbatical": "sabbatical", "sabbatical year and the jubilee": "sabbatical",
  // Sefer Avodah
  "beit habechirah": "temple", "beit habechira": "temple", "bet habechirah": "temple",
  "the chosen temple": "temple", "chosen temple": "temple",
  "klei hamikdash": "vessels", "klei mikdash": "vessels", "kelei hamikdash": "vessels",
  "vessels of the sanctuary": "vessels", "vessels of the sanctuary and those who serve therein": "vessels",
  "biat hamikdash": "admission", "biat mikdash": "admission",
  "entrance into the sanctuary": "admission", "admission into the sanctuary": "admission",
  "issurei mizbeach": "forbidden-altar", "issurei mizbeiach": "forbidden-altar", "isurei mizbeach": "forbidden-altar",
  "things forbidden on the altar": "forbidden-altar",
  "maaseh hakorbanot": "sacrificial", "maaseh korbanot": "sacrificial", "sacrificial procedure": "sacrificial",
  "temidin umusafin": "daily-offerings", "temidim umusafim": "daily-offerings",
  "daily offerings": "daily-offerings", "daily offerings and additional offerings": "daily-offerings",
  "pesulei hamukdashin": "unfit", "pesulei hamukdashim": "unfit", "psulei hamukdashin": "unfit",
  "sacrifices rendered unfit": "unfit",
  "avodat yom hakippurim": "atonement-day", "avodat yom hakipurim": "atonement-day",
  "service on the day of atonement": "atonement-day",
  "meilah": "trespass", "trespass": "trespass",
  // Sefer Korbanot
  "korban pesach": "paschal", "paschal offering": "paschal",
  "chagigah": "festival", "festival offering": "festival",
  "bechorot": "firstlings", "bekhorot": "firstlings", "firstlings": "firstlings",
  "shegagot": "unintentional", "offerings for unintentional transgressions": "unintentional",
  "mechusarei kapparah": "atonement", "mechusrei kapparah": "atonement",
  "offerings for incomplete atonement": "atonement", "offerings for those with incomplete atonement": "atonement",
  "temurah": "substitution", "substitution": "substitution",
  // Sefer Taharah
  "tumat met": "corpse", "defilement by a corpse": "corpse",
  "parah adumah": "red-heifer", "red heifer": "red-heifer",
  "tumat tzaraat": "leprosy", "tzaraat": "leprosy", "defilement by leprosy": "leprosy",
  "metamei mishkav umoshav": "bed-seat", "those who defile bed or seat": "bed-seat",
  "shear avot hatumot": "other-defile", "other fathers of defilement": "other-defile",
  "other sources of defilement": "other-defile",
  "tumat okhalin": "food-defile", "tumat ochalin": "food-defile", "defilement of foods": "food-defile",
  "keilim": "vessels-purity", "kelim": "vessels-purity",
  "mikvaot": "mikvot", "mikvot": "mikvot", "immersion pools": "mikvot",
  // Sefer Nezikin
  "nizkei mamon": "damages", "damages to property": "damages",
  "geneivah": "theft", "genevah": "theft", "theft": "theft",
  "gezelah vaavedah": "robbery", "gezeilah vaavedah": "robbery", "robbery and lost property": "robbery",
  "chovel umazik": "injury", "one who injures a person or property": "injury",
  "rotzeach": "murder", "rotzeach ushmirat nefesh": "murder",
  "murderer and the preservation of life": "murder",
  // Sefer Kinyan
  "mechirah": "sales", "sales": "sales",
  "zechiyah umatanah": "ownerless", "ownerless property and gifts": "ownerless",
  "shechenim": "neighbors", "shcheinim": "neighbors", "neighbors": "neighbors",
  "sheluchin veshutafin": "partners", "shluchin veshutafin": "partners", "agents and partners": "partners",
  "avadim": "slaves", "slaves": "slaves",
  // Sefer Mishpatim
  "sechirut": "hiring", "hiring": "hiring",
  "sheilah ufikadon": "borrowing", "sheelah ufikadon": "borrowing", "borrowing and deposit": "borrowing",
  "malveh veloveh": "creditor", "malveh vloveh": "creditor", "creditor and debtor": "creditor",
  "toen venitan": "plaintiff", "plaintiff and defendant": "plaintiff",
  "nachalot": "inheritance", "inheritance": "inheritance",
  // Sefer Shoftim
  "sanhedrin": "sanhedrin", "the sanhedrin": "sanhedrin", "sanhedrin vehaonashin": "sanhedrin",
  "edut": "testimony", "testimony": "testimony",
  "mamrim": "rebels", "rebels": "rebels",
  "avel": "mourning", "evel": "mourning", "mourning": "mourning",
  "melachim": "kings", "melachim umilchamot": "kings", "kings and wars": "kings",
  "melachim umilchamoteihem": "kings",
};

export function resolveTreatiseId(name: string | null | undefined): string | null {
  if (!name) return null;
  const key = norm(name);
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
