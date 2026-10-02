"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApp } from "@/store/useApp";
import { Badge } from "@/components/ui/base";
import { inr } from "@/lib/utils";

const CAT_COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#f59e0b", "#fbbf24", "#0ea5e9", "#38bdf8", "#a78bfa"];

export default function AdminAnalyticsPage() {
  const products = useApp((s) => s.products);
  const orders = useApp((s) => s.orders);
  const shops = useApp((s) => s.shops);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) {
      for (const it of o.items) {
        const p = products.find((x) => x.id === it.productId);
        if (p) map.set(p.category, (map.get(p.category) ?? 0) + it.price * it.qty);
      }
    }
    return [...map.entries()].map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value).slice(0, 7);
  }, [orders, products]);

  const byPayment = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) map.set(o.payment, (map.get(o.payment) ?? 0) + 1);
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [orders]);

  const shopLeaderboard = useMemo(() => {
    return shops
      .map((s) => ({
        name: s.name.split(" ")[0],
        gmv: orders.filter((o) => o.shopId === s.id && !["CANCELLED", "REJECTED"].includes(o.status)).reduce((t, o) => t + o.itemTotal, 0),
      }))
      .sort((a, b) => b.gmv - a.gmv)
      .slice(0, 5);
  }, [shops, orders]);

  /* zone × time heatmap */
  const zones = ["Satellite", "Vastrapur", "Bodakdev", "Prahlad Nagar", "Jodhpur"];
  const hours = ["8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"];
  const heat = (zi: number, hi: number) => Math.max(0, Math.round(8 * Math.sin((hi + zi) / 2.4) + 6 - zi * 0.6 + (hi === 5 || hi === 6 ? 5 : 0)));

  const tip = {
    contentStyle: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 },
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Business analytics</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* category demand */}
        <div className="card-surface p-4">
          <p className="font-bold">Demand by category</p>
          <p className="mb-3 text-xs text-muted-foreground">Item value sold, all shops</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCategory} layout="vertical" margin={{ left: 30, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <Tooltip {...tip} formatter={(v) => [inr(Number(v)), "Sales"]} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                {byCategory.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* payment mix */}
        <div className="card-surface p-4">
          <p className="font-bold">Payment mix</p>
          <p className="mb-3 text-xs text-muted-foreground">COD share drives risk & float needs</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byPayment} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={4} strokeWidth={0} isAnimationActive={false}>
                {byPayment.map((_, i) => <Cell key={i} fill={CAT_COLORS[(i + 4) % CAT_COLORS.length]} />)}
              </Pie>
              <Tooltip {...tip} formatter={(v, n) => [`${Number(v)} orders`, String(n)]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3">
            {byPayment.map((p, i) => (
              <span key={p.name} className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: CAT_COLORS[(i + 4) % CAT_COLORS.length] }} />
                {p.name} · {p.value}
              </span>
            ))}
          </div>
        </div>

        {/* shop leaderboard */}
        <div className="card-surface p-4">
          <p className="font-bold">Shop leaderboard</p>
          <p className="mb-3 text-xs text-muted-foreground">GMV contributed</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={shopLeaderboard} margin={{ left: -14 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <Tooltip {...tip} formatter={(v) => [inr(Number(v)), "GMV"]} />
              <Bar dataKey="gmv" fill="#059669" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* zone heatmap */}
        <div className="card-surface p-4">
          <p className="font-bold">Zone × hour demand heatmap</p>
          <p className="mb-3 text-xs text-muted-foreground">Darker = more orders expected · plan rider shifts around 6–8 PM</p>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1">
              <thead>
                <tr>
                  <th />
                  {hours.map((h) => <th key={h} className="text-[10px] font-semibold text-muted-foreground">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {zones.map((z, zi) => (
                  <tr key={z}>
                    <td className="whitespace-nowrap pr-2 text-[10px] font-semibold text-muted-foreground">{z}</td>
                    {hours.map((h, hi) => {
                      const v = heat(zi, hi);
                      const alpha = Math.min(0.9, v / 18);
                      return (
                        <td key={h}>
                          <div
                            className="flex h-7 w-full min-w-7 items-center justify-center rounded-md text-[9px] font-bold"
                            style={{ background: v === 0 ? "var(--muted)" : `rgba(5, 150, 105, ${alpha})`, color: alpha > 0.45 ? "#fff" : "var(--muted-foreground)" }}
                            title={`${z} · ${h} · ~${v} orders`}
                          >
                            {v}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* cohort & economics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-surface p-4">
          <p className="font-bold">30-day retention cohorts</p>
          <div className="mt-3 space-y-2">
            {[
              ["Jun cohort", 64, "412 customers"],
              ["Jul cohort", 71, "388 customers"],
              ["Aug cohort", 76, "294 customers"],
            ].map(([l, v, d]) => (
              <div key={l as string}>
                <div className="flex justify-between text-xs font-semibold"><span>{l}</span><span className="num text-brand">{v}% repeat</span></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full brand-gradient rounded-full" style={{ width: `${v}%` }} />
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <Badge tone="brand" className="mt-3">Retention improving with NearCoins ↑</Badge>
        </div>

        <div className="card-surface p-4">
          <p className="font-bold">Unit economics (demo)</p>
          <div className="mt-3 space-y-1.5 text-sm">
            {[
              ["AOV", "₹262"],
              ["Gross margin / order", "₹26.10"],
              ["Contribution / order", "₹8.50"],
              ["Delivery cost / order", "₹28"],
              ["Blended CAC", "₹47"],
              ["Payback", "6 orders"],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between border-b border-dashed pb-1.5">
                <span className="text-muted-foreground">{l}</span><span className="num font-bold">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Becomes contribution-positive at scale with batching + ads revenue.</p>
        </div>

        <div className="card-surface p-4">
          <p className="font-bold">Growth levers ranked</p>
          <div className="mt-3 space-y-2 text-sm">
            {[
              ["1", "Rider batching (2 orders/trip)", "+₹9 / order"],
              ["2", "Sponsored listings at density", "+₹3–5 / order"],
              ["3", "Shop subscription SaaS", "₹499 × 150 shops / mo"],
              ["4", "White-label storefronts", "₹999 / shop / mo"],
            ].map(([n, t, v]) => (
              <div key={n} className="flex items-start gap-2.5 rounded-xl bg-muted p-2.5">
                <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full brand-gradient text-[11px] font-bold text-white">{n}</span>
                <div className="min-w-0"><p className="text-[13px] font-semibold leading-tight">{t}</p><p className="num text-[11px] text-brand">{v}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
