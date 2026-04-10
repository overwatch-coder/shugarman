import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { BRAND_NAME } from "@/lib/brand"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-16">
      <section className="w-full bg-surface p-8 md:p-12">
        <p className="font-label text-sm font-bold uppercase tracking-[0.35em] text-primary">
          Route Not Found
        </p>
        <h1 className="mt-6 font-display text-7xl uppercase leading-[0.9] tracking-tight text-foreground md:text-8xl">
          Lost In The
          <br />
          <span className="text-primary">Inventory.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-content-secondary md:text-lg">
          The page you requested does not exist, or this product is not currently available in the {BRAND_NAME} catalog.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-white sf-red-glow-box"
          >
            Browse Shop
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
          >
            <ArrowLeft className="size-4" />
            Back Home
          </Link>
        </div>
      </section>
    </main>
  )
}