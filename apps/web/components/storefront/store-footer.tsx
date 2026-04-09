import Link from "next/link"
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6"
import type { IconType } from "react-icons"

import { footerColumns, storeMetadata } from "@/lib/storefront-data"

const socialIconMap: Record<string, IconType> = {
  Facebook: FaFacebookF,
  Instagram: FaInstagram,
  TikTok: FaTiktok,
  WhatsApp: FaWhatsapp,
}

/**
 * Groups consecutive days that share the same open/close times into
 * condensed ranges like "Mon - Sat: 8:00 AM - 5:00 PM".
 */
function groupHours(hours: typeof storeMetadata.hours) {
  const groups: { start: string; end: string; open: string; close: string; status: string }[] = []

  for (const entry of hours) {
    const last = groups[groups.length - 1]
    if (last && last.open === entry.open && last.close === entry.close && last.status === entry.status) {
      last.end = entry.day
    } else {
      groups.push({ start: entry.day, end: entry.day, open: entry.open, close: entry.close, status: entry.status })
    }
  }

  return groups.map((g) => {
    const label = g.start === g.end ? g.start : `${g.start} - ${g.end}`
    const time = g.status === "closed" ? "Closed" : `${g.open} - ${g.close}`
    return `${label}: ${time}`
  })
}

export function StoreFooter() {
  return (
    <footer className="mt-24 bg-black/90 pt-16 text-white">
      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="mb-4 text-2xl font-black uppercase tracking-tight">
            {storeMetadata.name}
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/60">
            {storeMetadata.description}
          </p>
          <div className="mt-6 flex gap-4">
            {storeMetadata.social.map((social) => {
              const Icon = socialIconMap[social.platform]
              if (!Icon) return null
              return (
                <Link
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                  className="inline-flex size-10 items-center justify-center rounded-full bg-white/8 text-white/70 transition-colors hover:text-primary"
                >
                  <Icon className="size-4" />
                </Link>
              )
            })}
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h4 className="font-label mb-6 text-xs font-black uppercase tracking-[0.2em] text-white">
              {column.title}
            </h4>
            <ul className="space-y-4">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="font-label mb-6 text-xs font-black uppercase tracking-[0.2em] text-white">
            Support
          </h4>
          <div className="space-y-2 font-mono text-xs text-white/65">
            {groupHours(storeMetadata.hours).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="mt-6 space-y-2 text-sm text-white/55">
            <p>{storeMetadata.phone}</p>
            <p>{storeMetadata.email}</p>
            <p>
              {storeMetadata.city}, {storeMetadata.region}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 flex w-full max-w-[1440px] flex-col justify-between gap-4 border-t border-white/5 px-8 py-8 text-[10px] font-mono uppercase tracking-[0.2em] text-white/35 md:flex-row">
        <p>© 2026 Sugar Man iStore. Cinematic Precision Engineering.</p>
        <p>Verified Secure</p>
      </div>
    </footer>
  )
}
