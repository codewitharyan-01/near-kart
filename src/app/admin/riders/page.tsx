"use client";

import { Star, ShieldCheck, Ban, IndianRupee } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Badge, Button, StatCard, Switch } from "@/components/ui/base";
import { TRow, TH, TD } from "@/components/ui/overlays";
import { inr } from "@/lib/utils";

export default function AdminRidersPage() {
  const riders = useApp((s) => s.riders);
  const orders = useApp((s) => s.orders);
  const pushToast = useApp((s) => s.pushToast);

  const online = riders.filter((r) => r.online).length;
  const tripsBy = (id: string) => orders.filter((o) => o.riderId === id && o.status === "DELIVERED").length;
  const toggleOnline = (id: string) => {
    useApp.setState((s) => ({ riders: s.riders.map((r) => (r.id === id ? { ...r, online: !r.online } : r)) }));
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Riders</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Online now" value={online} sub={`${riders.length} verified total`} tone="brand" />
        <StatCard label="Avg. rating" value="4.7" sub="network-wide" tone="accent" />
        <StatCard label="Utilization" value="71%" sub="active minutes / online minutes" tone="info" />
        <StatCard label="Pending KYC" value={0} sub="queue empty" />
      </div>

      <div className="card-surface overflow-x-auto">
        <table className="w-full min-w-[780px]">
          <thead className="border-b bg-muted/50">
            <tr><TH>Rider</TH><TH>Vehicle</TH><TH>Zone</TH><TH>Rating</TH><TH>Trips (demo)</TH><TH>Earnings today</TH><TH>Acceptance</TH><TH>Status</TH><TH className="text-right">Actions</TH></tr>
          </thead>
          <tbody>
            {riders.map((r) => (
              <TRow key={r.id}>
                <TD>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-700 text-xs font-bold text-white">
                      {r.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="num text-[11px] text-muted-foreground">{r.phone}</p>
                    </div>
                  </div>
                </TD>
                <TD className="text-xs">{r.vehicle}<span className="num block text-[10px] text-muted-foreground">{r.vehicleNumber}</span></TD>
                <TD className="text-xs">{r.zone}</TD>
                <TD className="text-xs font-bold"><Star size={11} className="inline text-amber-400" /> {r.rating}</TD>
                <TD className="num text-sm">{tripsBy(r.id)}</TD>
                <TD className="num text-sm font-bold">{inr(r.earningsToday)}</TD>
                <TD className="num text-xs">{r.acceptanceRate}%</TD>
                <TD><Badge tone={r.online ? "brand" : "neutral"}>{r.online ? "online" : "offline"}</Badge></TD>
                <TD>
                  <div className="flex items-center justify-end gap-2">
                    <Switch checked={r.online} onChange={() => toggleOnline(r.id)} size="sm" label={`Toggle ${r.name}`} />
                    <Button size="icon-sm" variant="ghost" aria-label={`Suspend ${r.name}`} onClick={() => pushToast({ title: "Suspend flow", body: "Requires a documented reason — demo only.", kind: "warn" })}>
                      <Ban size={14} />
                    </Button>
                  </div>
                </TD>
              </TRow>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border bg-brand-softer p-4 text-xs leading-relaxed text-brand">
          <p className="flex items-center gap-1.5 font-bold"><ShieldCheck size={14} /> Compliance snapshot</p>
          <p className="mt-1.5">100% riders KYC-verified · driving licenses validated · gig-worker social-security contributions (1–2% of turnover) accrued monthly per Indian platform-work rules.</p>
        </div>
        <div className="rounded-2xl border bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
          <p className="flex items-center gap-1.5 font-bold text-foreground"><IndianRupee size={14} className="text-brand" /> Incentive spend</p>
          <p className="mt-1.5">₹1,240 in peak-hour incentives this week drove 38 extra completed trips during rider shortage — a 3.1× return on incentive spend.</p>
        </div>
      </div>
    </div>
  );
}
