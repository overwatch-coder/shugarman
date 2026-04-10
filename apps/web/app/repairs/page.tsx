import type { Metadata } from "next"

import { BRAND_NAME } from "@/lib/brand"
import { repairsPageContent } from "@/lib/storefront-data"
import { StoreShell } from "@/components/storefront/store-shell"
import { RepairsPageClient } from "@/components/storefront/repairs-page-client"

export const metadata: Metadata = {
  title: `Device Repairs | ${BRAND_NAME}`,
  description:
    "Expert smartphone repairs in Kumasi — screen replacement, battery swap, water damage treatment and more. Warranty-backed, fast turnaround.",
}

export default function RepairsPage() {
  return (
    <StoreShell>
      <RepairsPageClient content={repairsPageContent} />
    </StoreShell>
  )
}
