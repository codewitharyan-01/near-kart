"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, Crosshair, MapPin, Moon, Repeat, Sun, Trash2, Zap, ZapOff } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Button } from "@/components/ui/base";
import { Dialog } from "@/components/ui/overlays";
import { SmartImage } from "@/components/ui/smart-image";
import { AREAS } from "@/data/areas";
import { shopImage } from "@/lib/images";
import { timeAgo, cn } from "@/lib/utils";
import type { Role } from "@/types";

/* --------------------------------- Logo --------------------------------- */
export function Logo({ size = 34, withWordmark = true, className }: { size?: number; withWordmark?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
        <rect width="40" height="40" rx="10" fill="#171812" />
        <path d="M20 8.5c-4.3 0-7.8 3.4-7.8 7.6 0 5.5 6.8 12.1 7.4 12.7.2.3.6.3.8 0 .6-.6 7.4-7.2 7.4-12.7 0-4.2-3.5-7.6-7.8-7.6Z" fill="#fff" />
        <path d="M21.6 13 16.2 19.4h3.2l-1 5.6 5.8-7.2h-3.4l.8-4.8Z" fill="#171812" />
      </svg>
      {withWordmark && (
        <span className="text-[19px] font-bold tracking-tight">
          NearKart
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
      className="flex h-9 w-9 items-center justify-center rounded-full border bg-card transition-colors hover:bg-muted"
    >
      {resolvedTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

/* ------------------------------ Demo banner ----------------------------- */
export function DemoBanner() {
  const simAuto = useApp((s) => s.simAuto);
  const setSimAuto = useApp((s) => s.setSimAuto);
  const resetDemo = useApp((s) => s.resetDemo);
  return (
    <div className="flex items-center justify-center gap-2 bg-[#171812] px-3 py-1.5 text-center text-[11px] font-medium text-white/80 sm:text-xs">
      <span>Investor demo — no real payments or live orders. Data is simulated &amp; stored locally.</span>
      <span className="ml-1 flex shrink-0 items-center gap-1">
        <button onClick={() => setSimAuto(!simAuto)} className="inline-flex items-center gap-1 rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-semibold text-white transition hover:bg-white/10" title="Toggle live order simulation">
          {simAuto ? <Zap size={10} /> : <ZapOff size={10} />}
          {simAuto ? "Sim on" : "Sim off"}
        </button>
        <button onClick={resetDemo} className="inline-flex items-center gap-1 rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-semibold text-white transition hover:bg-white/10" title="Reset all demo data">
          <Trash2 size={10} /> Reset
        </button>
      </span>
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
      <button onClick={() => { setOpen(true); markRead(); }} aria-label={`Notifications (${unread} unread)`} className="relative flex h-9 w-9 items-center justify-center rounded-full border bg-card transition-colors hover:bg-muted">
        <Bell size={15} />
        {unread > 0 && (
          <span className="num absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Activity">
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-4 z-90 flex items-center gap-2 rounded-full border bg-card/95 py-2 pl-3 pr-4 text-xs font-semibold shadow-lg backdrop-blur transition hover:shadow-xl"
        aria-label="Switch role"
      >
        <Repeat size={13} className="text-brand" />
        <span className="hidden sm:inline">Switch role ·</span> {ROLE_LABELS[role].label}
      </motion.button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Jump to a module">
        <p className="mb-3 text-xs text-muted-foreground">One platform, four experiences. Every module shares the same live order engine.</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setOpen(false); router.push(ROLE_LABELS[r].href); }}
              className={cn("flex flex-col items-center gap-1.5 rounded-2xl border p-4 transition-all hover:border-foreground hover:shadow-md", role === r && "border-foreground")}
            >
              <span className="text-2xl">{ROLE_LABELS[r].emoji}</span>
              <span className="text-xs font-bold">{ROLE_LABELS[r].label}</span>
              {role === r && <span className="flex items-center gap-0.5 text-[10px] font-semibold text-brand"><Check size={10} /> here</span>}
            </button>
          ))}
        </div>
      </Dialog>
    </>
  );
}

/* ---------------------------- Location gate ----------------------------- */
/** Every module opens with a location permission step — customers pick an area,
 *  ops modules confirm the pilot zone. */
export function LocationGate({ role }: { role: Role }) {
  const locationAsked = useApp((s) => s.locationAsked);
  const setLocationAsked = useApp((s) => s.setLocationAsked);
  const setArea = useApp((s) => s.setArea);
  const areaId = useApp((s) => s.areaId);
  const [picking, setPicking] = useState(false);
  if (locationAsked) return null;

  const copy: Record<Role, { title: string; body: string }> = {
    customer: { title: "Shops near you, in 15–30 minutes", body: "NearKart uses your location to find verified neighbourhood stores and show honest delivery ETAs." },
    shop: { title: "Confirm your store's delivery zone", body: "We use location to route nearby customer orders to your counter and keep the 15–30 minute promise." },
    rider: { title: "Set your pickup zone", body: "Location keeps job assignments tight — shorter rides, faster drops, better ratings." },
    admin: { title: "Scope the console to your cluster", body: "Location filters live orders, alerts and forecasts to the micro-markets you operate." },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-120 flex items-center justify-center bg-background/98 p-5 backdrop-blur"
      >
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="w-full max-w-sm text-center">
          <div className="relative mx-auto h-40 w-40">
            <div className="absolute inset-0 animate-ping rounded-full bg-brand/10 [animation-duration:2.2s]" />
            <div className="absolute inset-0 overflow-hidden rounded-full border-4 border-background shadow-lift">
              <SmartImage src={shopImage({ id: "sharma", type: "" })} alt="Neighbourhood store" className="h-full w-full" seed="gate" />
            </div>
            <span className="absolute bottom-0 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full btn-ink shadow-lg">
              <Crosshair size={16} className="text-white" />
            </span>
          </div>
          <h1 className="mt-8 text-2xl font-bold tracking-tight">{copy[role].title}</h1>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{copy[role].body}</p>
          <div className="mt-7 space-y-2.5">
            <Button
              size="lg"
              className="w-full"
              onClick={() => setLocationAsked(true)}
            >
              <Crosshair size={16} /> Allow location access
            </Button>
            <Button size="lg" variant="outline" className="w-full" onClick={() => setPicking(true)}>
              <MapPin size={16} /> Choose area manually
            </Button>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">Demo build — permission is simulated, no GPS is read.</p>
        </motion.div>

        <Dialog open={picking} onClose={() => setPicking(false)} title="Choose your area">
          <div className="space-y-1.5">
            {AREAS.map((a) => (
              <button
                key={a.id}
                onClick={() => { setArea(a.id); setLocationAsked(true); setPicking(false); }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition",
                  areaId === a.id ? "border-foreground" : "hover:border-foreground/40",
                )}
              >
                <span>
                  <span className="block text-sm font-bold">{a.name}</span>
                  <span className="block text-xs text-muted-foreground">{a.city} · pilot zone</span>
                </span>
                {areaId === a.id && <Check size={16} className="text-brand" />}
              </button>
            ))}
          </div>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
}

/* --------------------------- Change location sheet ---------------------- */
export function ChangeLocationButton({ compact }: { compact?: boolean }) {
  const areaId = useApp((s) => s.areaId);
  const setArea = useApp((s) => s.setArea);
  const setLocationAsked = useApp((s) => s.setLocationAsked);
  const customer = useApp((s) => s.customer);
  const [open, setOpen] = useState(false);
  const area = AREAS.find((a) => a.id === areaId);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-bold transition hover:border-foreground/40",
          compact && "px-2.5",
        )}
        aria-label="Change delivery location"
      >
        <MapPin size={13} className="text-brand" />
        {area?.name}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Deliver to">
        <div className="space-y-4">
          <button
            onClick={() => { setLocationAsked(false); setOpen(false); }}
            className="flex w-full items-center gap-3 rounded-xl border border-dashed p-3.5 text-left transition hover:border-brand"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand"><Crosshair size={15} /></span>
            <span>
              <span className="block text-sm font-bold">Use my current location</span>
              <span className="block text-xs text-muted-foreground">Re-run the location permission step</span>
            </span>
          </button>
          {customer.addresses.map((a) => (
            <div key={a.id} className="rounded-xl border p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{a.label}</p>
                {a.area === area?.name && <span className="flex items-center gap-1 text-[11px] font-semibold text-brand"><Check size={11} /> current</span>}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{a.line1}, {a.area} — {a.pincode}</p>
              {a.area !== area?.name && (
                <Button
                  size="xs"
                  variant="outline"
                  className="mt-2"
                  onClick={() => { const m = AREAS.find((x) => x.name === a.area); if (m) setArea(m.id); setOpen(false); }}
                >
                  Deliver here
                </Button>
              )}
            </div>
          ))}
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pilot areas</p>
            <div className="flex flex-wrap gap-1.5">
              {AREAS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => { setArea(a.id); setOpen(false); }}
                  className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition", areaId === a.id ? "border-foreground bg-foreground text-background" : "hover:border-foreground/40")}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
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
        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <Logo size={52} withWordmark={false} />
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
