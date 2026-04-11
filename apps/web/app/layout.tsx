import { Inter, Bebas_Neue, DM_Mono, Space_Grotesk } from "next/font/google"
import type { Metadata, Viewport } from "next"
import { Suspense } from "react"

import "@workspace/ui/globals.css"
import "./storefront.css"
import { AppToaster } from "@/components/shared/app-toaster"
import { FirebaseAnalytics } from "@/components/shared/firebase-analytics"
import { ServiceWorkerRegistration } from "@/components/shared/service-worker-registration"
import { CartProvider } from "@/components/storefront/cart-provider"
import { TrafficTracker } from "@/components/storefront/traffic-tracker"
import { ThemeProvider } from "@/components/theme-provider"
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand"
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f0f10" },
    { media: "(prefers-color-scheme: light)", color: "#ef4444" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} | ${BRAND_TAGLINE}`,
    template: `%s | ${BRAND_NAME}`,
  },
  description:
    "New, refurbished & unlocked phones in Kumasi — with flexible payment plans. Experience the future of mobile retail.",
  applicationName: BRAND_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shugarman",
    startupImage: [
      { url: "/icons/apple-touch-icon.svg", media: "(device-width: 375px)" },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" }],
  },
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
          <AppToaster />
          <Suspense>
            <FirebaseAnalytics />
            <ServiceWorkerRegistration />
          </Suspense>
          <CartProvider>
            <TrafficTracker />
            {children}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
