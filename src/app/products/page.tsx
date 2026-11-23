"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Upload, Star } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { cn, formatPrice } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  gender?: "men" | "women" | "unisex";
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

type Category = "fragrance" | "shoes";
type Gender = "men" | "women" | "unisex";
type Tab = "all" | Category;

type FormState = {
  name: string;
  subtitle: string;
  description: string;
  price: string;
  compareAtPrice: string;
  category: Category;
  gender: Gender;
  collectionSlug: string;
  sizes: string;
  colors: string;
  stockQuantity: string;
  fabric: string;
  isNew: boolean;
  isBestseller: boolean;
  isPublished: boolean;
};

type ImageDraft = {
  key: string;
  url: string;
  publicId?: string;
  file?: File;
};

const perfumeDefaults: FormState = {
  name: "",
  subtitle: "",
  description: "",
  price: "",
  compareAtPrice: "",
  category: "fragrance",
  gender: "unisex",
  collectionSlug: "signature-scents",
  sizes: "50ml, 100ml",
  colors: "Amber:#C48A3A, Noir:#1A1614",
  stockQuantity: "10",
  fabric: "Eau de Parfum",
  isNew: true,
  isBestseller: false,
  isPublished: true,
};

const shoesDefaults: FormState = {
  name: "",
  subtitle: "",
  description: "",
  price: "",
  compareAtPrice: "",
  category: "shoes",
  gender: "unisex",
  collectionSlug: "everyday-footwear",
  sizes: "40, 41, 42, 43, 44",
  colors: "Black:#1A1614, Brown:#6B4423",
  stockQuantity: "10",
  fabric: "Leather",
  isNew: true,
  isBestseller: false,
  isPublished: true,
};

