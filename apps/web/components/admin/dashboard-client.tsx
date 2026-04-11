"use client"

import type { ElementType } from "react"
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
} from "lucide-react"

import type { DashboardAnalytics } from "@/lib/admin/dashboard-analytics"

interface StatsProps {
  stats: {
    totalProducts: number
    totalOrders: number
    pendingOrders: number
    revenue: number
    recentOrders: Array<Record<string, unknown>>
    analytics: DashboardAnalytics
  }
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500",
  confirmed: "bg-blue-500/10 text-blue-500",
  processing: "bg-purple-500/10 text-purple-500",
  shipped: "bg-cyan-500/10 text-cyan-500",
  delivered: "bg-emerald-500/10 text-emerald-500",
  cancelled: "bg-red-500/10 text-red-500",
}

const ORDER_STATUS_BAR_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#a855f7",
  shipped: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
}

function formatCurrency(value: number) {
  return `GHC ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function TrendPill({ deltaPercent }: { deltaPercent: number }) {
  const positive = deltaPercent >= 0
  const Icon = positive ? ArrowUpRight : ArrowDownRight

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
        positive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
      }`}
    >
      <Icon className="size-3" />
      {Math.abs(deltaPercent).toFixed(1)}%
    </span>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  helper,
  deltaPercent,
}: {
  label: string
  value: string
  icon: ElementType
  accent: string
  helper: string
  deltaPercent?: number
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-content-secondary">{label}</p>
          <p className="mt-3 text-2xl font-black tracking-tight text-foreground">{value}</p>
        </div>
        <div className={`flex size-11 items-center justify-center rounded-2xl ${accent}`}>
          <Icon className="size-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-content-secondary">{helper}</p>
        {typeof deltaPercent === "number" ? <TrendPill deltaPercent={deltaPercent} /> : null}
      </div>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-content-secondary">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function buildChartPoints(values: number[], width = 560, height = 220, padding = 18) {
  const maxValue = Math.max(...values, 1)
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  return values.map((value, index) => {
    const ratio = values.length === 1 ? 0.5 : index / (values.length - 1)
    const x = padding + innerWidth * ratio
    const y = height - padding - (value / maxValue) * innerHeight

    return { x, y }
  })
}

