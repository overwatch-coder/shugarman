"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { logEvent } from "firebase/analytics"

import { getFirebaseAnalytics } from "@/lib/firebase"

/**
 * Mounts Firebase Analytics and fires a `page_view` event on every
 * client-side route change. Place inside a <Suspense> boundary in layout.tsx
 * because useSearchParams() requires one.
 */
export function FirebaseAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    getFirebaseAnalytics().then((analytics) => {
      if (!analytics) return
      logEvent(analytics, "page_view", {
        page_path: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""),
        page_title: document.title,
      })
    })
  }, [pathname, searchParams])

  return null
}
