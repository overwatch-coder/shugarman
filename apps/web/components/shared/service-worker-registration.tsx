"use client"

import { useEffect } from "react"

/**
 * Registers the serwist-generated service worker on the client.
 * Placed in layout.tsx inside a <Suspense> boundary.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("[SW] Registered, scope:", registration.scope)
      })
      .catch((err) => {
        console.error("[SW] Registration failed:", err)
      })
  }, [])

  return null
}
