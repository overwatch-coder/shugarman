"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

const SESSION_KEY = "shugarman-traffic-session-id"
const SESSION_DAY_KEY = "shugarman-traffic-session-day"

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function TrafficTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return

    const query = searchParams.toString()
    const routeKey = `${pathname}${query ? `?${query}` : ""}`

    if (lastTrackedRef.current === routeKey) return
    lastTrackedRef.current = routeKey

    const today = getTodayKey()
    const storedDay = window.sessionStorage.getItem(SESSION_DAY_KEY)
    let sessionId = window.sessionStorage.getItem(SESSION_KEY)

    if (!sessionId || storedDay !== today) {
      sessionId = crypto.randomUUID()
      window.sessionStorage.setItem(SESSION_KEY, sessionId)
      window.sessionStorage.setItem(SESSION_DAY_KEY, today)
    }

    const payload = JSON.stringify({
      pathname,
      isNewSession: storedDay !== today,
    })

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/track", new Blob([payload], { type: "application/json" }))
      return
    }

    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    })
  }, [pathname, searchParams])

  return null
}