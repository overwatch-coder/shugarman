import { adminDb } from "@/lib/firebase-admin"
import { DashboardClient } from "@/components/admin/dashboard-client"

async function getStats() {
  try {
    const [productsSnap, ordersSnap] = await Promise.all([
      adminDb.collection("products").count().get(),
      adminDb.collection("orders").count().get(),
    ])

    // Recent orders
    const recentSnap = await adminDb
      .collection("orders")
      .orderBy("createdAt", "desc")
      .limit(5)
      .get()

    const recentOrders = recentSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Revenue: sum of all delivered/confirmed orders
    const revenueSnap = await adminDb
      .collection("orders")
      .where("status", "in", ["confirmed", "processing", "shipped", "delivered"])
      .get()

    const revenue = revenueSnap.docs.reduce((sum, doc) => {
      const data = doc.data()
      return sum + (data.total ?? 0)
    }, 0)

    // Pending orders count
    const pendingSnap = await adminDb
      .collection("orders")
      .where("status", "==", "pending")
      .count()
      .get()

    return {
      totalProducts: productsSnap.data().count,
      totalOrders: ordersSnap.data().count,
      pendingOrders: pendingSnap.data().count,
      revenue,
      recentOrders,
    }
  } catch {
    // Firestore not yet set up — return zeros
    return {
      totalProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      revenue: 0,
      recentOrders: [],
    }
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()
  return <DashboardClient stats={stats} />
}
