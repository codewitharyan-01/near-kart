"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bike, ChevronLeft, CircleHelp, Flag, MessageSquareWarning, Phone } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Badge, Button, EmptyState, Stars } from "@/components/ui/base";
import { Dialog } from "@/components/ui/overlays";
import { clockTime, inr } from "@/lib/utils";
import type { Order } from "@/types";

const STEPS: { id: Order["status"]; label: string; emoji: string }[] = [
  { id: "PLACED", label: "Order placed", emoji: "🧾" },
  { id: "ACCEPTED", label: "Shop accepted", emoji: "✅" },
  { id: "PACKING", label: "Packing your items", emoji: "📦" },
  { id: "READY_FOR_PICKUP", label: "Ready for pickup", emoji: "🛍️" },
  { id: "RIDER_ASSIGNED", label: "Rider assigned", emoji: "🙋" },
  { id: "PICKED_UP", label: "Picked up", emoji: "🤝" },
  { id: "OUT_FOR_DELIVERY", label: "Out for delivery", emoji: "🛵" },
  { id: "DELIVERED", label: "Delivered", emoji: "🎉" },
];

const TAGS = ["Fast delivery", "Fresh products", "Correct items", "Good packaging", "Polite rider"];
const ISSUES = ["Delivery is late", "Missing item", "Wrong item", "Damaged item", "Rider unreachable"];

