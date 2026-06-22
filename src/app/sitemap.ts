import { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";

const BASE = "https://rambamexperience.com";

// Regenerate hourly so newly published days appear in the sitemap.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/game`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/journey`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/library`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/archive`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
  ];

  let contentRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("content")
      .select("id,rambam_date,published_at,media_url")
      .eq("content_type", "dvar_torah")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(2000);

    if (data) {
      contentRoutes = data.flatMap((row) => {
        const lm = new Date(row.rambam_date || row.published_at || Date.now());
        const routes: MetadataRoute.Sitemap = [
          { url: `${BASE}/read/${row.id}`, lastModified: lm, changeFrequency: "monthly", priority: 0.6 },
          { url: `${BASE}/learn/${row.id}`, lastModified: lm, changeFrequency: "monthly", priority: 0.5 },
        ];
        if (row.media_url) {
          routes.push({ url: `${BASE}/listen/${row.id}`, lastModified: lm, changeFrequency: "monthly", priority: 0.5 });
        }
        return routes;
      });
    }
  } catch {
    // If the DB is unreachable at build time, still return the static routes.
  }

  return [...staticRoutes, ...contentRoutes];
}
