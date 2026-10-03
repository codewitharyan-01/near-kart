"use client";

import { useState } from "react";
import { ChevronDown, MessageSquareText, Phone, ShieldQuestion } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Button, SectionTitle } from "@/components/ui/base";
import { cn } from "@/lib/utils";

const FAQS: [string, string][] = [
  ["How fast is delivery, really?", "Our promise is an honest 15–30 minutes. The ETA you see at checkout is computed from the shop's prep time, live distance and rider supply — we never show a fake countdown. Multi-store baskets add ~8 minutes per extra pickup."],
  ["Can I order from two shops at once?", "Yes — that's the NearKart advantage. Add milk from the dairy and biscuits from the kirana; we split it into linked sub-orders, one rider collects from both counters, and a single ₹15 fee covers each extra pickup (free above ₹499)."],
  ["Why is there a minimum basket?", "₹100 for a single store (₹50 per store when ordering from multiple shops). A tiny basket can't cover the rider, payment fees and support costs — the minimum keeps delivery sustainable so we never bleed money into fees."],
  ["What if an item is missing or damaged?", "Report it with a photo within 12 hours (perishables) or 24 hours (packaged goods). Valid claims get an instant refund to your original payment method or NearCoins — shops are liable for product issues, riders only for proven mishandling."],
  ["How do refunds work?", "Clear cases resolve automatically from photo evidence and OTP logs. Unclear cases go to our trust team with a 24-hour SLA. Repeat abuse is flagged — genuine customers never feel this."],
  ["Are the shops real businesses?", "Every shop is document-verified (PAN, GSTIN where applicable, FSSAI for food) before going live. The Verified Local Shop badge means a human checked it."],
  ["How do riders get paid?", "Base ₹20 + ₹2.5/km + ₹7 peak incentive + 100% of tips — shown before they accept a job. Weekly payouts, instant for 4.7★+ riders."],
  ["Is this a real payment?", "Payments are simulated in this investor demo — no money moves. In production NearKart plugs into a PCI-DSS compliant gateway (Razorpay/Cashfree) with UPI, cards and COD."],
];

export default function HelpPage() {
  const pushToast = useApp((s) => s.pushToast);
  const [open, setOpen] = useState(0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <SectionTitle title="Help centre" sub="Answers in under a minute — or reach a human" />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: MessageSquareText, t: "In-app chat", d: "Avg. response 2 min", a: "Start chat" },
          { icon: Phone, t: "Call support", d: "1800-NEAR-KART, 7 AM–11 PM", a: "Call now" },
          { icon: ShieldQuestion, t: "Safety line", d: "Priority escalation, 24×7", a: "Get help" },
        ].map((c) => (
          <button
            key={c.t}
            onClick={() => pushToast({ title: "Demo build", body: "Support channels go live with production.", kind: "info" })}
            className="card-surface p-4 text-left transition hover:shadow-lift"
          >
            <c.icon size={17} className="text-brand" />
            <p className="mt-2 text-sm font-bold">{c.t}</p>
            <p className="text-xs text-muted-foreground">{c.d}</p>
            <p className="mt-2 text-xs font-bold text-brand">{c.a} →</p>
          </button>
        ))}
      </div>

      <div className="card-surface divide-y overflow-hidden">
        {FAQS.map(([q, a], i) => (
          <div key={q}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
              aria-expanded={open === i}
            >
              <span className="text-sm font-bold">{q}</span>
              <ChevronDown size={16} className={cn("shrink-0 text-muted-foreground transition-transform", open === i && "rotate-180")} />
            </button>
            <div className={cn("grid transition-all duration-300", open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
              <div className="overflow-hidden">
                <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Still stuck? <button onClick={() => pushToast({ title: "Demo build", body: "Chat goes live with production.", kind: "info" })} className="font-bold text-brand hover:underline">Chat with us</button> — we reply in minutes.
      </p>
    </div>
  );
}
