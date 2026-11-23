"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Users,
  Menu,
  X,
  Search,
  Bell,
  ExternalLink,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/format";
import { Motion, PageMotion } from "@/components/Motion";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard, short: "Home" },
  { href: "/products", label: "Products", icon: Package, short: "Items" },
  { href: "/inventory", label: "Inventory", icon: Boxes, short: "Stock" },
  { href: "/orders", label: "Orders", icon: ShoppingBag, short: "Orders" },
  { href: "/customers", label: "Customers", icon: Users, short: "Users" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const firstName = useMemo(
    () => user?.name?.split(" ")[0] || "Admin",
    [user?.name],
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg px-2 py-2 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
      <aside className="fixed top-1/2 left-4 z-30 hidden -translate-y-1/2 lg:flex">
        <Motion variant="slide-left">
          <div className="anim-float flex flex-col items-center gap-2 rounded-[32px] bg-ink px-2.5 py-4 shadow-[0_20px_50px_rgba(44,36,32,0.28)]">
            {links.map((link, i) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={link.label}
                  style={{ animationDelay: `${80 + i * 60}ms` }}
                  className={cn(
                    "anim-pop nav-pill flex h-11 w-11 items-center justify-center rounded-2xl",
                    active
                      ? "bg-white text-ink shadow-md"
                      : "text-white/55 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon size={18} />
                </Link>
              );
            })}
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="nav-pill mt-2 flex h-11 w-11 items-center justify-center rounded-2xl text-white/40 hover:bg-white/10 hover:text-white"
            >
              <LogOut size={17} />
            </button>
          </div>
        </Motion>
      </aside>

      <Motion
        variant="fade-down"
        className="relative z-20 mx-auto mb-3 max-w-[1280px] sm:mb-5 lg:ml-24"
      >
        <header className="flex items-center gap-2 rounded-2xl bg-ink px-2.5 py-2 text-white shadow-[0_16px_40px_rgba(44,36,32,0.25)] sm:gap-3 sm:rounded-full sm:px-3 sm:py-2.5">
          <div className="flex min-w-0 items-center gap-2 pl-0.5 sm:gap-3 sm:pl-1">
            <div className="anim-pulse flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-semibold text-white sm:h-10 sm:w-10">
              {firstName.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold sm:text-base">
                Welcome, {firstName}
              </p>
              <p className="truncate text-xs text-white/70 sm:text-sm">
                Shop Nova Admin
              </p>
            </div>
          </div>

          <div className="mx-auto hidden max-w-md flex-1 items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 md:flex">
            <Search size={15} className="text-white/45" />
            <input
              placeholder="Search products, orders, customers…"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <a
              href={(
                process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000"
              ).replace(/\/$/, "")}
              target="_blank"
              rel="noreferrer"
              className="btn-press hidden h-9 items-center gap-2 rounded-full bg-white/10 px-3 text-xs text-white/70 hover:bg-white/15 hover:text-white sm:inline-flex sm:h-10"
            >
              <ExternalLink size={14} /> Store
            </a>
            <button
              type="button"
              className="btn-press flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 sm:h-10 sm:w-10"
              aria-label="Notifications"
            >
              <Bell size={16} />
            </button>
            <button
              type="button"
              className="btn-press flex h-9 w-9 items-center justify-center rounded-full bg-white/10 lg:hidden sm:h-10 sm:w-10"
              onClick={() => setOpen(true)}
              aria-label="Menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </header>
      </Motion>

      <div className="relative z-10 mx-auto max-w-[1280px] lg:ml-24">
        <div className="min-h-[calc(100vh-7rem)] rounded-[24px] bg-canvas p-3 pb-28 shadow-[0_30px_80px_rgba(44,36,32,0.08)] sm:rounded-[36px] sm:p-6 sm:pb-28 lg:p-8 lg:pb-10">
          {pathname === "/" ? (
            <div className="mb-5 hidden anim-fade-up lg:mb-6 lg:block">
              <h1 className="font-display text-4xl tracking-tight text-ink lg:text-5xl">
                {greeting()}, {firstName}
              </h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-muted">
                Stay on top of sales, monitor inventory, and track every order.
              </p>
            </div>
          ) : null}
          <PageMotion>{children}</PageMotion>
        </div>
      </div>

      {/* Mobile / tablet bottom nav — icon-first to avoid crowding */}
      <Motion
        variant="fade-up"
        delay={160}
        className="fixed bottom-3 left-1/2 z-30 w-[min(100%-1rem,560px)] -translate-x-1/2 sm:bottom-5 lg:hidden"
      >
        <nav className="flex items-center justify-between gap-0.5 rounded-full bg-ink p-1.5 shadow-[0_20px_50px_rgba(44,36,32,0.35)]">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "nav-pill flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-1 py-2 text-[10px] font-semibold tracking-wide sm:flex-row sm:justify-center sm:gap-1.5 sm:px-3 sm:py-2.5 sm:text-sm",
                  active
                    ? "bg-white text-ink shadow"
                    : "text-white/70 hover:text-white",
                )}
              >
                <Icon size={16} className="shrink-0 sm:hidden" />
                <span className="truncate sm:hidden">{link.short}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
          <Link
            href="/products"
            className="btn-press ml-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal text-white sm:ml-1"
            title="Add product"
          >
            <Plus size={18} />
          </Link>
        </nav>
      </Motion>

      {/* Desktop bottom nav */}
      <Motion
        variant="fade-up"
        delay={160}
        className="fixed bottom-5 left-1/2 z-30 hidden -translate-x-1/2 lg:block"
      >
        <nav className="flex items-center gap-1 rounded-full bg-ink p-1.5 shadow-[0_20px_50px_rgba(44,36,32,0.35)]">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "nav-pill rounded-full px-5 py-2.5 text-[15px] font-semibold tracking-wide",
                  active
                    ? "bg-white text-ink shadow"
                    : "text-white/70 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/products"
            className="btn-press ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-teal text-white"
            title="Add product"
          >
            <Plus size={18} />
          </Link>
        </nav>
      </Motion>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40 anim-fade-scale"
            onClick={() => setOpen(false)}
            aria-label="Close"
          />
          <aside className="absolute top-0 left-0 flex h-full w-[min(88%,20rem)] flex-col bg-ink p-5 text-white anim-slide-left">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-semibold">Shop Nova</p>
              <button type="button" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 md:hidden">
              <Search size={15} className="text-white/45" />
              <input
                placeholder="Search…"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
              />
            </div>
            <div className="flex flex-col gap-1 stagger-children">
              {links.map((link) => {
                const Icon = link.icon;
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm",
                      active ? "bg-white text-ink" : "text-white/70",
                    )}
                  >
                    <Icon size={17} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <a
              href={(
                process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000"
              ).replace(/\/$/, "")}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center gap-2 rounded-2xl px-3 py-3 text-sm text-white/70"
            >
              <ExternalLink size={16} /> Open store
            </a>
            <button
              type="button"
              onClick={logout}
              className="mt-auto flex items-center gap-2 rounded-2xl px-3 py-3 text-sm text-white/55"
            >
              <LogOut size={16} /> Sign out
            </button>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
