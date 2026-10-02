"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Search, TicketPercent } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { useApp, selectUserLoc } from "@/store/useApp";
import { rankShops } from "@/lib/algorithms";
import { Chip, EmptyState, SectionTitle, Badge } from "@/components/ui/base";
import { ProductCard, ShopCard } from "@/components/customer/shared";
import { inr, timeAgo } from "@/lib/utils";

export default function CustomerHome() {
  const shops = useApp((s) => s.shops);
  const products = useApp((s) => s.products);
  const orders = useApp((s) => s.orders);
  const offers = useApp((s) => s.offers);
  const loyalty = useApp((s) => s.loyalty);
  const userLoc = useApp(selectUserLoc);
  const [cat, setCat] = useState("all");

  const ranked = useMemo(() => rankShops(shops, userLoc).filter((r) => r.shop.status !== "offline"), [shops, userLoc]);
  const onlineShopIds = new Set(shops.filter((s) => s.status !== "offline").map((s) => s.id));

  const essentials = useMemo(
    () =>
      products
        .filter((p) => onlineShopIds.has(p.shopId) && p.status === "active" && p.stock > 0 && (cat === "all" ? true : p.category === cat))
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 10),
    [products, cat, onlineShopIds],
  );

  const myOrders = orders.filter((o) => o.customerId === "c1").slice(0, 3);
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-7">
      {/* greeting + streak */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{greeting},</p>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Aryan 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          {loyalty.streakDays > 0 && (
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-bold text-accent"
            >
              <Flame size={13} /> {loyalty.streakDays}-day streak
            </motion.span>
          )}
          <span className="flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand">
            🪙 {loyalty.coins} NearCoins
          </span>
        </div>
      </div>

      {/* search */}
      <Link href="/customer/search" className="flex items-center gap-2.5 rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm transition-all hover:border-brand/40 hover:shadow">
        <Search size={17} className="text-brand" />
        Search milk, bread, chips, charger…
      </Link>

      {/* offers strip */}
      <div className="scrollbar-hide flex gap-3 overflow-x-auto">
        {offers.filter((o) => o.active).map((o) => (
          <div key={o.id} className="flex w-64 shrink-0 items-center gap-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 p-3.5 text-white shadow-sm">
            <TicketPercent size={26} className="shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{o.title}</p>
              <p className="text-[11px] text-white/75">Code: <span className="font-mono font-bold">{o.code}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* categories */}
      <div>
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
              <span className="mr-1">{c.emoji}</span>{c.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* shops near you */}
      <section>
        <SectionTitle
          title="Shops near you"
          sub="Ranked by distance, rating & speed — with real local inventory"
          action={<Link href="/customer/shops" className="text-sm font-bold text-brand hover:underline">See all →</Link>}
        />
        {ranked.length === 0 ? (
          <EmptyState emoji="🏪" title="No shops open right now" body="Check back soon — your neighbourhood stores open early!" />
        ) : (
          <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
            {ranked.slice(0, 6).map((r) => (
              <ShopCard key={r.shop.id} shop={r.shop} distKm={r.distKm} />
            ))}
          </div>
        )}
      </section>

      {/* fast essentials */}
      <section>
        <SectionTitle
          title={cat === "all" ? "Fast essentials" : CATEGORIES.find((c) => c.id === cat)?.label ?? "Products"}
          sub="Delivered from stores around you"
        />
        {essentials.length === 0 ? (
          <EmptyState emoji="🧺" title="Nothing here yet" body="Try another category" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {essentials.map((p) => (
              <ProductCard key={p.id} product={p} shop={shops.find((s) => s.id === p.shopId)} />
            ))}
          </div>
        )}
      </section>

      {/* recent orders */}
      {myOrders.length > 0 && (
        <section>
          <SectionTitle title="Order it again" sub="One tap to rebuild a past order" action={<Link href="/customer/orders" className="text-sm font-bold text-brand hover:underline">All orders →</Link>} />
          <div className="grid gap-3 sm:grid-cols-3">
            {myOrders.map((o) => {
              const shop = shops.find((s) => s.id === o.shopId);
              return (
                <div key={o.id} className="card-surface p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold">{shop?.emoji} {shop?.name}</p>
                    <Badge tone={o.status === "DELIVERED" ? "brand" : o.status === "CANCELLED" || o.status === "REJECTED" ? "danger" : "accent"}>{o.status.toLowerCase()}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {o.items.map((i) => `${i.emoji} ${i.name}`).join(", ")}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="num text-sm font-bold">{inr(o.total)}</span>
                    <div className="flex gap-1.5">
                      <Link href={`/customer/orders/${o.id}`}><span className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-muted">Track</span></Link>
                      <button
                        onClick={() => useApp.getState().reorder(o.id)}
                        className="rounded-lg brand-gradient px-2.5 py-1.5 text-xs font-bold text-white transition hover:brightness-110"
                      >
                        Reorder
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">{timeAgo(o.placedAt)}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
