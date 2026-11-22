"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  collection: string;
  images: string[];
  imageMeta?: { url: string; publicId: string }[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  stockQuantity: number;
  fabric?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  isPublished?: boolean;
};

type FormState = {
  name: string;
  subtitle: string;
  description: string;
  price: string;
  compareAtPrice: string;
  category: string;
  collectionSlug: string;
  sizes: string;
  colors: string;
  stockQuantity: string;
  fabric: string;
  isNew: boolean;
  isBestseller: boolean;
  isPublished: boolean;
};

const blank: FormState = {
  name: "",
  subtitle: "",
  description: "",
  price: "",
  compareAtPrice: "",
  category: "fragrance",
  collectionSlug: "signature-scents",
  sizes: "50ml",
  colors: "Noir:#1A1614",
  stockQuantity: "10",
  fabric: "",
  isNew: true,
  isBestseller: false,
  isPublished: true,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ url: string; publicId: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = async () => {
    const res = await api<{ products: Product[] }>("/products?published=all");
    setProducts(res.products);
  };

  useEffect(() => {
    refresh().catch((err) => setError(err instanceof Error ? err.message : "Failed"));
  }, []);

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.slug.includes(q));
  }, [products, query]);

  const beginCreate = () => {
    setEditing(null);
    setForm(blank);
    setFiles([]);
    setExistingImages([]);
    setOpen(true);
    setError("");
  };

  const beginEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      subtitle: product.subtitle,
      description: product.description,
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      category: product.category,
      collectionSlug: product.collection,
      sizes: product.sizes.join(", "),
      colors: product.colors.map((c) => `${c.name}:${c.hex}`).join(", "),
      stockQuantity: String(product.stockQuantity),
      fabric: product.fabric ?? "",
      isNew: Boolean(product.isNew),
      isBestseller: Boolean(product.isBestseller),
      isPublished: product.isPublished !== false,
    });
    setExistingImages(
      product.imageMeta?.length
        ? product.imageMeta
        : product.images.map((url) => ({ url, publicId: "" })),
    );
    setFiles([]);
    setOpen(true);
    setError("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("subtitle", form.subtitle);
      fd.append("description", form.description);
      fd.append("price", form.price);
      if (form.compareAtPrice) fd.append("compareAtPrice", form.compareAtPrice);
      fd.append("category", form.category);
      fd.append("collectionSlug", form.collectionSlug);
      fd.append("sizes", form.sizes);
      fd.append("colors", form.colors);
      fd.append("stockQuantity", form.stockQuantity);
      fd.append("fabric", form.fabric);
      fd.append("isNew", String(form.isNew));
      fd.append("isBestseller", String(form.isBestseller));
      fd.append("isPublished", String(form.isPublished));
      fd.append("existingImages", JSON.stringify(existingImages));
      files.forEach((file) => fd.append("images", file));

      if (editing) {
        await api(`/products/${editing.id}`, { method: "PUT", formData: fd });
        setNotice("Product updated");
      } else {
        await api("/products", { method: "POST", formData: fd });
        setNotice("Product created — images uploaded to Cloudinary");
      }
      setOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product: Product) => {
    if (!confirm(`Delete “${product.name}”?`)) return;
    await api(`/products/${product.id}`, { method: "DELETE" });
    setNotice("Product deleted");
    await refresh();
  };

  return (
    <RequireAuth>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4 anim-fade-up">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Catalog</p>
            <h1 className="mt-2 font-display text-4xl">Products</h1>
          </div>
          <button
            type="button"
            onClick={beginCreate}
            className="btn-press inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs tracking-[0.14em] uppercase text-white"
          >
            <Plus size={14} /> Add product
          </button>
        </div>

        {notice ? (
          <p className="mt-4 rounded-lg border border-ok/30 bg-ok/10 px-3 py-2 text-sm text-ok">
            {notice}
          </p>
        ) : null}
        {error && !open ? (
          <p className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm">
            {error}
          </p>
        ) : null}

        <div className="anim-fade-up" style={{ animationDelay: "80ms" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full max-w-md rounded-full border border-line bg-panel px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>

        <div className="overflow-x-auto soft-card anim-fade-up" style={{ animationDelay: "140ms" }}>
          <table className="min-w-full text-left text-sm">
            <thead className="table-head border-b border-line">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((p, i) => (
                <tr key={p.id} className="row-enter" style={{ animationDelay: `${i * 50}ms` }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 overflow-hidden bg-line">
                        {p.images[0] ? (
                          <Image src={p.images[0]} alt="" fill className="object-cover" unoptimized />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{p.category}</td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">{p.stockQuantity}</td>
                  <td className="px-4 py-3">
                    {p.isPublished === false ? (
                      <span className="text-muted">Draft</span>
                    ) : (
                      <span className="text-ok">Live</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => beginEdit(p)} className="p-2 text-muted hover:text-ink">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => remove(p)} className="p-2 text-muted hover:text-accent">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">No products yet. Add your first piece.</p>
          ) : null}
        </div>

        {open && typeof document !== "undefined"
          ? createPortal(
              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/50 p-3 sm:p-6">
                <button
                  type="button"
                  className="absolute inset-0 cursor-default"
                  aria-label="Close dialog"
                  onClick={() => setOpen(false)}
                />
                <form
                  onSubmit={onSubmit}
                  className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(44,36,32,0.28)]"
                >
                  <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
                    <h2 className="font-display text-3xl text-ink">
                      {editing ? "Edit product" : "New product"}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3eee7] text-muted hover:text-ink"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(
                        [
                          ["name", "Name", "e.g. Amber Oud Mist"],
                          ["subtitle", "Subtitle", "Short line under the name"],
                          ["price", "Price (PKR)", "4500"],
                          ["compareAtPrice", "Compare-at price", "Optional old price"],
                          ["collectionSlug", "Collection slug", "e.g. oud-collection"],
                          ["stockQuantity", "Stock", "10"],
                          ["sizes", "Sizes (comma)", "S, M, L or 40, 41, 42"],
                          ["colors", "Colors (Name:#hex)", "Black:#111111, Gold:#c9a96e"],
                          ["fabric", "Fabric / notes", "Optional"],
                        ] as const
                      ).map(([key, label, placeholder]) => (
                        <label key={key} className="block text-sm">
                          <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
                          <input
                            required={key === "name" || key === "price"}
                            value={form[key]}
                            placeholder={placeholder}
                            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                            className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-ink focus:ring-2 focus:ring-ink/10"
                          />
                        </label>
                      ))}

                      <label className="block text-sm">
                        <span className="mb-1.5 block text-sm font-semibold text-ink">Category</span>
                        <select
                          value={form.category}
                          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                          className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-base text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
                        >
                          {["fragrance", "shoes"].map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block text-sm sm:col-span-2">
                        <span className="mb-1.5 block text-sm font-semibold text-ink">Description</span>
                        <textarea
                          value={form.description}
                          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                          rows={4}
                          placeholder="Write a short product description…"
                          className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-ink focus:ring-2 focus:ring-ink/10"
                        />
                      </label>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-5 text-base">
                      {(
                        [
                          ["isNew", "New"],
                          ["isBestseller", "Bestseller"],
                          ["isPublished", "Published"],
                        ] as const
                      ).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2.5 font-medium text-ink">
                          <input
                            type="checkbox"
                            checked={form[key]}
                            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                            className="h-4 w-4 accent-teal"
                          />
                          {label}
                        </label>
                      ))}
                    </div>

                    <div className="mt-6">
                      <p className="text-sm font-semibold text-ink">Images → Cloudinary</p>
                      {existingImages.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {existingImages.map((img) => (
                            <div
                              key={img.url}
                              className="relative h-20 w-16 overflow-hidden rounded-lg bg-line"
                            >
                              <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                              <button
                                type="button"
                                className="absolute top-0 right-0 bg-ink/70 p-0.5 text-panel"
                                onClick={() =>
                                  setExistingImages((list) => list.filter((i) => i.url !== img.url))
                                }
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line bg-[#faf7f2] px-4 py-6 text-base text-muted transition hover:border-ink hover:text-ink">
                        <Upload size={18} />
                        <span>
                          {files.length
                            ? `${files.length} file(s) selected`
                            : "Upload images (max 8, 5MB each)"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                        />
                      </label>
                    </div>

                    {error ? (
                      <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-800">
                        {error}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 justify-end gap-3 border-t border-line bg-white px-5 py-4 sm:px-6">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-full px-5 py-3 text-base font-medium text-muted hover:text-ink"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-ink px-6 py-3 text-sm font-semibold tracking-wide text-panel disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save product"}
                    </button>
                  </div>
                </form>
              </div>,
              document.body,
            )
          : null}
      </div>
    </RequireAuth>
  );
}
