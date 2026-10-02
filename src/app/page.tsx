"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, BadgeCheck, Banknote, Bike, Building2, Clock3, Coins, Eye, HeartHandshake,
  MapPin, PackageCheck, Percent, Radar, ShieldCheck, ShoppingBag, Smartphone, Sparkles,
  Store, Truck, Users, Zap,
} from "lucide-react";
import { Logo, ThemeToggle } from "@/components/brand/shell";
import { Button } from "@/components/ui/base";
import { cn } from "@/lib/utils";

/* --------------------------- animated counter --------------------------- */
function Counter({ to, prefix = "", suffix = "", decimals = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setVal(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref} className="num">
      {prefix}
      {val.toLocaleString("en-IN", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

/* ------------------------------- phone mock ------------------------------ */
function PhoneMock() {
  return (
    <div className="relative mx-auto w-[270px] sm:w-[300px]">
      <div className="float-y rounded-[2.4rem] border-[10px] border-zinc-900 bg-card shadow-2xl dark:border-zinc-800">
        <div className="overflow-hidden rounded-[1.7rem]">
          {/* header */}
          <div className="brand-gradient px-4 pb-8 pt-5 text-white">
            <div className="flex items-center justify-between text-[10px] font-semibold">
              <span className="flex items-center gap-1"><MapPin size={11} /> Satellite, Ahmedabad</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5">15–30 min ⚡</span>
            </div>
            <p className="mt-3 font-display text-lg font-extrabold leading-tight">Your local shops,<br />delivered fast.</p>
            <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[11px] text-zinc-500">
              <ShoppingBag size={12} className="text-brand" /> Search milk, bread, chips…
            </div>
          </div>
          {/* body */}
          <div className="-mt-4 space-y-3 rounded-t-2xl bg-card p-3">
            <div className="flex gap-2">
              {[["🏪", "Kirana"], ["🥛", "Dairy"], ["🥬", "Veggies"], ["🍿", "Snacks"]].map(([e, l]) => (
                <div key={l} className="flex flex-col items-center gap-1 rounded-xl bg-muted px-2.5 py-2">
                  <span className="text-base">{e}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground">{l}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border p-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-lg">🏪</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold">Sharma Kirana Store</p>
                <p className="text-[9px] text-muted-foreground">⭐ 4.6 · 0.4 km · 18 min</p>
              </div>
              <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[8px] font-bold text-brand">VERIFIED</span>
            </div>
            {[
              ["🥛", "Amul Taaza 500ml", "₹27", "🥔", "Potato 1kg", "₹30"],
            ].flat().length > 0 &&
              [["🥛", "Amul Taaza 500ml", "₹27"], ["🥬", "Spinach 250g", "₹20"]].map(([e, n, p], i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-2xl border p-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-lg">{e}</div>
                  <p className="flex-1 truncate text-[11px] font-semibold">{n}</p>
                  <span className="num text-[11px] font-bold">{p}</span>
                  <span className="rounded-lg brand-gradient px-2 py-1 text-[9px] font-bold text-white">ADD</span>
                </div>
              ))}
            <div className="flex items-center justify-between rounded-xl brand-gradient px-3 py-2 text-white">
              <span className="text-[10px] font-semibold">2 items · ₹54</span>
              <span className="text-[10px] font-bold">View cart →</span>
            </div>
          </div>
        </div>
      </div>
      {/* floating chips */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="absolute -left-16 top-16 hidden rounded-2xl border bg-card px-3 py-2 shadow-lg sm:block">
        <p className="flex items-center gap-1.5 text-[11px] font-bold"><Zap size={12} className="text-brand" /> Live sim engine</p>
        <p className="text-[9px] text-muted-foreground">orders flow across all 4 apps</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="absolute -right-14 top-40 hidden rounded-2xl border bg-card px-3 py-2 shadow-lg sm:block">
        <p className="flex items-center gap-1.5 text-[11px] font-bold"><Coins size={12} className="text-amber-500" /> +6 NearCoins</p>
        <p className="text-[9px] text-muted-foreground">loyalty on every order</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="absolute -left-10 bottom-24 hidden rounded-2xl border bg-card px-3 py-2 shadow-lg sm:block">
        <p className="flex items-center gap-1.5 text-[11px] font-bold"><BadgeCheck size={12} className="text-brand" /> Verified shop</p>
        <p className="text-[9px] text-muted-foreground">FSSAI · GST · KYC checked</p>
      </motion.div>
    </div>
  );
}

/* --------------------------------- page --------------------------------- */
const MODULES = [
  { emoji: "🛍️", title: "Customer App", body: "Discover verified nearby shops, search real local inventory, track your order live, and earn NearCoins on every order.", href: "/customer", cta: "Try Customer App" },
  { emoji: "🏪", title: "Shop Dashboard", body: "A digital storefront with automatic stock sync, order timers, offers, payouts and a clean ledger — built for non-technical shopkeepers.", href: "/shop", cta: "Open Shop Dashboard" },
  { emoji: "🛵", title: "Rider App", body: "Clear job cards with distance & payout upfront, OTP-verified pickups, photo proof of delivery, and transparent daily earnings.", href: "/rider", cta: "Open Rider App" },
  { emoji: "🛡️", title: "Admin Console", body: "Verification queues, live order monitoring, dispute centre with liability rules, and real-time business intelligence.", href: "/admin", cta: "Open Admin Console" },
];

const STEPS = [
  { n: "01", title: "Discover", body: "Customer opens NearKart and sees verified shops within their neighbourhood — ranked by distance, rating and speed.", emoji: "📍" },
  { n: "02", title: "Order", body: "Real shop inventory with live stock counts. Minimum ₹100 basket keeps delivery economics healthy.", emoji: "🛒" },
  { n: "03", title: "Pack", body: "Shop accepts within a 2-minute timer; stock auto-deducts, so menus never oversell.", emoji: "📦" },
  { n: "04", title: "Deliver", body: "Nearest-match rider picks up with OTP handover and delivers in 15–30 minutes with photo proof.", emoji: "🛵" },
];

const PHASES = [
  { phase: "Phase 1", when: "0–3 months", title: "Win one micro-market", body: "10–20 shops in Satellite, Ahmedabad. 30–50 orders/day. Perfect the pack-and-pickup loop.", done: true },
  { phase: "Phase 2", when: "3–9 months", title: "Density & retention", body: "Adjacent localities, 300–1,000 orders/day, subscriptions, referrals and sponsored listings.", done: false },
  { phase: "Phase 3", when: "9–24 months", title: "City replication", body: "The locality playbook across Ahmedabad and Gujarat. Contribution-margin positive orders.", done: false },
  { phase: "Phase 4", when: "24+ months", title: "Local commerce OS", body: "Shop SaaS, payments, ads, credit and demand forecasting — the operating system for neighbourhood retail.", done: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* nav */}
      <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-lg">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/"><Logo /></Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#modules" className="transition-colors hover:text-foreground">For Shops</a>
            <a href="#modules" className="transition-colors hover:text-foreground">For Riders</a>
            <a href="#investors" className="transition-colors hover:text-foreground">Investors</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/customer"><Button size="sm">Launch Demo <ArrowRight size={15} /></Button></Link>
          </div>
        </nav>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
              <Sparkles size={13} /> The anti-dark-store quick-commerce network
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
              Your local shops,<br />
              <span className="text-gradient">delivered fast.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              NearKart turns neighbourhood stores into micro-fulfilment centres. Blinkit-speed delivery,
              kirana-depth inventory, <strong className="text-foreground">zero warehouses</strong> — a win for customers,
              shop owners and riders.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/customer"><Button size="lg">🛍️ Try Customer App</Button></Link>
              <Link href="/shop"><Button size="lg" variant="outline">🏪 Shop Dashboard</Button></Link>
              <Link href="/rider"><Button size="lg" variant="outline">🛵 Rider App</Button></Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Pilot: Satellite, Ahmedabad · Minimum order ₹100 · Free delivery above ₹299
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }}>
            <PhoneMock />
          </motion.div>
        </div>

        {/* metric strip */}
        <div className="border-y bg-card">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-6">
            {[
              { icon: Banknote, label: "Target AOV", value: 250, prefix: "₹" },
              { icon: Percent, label: "Commission", value: 7, suffix: "%" },
              { icon: Clock3, label: "Delivery", value: 30, suffix: " min" },
              { icon: Store, label: "Pilot shops", value: 20, suffix: "+" },
              { icon: PackageCheck, label: "Orders/day", value: 50, suffix: "+" },
              { icon: Users, label: "Riders", value: 15, suffix: "+" },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><m.icon size={18} /></div>
                <div>
                  <p className="font-display text-xl font-extrabold"><Counter to={m.value} prefix={m.prefix} suffix={m.suffix} /></p>
                  <p className="text-[11px] font-medium text-muted-foreground">{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* problem */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Dark stores rent your neighbourhood.<br className="hidden sm:block" /> <span className="text-gradient">NearKart lives in it.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Quick-commerce giants spend crores on warehouses that stock 2,000 SKUs. Your kirana next door stocks more —
            it just never had an engine. Until now.
          </p>
        </motion.div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: Building2, title: "Warehouses are capped", body: "Dark stores carry limited SKUs and burn capital on real estate. Expansion into Tier-2 India is slow and expensive.", tone: "danger" },
            { icon: Store, title: "Local shops are invisible", body: "91% of India's grocery still runs through neighbourhood retail — with no online storefront and shrinking footfall.", tone: "accent" },
            { icon: Radar, title: "NearKart connects them", body: "Existing shops become fulfilment nodes. Wider inventory, trusted owners, asset-light growth locality by locality.", tone: "brand" },
          ].map((c, i) => (
            <motion.div key={c.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }} className={cn("card-surface p-6", c.tone === "brand" && "border-brand/40 ring-1 ring-brand/20")}>
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", c.tone === "danger" && "bg-danger-soft text-danger", c.tone === "accent" && "bg-accent-soft text-accent", c.tone === "brand" && "brand-gradient text-white")}>
                <c.icon size={20} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="border-y bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <motion.div {...fadeUp}>
            <p className="text-xs font-bold uppercase tracking-widest text-brand">The flywheel</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Four steps. One loop. Compounding density.</h2>
          </motion.div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <motion.div key={s.n} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="relative rounded-2xl border bg-background p-5">
                <span className="num absolute right-4 top-3 font-display text-4xl font-extrabold text-muted-foreground/15">{s.n}</span>
                <div className="text-3xl">{s.emoji}</div>
                <h3 className="mt-3 font-display font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* modules */}
      <section id="modules" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">One platform, four experiences</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Every side of the marketplace, fully working</h2>
          <p className="mt-3 text-muted-foreground">Open two modules in separate tabs — orders placed by a customer appear in the shop dashboard in real time.</p>
        </motion.div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {MODULES.map((m, i) => (
            <motion.div key={m.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }}>
              <Link href={m.href} className="group block h-full card-surface p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-1 hover:ring-brand/30">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{m.emoji}</span>
                  <ArrowRight size={18} className="text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-brand" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
                <p className="mt-4 text-sm font-bold text-brand">{m.cta} →</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* business model */}
      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <motion.div {...fadeUp}>
            <p className="text-xs font-bold uppercase tracking-widest text-brand">Business model</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Six revenue streams, one order</h2>
            <div className="mt-6 space-y-3">
              {[
                { icon: Percent, t: "Shop commission", d: "7% of item value on completed orders" },
                { icon: Truck, t: "Delivery fee", d: "₹25/order, free above ₹299 — drives basket growth" },
                { icon: Store, t: "Shop subscriptions", d: "₹299–₹999/mo for analytics & priority placement (Phase 2)" },
                { icon: Eye, t: "Sponsored listings", d: "Shops & brands bid for discovery placement" },
                { icon: Smartphone, t: "White-label storefronts", d: "Shops run their own WhatsApp commerce on NearKart rails" },
                { icon: Coins, t: "Data & insights", d: "Demand forecasting and inventory intelligence for FMCG partners" },
              ].map((r) => (
                <div key={r.t} className="flex items-start gap-3 rounded-xl border bg-background p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand"><r.icon size={16} /></div>
                  <div>
                    <p className="text-sm font-bold">{r.t}</p>
                    <p className="text-xs text-muted-foreground">{r.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
            <div className="card-surface p-6">
              <h3 className="font-display text-lg font-bold">Unit economics per order</h3>
              <p className="mt-1 text-xs text-muted-foreground">Representative ₹250 basket</p>
              <div className="mt-5 space-y-3 text-sm">
                {[
                  ["Item total", "₹250", "text-foreground"],
                  ["Delivery fee", "+ ₹25", "text-foreground"],
                  ["Shop commission (7%)", "+ ₹17.5", "text-brand font-semibold"],
                  ["Rider payout", "− ₹28", "text-danger"],
                  ["Payment + ops", "− ₹6", "text-danger"],
                ].map(([l, v, cls]) => (
                  <div key={l} className="flex items-center justify-between border-b border-dashed pb-2">
                    <span className="text-muted-foreground">{l}</span>
                    <span className={cn("num font-semibold", cls)}>{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-xl bg-brand-soft px-4 py-3">
                  <span className="font-bold">Platform contribution</span>
                  <span className="num font-display text-xl font-extrabold text-brand">₹8.5+</span>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Healthy at ₹250 AOV today; scales with basket size, ad revenue and rider batching. Full ledger visible in the Shop → Payouts module.
              </p>
              <Link href="/shop/payouts"><Button variant="secondary" size="sm" className="mt-4">View payout ledger <ArrowRight size={14} /></Button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* trust */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Trust is the product</h2>
          <p className="mt-3 text-muted-foreground">Every order is protected by layered verification — for customers, shops and riders alike.</p>
        </motion.div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: BadgeCheck, t: "Verified Local Shops", d: "PAN, GSTIN, FSSAI and bank details checked by the operations team before going live." },
            { icon: ShieldCheck, t: "OTP + photo proof", d: "Pickup and delivery OTPs with photo evidence kill false non-delivery claims on both sides." },
            { icon: PackageCheck, t: "Auto out-of-stock", d: "Stock syncs on every accepted order. Sold-out items vanish from search instantly." },
            { icon: HeartHandshake, t: "Fast dispute resolution", d: "Clear liability matrix — shops own product issues, riders own proven mishandling, platform covers goodwill." },
            { icon: Bike, t: "Rider-first design", d: "Earnings shown before accepting a job, 100% tip pass-through, weekly + instant payouts." },
            { icon: Zap, t: "Honest 15–30 minutes", d: "Dynamic ETA from prep time, travel and rider supply — no fake 8-minute promises." },
          ].map((f, i) => (
            <motion.div key={f.t} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} className="card-surface p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><f.icon size={18} /></div>
              <h3 className="mt-3 font-display font-bold">{f.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* investors / roadmap */}
      <section id="investors" className="border-t bg-gradient-to-b from-brand-softer to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-brand">Unicorn pathway</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Delivery is the wedge. The OS is the moat.</h2>
          </motion.div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {PHASES.map((p, i) => (
              <motion.div key={p.phase} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="relative">
                {i < 3 && <div className="absolute left-full top-6 hidden h-px w-6 bg-brand/40 md:block" />}
                <div className={cn("card-surface h-full p-5", p.done && "border-brand/40 ring-1 ring-brand/20")}>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-brand">{p.phase}</span>
                    {p.done && <BadgeCheck size={16} className="text-brand" />}
                  </div>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{p.when}</p>
                  <h3 className="mt-1 font-display font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeUp} className="card-surface mx-auto mt-12 max-w-3xl p-8 text-center">
            <h3 className="font-display text-2xl font-extrabold">The end state isn&apos;t a delivery app.</h3>
            <p className="mt-2 text-muted-foreground">
              It&apos;s the <strong className="text-foreground">operating system for neighbourhood commerce</strong> — payments, inventory,
              credit, ads and analytics running through local shops across a million Indian streets.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/customer"><Button size="lg">Launch the demo <ArrowRight size={16} /></Button></Link>
              <Link href="/admin"><Button size="lg" variant="outline">See the numbers 📊</Button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <Logo />
              <p className="mt-2 max-w-sm text-xs text-muted-foreground">
                NearKart · hyperlocal commerce network · Pilot: Satellite, Ahmedabad, Gujarat.
                Investor demo — all data simulated, no real payments or live orders.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
              <Link href="/customer" className="hover:text-brand">Customer</Link>
              <Link href="/shop" className="hover:text-brand">Shop</Link>
              <Link href="/rider" className="hover:text-brand">Rider</Link>
              <Link href="/admin" className="hover:text-brand">Admin</Link>
              <span>© 2026 NearKart (demo)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
