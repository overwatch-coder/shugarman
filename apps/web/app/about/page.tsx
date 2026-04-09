import type { Metadata } from "next"

import { aboutPageContent } from "@/lib/storefront-data"
import { StoreShell } from "@/components/storefront/store-shell"
import { AboutPageClient } from "@/components/storefront/about-page-client"

export const metadata: Metadata = {
  title: "About Us | Sugar Man iStore",
  description:
    "Learn the story behind Sugar Man iStore — Kumasi's trusted phone retailer offering new phones, certified refurbished devices, expert repairs, and flexible installment plans.",
}

export default function AboutPage() {
  return (
    <StoreShell>
      <AboutPageClient content={aboutPageContent} />
    </StoreShell>
  )
}
