"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Package,
  ShoppingBag,
  Users,
  Search,
  Filter,
} from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { Stagger } from "@/components/Motion";
import { api } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";

type Stats = {
  products: number;
  customers: number;
  orders: number;
  revenue: number;
  lowStockCount: number;
};

type Order = {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  email: string;
};

type Product = {
  id: string;
  name: string;
  stockQuantity: number;
  price: number;
};

const statusTone: Record<string, string> = {
  processing: "bg-amber-100 text-amber-800",
  shipped: "bg-sky-100 text-sky-800",
  delivered: "bg-teal/15 text-teal-dark",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api<{
      stats: Stats;
      recentOrders: Order[];
      lowStock: Product[];
    }>("/admin/stats")
      .then((res) => {
        setStats(res.stats);
        setOrders(res.recentOrders);
        setLowStock(res.lowStock);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setReady(true));
  }, []);

  const chart = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const base = Math.max(orders.length, 1);
    return months.map((label, i) => ({
      label,
      a: 35 + ((base * (i + 3) * 17) % 55),
      b: 25 + ((base * (i + 5) * 13) % 45),
    }));
  }, [orders]);

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.email.toLowerCase().includes(query.toLowerCase()),
  );

  const stockCap = 50;
  const stockUsed = Math.min(
    stockCap,
    lowStock.reduce((s, p) => s + (stockCap - Math.min(p.stockQuantity, stockCap)), 0) ||
      (stats?.lowStockCount ?? 0) * 8,
  );

  return (
    <RequireAuth>
      <div className="space-y-5 lg:space-y-6">
        <div className="anim-fade-up lg:hidden">
          <h1 className="font-display text-3xl text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Sales · stock · customers</p>
        </div>

        {error ? (
          <div className="soft-card anim-pop border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <Stagger className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="soft-card p-6 sm:p-7">
            <p className="text-sm text-muted">Total revenue</p>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <p className="font-display text-4xl tracking-tight sm:text-5xl">
                {stats ? formatPrice(stats.revenue) : "—"}
              </p>
              <span className="anim-pulse mb-1 inline-flex items-center gap-1 rounded-full bg-teal/15 px-2.5 py-1 text-xs font-medium text-teal-dark">
                <ArrowUpRight size={13} /> Live store
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/orders" className="btn-press rounded-full bg-ink px-5 py-2.5 text-sm text-white">
                View orders
              </Link>
              <Link
                href="/products"
                className="btn-press rounded-full bg-white px-5 py-2.5 text-sm text-ink shadow-[0_0_0_1px_rgba(44,36,32,0.08)]"
              >
                Manage catalog
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3 stagger-children">
              {[
                ["Fragrance", "Perfumes & mists"],
                ["Footwear", "Sneakers & loafers"],
                ["Cloudinary", "Product images"],
              ].map(([title, sub]) => (
                <div key={title} className="soft-inset rounded-2xl px-4 py-3">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted">{sub}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="soft-card p-6 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">Sales pulse</p>
                <h2 className="mt-1 font-display text-2xl">Orders & demand</h2>
              </div>
              <span className="rounded-full bg-[#f3eee7] px-3 py-1 text-[11px] text-muted">
                6 mo
              </span>
            </div>
            <div className="mt-8 flex h-44 items-end justify-between gap-2">
              {chart.map((bar, i) => (
                <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-36 w-full items-end justify-center gap-1">
                    <div
                      className={`w-[42%] rounded-t-lg bg-ink ${ready ? "anim-bar" : "opacity-0"}`}
                      style={{
                        height: `${bar.a}%`,
                        animationDelay: `${150 + i * 70}ms`,
                      }}
                    />
                    <div
                      className={`w-[42%] rounded-t-lg bg-teal ${ready ? "anim-bar" : "opacity-0"}`}
                      style={{
                        height: `${bar.b}%`,
                        animationDelay: `${220 + i * 70}ms`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-muted">{bar.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-4 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <i className="h-2.5 w-2.5 rounded-sm bg-ink" /> Orders
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="h-2.5 w-2.5 rounded-sm bg-teal" /> Catalog activity
              </span>
            </div>
          </section>
        </Stagger>

        <Stagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="soft-card bg-teal p-5 text-white shadow-[0_18px_40px_rgba(63,159,136,0.28)]">
            <p className="text-sm text-white/75">Total earnings</p>
            <p className="mt-3 font-display text-3xl">
              {stats ? formatPrice(stats.revenue) : "—"}
            </p>
            <p className="mt-2 text-xs text-white/65">All completed sales</p>
          </div>
          <div className="soft-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Orders</p>
              <ShoppingBag size={16} className="text-muted" />
            </div>
            <p className="mt-3 font-display text-3xl">{stats?.orders ?? "—"}</p>
            <p className="mt-2 text-xs text-muted">Lifetimeetime</p>
          </div>
          <div className="soft-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Products</p>
              <Package size={16} className="text-muted" />
            </div>
            <p className="mt-3 font-display text-3xl">{stats?.products ?? "—"}</p>
            <p className="mt-2 text-xs text-muted">In catalog</p>
          </div>
          <div className="soft-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Customers</p>
              <Users size={16} className="text-muted" />
            </div>
            <p className="mt-3 font-display text-3xl">{stats?.customers ?? "—"}</p>
            <p className="mt-2 text-xs text-muted">Registered buyers</p>
          </div>
        </Stagger>

        <Stagger className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="soft-card p-6">
            <p className="text-sm text-muted">Inventory pressure</p>
            <h2 className="mt-1 font-display text-2xl">Low stock watch</h2>
            <p className="mt-6 text-sm">
              <span className="font-semibold">{stats?.lowStockCount ?? 0}</span> SKUs need
              attention
            </p>
            <div className="mt-3 h-3 overflow-hidden rounded-full soft-inset">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-teal to-ink transition-all duration-1000 ease-out ${ready ? "" : "w-0"}`}
                style={{
                  width: ready
                    ? `${Math.min(100, (stockUsed / stockCap) * 100 || 8)}%`
                    : "0%",
                }}
              />
            </div>
            <ul className="mt-5 space-y-3 stagger-children">
              {lowStock.length === 0 ? (
                <li className="text-sm text-muted">All stock levels look healthy.</li>
              ) : (
                lowStock.slice(0, 4).map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span className="truncate pr-3">{p.name}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        p.stockQuantity === 0
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {p.stockQuantity} left
                    </span>
                  </li>
                ))
              )}
            </ul>
            <Link
              href="/inventory"
              className="mt-5 inline-flex text-sm font-medium text-teal-dark hover:underline"
            >
              Open inventory →
            </Link>
          </section>

          <section className="soft-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 px-5 py-4">
              <h2 className="font-display text-2xl">Recent orders</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full soft-inset px-3 py-2">
                  <Search size={14} className="text-muted" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                    className="w-28 bg-transparent text-sm outline-none sm:w-40"
                  />
                </div>
                <button
                  type="button"
                  className="btn-press flex h-9 w-9 items-center justify-center rounded-full soft-inset text-muted"
                  aria-label="Filter"
                >
                  <Filter size={14} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[11px] tracking-[0.14em] uppercase text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-muted">
                        No orders yet — place one from the storefront.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.slice(0, 7).map((o, i) => (
                      <tr
                        key={o._id}
                        className="row-enter border-t border-line/60"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <td className="px-5 py-3.5 font-medium">{o.orderNumber}</td>
                        <td className="px-5 py-3.5 text-muted">{o.email}</td>
                        <td className="px-5 py-3.5">{formatPrice(o.total)}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs capitalize ${
                              statusTone[o.status] ?? "bg-[#f3eee7] text-muted"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-muted">
                          {formatDate(o.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </Stagger>
      </div>
    </RequireAuth>
  );
}