export default function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const order = useApp((s) => s.orders.find((o) => o.id === id));
  const shops = useApp((s) => s.shops);
  const riders = useApp((s) => s.riders);
  const rateOrder = useApp((s) => s.rateOrder);
  const cancelOrder = useApp((s) => s.cancelOrder);
  const addDispute = useApp((s) => s.addDispute);
  const pushToast = useApp((s) => s.pushToast);
  const reorder = useApp((s) => s.reorder);

  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [rateOpen, setRateOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!order) {
    return <EmptyState emoji="🔍" title="Order not found" action={<Link href="/customer/orders"><Button>All orders</Button></Link>} />;
  }

  const shop = shops.find((s) => s.id === order.shopId);
  const rider = riders.find((r) => r.id === order.riderId);
  const stepIdx = STEPS.findIndex((s) => s.id === order.status);
  const dead = order.status === "CANCELLED" || order.status === "REJECTED";
  const eta = order.etaMin;
  const elapsedMin = Math.floor((now - order.placedAt) / 60000);
  const minsLeft = Math.max(1, eta - elapsedMin);
  const progress = dead ? 100 : ((stepIdx + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-5">
      <Link href="/customer/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-brand">
        <ChevronLeft size={16} /> All orders
      </Link>

      {/* map / hero */}
      <div className="card-surface relative h-44 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(16,185,129,0.14),transparent_50%),radial-gradient(circle_at_75%_70%,rgba(245,158,11,0.12),transparent_45%)]" />
        {/* fake streets */}
        <svg className="absolute inset-0 h-full w-full opacity-25" preserveAspectRatio="none" viewBox="0 0 400 180">
          <path d="M0 60 H400 M0 120 H400 M80 0 V180 M200 0 V180 M320 0 V180" stroke="currentColor" strokeWidth="6" className="text-muted-foreground" />
        </svg>
        <div className="absolute left-[14%] top-9 text-lg" title="Shop">📍</div>
        <div className="absolute bottom-9 right-[16%] text-lg" title="You">🏠</div>
        {!dead && (
          <motion.div
            className="absolute text-2xl"
            initial={{ left: "18%", top: "38%" }}
            animate={{ left: ["18%", "55%", "78%"], top: ["38%", "48%", "58%"] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          >
            {order.status === "OUT_FOR_DELIVERY" || order.status === "PICKED_UP" ? "🛵" : "🧑‍✈️"}
          </motion.div>
        )}
        <div className="absolute inset-x-4 bottom-3 flex items-center justify-between rounded-xl bg-card/90 px-3.5 py-2.5 backdrop-blur">
          <div>
            <p className="text-[11px] text-muted-foreground">{dead ? "Status" : "Arriving in"}</p>
            <p className="font-display text-lg font-extrabold leading-none">
              {dead ? order.status === "DELIVERED" ? "Delivered 🎉" : "Cancelled" : `~${minsLeft} min`}
            </p>
          </div>
          <Badge tone={dead && order.status !== "DELIVERED" ? "danger" : "brand"}>{order.status.replaceAll("_", " ").toLowerCase()}</Badge>
        </div>
      </div>

      {/* order header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-extrabold">{shop?.emoji} {shop?.name}</h1>
          <p className="num text-xs text-muted-foreground">{order.code} · placed {clockTime(order.placedAt)}</p>
        </div>
        <p className="num text-lg font-extrabold">{inr(order.total)}</p>
      </div>

      {/* timeline */}
      {!dead ? (
        <div className="card-surface p-4">
          <div className="h-1.5 w-full rounded-full bg-muted">
            <motion.div className="h-full brand-gradient rounded-full" animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 60, damping: 18 }} />
          </div>
          <ol className="mt-4 space-y-3">
            {STEPS.map((s, i) => {
              const done = i <= stepIdx;
              const current = i === stepIdx;
              return (
                <li key={s.id} className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-all ${done ? "brand-gradient text-white" : "bg-muted text-muted-foreground"} ${current ? "pulse-ring" : ""}`}>
                    {done ? "✓" : s.emoji}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${current ? "text-brand" : done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                    {current && <p className="text-[11px] text-muted-foreground">happening now…</p>}
                  </div>
                  {done && i <= stepIdx && order.timeline[i] && (
                    <span className="num text-[11px] text-muted-foreground">{clockTime(order.timeline[i].at)}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <div className={`rounded-2xl border p-4 ${order.status === "DELIVERED" ? "border-brand/40 bg-brand-softer" : "border-danger/40 bg-danger-soft"}`}>
          <p className="font-bold">{order.status === "DELIVERED" ? "Delivered — enjoy! 🎉" : order.status === "REJECTED" ? "Rejected by shop" : "Order cancelled"}</p>
          {order.cancelReason && <p className="mt-1 text-sm text-muted-foreground">{order.cancelReason}</p>}
          {order.status === "DELIVERED" && !order.rating && (
            <Button size="sm" className="mt-3" onClick={() => setRateOpen(true)}>Rate your experience ⭐</Button>
          )}
        </div>
      )}

      {/* rider card */}
      {rider && !dead && (
        <div className="card-surface flex items-center gap-3 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-700 text-white"><Bike size={20} /></div>
          <div className="flex-1">
            <p className="text-sm font-bold">{rider.name} · {rider.vehicleNumber}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Stars value={rider.rating} size={11} /> {rider.rating} · {rider.vehicle}</div>
          </div>
          <Button size="icon-sm" variant="outline" aria-label="Call rider" onClick={() => pushToast({ title: "Demo only", body: "Calling is disabled in the investor demo.", kind: "info" })}><Phone size={14} /></Button>
        </div>
      )}

      {/* OTP + proof */}
      {!dead && stepIdx >= 5 && (
        <div className="card-surface p-4">
          <p className="text-sm font-bold">Delivery OTP</p>
          <p className="mt-1 text-xs text-muted-foreground">Share this with the rider when your order arrives.</p>
          <div className="mt-2.5 flex gap-2">
            {order.otpDelivery.split("").map((d, i) => (
              <span key={i} className="num flex h-11 w-11 items-center justify-center rounded-xl border-2 border-dashed border-brand/50 bg-brand-softer text-xl font-extrabold text-brand">{d}</span>
            ))}
          </div>
        </div>
      )}

      {/* items + bill */}
      <div className="card-surface p-4">
        <p className="mb-2 text-sm font-bold">{order.items.length} items</p>
        <ul className="space-y-1.5">
          {order.items.map((i) => (
            <li key={i.productId} className="flex items-center gap-2 text-sm">
              <span className="text-lg">{i.emoji}</span>
              <span className="flex-1 truncate">{i.name} <span className="text-muted-foreground">· {i.packSize}</span></span>
              <span className="num text-muted-foreground">×{i.qty}</span>
              <span className="num w-14 text-right font-semibold">{inr(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t pt-2 text-xs text-muted-foreground">
          <div className="flex justify-between"><span>Items</span><span className="num">{inr(order.itemTotal)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span className="num">{order.deliveryFee === 0 ? "FREE" : inr(order.deliveryFee)}</span></div>
          {order.couponDiscount > 0 && <div className="flex justify-between text-brand"><span>Coupon</span><span className="num">− {inr(order.couponDiscount)}</span></div>}
          {order.coinDiscount > 0 && <div className="flex justify-between text-brand"><span>NearCoins</span><span className="num">− {inr(order.coinDiscount)}</span></div>}
          {order.tip > 0 && <div className="flex justify-between"><span>Rider tip</span><span className="num">{inr(order.tip)}</span></div>}
          <div className="flex justify-between pt-1 text-sm font-bold text-foreground"><span>Total ({order.payment})</span><span className="num">{inr(order.total)}</span></div>
        </div>
      </div>

      {/* actions */}
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" onClick={() => setHelpOpen(true)}><CircleHelp size={14} /> Help</Button>
        <Button variant="outline" size="sm" onClick={() => setIssueOpen(true)}><MessageSquareWarning size={14} /> Report issue</Button>
        <Button variant="outline" size="sm" onClick={() => { reorder(order.id); pushToast({ title: "Items added to cart 🛒", kind: "success" }); }}>
          🔁 Reorder
        </Button>
      </div>

      {/* cancel option while early */}
      {!dead && ["PLACED", "ACCEPTED"].includes(order.status) && (
        <button
          onClick={() => { cancelOrder(order.id, "customer", "Cancelled by customer"); pushToast({ title: "Order cancelled", body: "Stock has been restored at the shop.", kind: "warn" }); }}
          className="w-full rounded-xl border border-danger/30 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger-soft"
        >
          Cancel order
        </button>
      )}

      {/* rating dialog */}
      <Dialog open={rateOpen} onClose={() => setRateOpen(false)} title="Rate your experience">
        <p className="text-sm text-muted-foreground">Your rating keeps neighbourhood shops honest — and earns you 5 NearCoins.</p>
        <div className="my-4 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`} className="text-3xl transition-transform hover:scale-110">
              <span className={n <= rating ? "" : "opacity-25"}>⭐</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTags((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]))}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${tags.includes(t) ? "border-brand bg-brand-soft text-brand" : "text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <Button
          className="mt-4 w-full"
          disabled={rating === 0}
          onClick={() => {
            rateOrder(order.id, rating, tags);
            setRateOpen(false);
            pushToast({ title: "Thanks for the feedback! +5 NearCoins 🪙", kind: "success" });
          }}
        >
          Submit rating
        </Button>
      </Dialog>

      {/* issue dialog */}
      <Dialog open={issueOpen} onClose={() => setIssueOpen(false)} title="Report an issue">
        <div className="space-y-2">
          {ISSUES.map((i) => (
            <button
              key={i}
              onClick={() => {
                addDispute({ orderId: order.id, orderCode: order.code, by: "customer", type: i.includes("Missing") ? "Missing item" : i.includes("Wrong") ? "Wrong item" : i.includes("Damaged") ? "Damaged item" : "Late delivery", description: i, amount: Math.round(order.itemTotal * 0.3), evidence: { photo: true, otpVerified: true, gpsMatch: true } });
                setIssueOpen(false);
                pushToast({ title: "Issue reported", body: "Our trust team will resolve within 24 hours.", kind: "success" });
              }}
              className="flex w-full items-center gap-2 rounded-xl border p-3 text-left text-sm font-semibold transition hover:border-brand hover:bg-brand-softer"
            >
              <Flag size={14} className="text-danger" /> {i}
            </button>
          ))}
          <p className="pt-1 text-[11px] text-muted-foreground">Photo evidence speeds up instant refunds for valid claims.</p>
        </div>
      </Dialog>

      {/* help dialog */}
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} title="Help & support">
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">Order {order.code} · {shop?.name}</p>
          {[
            ["💬", "In-app chat", "Avg. response under 2 min"],
            ["📞", "Call support", "1800-NEAR-KART (toll free)"],
            ["🛡️", "Safety emergency", "Connects to priority line"],
          ].map(([e, t, d]) => (
            <button key={t} onClick={() => pushToast({ title: "Demo only", body: "Support channels are simulated.", kind: "info" })} className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition hover:border-brand">
              <span className="text-xl">{e}</span>
              <span><span className="block font-semibold">{t}</span><span className="text-xs text-muted-foreground">{d}</span></span>
            </button>
          ))}
        </div>
      </Dialog>
    </div>
  );
}
