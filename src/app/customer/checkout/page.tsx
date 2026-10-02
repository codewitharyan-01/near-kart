"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Banknote, CheckCircle2, CreditCard, Home, MapPin, Smartphone, Wallet } from "lucide-react";
import { MIN_ORDER, cartValue, useApp } from "@/store/useApp";
import { deliveryFeeFor } from "@/lib/algorithms";
import { Button, Field, Input, Textarea, Badge, EmptyState, SectionTitle } from "@/components/ui/base";
import { Dialog } from "@/components/ui/overlays";
import { ChangeLocationButton } from "@/components/brand/shell";
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
  const pushToast = useApp((s) => s.pushToast);

  const [addressId, setAddressId] = useState(customer.addresses[0]?.id ?? "");
  const [payment, setPayment] = useState<Order["payment"]>("UPI");
  const [tip, setTip] = useState(0);
  const [instructions, setInstructions] = useState("");
  const [placed, setPlaced] = useState<Order | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const shop = shops.find((s) => s.id === cart.shopId);
  const address = customer.addresses.find((a) => a.id === addressId) ?? customer.addresses[0];
  const itemTotal = cartValue(cart.items, products);
  const deliveryFee = deliveryFeeFor(itemTotal);
  const couponDiscount = appliedCoupons.reduce((sum, code) => {
    const o = useApp.getState().offers.find((x) => x.code === code);
    return sum + (o && o.type === "flat" && itemTotal >= o.minOrder ? o.value : 0);
  }, 0);
  const coinDiscount = useCoins ? Math.min(loyalty.coins, 50) : 0;
  const total = Math.max(0, itemTotal + deliveryFee - couponDiscount - coinDiscount + tip);

  if (!shop || itemTotal < MIN_ORDER) {
    return (
      <>
        <EmptyState emoji="🧾" title="Nothing to check out" body="Your cart is empty or below the ₹100 minimum." action={<Button onClick={() => router.push("/customer")}>Browse shops</Button>} />
        {/* keep the success screen reachable — cart is already cleared after placing */}
        <Dialog open={!!placed} onClose={() => { setPlaced(null); router.push("/customer/orders"); }} title="Order placed! 🎉">
          {placed && (
            <div className="space-y-4 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft">
                <Wallet size={36} className="text-brand" />
              </motion.div>
              <div>
                <p className="font-display text-xl font-extrabold">{placed.code}</p>
                <p className="mt-1 text-sm text-muted-foreground">{inr(placed.total)} · {placed.payment}</p>
                <p className="mt-2 inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">Arriving in ~{placed.etaMin} min ⚡</p>
              </div>
              <p className="text-xs text-muted-foreground">Watch it move live — the shop dashboard, rider app and admin console all see this order in real time.</p>
              <Button className="w-full" onClick={() => router.push(`/customer/orders/${placed.id}`)}>Track order live →</Button>
            </div>
          )}
        </Dialog>
      </>
    );
  }

  const submit = () => {
    if (!address) return;
    const order = placeOrder({ address, payment, tip, instructions });
    if (!order) {
      pushToast({ title: "Could not place order", kind: "error" });
      return;
    }
    setPlaced(order);
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Checkout" sub={`${shop.name} · arriving in ~${22} min`} action={<ChangeLocationButton compact />} />

      {/* addresses */}
      <div className="space-y-2">
        <p className="text-sm font-bold">Delivery address</p>
        {customer.addresses.map((a) => (
          <button
            key={a.id}
            onClick={() => setAddressId(a.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
              addressId === a.id ? "border-brand bg-brand-softer ring-1 ring-brand/30" : "bg-card hover:border-brand/40",
            )}
          >
            <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", addressId === a.id ? "bg-brand text-white" : "bg-muted")}>
              {a.label === "Home" ? <Home size={16} /> : <MapPin size={16} />}
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
        <Button variant="outline" size="sm" className="w-full" onClick={() => setAddOpen(true)}>+ Add new address</Button>
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
              payment === p.id ? "border-brand bg-brand-softer ring-1 ring-brand/30" : "bg-card hover:border-brand/40",
            )}
          >
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", payment === p.id ? "bg-brand text-white" : "bg-muted")}><p.icon size={16} /></div>
            <div className="flex-1">
              <p className="text-sm font-bold">{p.label}</p>
              <p className="text-xs text-muted-foreground">{p.sub}</p>
            </div>
            {p.demo && <Badge tone="outline">Demo only</Badge>}
          </button>
        ))}
        {payment === "COD" && total > 800 && (
          <p className="rounded-xl bg-danger-soft px-3 py-2 text-xs font-medium text-danger">
            ⚠️ High-value COD order — our risk engine may ask for prepaid payment.
          </p>
        )}
      </div>

      {/* tip — reciprocity psychology */}
      <div className="card-surface p-4">
        <p className="text-sm font-bold">Tip your rider <span className="font-normal text-muted-foreground">· 100% goes to them</span></p>
        <div className="mt-2.5 flex gap-2">
          {TIPS.map((t) => (
            <button
              key={t}
              onClick={() => setTip(t)}
              className={cn(
                "flex-1 rounded-xl border py-2 text-sm font-bold transition-all",
                tip === t ? "border-brand bg-brand-soft text-brand" : "bg-card text-muted-foreground hover:border-brand/40",
              )}
            >
              {t === 0 ? "No tip" : `₹${t}`}
            </button>
          ))}
        </div>
        {tip > 0 && <p className="mt-2 text-xs text-muted-foreground">💙 Riders keep 100% of tips — thank you!</p>}
      </div>

      {/* instructions */}
      <Field label="Delivery instructions (optional)">
        <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. Ring the bell twice, leave at the door…" />
      </Field>

      {/* summary + place */}
      <div className="card-surface space-y-2 p-4 text-sm">
        <p className="mb-1 font-bold">Order summary</p>
        <div className="flex justify-between text-muted-foreground"><span>Items ({cartValue(cart.items, products) > 0 ? Object.values(cart.items).reduce((a, b) => a + b, 0) : 0})</span><span className="num font-semibold">{inr(itemTotal)}</span></div>
        <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span className="num font-semibold">{deliveryFee === 0 ? "FREE" : inr(deliveryFee)}</span></div>
        {couponDiscount > 0 && <div className="flex justify-between text-brand"><span>Coupons</span><span className="num font-semibold">− {inr(couponDiscount)}</span></div>}
        {coinDiscount > 0 && <div className="flex justify-between text-brand"><span>NearCoins</span><span className="num font-semibold">− {inr(coinDiscount)}</span></div>}
        {tip > 0 && <div className="flex justify-between text-muted-foreground"><span>Rider tip</span><span className="num font-semibold">{inr(tip)}</span></div>}
        <div className="flex justify-between border-t pt-2.5 text-base font-extrabold"><span>To pay</span><span className="num">{inr(total)}</span></div>
        <Button size="lg" className="mt-2 w-full" onClick={submit}>
          {payment === "COD" ? "Place order (Cash on Delivery)" : `Pay ${inr(total)} — demo`} 🚀
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">No real payment will be processed — investor demo.</p>
      </div>

      {/* add address dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add new address">
        <div className="space-y-3">
          <Field label="Full name"><Input defaultValue={customer.name} /></Field>
          <Field label="Phone"><Input defaultValue={customer.phone} /></Field>
          <Field label="House / flat / building"><Input placeholder="B-402, Sunrise Flats" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Area"><Input placeholder="Satellite" /></Field>
            <Field label="Pincode"><Input placeholder="380015" /></Field>
          </div>
          <Button
            className="w-full"
            onClick={() => {
              pushToast({ title: "Demo mode", body: "Address book is simulated — pick Home or Work.", kind: "info" });
              setAddOpen(false);
            }}
          >
            Save address
          </Button>
        </div>
      </Dialog>

      {/* success overlay */}
      <Dialog open={!!placed} onClose={() => { setPlaced(null); router.push("/customer/orders"); }} title="Order placed! 🎉">
        {placed && (
          <div className="space-y-4 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft">
              <Wallet size={36} className="text-brand" />
            </motion.div>
            <div>
              <p className="font-display text-xl font-extrabold">{placed.code}</p>
              <p className="mt-1 text-sm text-muted-foreground">{shop.name} · {inr(placed.total)} · {placed.payment}</p>
              <p className="mt-2 inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">Arriving in ~{placed.etaMin} min ⚡</p>
            </div>
            <p className="text-xs text-muted-foreground">Watch it move live — the shop dashboard, rider app and admin console all see this order in real time.</p>
            <Button className="w-full" onClick={() => router.push(`/customer/orders/${placed.id}`)}>Track order live →</Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
