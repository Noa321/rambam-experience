/**
 * Fetch published content from Supabase and convert to InsightArticle format
 * for display in the Rambam Experience reader app.
 */

import { getSupabase } from "./supabase";
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
  rambam_date?: string;
  rambam_chapters?: string;
  sefer?: string;
  hilchot?: string;
  tags?: string[];
  source?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
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
  };
}

/**
 * Fetch published insights for a specific treatise from Supabase.
 * Matches on the `hilchot` field (e.g. "Foundations of the Torah").
 */
export async function fetchInsightsForTreatise(
  treatiseName: string
): Promise<InsightArticle[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("status", "published")
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
export async function fetchLatestInsight(): Promise<InsightArticle | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("status", "published")
      .eq("content_type", "dvar_torah")
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
 * Fetch the latest published content (any type) for dashboard summary.
 */
export async function fetchLatestContent(): Promise<ContentRow | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("status", "published")
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
