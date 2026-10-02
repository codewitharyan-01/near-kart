"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Flame, Gift, MapPin, Share2, Users } from "lucide-react";
import { useApp } from "@/store/useApp";
import { ThemeToggle } from "@/components/brand/shell";
import { Badge, Button, Progress, SectionTitle, Switch } from "@/components/ui/base";
import { inr } from "@/lib/utils";

export default function ProfilePage() {
  const customer = useApp((s) => s.customer);
  const loyalty = useApp((s) => s.loyalty);
  const simAuto = useApp((s) => s.simAuto);
  const setSimAuto = useApp((s) => s.setSimAuto);
  const resetDemo = useApp((s) => s.resetDemo);
  const pushToast = useApp((s) => s.pushToast);
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const referralCode = "ARYAN-NEAR50";
  const nextTier = 500;

  return (
    <div className="space-y-5">
      {/* identity card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-surface overflow-hidden">
        <div className="bg-foreground h-16" />
        <div className="-mt-8 px-4 pb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-card bg-gradient-to-br from-amber-400 to-orange-600 text-2xl font-extrabold text-white shadow-md">
            AS
          </div>
          <h1 className="mt-2 font-display text-xl font-extrabold">{customer.name}</h1>
          <p className="num text-xs text-muted-foreground">{customer.phone} · member since 2026</p>
          <div className="mt-3 flex gap-2">
            <Badge tone="accent"><Flame size={11} /> {loyalty.streakDays}-day streak</Badge>
            <Badge tone="brand">🪙 {loyalty.coins} NearCoins</Badge>
            <Badge tone="outline">Gold member</Badge>
          </div>

          {/* coins progress */}
          <div className="mt-4 rounded-2xl bg-muted p-3.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Progress to Platinum</span>
              <span className="num">{loyalty.coins}/{nextTier} coins</span>
            </div>
            <Progress className="mt-2" value={(loyalty.coins / nextTier) * 100} tone="accent" />
            <p className="mt-1.5 text-[11px] text-muted-foreground">Platinum unlocks free delivery on every order + priority rider matching.</p>
          </div>
        </div>
      </motion.div>

      {/* addresses */}
      <section>
        <SectionTitle title="Saved addresses" />
        <div className="space-y-2">
          {customer.addresses.map((a) => (
            <div key={a.id} className="card-surface flex items-start gap-3 p-3.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand"><MapPin size={14} /></div>
              <div>
                <p className="text-sm font-bold">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.line1}, {a.area} — {a.pincode}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* referral — growth loop */}
      <section>
        <SectionTitle title="Invite & earn" />
        <div className="card-surface relative overflow-hidden p-4">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/15 blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent"><Gift size={20} /></div>
            <div>
              <p className="text-sm font-bold">Give ₹50, get ₹50</p>
              <p className="text-xs text-muted-foreground">Your friend gets ₹50 off their first order; you get ₹50 in NearCoins.</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <code className="num flex-1 rounded-xl border border-dashed border-brand/50 bg-brand-softer px-3.5 py-2.5 text-sm font-bold tracking-wider text-brand">{referralCode}</code>
            <Button
              size="icon"
              variant="outline"
              aria-label="Copy referral code"
              onClick={() => { setCopied(true); pushToast({ title: "Code copied!", body: "Share it with your building WhatsApp group 😉", kind: "success" }); setTimeout(() => setCopied(false), 1500); }}
            >
              <Copy size={15} className={copied ? "text-brand" : ""} />
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Share referral"
              onClick={() => pushToast({ title: "Demo only", body: "Native share is disabled in the demo.", kind: "info" })}
            >
              <Share2 size={15} />
            </Button>
          </div>
          <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground"><Users size={11} /> 3 friends joined so far · ₹150 earned</p>
        </div>
      </section>

      {/* wallet */}
      <div className="card-surface flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">🪙</div>
          <div>
            <p className="text-sm font-bold">NearKart Wallet</p>
            <p className="text-xs text-muted-foreground">Balance {inr(0)} · coming soon</p>
          </div>
        </div>
        <Badge tone="outline">Soon</Badge>
      </div>

      {/* settings */}
      <section>
        <SectionTitle title="Settings" />
        <div className="card-surface divide-y">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-semibold">Dark mode</p>
              <p className="text-xs text-muted-foreground">Easier on the eyes at night</p>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-semibold">Live order simulation</p>
              <p className="text-xs text-muted-foreground">Auto-advance demo orders through the lifecycle</p>
            </div>
            <Switch checked={simAuto} onChange={setSimAuto} label="Live simulation" />
          </div>
          <button className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50" onClick={() => pushToast({ title: "Hindi & ગુજરાતી", body: "Language switch arrives with the Tier-2 rollout.", kind: "info" })}>
            <div>
              <p className="text-sm font-semibold">Language</p>
              <p className="text-xs text-muted-foreground">English · हिन्दी coming soon</p>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>
          <button className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50" onClick={() => pushToast({ title: "Demo mode", body: "Authentication is simulated in this prototype.", kind: "info" })}>
            <div>
              <p className="text-sm font-semibold text-danger">Log out</p>
              <p className="text-xs text-muted-foreground">Demo only — no real session</p>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>
        </div>
      </section>

      <Button variant="outline" className="w-full" onClick={() => { resetDemo(); }}>♻️ Reset demo data</Button>
      <p className="pb-2 text-center text-[11px] text-muted-foreground">NearKart investor demo v1.0 · made with 💚 in Ahmedabad</p>
    </div>
  );
}
