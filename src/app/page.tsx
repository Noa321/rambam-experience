import { getSupabase } from "@/lib/supabase";
import { books } from "@/data/books";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export const dynamic = "force-dynamic";

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
  body: string;
}

async function getTodaysContent(): Promise<ContentRecord | null> {
  const supabase = getSupabase();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const nowISO = new Date().toISOString();

  const { data: todayData } = await supabase
    .from("content")
    .select("id,title,hook,summary,rambam_chapters,sefer,hilchot,media_url,rambam_date,published_at,body")
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .eq("rambam_date", today)
    .limit(1)
    .single();

  if (todayData) return todayData as ContentRecord;

  const { data: byDate } = await supabase
    .from("content")
    .select("id,title,hook,summary,rambam_chapters,sefer,hilchot,media_url,rambam_date,published_at,body")
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .not("rambam_date", "is", null)
    .lte("rambam_date", today)
    .order("rambam_date", { ascending: false })
    .limit(1)
    .single();

  if (byDate) return byDate as ContentRecord;

  const { data: byPublished } = await supabase
    .from("content")
    .select("id,title,hook,summary,rambam_chapters,sefer,hilchot,media_url,rambam_date,published_at,body")
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .lte("published_at", nowISO)
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  if (byPublished) return byPublished as ContentRecord;
  return null;
}

async function getRecentContent(): Promise<ContentRecord[]> {
  const supabase = getSupabase();
  const nowISO = new Date().toISOString();

  const { data, error } = await supabase
    .from("content")
    .select("id,title,hook,summary,rambam_chapters,sefer,hilchot,media_url,rambam_date,published_at,body")
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .lte("published_at", nowISO)
    .order("published_at", { ascending: false })
    .limit(7);

  if (error || !data) return [];
  return data as ContentRecord[];
}

function formatDateUpper(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).toUpperCase();
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }).toUpperCase();
}

/* ── Treatise mappings ── */

const HILCHOT_TO_TREATISE: Record<string, string> = {};
for (const book of books) {
  for (const t of book.treatises) {
    HILCHOT_TO_TREATISE[t.name.toLowerCase()] = t.id;
  }
}
const ALIASES: Record<string, string> = {
  "sotah": "sotah", "issurei biah": "intercourse", "forbidden intercourse": "intercourse",
  "chametz u\'matzah": "chametz", "chametz umatzah": "chametz",
  "shofar, sukkah and lulav": "shofar", "shofar, sukkah, vlulav": "shofar",
  "foundations of the torah": "foundations", "human dispositions": "dispositions",
  "torah study": "torah-study", "foreign worship": "foreign-worship",
  "reading the shema": "shema", "prayer": "prayer", "tefillin": "tefillin",
  "fringes": "fringes", "blessings": "blessings", "circumcision": "circumcision",
  "sabbath": "sabbath", "eruvin": "eruvin", "marriage": "marriage", "divorce": "divorce",
  "forbidden foods": "forbidden-foods", "ritual slaughter": "slaughter", "repentance": "repentance",
  "shechitah": "slaughter",
  "maaser": "tithes", "tithes": "tithes",
  "maaser sheini": "second-tithes", "maaser sheni": "second-tithes", "second tithes": "second-tithes",
};
for (const [alias, id] of Object.entries(ALIASES)) { HILCHOT_TO_TREATISE[alias] = id; }

/* Sefaria URL names for Mishneh Torah treatises */
const SEFARIA_NAMES: Record<string, string> = {
  "foundations": "Foundations_of_the_Torah",
  "dispositions": "Human_Dispositions",
  "torah-study": "Torah_Study",
  "foreign-worship": "Foreign_Worship_and_Customs_of_the_Nations",
  "repentance": "Repentance",
  "shema": "Reading_the_Shema",
  "prayer": "Prayer_and_the_Priestly_Blessing",
  "tefillin": "Tefillin%2C_Mezuzah_and_the_Torah_Scroll",
  "fringes": "Fringes",
  "blessings": "Blessings",
  "circumcision": "Circumcision",
  "sabbath": "Sabbath",
  "eruvin": "Eruvin",
  "shofar": "Shofar%2C_Sukkah_and_Lulav",
  "chametz": "Leavened_and_Unleavened_Bread",
  "marriage": "Marriage",
  "divorce": "Divorce",
  "intercourse": "Forbidden_Intercourse",
  "forbidden-foods": "Forbidden_Foods",
  "slaughter": "Ritual_Slaughter",
  "tithes": "Tithes",
  "second-tithes": "Second_Tithes",
  "sotah": "Sotah",
};

