"use client";

import Link from "next/link";
import { Badge, Button, EmptyState, SectionTitle } from "@/components/ui/base";
import { useApp } from "@/store/useApp";
import { SmartImage } from "@/components/ui/smart-image";
import { productImage, shopImage } from "@/lib/images";
import { clockTime, dateShort, inr } from "@/lib/utils";
import { motion } from "framer-motion";
import { Radio, Layers } from "lucide-react";
import type { Order } from "@/types";

const LIVE = ["PLACED", "ACCEPTED", "PACKING", "READY_FOR_PICKUP", "RIDER_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY"];

export default function OrdersPage() {
  const orders = useApp((s) => s.orders);
  const shops = useApp((s) => s.shops);
  const mine = orders.filter((o) => o.customerId === "c1");
  const groups = new Map<string, Order[]>();
  for (const o of mine) if (o.groupCode) groups.set(o.groupCode, [...(groups.get(o.groupCode) ?? []), o]);
  const live = mine.filter((o) => LIVE.includes(o.status));
  const past = mine.filter((o) => !LIVE.includes(o.status)).sort((a, b) => b.placedAt - a.placedAt);

  const toneFor = (s: string) =>
    s === "DELIVERED" ? "brand" : s === "CANCELLED" || s === "REJECTED" ? "danger" : "accent";

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <SectionTitle title="Your orders" sub="Groceries from your neighbourhood, on record" />

      {mine.length === 0 && <EmptyState emoji="🧾" title="No orders yet" body="Your order history will appear here." action={<Link href="/customer"><Button>Start shopping</Button></Link>} />}

      {live.length > 0 && (
        <section>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand">
            <Radio size={13} className="animate-pulse" /> Live now
          </p>
          <div className="space-y-3">
            {live.map((o) => {
              const shop = shops.find((s) => s.id === o.shopId);
              return (
                <motion.div key={o.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Link href={`/customer/orders/${o.id}`} className="card-surface flex items-center gap-3 p-3.5 transition-all hover:shadow-lift hover:ring-1 hover:ring-foreground/20">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                      <SmartImage src={shopImage(shop ?? { id: o.shopId, type: "" })} alt={shop?.name ?? "Shop"} seed={o.shopId} className="h-full w-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold">{shop?.name}</p>
                        <span className="num text-[10px] text-muted-foreground">{o.code}</span>
                        {o.groupCode && (
                          <span className="ml-auto flex items-center gap-1 rounded-full bg-accent-soft px-1.5 py-0.5 text-[9px] font-bold text-accent"><Layers size={9} /> {o.groupCode} · {(groups.get(o.groupCode)?.length ?? 1)} stores</span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{o.items.map((i) => `${i.name} ×${i.qty}`).join(" · ")}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge tone="accent" className="mb-1">● {o.status.replaceAll("_", " ").toLowerCase()}</Badge>
                      <p className="num text-sm font-bold">{inr(o.total)}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Order history</p>
          <div className="space-y-2.5">
            {past.map((o) => {
              const shop = shops.find((s) => s.id === o.shopId);
              return (
                <Link key={o.id} href={`/customer/orders/${o.id}`} className="card-surface flex items-center gap-3 p-3.5 transition-all hover:shadow-lift">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl">
                    <SmartImage src={shopImage(shop ?? { id: o.shopId, type: "" })} alt={shop?.name ?? "Shop"} seed={o.id} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold">{shop?.name}</p>
                      <Badge tone={toneFor(o.status)}>{o.status.toLowerCase()}</Badge>
                    {o.groupCode && (
                      <span className="flex items-center gap-1 rounded-full bg-accent-soft px-1.5 py-0.5 text-[9px] font-bold text-accent"><Layers size={9} /> {(groups.get(o.groupCode)?.length ?? 1)}-store</span>
                    )}
                    </div>
                    <p className="text-xs text-muted-foreground">{dateShort(o.placedAt)} · {clockTime(o.placedAt)} · {o.items.length} items</p>
                    {o.rating ? <p className="mt-0.5 text-xs text-amber-500">{"★".repeat(o.rating)} <span className="text-muted-foreground">your rating</span></p> : null}
                  </div>
                  <div className="text-right">
                    <p className="num text-sm font-bold">{inr(o.total)}</p>
                    <p className="num text-[10px] text-muted-foreground">{o.code}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
