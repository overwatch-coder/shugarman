"use server"

import { adminDb } from "@/lib/firebase-admin"
import type { OrderDoc, OrderStatus } from "@/lib/schemas"

const COLLECTION = "orders"

export async function getOrders(status?: OrderStatus): Promise<OrderDoc[]> {
  try {
    let query = adminDb.collection(COLLECTION).orderBy("createdAt", "desc") as FirebaseFirestore.Query
    if (status) {
      query = query.where("status", "==", status)
    }
    const snap = await query.limit(100).get()
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as OrderDoc))
  } catch {
    return []
  }
}

export async function getOrder(id: string): Promise<OrderDoc | null> {
  try {
    const doc = await adminDb.collection(COLLECTION).doc(id).get()
    if (!doc.exists) return null
    return { id: doc.id, ...doc.data() } as OrderDoc
  } catch {
    return null
  }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.collection(COLLECTION).doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
    })
    return { success: true }
  } catch (err) {
    console.error("updateOrderStatus:", err)
    return { success: false, error: "Failed to update order" }
  }
}

/** Called by the storefront checkout to create an order */
export async function createOrder(
  data: Omit<OrderDoc, "id" | "status" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const now = new Date().toISOString()
    const orderRef = adminDb.collection(COLLECTION).doc()
    const notificationRef = adminDb.collection("notifications").doc()
    const customerName = [data.customer.firstName, data.customer.lastName].filter(Boolean).join(" ")
    const batch = adminDb.batch()

    batch.set(orderRef, {
      ...data,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    })
    batch.set(notificationRef, {
      event: "new_order",
      level: "success",
      title: "New order received",
      message: `${customerName || data.customer.email} placed an order for ${data.currency} ${data.total.toLocaleString()}.`,
      read: false,
      resourceSlug: orderRef.id,
      resourceType: "order",
      createdAt: now,
    })

    await batch.commit()
    return { success: true, orderId: orderRef.id }
  } catch (err) {
    console.error("createOrder:", err)
    return { success: false, error: "Failed to create order" }
  }
}
