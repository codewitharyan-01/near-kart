"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, BadgeCheck, Banknote, Clock3, Eye, MapPin, PackageCheck,
  Percent, ShieldCheck, ShoppingBag, Store, Truck, Users,
} from "lucide-react";
import { Logo } from "@/components/brand/shell";
import { Button } from "@/components/ui/base";
import { SmartImage } from "@/components/ui/smart-image";
import { heroCollage } from "@/lib/images";
import { cn } from "@/lib/utils";

function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
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
      {prefix}{val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}{suffix}
    </span>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

function HeroCollage() {
  const c = heroCollage();
  return (
    <div className="relative mx-auto grid w-full max-w-md grid-cols-5 grid-rows-6 gap-3 sm:max-w-lg" aria-hidden>
      <div className="col-span-3 row-span-4 overflow-hidden rounded-3xl">
        <SmartImage src={c.milk} alt="Fresh dairy" className="h-full w-full" seed="h1" />
      </div>
      <div className="col-span-2 row-span-3 overflow-hidden rounded-3xl">
        <SmartImage src={c.veggies} alt="Fresh vegetables" className="h-full w-full" seed="h2" />
      </div>
      <div className="col-span-2 row-span-3 overflow-hidden rounded-3xl">
        <SmartImage src={c.fruits} alt="Fresh fruits" className="h-full w-full" seed="h3" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="col-span-5 row-span-2 flex items-center justify-between rounded-3xl border bg-card p-4 shadow-lift"
      >
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 overflow-hidden rounded-2xl">
            <SmartImage src={c.storefront} alt="Sharma Kirana" className="h-full w-full" seed="h4" />
          </div>
          <div>
            <p className="flex items-center gap-1 text-sm font-bold">Sharma Kirana Store <BadgeCheck size={13} className="text-brand" /></p>
            <p className="text-xs text-muted-foreground">0.3 km · Open · <span className="font-semibold text-brand">15–30 min</span></p>
          </div>
        </div>
        <span className="hidden rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold text-brand sm:inline">23 orders today</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.75 }}
        className="absolute -right-3 top-8 hidden items-center gap-2 rounded-2xl border bg-card px-3.5 py-2.5 shadow-lift sm:flex"
      >
        <Truck size={15} className="text-brand" />
        <div className="text-left">
          <p className="text-xs font-bold leading-none">Live order engine</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">4 apps · one network</p>
        </div>
      </motion.div>
    </div>
  );
}

const MODULES = [
  { img: "photo-1542838132-92c53300491e", title: "Customer App", body: "Search real neighbourhood inventory, order from the fastest shop, track live, earn NearCoins.", href: "/customer", cta: "Try Customer App" },
  { img: "photo-1591085686350-798c0f9faa7f", title: "Shop Dashboard", body: "A digital storefront with auto stock sync, order timers, offers and a transparent payout ledger.", href: "/shop", cta: "Open Shop Dashboard" },
  { img: "photo-1526367790999-0150786686a2", title: "Rider App", body: "Job cards with payout upfront, OTP-verified pickups, photo proof, instant earnings.", href: "/rider", cta: "Open Rider App" },
  { img: "photo-1551288049-bebda4e38f71", title: "Admin Console", body: "Verification queues, live monitoring, dispute centre and business intelligence.", href: "/admin", cta: "Open Admin Console" },
];

const STEPS = [
  { n: "01", title: "Discover", body: "Verified shops around you, ranked by distance, rating and speed." },
  { n: "02", title: "Order", body: "Real inventory with live stock. Your order routes to the nearest stocked shop automatically." },
  { n: "03", title: "Pack", body: "Shop accepts within 2 minutes; stock deducts instantly so nothing oversells." },
  { n: "04", title: "Deliver", body: "Nearest-match rider, OTP handover, photo proof — at your door in 15–30 minutes." },
];

