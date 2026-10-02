"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={cn(
              "relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-3xl",
              wide ? "sm:max-w-2xl" : "sm:max-w-md",
            )}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted sm:hidden" />
            {title && (
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-bold">{title}</h3>
                <button onClick={onClose} aria-label="Close dialog" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted">
                  <X size={16} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Sheet({ open, onClose, title, children, side = "right" }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; side?: "right" | "bottom" }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-100" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={side === "right" ? { x: 60, opacity: 0 } : { y: 80, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={side === "right" ? { x: 60, opacity: 0 } : { y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className={cn(
              "absolute bg-card shadow-2xl",
              side === "right" ? "right-0 top-0 h-full w-full max-w-md overflow-y-auto p-5" : "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl p-5",
            )}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted">
                <X size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Tabs({ tabs, active, onChange, className }: { tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void; className?: string }) {
  return (
    <div className={cn("scrollbar-hide flex gap-1 overflow-x-auto rounded-xl bg-muted p-1", className)} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "relative shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
            active === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
          {typeof t.count === "number" && t.count > 0 && (
            <span className="num ml-1.5 rounded-full bg-brand-soft px-1.5 text-[10px] font-bold text-brand">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function TRow({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("border-b border-border/70 last:border-0 hover:bg-muted/40 transition-colors", className)}>{children}</tr>;
}

export function TH({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn("px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground", className)}>{children}</th>;
}

export function TD({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("px-3 py-2.5 text-sm", className)}>{children}</td>;
}
