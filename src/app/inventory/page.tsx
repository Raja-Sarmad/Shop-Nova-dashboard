"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  stockQuantity: number;
  price: number;
  inStock: boolean;
  category: string;
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = () =>
    api<{ products: Product[] }>("/products?published=all")
      .then((res) => setProducts(res.products))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"));

  useEffect(() => {
    load();
  }, []);

  const updateStock = async (id: string, stockQuantity: number) => {
    setSavingId(id);
    try {
      await api(`/products/${id}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ stockQuantity }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <RequireAuth>
      <div className="space-y-5">
        <div className="anim-fade-up">
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Stock</p>
          <h1 className="mt-2 font-display text-4xl">Inventory</h1>
        </div>
        {error ? <p className="text-sm text-accent anim-pop">{error}</p> : null}

        <div className="overflow-x-auto soft-card anim-fade-up" style={{ animationDelay: "100ms" }}>
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-[11px] tracking-[0.16em] uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Unit price</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p, i) => (
                <tr key={p.id} className="row-enter" style={{ animationDelay: `${i * 45}ms` }}>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 capitalize">{p.category}</td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      defaultValue={p.stockQuantity}
                      disabled={savingId === p.id}
                      onBlur={(e) => {
                        const next = Number(e.target.value);
                        if (!Number.isNaN(next) && next !== p.stockQuantity) {
                          updateStock(p.id, next);
                        }
                      }}
                      className={`w-20 border px-2 py-1 outline-none ${
                        p.stockQuantity <= 5 ? "border-warn text-warn" : "border-line"
                      }`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {formatPrice(p.price * p.stockQuantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RequireAuth>
  );
}