const PHASES = [
  { phase: "Phase 1", when: "0–3 months", title: "Win one micro-market", body: "10–20 shops in Satellite, Ahmedabad. 30–50 orders/day. Perfect the pack-and-pickup loop.", done: true },
  { phase: "Phase 2", when: "3–9 months", title: "Density & retention", body: "Adjacent localities, 300–1,000 orders/day, subscriptions, referrals, sponsored listings.", done: false },
  { phase: "Phase 3", when: "9–24 months", title: "City replication", body: "The locality playbook across Ahmedabad and Gujarat. Contribution-margin positive.", done: false },
  { phase: "Phase 4", when: "24+ months", title: "Local commerce OS", body: "Shop SaaS, payments, ads, credit and forecasting — the OS for neighbourhood retail.", done: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* nav */}
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-lg">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/"><Logo /></Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#modules" className="transition-colors hover:text-foreground">For Shops</a>
            <a href="#modules" className="transition-colors hover:text-foreground">For Riders</a>
            <a href="#investors" className="transition-colors hover:text-foreground">Investors</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/customer"><Button size="sm">Launch Demo <ArrowRight size={14} /></Button></Link>
          </div>
        </nav>
      </header>

      {/* hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Hyperlocal commerce network</p>
          <h1 className="mt-4 text-[2.6rem] font-bold leading-[1.04] tracking-[-0.03em] sm:text-6xl">
            Your local shops,<br />
            <span className="text-brand">delivered fast.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
            NearKart turns neighbourhood stores into micro-fulfilment centres — Blinkit-speed delivery
            with kirana-depth inventory, <strong className="font-semibold text-foreground">zero warehouses</strong>.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link href="/customer"><Button size="lg">Try Customer App <ArrowRight size={15} /></Button></Link>
            <Link href="/shop"><Button size="lg" variant="outline">Shop Dashboard</Button></Link>
            <Link href="/rider"><Button size="lg" variant="outline">Rider App</Button></Link>
          </div>
          <p className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={12} className="text-brand" /> Pilot: Satellite, Ahmedabad · Min order ₹100 · Free delivery above ₹299
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }}>
          <HeroCollage />
        </motion.div>
      </section>

      {/* brands + metrics strip */}
      <section className="border-y bg-card">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-b border-dashed pb-6 text-sm font-bold tracking-wide text-muted-foreground/70">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Real inventory from</span>
            <span>Amul</span><span>Britannia</span><span>Tata</span><span>Maggi</span><span>Colgate</span><span>boAt</span><span>Haldiram&apos;s</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-6">
            {[
              { icon: Banknote, label: "Target AOV", value: 250, prefix: "₹" },
              { icon: Percent, label: "Commission", value: 7, suffix: "%" },
              { icon: Clock3, label: "Delivery", value: 30, suffix: " min" },
              { icon: Store, label: "Pilot shops", value: 20, suffix: "+" },
              { icon: PackageCheck, label: "Orders/day", value: 50, suffix: "+" },
              { icon: Users, label: "Riders", value: 15, suffix: "+" },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><m.icon size={17} /></div>
                <div>
                  <p className="text-lg font-bold"><Counter to={m.value} prefix={m.prefix} suffix={m.suffix} /></p>
                  <p className="text-[11px] font-medium text-muted-foreground">{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* problem */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">The problem</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-[2.6rem] sm:leading-[1.1]">
            Dark stores rent your neighbourhood.<br />
            <span className="text-muted-foreground">NearKart lives in it.</span>
          </h2>
        </motion.div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { title: "Warehouses are capped", body: "Dark stores carry ~2,000 SKUs and burn crores on real estate. Tier-2 expansion is slow and capital-hungry.", stat: "₹3.65B", statLabel: "q-commerce market, 2026" },
            { title: "Local shops are invisible", body: "91% of India's grocery still runs through neighbourhood retail — with no online storefront and shrinking footfall.", stat: "91%", statLabel: "grocery share, kirana India" },
            { title: "NearKart connects them", body: "Existing shops become fulfilment nodes. Wider inventory, trusted owners, asset-light growth locality by locality.", stat: "0", statLabel: "warehouses required" },
          ].map((c, i) => (
            <motion.div key={c.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }} className={cn("rounded-2xl border bg-card p-6", i === 2 && "border-brand/40")}>
              <p className="num text-3xl font-bold tracking-tight text-brand">{c.stat}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{c.statLabel}</p>
              <h3 className="mt-4 text-base font-bold">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="border-y bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">The flywheel</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Four steps. One loop. Compounding density.</h2>
          </motion.div>
          <div className="mt-10 grid gap-x-8 gap-y-8 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <motion.div key={s.n} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="relative border-t-2 border-foreground/80 pt-5">
                <span className="num text-sm font-bold text-brand">{s.n}</span>
                <h3 className="mt-2 text-base font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* modules */}
      <section id="modules" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">One platform, four experiences</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Every side of the marketplace, fully working</h2>
          <p className="mt-3 text-muted-foreground">Open two modules in separate tabs — a customer order appears in the shop dashboard in real time.</p>
        </motion.div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {MODULES.map((m, i) => (
            <motion.div key={m.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }}>
              <Link href={m.href} className="group block h-full overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lift">
                <div className="relative h-36 overflow-hidden">
                  <SmartImage src={`https://images.unsplash.com/${m.img}?auto=format&fit=crop&w=900&q=70`} alt={m.title} seed={m.title} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{m.title}</h3>
                    <ArrowRight size={17} className="text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-brand" />
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
                  <p className="mt-3.5 text-sm font-bold text-brand">{m.cta} →</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* business model */}
      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <motion.div {...fadeUp}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Business model</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Six revenue streams, one order</h2>
            <div className="mt-6 space-y-2.5">
              {[
                { icon: Percent, t: "Shop commission", d: "7% of item value on completed orders" },
                { icon: Truck, t: "Delivery fee", d: "₹25/order, free above ₹299 — drives basket growth" },
                { icon: Store, t: "Shop subscriptions", d: "₹299–₹999/mo for analytics & placement (Phase 2)" },
                { icon: Eye, t: "Sponsored listings", d: "Shops & brands bid for discovery placement" },
                { icon: ShoppingBag, t: "White-label storefronts", d: "Shops run WhatsApp commerce on NearKart rails" },
                { icon: ShieldCheck, t: "Data & insights", d: "Demand forecasting and inventory intelligence for FMCG" },
              ].map((r) => (
                <div key={r.t} className="flex items-start gap-3 rounded-xl border bg-background p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand"><r.icon size={15} /></div>
                  <div>
                    <p className="text-sm font-bold">{r.t}</p>
                    <p className="text-xs text-muted-foreground">{r.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
            <div className="rounded-2xl border bg-background p-6">
              <h3 className="text-lg font-bold">Unit economics per order</h3>
              <p className="mt-1 text-xs text-muted-foreground">Representative ₹250 basket</p>
              <div className="mt-5 space-y-3 text-sm">
                {[
                  ["Item total", "₹250", ""],
                  ["Delivery fee", "+ ₹25", ""],
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
                  <span className="num text-xl font-bold text-brand">₹8.5+</span>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Positive at ₹250 AOV today; scales with basket size, ad revenue and rider batching. The full ledger is visible in Shop → Payouts.
              </p>
              <Link href="/shop/payouts"><Button variant="secondary" size="sm" className="mt-4">View payout ledger <ArrowRight size={13} /></Button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* trust */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Trust & safety</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Trust is the product</h2>
        </motion.div>
        <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: BadgeCheck, t: "Verified Local Shops", d: "PAN, GSTIN, FSSAI and bank details checked by operations before going live." },
            { icon: ShieldCheck, t: "OTP + photo proof", d: "Pickup and delivery OTPs with photo evidence kill false claims on both sides." },
            { icon: PackageCheck, t: "Auto out-of-stock", d: "Stock syncs on every accepted order. Sold-out items vanish from search instantly." },
            { icon: Percent, t: "Fast dispute resolution", d: "Clear liability matrix — shops own product issues, riders own proven mishandling." },
            { icon: Truck, t: "Rider-first design", d: "Earnings shown before accepting, 100% tip pass-through, weekly + instant payouts." },
            { icon: Clock3, t: "Honest 15–30 minutes", d: "Dynamic ETA from prep time, travel and rider supply — no fake 8-minute promises." },
          ].map((f, i) => (
            <motion.div key={f.t} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} className="border-t pt-5">
              <f.icon size={19} className="text-brand" />
              <h3 className="mt-2.5 text-base font-bold">{f.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* investors / roadmap */}
      <section id="investors" className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Unicorn pathway</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Delivery is the wedge. The OS is the moat.</h2>
          </motion.div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {PHASES.map((p, i) => (
              <motion.div key={p.phase} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="relative">
                {i < 3 && <div className="absolute left-full top-5 hidden h-px w-6 bg-foreground/20 md:block" />}
                <div className={cn("h-full rounded-2xl border p-5", p.done ? "border-brand/40 bg-brand-softer" : "bg-background")}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand">{p.phase}</span>
                    {p.done && <BadgeCheck size={15} className="text-brand" />}
                  </div>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{p.when}</p>
                  <h3 className="mt-1 font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeUp} className="mx-auto mt-14 max-w-3xl rounded-3xl border bg-background p-9 text-center">
            <h3 className="text-2xl font-bold tracking-tight">The end state isn&apos;t a delivery app.</h3>
            <p className="mt-2.5 text-muted-foreground">
              It&apos;s the <strong className="font-semibold text-foreground">operating system for neighbourhood commerce</strong> — payments, inventory,
              credit, ads and analytics running through local shops across a million Indian streets.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/customer"><Button size="lg">Launch the demo <ArrowRight size={15} /></Button></Link>
              <Link href="/admin"><Button size="lg" variant="outline">See the numbers</Button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <Logo />
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
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
