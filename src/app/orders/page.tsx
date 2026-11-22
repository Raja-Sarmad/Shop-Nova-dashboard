"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";

type Order = {
  _id: string;
  orderNumber: string;
  email: string;
  total: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: { name: string; quantity: number; size: string; color: string }[];
  shippingAddress: {
    fullName: string;
    line1: string;
    city: string;
    region: string;
    phone: string;
  };
};

const statuses: Order["status"][] = [
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const load = () =>
    api<{ orders: Order[] }>(`/orders/admin/all?status=${filter}`)
      .then((res) => setOrders(res.orders))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"));

  useEffect(() => {
    load();
  }, [filter]);

  const updateStatus = async (id: string, status: Order["status"]) => {
    await api(`/orders/admin/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await load();
    setSelected((current) =>
      current && current._id === id ? { ...current, status } : current,
    );
  };

  return (
    <RequireAuth>
      <div className="space-y-5">
        <div className="anim-fade-up">
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Fulfillment</p>
          <h1 className="mt-2 font-display text-4xl">Orders</h1>
        </div>

        <div className="flex flex-wrap gap-2 anim-fade-up" style={{ animationDelay: "60ms" }}>
          {["all", ...statuses].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`nav-pill rounded-full px-4 py-2 text-xs tracking-[0.14em] uppercase ${
                filter === s ? "bg-ink text-white" : "border border-line text-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {error ? <p className="text-sm text-accent anim-pop">{error}</p> : null}

        <div className="overflow-x-auto soft-card anim-fade-up" style={{ animationDelay: "120ms" }}>
          <table className="min-w-full text-left text-sm">
            <thead className="table-head border-b border-line">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o, i) => (
                <tr
                  key={o._id}
                  className="row-enter cursor-pointer hover:bg-bg/60"
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => setSelected(o)}
                >
                  <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                  <td className="px-4 py-3">{o.email}</td>
                  <td className="px-4 py-3">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3 capitalize">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">No orders yet.</p>
          ) : null}
        </div>

        {selected ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 anim-fade-scale">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto soft-card anim-fade-up p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
                    {selected.paymentMethod} · {selected.paymentStatus}
                  </p>
                  <h2 className="mt-1 font-display text-3xl">{selected.orderNumber}</h2>
                </div>
                <button type="button" onClick={() => setSelected(null)} className="text-sm">
                  Close
                </button>
              </div>

              <ul className="mt-6 space-y-2 border-y border-line py-4 text-sm">
                {selected.items.map((item, i) => (
                  <li key={`${item.name}-${i}`}>
                    {item.name} · {item.color} · {item.size} ×{item.quantity}
                  </li>
                ))}
              </ul>

              <div className="mt-4 text-sm">
                <p className="text-[11px] tracking-[0.14em] uppercase text-muted">Ship to</p>
                <p className="mt-2">
                  {selected.shippingAddress.fullName}
                  <br />
                  {selected.shippingAddress.line1}
                  <br />
                  {selected.shippingAddress.city}, {selected.shippingAddress.region}
                  <br />
                  {selected.shippingAddress.phone}
                </p>
                <p className="mt-4 font-display text-2xl">{formatPrice(selected.total)}</p>
              </div>

              <label className="mt-6 block text-sm">
                <span className="text-[11px] tracking-[0.14em] uppercase text-muted">
                  Update status
                </span>
                <select
                  value={selected.status}
                  onChange={(e) =>
                    updateStatus(selected._id, e.target.value as Order["status"])
                  }
                  className="mt-2 w-full border border-line bg-bg px-3 py-2 outline-none"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : null}
      </div>
    </RequireAuth>
  );
}
