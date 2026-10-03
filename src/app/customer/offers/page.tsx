"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Copy, TicketPercent } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Button, SectionTitle } from "@/components/ui/base";
import { inr } from "@/lib/utils";
import { revealProps, stagger } from "@/lib/motion";

export default function OffersPage() {
  const offers = useApp((s) => s.offers);
  const applyCoupon = useApp((s) => s.applyCoupon);
  const pushToast = useApp((s) => s.pushToast);
  const cartCount = Object.values(useApp((s) => s.cart.items)).reduce((a, b) => a + b, 0);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (code: string) => {
    setCopied(code);
    pushToast({ title: `${code} copied`, body: "Apply it in your cart.", kind: "success" });
    setTimeout(() => setCopied(null), 1400);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <SectionTitle title="Offers & coupons" sub="Stack savings on every neighbourhood run" />

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2">
        {offers.filter((o) => o.active).map((o) => (
          <motion.div key={o.id} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} className="relative overflow-hidden rounded-2xl border bg-card">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-brand" />
            <div className="p-5 pl-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold tracking-tight">{o.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{o.description}</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent"><TicketPercent size={20} /></span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <code className="flex-1 rounded-xl border border-dashed border-brand/50 bg-brand-softer px-3.5 py-2.5 text-center text-sm font-bold tracking-widest text-brand">{o.code}</code>
                <Button size="icon" variant="outline" aria-label={`Copy ${o.code}`} onClick={() => copy(o.code)}>
                  <Copy size={14} className={copied === o.code ? "text-brand" : ""} />
                </Button>
                <Button
                  size="sm"
                  variant={cartCount > 0 ? "primary" : "outline"}
                  onClick={() => { const r = applyCoupon(o.code); pushToast({ title: r.message, kind: r.ok ? "success" : "warn" }); }}
                >
                  {cartCount > 0 ? "Apply" : "Save"}
                </Button>
              </div>

              <p className="mt-3 text-[11px] text-muted-foreground">
                Min order {inr(o.minOrder)}{o.firstOrderOnly ? " · first order only" : ""} · {o.usedCount.toLocaleString("en-IN")} neighbours used this
              </p>
            </div>
          </motion.div>
        ))}

        {/* always-on value props */}
        <motion.div {...revealProps} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} className="rounded-2xl border border-brand/30 bg-brand-softer p-5 sm:col-span-2">
          <p className="font-bold">Everyday savings, no gimmicks</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              ["Free delivery", "Above ₹299 single-store · ₹499 multi-store"],
              ["NearCoins", "Earn on every order, redeem up to ₹50"],
              ["Referral ₹50", "Give ₹50, get ₹50 when friends order"],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl bg-card p-3.5">
                <p className="text-sm font-bold">{t}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <Link href="/customer" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">
            Start a basket <ArrowRight size={14} />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
