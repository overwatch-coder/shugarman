"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import {
  Bell,
  Box,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Sun,
  Tag,
  X,
} from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { useAppTheme } from "@/components/theme-provider"
import { destroySession } from "@/lib/admin-auth"
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notifications"
import type { NotificationDoc } from "@/lib/schemas"

interface AdminProps {
  uid: string
  email: string
  displayName: string
  role: string
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/brands", label: "Brands", icon: Box },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Store Settings", icon: Settings },
]

const LEVEL_STYLES: Record<NotificationDoc["level"], string> = {
  info: "border-blue-500/20 bg-blue-500/10 text-blue-500",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-500",
  error: "border-red-500/20 bg-red-500/10 text-red-500",
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

export function AdminShell({
  admin,
  initialNotifications,
  children,
}: {
  admin: AdminProps
  initialNotifications: NotificationDoc[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isPending, startTransition] = useTransition()
  const notificationMenuRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme } = useAppTheme()

  const unreadCount = notifications.filter((notification) => !notification.read).length

  useEffect(() => {
    if (!notificationsOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (!notificationMenuRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [notificationsOpen])

  async function handleLogout() {
    await destroySession()
    router.push("/admin/login")
    router.refresh()
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  function handleMarkRead(id: string) {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
    startTransition(async () => {
      await markNotificationRead(id)
    })
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
    startTransition(async () => {
      await markAllNotificationsRead()
    })
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-card/95">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Store className="size-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">Sugar Man</p>
            <p className="text-[10px] uppercase tracking-wider text-content-secondary">Admin</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-content-secondary hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        {!collapsed && (
          <div className="mb-3 rounded-xl border border-border bg-surface px-3 py-2.5">
            <p className="truncate text-sm font-medium text-foreground">
              {admin.displayName || admin.email}
            </p>
            <p className="truncate text-[10px] uppercase tracking-wider text-content-secondary">
              {admin.role}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-content-secondary transition-colors hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut className="size-[18px] shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside
        className={cn(
          "relative hidden border-r border-border bg-card/95 transition-[width] duration-200 lg:block",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {sidebar}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-4 -right-3 z-10 hidden size-7 items-center justify-center rounded-full border border-border bg-card text-content-secondary shadow-sm transition-colors hover:text-foreground lg:flex"
        >
          {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 h-full w-[260px] border-r border-border bg-card">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-content-secondary transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background/85 px-4 backdrop-blur lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-content-secondary transition-colors hover:bg-accent hover:text-foreground lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <div className="flex-1" />

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-xl p-2 text-content-secondary transition-colors hover:bg-accent hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <div ref={notificationMenuRef} className="relative">
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative rounded-xl p-2 text-content-secondary transition-colors hover:bg-accent hover:text-foreground"
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full z-30 mt-3 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">Notifications</p>
                    <p className="text-xs text-content-secondary">
                      {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-content-secondary transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                    >
                      <CheckCheck className="size-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto p-2">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-10 text-center">
                      <Bell className="size-6 text-content-muted" />
                      <p className="text-sm text-content-secondary">No notifications yet.</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => {
                          if (!notification.read) handleMarkRead(notification.id)
                        }}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                          notification.read
                            ? "border-transparent hover:bg-accent"
                            : "border-border bg-card hover:bg-accent"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-1 inline-flex size-2 rounded-full",
                            notification.read ? "bg-content-muted/50" : "bg-primary"
                          )}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p
                              className={cn(
                                "text-sm font-medium",
                                notification.read ? "text-content-secondary" : "text-foreground"
                              )}
                            >
                              {notification.title}
                            </p>
                            <span
                              className={cn(
                                "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                LEVEL_STYLES[notification.level]
                              )}
                            >
                              {notification.level}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-content-secondary">
                            {notification.message}
                          </p>
                          <div className="mt-2 flex items-center gap-3 text-[11px] text-content-muted">
                            <span>{relativeTime(notification.createdAt)}</span>
                            {notification.resourceType && notification.resourceSlug && (
                              <span>
                                {notification.resourceType}: {notification.resourceSlug}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="border-t border-border px-3 py-3">
                  <Link
                    href="/admin/notifications"
                    onClick={() => setNotificationsOpen(false)}
                    className="block rounded-xl px-3 py-2 text-center text-sm font-medium text-content-secondary transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Open notifications center
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/"
            target="_blank"
            className="text-xs font-medium text-content-secondary transition-colors hover:text-foreground"
          >
            View Store →
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}