import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SHUGARMAN iSTORE",
    short_name: "Shugarman",
    description:
      "New, refurbished & unlocked phones in Kumasi — with flexible payment plans.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0f0f10",
    theme_color: "#ef4444",
    categories: ["shopping", "lifestyle"],
    lang: "en",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: "Shop Phones",
        short_name: "Shop",
        description: "Browse all phones",
        url: "/shop",
        icons: [{ src: "/icons/icon-192.svg", sizes: "192x192" }],
      },
      {
        name: "My Cart",
        short_name: "Cart",
        description: "View your shopping cart",
        url: "/cart",
        icons: [{ src: "/icons/icon-192.svg", sizes: "192x192" }],
      },
    ],
  }
}
