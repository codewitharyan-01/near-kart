"use client";

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------- Button ------------------------------- */
type BtnVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent";
type BtnSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm";

const btnVariants: Record<BtnVariant, string> = {
  primary: "brand-gradient text-white shadow-sm hover:shadow-md hover:brightness-105 active:brightness-95",
  secondary: "bg-muted text-foreground hover:bg-muted/70",
  outline: "border bg-card hover:bg-muted/60",
  ghost: "hover:bg-muted/70",
  danger: "bg-danger text-white hover:brightness-110",
  accent: "bg-accent text-black hover:brightness-105",
};
const btnSizes: Record<BtnSize, string> = {
  xs: "h-7 px-2.5 text-xs rounded-lg gap-1",
  sm: "h-9 px-3.5 text-sm rounded-xl gap-1.5",
  md: "h-11 px-5 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-2xl gap-2",
  icon: "h-10 w-10 rounded-xl justify-center",
  "icon-sm": "h-8 w-8 rounded-lg justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize; loading?: boolean }>(
  function Button({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center font-semibold transition-all duration-150 select-none",
          "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          btnVariants[variant],
          btnSizes[size],
          className,
        )}
        {...props}
      >
        {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
        {children}
      </button>
    );
  },
);

/* ------------------------------- Inputs ------------------------------- */
const fieldCls =
  "w-full rounded-xl border bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:outline-2 focus:outline-ring focus:outline-offset-0 disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(fieldCls, "h-11", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(fieldCls, "py-2.5 min-h-20", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(fieldCls, "h-11 appearance-none bg-[length:16px] pr-9", className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
      {...props}
    >
      {children}
    </select>
  );
});

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

/* ------------------------------- Switch ------------------------------- */
export function Switch({ checked, onChange, label, size = "md" }: { checked: boolean; onChange: (v: boolean) => void; label?: string; size?: "sm" | "md" }) {
  const w = size === "sm" ? "w-9 h-5" : "w-11 h-6";
  const k = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const t = size === "sm" ? (checked ? "translate-x-4" : "translate-x-0.5") : checked ? "translate-x-5" : "translate-x-0.5";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? "toggle"}
      onClick={() => onChange(!checked)}
      className={cn("relative inline-flex shrink-0 items-center rounded-full transition-colors", w, checked ? "bg-brand" : "bg-muted-foreground/30")}
    >
      <span className={cn("inline-block transform rounded-full bg-white shadow transition-transform", k, t)} />
    </button>
  );
}

/* ------------------------------- Badge -------------------------------- */
type BadgeTone = "brand" | "accent" | "danger" | "info" | "neutral" | "outline" | "success";
const badgeTones: Record<BadgeTone, string> = {
  brand: "bg-brand-soft text-brand",
  accent: "bg-accent-soft text-accent",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  success: "bg-brand text-white",
  neutral: "bg-muted text-muted-foreground",
  outline: "border text-muted-foreground",
};
export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap", badgeTones[tone], className)}>
      {children}
    </span>
  );
}

export function Chip({ active, onClick, children, className }: { active?: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all",
        active ? "border-brand bg-brand-soft text-brand" : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------ Progress ------------------------------ */
export function Progress({ value, tone = "brand", className }: { value: number; tone?: "brand" | "accent" | "danger"; className?: string }) {
  const bg = tone === "brand" ? "bg-brand" : tone === "accent" ? "bg-accent" : "bg-danger";
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <motion.div className={cn("h-full rounded-full", bg)} initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, value))}%` }} transition={{ type: "spring", stiffness: 80, damping: 20 }} />
    </div>
  );
}

/* ------------------------------ Skeleton ------------------------------ */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-xl bg-muted", className)} />;
}

/* ------------------------------- Avatar ------------------------------- */
export function Avatar({ emoji, gradient = "from-emerald-500 to-teal-700", size = "md", className }: { emoji: string; gradient?: string; size?: "xs" | "sm" | "md" | "lg" | "xl"; className?: string }) {
  const sizes = { xs: "h-7 w-7 text-sm rounded-lg", sm: "h-9 w-9 text-base rounded-lg", md: "h-12 w-12 text-2xl rounded-xl", lg: "h-16 w-16 text-3xl rounded-2xl", xl: "h-20 w-20 text-4xl rounded-2xl" };
  return (
    <div className={cn("flex items-center justify-center bg-gradient-to-br shadow-sm", gradient, sizes[size], className)}>
      <span className="drop-shadow-sm">{emoji}</span>
    </div>
  );
}

/* ----------------------------- QtyStepper ----------------------------- */
export function Stepper({ qty, onChange, max = 99, small }: { qty: number; onChange: (q: number) => void; max?: number; small?: boolean }) {
  const btn = cn("flex items-center justify-center rounded-lg bg-brand text-white hover:brightness-110 active:scale-95 transition", small ? "h-7 w-7" : "h-8 w-8");
  return qty === 0 ? (
    <Button size={small ? "xs" : "sm"} onClick={() => onChange(1)} disabled={max === 0}>Add</Button>
  ) : (
    <div className={cn("flex items-center gap-1 brand-gradient rounded-lg p-0.5", small && "text-sm")}>
      <button aria-label="decrease" className={btn} onClick={() => onChange(qty - 1)}><Minus size={14} /></button>
      <span className="num min-w-6 text-center text-sm font-bold text-white">{qty}</span>
      <button aria-label="increase" className={btn} onClick={() => onChange(Math.min(max, qty + 1))} disabled={qty >= max}><Plus size={14} /></button>
    </div>
  );
}

/* ------------------------------ Stars --------------------------------- */
export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"} />
      ))}
    </span>
  );
}

/* ----------------------------- StatCard ------------------------------- */
export function StatCard({ label, value, sub, icon, tone = "brand" }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode; tone?: "brand" | "accent" | "danger" | "info" }) {
  const tones = { brand: "text-brand bg-brand-soft", accent: "text-accent bg-accent-soft", danger: "text-danger bg-danger-soft", info: "text-info bg-info-soft" };
  return (
    <div className="card-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="num mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {sub && <p className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
        {icon && <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tones[tone])}>{icon}</div>}
      </div>
    </div>
  );
}

/* ----------------------------- EmptyState ----------------------------- */
export function EmptyState({ emoji, title, body, action }: { emoji: string; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center">
      <div className="float-y text-5xl">{emoji}</div>
      <p className="mt-4 font-display text-lg font-bold">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">{title}</h2>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
