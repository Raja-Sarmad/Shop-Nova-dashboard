"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";

type MotionProps = {
  children: React.ReactNode;
  className?: string;
  /** CSS animation class, default fade-up */
  variant?:
    | "fade-up"
    | "fade-down"
    | "fade-scale"
    | "slide-left"
    | "slide-right"
    | "pop";
  /** delay in ms */
  delay?: number;
  /** remount when route changes so animation replays */
  replayOnRoute?: boolean;
};

const variantClass = {
  "fade-up": "anim-fade-up",
  "fade-down": "anim-fade-down",
  "fade-scale": "anim-fade-scale",
  "slide-left": "anim-slide-left",
  "slide-right": "anim-slide-right",
  pop: "anim-pop",
} as const;

export function Motion({
  children,
  className,
  variant = "fade-up",
  delay = 0,
  replayOnRoute = false,
}: MotionProps) {
  const pathname = usePathname();
  return (
    <div
      key={replayOnRoute ? pathname : undefined}
      className={cn(variantClass[variant], className)}
      style={{ animationDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}

/** Re-triggers children animations every time the route changes */
export function PageMotion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <div key={pathname} className={cn("page-enter stagger-children", className)}>
      {children}
    </div>
  );
}

export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <div key={pathname} className={cn("stagger-children", className)}>
      {children}
    </div>
  );
}
