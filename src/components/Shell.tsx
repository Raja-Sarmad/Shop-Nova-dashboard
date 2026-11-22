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
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/customers", label: "Customers", icon: Users },
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
    <div className="relative min-h-screen overflow-x-hidden bg-bg px-3 py-3 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
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

      <Motion variant="fade-down" className="relative z-20 mx-auto mb-5 max-w-[1280px] lg:ml-24">
        <header className="flex items-center gap-3 rounded-full bg-ink px-3 py-2.5 text-white shadow-[0_16px_40px_rgba(44,36,32,0.25)]">
          <div className="flex min-w-0 items-center gap-3 pl-1">
            <div className="anim-pulse flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-semibold text-white">
              {firstName.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-base font-semibold">Welcome, {firstName}</p>
              <p className="truncate text-sm text-white/70">Shop Nova Admin</p>
            </div>
          </div>

          <div className="mx-auto hidden max-w-md flex-1 items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 md:flex">
            <Search size={15} className="text-white/45" />
            <input
              placeholder="Search products, orders, customers…"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="btn-press hidden h-10 items-center gap-2 rounded-full bg-white/10 px-3 text-xs text-white/70 hover:bg-white/15 hover:text-white sm:inline-flex"
            >
              <ExternalLink size={14} /> Store
            </a>
            <button
              type="button"
              className="btn-press flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70"
              aria-label="Notifications"
            >
              <Bell size={16} />
            </button>
            <button
              type="button"
              className="btn-press flex h-10 w-10 items-center justify-center rounded-full bg-white/10 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </header>
      </Motion>

      <div className="relative z-10 mx-auto max-w-[1280px] lg:ml-24">
        <div className="min-h-[calc(100vh-8rem)] rounded-[36px] bg-canvas p-4 pb-28 shadow-[0_30px_80px_rgba(44,36,32,0.08)] sm:p-6 lg:p-8">
          {pathname === "/" ? (
            <div className="mb-6 hidden anim-fade-up lg:block">
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

      <Motion
        variant="fade-up"
        delay={160}
        className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2"
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
                  "nav-pill rounded-full px-3.5 py-2.5 text-sm font-semibold tracking-wide sm:px-5 sm:text-[15px]",
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
          <aside className="absolute top-0 left-0 flex h-full w-[80%] max-w-xs flex-col bg-ink p-5 text-white anim-slide-left">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-semibold">Shop Nova</p>
              <button type="button" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
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
