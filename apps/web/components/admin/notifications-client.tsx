"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { NotificationDoc } from "@/lib/schemas"
import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/lib/actions/notifications"
import { ConfirmDialog } from "./confirm-dialog"

const LEVEL_STYLES: Record<NotificationDoc["level"], string> = {
  info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  error: "bg-red-500/10 text-red-500 border-red-500/20",
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function NotificationsClient({
  initialNotifications,
}: {
  initialNotifications: NotificationDoc[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [notifications, setNotifications] = useState(initialNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    startTransition(async () => {
      const result = await markNotificationRead(id)
      if (!result.success) {
        toast.error(result.error ?? "Failed to update notification.")
      }
    })
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    startTransition(async () => {
      const result = await markAllNotificationsRead()
      if (result.success) {
        toast.success("Notifications marked as read.")
      } else {
        toast.error(result.error ?? "Failed to update notifications.")
      }
    })
  }

  function handleDeleteConfirm() {
    if (!deletingId) return
    startTransition(async () => {
      const result = await deleteNotification(deletingId)
      if (result.success) {
        toast.success("Notification deleted.")
        setNotifications((prev) => prev.filter((n) => n.id !== deletingId))
        setDeletingId(null)
      } else {
        toast.error(result.error ?? "Failed to delete notification.")
      }
    })
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-content-secondary">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            <CheckCheck className="size-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-16 text-center">
            <Bell className="size-8 text-content-muted" />
            <p className="text-sm text-content-secondary">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                n.read
                    ? "border-border bg-card"
                    : "border-border bg-surface"
              }`}
            >
              {/* Unread indicator */}
              <div className="mt-1 shrink-0">
                {!n.read && (
                  <span className="inline-block size-2 rounded-full bg-primary" />
                )}
                {n.read && (
                  <span className="inline-block size-2 rounded-full bg-content-muted" />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${n.read ? "text-content-secondary" : "text-foreground"}`}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-content-secondary">{n.message}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${LEVEL_STYLES[n.level]}`}
                    >
                      {n.level}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-[11px] text-content-muted">{relativeTime(n.createdAt)}</span>
                  {n.resourceType && n.resourceSlug && (
                    <span className="text-[11px] text-content-muted">
                      {n.resourceType}: {n.resourceSlug}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    aria-label="Mark as read"
                    className="rounded-lg p-2 text-content-secondary transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Check className="size-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setDeletingId(n.id)}
                  aria-label="Delete"
                  className="rounded-lg p-2 text-content-secondary transition-colors hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => { if (!open) setDeletingId(null) }}
        title="Delete notification?"
        description="This notification will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
