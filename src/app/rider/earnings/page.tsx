"use client";

import { Calculator, CreditCard, TrendingUp, Wallet, Zap } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Badge, Button, EmptyState, StatCard } from "@/components/ui/base";
import { TRow, TH, TD } from "@/components/ui/overlays";
import { dateShort, inr } from "@/lib/utils";

export default function RiderEarningsPage() {
  const riders = useApp((s) => s.riders);
  const payouts = useApp((s) => s.riderPayouts);
  const orders = useApp((s) => s.orders);
  const pushToast = useApp((s) => s.pushToast);
  const me = riders.find((r) => r.id === "r1")!;

  const myDelivered = orders.filter((o) => o.riderId === "r1" && o.status === "DELIVERED");
  const weekTrips = myDelivered.length + 34;
  const weekEarnings = me.earningsToday + 2486;
  const tips = 174;
  const incentives = 210;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Earnings</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Today" value={inr(me.earningsToday)} sub={`${me.trips > 0 ? "today's trips tracked" : "start a trip"} `} icon={<TrendingUp size={16} />} />
        <StatCard label="This week" value={inr(weekEarnings, { compact: true })} sub={`${weekTrips} trips`} tone="info" icon={<Wallet size={16} />} />
        <StatCard label="Tips earned" value={inr(tips)} sub="100% yours" tone="accent" />
        <StatCard label="Incentives" value={inr(incentives)} sub="peak + goal bonuses" tone="accent" icon={<Zap size={16} />} />
      </div>

      {/* transparent formula */}
      <div className="card-surface p-4">
        <p className="flex items-center gap-2 font-bold"><Calculator size={16} className="text-brand" /> Transparent pay formula</p>
        <div className="mt-3 space-y-2 text-sm">
          {[
            ["Base pay", "₹20", "every trip"],
            ["Distance pay", "₹2.5/km", "shop → customer"],
            ["Peak incentive", "₹7", "5–9 PM rush hours"],
            ["Customer tip", "100%", "passed through fully"],
          ].map(([l, v, d]) => (
            <div key={l} className="flex items-center justify-between rounded-xl bg-muted px-3.5 py-2.5">
              <div><p className="font-semibold">{l}</p><p className="text-[11px] text-muted-foreground">{d}</p></div>
              <span className="num font-bold text-brand">{v}</span>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl bg-foreground px-3.5 py-3 text-background">
            <span className="font-bold">Example trip (2 km, peak)</span>
            <span className="num text-lg font-extrabold">₹32</span>
          </div>
        </div>
      </div>

      {/* payout method */}
      <div className="card-surface flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><CreditCard size={17} /></div>
          <div>
            <p className="text-sm font-bold">UPI • rajesh@upi</p>
            <p className="text-xs text-muted-foreground">Weekly payouts every Monday · instant for 4.7★+</p>
          </div>
        </div>
        <Badge tone="brand">Eligible ⚡</Badge>
      </div>

      {/* payout history */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Payout history</p>
        {payouts.length === 0 ? (
          <EmptyState emoji="💸" title="No payouts yet" body="Complete trips to receive your first weekly payout." />
        ) : (
          <div className="card-surface overflow-x-auto">
            <table className="w-full min-w-[420px]">
              <thead className="border-b bg-muted/50"><tr><TH>Date</TH><TH>Trips</TH><TH className="text-right">Amount</TH><TH>Status</TH></tr></thead>
              <tbody>
                {payouts.map((p) => (
                  <TRow key={p.id}>
                    <TD className="text-xs text-muted-foreground">{dateShort(p.date)}</TD>
                    <TD className="num">{p.trips}</TD>
                    <TD className="text-right num font-bold">{inr(p.amount)}</TD>
                    <TD><Badge tone={p.status === "Paid" ? "brand" : "accent"}>{p.status}</Badge></TD>
                  </TRow>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Button variant="outline" className="w-full" onClick={() => pushToast({ title: "Instant payout requested ⚡", body: "Demo — arrives in your UPI within 30 seconds in production.", kind: "success" })}>
        ⚡ Request instant payout ({inr(me.earningsToday)})
      </Button>
    </div>
  );
}
