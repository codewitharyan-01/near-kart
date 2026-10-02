"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, ShieldCheck, Star, Timer } from "lucide-react";
import type { Product, Shop } from "@/types";
import { useApp } from "@/store/useApp";
import { Badge, Button, Stepper } from "@/components/ui/base";
import { Dialog } from "@/components/ui/overlays";
import { haversineKm, inr } from "@/lib/utils";
import { selectUserLoc } from "@/store/useApp";

/* ------------------------- smart add-to-cart hook ------------------------ */
export function useAddToCart() {
  const addToCart = useApp((s) => s.addToCart);
  const adoptCart = useApp((s) => s.adoptCart);
  const clearCart = useApp((s) => s.clearCart);
  const pushToast = useApp((s) => s.pushToast);
  const shops = useApp((s) => s.shops);
  const cart = useApp((s) => s.cart);
  const [pending, setPending] = useState<{ productId: string; shopName: string } | null>(null);

  const add = (productId: string, qty = 1) => {
    const res = addToCart(productId, qty);
    if (res.ok) {
      pushToast({ title: "Added to cart 🛒", kind: "success" });
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
              pushToast({ title: "New cart started 🛒", kind: "success" });
              setPending(null);
            }
          }}
        >
          Start new cart
        </Button>
      </div>
    </Dialog>
  );

  return { add, dialog, cart };
}

/* ------------------------------ shop card ------------------------------- */
export function ShopCard({ shop, distKm, wide }: { shop: Shop; distKm: number; wide?: boolean }) {
  const loc = useApp(selectUserLoc);
  const online = shop.status === "online";
  const eta = shop.prepTimeMin + Math.round(distKm * 3.2) + 6;
  return (
    <Link
      href={`/customer/shop/${shop.id}`}
      className={`group card-surface flex shrink-0 items-center gap-3 p-3 transition-all hover:-translate-y-0.5 hover:shadow-md ${wide ? "w-full" : "w-64"}`}
    >
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl ${shop.gradient} ${!online ? "opacity-50 saturate-0" : ""}`}>
        {shop.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-bold">{shop.name}</p>
          {shop.verified && <ShieldCheck size={13} className="shrink-0 text-brand" />}
        </div>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5 font-semibold text-amber-500"><Star size={11} className="fill-amber-400 text-amber-400" />{shop.rating}</span>
          <span className="flex items-center gap-0.5"><MapPin size={10} />{distKm.toFixed(1)} km</span>
          <span className="flex items-center gap-0.5"><Timer size={10} />{eta} min</span>
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          {online ? (
            <Badge tone="brand">Open · {shop.ordersToday} orders today</Badge>
          ) : shop.status === "busy" ? (
            <Badge tone="accent">Busy — longer wait</Badge>
          ) : (
            <Badge tone="danger">Closed</Badge>
          )}
          {shop.sponsored && <Badge tone="outline">Promoted</Badge>}
        </div>
      </div>
    </Link>
  );
}

/* ----------------------------- product card ----------------------------- */
export function ProductCard({ product, shop, compact }: { product: Product; shop?: Shop; compact?: boolean }) {
  const { add, dialog } = useAddToCart();
  const qty = useApp((s) => s.cart.items[product.id] ?? 0);
  const out = product.stock <= 0 || product.status !== "active";
  const low = !out && product.stock <= product.lowStockThreshold;
  const discount = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  return (
    <>
      <div className={`card-surface group relative flex flex-col p-3 transition-all hover:shadow-md ${out ? "opacity-55 saturate-50" : ""}`}>
        <div className="relative mb-2 flex h-20 items-center justify-center rounded-xl bg-muted text-4xl">
          <span className="drop-shadow-sm">{product.emoji}</span>
          {discount > 0 && !out && (
            <span className="num absolute left-1.5 top-1.5 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">{discount}% OFF</span>
          )}
          {low && (
            <span className="absolute bottom-1.5 left-1.5 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold text-black">Only {product.stock} left</span>
          )}
          {out && (
            <span className="absolute rounded-md bg-zinc-900/85 px-2 py-1 text-[10px] font-bold text-white">Out of stock</span>
          )}
        </div>
        <p className="line-clamp-2 min-h-8 text-[13px] font-semibold leading-tight">{product.name}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{product.packSize}{shop ? ` · ${shop.name}` : ""}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <span className="num text-sm font-bold">{inr(product.price)}</span>
            {product.mrp > product.price && <span className="num ml-1 text-[11px] text-muted-foreground line-through">{product.mrp}</span>}
          </div>
          {!out && <Stepper small qty={qty} max={product.stock} onChange={(q) => add(product.id, q - qty)} />}
          {out && <Button size="xs" variant="secondary" disabled>Notify me</Button>}
        </div>
        {!compact && null}
      </div>
      {dialog}
    </>
  );
}

/* --------------------------- cross-shop availability -------------------- */
export function crossShopAvailability(products: Product[], query: string) {
  const matches = products.filter(
    (p) => p.status === "active" && p.stock > 0 && p.name.toLowerCase().includes(query.toLowerCase()),
  );
  const shopsWith = new Set(matches.map((m) => m.shopId));
  return { matches, shopsWith };
}

export function distanceOf(shopLoc: { lat: number; lng: number }, userLoc: { lat: number; lng: number }) {
  return haversineKm(userLoc, shopLoc);
}
