"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react";
import { useApp } from "@/store/useApp";
import { cn } from "@/lib/utils";

const icons = { success: CheckCircle2, info: Info, warn: TriangleAlert, error: XCircle };
const tones = {
  success: "text-brand border-l-brand",
  info: "text-info border-l-info",
  warn: "text-accent border-l-accent",
  error: "text-danger border-l-danger",
};

export function Toaster() {
  const toasts = useApp((s) => s.toasts);
  const dismiss = useApp((s) => s.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) => setTimeout(() => dismiss(t.id), 3400));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-200 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.kind];
          return (
            <motion.button
              key={t.id}
              onClick={() => dismiss(t.id)}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={cn("pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-l-4 bg-card p-3.5 text-left shadow-lg", tones[t.kind])}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{t.title}</span>
                {t.body && <span className="block text-xs text-muted-foreground">{t.body}</span>}
              </span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
