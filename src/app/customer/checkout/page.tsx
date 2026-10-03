"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Banknote, CheckCircle2, CreditCard, Home, MapPin, ShieldCheck, Smartphone, Sparkles, Truck } from "lucide-react";
import { CART_RULES, multiStoreFees, groupEta } from "@/lib/algorithms";
import { cartValue, useApp, type CartValidation } from "@/store/useApp";
import { Button, Field, Input, Textarea, Badge, EmptyState, SectionTitle } from "@/components/ui/base";
import { Dialog } from "@/components/ui/overlays";
import { SmartImage } from "@/components/ui/smart-image";
import { ChangeLocationButton } from "@/components/brand/shell";
import { productImage } from "@/lib/images";
import { cn, inr } from "@/lib/utils";
import type { Order } from "@/types";

const PAYMENTS = [
  { id: "UPI", label: "UPI", sub: "GPay · PhonePe · Paytm", icon: Smartphone, demo: true },
  { id: "Card", label: "Debit / Credit card", sub: "Visa · Mastercard · RuPay", icon: CreditCard, demo: true },
  { id: "COD", label: "Cash on Delivery", sub: "Pay the rider in cash", icon: Banknote, demo: false },
] as const;

const TIPS = [0, 10, 20, 30];

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useApp((s) => s.cart);
  const products = useApp((s) => s.products);
  const shops = useApp((s) => s.shops);
  const customer = useApp((s) => s.customer);
  const appliedCoupons = useApp((s) => s.appliedCoupons);
  const useCoins = useApp((s) => s.useCoins);
  const loyalty = useApp((s) => s.loyalty);
  const placeOrder = useApp((s) => s.placeOrder);
  const validateCart = useApp((s) => s.validateCart);
  const pushToast = useApp((s) => s.pushToast);

  const [addressId, setAddressId] = useState(customer.addresses[0]?.id ?? "");
  const [payment, setPayment] = useState<Order["payment"]>("UPI");
  const [tip, setTip] = useState(0);
  const [instructions, setInstructions] = useState("");
  const [placed, setPlaced] = useState<Order[] | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [paySheet, setPaySheet] = useState(false);
  const [payStage, setPayStage] = useState<"apps" | "waiting" | "done">("apps");

  const entries = Object.entries(cart.items);
  const lines = entries.map(([pid, qty]) => ({ p: products.find((x) => x.id === pid)!, qty })).filter((l) => l.p);
  const groups = new Map<string, typeof lines>();
  for (const l of lines) groups.set(l.p.shopId, [...(groups.get(l.p.shopId) ?? []), l]);
  const address = customer.addresses.find((a) => a.id === addressId) ?? customer.addresses[0];
  const itemTotal = cartValue(cart.items, products);
  const fees = multiStoreFees(groups.size, itemTotal);
  const couponDiscount = appliedCoupons.reduce((sum, code) => {
    const o = useApp.getState().offers.find((x) => x.code === code);
    return sum + (o && o.type === "flat" && itemTotal >= o.minOrder ? o.value : 0);
  }, 0);
  const freeShipCoupon = appliedCoupons.includes("FREESHIP") && itemTotal >= 199;
  if (freeShipCoupon) fees.total = 0;
  const coinDiscount = useCoins ? Math.min(loyalty.coins, 50) : 0;
  const grandTotal = Math.max(0, itemTotal + fees.total - couponDiscount - coinDiscount + tip);
  const eta = groupEta([...groups.keys()].map((sid) => (shops.find((s) => s.id === sid)?.prepTimeMin ?? 12) + 12));

  if (lines.length === 0) {
    return <EmptyState emoji="🧾" title="Nothing to check out" body="Your cart is empty." action={<Button onClick={() => router.push("/customer")}>Browse essentials</Button>} />;
  }

  const validation: CartValidation = validateCart();

  const startPayment = () => {
    if (payment === "COD") {
      finish();
      return;
    }
    setPayStage("apps");
    setPaySheet(true);
  };

  const finish = () => {
    const created = placeOrder({ address, payment, tip, instructions });
    if (created.length === 0) {
      pushToast({ title: "Could not place order", body: validation.ok ? "" : "Basket minimums not met", kind: "error" });
      setPaySheet(false);
      return;
    }
    setPlaced(created);
    setPaySheet(false);
  };

  const successDialog = (list: Order[] | null) => (
    <Dialog open={!!list} onClose={() => { setPlaced(null); router.push("/customer/orders"); }} title="Order confirmed">
      {list && (
        <div className="space-y-4 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft">
            <CheckCircle2 size={38} className="text-brand" />
          </motion.div>
          <div>
            <p className="font-display text-xl font-bold">{list.length > 1 ? list[0].groupCode : list[0].code}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {list.length > 1 ? `${list.length} stores · one delivery` : shops.find((s) => s.id === list[0].shopId)?.name} · {inr(list.reduce((t, o) => t + o.total, 0))} · {list[0].payment}
            </p>
            <p className="mt-2 inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">Arriving in ~{groupEta(list.map((o) => o.etaMin))} min</p>
          </div>
          {list.length > 1 && (
            <div className="space-y-1.5 text-left">
              {list.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm">
                  <span className="truncate font-semibold">{shops.find((s) => s.id === o.shopId)?.name}</span>
                  <span className="num font-bold">{inr(o.itemTotal)}</span>
                </div>
              ))}
            </div>
          )}
          <Button className="w-full" onClick={() => router.push(`/customer/orders/${list[0].id}`)}>Track live →</Button>
        </div>
      )}
    </Dialog>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionTitle title="Checkout" sub={`Arriving in ~${eta} min`} action={<ChangeLocationButton compact />} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* addresses */}
          <div className="space-y-2">
            <p className="text-sm font-bold">Delivery address</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {customer.addresses.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAddressId(a.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
                    addressId === a.id ? "border-foreground ring-1 ring-foreground/20" : "bg-card hover:border-foreground/40",
                  )}
                >
                  <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", addressId === a.id ? "btn-ink" : "bg-muted")}>
                    {a.label === "Home" ? <Home size={15} className={addressId === a.id ? "text-background" : ""} /> : <MapPin size={15} className={addressId === a.id ? "text-background" : ""} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{a.label}</p>
                      {addressId === a.id && <CheckCircle2 size={14} className="text-brand" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{a.line1}, {a.area} — {a.pincode}</p>
                  </div>
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>+ Add new address</Button>
          </div>

          {/* split-order preview */}
          <div className="card-surface p-4">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Sparkles size={15} className="text-brand" />
              {groups.size > 1 ? `Split across ${groups.size} stores — one delivery` : "Single-store order"}
            </p>
            <div className="mt-3 space-y-3">
              {[...groups.entries()].map(([sid, ls], idx) => {
                const shop = shops.find((s) => s.id === sid);
                const sub = ls.reduce((t, l) => t + l.p.price * l.qty, 0);
                return (
                  <div key={sid} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">{shop?.name}</p>
                      <Badge tone={idx === 0 ? "brand" : "accent"}>{idx === 0 ? "Primary pickup" : "Pickup " + (idx + 1)}</Badge>
                    </div>
                    <div className="mt-2 flex gap-2 overflow-x-auto">
                      {ls.map(({ p, qty }) => (
                        <div key={p.id} className="w-14 shrink-0">
                          <div className="relative">
                            <SmartImage src={productImage(p)} alt={p.name} seed={p.id} className="h-12 w-12 rounded-lg object-cover" />
                            <span className="num absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-bold text-background">{qty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="num mt-2 text-xs text-muted-foreground">Subtotal {inr(sub)}{groups.size > 1 && sub < CART_RULES.multiPerShopMin ? <span className="text-danger"> · below ₹50 store minimum</span> : ""}</p>
                  </div>
                );
              })}
              {groups.size > 1 && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Truck size={12} /> One rider collects from all stores — extra pickups cost ₹{CART_RULES.extraShopFee} each, free above ₹{CART_RULES.multiFreeAbove}.</p>
              )}
            </div>
          </div>

          {/* payment */}
          <div className="space-y-2">
            <p className="text-sm font-bold">Payment method</p>
            {PAYMENTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPayment(p.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all",
                  payment === p.id ? "border-foreground ring-1 ring-foreground/20" : "bg-card hover:border-foreground/40",
                )}
              >
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", payment === p.id ? "btn-ink" : "bg-muted")}><p.icon size={15} className={payment === p.id ? "text-background" : ""} /></div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.sub}</p>
                </div>
                {p.demo && <Badge tone="outline">Demo</Badge>}
              </button>
            ))}
            {payment === "COD" && grandTotal > 800 && (
              <p className="rounded-xl bg-danger-soft px-3 py-2 text-xs font-medium text-danger">
                High-value COD — our risk engine may require prepaid for this basket.
              </p>
            )}
          </div>

          {/* tip */}
          <div className="card-surface p-4">
            <p className="text-sm font-bold">Tip your rider <span className="font-normal text-muted-foreground">· 100% goes to them</span></p>
            <div className="mt-2.5 flex gap-2">
              {TIPS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTip(t)}
                  className={cn(
                    "flex-1 rounded-xl border py-2 text-sm font-bold transition-all",
                    tip === t ? "border-foreground bg-foreground text-background" : "bg-card text-muted-foreground hover:border-foreground/40",
                  )}
                >
                  {t === 0 ? "No tip" : `₹${t}`}
                </button>
              ))}
            </div>
          </div>

          <Field label="Delivery instructions (optional)">
            <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. Ring the bell twice, leave at the door…" />
          </Field>
        </div>

        {/* summary rail */}
        <div className="lg:sticky lg:top-24 h-fit space-y-3">
          <div className="card-surface space-y-2 p-4 text-sm">
            <p className="mb-1 font-bold">Bill summary</p>
            <div className="flex justify-between text-muted-foreground"><span>Item total ({entries.length})</span><span className="num font-semibold text-foreground">{inr(itemTotal)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Delivery fee</span><span className="num font-semibold text-foreground">{fees.free ? "FREE" : inr(fees.baseFee)}</span></div>
            {fees.extraShopFees > 0 && <div className="flex justify-between text-muted-foreground"><span>Extra-store pickups ×{groups.size - 1}</span><span className="num font-semibold text-foreground">{inr(fees.extraShopFees)}</span></div>}
            {couponDiscount > 0 && <div className="flex justify-between text-brand"><span>Coupons</span><span className="num font-semibold">− {inr(couponDiscount)}</span></div>}
            {coinDiscount > 0 && <div className="flex justify-between text-brand"><span>NearCoins</span><span className="num font-semibold">− {inr(coinDiscount)}</span></div>}
            {tip > 0 && <div className="flex justify-between text-muted-foreground"><span>Rider tip</span><span className="num font-semibold text-foreground">{inr(tip)}</span></div>}
            <div className="flex justify-between border-t pt-2.5 text-base font-bold"><span>To pay</span><span className="num">{inr(grandTotal)}</span></div>
            <Button size="lg" className="mt-2 w-full" onClick={startPayment} disabled={!validation.ok}>
              {!validation.ok
                ? validation.reason === "multi"
                  ? `Add ${inr(validation.needed ?? 0)} from ${shops.find((s) => s.id === validation.shopId)?.name.split(" ")[0]}`
                  : `Add ${inr(validation.needed ?? 0)} more`
                : payment === "COD" ? "Place order" : `Pay ${inr(grandTotal)}`}
            </Button>
            {!validation.ok && validation.reason === "overall" && <p className="text-center text-[11px] text-muted-foreground">Minimum basket ₹100 — keeps delivery economics healthy.</p>}
            <p className="flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground"><ShieldCheck size={11} className="text-brand" /> Payments are simulated — investor demo</p>
          </div>
        </div>
      </div>

      {/* add address */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add new address">
        <div className="space-y-3">
          <Field label="Full name"><Input defaultValue={customer.name} /></Field>
          <Field label="Phone"><Input defaultValue={customer.phone} /></Field>
          <Field label="House / flat / building"><Input placeholder="B-402, Sunrise Flats" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Area"><Input placeholder="Satellite" /></Field>
            <Field label="Pincode"><Input placeholder="380015" /></Field>
          </div>
          <Button className="w-full" onClick={() => { pushToast({ title: "Demo mode", body: "Address book is simulated — pick Home or Work.", kind: "info" }); setAddOpen(false); }}>Save address</Button>
        </div>
      </Dialog>

      {/* realistic payment sheet — demo */}
      <Dialog open={paySheet} onClose={() => setPaySheet(false)} title={payment === "UPI" ? "Pay via UPI" : "Card payment"}>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
            <span className="text-sm font-semibold">NearKart Technologies</span>
            <span className="num text-lg font-bold">{inr(grandTotal)}</span>
          </div>
          {payStage === "apps" && (
            <div className="grid grid-cols-4 gap-2">
              {[
                ["GPay", "#ffffff"],
                ["PhonePe", "#5f259f"],
                ["Paytm", "#00baf2"],
                ["BHIM", "#20314c"],
              ].map(([app, color]) => (
                <button
                  key={app}
                  onClick={() => { setPayStage("waiting"); setTimeout(finish, 1600); }}
                  className="flex flex-col items-center gap-1.5 rounded-xl border p-3 transition hover:border-foreground"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: color }}>{app.slice(0, 2)}</span>
                  <span className="text-[10px] font-semibold">{app}</span>
                </button>
              ))}
              <p className="col-span-4 text-center text-[11px] text-muted-foreground">Choose a UPI app — demo gateway, no money moves.</p>
            </div>
          )}
          {payStage === "waiting" && (
            <div className="py-6 text-center">
              <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.1 }} className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft">
                <Smartphone size={24} className="text-brand" />
              </motion.span>
              <p className="mt-3 text-sm font-bold">Approve the collect request…</p>
              <p className="text-xs text-muted-foreground">This sheet mirrors a real PSP flow — auto-approving for the demo.</p>
            </div>
          )}
        </div>
      </Dialog>

      {successDialog(placed)}
    </div>
  );
}
