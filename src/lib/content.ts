/**
 * Fetch published content from Supabase and convert to InsightArticle format
 * for display in the Rambam Experience reader app.
 */

import { getSupabase } from "./supabase";
import { DEFAULT_TRACK, type Track } from "./track";
import type { InsightArticle, InsightSection } from "@/data/insights";

/** Shape of a row in the Supabase `content` table */
export interface ContentRow {
  id: string;
  content_type: string;
  title: string;
  body: string;
  body_format: string;
  summary?: string;
  hook?: string;
  status: string;
  track?: Track;
  rambam_date?: string;
  rambam_chapters?: string;
  sefer?: string;
  hilchot?: string;
  tags?: string[];
  source?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  media_url?: string;
  media_type?: string;
}

/**
 * Convert a Supabase content row into an InsightArticle
 * that the existing ChapterStudy Insights tab can render.
 */
function contentToInsight(content: ContentRow): InsightArticle {
  const sections: InsightSection[] = [];

  if (content.hook) {
    sections.push({
      label: "Hook",
      heading: "Opening Thought",
      content: `<p>${content.hook}</p>`,
    });
  }

  if (content.summary) {
    sections.push({
      label: "Summary",
      heading: "Overview",
      content: `<p>${content.summary}</p>`,
    });
  }

  if (content.body) {
    sections.push({
      label: "The Teaching",
      heading: content.title,
      content: content.body,
    });
  }

  return {
    title: content.title,
    subtitle: content.rambam_chapters
      ? `Daily Rambam: ${content.rambam_chapters}`
      : "Daily Rambam",
    sections,
    mediaUrl: content.media_url || undefined,
    mediaType: content.media_type || undefined,
  };
}

/**
 * Fetch published insights for a specific treatise from Supabase.
 * Matches on the `hilchot` field (e.g. "Foundations of the Torah").
 */
export async function fetchInsightsForTreatise(
  treatiseName: string,
  track: Track = DEFAULT_TRACK
): Promise<InsightArticle[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("status", "published")
      .eq("track", track)
      .ilike("hilchot", `%${treatiseName}%`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching insights:", error);
      return [];
    }

    return (data || []).map(contentToInsight);
  } catch (err) {
    console.error("Supabase not configured:", err);
    return [];
  }
}

/**
 * Fetch the latest published d'var Torah for the dashboard.
 */
export async function fetchLatestInsight(
  track: Track = DEFAULT_TRACK
): Promise<InsightArticle | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("status", "published")
      .eq("content_type", "dvar_torah")
      .eq("track", track)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return contentToInsight(data);
  } catch {
    return null;
  }
}

/**
 * Fetch the latest published content that has audio (media_url).
 */
export async function fetchLatestAudio(
  track: Track = DEFAULT_TRACK
): Promise<ContentRow | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("status", "published")
      .eq("track", track)
      .not("media_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Fetch all published content that has audio.
 */
export async function fetchAllAudio(
  track: Track = DEFAULT_TRACK
): Promise<ContentRow[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("status", "published")
      .eq("track", track)
      .not("media_url", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching audio content:", error);
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

/**
 * Fetch the latest published content (any type) for dashboard summary.
 */
export async function fetchLatestContent(
  track: Track = DEFAULT_TRACK
): Promise<ContentRow | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("status", "published")
      .eq("track", track)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}
