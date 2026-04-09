"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronDown, Package } from "lucide-react"
import type { OrderDoc, OrderStatus } from "@/lib/schemas"
import { updateOrderStatus } from "@/lib/actions/orders"

function getCustomerName(order: OrderDoc) {
  return [order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ")
}

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-500/10 text-amber-500",
  confirmed: "bg-blue-500/10 text-blue-500",
  processing: "bg-purple-500/10 text-purple-500",
  shipped: "bg-cyan-500/10 text-cyan-500",
  delivered: "bg-emerald-500/10 text-emerald-500",
  cancelled: "bg-red-500/10 text-red-500",
}

export function OrdersClient({
  initialOrders,
}: {
  initialOrders: OrderDoc[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = initialOrders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter
    const matchesSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      getCustomerName(o).toLowerCase().includes(search.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus)
      router.refresh()
    })
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-content-secondary">
          {initialOrders.length} total orders
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, name, or email…"
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-content-muted focus:border-primary/50"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
            className="appearance-none rounded-lg border border-border bg-surface px-4 py-2.5 pr-10 text-sm text-foreground outline-none focus:border-primary/50"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-content-secondary" />
        </div>
      </div>

      {/* Orders List */}
      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-content-secondary">
            {search || statusFilter !== "all"
              ? "No orders match your filters."
              : "No orders yet."}
          </div>
        ) : (
          filtered.map((order) => {
            const isExpanded = expandedOrder === order.id
            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                {/* Order header row */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-accent/60"
                >
                  <Package className="size-5 shrink-0 text-content-secondary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-foreground">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-content-secondary">
                      {getCustomerName(order)} · {order.customer.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-foreground">
                      GHC {order.total.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-content-secondary">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronDown
                    className={`size-4 shrink-0 text-content-secondary transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border px-5 py-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Shipping */}
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">
                          Shipping
                        </h4>
                        <p className="mt-1 text-sm text-foreground">
                          {order.customer.address}
                        </p>
                        <p className="text-sm text-foreground">
                          {order.customer.city}, {order.customer.region}
                        </p>
                        {order.customer.phone && (
                          <p className="text-sm text-content-secondary">{order.customer.phone}</p>
                        )}
                      </div>
                      {/* Payment */}
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">
                          Payment
                        </h4>
                        <p className="mt-1 text-sm capitalize text-foreground">
                          {order.payment.type.replace("_", " ")}
                        </p>
                        {order.payment.momoNumber && (
                          <p className="text-sm text-content-secondary">{order.payment.momoNumber}</p>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mt-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">
                        Items
                      </h4>
                      <div className="mt-2 space-y-2">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg bg-surface px-4 py-2.5"
                          >
                            <div>
                              <p className="text-sm font-medium text-foreground">{item.name}</p>
                              <p className="text-xs text-content-secondary">
                                Qty: {item.quantity}
                                {item.variant ? ` · ${item.variant}` : ""}
                              </p>
                            </div>
                            <p className="text-sm font-mono text-foreground">
                              GHC {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Update status */}
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">
                        Update Status
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(order.id, s)}
                            disabled={isPending || order.status === s}
                            className={`rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-40 ${
                              order.status === s
                                ? STATUS_COLORS[s] + " ring-1 ring-current"
                                : "bg-surface text-content-secondary hover:bg-accent hover:text-foreground"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