interface ParsedChapter {
  treatiseId: string;
  treatiseName: string;
  chapter: number;
  bookEng: string;
  sefariaUrl: string;
}

function parseChaptersFromContent(rambamChapters: string, hilchot: string, sefer: string): ParsedChapter[] {
  const chapters: ParsedChapter[] = [];
  const parts = rambamChapters.split(",").map(s => s.trim());
  for (const part of parts) {
    const match = part.match(/^(.+?)\s+([\d]+(?:\s*[-–]\s*[\d]+)?)$/);
    if (!match) continue;
    const treatiseName = match[1].trim();
    const chapterStr = match[2].trim();
    const treatiseId = HILCHOT_TO_TREATISE[treatiseName.toLowerCase()];
    if (!treatiseId) continue;
    let displayName = treatiseName;
    let bookEng = sefer;
    for (const book of books) {
      for (const t of book.treatises) {
        if (t.id === treatiseId) { displayName = t.name; bookEng = book.eng; break; }
      }
    }
    const sefariaName = SEFARIA_NAMES[treatiseId] || treatiseName.replace(/\s+/g, "_");
    const rangeParts = chapterStr.split(/[-–]/).map(s => parseInt(s.trim()));
    if (rangeParts.length === 2) {
      for (let ch = rangeParts[0]; ch <= rangeParts[1]; ch++) {
        const sefariaUrl = `https://www.sefaria.org/Mishneh_Torah%2C_${sefariaName}.${ch}?lang=bi`;
        chapters.push({ treatiseId, treatiseName: displayName, chapter: ch, bookEng, sefariaUrl });
      }
    } else if (rangeParts.length === 1 && !isNaN(rangeParts[0])) {
      const sefariaUrl = `https://www.sefaria.org/Mishneh_Torah%2C_${sefariaName}.${rangeParts[0]}?lang=bi`;
      chapters.push({ treatiseId, treatiseName: displayName, chapter: rangeParts[0], bookEng, sefariaUrl });
    }
  }
  return chapters;
}


