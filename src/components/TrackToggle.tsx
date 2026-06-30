"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { TRACKS, TRACK_LABEL, type Track } from "@/lib/track";

/**
 * Lets the reader switch between the two Rambam study cycles. The choice is
 * stored in the `rambam_track` cookie (read server-side by getActiveTrack), so
 * flipping it re-renders every page for the chosen track.
 */
export default function TrackToggle({ active }: { active: Track }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(track: Track) {
    if (track === active || pending) return;
    document.cookie = `rambam_track=${track}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div
      className="inline-flex items-center rounded-full border border-soft-border bg-surface-container-low p-0.5"
      role="group"
      aria-label="Study cycle"
      style={{ fontFamily: "var(--font-sans)", opacity: pending ? 0.6 : 1 }}
    >
      {TRACKS.map((track) => {
        const on = track === active;
        return (
          <button
            key={track}
            type="button"
            onClick={() => choose(track)}
            aria-pressed={on}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.06em] uppercase transition-colors ${
              on ? "bg-white text-primary shadow-sm" : "text-muted-gray hover:text-primary"
            }`}
            style={on ? { boxShadow: "0 1px 2px rgba(22,40,57,0.08)" } : undefined}
          >
            {TRACK_LABEL[track]}
          </button>
        );
      })}
    </div>
  );
}
