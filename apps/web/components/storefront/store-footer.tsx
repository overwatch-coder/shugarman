import Link from "next/link"
import { Camera, Globe, MessageCircle } from "lucide-react"

import { footerColumns, storeMetadata } from "@/lib/storefront-data"

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
            <Link
              href={storeMetadata.social[1]?.url ?? "#"}
              className="inline-flex size-10 items-center justify-center rounded-full bg-white/8 text-white/70 transition-colors hover:text-primary"
            >
              <MessageCircle className="size-4" />
            </Link>
            <Link
              href={storeMetadata.social[0]?.url ?? "#"}
              className="inline-flex size-10 items-center justify-center rounded-full bg-white/8 text-white/70 transition-colors hover:text-primary"
            >
              <Camera className="size-4" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex size-10 items-center justify-center rounded-full bg-white/8 text-white/70 transition-colors hover:text-primary"
            >
              <Globe className="size-4" />
            </Link>
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
            {storeMetadata.hours.slice(0, 6).map((row) => (
              <p key={row.day}>
                {row.day}: {row.open} - {row.close}
              </p>
            ))}
            <p>Sun: Closed</p>
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