function defaultsFor(category: Category): FormState {
  return category === "shoes" ? { ...shoesDefaults } : { ...perfumeDefaults };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(perfumeDefaults);
  const [images, setImages] = useState<ImageDraft[]>([]);
  const [primaryKey, setPrimaryKey] = useState<string>("");
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

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.file) URL.revokeObjectURL(img.url);
      });
    };
  }, [images]);

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((p) => {
      const matchTab = tab === "all" || p.category === tab;
      const matchQuery =
        !q || p.name.toLowerCase().includes(q) || p.slug.includes(q);
      return matchTab && matchQuery;
    });
  }, [products, query, tab]);

  const perfumeCount = products.filter((p) => p.category === "fragrance").length;
  const shoesCount = products.filter((p) => p.category === "shoes").length;
  const isPerfume = form.category === "fragrance";

  const beginCreate = (category: Category = "fragrance") => {
    setEditing(null);
    setForm(defaultsFor(category));
    setImages([]);
    setPrimaryKey("");
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
      category: (product.category as Category) || "fragrance",
      gender: product.gender || "unisex",
      collectionSlug: product.collection,
      sizes: product.sizes.join(", "),
      colors: product.colors.map((c) => `${c.name}:${c.hex}`).join(", "),
      stockQuantity: String(product.stockQuantity),
      fabric: product.fabric ?? "",
      isNew: Boolean(product.isNew),
      isBestseller: Boolean(product.isBestseller),
      isPublished: product.isPublished !== false,
    });
    const drafts =
      product.imageMeta?.length
        ? product.imageMeta.map((img, i) => ({
            key: `existing-${i}-${img.url}`,
            url: img.url,
            publicId: img.publicId,
          }))
        : product.images.map((url, i) => ({
            key: `existing-${i}-${url}`,
            url,
            publicId: "",
          }));
    setImages(drafts);
    setPrimaryKey(drafts[0]?.key ?? "");
    setOpen(true);
    setError("");
  };

  const switchCategory = (category: Category) => {
    if (editing) {
      setForm((f) => ({
        ...f,
        category,
        collectionSlug:
          category === "shoes" ? "everyday-footwear" : "signature-scents",
      }));
      return;
    }
    setForm(defaultsFor(category));
  };

  const addFiles = (fileList: FileList | null) => {
    const nextFiles = Array.from(fileList ?? []).slice(0, 8);
    if (!nextFiles.length) return;
    const drafts = nextFiles.map((file, i) => ({
      key: `file-${Date.now()}-${i}-${file.name}`,
      url: URL.createObjectURL(file),
      file,
    }));
    setImages((current) => [...current, ...drafts].slice(0, 8));
    setPrimaryKey((current) => current || drafts[0]?.key || "");
  };

  const removeImage = (key: string) => {
    setImages((current) => {
      const target = current.find((img) => img.key === key);
      if (target?.file) URL.revokeObjectURL(target.url);
      const next = current.filter((img) => img.key !== key);
      if (primaryKey === key) setPrimaryKey(next[0]?.key ?? "");
      return next;
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const ordered = [...images];
      const primaryIndex = Math.max(
        0,
        ordered.findIndex((img) => img.key === primaryKey),
      );
      const files = ordered.filter((img) => img.file).map((img) => img.file!);
      const existingImages = ordered
        .filter((img) => !img.file)
        .map((img) => ({ url: img.url, publicId: img.publicId ?? "" }));
      let newIndex = 0;
      const imagePlan = ordered.map((img) =>
        img.file
          ? { type: "new" as const, index: newIndex++ }
          : {
              type: "existing" as const,
              url: img.url,
              publicId: img.publicId ?? "",
            },
      );

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("subtitle", form.subtitle);
      fd.append("description", form.description);
      fd.append("price", form.price);
      if (form.compareAtPrice) fd.append("compareAtPrice", form.compareAtPrice);
      fd.append("category", form.category);
      fd.append("gender", form.gender);
      fd.append("collectionSlug", form.collectionSlug);
      fd.append("sizes", form.sizes);
      fd.append("colors", form.colors);
      fd.append("stockQuantity", form.stockQuantity);
      fd.append("fabric", form.fabric);
      fd.append("isNew", String(form.isNew));
      fd.append("isBestseller", String(form.isBestseller));
      fd.append("isPublished", String(form.isPublished));
      fd.append("existingImages", JSON.stringify(existingImages));
      fd.append("imagePlan", JSON.stringify(imagePlan));
      fd.append("primaryImageIndex", String(primaryIndex < 0 ? 0 : primaryIndex));
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              Catalog
            </p>
            <h1 className="mt-2 font-display text-4xl">Products</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => beginCreate("fragrance")}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={15} /> Add perfume
            </button>
            <button
              type="button"
              onClick={() => beginCreate("shoes")}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink"
            >
              <Plus size={15} /> Add shoes
            </button>
          </div>
        </div>

        {notice ? (
          <p className="rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-base text-ok">
            {notice}
          </p>
        ) : null}
        {error && !open ? (
          <p className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-base">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["all", `All (${products.length})`],
              ["fragrance", `Perfumes (${perfumeCount})`],
              ["shoes", `Shoes (${shoesCount})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold",
                tab === value
                  ? "bg-ink text-white"
                  : "bg-white text-muted shadow-[0_0_0_1px_rgba(44,36,32,0.08)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="w-full max-w-md rounded-full border border-line bg-panel px-4 py-3 text-base outline-none focus:border-ink"
        />

        <div className="overflow-x-auto soft-card">
          <table className="min-w-full text-left text-base">
            <thead className="table-head border-b border-line">
              <tr>
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5">Stock</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-12 overflow-hidden rounded-lg bg-line">
                        {p.images[0] ? (
                          <Image
                            src={p.images[0]}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-sm text-muted">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 capitalize">
                    {p.category === "fragrance" ? "Perfume" : "Shoes"}
                    <span className="mt-0.5 block text-sm capitalize text-muted">
                      {p.gender || "unisex"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3.5">{p.stockQuantity}</td>
                  <td className="px-4 py-3.5">
                    {p.isPublished === false ? (
                      <span className="text-muted">Draft</span>
                    ) : (
                      <span className="font-semibold text-ok">Live</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => beginEdit(p)}
                        className="rounded-full p-2 text-muted hover:bg-[#f3eee7] hover:text-ink"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(p)}
                        className="rounded-full p-2 text-muted hover:bg-rose-50 hover:text-accent"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 ? (
            <p className="px-4 py-10 text-center text-base text-muted">
              No products in this section yet.
            </p>
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
                  className="relative z-10 flex max-h-[min(92vh,920px)] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(44,36,32,0.28)]"
                >
                  <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                        {isPerfume ? "Perfume form" : "Shoes form"}
                      </p>
                      <h2 className="mt-1 font-display text-3xl text-ink">
                        {editing
                          ? `Edit ${isPerfume ? "perfume" : "shoes"}`
                          : `New ${isPerfume ? "perfume" : "shoes"}`}
                      </h2>
                    </div>
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
                    <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-[#f5f0e8] p-1.5">
                      <button
                        type="button"
                        onClick={() => switchCategory("fragrance")}
                        className={cn(
                          "rounded-xl px-4 py-3 text-sm font-semibold",
                          isPerfume ? "bg-white text-ink shadow" : "text-muted",
                        )}
                      >
                        Perfume
                      </button>
                      <button
                        type="button"
                        onClick={() => switchCategory("shoes")}
                        className={cn(
                          "rounded-xl px-4 py-3 text-sm font-semibold",
                          !isPerfume ? "bg-white text-ink shadow" : "text-muted",
                        )}
                      >
                        Shoes
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-sm font-semibold text-ink">Name</span>
                        <input
                          required
                          value={form.name}
                          placeholder={
                            isPerfume ? "e.g. Amber Oud Mist" : "e.g. Canvas Court Sneaker"
                          }
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          className="field"
                        />
                      </label>

                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-sm font-semibold text-ink">
                          Subtitle
                        </span>
                        <input
                          value={form.subtitle}
                          placeholder={
                            isPerfume
                              ? "Warm, lasting fragrance note"
                              : "Everyday comfort with clean lines"
                          }
                          onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                          className="field"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-sm font-semibold text-ink">
                          Price (PKR)
                        </span>
                        <input
                          required
                          value={form.price}
                          placeholder="4500"
                          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                          className="field"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-sm font-semibold text-ink">
                          Compare-at price
                        </span>
                        <input
                          value={form.compareAtPrice}
                          placeholder="Optional old price"
                          onChange={(e) =>
                            setForm((f) => ({ ...f, compareAtPrice: e.target.value }))
                          }
                          className="field"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-sm font-semibold text-ink">
                          {isPerfume ? "Bottle sizes" : "Shoe sizes"}
                        </span>
                        <input
                          value={form.sizes}
                          placeholder={isPerfume ? "30ml, 50ml, 100ml" : "40, 41, 42, 43, 44"}
                          onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
                          className="field"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-sm font-semibold text-ink">
                          {isPerfume ? "Scent accents / colors" : "Colorways"}
                        </span>
                        <input
                          value={form.colors}
                          placeholder={
                            isPerfume
                              ? "Amber:#C48A3A, Noir:#1A1614"
                              : "Black:#1A1614, Brown:#6B4423"
                          }
                          onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
                          className="field"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-sm font-semibold text-ink">
                          {isPerfume ? "Concentration" : "Material"}
                        </span>
                        <input
                          value={form.fabric}
                          placeholder={isPerfume ? "Eau de Parfum / Attar" : "Leather / Suede / Mesh"}
                          onChange={(e) => setForm((f) => ({ ...f, fabric: e.target.value }))}
                          className="field"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-sm font-semibold text-ink">Stock</span>
                        <input
                          value={form.stockQuantity}
                          placeholder="10"
                          onChange={(e) =>
                            setForm((f) => ({ ...f, stockQuantity: e.target.value }))
                          }
                          className="field"
                        />
                      </label>

                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-sm font-semibold text-ink">
                          Collection slug
                        </span>
                        <input
                          value={form.collectionSlug}
                          placeholder={
                            isPerfume ? "signature-scents" : "everyday-footwear"
                          }
                          onChange={(e) =>
                            setForm((f) => ({ ...f, collectionSlug: e.target.value }))
                          }
                          className="field"
                        />
                      </label>

                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-sm font-semibold text-ink">
                          Description
                        </span>
                        <textarea
                          value={form.description}
                          rows={4}
                          placeholder={
                            isPerfume
                              ? "Describe the notes, mood, and wear time…"
                              : "Describe fit, sole, and when to wear them…"
                          }
                          onChange={(e) =>
                            setForm((f) => ({ ...f, description: e.target.value }))
                          }
                          className="field"
                        />
                      </label>
                    </div>

                    <label className="mt-5 block">
                      <span className="mb-2 block text-sm font-semibold text-ink">
                        Gender / audience
                      </span>
                      <select
                        value={form.gender}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            gender: e.target.value as Gender,
                          }))
                        }
                        className="field"
                      >
                        <option value="men">Men — shows in Men section</option>
                        <option value="women">Women — shows in Women section</option>
                        <option value="unisex">Unisex — shows in both Men &amp; Women</option>
                      </select>
                      <p className="mt-2 text-sm text-muted">
                        Shop shows all products. Men / Women homepage sections only
                        list matching gender (plus unisex).
                      </p>
                    </label>

                    <div className="mt-5 flex flex-wrap gap-5 text-base">
                      {(
                        [
                          ["isNew", "New arrivals"],
                          ["isBestseller", "Bestseller"],
                          ["isPublished", "Published"],
                        ] as const
                      ).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2.5 font-medium text-ink">
                          <input
                            type="checkbox"
                            checked={form[key]}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, [key]: e.target.checked }))
                            }
                            className="h-4 w-4 accent-teal"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      New / Bestseller flags control navbar dropdowns. Sale items need a
                      compare-at (old) price higher than the selling price.
                    </p>

                    <div className="mt-6">
                      <div className="flex flex-wrap items-end justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-ink">Product images</p>
                          <p className="mt-1 text-sm text-muted">
                            Star the image that should show on the website card &amp; hero.
                          </p>
                        </div>
                      </div>

                      {images.length ? (
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {images.map((img) => {
                            const isPrimary = img.key === primaryKey;
                            return (
                              <div
                                key={img.key}
                                className={cn(
                                  "relative overflow-hidden rounded-2xl border bg-[#f7f3ed]",
                                  isPrimary
                                    ? "border-teal ring-2 ring-teal/30"
                                    : "border-line",
                                )}
                              >
                                <div className="relative aspect-[3/4]">
                                  <Image
                                    src={img.url}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                                <div className="absolute inset-x-0 top-0 flex justify-between p-2">
                                  <button
                                    type="button"
                                    onClick={() => setPrimaryKey(img.key)}
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                                      isPrimary
                                        ? "bg-teal text-white"
                                        : "bg-white/95 text-ink",
                                    )}
                                  >
                                    <Star size={12} fill={isPrimary ? "currentColor" : "none"} />
                                    {isPrimary ? "Display" : "Set display"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeImage(img.key)}
                                    className="rounded-full bg-ink/75 p-1 text-white"
                                    aria-label="Remove image"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}

                      <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line bg-[#faf7f2] px-4 py-6 text-base text-muted transition hover:border-ink hover:text-ink">
                        <Upload size={18} />
                        <span>
                          {images.length
                            ? `${images.length}/8 images — add more`
                            : "Upload images (max 8, 5MB each)"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            addFiles(e.target.files);
                            e.target.value = "";
                          }}
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
