"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight, Clock3, MapPin, ShieldCheck, Sparkles, Star, Store } from "lucide-react";
import type { Product, Shop } from "@/types";
import { useApp, selectUserLoc } from "@/store/useApp";
import { Badge, Button, Stepper } from "@/components/ui/base";
import { Dialog } from "@/components/ui/overlays";
import { SmartImage } from "@/components/ui/smart-image";
import { pairingsFor, rankVariants, type Canonical } from "@/lib/catalog";
import { productImage, shopImage } from "@/lib/images";
import { inr } from "@/lib/utils";

/* ------------------------- smart add-to-cart hook ------------------------ */
export function useAddToCart() {
  const addToCart = useApp((s) => s.addToCart);
  const clearCart = useApp((s) => s.clearCart);
  const pushToast = useApp((s) => s.pushToast);
  const shops = useApp((s) => s.shops);
  const [pending, setPending] = useState<{ productId: string; shopName: string } | null>(null);

  const add = (productId: string, qty = 1) => {
    const res = addToCart(productId, qty);
    if (res.ok) {
      pushToast({ title: "Added to cart", kind: "success" });
      return true;
    }
    if (res.reason === "other-shop" && res.shopName) {
      setPending({ productId, shopName: res.shopName });
      return false;
    }
    pushToast({ title: res.reason ?? "Cannot add item", kind: "warn" });
    return false;
  };

  const dialog = (
    <Dialog open={!!pending} onClose={() => setPending(null)} title="Start a new cart?">
      <p className="text-sm text-muted-foreground">
        Your cart contains items from <strong className="text-foreground">{pending?.shopName}</strong>. NearKart delivers
        one shop per order — faster pickups, cleaner refunds.
      </p>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setPending(null)}>Keep old cart</Button>
        <Button
          className="flex-1"
          onClick={() => {
            if (pending) {
              clearCart();
              addToCart(pending.productId, 1);
              pushToast({ title: "New cart started", kind: "success" });
              setPending(null);
            }
          }}
        >
          Start new cart
        </Button>
      </div>
    </Dialog>
  );

  return { add, dialog };
}

