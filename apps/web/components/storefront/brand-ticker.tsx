import { featuredBrands } from "@/lib/storefront-data"

export function BrandTicker() {
  const brands = [...featuredBrands, ...featuredBrands]

  return (
    <section className="overflow-hidden border-y border-white/5 bg-surface py-8">
      <div className="sf-marquee-track min-w-max items-center gap-10 whitespace-nowrap">
        {brands.map((brand, index) => (
          <div key={`${brand.slug}-${index}`} className="flex items-center gap-10">
            <span className="font-display text-4xl uppercase tracking-tight text-content-secondary md:text-5xl">
              {brand.name}
            </span>
            <span className="text-3xl text-primary">•</span>
          </div>
        ))}
      </div>
    </section>
  )
}
