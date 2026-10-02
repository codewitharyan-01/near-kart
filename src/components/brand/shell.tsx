"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Moon, Repeat, Sun, Trash2, Zap, ZapOff } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Button } from "@/components/ui/base";
import { Dialog } from "@/components/ui/overlays";
import { timeAgo } from "@/lib/utils";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

/* --------------------------------- Logo --------------------------------- */
export function Logo({ size = 36, withWordmark = true, className }: { size?: number; withWordmark?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
        <defs>
          <linearGradient id="nk-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#10b981" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#nk-g)" />
        <path d="M20 7.5c-4.8 0-8.7 3.8-8.7 8.4 0 6.1 7.5 13.4 8.2 14.1.3.3.7.3 1 0 .7-.7 8.2-8 8.2-14.1 0-4.6-3.9-8.4-8.7-8.4Z" fill="#fff" />
        <path d="M21.8 12.2 15.6 19.6h3.6l-1.1 6.2 6.4-8h-3.8l1.1-5.6Z" fill="#059669" />
      </svg>
      {withWordmark && (
        <span className="font-display text-xl font-extrabold tracking-tight">
          Near<span className="text-brand">Kart</span>
        </span>
      )}
    </span>
  );
}

/* ------------------------------ Theme toggle ---------------------------- */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="h-9 w-9" />;
  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle dark mode"
      className="flex h-9 w-9 items-center justify-center rounded-xl border bg-card transition-colors hover:bg-muted"
    >
      {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

/* ------------------------------ Demo banner ----------------------------- */
export function DemoBanner() {
  const simAuto = useApp((s) => s.simAuto);
  const setSimAuto = useApp((s) => s.setSimAuto);
  const resetDemo = useApp((s) => s.resetDemo);
  return (
    <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 px-3 py-1.5 text-center text-[11px] font-medium text-white/95 sm:text-xs">
      <span className="hidden sm:inline">🎬</span>
      <span>Investor Demo — no real payments or live orders. Data is simulated &amp; stored locally.</span>
      <button onClick={() => setSimAuto(!simAuto)} className="ml-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 font-semibold transition hover:bg-white/25" title="Toggle live order simulation">
        {simAuto ? <Zap size={11} /> : <ZapOff size={11} />}
        {simAuto ? "Live sim ON" : "Live sim OFF"}
      </button>
      <button onClick={resetDemo} className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 font-semibold transition hover:bg-white/25" title="Reset all demo data">
        <Trash2 size={11} /> Reset
      </button>
    </div>
  );
}

/* ---------------------------- Notifications ----------------------------- */
export function NotificationsBell() {
  const notifications = useApp((s) => s.notifications);
  const markRead = useApp((s) => s.markNotificationsRead);
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <>
      <button onClick={() => { setOpen(true); markRead(); }} aria-label={`Notifications (${unread} unread)`} className="relative flex h-9 w-9 items-center justify-center rounded-xl border bg-card transition-colors hover:bg-muted">
        <Bell size={16} />
        {unread > 0 && (
          <span className="num absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Activity feed">
        {notifications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No activity yet. Place an order to see live events.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.slice(0, 15).map((n) => (
              <li key={n.id} className={cn("rounded-xl border p-3", n.read ? "opacity-60" : "")}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(n.at)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Dialog>
    </>
  );
}

/* ------------------------------ Role switcher --------------------------- */
const ROLE_LABELS: Record<Role, { label: string; emoji: string; href: string }> = {
  customer: { label: "Customer App", emoji: "🛍️", href: "/customer" },
  shop: { label: "Shop Dashboard", emoji: "🏪", href: "/shop" },
  rider: { label: "Rider App", emoji: "🛵", href: "/rider" },
  admin: { label: "Admin Console", emoji: "🛡️", href: "/admin" },
};

export function RoleSwitcher() {
  const role = useApp((s) => s.role);
  const setRole = useApp((s) => s.setRole);
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname === "/") return null;
  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-90 flex items-center gap-2 rounded-full border bg-card/90 py-2 pl-3 pr-4 text-xs font-bold shadow-lg backdrop-blur transition hover:shadow-xl"
        aria-label="Switch role"
      >
        <Repeat size={14} className="text-brand" />
        <span className="hidden sm:inline">Switch role ·</span> {ROLE_LABELS[role].label}
      </motion.button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Jump to a module">
        <p className="mb-3 text-xs text-muted-foreground">One platform, four experiences. Every module shares the same live order engine.</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setOpen(false); router.push(ROLE_LABELS[r].href); }}
              className={cn("flex flex-col items-center gap-1.5 rounded-2xl border p-4 transition-all hover:border-brand hover:shadow-md", role === r && "border-brand bg-brand-soft")}
            >
              <span className="text-2xl">{ROLE_LABELS[r].emoji}</span>
              <span className="text-xs font-bold">{ROLE_LABELS[r].label}</span>
              {role === r && <span className="text-[10px] font-semibold text-brand">You are here</span>}
            </button>
          ))}
        </div>
      </Dialog>
    </>
  );
}

/* -------------------------------- Sim engine ---------------------------- */
export function SimEngine() {
  const simTick = useApp((s) => s.simTick);
  useEffect(() => {
    const id = setInterval(() => simTick(), 2000);
    return () => clearInterval(id);
  }, [simTick]);
  return null;
}

/* ---------------------------- Cross-tab sync ---------------------------- */
export function SyncBridge() {
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "nearkart-v1" && e.newValue) {
        useApp.persist.rehydrate();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}

/* ------------------------------ Hydration gate -------------------------- */
export function AppReady({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <Logo size={56} withWordmark={false} />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm font-medium text-muted-foreground">
          Loading your neighbourhood…
        </motion.p>
      </div>
    );
  }
  return <>{children}</>;
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-brand">
      ← {children}
    </Link>
  );
}

export { Button };
