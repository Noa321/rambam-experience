import { getSupabase } from "@/lib/supabase";
import { books } from "@/data/books";
import { cyclePositionFromContent, resolveTreatiseId } from "@/lib/cycle";
import { type Track } from "@/lib/track";
import { getActiveTrack } from "@/lib/track-server";
import Link from "next/link";
import Header from "@/components/Header";
import TrackToggle from "@/components/TrackToggle";

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

async function getTodaysContent(track: Track): Promise<ContentRecord | null> {
  const supabase = getSupabase();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const nowISO = new Date().toISOString();

  const { data: todayData } = await supabase
    .from("content")
    .select("id,title,hook,summary,rambam_chapters,sefer,hilchot,media_url,rambam_date,published_at,body")
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .eq("track", track)
    .eq("rambam_date", today)
    .limit(1)
    .single();

  if (todayData) return todayData as ContentRecord;

  const { data: byDate } = await supabase
    .from("content")
    .select("id,title,hook,summary,rambam_chapters,sefer,hilchot,media_url,rambam_date,published_at,body")
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .eq("track", track)
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
    .eq("track", track)
    .lte("published_at", nowISO)
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  if (byPublished) return byPublished as ContentRecord;
  return null;
}

async function getRecentContent(track: Track): Promise<ContentRecord[]> {
  const supabase = getSupabase();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });

  // Buffer days are published ahead with future rambam_dates — never surface a
  // day before its date arrives. Undated legacy essays stay included.
  const { data, error } = await supabase
    .from("content")
    .select("id,title,hook,summary,rambam_chapters,sefer,hilchot,media_url,rambam_date,published_at,body")
    .eq("content_type", "dvar_torah")
    .eq("status", "published")
    .eq("track", track)
    .or(`rambam_date.is.null,rambam_date.lte.${today}`)
    .order("rambam_date", { ascending: false, nullsFirst: false })
    .limit(7);

  if (error || !data) return [];
  return data as ContentRecord[];
}

function formatDateUpper(dateStr: string) {
  // dateStr is a plain YYYY-MM-DD; format in UTC so the calendar day doesn't
  // shift backward in negative-offset server timezones.
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).toUpperCase();
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).toUpperCase();
}

