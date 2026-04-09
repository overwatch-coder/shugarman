import test from "node:test"
import assert from "node:assert/strict"

import { buildDashboardAnalytics } from "./dashboard-analytics"

test("buildDashboardAnalytics aggregates order, revenue, status, category, and traffic series", () => {
  const analytics = buildDashboardAnalytics({
    nowIso: "2026-04-09T12:00:00.000Z",
    windowDays: 7,
    orders: [
      {
        id: "ord-1",
        status: "pending",
        total: 1200,
        createdAt: "2026-04-09T09:15:00.000Z",
      },
      {
        id: "ord-2",
        status: "delivered",
        total: 2500,
        createdAt: "2026-04-08T14:45:00.000Z",
      },
      {
        id: "ord-3",
        status: "processing",
        total: 1800,
        createdAt: "2026-04-08T18:30:00.000Z",
      },
      {
        id: "ord-4",
        status: "cancelled",
        total: 900,
        createdAt: "2026-04-03T10:00:00.000Z",
      },
      {
        id: "ord-5",
        status: "confirmed",
        total: 3000,
        createdAt: "2026-04-02T11:00:00.000Z",
      },
    ],
    products: [
      { slug: "iphone-15", category: "smartphones" },
      { slug: "ipad-air", category: "tablets" },
      { slug: "macbook-air", category: "laptops" },
      { slug: "apple-watch", category: "wearables" },
      { slug: "iphone-14", category: "smartphones" },
    ],
    trafficSeries: [
      { date: "2026-04-08", sessions: 320, pageViews: 910 },
      { date: "2026-04-09", sessions: 410, pageViews: 1180 },
    ],
    pageTrafficSeries: [
      { date: "2026-04-08", path: "/", pageViews: 320 },
      { date: "2026-04-09", path: "/", pageViews: 420 },
      { date: "2026-04-09", path: "/shop", pageViews: 180 },
      { date: "2026-04-09", path: "/products/iphone-15", pageViews: 145 },
    ],
  })

  assert.equal(analytics.orderSeries.length, 7)
  assert.deepEqual(analytics.orderSeries.at(-1), {
    date: "2026-04-09",
    label: "Apr 9",
    orders: 1,
    revenue: 1200,
  })
  assert.deepEqual(analytics.orderSeries.at(-2), {
    date: "2026-04-08",
    label: "Apr 8",
    orders: 2,
    revenue: 4300,
  })

  assert.equal(analytics.statusBreakdown[0]?.status, "pending")
  assert.equal(analytics.statusBreakdown[0]?.count, 1)
  assert.equal(
    analytics.statusBreakdown.find((entry) => entry.status === "delivered")?.count,
    1
  )

  assert.deepEqual(analytics.categoryBreakdown[0], {
    category: "smartphones",
    label: "Smartphones",
    count: 2,
  })

  assert.equal(analytics.orderTrend.currentPeriodOrders, 4)
  assert.equal(analytics.orderTrend.previousPeriodOrders, 1)
  assert.equal(analytics.orderTrend.deltaPercent, 300)

  assert.equal(analytics.revenueTrend.currentPeriodRevenue, 4300)
  assert.equal(analytics.revenueTrend.previousPeriodRevenue, 3000)
  assert.equal(analytics.revenueTrend.deltaPercent, 43.3)

  assert.equal(analytics.traffic.connected, true)
  assert.equal(analytics.traffic.series.length, 2)
  assert.equal(analytics.traffic.totalSessions, 730)
  assert.equal(analytics.traffic.totalPageViews, 2090)
  assert.deepEqual(analytics.traffic.topPages, [
    { path: "/", label: "Home", pageViews: 740 },
    { path: "/shop", label: "Shop", pageViews: 180 },
    { path: "/products/iphone-15", label: "Product", pageViews: 145 },
  ])
})

test("buildDashboardAnalytics reports disconnected traffic when no traffic series exists", () => {
  const analytics = buildDashboardAnalytics({
    nowIso: "2026-04-09T12:00:00.000Z",
    orders: [],
    products: [],
    trafficSeries: [],
    pageTrafficSeries: [],
  })

  assert.equal(analytics.traffic.connected, false)
  assert.equal(analytics.traffic.totalSessions, 0)
  assert.deepEqual(analytics.traffic.topPages, [])
  assert.equal(analytics.orderTrend.deltaPercent, 0)
  assert.equal(analytics.revenueTrend.deltaPercent, 0)
})