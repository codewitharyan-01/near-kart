"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgePercent, Coins, TicketPercent, Trash2, Truck } from "lucide-react";
import { CART_RULES, multiStoreFees } from "@/lib/algorithms";
import { cartValue, useApp, type CartValidation } from "@/store/useApp";
import { Button, EmptyState, Input, SectionTitle, Stepper, Switch } from "@/components/ui/base";
import { PairingsRow } from "@/components/customer/shared";
import { SmartImage } from "@/components/ui/smart-image";
import { productImage } from "@/lib/images";
import { cn, inr } from "@/lib/utils";

export default function CartPage() {
  const cart = useApp((s) => s.cart);
  const products = useApp((s) => s.products);
  const shops = useApp((s) => s.shops);
  const offers = useApp((s) => s.offers);
  const setQty = useApp((s) => s.setQty);
  const clearCart = useApp((s) => s.clearCart);
  const applyCoupon = useApp((s) => s.applyCoupon);
  const removeCoupon = useApp((s) => s.removeCoupon);
  const appliedCoupons = useApp((s) => s.appliedCoupons);
  const useCoins = useApp((s) => s.useCoins);
  const toggleUseCoins = useApp((s) => s.toggleUseCoins);
  const loyalty = useApp((s) => s.loyalty);
  const pushToast = useApp((s) => s.pushToast);
  const [coupon, setCoupon] = useState("");

  const entries = Object.entries(cart.items);
  const lines = entries.map(([pid, qty]) => ({ p: products.find((x) => x.id === pid)!, qty })).filter((l) => l.p);
  const groups = new Map<string, typeof lines>();
  for (const l of lines) groups.set(l.p.shopId, [...(groups.get(l.p.shopId) ?? []), l]);

  const itemTotal = cartValue(cart.items, products);
  const fees = multiStoreFees(groups.size, itemTotal);
  const couponDiscount = appliedCoupons.reduce((sum, code) => {
    const o = offers.find((x) => x.code === code);
    return sum + (o && o.type === "flat" && itemTotal >= o.minOrder ? o.value : 0);
  }, 0);
  const freeShip = appliedCoupons.includes("FREESHIP") && itemTotal >= 199;
  if (freeShip) fees.total = 0;
  const coinDiscount = useCoins ? Math.min(loyalty.coins, 50) : 0;
  const total = Math.max(0, itemTotal + fees.total - couponDiscount - coinDiscount);

  const seedNames = lines.map((l) => l.p.name);
  const exclude = entries.map(([pid]) => pid);

  const gate = ((): CartValidation => {
    if (entries.length === 0) return { ok: false, reason: "empty" };
    if (itemTotal < CART_RULES.overallMin) return { ok: false, reason: "overall", needed: CART_RULES.overallMin - itemTotal };
    if (groups.size === 1) {
      if (itemTotal < CART_RULES.singleMin) return { ok: false, reason: "single", needed: CART_RULES.singleMin - itemTotal };
    } else {
      const low = [...groups.entries()].find(([, ls]) => ls.reduce((t, l) => t + l.p.price * l.qty, 0) < CART_RULES.multiPerShopMin);
      if (low) {
        const sub = low[1].reduce((t, l) => t + l.p.price * l.qty, 0);
        return { ok: false, reason: "multi", shopId: low[0], needed: CART_RULES.multiPerShopMin - sub };
      }
    }
    return { ok: true };
  })();

  if (entries.length === 0) {
    return (
      <EmptyState emoji="🛒" title="Your cart is empty" body="Fill it with goodies from your neighbourhood shops." action={<Link href="/customer"><Button>Browse essentials</Button></Link>} />
    );
  }

  const firstShop = shops.find((s) => s.id === cart.shopId);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <SectionTitle
        title="Your cart"
        sub={groups.size > 1 ? `${groups.size} stores · one delivery · routed to nearest counters` : `${firstShop?.name} · ${firstShop?.area}`}
        action={<button onClick={() => { clearCart(); pushToast({ title: "Cart cleared", kind: "info" }); }} className="flex items-center gap-1 text-xs font-semibold text-danger hover:underline"><Trash2 size={13} /> Clear all</button>}
      />

      {/* grouped by store */}
      <div className="space-y-4">
        {[...groups.entries()].map(([sid, ls]) => {
          const shop = shops.find((s) => s.id === sid);
          const sub = ls.reduce((t, l) => t + l.p.price * l.qty, 0);
          const min = groups.size > 1 ? CART_RULES.multiPerShopMin : CART_RULES.singleMin;
          const pct = Math.min(100, (sub / min) * 100);
          return (
            <div key={sid} className="card-surface overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 overflow-hidden rounded-lg">
                    <SmartImage src={shopImageFor(sid)} alt={shop?.name ?? ""} seed={sid} className="h-full w-full" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{shop?.name}</p>
                    <p className="text-[11px] text-muted-foreground">{shop?.area} · {shop?.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="num text-sm font-bold">{inr(sub)}</p>
                  {groups.size > 1 && <p className="text-[10px] text-muted-foreground">+{inr(CART_RULES.extraShopFee)} pickup fee</p>}
                </div>
              </div>
              <div className="divide-y p-1.5">
                {ls.map(({ p, qty }) => (
                  <div key={p.id} className="flex items-center gap-3 p-2">
                    <SmartImage src={productImage(p)} alt={p.name} seed={p.id} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.packSize} · {inr(p.price)}</p>
                    </div>
                    <Stepper small qty={qty} max={p.stock} onChange={(q) => setQty(p.id, q)} />
                    <span className="num w-16 shrink-0 text-right text-sm font-bold">{inr(p.price * qty)}</span>
                  </div>
                ))}
              </div>
              {sub < min && (
                <div className="border-t px-4 py-2.5">
                  <p className="text-xs font-semibold text-accent">Add {inr(min - sub)} more from this store (min {inr(min)})</p>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* free delivery / multi-store explainer */}
      <div className="card-surface p-4">
        {fees.free ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-brand"><Truck size={15} /> Free delivery unlocked on this order</p>
        ) : (
          <>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Truck size={15} className="text-brand" />
              {groups.size > 1 ? `Free delivery above ${inr(CART_RULES.multiFreeAbove)} on multi-store baskets` : `Add ${inr(299 - itemTotal)} more for FREE delivery`}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-foreground transition-all duration-500" style={{ width: `${Math.min(100, (itemTotal / (groups.size > 1 ? CART_RULES.multiFreeAbove : 299)) * 100)}%` }} />
            </div>
          </>
        )}
        {groups.size > 1 && (
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            One rider, {groups.size} pickups — each extra pickup is priced at ₹{CART_RULES.extraShopFee} so delivery never runs at a loss.
          </p>
        )}
      </div>

      {/* pairings */}
      {cart.shopId && (
        <div className="card-surface p-4">
          <PairingsRow seedNames={seedNames} shopId={cart.shopId} exclude={exclude} />
        </div>
      )}

      {/* coupons */}
      <div className="card-surface space-y-3 p-4">
        <p className="flex items-center gap-2 text-sm font-bold"><TicketPercent size={15} className="text-accent" /> Coupons & offers</p>
        {appliedCoupons.length === 0 ? (
          <div className="flex gap-2">
            <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter code e.g. NEAR25" className="uppercase" />
            <Button variant="brand" onClick={() => { const r = applyCoupon(coupon); pushToast({ title: r.message, kind: r.ok ? "success" : "warn" }); if (r.ok) setCoupon(""); }}>Apply</Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {appliedCoupons.map((c) => (
              <span key={c} className="flex items-center gap-1.5 rounded-lg bg-brand-soft px-2.5 py-1.5 text-xs font-bold text-brand">
                <BadgePercent size={13} /> {c}
                <button onClick={() => removeCoupon(c)} aria-label={`Remove ${c}`} className="ml-0.5 font-black">×</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {offers.filter((o) => o.active).map((o) => (
            <button key={o.id} onClick={() => { const r = applyCoupon(o.code); pushToast({ title: r.message, kind: r.ok ? "success" : "warn" }); }} className="rounded-lg border border-dashed border-brand/40 bg-brand-softer px-2.5 py-1.5 text-[11px] font-bold text-brand transition hover:bg-brand-soft">
              {o.code} · {o.title}
            </button>
          ))}
          <Link href="/customer/offers" className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-brand underline-offset-2 hover:underline">View all offers →</Link>
        </div>
      </div>

      {/* coins */}
      <div className="card-surface flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent"><Coins size={17} /></div>
          <div>
            <p className="text-sm font-bold">Use NearCoins</p>
            <p className="text-xs text-muted-foreground">{loyalty.coins} available · max {inr(Math.min(loyalty.coins, 50))} off</p>
          </div>
        </div>
        <Switch checked={useCoins} onChange={toggleUseCoins} label="Use NearCoins" />
      </div>

      {/* bill */}
      <div className="card-surface space-y-2 p-4 text-sm">
        <p className="mb-1 font-bold">Bill details</p>
        {[
          ["Item total", inr(itemTotal)],
          ["Delivery fee", fees.free ? "FREE" : inr(fees.baseFee)],
          ...(fees.extraShopFees > 0 ? [[`Extra-store pickups ×${groups.size - 1}`, inr(fees.extraShopFees)]] : []),
          ...(couponDiscount ? [["Coupon discount", `− ${inr(couponDiscount)}`]] : []),
          ...(coinDiscount ? [["NearCoins", `− ${inr(coinDiscount)}`]] : []),
          ["Platform fee", "₹0"],
          ["Taxes", "GST included in prices"],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between text-muted-foreground">
            <span>{l}</span>
            <span className={cn("num font-semibold", String(v).startsWith("−") ? "text-brand" : "text-foreground")}>{v}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-2.5 text-base font-bold"><span>To pay</span><span className="num">{inr(total)}</span></div>
      </div>

      {/* sticky CTA */}
      <div className="sticky bottom-20 z-40">
        <Link href={gate.ok ? "/customer/checkout" : "/customer/cart"} aria-disabled={!gate.ok}>
          <Button size="lg" className="w-full justify-between" disabled={!gate.ok}>
            <span>{!gate.ok
              ? gate.reason === "multi"
                ? `Add ${inr(gate.needed ?? 0)} from ${shops.find((s) => s.id === gate.shopId)?.name.split(" ")[0]}`
                : `Add ${inr(gate.needed ?? 0)} more to order`
              : `Proceed to checkout · ${groups.size > 1 ? `${groups.size} stores, one delivery` : "1 store"}`}</span>
            <span className="num">{inr(total)} →</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

function shopImageFor(shopId: string) {
  const map: Record<string, string> = {
    sharma: "photo-1542838132-92c53300491e",
    balaji: "photo-1568254183919-78a4f43a2877",
    freshcorner: "photo-1592924357228-91a4daadcfea",
    satyam: "photo-1604719312566-8912e9227c6a",
    shreeji: "photo-1583258292688-d0213dc5a3a8",
    patel: "photo-1456735190827-d1262f71b8a3",
    rapid: "photo-1511707171634-5f897ff02aa9",
    gujarat: "photo-1550989460-0adf9ea622e2",
  };
  return map[shopId] ?? "photo-1542838132-92c53300491e";
}