/* ── Treatise mappings ──
   Name-to-id resolution lives in @/lib/cycle (resolveTreatiseId), which covers
   every treatise and transliteration. Here we only keep the Sefaria URL names
   for the reader links; anything missing falls back to underscored text. */

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
  "yom-kippur": "Rest_on_the_Tenth_of_Tishrei",
  "yom-tov": "Rest_on_a_Holiday",
  "temple": "The_Chosen_Temple",
  "vessels": "Vessels_of_the_Sanctuary_and_Those_Who_Serve_Therein",
  "admission": "Admission_into_the_Sanctuary",
  "forbidden-altar": "Things_Forbidden_on_the_Altar",
  "sacrificial": "Sacrificial_Procedure",
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
    const treatiseId = resolveTreatiseId(treatiseName);
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
  const track = await getActiveTrack();
  const today = await getTodaysContent(track);
  const recent = await getRecentContent(track);
  const todayChapters = today ? parseChaptersFromContent(today.rambam_chapters, today.hilchot, today.sefer) : [];
  const cyclePos = today ? cyclePositionFromContent(today.rambam_chapters, today.hilchot) : null;

  // The real current day, independent of what content we found. If the newest
  // published day is older than today (content is behind), we still show the
  // true date and flag it — the app must never display a stale day as if current.
  const actualToday = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const isStale = !!(today?.rambam_date && today.rambam_date < actualToday);

  return (
    <div className="min-h-screen pb-28">
      <Header />

      <main className="max-w-[920px] mx-auto px-5 mt-6">
        {/* Study-cycle toggle — always visible so an empty track can be switched back */}
        <div className="mb-5">
          <TrackToggle active={track} />
        </div>

        {today ? (
          <>
            {/* Date Header — always the real current day, never the content's stale date */}
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-2" style={{ fontFamily: "var(--font-sans)" }}>
              {formatDateUpper(actualToday)}
            </p>
            {isStale && (
              <p className="text-[12px] text-muted-gray -mt-1 mb-4">
                Today&#39;s learning is being prepared - showing the most recent day below.
              </p>
            )}

            {/* Journey strip */}
            {cyclePos && (
              <Link
                href="/journey"
                className="block mb-5 rounded-xl border border-soft-border bg-white p-3.5 hover:bg-surface-container-low transition-colors"
                style={{ borderLeft: "3px solid #B8860B" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-medium text-charcoal-text">
                    Your journey · {cyclePos.percent}% through the Mishneh Torah
                  </span>
                  <span className="material-symbols-outlined text-muted-gray" style={{ fontSize: "18px" }}>
                    chevron_right
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-container-low overflow-hidden">
                  <div
                    className="h-full rounded-full bg-parchment-gold"
                    style={{ width: `${cyclePos.percent}%` }}
                  />
                </div>
              </Link>
            )}

            {/* Hero Card */}
            <section className="mb-8">
              <div className="relative overflow-hidden rounded-2xl bg-primary text-white px-5 py-6 sm:px-8 sm:py-10 mb-6">
                <div className="relative z-10 text-center">
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-[0.1em] uppercase mb-3"
                    style={{ backgroundColor: "rgba(184, 134, 11, 0.2)", color: "#ffe088", fontFamily: "var(--font-sans)" }}
                  >
                    {isStale ? "MOST RECENT" : "TODAY’S LEARNING"}
                  </span>
                  <h2 className="font-serif font-bold text-[26px] leading-[32px] sm:text-[36px] sm:leading-[42px] mb-2">
                    {today.title}
                  </h2>
                  <p className="font-serif text-[15px] leading-[22px] sm:text-[20px] sm:leading-[28px] font-semibold opacity-90 mb-4 sm:mb-6">
                    {today.rambam_chapters} | Sefer {today.sefer}
                  </p>
                  {today.hook && (
                    <p className="text-[14px] leading-[22px] sm:text-[16px] sm:leading-[26px] max-w-[500px] mx-auto" style={{ color: "#d1e4fb" }}>
                      {today.hook}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href={`/read/${today.id}`}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-soft-border hover:bg-surface-container-low transition-colors active:scale-[0.99]"
                  style={{ borderLeft: "3px solid #B8860B" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: "#d1e4fb" }}>
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>article</span>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-charcoal-text">{today.title}</h3>
                      <p className="text-[13px] text-muted-gray">Read the Essay</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-muted-gray" style={{ fontSize: "20px" }}>chevron_right</span>
                </Link>

                {today.media_url ? (
                  <Link
                    href={`/listen/${today.id}`}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-soft-border hover:bg-surface-container-low transition-colors active:scale-[0.99]"
                    style={{ borderLeft: "3px solid #B8860B" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: "#ffddb7" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#362308" }}>headset</span>
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-charcoal-text">Listen to a Quick D&#39;var Torah</h3>
                        <p className="text-[13px] text-muted-gray">On today&#39;s chapters</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-muted-gray" style={{ fontSize: "20px" }}>chevron_right</span>
                  </Link>
                ) : (
                  <div className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-soft-border opacity-40" style={{ borderLeft: "3px solid #E5E5E7" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: "#ffddb7" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#362308" }}>headset</span>
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-charcoal-text">Listen</h3>
                        <p className="text-[13px] text-muted-gray">Coming soon</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-muted-gray" style={{ fontSize: "20px" }}>chevron_right</span>
                  </div>
                )}

                <Link
                  href={`/learn/${today.id}`}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-soft-border hover:bg-surface-container-low transition-colors active:scale-[0.99]"
                  style={{ borderLeft: "3px solid #B8860B" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: "#ffe088" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#735c00" }}>summarize</span>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-charcoal-text">One Page Summary</h3>
                      <p className="text-[13px] text-muted-gray">{track === "one-chapter" ? "On today’s chapter" : "On today’s 3 chapters"}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-muted-gray" style={{ fontSize: "20px" }}>chevron_right</span>
                </Link>

                <Link
                  href="/game"
                  className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-soft-border hover:bg-surface-container-low transition-colors active:scale-[0.99]"
                  style={{ borderLeft: "3px solid #B8860B" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: "#e8d5f5" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#6b21a8" }}>gavel</span>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-charcoal-text">The Rambam Case</h3>
                      <p className="text-[13px] text-muted-gray">Can you rule like the Rambam?</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-muted-gray" style={{ fontSize: "20px" }}>chevron_right</span>
                </Link>
              </div>
            </section>

            {/* Today's Chapters */}
            {todayChapters.length > 0 && (
              <section className="mb-8">
                <h3 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-3" style={{ fontFamily: "var(--font-sans)" }}>
                  TODAY&#39;S CHAPTERS
                </h3>
                <div className="bg-surface-container-low rounded-xl border border-soft-border divide-y divide-soft-border overflow-hidden">
                  {todayChapters.map((ch) => (
                    <Link
                      key={`ch-${ch.treatiseId}-${ch.chapter}`}
                      href={`/study/${ch.treatiseId}/${ch.chapter}`}
                      className="flex items-center justify-between p-4 hover:bg-white transition-colors group"
                    >
                      <span className="text-[15px] text-charcoal-text">{ch.treatiseName} Chapter {ch.chapter}</span>
                      <span
                        className="material-symbols-outlined text-muted-gray group-hover:text-parchment-gold transition-colors"
                        style={{ fontSize: "20px" }}
                      >
                        chevron_right
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Section */}
            {recent.length > 1 && (
              <section className="mb-8">
                <h3 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-3" style={{ fontFamily: "var(--font-sans)" }}>
                  RECENT
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recent.slice(1).map((item) => (
                    <Link
                      key={item.id}
                      href={`/read/${item.id}`}
                      className="bg-white p-5 rounded-xl border border-soft-border group hover:border-outline-variant hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted-gray" style={{ fontFamily: "var(--font-sans)" }}>
                          {formatShortDate(item.rambam_date || item.published_at)}
                        </span>
                        {item.media_url && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-outline-variant" />
                            <span className="material-symbols-outlined text-parchment-gold" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                          </>
                        )}
                      </div>
                      <h4 className="font-serif text-[18px] leading-[24px] sm:text-[20px] sm:leading-[28px] font-semibold text-primary mb-1.5 group-hover:text-parchment-gold transition-colors">
                        {item.title}
                      </h4>
                      {item.hook && (
                        <p className="text-[13px] leading-[18px] text-muted-gray line-clamp-2">
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
            <h1 className="font-serif text-[28px] sm:text-[36px] font-bold text-primary mb-4">
              The Rambam Experience
            </h1>
            <p className="text-[16px] text-muted-gray">
              Daily Torah insights on the Rambam&#39;s Mishneh Torah.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
