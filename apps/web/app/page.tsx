import Image from "next/image"
import Link from "next/link"
import { BadgeCent, BadgeCheck, MessageCircle, ShieldCheck, Wrench, Zap } from "lucide-react"

import { BrandTicker } from "@/components/storefront/brand-ticker"
import { MotionList, MotionSection } from "@/components/storefront/motion-primitives"
import { ProductCard } from "@/components/storefront/product-card"
import { SectionHeading } from "@/components/storefront/section-heading"
import { StoreShell } from "@/components/storefront/store-shell"
import {
  getStorefrontProducts,
  getHomeCategories,
  getTrustPoints,
  getStorefrontMetadata,
} from "@/lib/storefront-dal"

const iconMap = {
  "badge-check": BadgeCheck,
  "badge-cent": BadgeCent,
  wrench: Wrench,
  zap: Zap,
  "shield-check": ShieldCheck,
} as const

export default async function Page() {
  const [allProducts, homeCategories, trustPoints, storeMetadata] = await Promise.all([
    getStorefrontProducts(),
    getHomeCategories(),
    getTrustPoints(),
    getStorefrontMetadata(),
  ])
  const featuredProducts = allProducts.slice(0, 4)

  return (
    <StoreShell className="px-0 lg:px-0">
      <MotionSection className="grid min-h-[calc(100vh-88px)] items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <h1 className="font-display text-7xl uppercase leading-[0.9] tracking-tight text-foreground md:text-8xl lg:text-[7rem]">
            Shop Smarter.
            <br />
            <span className="text-primary">Live Better.</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-8 text-content-secondary md:text-lg">
            New, refurbished and unlocked phones in Kumasi with flexible payment plans.
            Precision retail for every budget, every lifestyle, and every upgrade cycle.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-white sf-red-glow-box"
            >
              Shop Now
            </Link>
            <Link
              href="/shop/iphone-15"
              className="inline-flex items-center justify-center rounded-md border border-black/10 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute h-[110%] w-[110%] bg-[radial-gradient(circle_at_center,var(--sf-red-glow)_0%,transparent_70%)]" />
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7pROFDzY9XpjUPkznTAy_FhH0rJcNtzDOJ3hSTIo2fAusCZ6vB6nwQhTomvgfOB2xjQof67F0NzGAfdow9pSLobsG0GtdNrWzYIKh5i7fondpmFll6JEJNr765kWXmJsSvHiEPZIIIhtLy1NCWdtRTVchMtstPFZPjpJe6DLZWE9nadMcAYQ1_QmZCK7i-dqh6nX8tHvptZ2AuMcx4T0YIgpQiD_EKDElX9zseTGDueNLNQbk875YeZAHRssw0R58Xih-xIGXToE"
            alt="Featured iPhone hero product render"
            width={520}
            height={520}
            className="relative z-10 h-auto w-full max-w-md -rotate-[8deg] drop-shadow-[0_20px_60px_rgba(232,25,44,0.25)] transition-transform duration-700 hover:-rotate-[2deg]"
          />
        </div>
      </MotionSection>

      <BrandTicker />

      <MotionSection className="px-6 py-24 lg:px-8" delay={0.04}>
        <SectionHeading title="Explore the" accent="Ecosystem" className="mb-12" />
        <MotionList className="grid min-h-[640px] grid-cols-1 gap-6 md:grid-cols-4 md:grid-rows-2">
          {homeCategories.map((category) => {
            const Icon = category.icon ? iconMap[category.icon as keyof typeof iconMap] : null
            const isLarge = category.variant === "large"
            const isAccent = category.variant === "accent"

            return (
              <Link
                key={category.title}
                href={category.href}
                className={[
                  "group relative overflow-hidden rounded-xl p-6 transition-transform duration-300 hover:scale-[1.01]",
                  isAccent ? "bg-primary text-white" : "bg-surface-low text-foreground",
                  isLarge ? "md:col-span-2 md:row-span-2" : "md:col-span-1",
                ].join(" ")}
              >
                {category.image ? (
                  <>
                    <Image
                      src={category.image}
                      alt={category.imageAlt ?? category.title}
                      fill
                      className="object-cover opacity-45 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent dark:from-black/70" />
                  </>
                ) : null}

                {Icon ? (
                  <Icon className="absolute right-5 top-5 z-10 size-6 text-current" />
                ) : null}

                <div className="absolute bottom-0 left-0 z-10 p-6">
                  <h3 className="font-display text-3xl uppercase tracking-tight md:text-4xl">
                    {category.title}
                  </h3>
                  {category.subtitle ? (
                    <p className={isAccent ? "mt-2 text-xs uppercase tracking-[0.2em] text-white/80" : "mt-2 max-w-xs text-sm text-white/80 dark:text-content-secondary"}>
                      {category.subtitle}
                    </p>
                  ) : null}
                </div>
              </Link>
            )
          })}
        </MotionList>
      </MotionSection>

      <MotionSection className="bg-surface px-6 py-24 lg:px-8" delay={0.08}>
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <SectionHeading title="Hot" accent="Deals" />
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-content-secondary">
              Priced for precision // limited stock
            </p>
          </div>
          <Link href="/shop?sort=price-asc" className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
            View All Deals
          </Link>
        </div>
        <MotionList className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </MotionList>
      </MotionSection>

      <MotionSection className="px-6 py-24 lg:px-8" delay={0.12}>
        <MotionList className="grid gap-12 md:grid-cols-3">
          {trustPoints.map((point) => {
            const Icon = iconMap[point.icon as keyof typeof iconMap]

            return (
              <div key={point.title}>
                <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-surface-high text-primary">
                  <Icon className="size-7" />
                </div>
                <h3 className="font-display text-3xl uppercase tracking-tight text-foreground">
                  {point.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-content-secondary">
                  {point.description}
                </p>
              </div>
            )
          })}
        </MotionList>
      </MotionSection>

      <section className="bg-primary px-6 py-4 text-white lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.15em]">
            <span>{storeMetadata.city}</span>
            <span>/</span>
            <span>{storeMetadata.address}</span>
          </div>
          <Link
            href={`https://wa.me/${storeMetadata.whatsapp}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/20 px-6 py-2 text-sm font-bold transition-colors hover:bg-white/30"
          >
            <MessageCircle className="size-4" />
            Chat on WhatsApp
          </Link>
        </div>
      </section>

      <MotionSection className="px-6 py-24 lg:px-8" delay={0.16}>
        <SectionHeading
          title="Stay"
          accent="Synchronized"
          description="Be the first to know about price drops, new arrivals, and exclusive store events."
          align="center"
          className="mx-auto max-w-3xl"
        />
        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-4 sm:flex-row">
          <div className="sf-ghost-border flex flex-1 items-center bg-surface px-4">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full bg-transparent py-4 text-sm text-foreground outline-none placeholder:text-content-secondary"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center bg-foreground px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-background transition-colors hover:bg-primary hover:text-white"
          >
            Subscribe
          </button>
        </div>
      </MotionSection>
    </StoreShell>
  )
}
