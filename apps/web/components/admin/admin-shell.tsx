"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  BarChart3,
  Bell,
  Box,
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
import { destroySession } from "@/lib/admin-auth"
import { useAppTheme } from "@/components/theme-provider"

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

export function AdminShell({
  admin,
  children,
}: {
  admin: AdminProps
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useAppTheme()

  async function handleLogout() {
    await destroySession()
    router.push("/admin/login")
    router.refresh()
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/6 px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
          <Store className="size-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">Sugar Man</p>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500">Admin</p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="size-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="shrink-0 border-t border-white/6 p-3">
        {!collapsed && (
          <div className="mb-3 rounded-lg bg-white/3 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-white">
              {admin.displayName || admin.email}
            </p>
            <p className="truncate text-[10px] uppercase tracking-wider text-neutral-500">
              {admin.role}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="size-[18px] shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#0D0D0D] text-white">
      {/* Desktop sidebar */}
      <aside
        className={`hidden border-r border-white/6 bg-[#111] transition-[width] duration-200 lg:block ${
          collapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        {sidebar}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-4 -right-3 z-10 hidden size-6 items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] text-neutral-400 hover:text-white lg:flex"
          style={{ position: "absolute" }}
        >
          {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 h-full w-[260px] bg-[#111]">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 text-neutral-400 hover:text-white"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-white/6 bg-[#0D0D0D] px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-neutral-400 hover:text-white lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <div className="flex-1" />

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <Link
            href="/admin/notifications"
            aria-label="Notifications"
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Bell className="size-4" />
          </Link>

          <Link
            href="/"
            target="_blank"
            className="text-xs font-medium text-neutral-500 transition-colors hover:text-white"
          >
            View Store →
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
