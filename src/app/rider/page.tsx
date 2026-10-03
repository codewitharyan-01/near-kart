"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Layers, MapPin, Navigation, Target, TrendingUp, Zap } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Badge, Button, EmptyState, Progress, Switch, StatCard, Stars } from "@/components/ui/base";
import { inr, cn } from "@/lib/utils";

const GOAL = 8;

export default function RiderHome() {
  const riders = useApp((s) => s.riders);
  const orders = useApp((s) => s.orders);
  const shops = useApp((s) => s.shops);
  const toggleRiderOnline = useApp((s) => s.toggleRiderOnline);
  const riderAccept = useApp((s) => s.riderAccept);
  const riderReject = useApp((s) => s.riderReject);
  const pushToast = useApp((s) => s.pushToast);

  const me = riders.find((r) => r.id === "r1")!;
  const myTripsToday = orders.filter((o) => o.riderId === "r1" && o.status === "DELIVERED" && Date.now() - o.placedAt < 86400000).length;
  const jobs = orders.filter((o) => o.status === "READY_FOR_PICKUP");
  const active = orders.find((o) => o.riderId === "r1" && ["RIDER_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(o.status));
  const remaining = Math.max(0, GOAL - myTripsToday);

  /* ticking accept window */
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4">
      {/* header: online toggle + profile */}
      <div className="card-surface flex items-center gap-3 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-700 text-lg font-bold text-white">RK</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{me.name}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Stars value={me.rating} size={11} /> {me.rating} · {me.vehicle} · {me.zone}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">{me.online ? "You're online" : "You're offline"}</p>
          <Switch checked={me.online} onChange={toggleRiderOnline} label="Online toggle" />
        </div>
      </div>

      {/* earnings + stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Today" value={inr(me.earningsToday)} sub="incl. incentives" icon={<TrendingUp size={16} />} />
        <StatCard label="Trips" value={myTripsToday} sub="completed" tone="info" icon={<Target size={16} />} />
        <StatCard label="Acceptance" value={`${me.acceptanceRate}%`} sub="last 7 days" tone="accent" icon={<Zap size={16} />} />
      </div>

      {/* incentive gamification */}
      <div className="card-surface relative overflow-hidden p-4">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent/20 blur-2xl" />
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-bold"><Flame size={16} className="text-accent" /> {remaining > 0 ? `${remaining} more trips → ₹100 bonus` : "Bonus unlocked! 🎉"}</p>
          <Badge tone="accent">Daily goal {GOAL}</Badge>
        </div>
        <Progress className="mt-3" value={(myTripsToday / GOAL) * 100} tone="accent" />
        <p className="mt-1.5 text-[11px] text-muted-foreground">Peak hours (5–9 PM) pay extra: base ₹20 + ₹2.5/km + ₹7 peak.</p>
      </div>

      {/* active delivery */}
      {active && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link href={`/rider/delivery/${active.id}`} className="block rounded-2xl border-2 border-brand bg-brand-softer p-4 shadow-lg ring-4 ring-brand/10">
            <p className="flex items-center justify-between font-display text-base font-extrabold text-brand">
              🛵 Active trip {active.code}
              <Badge tone="brand">{active.status.replaceAll("_", " ").toLowerCase()}</Badge>
            </p>
            <p className="mt-1.5 text-sm">
              <strong>{shops.find((s) => s.id === active.shopId)?.name}</strong> → {active.address.line1}, {active.address.area}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{active.items.length} items · {active.payment} · {active.address.instructions ?? "no special instructions"}</p>
            <Button className="mt-3 w-full">Open trip flow →</Button>
          </Link>
        </motion.div>
      )}

      {/* job board */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">New jobs nearby</p>
          {!me.online && <Badge tone="danger">Go online to receive jobs</Badge>}
        </div>
        {!me.online ? (
          <EmptyState emoji="😴" title="You're offline" body="Flip the toggle to start receiving delivery jobs in your zone." />
        ) : jobs.length === 0 && !active ? (
          <EmptyState emoji="🛵" title="Waiting for jobs…" body="New pickup requests appear here instantly. Peak hour jobs pay more." />
        ) : (
          <div className="space-y-3">
            {jobs.map((o) => {
              const shop = shops.find((s) => s.id === o.shopId);
              const payout = 20 + 5 + (new Date().getHours() >= 17 && new Date().getHours() <= 21 ? 7 : 0);
              const left = Math.max(0, 60 - Math.floor((Date.now() - o.lastStatusAt) / 1000));
              return (
                <motion.div key={o.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card-surface overflow-hidden">
                  <div className="flex items-center justify-between bg-muted px-4 py-2">
                    <p className="num flex items-center gap-2 text-sm font-extrabold"><Zap size={13} className="text-brand" /> {inr(payout)} payout</p>
                    <span className={cn("num text-xs font-bold", left <= 20 ? "text-danger" : "text-muted-foreground")}>0:{String(left).padStart(2, "0")} to accept</span>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-start gap-2.5">
                      <Navigation size={15} className="mt-1 shrink-0 text-brand" />
                      <div>
                        <p className="text-sm font-bold">{shop?.name}</p>
                        <p className="text-xs text-muted-foreground">{shop?.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <MapPin size={15} className="mt-1 shrink-0 text-accent" />
                      <div>
                        <p className="text-sm font-bold">{o.address.line1}</p>
                        <p className="text-xs text-muted-foreground">{o.address.area} · {o.address.pincode}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge tone="outline">{o.items.length} items</Badge>
                      <Badge tone={o.payment === "COD" ? "accent" : "brand"}>{o.payment}{o.payment === "COD" ? ` · collect ${inr(o.total)}` : ""}</Badge>
                      <Badge tone="info">~{o.etaMin} min</Badge>
                      {o.groupCode && <Badge tone="accent"><Layers size={10} /> multi-store {o.groupCode}</Badge>}
                      {o.paymentRisk === "review" && <Badge tone="danger">risk flag</Badge>}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button className="flex-1" onClick={() => { riderAccept(o.id); pushToast({ title: "Job accepted ✅", body: "Navigate to the shop for pickup.", kind: "success" }); }}>Accept trip</Button>
                      <Button variant="outline" className="flex-1" onClick={() => { riderReject(o.id); pushToast({ title: "Job declined", body: "Rejection rate affects future job priority.", kind: "warn" }); }}>Decline</Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
