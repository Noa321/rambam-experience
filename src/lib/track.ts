/**
 * Study-track support.
 *
 * The Rambam has two daily study cycles:
 *   - "three-chapter": 3 perakim a day, finishes the Mishneh Torah in ~1 year (the
 *     track the app has always served).
 *   - "one-chapter": 1 perek a day, finishes in ~3 years.
 *
 * Every `content` and `game_cases` row carries a `track` column (default
 * 'three-chapter'). Reads filter by track so the two cycles never mix.
 *
 * This module is client-safe (pure constants/types only). The server-only
 * cookie reader lives in `track-server.ts` so it never reaches the browser
 * bundle.
 */

export type Track = "three-chapter" | "one-chapter";

export const DEFAULT_TRACK: Track = "three-chapter";

export const TRACKS: Track[] = ["three-chapter", "one-chapter"];

/** Full label, e.g. for a settings row. */
export const TRACK_LABEL: Record<Track, string> = {
  "three-chapter": "3 chapters a day",
  "one-chapter": "1 chapter a day",
};

/** Compact label, e.g. for a toggle chip. */
export const TRACK_SHORT: Record<Track, string> = {
  "three-chapter": "3 a day",
  "one-chapter": "1 a day",
};

/** Coerce any stored/cookie value to a valid Track, defaulting safely. */
export function normalizeTrack(value: string | undefined | null): Track {
  return value === "one-chapter" ? "one-chapter" : "three-chapter";
}

/** Cookie name that stores the reader's chosen track. */
export const TRACK_COOKIE = "rambam_track";
