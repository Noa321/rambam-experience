import { cookies } from "next/headers";
import { DEFAULT_TRACK, normalizeTrack, TRACK_COOKIE, type Track } from "./track";

/**
 * The reader's chosen study track, read server-side from the `rambam_track`
 * cookie set by the TrackToggle. Defaults to three-chapter when absent.
 *
 * Server-only: keeps `next/headers` out of any client bundle (TrackToggle and
 * other client components import the pure helpers from "./track" instead).
 */
export async function getActiveTrack(): Promise<Track> {
  try {
    const store = await cookies();
    return normalizeTrack(store.get(TRACK_COOKIE)?.value);
  } catch {
    return DEFAULT_TRACK;
  }
}
