import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXTAUTH_URL || "https://new-year-oracle.vercel.app";

  // Static pages
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
  ];

  return routes;
}
