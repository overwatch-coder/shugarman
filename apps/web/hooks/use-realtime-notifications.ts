"use client"

import { useEffect, useState } from "react"
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore"

import { getFirebaseDb } from "@/lib/firebase"
import type { NotificationDoc } from "@/lib/schemas"

export function useRealtimeNotifications(
  initialNotifications: NotificationDoc[],
  queryLimit: number
) {
  const [notifications, setNotifications] = useState(initialNotifications)

  useEffect(() => {
    setNotifications(initialNotifications)
  }, [initialNotifications])

  useEffect(() => {
    try {
      const db = getFirebaseDb()
      const notificationsQuery = query(
        collection(db, "notifications"),
        orderBy("createdAt", "desc"),
        limit(queryLimit)
      )

      return onSnapshot(
        notificationsQuery,
        (snapshot) => {
          setNotifications(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as NotificationDoc[]
          )
        },
        (error) => {
          console.error("useRealtimeNotifications:", error)
        }
      )
    } catch (error) {
      console.error("useRealtimeNotifications:", error)
      return undefined
    }
  }, [queryLimit])

  return {
    notifications,
    setNotifications,
    unreadCount: notifications.filter((notification) => !notification.read).length,
  }
}