import Link from "next/link"
import { ArrowLeft, Search, Smartphone } from "lucide-react"

import { StoreShell } from "@/components/storefront/store-shell"

export default function NotFound() {
  return (
    <StoreShell>
      <section className="flex min-h-[calc(100vh-12rem)] items-center py-16">
        <div className="grid w-full gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="space-y-6">
            <p className="font-label text-sm font-bold uppercase tracking-[0.35em] text-primary">
              Route Not Found
            </p>
            <h1 className="font-display text-7xl uppercase leading-[0.9] tracking-tight text-foreground md:text-8xl lg:text-[7rem]">
              Lost In The
              <br />
              <span className="text-primary">Inventory.</span>
            </h1>
            <p className="max-w-2xl text-base leading-8 text-content-secondary md:text-lg">
              The page you requested does not exist, or this product is not currently
              available in the Sugar Man iStore catalog.
            </p>
            <div className="flex flex-wrap gap-4">
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
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-surface p-8 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,25,44,0.18),transparent_55%)]" />
            <div className="relative space-y-8">
              <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                  <p className="font-label text-xs font-bold uppercase tracking-[0.3em] text-primary">
                    Error Code
                  </p>
                  <p className="mt-3 font-mono text-5xl font-bold text-foreground">404</p>
                </div>
                <div className="flex size-16 items-center justify-center rounded-full bg-surface-high text-primary">
                  <Smartphone className="size-7" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-surface-low p-5">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-surface-high text-primary">
                    <Search className="size-4" />
                  </div>
                  <h2 className="font-display text-3xl uppercase tracking-tight text-foreground">
                    Search Again
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-content-secondary">
                    Return to the catalog and continue browsing phones, accessories,
                    and current deals.
                  </p>
                </div>

                <div className="rounded-xl bg-surface-low p-5">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-surface-high text-primary">
                    <ArrowLeft className="size-4" />
                  </div>
                  <h2 className="font-display text-3xl uppercase tracking-tight text-foreground">
                    Reset Route
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-content-secondary">
                    If you followed an outdated product link, head back home and restart
                    from the latest storefront navigation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </StoreShell>
  )
}