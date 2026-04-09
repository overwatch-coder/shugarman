import { adminDb } from "@/lib/firebase-admin"
import { DashboardClient } from "@/components/admin/dashboard-client"
import type { OrderDoc, ProductDoc } from "@/lib/schemas"
import { buildDashboardAnalytics, type TrafficPoint } from "@/lib/admin/dashboard-analytics"

const REVENUE_STATUSES = new Set(["confirmed", "processing", "shipped", "delivered"])

async function getStats() {
  try {
    const [productsSnap, ordersSnap, recentSnap] = await Promise.all([
      adminDb.collection("products").select("category").get(),
      adminDb.collection("orders").get(),
      adminDb
        .collection("orders")
        .orderBy("createdAt", "desc")
        .limit(5)
        .get(),
    ])

    let trafficSeries: TrafficPoint[] = []

    try {
      const trafficSnap = await adminDb
        .collection("analyticsDaily")
        .orderBy("date", "desc")
        .limit(14)
        .get()

      trafficSeries = trafficSnap.docs
        .map((doc) => {
          const data = doc.data() as Record<string, unknown>

          if (
            typeof data.date !== "string" ||
            typeof data.sessions !== "number" ||
            typeof data.pageViews !== "number"
          ) {
            return null
          }

          return {
            date: data.date,
            sessions: data.sessions,
            pageViews: data.pageViews,
          }
        })
        .filter((entry): entry is TrafficPoint => entry !== null)
        .reverse()
    } catch {
      trafficSeries = []
    }

    const products = productsSnap.docs.map(
      (doc) => ({ slug: doc.id, ...doc.data() }) as ProductDoc
    )
    const orders = ordersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as OrderDoc)

    const recentOrders = recentSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    const analytics = buildDashboardAnalytics({
      nowIso: new Date().toISOString(),
      orders,
      products,
      trafficSeries,
    })

    const revenue = orders.reduce((sum, order) => {
      return REVENUE_STATUSES.has(order.status) ? sum + (order.total ?? 0) : sum
    }, 0)

    const pendingOrders = orders.filter((order) => order.status === "pending").length

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      pendingOrders,
      revenue,
      recentOrders,
      analytics,
    }
  } catch {
    // Firestore not yet set up — return zeros
    return {
      totalProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      revenue: 0,
      recentOrders: [],
      analytics: buildDashboardAnalytics({
        nowIso: new Date().toISOString(),
        orders: [],
        products: [],
        trafficSeries: [],
      }),
    }
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()
  return <DashboardClient stats={stats} />
}