function LineTrendChart({ data }: { data: DashboardAnalytics["orderSeries"] }) {
  const points = buildChartPoints(data.map((point) => point.orders))
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ")

  return (
    <div>
      <svg viewBox="0 0 560 220" className="h-56 w-full">
        {[0, 1, 2, 3].map((index) => (
          <line
            key={index}
            x1="18"
            x2="542"
            y1={18 + index * 61}
            y2={18 + index * 61}
            stroke="var(--border)"
            strokeDasharray="4 6"
          />
        ))}
        <polyline
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polyline}
        />
        {points.map((point) => (
          <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="4.5" fill="var(--primary)" />
        ))}
      </svg>

      <div className="mt-3 grid grid-cols-7 gap-2 text-[11px] text-content-secondary">
        {data.map((point) => (
          <div key={point.date} className="text-center">
            <p className="font-medium text-foreground">{point.orders}</p>
            <p>{point.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AreaRevenueChart({ data }: { data: DashboardAnalytics["orderSeries"] }) {
  const points = buildChartPoints(data.map((point) => point.revenue))
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ")
  const areaPath = `${linePath} L ${points.at(-1)?.x ?? 542},202 L ${points[0]?.x ?? 18},202 Z`

  return (
    <div>
      <svg viewBox="0 0 560 220" className="h-56 w-full">
        <defs>
          <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map((index) => (
          <line
            key={index}
            x1="18"
            x2="542"
            y1={18 + index * 61}
            y2={18 + index * 61}
            stroke="var(--border)"
            strokeDasharray="4 6"
          />
        ))}

        <path d={areaPath} fill="url(#revenueGradient)" />
        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      </svg>

      <div className="mt-3 grid grid-cols-7 gap-2 text-[11px] text-content-secondary">
        {data.map((point) => (
          <div key={point.date} className="text-center">
            <p className="font-medium text-foreground">{point.revenue > 0 ? `GHC ${Math.round(point.revenue)}` : "-"}</p>
            <p>{point.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBreakdownChart({ data }: { data: DashboardAnalytics["statusBreakdown"] }) {
  const maxValue = Math.max(...data.map((entry) => entry.count), 1)

  return (
    <div className="space-y-3">
      {data.map((entry) => (
        <div key={entry.status} className="rounded-2xl border border-border bg-surface p-3">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{entry.status}</p>
              <p className="mt-0.5 text-xs text-content-secondary">
                {entry.count === 1 ? "1 order in this stage" : `${entry.count} orders in this stage`}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${ORDER_STATUS_COLORS[entry.status] ?? "bg-card text-foreground"}`}
            >
              {entry.count}
            </span>
          </div>

          <div className="h-2.5 rounded-full bg-card">
            <div
              className="h-2.5 rounded-full"
              style={{
                width: `${Math.max((entry.count / maxValue) * 100, entry.count > 0 ? 10 : 0)}%`,
                backgroundColor: ORDER_STATUS_BAR_COLORS[entry.status] ?? "var(--primary)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function HorizontalBarChart({ data }: { data: DashboardAnalytics["categoryBreakdown"] }) {
  const maxValue = Math.max(...data.map((entry) => entry.count), 1)

  return (
    <div className="space-y-4">
      {data.map((entry, index) => (
        <div key={entry.category}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-foreground">{entry.label}</span>
            <span className="font-mono text-content-secondary">{entry.count}</span>
          </div>
          <div className="h-3 rounded-full bg-surface">
            <div
              className="h-3 rounded-full"
              style={{
                width: `${(entry.count / maxValue) * 100}%`,
                backgroundColor: `var(--chart-${(index % 5) + 1})`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function TrafficPanel({ traffic }: { traffic: DashboardAnalytics["traffic"] }) {
  if (!traffic.connected) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 text-center">
        <Activity className="size-8 text-content-muted" />
        <p className="mt-4 text-sm font-medium text-foreground">Website traffic tracking is not connected yet.</p>
        <p className="mt-2 max-w-sm text-sm text-content-secondary">
          This dashboard fills from the storefront traffic feed in Firestore. Visit the public site after deployment and make sure the server-side Firebase Admin connection can write analytics documents.
        </p>
      </div>
    )
  }

  const maxSessions = Math.max(...traffic.series.map((point) => point.sessions), 1)
  const sessionPoints = buildChartPoints(traffic.series.map((point) => point.sessions), 560, 220, 22)
  const pageViewPoints = buildChartPoints(traffic.series.map((point) => point.pageViews), 560, 220, 22)
  const sessionPath = sessionPoints
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ")
  const pageViewPath = pageViewPoints
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ")

  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      <div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-content-secondary">Sessions</p>
            <p className="mt-2 text-xl font-black text-foreground">{traffic.totalSessions.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-content-secondary">Page Views</p>
            <p className="mt-2 text-xl font-black text-foreground">{traffic.totalPageViews.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-surface p-4">
          <svg viewBox="0 0 560 220" className="h-56 w-full">
            {[0, 1, 2, 3].map((index) => (
              <line
                key={index}
                x1="22"
                x2="538"
                y1={22 + index * 58}
                y2={22 + index * 58}
                stroke="var(--border)"
                strokeDasharray="4 6"
              />
            ))}
            <path d={pageViewPath} fill="none" stroke="var(--chart-2)" strokeWidth="2.5" strokeDasharray="5 7" />
            <path d={sessionPath} fill="none" stroke="var(--chart-1)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            {sessionPoints.map((point) => (
              <circle key={`session-${point.x}-${point.y}`} cx={point.x} cy={point.y} r="4.5" fill="var(--chart-1)" />
            ))}
            {pageViewPoints.map((point) => (
              <circle key={`page-${point.x}-${point.y}`} cx={point.x} cy={point.y} r="3.5" fill="var(--chart-2)" />
            ))}
          </svg>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-content-secondary">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--chart-1)]" />
              Sessions
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--chart-2)]" />
              Page views
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-content-secondary sm:grid-cols-7">
            {traffic.series.map((point, index) => (
              <div key={point.date} className="text-center">
                <p className="font-medium text-foreground">{point.sessions}</p>
                <p>{traffic.series[index]?.date.slice(5)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-surface p-4">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-content-secondary">Top Pages</p>
          <p className="mt-1 text-sm text-content-secondary">Most visited storefront destinations.</p>
        </div>

        {traffic.topPages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-content-secondary">
            Page-level data will appear here after visitors start browsing the storefront.
          </div>
        ) : (
          <div className="space-y-3">
            {traffic.topPages.map((page) => (
              <div key={page.path} className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{page.label}</p>
                    <p className="mt-0.5 truncate text-xs text-content-secondary">{page.path}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {page.pageViews}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function DashboardClient({ stats }: StatsProps) {
  const { analytics } = stats

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-content-secondary">
          Overview of your store performance, website activity, and recent orders.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Products"
          value={stats.totalProducts.toString()}
          icon={Package}
          accent="bg-blue-500/10 text-blue-500"
          helper={`${analytics.categoryBreakdown.length} catalog groups tracked`}
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          accent="bg-emerald-500/10 text-emerald-500"
          helper="Compared against the previous 7 days"
          deltaPercent={analytics.orderTrend.deltaPercent}
        />
        <StatCard
          label="Pending Orders"
          value={stats.pendingOrders.toString()}
          icon={Clock}
          accent="bg-amber-500/10 text-amber-500"
          helper="Needs review or confirmation"
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(stats.revenue)}
          icon={DollarSign}
          accent="bg-primary/10 text-primary"
          helper="Confirmed through delivered orders"
          deltaPercent={analytics.revenueTrend.deltaPercent}
        />
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartCard title="Order Trend" subtitle="Line graph of orders received across the last 7 days.">
          <LineTrendChart data={analytics.orderSeries} />
        </ChartCard>

        <ChartCard title="Revenue Flow" subtitle="Area graph of revenue generated by day across the same period.">
          <AreaRevenueChart data={analytics.orderSeries} />
        </ChartCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <ChartCard title="Order Status" subtitle="Bar graph showing what is currently happening across fulfillment stages.">
          <StatusBreakdownChart data={analytics.statusBreakdown} />
        </ChartCard>

        <ChartCard title="Catalog Mix" subtitle="Category balance across the current product inventory.">
          <HorizontalBarChart data={analytics.categoryBreakdown} />
        </ChartCard>
      </div>

      <div className="mt-5">
        <ChartCard title="Website Traffic" subtitle="Traffic analytics panel for daily sessions and page views.">
          <TrafficPanel traffic={analytics.traffic} />
        </ChartCard>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Recent Orders</h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {stats.recentOrders.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-content-secondary">
              No orders yet. Orders placed from the storefront will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-bold uppercase tracking-wider text-content-secondary">
                  <th className="px-5 py-3 whitespace-nowrap">Order ID</th>
                  <th className="px-5 py-3 whitespace-nowrap">Customer</th>
                  <th className="px-5 py-3 whitespace-nowrap">Status</th>
                  <th className="px-5 py-3 text-right whitespace-nowrap">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order: Record<string, unknown>) => {
                  const customer = order.customer as Record<string, string> | undefined

                  return (
                    <tr key={order.id as string} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 font-mono text-xs text-content-secondary">
                        {(order.id as string).slice(0, 8)}…
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        {customer?.firstName} {customer?.lastName}
                      </td>
                      <td className="px-5 py-3">
                        <OrderStatusBadge status={order.status as string} />
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-foreground">
                        {formatCurrency((order.total as number) ?? 0)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500",
    confirmed: "bg-blue-500/10 text-blue-500",
    processing: "bg-indigo-500/10 text-indigo-500",
    shipped: "bg-cyan-500/10 text-cyan-500",
    delivered: "bg-emerald-500/10 text-emerald-500",
    cancelled: "bg-red-500/10 text-red-500",
  }

  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${colors[status] ?? "bg-surface text-content-secondary"}`}
    >
      {status}
    </span>
  )
}