/* --------------------------- product quick view ------------------------- */
export function ProductQuickView({ canonical, onClose }: { canonical: Canonical | null; onClose: () => void }) {
  const shops = useApp((s) => s.shops);
  const products = useApp((s) => s.products);
  const userLoc = useApp(selectUserLoc);
  const setQty = useApp((s) => s.setQty);
  const { add, dialog } = useAddToCart();
  const [qty, setQtyLocal] = useState(1);
  const [picked, setPicked] = useState<string | null>(null); // shopId override

  const ranked = useMemo(() => (canonical ? rankVariants(canonical, shops, userLoc) : []), [canonical, shops, userLoc]);
  const best = ranked[0] ?? null;
  const chosenShopId = picked ?? best?.shop.id;
  const chosen = ranked.find((r) => r.shop.id === chosenShopId);
  const chosenProduct = chosen ? products.find((p) => p.id === chosen.v.productId) : null;

  const pairs = useMemo(() => {
    if (!chosenProduct || !chosenShopId) return [];
    return pairingsFor([canonical?.name ?? ""], products.filter((p) => p.shopId === chosenShopId), [chosenProduct.id], 6);
  }, [chosenProduct, chosenShopId, products, canonical]);

  if (!canonical) return <>{dialog}</>;
  const eta = chosen?.shop ? chosen.shop.prepTimeMin + Math.round(chosen.distKm * 3.2) + 6 : 20;

  return (
    <>
      <Dialog open={!!canonical} onClose={onClose} title={undefined} wide>
        {canonical && (
          <div>
            <div className="grid gap-5 sm:grid-cols-[240px_1fr]">
              <div className="relative">
                <SmartImage src={productImage(canonical)} alt={canonical.name} seed={canonical.key} rounded className="aspect-square w-full object-cover" />
                {canonical.mrp > canonical.price && (
                  <span className="num absolute left-3 top-3 rounded-lg bg-foreground px-2 py-1 text-[11px] font-bold text-background">
                    {Math.round((1 - canonical.price / canonical.mrp) * 100)}% off
                  </span>
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{canonical.brand} · {canonical.packSize}</p>
                <h3 className="mt-1 text-xl font-bold tracking-tight">{canonical.name}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="num text-2xl font-bold">{inr(chosen?.v.price ?? canonical.price)}</span>
                  {(chosen?.v.mrp ?? canonical.mrp) > (chosen?.v.price ?? canonical.price) && (
                    <span className="num text-sm text-muted-foreground line-through">{inr(chosen?.v.mrp ?? canonical.mrp)}</span>
                  )}
                  <span className="text-[11px] text-muted-foreground">· GST included</span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {canonical.category === "Fruits & Vegetables"
                    ? "Sourced fresh each morning from the wholesale mandi and stocked by your neighbourhood seller. Perishables are auto-hidden near expiry."
                    : `Genuine ${canonical.brand} stock, live-counted by the shop. Sold-out items disappear from the app automatically.`}
                </p>

                {/* fulfillment routing — the nearest shop wins */}
                <div className="mt-4 rounded-xl bg-brand-softer p-3.5">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-brand">
                    <Sparkles size={12} /> Routed to your fastest store
                  </p>
                  {chosen?.shop ? (
                    <p className="mt-1 text-sm font-semibold">{chosen.shop.name} · {chosen.distKm.toFixed(1)} km · ~{eta} min</p>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-danger">Currently unavailable nearby — check back soon.</p>
                  )}
                  {ranked.length > 1 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {ranked.slice(0, 3).map((r) => (
                        <button
                          key={r.shop.id}
                          onClick={() => setPicked(r.shop.id)}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${r.shop.id === chosenShopId ? "border-brand bg-brand-soft text-brand" : "text-muted-foreground hover:border-foreground/30"}`}
                        >
                          {r.shop.name.split(" ")[0]} · {r.distKm.toFixed(1)} km · {inr(r.v.price)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <Stepper
                    qty={qty}
                    max={chosen?.v.stock ?? 9}
                    onChange={(q) => {
                      setQtyLocal(Math.max(0, q));
                      if (chosenProduct) setQty(chosenProduct.id, q); // 0 removes it from the cart
                    }}
                  />
                  <Button
                    variant="brand"
                    className="flex-1"
                    disabled={!chosenProduct || qty === 0}
                    onClick={() => { if (chosenProduct) { add(chosenProduct.id, qty); onClose(); setQtyLocal(1); setPicked(null); } }}
                  >
                    {qty > 1 ? `Add ${qty} · ${inr((chosen?.v.price ?? canonical.price) * qty)}` : "Add to cart"}
                  </Button>
                </div>
              </div>
            </div>

            {/* pairings */}
            {pairs.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <p className="mb-2.5 text-sm font-bold">Pairs perfectly with this</p>
                <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
                  {pairs.map((p) => (
                    <div key={p.id} className="w-36 shrink-0">
                      <SmartImage src={productImage(p)} alt={p.name} seed={p.id} className="aspect-square w-full rounded-xl object-cover" />
                      <p className="mt-1.5 line-clamp-1 text-xs font-semibold">{p.name}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="num text-xs font-bold">{inr(p.price)}</span>
                        <Button size="xs" variant="secondary" onClick={() => add(p.id, 1)}>Add</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>
      {dialog}
    </>
  );
}

/* ----------------------------- product card ----------------------------- */
export function ProductCard({
  product,
  canonical,
  shop,
  onQuickView,
}: {
  product: Product;
  canonical?: Canonical;
  shop?: Shop;
  onQuickView?: (c: Canonical) => void;
}) {
  const { add, dialog } = useAddToCart();
  const setQty = useApp((s) => s.setQty);
  const cartQty = useApp((s) => s.cart.items[product.id] ?? 0);
  const out = product.stock <= 0 || product.status !== "active";
  const low = !out && product.stock <= product.lowStockThreshold;
  const discount = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  const openQuick = () => {
    if (canonical && onQuickView) onQuickView(canonical);
  };

  return (
    <>
      <div className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lift ${out ? "opacity-60 saturate-50" : ""}`}>
        <button onClick={openQuick} className="relative block aspect-[4/3] w-full overflow-hidden bg-muted text-left" aria-label={`View ${product.name}`}>
          <SmartImage src={productImage(product)} alt={product.name} seed={product.id} className="h-full w-full transition-transform duration-300 group-hover:scale-[1.04]" />
          {discount > 0 && !out && (
            <span className="num absolute left-2 top-2 rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">{discount}% off</span>
          )}
          {low && (
            <span className="absolute bottom-2 left-2 rounded-md bg-background/95 px-1.5 py-0.5 text-[10px] font-bold text-accent">Only {product.stock} left</span>
          )}
          {out && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/60">
              <span className="rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-bold text-background">Out of stock</span>
            </span>
          )}
        </button>
        <div className="flex flex-1 flex-col p-2.5">
          <button onClick={openQuick} className="text-left">
            <p className="line-clamp-1 text-[13px] font-semibold leading-tight">{product.name}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{product.packSize}{shop ? ` · ${shop.name.split(" ")[0]}` : ""}</p>
          </button>
          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <div>
              <span className="num text-sm font-bold">{inr(product.price)}</span>
              {product.mrp > product.price && <span className="num ml-1 text-[11px] text-muted-foreground line-through">{product.mrp}</span>}
            </div>
            {!out && (
              <Stepper
                small
                qty={cartQty}
                max={product.stock}
                onChange={(q) => (cartQty > 0 ? setQty(product.id, q) : add(product.id, q))}
              />
            )}
            {out && <Button size="xs" variant="secondary" disabled>Notify</Button>}
          </div>
        </div>
      </div>
      {dialog}
    </>
  );
}

/* ------------------------------- shop card ------------------------------- */
export function ShopCard({ shop, distKm, wide }: { shop: Shop; distKm: number; wide?: boolean }) {
  const online = shop.status === "online";
  const eta = shop.prepTimeMin + Math.round(distKm * 3.2) + 6;
  return (
    <Link
      href={`/customer/shop/${shop.id}`}
      className={`group block shrink-0 overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lift ${wide ? "w-full" : "w-64"}`}
    >
      <div className="relative h-28 w-full overflow-hidden bg-muted">
        <SmartImage src={shopImage(shop)} alt={shop.name} seed={shop.id} className="h-full w-full transition-transform duration-300 group-hover:scale-[1.05]" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5">
          {online ? (
            <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-foreground">Open · {eta} min</span>
          ) : shop.status === "busy" ? (
            <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-accent">Busy</span>
          ) : (
            <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-danger">Closed</span>
          )}
          {shop.sponsored && <span className="rounded-full bg-foreground/85 px-2 py-0.5 text-[10px] font-bold text-white">Promoted</span>}
        </div>
        {shop.verified && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-brand">
            <ShieldCheck size={10} /> Verified
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-bold">{shop.name}</p>
          <span className="flex shrink-0 items-center gap-0.5 text-xs font-bold text-foreground">
            <Star size={11} className="fill-amber-500 text-amber-500" /> {shop.rating}
          </span>
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{shop.type}</span>·<span className="flex items-center gap-0.5"><MapPin size={10} /> {distKm.toFixed(1)} km</span>
          {online && <span className="ml-auto hidden text-[10px] sm:inline">{shop.ordersToday} orders today</span>}
        </p>
      </div>
    </Link>
  );
}

/* ------------------------- paired-suggestions row ------------------------ */
export function PairingsRow({ seedNames, shopId, exclude }: { seedNames: string[]; shopId: string; exclude: string[] }) {
  const products = useApp((s) => s.products);
  const { add, dialog } = useAddToCart();
  const pairs = useMemo(() => pairingsFor(seedNames, products.filter((p) => p.shopId === shopId), exclude, 8), [seedNames, products, shopId, exclude]);
  if (pairs.length === 0) return null;
  return (
    <>
      <div>
        <p className="mb-1 flex items-center gap-1.5 text-sm font-bold">
          <Sparkles size={14} className="text-brand" /> Complete your basket
        </p>
        <p className="mb-2.5 text-xs text-muted-foreground">People who bought {seedNames[0]?.toLowerCase()} usually add these — all in stock at this shop.</p>
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
          {pairs.map((p) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-32 shrink-0">
              <SmartImage src={productImage(p)} alt={p.name} seed={p.id} className="aspect-square w-full rounded-xl object-cover" />
              <p className="mt-1.5 line-clamp-1 text-xs font-semibold">{p.name}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="num text-xs font-bold">{inr(p.price)}</span>
                <Button size="xs" variant="secondary" onClick={() => add(p.id, 1)}>Add</Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      {dialog}
    </>
  );
}

/* --------------------------- shop availability hint ---------------------- */
export function CrossShopHint({ count }: { count: number }) {
  if (count <= 1) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
      <Store size={10} /> Also available at {count - 1} other {count - 1 === 1 ? "shop" : "shops"} nearby
    </p>
  );
}

export { ChevronRight, Clock3, Check };
