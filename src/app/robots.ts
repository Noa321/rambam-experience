import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Internal API routes don't need to be crawled.
      disallow: ["/api/"],
    },
    sitemap: "https://rambamexperience.com/sitemap.xml",
    host: "https://rambamexperience.com",
  };
}
