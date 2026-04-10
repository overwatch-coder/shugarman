import type { Metadata } from "next"

import { BRAND_NAME } from "@/lib/brand"
import { LegalPage } from "@/components/storefront/legal-page"

export const metadata: Metadata = {
  title: `Terms and Conditions | ${BRAND_NAME}`,
  description: `Read the storefront terms and conditions for purchases, repairs, and support.`,
}

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      eyebrow="Terms"
      title="Terms and Conditions"
      intro="These terms govern purchases, repairs, device reservations, and general use of the SHUGARMAN iSTORE storefront and admin-supported services."
    >
      <section>
        <h2 className="text-lg font-bold text-foreground">Orders and payments</h2>
        <p className="mt-2 text-sm leading-7 text-content-secondary">
          Orders are confirmed only after payment validation or direct approval by the store. Product availability and prices can change without notice until confirmation.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-foreground">Repairs and diagnostics</h2>
        <p className="mt-2 text-sm leading-7 text-content-secondary">
          Repair timelines depend on device condition, parts availability, and diagnostic results. We will communicate any major cost or turnaround changes before proceeding.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-foreground">Returns and disputes</h2>
        <p className="mt-2 text-sm leading-7 text-content-secondary">
          Report any issue with an order or repair as soon as possible so the store can review the case and provide the appropriate resolution under the applicable warranty or service terms.
        </p>
      </section>
    </LegalPage>
  )
}