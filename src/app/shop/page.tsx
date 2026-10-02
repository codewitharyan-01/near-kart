"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Banknote, IndianRupee, Package, PackageX, Star, TrendingUp } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Badge, Button, EmptyState, StatCard } from "@/components/ui/base";
import { inr, timeAgo } from "@/lib/utils";

export default function ShopHome() {
  const orders = useApp((s) => s.orders);
  const products = useApp((s) => s.products);
  const transactions = useApp((s) => s.transactions);
  const shops = useApp((s) => s.shops);
  const shopAccept = useApp((s) => s.shopAccept);
  const pushToast = useApp((s) => s.pushToast);

  const shop = shops.find((s) => s.id === "sharma")!;
  const myOrders = orders.filter((o) => o.shopId === "sharma");
  const newOrders = myOrders.filter((o) => o.status === "PLACED");
  const activeOrders = myOrders.filter((o) => ["ACCEPTED", "PACKING", "READY_FOR_PICKUP"].includes(o.status));
  const todayOrders = myOrders.filter((o) => Date.now() - o.placedAt < 86400000 && !["CANCELLED", "REJECTED"].includes(o.status));
  const revenueToday = todayOrders.reduce((t, o) => t + o.itemTotal, 0);
  const pendingPayout = transactions.filter((t) => t.status === "Pending").reduce((t, x) => t + x.net, 0);
  const lowStock = products.filter((p) => p.shopId === "sharma" && p.status === "active" && p.stock <= p.lowStockThreshold && p.stock > 0);
  const outStock = products.filter((p) => p.shopId === "sharma" && p.stock === 0);
  const ratings = myOrders.filter((o) => o.rating).map((o) => o.rating!);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;

  /* sound-like attention: browser tab title pulse on new orders */
  useEffect(() => {
    document.title = newOrders.length > 0 ? `(${newOrders.length}) 🔔 New order — NearKart Shop` : "NearKart — Shop Dashboard";
    return () => { document.title = "NearKart — Your local shops, delivered fast"; };
  }, [newOrders.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">{shop.name}</h1>
          <p className="text-sm text-muted-foreground">{shop.area} · commission {shop.commissionPct}% · radius {shop.radiusKm} km</p>
        </div>
        <div className="flex gap-2">
          {shop.status === "offline" && (
            <span className="flex items-center gap-1.5 rounded-xl bg-danger-soft px-3 py-2 text-xs font-bold text-danger">
              <AlertTriangle size={13} /> You&apos;re offline — customers can&apos;t order
            </span>
          )}
        </div>
      </div>

      {/* new order alerts */}
      {newOrders.map((o) => (
        <motion.div
          key={o.id}
          initial={{ scale: 0.97, opacity: 0, y: -8 }}
          animate={{ scale: [0.97, 1.015, 1], opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border-2 border-brand bg-brand-softer p-4 shadow-lg ring-4 ring-brand/10"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-display text-lg font-extrabold text-brand">
              🔔 New order {o.code} <span className="num text-sm font-bold text-foreground">{inr(o.itemTotal)}</span>
            </p>
            <Badge tone="accent"><TimerPill placedAt={o.placedAt} /></Badge>
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {o.items.map((i) => (
              <li key={i.productId} className="flex items-center gap-2">
                <span>{i.emoji}</span><span className="flex-1">{i.name} <span className="text-muted-foreground">· {i.packSize}</span></span>
                <span className="num font-bold">×{i.qty}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">{o.customerName.split(" ")[0]} · {o.address.area} · {o.payment} · {o.instructions ? `“${o.instructions}”` : "no special instructions"}</p>
          <div className="mt-3 flex gap-2">
            <Button
              onClick={() => { shopAccept(o.id); pushToast({ title: "Order accepted ✅", body: "Stock deducted automatically", kind: "success" }); }}
              className="flex-1"
            >
              Accept ({o.items.length} items)
            </Button>
            <Link href="/shop/orders" className="flex-1"><Button variant="outline" className="w-full">Review & reject</Button></Link>
          </div>
        </motion.div>
      ))}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Orders today" value={todayOrders.length} sub={`${activeOrders.length} in kitchen`} icon={<TrendingUp size={17} />} />
        <StatCard label="Revenue today" value={inr(revenueToday)} sub="gross item value" icon={<IndianRupee size={17} />} tone="info" />
        <StatCard label="Pending orders" value={newOrders.length + activeOrders.length} sub="need action" icon={<Package size={17} />} tone="accent" />
        <StatCard label="Products live" value={products.filter((p) => p.shopId === "sharma" && p.status === "active").length} sub={`${lowStock.length} low · ${outStock.length} out`} icon={<Package size={17} />} tone="info" />
        <StatCard label="Pending payout" value={inr(pendingPayout)} sub="settles in 24–48h" icon={<Banknote size={17} />} />
        <StatCard label="Rating" value={avgRating ? avgRating.toFixed(1) : "—"} sub={`${ratings.length} reviews`} icon={<Star size={17} />} tone="accent" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* recent orders */}
        <div className="card-surface p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-bold">Recent orders</p>
            <Link href="/shop/orders" className="text-xs font-bold text-brand hover:underline">Manage all →</Link>
          </div>
          {myOrders.length === 0 ? (
            <EmptyState emoji="🧾" title="No orders yet today" body="Go online and wait — the neighbourhood is hungry." />
          ) : (
            <div className="divide-y">
              {myOrders.slice(0, 6).map((o) => (
                <div key={o.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="num text-sm font-bold">{o.code} <span className="ml-1 font-normal text-muted-foreground">· {o.customerName.split(" ")[0]} · {o.address.area}</span></p>
                    <p className="truncate text-xs text-muted-foreground">{o.items.map((i) => `${i.emoji}×${i.qty}`).join(" ")} · {timeAgo(o.placedAt)}</p>
                  </div>
                  <Badge tone={o.status === "DELIVERED" ? "brand" : ["CANCELLED", "REJECTED"].includes(o.status) ? "danger" : "accent"}>
                    {o.status.replaceAll("_", " ").toLowerCase()}
                  </Badge>
                  <span className="num hidden w-16 text-right text-sm font-bold sm:block">{inr(o.itemTotal)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* low stock */}
        <div className="card-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-bold">Stock alerts</p>
            <Link href="/shop/products" className="text-xs font-bold text-brand hover:underline">Manage →</Link>
          </div>
          {lowStock.length === 0 && outStock.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">All good — nothing running low 🎉</p>
          ) : (
            <ul className="space-y-2">
              {outStock.slice(0, 3).map((p) => (
                <li key={p.id} className="flex items-center gap-2.5 rounded-xl bg-danger-soft p-2.5 text-sm">
                  <PackageX size={15} className="shrink-0 text-danger" />
                  <span className="flex-1 truncate font-semibold">{p.name}</span>
                  <Badge tone="danger">OUT</Badge>
                </li>
              ))}
              {lowStock.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center gap-2.5 rounded-xl bg-accent-soft p-2.5 text-sm">
                  <AlertTriangle size={15} className="shrink-0 text-accent" />
                  <span className="flex-1 truncate font-semibold">{p.name}</span>
                  <Badge tone="accent"><span className="num">{p.stock} left</span></Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function TimerPill({ placedAt }: { placedAt: number }) {
  const left = Math.max(0, 120 - Math.floor((Date.now() - placedAt) / 1000));
  return <span className="num">⏱ {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")} to accept</span>;
}
