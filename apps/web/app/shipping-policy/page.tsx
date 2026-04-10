import type { Metadata } from "next"

import { BRAND_NAME } from "@/lib/brand"
import { LegalPage } from "@/components/storefront/legal-page"

export const metadata: Metadata = {
  title: `Shipping Policy | ${BRAND_NAME}`,
  description: `Review delivery coverage, timing, and fulfillment expectations for ${BRAND_NAME}.`,
}

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      eyebrow="Shipping"
      title="Shipping Policy"
      intro="We aim to keep delivery timelines clear and realistic, with same-day or next-day fulfillment where inventory and location allow."
    >
      <section>
        <h2 className="text-lg font-bold text-foreground">Coverage</h2>
        <p className="mt-2 text-sm leading-7 text-content-secondary">
          Delivery is prioritized for Kumasi metro and surrounding areas. Longer-distance fulfillment may require additional confirmation and lead time.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-foreground">Timing</h2>
        <p className="mt-2 text-sm leading-7 text-content-secondary">
          Orders placed during store hours are processed first. Delivery estimates can shift due to traffic, weather, or third-party courier availability.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-foreground">Receiving orders</h2>
        <p className="mt-2 text-sm leading-7 text-content-secondary">
          Customers should inspect packages upon receipt and report missing or damaged items promptly so the store can investigate and assist.
        </p>
      </section>
    </LegalPage>
  )
}