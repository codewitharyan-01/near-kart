"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Banknote, Clock3, PackageCheck, ShoppingBag, Siren, Store, TrendingUp, Truck, Users, XCircle } from "lucide-react";
import { useApp } from "@/store/useApp";
import { demandForecast } from "@/lib/algorithms";
import { SmartImage } from "@/components/ui/smart-image";
import { shopImage } from "@/lib/images";
import { Badge, StatCard } from "@/components/ui/base";
import { inr, timeAgo } from "@/lib/utils";

function OrdersRevenueChart() {
  const data = useMemo(() => {
    const out: { day: string; orders: number; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const base = 18 + Math.round(Math.sin(i / 2) * 6) + (6 - i > 0 ? (13 - i) * 2 : 0);
      out.push({
        day: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        orders: Math.max(6, base + ((i * 7) % 5)),
        revenue: Math.max(1200, base * 268 + ((i * 311) % 900)),
      });
    }
    return out;
  }, []);

  return (
    <div className="card-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-bold">Orders & revenue — last 14 days</p>
          <p className="text-xs text-muted-foreground">GMV and order volume, Satellite cluster</p>
        </div>
        <Badge tone="brand">+18% WoW</Badge>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={2} />
          <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="r" orientation="right" hide />
          <Tooltip
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
            formatter={(value, name) => (String(name) === "revenue" ? [inr(Number(value)), "Revenue"] : [String(Number(value)), "Orders"])}
          />
          <Area yAxisId="r" type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#gRev)" isAnimationActive={false} />
          <Area yAxisId="l" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2.5} fill="url(#gOrd)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AdminOverview() {
  const orders = useApp((s) => s.orders);
  const shops = useApp((s) => s.shops);
  const riders = useApp((s) => s.riders);
  const products = useApp((s) => s.products);
  const notifications = useApp((s) => s.notifications);
  const disputes = useApp((s) => s.disputes);

  const live = orders.filter((o) => !["DELIVERED", "CANCELLED", "REJECTED"].includes(o.status));
  const gmv = orders.filter((o) => !["CANCELLED", "REJECTED"].includes(o.status)).reduce((t, o) => t + o.total, 0);
  const platformRevenue = orders.filter((o) => !["CANCELLED", "REJECTED"].includes(o.status)).reduce((t, o) => t + o.itemTotal * 0.07 + o.deliveryFee * 0.3, 0);
  const cancelled = orders.filter((o) => ["CANCELLED", "REJECTED"].includes(o.status)).length;
  const cancelRate = (cancelled / Math.max(1, orders.length)) * 100;
  const delivered = orders.filter((o) => o.status === "DELIVERED");
  const avgDelivery = 24;
  const forecast = demandForecast(shops.reduce((t, s) => t + s.ordersToday, 0));

  const alerts = [
    ...notifications.slice(0, 3).map((n) => ({ icon: Siren, tone: "info" as const, title: n.title, body: n.body, at: n.at })),
    { icon: AlertTriangle, tone: "accent" as const, title: "Rider supply tightening", body: "5–9 PM peak — 4 active riders for 6 expected jobs. Enable surge incentive.", at: Date.now() - 12 * 60000 },
    { icon: Store, tone: "danger" as const, title: "Rapid Mobile Accessories is Busy", body: "Acceptance dipped to 87% — auto-flagged for a check-in call.", at: Date.now() - 40 * 60000 },
    { icon: XCircle, tone: "danger" as const, title: "High cancellation micro-zone", body: "Prahlad Nagar: 2 rejections in 1 hour (item unavailable). Suggested: stock sync audit.", at: Date.now() - 55 * 60000 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Operations overview</h1>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · Satellite cluster</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-brand-softer px-3.5 py-2 text-xs font-semibold text-brand">
          <TrendingUp size={14} /> Forecast next hour: ~{forecast.expectedNextHour} orders {forecast.surge && "· surge pricing ON ⚡"}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Live orders" value={live.length} sub="in the pipeline now" icon={<PackageCheck size={17} />} />
        <StatCard label="GMV (demo)" value={inr(gmv, { compact: true })} sub="all non-cancelled" icon={<Banknote size={17} />} tone="info" />
        <StatCard label="Platform revenue" value={inr(platformRevenue, { compact: true })} sub="commission + delivery share" icon={<TrendingUp size={17} />} />
        <StatCard label="Active shops" value={shops.filter((s) => s.status !== "offline").length} sub={`${shops.length} onboarded`} icon={<Store size={17} />} tone="accent" />
        <StatCard label="Riders online" value={riders.filter((r) => r.online).length} sub={`${riders.length} verified`} icon={<Truck size={17} />} tone="accent" />
        <StatCard label="Avg. delivery" value={`${avgDelivery} min`} sub="target ≤ 30" icon={<Clock3 size={17} />} tone="info" />
      </div>

      <OrdersRevenueChart />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* live ops feed */}
        <div className="card-surface p-4 lg:col-span-2">
          <p className="mb-3 font-bold">Live operations feed</p>
          <div className="space-y-2.5">
            {live.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-xl border p-3">
                <div className="h-9 w-9 overflow-hidden rounded-lg">
                  <SmartImage src={shopImage(shops.find((s) => s.id === o.shopId) ?? { id: o.shopId, type: "" })} alt="Shop" seed={o.shopId} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="num text-sm font-bold">{o.code} <span className="ml-1 text-xs font-normal text-muted-foreground">{o.customerName.split(" ")[0]} · {o.address.area}</span></p>
                  <p className="text-xs text-muted-foreground">{shops.find((s) => s.id === o.shopId)?.name} · rider {riders.find((r) => r.id === o.riderId)?.name ?? "pending"}</p>
                </div>
                <Badge tone={o.status === "PLACED" ? "danger" : o.status === "OUT_FOR_DELIVERY" ? "info" : "brand"}>{o.status.replaceAll("_", " ").toLowerCase()}</Badge>
              </div>
            ))}
            {live.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No live orders right now — the sim engine will create movement shortly.</p>}
          </div>
        </div>

        {/* alerts */}
        <div className="card-surface p-4">
          <p className="mb-3 font-bold">Alerts & signals</p>
          <div className="space-y-2.5">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-xl border p-3">
                <div className={a.tone === "danger" ? "text-danger" : a.tone === "accent" ? "text-accent" : "text-info"}><a.icon size={15} className="mt-0.5 shrink-0" /></div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold leading-tight">{a.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.body}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(a.at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* network health */}
      <div className="grid gap-3 md:grid-cols-4">
        {[
          { l: "Order cancellation rate", v: `${cancelRate.toFixed(1)}%`, t: cancelRate < 5 ? "brand" : "danger", icon: XCircle },
          { l: "Rider utilization", v: "71%", t: "brand", icon: Truck },
          { l: "Stock accuracy", v: "96%", t: "brand", icon: PackageCheck },
          { l: "Open disputes", v: String(disputes.filter((d) => d.status === "Open").length), t: "accent", icon: Users },
        ].map((m) => (
          <div key={m.l} className="card-surface flex items-center gap-3 p-4">
            <div className={m.t === "danger" ? "text-danger" : m.t === "accent" ? "text-accent" : "text-brand"}><m.icon size={18} /></div>
            <div>
              <p className="num text-lg font-extrabold">{m.v}</p>
              <p className="text-[11px] text-muted-foreground">{m.l}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="rounded-xl bg-brand-softer px-4 py-3 text-xs leading-relaxed text-brand">
        🧠 <strong>Demand engine:</strong> the forecast blends hour-of-day curves with live shop load. Surge incentives switch on automatically when predicted jobs exceed rider supply by 20% — keeping the 15–30 min promise honest.
        {orders.length > 0 && <span> · {products.length} SKUs synced across {shops.length} shops.</span>}
      </p>
    </div>
  );
}
