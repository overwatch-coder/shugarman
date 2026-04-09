import { Inter, Bebas_Neue, DM_Mono, Space_Grotesk } from "next/font/google"
import type { Metadata } from "next"

import "@workspace/ui/globals.css"
import "./storefront.css"
import { CartProvider } from "@/components/storefront/cart-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
})

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
})

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-pricing",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-label",
})

export const metadata: Metadata = {
  title: "Sugar Man iStore | Cinematic Precision Engineering",
  description:
    "New, refurbished & unlocked phones in Kumasi — with flexible payment plans. Experience the future of mobile retail.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        inter.variable,
        bebasNeue.variable,
        dmMono.variable,
        spaceGrotesk.variable
      )}
    >
      <body className="sf-bg-gradient font-body text-foreground">
        <ThemeProvider>
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
