import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/pulso" : "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pulso",
    short_name: "Pulso",
    description: "Registra tus hábitos de salud y mira tu evolución mensual.",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#020617",
    theme_color: "#14b8a6",
    icons: [
      { src: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${basePath}/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
  };
}
