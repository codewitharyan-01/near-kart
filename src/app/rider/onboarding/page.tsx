"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Button, Field, Input, Select } from "@/components/ui/base";
import { cn } from "@/lib/utils";

const STEPS = ["Personal", "Documents", "Bank", "Availability"];

export default function RiderOnboardingPage() {
  const pushToast = useApp((s) => s.pushToast);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-soft">
          <span className="text-4xl">🛵</span>
        </motion.div>
        <h1 className="font-display text-2xl font-extrabold">Application received!</h1>
        <p className="text-sm text-muted-foreground">
          Document verification takes 12–24 hours. Once approved, you go straight to the job board — most riders complete their first trip the same day.
        </p>
        <div className="w-full rounded-2xl border bg-card p-4 text-left text-sm">
          <p className="font-bold">What happens next</p>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li className="flex items-center gap-2"><Check size={14} className="text-brand" /> DL + vehicle details received</li>
            <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" /> Background verification (12–24h)</li>
            <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" /> 10-min policy training video</li>
            <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" /> Go online & earn 🚀</li>
          </ul>
        </div>
        <Button className="w-full" onClick={() => (window.location.href = "/rider")}>Back to rider app</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <p className="text-xs font-bold uppercase tracking-widest text-brand">NearKart for riders</p>
      <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight">Deliver & earn on your schedule</h1>
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
      <p className="mt-2 text-xs font-semibold text-muted-foreground">Step {step + 1} of 4 — {STEPS[step]}</p>

      <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="card-surface mt-4 space-y-3 p-5">
        {step === 0 && (
          <>
            <Field label="Full name"><Input placeholder="Rajesh Kumar" /></Field>
            <Field label="Mobile number"><Input placeholder="+91 98XXX XXXXX" /></Field>
            <Field label="Email (optional)"><Input placeholder="you@example.in" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City"><Input defaultValue="Ahmedabad" /></Field>
              <Field label="Area / zone"><Input placeholder="Satellite" /></Field>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <Field label="Vehicle type"><Select><option>Bike</option><option>Scooter</option><option>Bicycle</option></Select></Field>
            <Field label="Vehicle number"><Input placeholder="GJ-01-AB-1234" /></Field>
            <button className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm text-muted-foreground transition hover:border-brand hover:text-brand"><Upload size={15} /> Aadhaar / PAN upload</button>
            <button className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm text-muted-foreground transition hover:border-brand hover:text-brand"><Upload size={15} /> Driving license upload</button>
            <button className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm text-muted-foreground transition hover:border-brand hover:text-brand"><Upload size={15} /> Vehicle photo</button>
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Bank account number"><Input placeholder="5011XXXXXXXX4231" /></Field>
            <Field label="IFSC code"><Input placeholder="HDFC0000123" /></Field>
            <Field label="UPI ID (optional — instant payouts)"><Input placeholder="rajesh@upi" /></Field>
            <p className="rounded-xl bg-brand-softer p-3 text-xs text-brand">⚡ Riders rated 4.7+ get instant payouts, free of charge.</p>
          </>
        )}
        {step === 3 && (
          <>
            <Field label="Preferred delivery zone"><Select><option>Satellite</option><option>Vastrapur</option><option>Bodakdev</option><option>Prahlad Nagar</option></Select></Field>
            <Field label="Working hours"><Select><option>Morning (7 AM – 12 PM)</option><option>Afternoon (12 – 5 PM)</option><option>Evening peak (5 – 10 PM)</option><option>Full day</option></Select></Field>
            <p className="rounded-xl bg-accent-soft p-3 text-xs text-accent">🛡️ Every trip is insured. Your OTP, GPS and photo logs protect you from false claims.</p>
          </>
        )}
        <div className="flex gap-2 pt-2">
          {step > 0 && <Button variant="outline" className="flex-1" onClick={() => setStep((s) => s - 1)}><ChevronLeft size={15} /> Back</Button>}
          {step < 3 ? (
            <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>Continue <ChevronRight size={15} /></Button>
          ) : (
            <Button className="flex-1" onClick={() => { setDone(true); pushToast({ title: "Application submitted 🎉", kind: "success" }); }}>Submit for verification 🚀</Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
