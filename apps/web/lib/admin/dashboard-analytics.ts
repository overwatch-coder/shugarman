import type { OrderDoc, OrderStatus, ProductDoc } from "@/lib/schemas"

type OrderSummary = Pick<OrderDoc, "id" | "status" | "total" | "createdAt">
type ProductSummary = Pick<ProductDoc, "slug" | "category">

export interface TrafficPoint {
  date: string
  sessions: number
  pageViews: number
}

interface BuildDashboardAnalyticsInput {
  nowIso: string
  windowDays?: number
  orders: OrderSummary[]
  products: ProductSummary[]
  trafficSeries: TrafficPoint[]
}

interface DashboardPoint {
  date: string
  label: string
  orders: number
  revenue: number
}

interface TrendSummary {
  currentPeriodOrders?: number
  previousPeriodOrders?: number
  currentPeriodRevenue?: number
  previousPeriodRevenue?: number
  deltaPercent: number
}

export interface DashboardAnalytics {
  orderSeries: DashboardPoint[]
  statusBreakdown: Array<{ status: OrderStatus; count: number }>
  categoryBreakdown: Array<{ category: string; label: string; count: number }>
  orderTrend: Required<Pick<TrendSummary, "currentPeriodOrders" | "previousPeriodOrders">> & Pick<TrendSummary, "deltaPercent">
  revenueTrend: Required<Pick<TrendSummary, "currentPeriodRevenue" | "previousPeriodRevenue">> & Pick<TrendSummary, "deltaPercent">
  traffic: {
    connected: boolean
    series: TrafficPoint[]
    totalSessions: number
    totalPageViews: number
  }
}

const STATUS_ORDER: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]

const CATEGORY_LABELS: Record<string, string> = {
  smartphones: "Smartphones",
  tablets: "Tablets",
  laptops: "Laptops",
  wearables: "Wearables",
}

const REVENUE_STATUSES = new Set<OrderStatus>([
  "confirmed",
  "processing",
  "shipped",
  "delivered",
])

function roundToTenth(value: number) {
  return Math.round(value * 10) / 10
}

function buildDateRange(nowIso: string, days: number) {
  const end = new Date(nowIso)
  end.setUTCHours(0, 0, 0, 0)

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end)
    date.setUTCDate(end.getUTCDate() - (days - 1 - index))
    return date
  })
}

function toDateKey(value: unknown) {
  if (typeof value === "string" || value instanceof Date || typeof value === "number") {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10)
  }

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    const date = (value as { toDate: () => Date }).toDate()
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10)
  }

  return null
}

function calculateDelta(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100
  }

  return roundToTenth(((current - previous) / previous) * 100)
}

export function buildDashboardAnalytics({
  nowIso,
  windowDays = 7,
  orders,
  products,
  trafficSeries,
}: BuildDashboardAnalyticsInput): DashboardAnalytics {
  const currentRange = buildDateRange(nowIso, windowDays)
  const previousRange = buildDateRange(
    new Date(new Date(nowIso).getTime() - windowDays * 24 * 60 * 60 * 1000).toISOString(),
    windowDays
  )

  const currentDateSet = new Set(currentRange.map((date) => date.toISOString().slice(0, 10)))
  const previousDateSet = new Set(previousRange.map((date) => date.toISOString().slice(0, 10)))

  const orderSeriesMap = new Map<string, DashboardPoint>(
    currentRange.map((date) => {
      const key = date.toISOString().slice(0, 10)
      return [
        key,
        {
          date: key,
          label: date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
          orders: 0,
          revenue: 0,
        },
      ]
    })
  )

  const statusCounts = new Map<OrderStatus, number>()
  const categoryCounts = new Map<string, number>()

  let currentPeriodOrders = 0
  let previousPeriodOrders = 0
  let currentPeriodRevenue = 0
  let previousPeriodRevenue = 0

  for (const order of orders) {
    const dateKey = toDateKey(order.createdAt)
    if (!dateKey) continue

    statusCounts.set(order.status, (statusCounts.get(order.status) ?? 0) + 1)

    if (currentDateSet.has(dateKey)) {
      currentPeriodOrders += 1

      const point = orderSeriesMap.get(dateKey)
      if (point) {
        point.orders += 1
        point.revenue += order.total
      }

      if (REVENUE_STATUSES.has(order.status)) {
        currentPeriodRevenue += order.total
      }
    } else if (previousDateSet.has(dateKey)) {
      previousPeriodOrders += 1
      if (REVENUE_STATUSES.has(order.status)) {
        previousPeriodRevenue += order.total
      }
    }
  }

  for (const product of products) {
    categoryCounts.set(product.category, (categoryCounts.get(product.category) ?? 0) + 1)
  }

  const statusBreakdown = STATUS_ORDER.map((status) => ({
    status,
    count: statusCounts.get(status) ?? 0,
  }))

  const categoryBreakdown = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({
      category,
      label: CATEGORY_LABELS[category] ?? category,
      count,
    }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))

  const normalizedTraffic = [...trafficSeries].sort((left, right) => left.date.localeCompare(right.date))
  const totalSessions = normalizedTraffic.reduce((sum, point) => sum + point.sessions, 0)
  const totalPageViews = normalizedTraffic.reduce((sum, point) => sum + point.pageViews, 0)

  return {
    orderSeries: Array.from(orderSeriesMap.values()),
    statusBreakdown,
    categoryBreakdown,
    orderTrend: {
      currentPeriodOrders,
      previousPeriodOrders,
      deltaPercent: calculateDelta(currentPeriodOrders, previousPeriodOrders),
    },
    revenueTrend: {
      currentPeriodRevenue,
      previousPeriodRevenue,
      deltaPercent: calculateDelta(currentPeriodRevenue, previousPeriodRevenue),
    },
    traffic: {
      connected: normalizedTraffic.length > 0,
      series: normalizedTraffic,
      totalSessions,
      totalPageViews,
    },
  }
}