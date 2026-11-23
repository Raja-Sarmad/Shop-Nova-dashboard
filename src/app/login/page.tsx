"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const { login, acceptToken, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@shopnova.pk");
  const [password, setPassword] = useState("Admin@12345");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [bridging, setBridging] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token || loading || user) return;

    let cancelled = false;
    setBridging(true);
    setError("");
    acceptToken(token)
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not open dashboard");
        setBridging(false);
        router.replace("/login");
      });

    return () => {
      cancelled = true;
    };
  }, [acceptToken, loading, router, searchParams, user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c0b0a]">
      <Image
        src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=2000&q=80"
        alt=""
        fill
        priority
        className="object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black/75 to-[#1a1510]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(176,141,87,0.28),transparent_50%)]" />

      <div className="relative z-10 flex min-h-screen flex-col lg:grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-1 flex-col justify-between px-8 py-10 sm:px-12 lg:px-16 lg:py-14">
          <div className="anim-fade-down flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b08d57]/50 text-[#b08d57]">
              <Shield size={18} />
            </span>
            <div>
              <p className="font-display text-2xl tracking-[0.18em] text-white">SHOP NOVA</p>
              <p className="text-[10px] tracking-[0.28em] uppercase text-[#b08d57]">Admin console</p>
            </div>
          </div>

          <div className="anim-fade-up hidden max-w-lg lg:block" style={{ animationDelay: "120ms" }}>
            <p className="text-[11px] tracking-[0.32em] uppercase text-[#b08d57]">Operations</p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] text-white xl:text-6xl">
              Run the catalog.
              <br />
              Ship the orders.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
              Manage perfumes, shoes, stock, and customers — live on MongoDB with
              product images on Cloudinary.
            </p>
            <div className="mt-10 flex gap-8 border-t border-white/10 pt-6 text-xs tracking-[0.16em] uppercase text-white/45">
              <span>Products</span>
              <span>Inventory</span>
              <span>Orders</span>
            </div>
          </div>

          <p className="hidden text-xs text-white/35 lg:block">
            Storefront stays on :3000 · this panel is staff only
          </p>
        </div>

        <div className="flex items-center justify-center px-5 pb-12 pt-4 sm:px-8 lg:px-12 lg:py-14">
          <form
            onSubmit={onSubmit}
            className="anim-fade-scale w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#fffcf8]/95 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-9"
          >
            <div className="mb-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#12100e] text-[#b08d57]">
                <Lock size={18} />
              </div>
              <h2 className="font-display text-3xl text-[#12100e]">Sign in</h2>
              <p className="mt-2 text-sm leading-6 text-[#7a7268]">
                Admin access only. Customers use the shop at localhost:3000.
              </p>
            </div>

            <label className="block text-sm">
              <span className="text-[11px] tracking-[0.18em] uppercase text-[#7a7268]">Email</span>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#e4dbd0] bg-white px-4 py-3.5 text-[#12100e] outline-none transition focus:border-[#12100e]"
              />
            </label>

            <label className="mt-5 block text-sm">
              <span className="text-[11px] tracking-[0.18em] uppercase text-[#7a7268]">Password</span>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#e4dbd0] bg-white px-4 py-3.5 pr-12 text-[#12100e] outline-none transition focus:border-[#12100e]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-[#7a7268] hover:text-[#12100e]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {bridging ? (
              <p className="mt-5 rounded-xl border border-[#e4dbd0] bg-[#f7f2ea] px-4 py-3 text-sm text-[#5c554e]">
                Opening dashboard from store login…
              </p>
            ) : null}

            {error ? (
              <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending || bridging}
              className="btn-press mt-7 w-full rounded-xl bg-[#12100e] py-4 text-xs tracking-[0.22em] uppercase text-white hover:bg-[#2a2420] disabled:opacity-60"
            >
              {bridging ? "Opening…" : pending ? "Signing in…" : "Enter dashboard"}
            </button>

            <p className="mt-6 text-center text-xs text-[#7a7268]">
              Default · admin@shopnova.pk
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-[#0c0b0a] text-sm text-white/70">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
