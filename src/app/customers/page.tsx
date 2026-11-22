"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";

type Customer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ customers: Customer[] }>("/admin/customers")
      .then((res) => setCustomers(res.customers))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"));
  }, []);

  return (
    <RequireAuth>
      <div className="space-y-5">
        <div className="anim-fade-up">
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted">CRM</p>
          <h1 className="mt-2 font-display text-4xl">Customers</h1>
          <p className="mt-2 text-sm text-muted">
            Storefront registrations only — admins are not listed here.
          </p>
        </div>
        {error ? <p className="text-sm text-accent anim-pop">{error}</p> : null}

        <div className="overflow-x-auto soft-card anim-fade-up" style={{ animationDelay: "100ms" }}>
          <table className="min-w-full text-left text-sm">
            <thead className="table-head border-b border-line">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {customers.map((c, i) => (
                <tr key={c._id} className="row-enter" style={{ animationDelay: `${i * 50}ms` }}>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.phone || "—"}</td>
                  <td className="px-4 py-3">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    {c.isActive ? (
                      <span className="text-ok">Active</span>
                    ) : (
                      <span className="text-muted">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">
              No customers yet. They appear after storefront registration.
            </p>
          ) : null}
        </div>
      </div>
    </RequireAuth>
  );
}
