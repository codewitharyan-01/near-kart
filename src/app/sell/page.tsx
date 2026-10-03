"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, CheckCircle2, Clock3, IndianRupee, LineChart, Store } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Button, Field, Input, Select } from "@/components/ui/base";
import { SmartImage } from "@/components/ui/smart-image";
import { revealProps, stagger } from "@/lib/motion";

export default function SellPage() {
  const pushToast = useApp((s) => s.pushToast);
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen">
      {/* nav */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <span className="text-[19px] font-bold tracking-tight">NearKart <span className="text-brand">for Shops</span></span>
          <a href="/customer"><Button size="sm" variant="outline">I&apos;m a customer</Button></a>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">For shopkeepers</p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.06] tracking-[-0.03em] sm:text-5xl">
            Your counter, now online.<br />
            <span className="text-muted-foreground">In one evening.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            No dark store, no commission traps. NearKart puts your real inventory in front of hundreds of nearby customers
            and routes orders to your counter — you pack, we coordinate the rider.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm">
            {[
              "7% commission — the lowest in quick commerce",
              "Stock syncs automatically; sold-out items hide themselves",
              "Transparent weekly payouts with a line-by-line ledger",
              "Your shop, your prices, your customers' trust",
            ].map((l) => (
              <li key={l} className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand" /> {l}</li>
            ))}
          </ul>
          <div className="mt-8 flex gap-3">
            <a href="#apply"><Button size="lg">List my shop <ArrowRight size={15} /></Button></a>
            <a href="/customer"><Button size="lg" variant="outline">See the app</Button></a>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="relative">
          <div className="overflow-hidden rounded-3xl border shadow-lift">
            <SmartImage src="https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?auto=format&fit=crop&w=900&q=70" alt="Shop owner at the counter" seed="sell-hero" className="aspect-[4/3] w-full" />
          </div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="absolute -bottom-5 -left-4 rounded-2xl border bg-card p-4 shadow-lift sm:-left-8">
            <p className="text-xs font-bold">Shops on NearKart see</p>
            <p className="num mt-1 text-2xl font-bold text-brand">+23%</p>
            <p className="text-[10px] text-muted-foreground">monthly counter revenue (pilot)</p>
          </motion.div>
        </motion.div>
      </section>

      {/* numbers */}
      <section className="border-y bg-card">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {[
            { icon: Store, v: "20+", l: "pilot shops onboarded" },
            { icon: IndianRupee, v: "7%", l: "flat commission" },
            { icon: Clock3, v: "T+1", l: "payout settlement" },
            { icon: LineChart, v: "96%", l: "stock accuracy network-wide" },
          ].map((m) => (
            <motion.div key={m.l} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><m.icon size={17} /></div>
              <div><p className="text-xl font-bold">{m.v}</p><p className="text-[11px] text-muted-foreground">{m.l}</p></div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* how it works + apply */}
      <section id="apply" className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <motion.div {...revealProps}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Getting started</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">Three steps to your first online order</h2>
          <div className="mt-8 space-y-6">
            {[
              { n: "1", t: "Apply in 3 minutes", d: "Shop name, area and documents — PAN, FSSAI (for food) and bank details. Our team verifies within 24 hours." },
              { n: "2", t: "Catalog in one evening", d: "Pick a template (kirana, dairy, vegetables…), adjust prices and stock. Barcode scanning arrives with the Android app." },
              { n: "3", t: "Go live in your zone", d: "Set your delivery radius and prep time. Orders arrive with a 2-minute accept timer; pack, hand over, earn." },
            ].map((s) => (
              <div key={s.n} className="flex gap-4">
                <span className="num flex h-9 w-9 shrink-0 items-center justify-center rounded-full btn-ink text-sm font-bold text-background">{s.n}</span>
                <div>
                  <p className="font-bold">{s.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border bg-card p-4">
            <BadgeCheck size={18} className="mt-0.5 shrink-0 text-brand" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Pilot onboarding is white-glove:</strong> our field team builds your first 100-SKU catalog with you, in your shop, free.
            </p>
          </div>
        </motion.div>

        {/* application form */}
        <motion.div {...revealProps} transition={{ delay: 0.1 }}>
          <div className="card-surface p-6">
            {sent ? (
              <div className="py-10 text-center">
                <CheckCircle2 size={44} className="mx-auto text-brand" />
                <p className="mt-4 text-xl font-bold">Application received</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  Our field team calls every applicant within 24 hours. Keep your PAN, FSSAI and a cancelled cheque handy.
                </p>
                <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>Submit another shop</Button>
              </div>
            ) : (
              <>
                <p className="text-lg font-bold">Apply now — Satellite pilot</p>
                <p className="mt-1 text-xs text-muted-foreground">Limited onboarding slots per micro-market to protect order density.</p>
                <div className="mt-5 space-y-3">
                  <Field label="Shop name"><Input placeholder="Sharma Kirana Store" /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Owner name"><Input placeholder="Rajesh Sharma" /></Field>
                    <Field label="Mobile"><Input placeholder="+91 98XXX XXXXX" /></Field>
                  </div>
                  <Field label="Shop category">
                    <Select>
                      <option>Kirana & Grocery</option><option>Dairy & Bakery</option><option>Fruits & Vegetables</option>
                      <option>Supermarket</option><option>Stationery</option><option>Electronics</option><option>Home & Personal care</option>
                    </Select>
                  </Field>
                  <Field label="Area"><Input placeholder="Satellite, Ahmedabad" /></Field>
                  <Button size="lg" className="w-full" onClick={() => { setSent(true); pushToast({ title: "Application submitted", kind: "success" }); }}>
                    Apply for verification
                  </Button>
                  <p className="text-center text-[11px] text-muted-foreground">Demo form — submissions are simulated.</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
