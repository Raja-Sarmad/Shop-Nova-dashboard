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
  processing: "bg-amber-100 text-amber-900",
  shipped: "bg-sky-100 text-sky-900",
  delivered: "bg-teal/15 text-teal-dark",
  cancelled: "bg-rose-100 text-rose-800",
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
          <h1 className="font-display text-4xl text-ink">Dashboard</h1>
          <p className="mt-1.5 text-base text-muted">Sales · stock · customers</p>
        </div>

        {error ? (
          <div className="soft-card anim-pop border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-800">
            {error}
          </div>
        ) : null}

        <Stagger className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="soft-card p-6 sm:p-7">
            <p className="text-base font-medium text-muted">Total revenue</p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <p className="metric text-4xl text-ink sm:text-5xl">
                {stats ? formatPrice(stats.revenue) : "—"}
              </p>
              <span className="anim-pulse mb-1 inline-flex items-center gap-1.5 rounded-full bg-teal/15 px-3 py-1.5 text-sm font-semibold text-teal-dark">
                <ArrowUpRight size={15} /> Live store
              </span>
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link
                href="/orders"
                className="btn-press rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
              >
                View orders
              </Link>
              <Link
                href="/products"
                className="btn-press rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink shadow-[0_0_0_1px_rgba(44,36,32,0.1)]"
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
                <div key={title} className="soft-inset rounded-2xl px-4 py-3.5">
                  <p className="text-base font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-sm text-muted">{sub}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="soft-card p-6 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-medium text-muted">Sales pulse</p>
                <h2 className="mt-1 font-display text-3xl text-ink">Orders & demand</h2>
              </div>
              <span className="rounded-full bg-[#efe8de] px-3 py-1.5 text-sm font-medium text-muted">
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
                  <span className="text-xs font-medium text-muted">{bar.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-5 text-sm font-medium text-muted">
              <span className="inline-flex items-center gap-2">
                <i className="h-3 w-3 rounded-sm bg-ink" /> Orders
              </span>
              <span className="inline-flex items-center gap-2">
                <i className="h-3 w-3 rounded-sm bg-teal" /> Catalog activity
              </span>
            </div>
          </section>
        </Stagger>

        <Stagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="soft-card bg-teal p-6 text-white shadow-[0_18px_40px_rgba(63,159,136,0.28)]">
            <p className="text-base font-medium text-white/90">Total earnings</p>
            <p className="metric mt-4 text-4xl">
              {stats ? formatPrice(stats.revenue) : "—"}
            </p>
            <p className="mt-3 text-sm text-white/85">All completed sales</p>
          </div>
          <div className="soft-card p-6">
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-muted">Orders</p>
              <ShoppingBag size={18} className="text-muted" />
            </div>
            <p className="metric mt-4 text-4xl text-ink">{stats?.orders ?? "—"}</p>
            <p className="mt-3 text-sm text-muted">All time</p>
          </div>
          <div className="soft-card p-6">
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-muted">Products</p>
              <Package size={18} className="text-muted" />
            </div>
            <p className="metric mt-4 text-4xl text-ink">{stats?.products ?? "—"}</p>
            <p className="mt-3 text-sm text-muted">In catalog</p>
          </div>
          <div className="soft-card p-6">
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-muted">Customers</p>
              <Users size={18} className="text-muted" />
            </div>
            <p className="metric mt-4 text-4xl text-ink">{stats?.customers ?? "—"}</p>
            <p className="mt-3 text-sm text-muted">Registered buyers</p>
          </div>
        </Stagger>

        <Stagger className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="soft-card p-6 sm:p-7">
            <p className="text-base font-medium text-muted">Inventory pressure</p>
            <h2 className="mt-1 font-display text-3xl text-ink">Low stock watch</h2>
            <p className="mt-6 text-base">
              <span className="font-bold">{stats?.lowStockCount ?? 0}</span> SKUs need attention
            </p>
            <div className="mt-3 h-3.5 overflow-hidden rounded-full soft-inset">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-teal to-ink transition-all duration-1000 ease-out ${ready ? "" : "w-0"}`}
                style={{
                  width: ready
                    ? `${Math.min(100, (stockUsed / stockCap) * 100 || 8)}%`
                    : "0%",
                }}
              />
            </div>
            <ul className="mt-5 space-y-3.5 stagger-children">
              {lowStock.length === 0 ? (
                <li className="text-base text-muted">All stock levels look healthy.</li>
              ) : (
                lowStock.slice(0, 4).map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-base">
                    <span className="truncate pr-3 font-medium">{p.name}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        p.stockQuantity === 0
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-900"
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
              className="mt-6 inline-flex text-base font-semibold text-teal-dark hover:underline"
            >
              Open inventory →
            </Link>
          </section>

          <section className="soft-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 px-5 py-5">
              <h2 className="font-display text-3xl text-ink">Recent orders</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full soft-inset px-3.5 py-2.5">
                  <Search size={16} className="text-muted" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                    className="w-28 bg-transparent text-base outline-none sm:w-44"
                  />
                </div>
                <button
                  type="button"
                  className="btn-press flex h-10 w-10 items-center justify-center rounded-full soft-inset text-muted"
                  aria-label="Filter"
                >
                  <Filter size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-base">
                <thead className="table-head">
                  <tr>
                    <th className="px-5 py-3.5">Order</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Total</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-base text-muted">
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
                        <td className="px-5 py-4 font-semibold">{o.orderNumber}</td>
                        <td className="px-5 py-4 text-muted">{o.email}</td>
                        <td className="px-5 py-4 font-semibold">{formatPrice(o.total)}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                              statusTone[o.status] ?? "bg-[#efe8de] text-muted"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted">{formatDate(o.createdAt)}</td>
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
