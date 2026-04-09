import type { Metadata } from "next"

import { repairsPageContent } from "@/lib/storefront-data"
import { StoreShell } from "@/components/storefront/store-shell"
import { RepairsPageClient } from "@/components/storefront/repairs-page-client"

export const metadata: Metadata = {
  title: "Device Repairs | Sugar Man iStore",
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
