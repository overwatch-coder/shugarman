"use server"

import { adminDb } from "@/lib/firebase-admin"
import type { NotificationDoc, NotificationEvent, NotificationLevel } from "@/lib/schemas"

const COLLECTION = "notifications"

export async function getNotifications(
  limit = 50
): Promise<NotificationDoc[]> {
  try {
    const snap = await adminDb
      .collection(COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get()
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as NotificationDoc))
  } catch {
    return []
  }
}

export async function getUnreadNotifications(): Promise<NotificationDoc[]> {
  try {
    const snap = await adminDb
      .collection(COLLECTION)
      .where("read", "==", false)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get()
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as NotificationDoc))
  } catch {
    return []
  }
}

export async function createNotification(data: {
  event: NotificationEvent
  level: NotificationLevel
  title: string
  message: string
  resourceSlug?: string
  resourceType?: NotificationDoc["resourceType"]
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const doc: Omit<NotificationDoc, "id"> = {
      ...data,
      read: false,
      createdAt: new Date().toISOString(),
    }
    const ref = await adminDb.collection(COLLECTION).add(doc)
    return { success: true, id: ref.id }
  } catch (err) {
    console.error("createNotification:", err)
    return { success: false, error: "Failed to create notification" }
  }
}

export async function markNotificationRead(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.collection(COLLECTION).doc(id).update({ read: true })
    return { success: true }
  } catch (err) {
    console.error("markNotificationRead:", err)
    return { success: false, error: "Failed to update notification" }
  }
}

export async function markAllNotificationsRead(): Promise<{ success: boolean; error?: string }> {
  try {
    const snap = await adminDb
      .collection(COLLECTION)
      .where("read", "==", false)
      .get()
    const batch = adminDb.batch()
    snap.docs.forEach((doc) => batch.update(doc.ref, { read: true }))
    await batch.commit()
    return { success: true }
  } catch (err) {
    console.error("markAllNotificationsRead:", err)
    return { success: false, error: "Failed to mark notifications as read" }
  }
}

export async function deleteNotification(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.collection(COLLECTION).doc(id).delete()
    return { success: true }
  } catch (err) {
    console.error("deleteNotification:", err)
    return { success: false, error: "Failed to delete notification" }
  }
}
