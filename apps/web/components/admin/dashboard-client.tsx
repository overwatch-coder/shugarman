"use client"

import { DollarSign, Package, ShoppingCart, Clock } from "lucide-react"

interface StatsProps {
  stats: {
    totalProducts: number
    totalOrders: number
    pendingOrders: number
    revenue: number
    recentOrders: Array<Record<string, unknown>>
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  icon: React.ElementType
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-white/6 bg-[#141414] p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          {label}
        </p>
        <div
          className={`flex size-9 items-center justify-center rounded-lg ${accent ?? "bg-white/5"}`}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-white">{value}</p>
    </div>
  )
}

export function DashboardClient({ stats }: StatsProps) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Overview of your store performance and recent activity.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Products"
          value={stats.totalProducts.toString()}
          icon={Package}
          accent="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          accent="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          label="Pending Orders"
          value={stats.pendingOrders.toString()}
          icon={Clock}
          accent="bg-amber-500/10 text-amber-400"
        />
        <StatCard
          label="Revenue"
          value={`GHC ${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          accent="bg-primary/10 text-primary"
        />
      </div>

      {/* Recent orders */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white">Recent Orders</h2>
        <div className="mt-4 rounded-xl border border-white/6 bg-[#141414] overflow-hidden">
          {stats.recentOrders.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-neutral-500">
              No orders yet. Orders placed from the storefront will appear here.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/6 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order: Record<string, unknown>) => {
                  const customer = order.customer as Record<string, string> | undefined
                  return (
                    <tr
                      key={order.id as string}
                      className="border-b border-white/4 last:border-0"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-neutral-400">
                        {(order.id as string).slice(0, 8)}…
                      </td>
                      <td className="px-5 py-3 text-white">
                        {customer?.firstName} {customer?.lastName}
                      </td>
                      <td className="px-5 py-3">
                        <OrderStatusBadge status={order.status as string} />
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-white">
                        GHC {(order.total as number)?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400",
    confirmed: "bg-blue-500/10 text-blue-400",
    processing: "bg-indigo-500/10 text-indigo-400",
    shipped: "bg-cyan-500/10 text-cyan-400",
    delivered: "bg-emerald-500/10 text-emerald-400",
    cancelled: "bg-red-500/10 text-red-400",
  }

  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${colors[status] ?? "bg-white/5 text-neutral-400"}`}
    >
      {status}
    </span>
  )
}
