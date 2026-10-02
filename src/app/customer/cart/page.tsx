"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BadgePercent, Coins, TicketPercent, Trash2, Truck } from "lucide-react";
import { MIN_ORDER, cartValue, useApp } from "@/store/useApp";
import { basketSuggestions, deliveryFeeFor } from "@/lib/algorithms";
import { Button, EmptyState, Input, SectionTitle, Stepper, Switch } from "@/components/ui/base";
import { Dialog } from "@/components/ui/overlays";
import { inr } from "@/lib/utils";

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
  const [suggestOpen, setSuggestOpen] = useState(false);

  const shop = shops.find((s) => s.id === cart.shopId);
  const entries = Object.entries(cart.items);
  const lines = entries.map(([pid, qty]) => ({ p: products.find((x) => x.id === pid)!, qty })).filter((l) => l.p);
  const itemTotal = cartValue(cart.items, products);
  const gap = Math.max(0, MIN_ORDER - itemTotal);
  const freeGap = Math.max(0, 299 - itemTotal);
  const deliveryFee = deliveryFeeFor(itemTotal);
  const couponDiscount = appliedCoupons.reduce((sum, code) => {
    const o = offers.find((x) => x.code === code);
    return sum + (o && o.type === "flat" && itemTotal >= o.minOrder ? o.value : 0);
  }, 0);
  const freeShip = appliedCoupons.includes("FREESHIP") && itemTotal >= 199;
  const coinDiscount = useCoins ? Math.min(loyalty.coins, 50) : 0;
  const total = Math.max(0, itemTotal + (freeShip ? 0 : deliveryFee) - couponDiscount - coinDiscount);

  const suggestions = useMemo(() => {
    if (!cart.shopId) return [];
    return basketSuggestions(products, cart.shopId, gap || 40, Object.keys(cart.items));
  }, [products, cart, gap]);

  if (entries.length === 0 || !shop) {
    return (
      <EmptyState
        emoji="🛒"
        title="Your cart is empty"
        body="Fill it with goodies from your neighbourhood shops."
        action={<Link href="/customer"><Button>Start shopping</Button></Link>}
      />
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Your cart"
        sub={`${shop.emoji} ${shop.name} · one shop per order`}
        action={<button onClick={() => { clearCart(); pushToast({ title: "Cart cleared", kind: "info" }); }} className="flex items-center gap-1 text-xs font-semibold text-danger hover:underline"><Trash2 size={13} /> Clear</button>}
      />

      {/* items */}
      <div className="card-surface divide-y p-1">
        {lines.map(({ p, qty }) => (
          <div key={p.id} className="flex items-center gap-3 p-2.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">{p.emoji}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.packSize} · {inr(p.price)}</p>
            </div>
            <Stepper small qty={qty} max={p.stock} onChange={(q) => setQty(p.id, q)} />
            <span className="num w-16 shrink-0 text-right text-sm font-bold">{inr(p.price * qty)}</span>
          </div>
        ))}
      </div>

      {/* free delivery nudge — progress psychology */}
      {freeGap > 0 ? (
        <div className="card-surface p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Truck size={16} className="text-brand" /> Add <span className="num text-brand">{inr(freeGap)}</span> more for FREE delivery
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full brand-gradient rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (itemTotal / 299) * 100)}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Free delivery above ₹299 · otherwise ₹25 flat</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-2xl bg-brand-soft p-4 text-sm font-semibold text-brand">
          🎉 You&apos;ve unlocked FREE delivery on this order!
        </div>
      )}

      {/* coupons */}
      <div className="card-surface space-y-3 p-4">
        <p className="flex items-center gap-2 text-sm font-bold"><TicketPercent size={16} className="text-accent" /> Coupons & offers</p>
        {appliedCoupons.length === 0 ? (
          <div className="flex gap-2">
            <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter code e.g. NEAR25" className="uppercase" />
            <Button
              onClick={() => {
                const r = applyCoupon(coupon);
                pushToast({ title: r.message, kind: r.ok ? "success" : "warn" });
                if (r.ok) setCoupon("");
              }}
            >
              Apply
            </Button>
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
            <button
              key={o.id}
              onClick={() => { const r = applyCoupon(o.code); pushToast({ title: r.message, kind: r.ok ? "success" : "warn" }); }}
              className="rounded-lg border border-dashed border-brand/50 bg-brand-softer px-2.5 py-1.5 text-[11px] font-bold text-brand transition hover:bg-brand-soft"
            >
              {o.code} · {o.title}
            </button>
          ))}
        </div>
      </div>

      {/* NearCoins */}
      <div className="card-surface flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent"><Coins size={18} /></div>
          <div>
            <p className="text-sm font-bold">Use NearCoins</p>
            <p className="text-xs text-muted-foreground">{loyalty.coins} coins available · max {inr(Math.min(loyalty.coins, 50))} off</p>
          </div>
        </div>
        <Switch checked={useCoins} onChange={toggleUseCoins} label="Use NearCoins" />
      </div>

      {/* min-order gate with suggestions */}
      {gap > 0 && (
        <div className="rounded-2xl border border-accent/40 bg-accent-soft p-4">
          <p className="text-sm font-bold text-accent">Add {inr(gap)} more to place your order</p>
          <p className="mt-0.5 text-xs text-accent/80">Minimum order is {inr(MIN_ORDER)} — it keeps delivery fast and affordable for everyone.</p>
          <Button size="sm" variant="accent" className="mt-3" onClick={() => setSuggestOpen(true)}>Add recommended items ✨</Button>
          <Dialog open={suggestOpen} onClose={() => setSuggestOpen(false)} title="People also add">
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { useApp.getState().addToCart(p.id, 1); pushToast({ title: `${p.name} added`, kind: "success" }); }}
                  className="flex items-center gap-2 rounded-xl border p-2.5 text-left transition hover:border-brand"
                >
                  <span className="text-xl">{p.emoji}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold">{p.name}</span>
                    <span className="num block text-[11px] text-muted-foreground">{inr(p.price)}</span>
                  </span>
                </button>
              ))}
            </div>
          </Dialog>
        </div>
      )}

      {/* bill */}
      <div className="card-surface space-y-2 p-4 text-sm">
        <p className="mb-1 font-bold">Bill details</p>
        {[
          ["Item total", inr(itemTotal)],
          ["Delivery fee", freeShip ? "FREE" : inr(deliveryFee)],
          ...(couponDiscount ? [["Coupon discount", `− ${inr(couponDiscount)}`]] : []),
          ...(coinDiscount ? [["NearCoins", `− ${inr(coinDiscount)}`]] : []),
          ["Platform fee", "₹0"],
          ["Taxes", "GST included in prices"],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between text-muted-foreground">
            <span>{l}</span>
            <span className={`num font-semibold ${String(v).startsWith("−") ? "text-brand" : "text-foreground"}`}>{v}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-2.5 text-base font-extrabold">
          <span>To pay</span>
          <span className="num">{inr(total)}</span>
        </div>
      </div>

      <div className="sticky bottom-20 z-40">
        <Link href={gap > 0 ? "/customer/cart" : "/customer/checkout"} aria-disabled={gap > 0}>
          <Button size="lg" className="w-full justify-between" disabled={gap > 0}>
            <span>{gap > 0 ? `Add ${inr(gap)} more to order` : "Proceed to checkout"}</span>
            <span className="num">{inr(total)} →</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
