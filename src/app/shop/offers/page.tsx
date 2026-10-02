"use client";

import { useState } from "react";
import { BadgePercent, Eye, IndianRupee, Plus, TrendingUp } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Badge, Button, EmptyState, Field, Input, Progress, Select, StatCard, Switch } from "@/components/ui/base";
import { Dialog } from "@/components/ui/overlays";
import { inr } from "@/lib/utils";
import type { Offer } from "@/types";

export default function ShopOffersPage() {
  const offers = useApp((s) => s.offers);
  const pushToast = useApp((s) => s.pushToast);
  const [createOpen, setCreateOpen] = useState(false);
  const [type, setType] = useState<Offer["type"]>("flat");

  const totalOrders = offers.reduce((t, o) => t + o.usedCount, 0);
  const totalRevenue = offers.reduce((t, o) => t + o.revenue, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Offers & promotions</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={14} /> Create offer</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Active offers" value={offers.filter((o) => o.active).length} icon={<BadgePercent size={16} />} />
        <StatCard label="Orders driven" value={totalOrders} tone="info" icon={<TrendingUp size={16} />} />
        <StatCard label="Revenue influenced" value={inr(totalRevenue, { compact: true })} tone="accent" icon={<IndianRupee size={16} />} />
        <StatCard label="Avg. conversion" value="11.6%" sub="views → orders" icon={<Eye size={16} />} />
      </div>

      {offers.length === 0 ? (
        <EmptyState emoji="🎟️" title="No offers yet" body="Offers lift order frequency by 20–30% in pilot stores." action={<Button onClick={() => setCreateOpen(true)}>Create your first offer</Button>} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {offers.map((o) => (
            <div key={o.id} className="card-surface p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent"><BadgePercent size={20} /></div>
                  <div>
                    <p className="text-sm font-bold">{o.title}</p>
                    <p className="text-xs text-muted-foreground">{o.description}</p>
                  </div>
                </div>
                <Switch checked={o.active} onChange={(v) => { useApp.setState((s) => ({ offers: s.offers.map((x) => (x.id === o.id ? { ...x, active: v } : x)) })); pushToast({ title: v ? "Offer live" : "Offer paused", kind: "success" }); }} label={`Toggle ${o.code}`} size="sm" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  [o.views.toLocaleString("en-IN"), "views"],
                  [String(o.usedCount), "orders"],
                  [inr(o.revenue, { compact: true }), "revenue"],
                ].map(([v, l]) => (
                  <div key={l} className="rounded-xl bg-muted p-2">
                    <p className="num text-sm font-bold">{v}</p>
                    <p className="text-[10px] text-muted-foreground">{l}</p>
                  </div>
                ))}
              </div>
              <Progress className="mt-3" value={(o.usedCount / Math.max(1, o.views)) * 100 * 6} />
              <p className="num mt-1 text-[11px] text-muted-foreground">{((o.usedCount / Math.max(1, o.views)) * 100).toFixed(1)}% conversion · code {o.code}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card-surface p-4">
        <p className="text-sm font-bold">📣 Sponsored placement</p>
        <p className="mt-1 text-xs text-muted-foreground">Boost your shop to the top of customer discovery in Satellite. ₹49/day per zone — pay only for verified clicks.</p>
        <Button size="sm" variant="accent" className="mt-3" onClick={() => pushToast({ title: "Demo mode", body: "Ads billing is simulated in this prototype.", kind: "info" })}>
          Boost my shop — ₹49/day
        </Button>
      </div>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Create offer">
        <div className="space-y-3">
          <Field label="Offer type">
            <Select value={type} onChange={(e) => setType(e.target.value as Offer["type"])}>
              <option value="flat">Flat ₹ discount</option>
              <option value="percent">Percentage % discount</option>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={type === "flat" ? "Discount (₹)" : "Discount (%)"}>
              <Input type="number" placeholder={type === "flat" ? "25" : "10"} />
            </Field>
            <Field label="Min order (₹)"><Input type="number" placeholder="199" /></Field>
          </div>
          {type === "percent" && <Field label="Max discount (₹)"><Input type="number" placeholder="100" /></Field>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valid from"><Input type="date" /></Field>
            <Field label="Valid to"><Input type="date" /></Field>
          </div>
          <Button
            className="w-full"
            onClick={() => { setCreateOpen(false); pushToast({ title: "Offer submitted ✅", body: "Goes live after a quick platform review.", kind: "success" }); }}
          >
            Publish offer
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
