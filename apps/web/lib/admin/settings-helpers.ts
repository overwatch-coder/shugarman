import type { SocialLink } from "@/lib/schemas"

const SOCIAL_BASE_URLS: Record<string, string> = {
  facebook: "https://facebook.com/",
  instagram: "https://instagram.com/",
  "twitter / x": "https://x.com/",
  tiktok: "https://tiktok.com/@",
  youtube: "https://youtube.com/@",
  whatsapp: "https://wa.me/",
  linkedin: "https://linkedin.com/in/",
  snapchat: "https://snapchat.com/add/",
  pinterest: "https://pinterest.com/",
  threads: "https://threads.net/@",
}

function normalizePlatform(platform: string) {
  return platform.trim().toLowerCase()
}

function normalizeHandleForUrl(platform: string, handle: string) {
  const trimmed = handle.trim()
  if (!trimmed) return ""

  if (normalizePlatform(platform) === "whatsapp") {
    return trimmed.replace(/\D+/g, "")
  }

  return trimmed.replace(/^@+/, "")
}

export function buildSocialUrl(platform: string, handle: string) {
  const normalizedPlatform = normalizePlatform(platform)
  const baseUrl = SOCIAL_BASE_URLS[normalizedPlatform]
  const normalizedHandle = normalizeHandleForUrl(platform, handle)

  if (!baseUrl || !normalizedHandle) {
    return ""
  }

  return `${baseUrl}${normalizedHandle}`
}

export function normalizeSocialLink(link: SocialLink): SocialLink {
  const url = link.url.trim() || buildSocialUrl(link.platform, link.handle)

  return {
    platform: link.platform.trim(),
    handle: link.handle.trim(),
    url,
  }
}