export default async function Home() {
  const today = await getTodaysContent();
  const recent = await getRecentContent();
  const todayChapters = today ? parseChaptersFromContent(today.rambam_chapters, today.hilchot, today.sefer) : [];

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: "rgb(253, 251, 247)" }}>
      <Header />

      <main className="max-w-[800px] mx-auto px-5 mt-8">
        {today ? (
          <>
            {/* Date Header */}
            <p
              className="text-[12px] leading-[16px] font-semibold tracking-[0.1em] uppercase mb-2"
              style={{ fontFamily: "var(--font-sans)", color: "#86868B" }}
            >
              {formatDateUpper(today.rambam_date || today.published_at)}
            </p>

            {/* Hero Section */}
            <section className="mb-12">
              <div className="relative overflow-hidden rounded-[24px] bg-primary text-white p-8 mb-8">
                <div className="relative z-10 max-w-[600px] mx-auto text-center py-8">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.1em] uppercase mb-4"
                    style={{ backgroundColor: "rgba(184, 134, 11, 0.2)", color: "#ffe088", fontFamily: "var(--font-sans)" }}
                  >
                    TODAY&#39;S LEARNING
                  </span>
                  <h2
                    className="font-serif font-bold mb-4"
                    style={{ fontSize: "40px", lineHeight: "48px", letterSpacing: "-0.02em" }}
                  >
                    {today.title}
                  </h2>
                  <p className="font-serif text-[24px] leading-[32px] font-semibold opacity-90 mb-8">
                    {today.rambam_chapters} | Sefer {today.sefer}
                  </p>
                  {today.hook && (
                    <p className="text-[18px] leading-[28px] opacity-80" style={{ color: "#d1e4fb" }}>
                      {today.hook}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Cards (Stacked) */}
              <div className="space-y-4">
                <Link
                  href={`/read/${today.id}`}
                  className="w-full flex items-center justify-between p-5 bg-white rounded-[24px] ios-card-shadow border border-soft-border hover:bg-surface-container-low transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-xl"
                      style={{ backgroundColor: "#d1e4fb" }}
                    >
                      <span className="material-symbols-outlined text-primary">article</span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-[16px] leading-[24px] font-semibold text-charcoal-text">
                        Read the Essay
                      </h3>
                      <p className="text-[14px] leading-[20px] text-muted-gray">
                        Deep dive into the full d&#39;var Torah
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-muted-gray">chevron_right</span>
                </Link>

                {today.media_url ? (
                  <Link
                    href={`/listen/${today.id}`}
                    className="w-full flex items-center justify-between p-5 bg-white rounded-[24px] ios-card-shadow border border-soft-border hover:bg-surface-container-low transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 flex items-center justify-center rounded-xl"
                        style={{ backgroundColor: "#ffddb7" }}
                      >
                        <span className="material-symbols-outlined" style={{ color: "#362308" }}>
                          headset
                        </span>
                      </div>
                      <div className="text-left">
                        <h3 className="text-[16px] leading-[24px] font-semibold text-charcoal-text">
                          Listen
                        </h3>
                        <p className="text-[14px] leading-[20px] text-muted-gray">
                          A spoken talk on today&#39;s themes
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-muted-gray">chevron_right</span>
                  </Link>
                ) : (
                  <div className="w-full flex items-center justify-between p-5 bg-white rounded-[24px] ios-card-shadow border border-soft-border opacity-50">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 flex items-center justify-center rounded-xl"
                        style={{ backgroundColor: "#ffddb7" }}
                      >
                        <span className="material-symbols-outlined" style={{ color: "#362308" }}>
                          headset
                        </span>
                      </div>
                      <div className="text-left">
                        <h3 className="text-[16px] leading-[24px] font-semibold text-charcoal-text">Listen</h3>
                        <p className="text-[14px] leading-[20px] text-muted-gray">Coming soon</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-muted-gray">chevron_right</span>
                  </div>
                )}

                <Link
                  href={`/learn/${today.id}`}
                  className="w-full flex items-center justify-between p-5 bg-white rounded-[24px] ios-card-shadow border border-soft-border hover:bg-surface-container-low transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-xl"
                      style={{ backgroundColor: "#ffe088" }}
                    >
                      <span className="material-symbols-outlined" style={{ color: "#735c00" }}>
                        summarize
                      </span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-[16px] leading-[24px] font-semibold text-charcoal-text">
                        One Page Summary
                      </h3>
                      <p className="text-[14px] leading-[20px] text-muted-gray">
                        A structured overview of the text
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-muted-gray">chevron_right</span>
                </Link>
              </div>
            </section>

            {/* Chapters Section */}
            {todayChapters.length > 0 && (
              <section className="mb-12">
                <h3
                  className="text-[12px] leading-[16px] font-semibold tracking-[0.1em] uppercase mb-4"
                  style={{ fontFamily: "var(--font-sans)", color: "#86868B" }}
                >
                  CHAPTERS
                </h3>
                <div className="bg-white rounded-[24px] border border-soft-border divide-y divide-soft-border overflow-hidden">
                  {todayChapters.map((ch) => (
                    <a
                      key={`ch-${ch.treatiseId}-${ch.chapter}`}
                      href={ch.sefariaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors group"
                    >
                      <span className="text-[16px] leading-[24px]">
                        Chapter {ch.chapter}
                      </span>
                      <div className="flex items-center gap-2 text-parchment-gold opacity-0 group-hover:opacity-100 transition-opacity">
                        <span
                          className="text-[14px] font-semibold tracking-[0.1em] uppercase"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          SEFARIA
                        </span>
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                          open_in_new
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Section */}
            {recent.length > 1 && (
              <section>
                <h3
                  className="text-[12px] leading-[16px] font-semibold tracking-[0.1em] uppercase mb-4"
                  style={{ fontFamily: "var(--font-sans)", color: "#86868B" }}
                >
                  RECENT
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recent.slice(1).map((item) => (
                    <Link
                      key={item.id}
                      href={`/read/${item.id}`}
                      className="bg-white p-6 rounded-[24px] border border-soft-border ios-card-shadow group cursor-pointer hover:border-outline-variant transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted-gray"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          {formatShortDate(item.rambam_date || item.published_at)}
                        </span>
                        {item.media_url && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-outline-variant" />
                            <span
                              className="material-symbols-outlined text-parchment-gold"
                              style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}
                            >
                              play_circle
                            </span>
                          </>
                        )}
                      </div>
                      <h4 className="font-serif text-[24px] leading-[32px] font-semibold text-primary mb-2 group-hover:text-parchment-gold transition-colors">
                        {item.title}
                      </h4>
                      {item.hook && (
                        <p className="text-[14px] leading-[20px] text-muted-gray line-clamp-2">
                          {item.hook}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="pt-12 pb-8 text-center">
            <h1 className="font-serif text-[40px] leading-[48px] font-bold text-primary mb-4">
              The Rambam Experience
            </h1>
            <p className="text-[18px] leading-[28px] text-muted-gray">
              Daily Torah insights on the Rambam&#39;s Mishneh Torah.
            </p>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
