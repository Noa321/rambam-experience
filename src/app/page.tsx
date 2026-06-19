import { getSupabase } from "@/lib/supabase";
import { books } from "@/data/books";
import Link from "next/link";
import Header from "@/components/Header";

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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
    <div className="min-h-screen bg-white">
      <Header />

      {today ? (
        <>
          {/* ── Hero ── */}
          <section className="pt-8 sm:pt-14 pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="max-w-[680px] mx-auto text-center">
              <p className="text-[10px] sm:text-xs font-semibold tracking-[2px] sm:tracking-[3px] uppercase text-oxide-red mb-3 sm:mb-4">
                {formatDate(today.rambam_date || today.published_at)}
              </p>
              <h1 className="font-serif text-[24px] sm:text-[40px] font-semibold text-slate-ink leading-[1.15] mb-2 sm:mb-3">
                {today.title}
              </h1>
              <p className="text-blue-slate text-sm">
                {today.rambam_chapters}
                <span className="mx-2 text-cloud-gray">|</span>
                Sefer {today.sefer}
              </p>
            </div>
          </section>

          {/* ── Hook quote ── */}
          {today.hook && (
            <section className="pb-6 sm:pb-8 px-4 sm:px-6">
              <div className="max-w-[480px] mx-auto text-center">
                <div className="w-10 h-px bg-cloud-gray mx-auto mb-4" />
                <p className="font-serif text-[13px] sm:text-[15px] text-blue-slate italic leading-relaxed">
                  {today.hook}
                </p>
                <div className="w-10 h-px bg-cloud-gray mx-auto mt-4" />
              </div>
            </section>
          )}

          {/* ── Today's Chapters ── */}
          {todayChapters.length > 0 && (
            <section className="pb-4 sm:pb-6 px-4 sm:px-6">
              <div className="max-w-[680px] mx-auto">
                <h2 className="text-[10px] sm:text-xs font-semibold tracking-[2px] uppercase text-light-slate mb-3 text-center">
                  Today&#39;s chapters
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {todayChapters.map((ch) => (
                    <Link
                      key={`${ch.treatiseId}-${ch.chapter}`}
                      href={`/study/${ch.treatiseId}/${ch.chapter}`}
                      className="bg-ice-white rounded-xl px-4 py-3.5 hover:bg-cloud-gray/60 transition-colors group"
                    >
                      <p className="text-sm font-medium text-slate-ink group-hover:text-oxide-red transition-colors">
                        {ch.treatiseName}
                      </p>
                      <p className="text-xs text-light-slate mt-0.5">
                        Chapter {ch.chapter}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Content sections ── */}
          <section className="pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="max-w-[680px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Read the essay */}
              <Link
                href={`/read/${today.id}`}
                className="bg-slate-ink rounded-xl px-5 py-5 group hover:opacity-95 transition-opacity"
              >
                <span
                  className="material-symbols-outlined text-white/60 mb-3 block"
                  style={{ fontSize: "24px" }}
                >
                  article
                </span>
                <p className="text-white text-sm font-semibold mb-1">Read the essay</p>
                <p className="text-white/60 text-xs leading-relaxed">
                  Full d&#39;var Torah on today&#39;s chapters
                </p>
              </Link>

              {/* Listen */}
              {today.media_url ? (
                <Link
                  href={`/listen/${today.id}`}
                  className="bg-ice-white rounded-xl px-5 py-5 group hover:bg-cloud-gray/60 transition-colors"
                >
                  <span
                    className="material-symbols-outlined text-slate-ink/40 mb-3 block"
                    style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}
                  >
                    play_circle
                  </span>
                  <p className="text-slate-ink text-sm font-semibold mb-1">Listen</p>
                  <p className="text-blue-slate text-xs leading-relaxed">
                    Spoken talk on today&#39;s learning
                  </p>
                </Link>
              ) : (
                <div className="bg-ice-white rounded-xl px-5 py-5 opacity-50">
                  <span
                    className="material-symbols-outlined text-slate-ink/30 mb-3 block"
                    style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}
                  >
                    play_circle
                  </span>
                  <p className="text-slate-ink text-sm font-semibold mb-1">Listen</p>
                  <p className="text-blue-slate text-xs leading-relaxed">Coming soon</p>
                </div>
              )}

              {/* One Page Summary */}
              <Link
                href={`/learn/${today.id}`}
                className="bg-ice-white rounded-xl px-5 py-5 group hover:bg-cloud-gray/60 transition-colors"
              >
                <span
                  className="material-symbols-outlined text-slate-ink/40 mb-3 block"
                  style={{ fontSize: "24px" }}
                >
                  menu_book
                </span>
                <p className="text-slate-ink text-sm font-semibold mb-1">One Page Summary</p>
                <p className="text-blue-slate text-xs leading-relaxed">
                  Structured overview of all three chapters
                </p>
              </Link>
            </div>
          </section>

          {/* ── Source texts on Sefaria ── */}
          {todayChapters.length > 0 && (
            <section className="pb-6 sm:pb-8 px-4 sm:px-6">
              <div className="max-w-[680px] mx-auto">
                <h2 className="text-[10px] sm:text-xs font-semibold tracking-[2px] uppercase text-light-slate mb-3 text-center">
                  Source texts on Sefaria
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {todayChapters.map((ch) => (
                    <a
                      key={`sefaria-${ch.treatiseId}-${ch.chapter}`}
                      href={ch.sefariaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 border border-cloud-gray text-blue-slate text-xs font-medium px-3.5 py-2 rounded-lg hover:border-slate-ink hover:text-slate-ink transition-colors"
                    >
                      {ch.treatiseName} {ch.chapter}
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "13px" }}
                      >
                        open_in_new
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="pt-12 pb-8 px-4">
          <div className="max-w-[680px] mx-auto text-center">
            <h1 className="font-serif text-[26px] sm:text-[40px] font-semibold text-slate-ink leading-[1.1] mb-4">
              The Rambam Experience
            </h1>
            <p className="text-blue-slate text-base">
              Daily Torah insights on the Rambam&#39;s Mishneh Torah.
            </p>
          </div>
        </section>
      )}

      {/* ── Divider ── */}
      <div className="max-w-[680px] mx-auto px-4 sm:px-6">
        <div className="h-px bg-cloud-gray" />
      </div>

      {/* ── Recent ── */}
      {recent.length > 1 && (
        <section className="py-6 sm:py-10 px-4 sm:px-6">
          <div className="max-w-[680px] mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-semibold text-slate-ink">
                Recent
              </h2>
              <Link
                href="/archive"
                className="text-xs font-medium text-blue-slate hover:text-slate-ink transition-colors"
              >
                View all
              </Link>
            </div>
            <div>
              {recent.slice(1).map((item) => (
                <article
                  key={item.id}
                  className="py-3.5 border-b border-cloud-gray group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/read/${item.id}`} className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-oxide-red tracking-wide uppercase mb-1">
                        {item.rambam_chapters}
                      </p>
                      <h3 className="font-serif text-[15px] sm:text-lg font-medium text-slate-ink mb-1 group-hover:text-oxide-red transition-colors">
                        {item.title}
                      </h3>
                      {item.hook && (
                        <p className="text-xs text-blue-slate leading-relaxed line-clamp-2 hidden sm:block">
                          {item.hook}
                        </p>
                      )}
                    </Link>
                    <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                      {item.media_url && (
                        <Link
                          href={`/listen/${item.id}`}
                          className="w-8 h-8 rounded-full border border-cloud-gray flex items-center justify-center text-light-slate hover:text-slate-ink hover:border-slate-ink transition-colors"
                          title="Listen"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}
                          >
                            play_arrow
                          </span>
                        </Link>
                      )}
                      <span className="text-[10px] text-light-slate whitespace-nowrap">
                        {formatShortDate(item.rambam_date || item.published_at)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-cloud-gray py-6 px-4">
        <div className="max-w-[980px] mx-auto text-center">
          <p className="text-xs text-light-slate">The Rambam Experience</p>
        </div>
      </footer>
    </div>
  );
}
