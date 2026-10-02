"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Clock3, Crosshair, Flame, Search, TicketPercent } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { AREAS } from "@/data/areas";
import { useApp, selectUserLoc } from "@/store/useApp";
import { rankShops } from "@/lib/algorithms";
import { canonicalProducts, nearestVariant } from "@/lib/catalog";
import { productImage } from "@/lib/images";
import { Button, Chip, EmptyState, SectionTitle } from "@/components/ui/base";
import { ProductCard, ProductQuickView, ShopCard } from "@/components/customer/shared";
import { SmartImage } from "@/components/ui/smart-image";
import { inr, timeAgo } from "@/lib/utils";
import type { Canonical } from "@/lib/catalog";

const POSTERS = [
  { title: "Milk, bread & eggs in 15 minutes", sub: "From the shop at your corner", code: "", image: "photo-1550583724-b2692b85b150", tint: "#065f46" },
  { title: "₹25 OFF above ₹199", sub: "Use code NEAR25 at checkout", code: "NEAR25", image: "photo-1542838132-92c53300491e", tint: "#171812" },
  { title: "Farm-fresh sabzi, every morning", sub: "Stocked at 6 AM by your local vendor", code: "", image: "photo-1592924357228-91a4daadcfea", tint: "#14532d" },
  { title: "Free delivery above ₹299", sub: "Top up the basket, skip the fee", code: "", image: "photo-1512621776951-a57141f2eefd", tint: "#1a2e05" },
];

function PosterCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % POSTERS.length), 4200);
    return () => clearInterval(t);
  }, []);
  const p = POSTERS[i];
  return (
    <div className="relative h-40 overflow-hidden rounded-2xl sm:h-48">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <SmartImage src={`https://images.unsplash.com/${p.image}?auto=format&fit=crop&w=1200&q=70`} alt={p.title} seed={p.code || p.title} className="h-full w-full" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${p.tint}E6 0%, ${p.tint}B3 45%, transparent 85%)` }} />
          <div className="absolute inset-y-0 left-0 flex max-w-[70%] flex-col justify-center p-5 sm:p-7">
            {p.code && <span className="mb-2 w-fit rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">Limited offer</span>}
            <p className="text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">{p.title}</p>
            <p className="mt-1 text-xs text-white/75 sm:text-sm">{p.sub}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {POSTERS.map((_, d) => (
          <button key={d} onClick={() => setI(d)} aria-label={`Poster ${d + 1}`} className={`h-1.5 rounded-full transition-all ${d === i ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}

