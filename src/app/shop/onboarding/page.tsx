"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Upload, ShieldCheck } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Button, Field, Input, Select } from "@/components/ui/base";
import { cn } from "@/lib/utils";

const STEPS = ["Shop details", "Verification", "Delivery setup", "Catalog", "Review"];

export default function ShopOnboardingPage() {
  const pushToast = useApp((s) => s.pushToast);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  if (done) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-soft">
          <ShieldCheck size={44} className="text-brand" />
        </motion.div>
        <h1 className="font-display text-2xl font-extrabold">Application submitted!</h1>
        <p className="text-sm text-muted-foreground">
          Our operations team verifies PAN, GSTIN/FSSAI and bank details within 24 hours. You&apos;ll get a WhatsApp update at every step.
          Meanwhile, finish your catalog — shops with 100+ SKUs go live 3× faster.
        </p>
        <div className="w-full rounded-2xl border bg-card p-4 text-left text-sm">
          <p className="font-bold">Verification checklist</p>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li className="flex items-center gap-2"><Check size={14} className="text-brand" /> Shop photos received</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-brand" /> PAN card uploaded</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-brand" /> Bank account added</li>
            <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" /> Document verification (24h)</li>
            <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" /> Location verification visit</li>
            <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" /> Go live 🚀</li>
          </ul>
        </div>
        <Button className="w-full" onClick={() => window.location.href = "/shop"}>Back to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">NearKart for shops</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight">List your store in 5 minutes</h1>
        <div className="mt-4 flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-1.5">
              <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", i < step ? "bg-brand text-white" : i === step ? "bg-foreground text-white ring-4 ring-foreground/15" : "bg-muted text-muted-foreground")}>
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={cn("h-0.5 flex-1 rounded", i < step ? "bg-brand" : "bg-muted")} />}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs font-semibold text-muted-foreground">Step {step + 1} of 5 — {STEPS[step]}</p>
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="card-surface space-y-4 p-5">
        {step === 0 && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Shop name"><Input placeholder="Sharma Kirana Store" /></Field>
              <Field label="Owner name"><Input placeholder="Rajesh Sharma" /></Field>
              <Field label="Mobile number"><Input placeholder="+91 98XXX XXXXX" /></Field>
              <Field label="Shop category">
                <Select><option>Kirana & Grocery</option><option>Dairy & Bakery</option><option>Fruits & Vegetables</option><option>Supermarket</option><option>Stationery</option><option>Electronics</option></Select>
              </Field>
              <Field label="Address" className="sm:col-span-2"><Input placeholder="Shop 12, Shivranjani Cross Road" /></Field>
              <Field label="Area"><Input placeholder="Satellite" /></Field>
              <Field label="Pincode"><Input placeholder="380015" /></Field>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shop photos</p>
              <button className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed text-sm text-muted-foreground transition hover:border-brand hover:text-brand">
                <Upload size={18} /> Upload storefront photo (UI demo)
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="PAN number" hint="Personal or business PAN"><Input placeholder="ABCPS1234F" /></Field>
              <Field label="GSTIN" hint="Optional for small sellers"><Input placeholder="24ABCDE1234F1Z5" /></Field>
              <Field label="FSSAI license" hint="Required for food & grocery"><Input placeholder="10725019000123" /></Field>
              <Field label="Bank account number"><Input placeholder="5011XXXXXXXX4231" /></Field>
              <Field label="IFSC code"><Input placeholder="HDFC0000123" /></Field>
            </div>
            <button className="flex h-20 w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed text-sm text-muted-foreground transition hover:border-brand hover:text-brand">
              <Upload size={18} /> Upload documents — PAN, FSSAI, cancelled cheque
            </button>
            <p className="rounded-xl bg-brand-softer p-3 text-xs text-brand">🔒 Bank-grade encryption. Documents are only used for KYC verification.</p>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Delivery radius" hint="Start tight, expand later">
                <Select><option>1 km</option><option>2 km</option><option>3 km</option></Select>
              </Field>
              <Field label="Preparation time"><Select><option>5 min</option><option>10 min</option><option>15 min</option></Select></Field>
              <Field label="Minimum order" hint="Platform floor ₹100"><Input defaultValue="100" /></Field>
              <Field label="Shop timings"><div className="flex gap-2"><Input type="time" defaultValue="08:00" /><Input type="time" defaultValue="22:30" /></div></Field>
            </div>
            <p className="rounded-xl bg-brand-softer p-3 text-xs text-brand">💡 Most successful kiranas start with a 2 km radius and 8-minute prep time.</p>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm font-bold">Build your first catalog</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button className="flex h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed text-sm text-muted-foreground transition hover:border-brand hover:text-brand">
                ➕ Add products manually
              </button>
              <button className="flex h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed text-sm text-muted-foreground transition hover:border-brand hover:text-brand">
                📄 Bulk CSV / Excel upload
              </button>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">One-tap templates</p>
              <div className="flex flex-wrap gap-2">
                {["Kirana essentials (180 SKUs)", "Dairy & bakery (45)", "Fruits & veggies (60)", "Household & care (80)"].map((t) => (
                  <button key={t} className="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:border-brand hover:text-brand">{t}</button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Templates prefill names, brands, pack sizes and MRPs — you just adjust stock. Barcode scanning arrives with the Android app.</p>
          </>
        )}

        {step === 4 && (
          <>
            <p className="text-sm font-bold">Review & submit</p>
            <div className="space-y-2 text-sm">
              {[
                ["Shop", "Sharma Kirana Store, Satellite"],
                ["Documents", "PAN ✓ · FSSAI ✓ · Bank ✓"],
                ["Delivery", "2 km radius · 8 min prep · ₹100 min"],
                ["Catalog", "Template selected — edit anytime"],
              ].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between rounded-xl border px-3.5 py-2.5">
                  <span className="text-muted-foreground">{l}</span><span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <p className="rounded-xl bg-accent-soft p-3 text-xs text-accent">
              ⏳ After submission, your shop shows &quot;Under verification&quot; until our team approves documents — usually within 24 hours.
            </p>
          </>
        )}

        <div className="flex gap-2 pt-2">
          {step > 0 && <Button variant="outline" onClick={back} className="flex-1"><ChevronLeft size={15} /> Back</Button>}
          {step < 4 ? (
            <Button onClick={next} className="flex-1">Continue <ChevronRight size={15} /></Button>
          ) : (
            <Button onClick={() => { setDone(true); pushToast({ title: "Application submitted 🎉", kind: "success" }); }} className="flex-1">
              Submit for verification 🚀
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
