// Sefaria API client for fetching Mishneh Torah text
// API docs: https://developers.sefaria.org

const BASE_URL = "https://www.sefaria.org/api";

export interface SefariaText {
  ref: string;
  heRef: string;
  text: string[];        // English translations (one per halacha)
  he: string[];           // Hebrew source text (one per halacha)
  next: string | null;    // Next chapter ref
  prev: string | null;    // Previous chapter ref
  sectionNames: string[]; // e.g. ["Chapter", "Halakhah"]
  lengths: number[];      // e.g. [30, 659] = 30 chapters, 659 total halachot
  book: string;           // e.g. "Mishneh Torah, Sabbath"
}

export interface SefariaIndex {
  title: string;
  heTitle: string;
  categories: string[];
  schema: {
    nodes?: Array<{
      title: string;
      heTitle: string;
      depth: number;
      lengths?: number[];
    }>;
    lengths?: number[];
  };
}

/**
 * Fetch a single chapter of Mishneh Torah text.
 *
 * @param treatiseRef - Sefaria reference name, e.g. "Mishneh Torah, Sabbath"
 * @param chapter - Chapter number (1-indexed)
 * @returns Parsed chapter data with Hebrew and English arrays
 *
 * Example: fetchChapter("Mishneh Torah, Sabbath", 4)
 *   → GET /api/texts/Mishneh_Torah,_Sabbath.4
 */
export async function fetchChapter(
  treatiseRef: string,
  chapter: number
): Promise<SefariaText> {
  const encoded = encodeURIComponent(`${treatiseRef}.${chapter}`).replace(/%2C/g, ",");
  const url = `${BASE_URL}/texts/${encoded}`;

  const res = await fetch(url, {
    next: { revalidate: 86400 }, // Cache for 24 hours (text rarely changes)
  });

  if (!res.ok) {
    throw new Error(`Sefaria API error: ${res.status} for ${treatiseRef} ch.${chapter}`);
  }

  const data = await res.json();

  return {
    ref: data.ref,
    heRef: data.heRef,
    text: Array.isArray(data.text) ? data.text : [],
    he: Array.isArray(data.he) ? data.he : [],
    next: data.next,
    prev: data.prev,
    sectionNames: data.sectionNames || ["Chapter", "Halakhah"],
    lengths: data.lengths || [],
    book: data.book || treatiseRef,
  };
}

/**
 * Fetch the table of contents / index for a treatise.
 * Useful for getting chapter count and structure.
 *
 * @param treatiseRef - e.g. "Mishneh Torah, Sabbath"
 */
export async function fetchIndex(treatiseRef: string): Promise<SefariaIndex> {
  const encoded = treatiseRef.replace(/ /g, "_");
  const url = `${BASE_URL}/index/${encoded}`;

  const res = await fetch(url, {
    next: { revalidate: 604800 }, // Cache for 7 days (structure never changes)
  });

  if (!res.ok) {
    throw new Error(`Sefaria index error: ${res.status} for ${treatiseRef}`);
  }

  return res.json();
}

/**
 * Strip HTML tags from Sefaria text.
 * Sefaria sometimes returns text with <b>, <i>, <small> tags.
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Get a clean array of halachot from a chapter response.
 * Each halacha has its number, Hebrew text, and English translation.
 */
export function parseHalachot(data: SefariaText) {
  const count = Math.max(data.he.length, data.text.length);
  const halachot = [];

  for (let i = 0; i < count; i++) {
    halachot.push({
      number: i + 1,
      hebrew: data.he[i] ? stripHtml(data.he[i]) : "",
      english: data.text[i] ? stripHtml(data.text[i]) : "",
    });
  }

  return halachot;
}