export default function CustomerHome() {
  const shops = useApp((s) => s.shops);
  const products = useApp((s) => s.products);
  const orders = useApp((s) => s.orders);
  const loyalty = useApp((s) => s.loyalty);
  const areaId = useApp((s) => s.areaId);
  const userLoc = useApp(selectUserLoc);
  const [cat, setCat] = useState("all");
  const [quick, setQuick] = useState<Canonical | null>(null);
  const area = AREAS.find((a) => a.id === areaId);

  const ranked = useMemo(() => rankShops(shops.filter((s) => s.status !== "offline"), userLoc), [shops, userLoc]);

  /* deduped essentials — one card per real-world product, add routes to nearest shop */
  const essentials = useMemo(() => {
    const canon = canonicalProducts(products).filter((c) => (cat === "all" ? true : c.category === cat));
    return canon
      .map((c) => {
        const nv = nearestVariant(c, shops, userLoc);
        if (!nv) return null;
        const p = products.find((x) => x.id === nv.v.productId)!;
        return { canon: c, product: p, shop: shops.find((s) => s.id === nv.shop.id), distKm: nv.distKm, price: nv.v.price };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => {
        const pa = products.find((x) => x.shopId === a.shop?.id && x.name === a.canon.name)?.popularity ?? 0;
        const pb = products.find((x) => x.shopId === b.shop?.id && x.name === b.canon.name)?.popularity ?? 0;
        return pb - pa;
      })
      .slice(0, 12);
  }, [products, shops, userLoc, cat]);

  const myOrders = orders.filter((o) => o.customerId === "c1").slice(0, 3);
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-7">
      {/* location header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Crosshair size={11} className="text-brand" /> Delivering to {area?.name}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight">{greeting}, Aryan</h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {loyalty.streakDays > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1.5 text-xs font-bold text-accent">
              <Flame size={12} /> {loyalty.streakDays}
            </span>
          )}
          <span className="num flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1.5 text-xs font-bold text-brand">{loyalty.coins}</span>
        </div>
      </div>

      {/* search */}
      <Link href="/customer/search" className="flex items-center gap-2.5 rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground shadow-soft transition-all hover:border-foreground/30">
        <Search size={16} className="text-brand" />
        Search across your neighbourhood…
        <kbd className="ml-auto hidden rounded-md border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:inline">⌘K</kbd>
      </Link>

      {/* marketing posters */}
      <PosterCarousel />

      {/* categories — image tiles */}
      <section>
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
          {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
            <button key={c.id} onClick={() => { setCat(c.id); document.getElementById("essentials")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="group w-20 shrink-0 text-center">
              <span className={`block aspect-square w-full overflow-hidden rounded-2xl border transition-all ${cat === c.id ? "border-foreground ring-2 ring-foreground/15" : "group-hover:border-foreground/30"}`}>
                <SmartImage src={productImage({ name: c.label, brand: "", category: c.id === "all" ? "Grocery" : c.id })} alt={c.label} seed={c.id} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
              </span>
              <span className="mt-1.5 block truncate text-[11px] font-semibold">{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* shops near you */}
      <section>
        <SectionTitle
          title="Shops near you"
          sub="Nearest first, ranked by rating & speed"
          action={<Link href="/customer/shops" className="flex items-center gap-0.5 text-sm font-bold text-brand hover:underline">See all <ChevronRight size={14} /></Link>}
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

      {/* essentials — routed to nearest shop */}
      <section id="essentials">
        <SectionTitle
          title={cat === "all" ? "Fast essentials" : cat}
          sub="One tap adds from the nearest shop with stock"
          action={
            cat !== "all" ? <Button size="xs" variant="ghost" onClick={() => setCat("all")}>Clear filter</Button> :
            <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground"><Clock3 size={12} className="text-brand" /> 15–30 min</span>
          }
        />
        {essentials.length === 0 ? (
          <EmptyState emoji="🧺" title="Nothing in this category nearby" body="Try another category — new stock lands every morning." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {essentials.map(({ canon, product, shop, distKm }) => (
              <div key={canon.key} className="relative">
                <ProductCard product={product} canonical={canon} shop={shop} onQuickView={setQuick} />
                <span className="num pointer-events-none absolute -bottom-1 left-2 z-10 rounded-md bg-background px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground shadow-soft">
                  {distKm.toFixed(1)} km
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* reorder */}
      {myOrders.length > 0 && (
        <section>
          <SectionTitle title="Order it again" sub="Rebuilt in one tap from the nearest shop" action={<Link href="/customer/orders" className="flex items-center gap-0.5 text-sm font-bold text-brand hover:underline">All orders <ChevronRight size={14} /></Link>} />
          <div className="grid gap-3 sm:grid-cols-3">
            {myOrders.map((o) => {
              const shop = shops.find((s) => s.id === o.shopId);
              return (
                <div key={o.id} className="card-surface overflow-hidden">
                  <div className="flex h-16 items-end bg-muted">
                    <SmartImage src={productImage({ name: o.items[0]?.name ?? "", brand: "", category: "" })} alt={shop?.name ?? "Order"} seed={o.id} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold">{shop?.name}</p>
                      <span className="num shrink-0 text-sm font-bold">{inr(o.total)}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{o.items.map((i) => i.name).join(", ")}</p>
                    <div className="mt-2.5 flex gap-1.5">
                      <Link href={`/customer/orders/${o.id}`} className="flex-1 rounded-lg border py-1.5 text-center text-xs font-semibold transition hover:bg-muted">Track</Link>
                      <button
                        onClick={() => useApp.getState().reorder(o.id)}
                        className="flex-1 rounded-lg btn-ink py-1.5 text-xs font-bold text-white transition hover:opacity-85"
                      >
                        Reorder
                      </button>
                    </div>
                    <p className="mt-1.5 text-[10px] text-muted-foreground">{timeAgo(o.placedAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* quick view */}
      <ProductQuickView canonical={quick} onClose={() => setQuick(null)} />
    </div>
  );
}
