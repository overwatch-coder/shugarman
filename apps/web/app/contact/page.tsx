import type { Metadata } from "next"

import { contactPageContent } from "@/lib/storefront-data"
import { BRAND_NAME } from "@/lib/brand"
import { getStorefrontMetadata } from "@/lib/storefront-dal"
import { StoreShell } from "@/components/storefront/store-shell"
import { ContactPageClient } from "@/components/storefront/contact-page-client"

export const metadata: Metadata = {
  title: `Contact Us | ${BRAND_NAME}`,
  description:
    `Get in touch with ${BRAND_NAME} in Kumasi via WhatsApp, phone, or email. Visit us at Asempa Pharmacy Building near Otumfour Statue, Adum.`,
}

export default async function ContactPage() {
  const storeMetadata = await getStorefrontMetadata()

  return (
    <StoreShell>
      <ContactPageClient content={contactPageContent} storeMetadata={storeMetadata} />
    </StoreShell>
  )
}
