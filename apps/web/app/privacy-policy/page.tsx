import type { Metadata } from "next"

import { BRAND_NAME } from "@/lib/brand"
import { LegalPage } from "@/components/storefront/legal-page"

export const metadata: Metadata = {
  title: `Privacy Policy | ${BRAND_NAME}`,
  description: `Learn how ${BRAND_NAME} collects, stores, and protects customer information.`,
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacy Policy"
      intro="We only collect the information needed to serve orders, support repairs, and communicate clearly with customers. We do not sell customer data."
    >
      <section>
        <h2 className="text-lg font-bold text-foreground">What we collect</h2>
        <p className="mt-2 text-sm leading-7 text-content-secondary">
          We may collect your name, phone number, email address, delivery details, device information, and order or repair history when you contact us or place an order.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-foreground">How we use it</h2>
        <p className="mt-2 text-sm leading-7 text-content-secondary">
          We use this information to process orders, provide support, manage repairs, send updates, and improve the store experience.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-foreground">Data protection</h2>
        <p className="mt-2 text-sm leading-7 text-content-secondary">
          Access to customer data is restricted to authorized admin staff. Sensitive operations are handled through secured Firebase services and protected admin credentials.
        </p>
      </section>
    </LegalPage>
  )
}