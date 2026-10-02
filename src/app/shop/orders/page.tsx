"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, PackageCheck, Timer } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Badge, Button, EmptyState, Select } from "@/components/ui/base";
import { Dialog, Tabs, TRow, TH, TD } from "@/components/ui/overlays";
import { clockTime, cn, inr } from "@/lib/utils";
import type { Order } from "@/types";

const TABS = [
  { id: "PLACED", label: "New" },
  { id: "ACTIVE", label: "In kitchen" },
  { id: "READY", label: "Ready" },
  { id: "DONE", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

const REJECT_REASONS = ["Shop closed", "Item unavailable", "Too many orders", "Emergency", "Other"];

export default function ShopOrdersPage() {
  const orders = useApp((s) => s.orders);
  const riders = useApp((s) => s.riders);
  const products = useApp((s) => s.products);
  const shopAccept = useApp((s) => s.shopAccept);
  const shopReject = useApp((s) => s.shopReject);
  const markPacked = useApp((s) => s.markPacked);
  const pushToast = useApp((s) => s.pushToast);

  const [tab, setTab] = useState("PLACED");
  const [rejecting, setRejecting] = useState<Order | null>(null);
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [unavailableItem, setUnavailableItem] = useState("");
  const [detail, setDetail] = useState<Order | null>(null);

  const mine = useMemo(() => orders.filter((o) => o.shopId === "sharma"), [orders]);

  const filtered = useMemo(() => {
    switch (tab) {
      case "PLACED": return mine.filter((o) => o.status === "PLACED");
      case "ACTIVE": return mine.filter((o) => ["ACCEPTED", "PACKING"].includes(o.status));
      case "READY": return mine.filter((o) => ["READY_FOR_PICKUP", "RIDER_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(o.status));
      case "DONE": return mine.filter((o) => o.status === "DELIVERED");
      case "CANCELLED": return mine.filter((o) => ["CANCELLED", "REJECTED"].includes(o.status));
      default: return mine;
    }
  }, [mine, tab]);

  const counts = {
    PLACED: mine.filter((o) => o.status === "PLACED").length,
    ACTIVE: mine.filter((o) => ["ACCEPTED", "PACKING"].includes(o.status)).length,
    READY: mine.filter((o) => ["READY_FOR_PICKUP", "RIDER_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(o.status)).length,
    DONE: mine.filter((o) => o.status === "DELIVERED").length,
    CANCELLED: mine.filter((o) => ["CANCELLED", "REJECTED"].includes(o.status)).length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Orders</h1>
        <Select className="h-9 w-44 text-xs" defaultValue="all" aria-label="Filter by payment">
          <option value="all">All payment types</option>
          <option value="UPI">UPI</option>
          <option value="COD">COD</option>
          <option value="Card">Card</option>
        </Select>
      </div>

      <Tabs
        tabs={TABS.map((t) => ({ ...t, count: counts[t.id as keyof typeof counts] }))}
        active={tab}
        onChange={setTab}
      />

      {filtered.length === 0 && <EmptyState emoji="📭" title="Nothing here" body="Orders will appear in this queue as customers order." />}

      <div className="space-y-3">
        {filtered.map((o) => {
          const isLive = o.status === "PLACED";
          return (
            <div key={o.id} className={cn("card-surface p-4", isLive && "border-brand ring-1 ring-brand/30")}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="num flex items-center gap-2 text-sm font-extrabold">
                    {o.code}
                    <Badge tone={o.payment === "COD" ? "accent" : "brand"}>{o.payment}</Badge>
                    {o.paymentRisk === "review" && <Badge tone="danger">⚠ risk review</Badge>}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {o.customerName} · {o.address.area} · {clockTime(o.placedAt)} {o.instructions && <span className="text-accent">· “{o.instructions}”</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="num text-lg font-extrabold">{inr(o.itemTotal)}</p>
                  <p className="num text-[11px] text-muted-foreground">payout {inr(o.itemTotal * 0.92)}</p>
                </div>
              </div>

              <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                {o.items.map((i) => (
                  <li key={i.productId} className="flex items-center gap-2">
                    <span>{i.emoji}</span>
                    <span className="min-w-0 flex-1 truncate">{i.name}</span>
                    <span className="num font-bold">×{i.qty}</span>
                  </li>
                ))}
              </ul>

              {/* status-specific actions */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {o.status === "PLACED" && (
                  <>
                    <AcceptTimer placedAt={o.placedAt} />
                    <Button size="sm" onClick={() => { shopAccept(o.id); pushToast({ title: "Order accepted ✅", body: "Stock deducted automatically", kind: "success" }); }}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => { setRejecting(o); setUnavailableItem(""); }}>Reject</Button>
                  </>
                )}
                {(o.status === "ACCEPTED" || o.status === "PACKING") && (
                  <Button size="sm" onClick={() => { markPacked(o.id); pushToast({ title: o.status === "ACCEPTED" ? "Packing started 📦" : "Marked ready for pickup 🛍️", kind: "success" }); }}>
                    <PackageCheck size={14} /> {o.status === "ACCEPTED" ? "Start packing" : "Mark ready for pickup"}
                  </Button>
                )}
                {["READY_FOR_PICKUP", "RIDER_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"].includes(o.status) && (
                  <>
                    <Badge tone="brand">Pickup OTP: <span className="num">{o.otpPickup}</span></Badge>
                    {o.riderId && <Badge tone="info">🛵 {riders.find((r) => r.id === o.riderId)?.name}</Badge>}
                  </>
                )}
                <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setDetail(o)}>Details</Button>
              </div>

              {o.status === "REJECTED" && o.cancelReason && (
                <p className="mt-2 rounded-lg bg-danger-soft px-3 py-1.5 text-xs font-semibold text-danger">Rejected — {o.cancelReason}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* reject dialog with replacement flow */}
      <Dialog open={!!rejecting} onClose={() => setRejecting(null)} title="Reject order">
        {rejecting && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Order {rejecting.code} from {rejecting.customerName}. Honest rejections keep your scorecard healthy.</p>
            <Select value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Rejection reason">
              {REJECT_REASONS.map((r) => <option key={r}>{r}</option>)}
            </Select>
            {reason === "Item unavailable" && (
              <>
                <Select value={unavailableItem} onChange={(e) => setUnavailableItem(e.target.value)} aria-label="Unavailable item">
                  <option value="">Which item is unavailable?</option>
                  {rejecting.items.map((i) => <option key={i.productId} value={i.name}>{i.name}</option>)}
                </Select>
                {unavailableItem && (
                  <div className="rounded-xl bg-brand-softer p-3 text-xs text-brand">
                    💡 NearKart will suggest a replacement from your catalog and ask the customer for approval — most rejections become saved orders.
                    {(() => {
                      const missing = rejecting.items.find((x) => x.name === unavailableItem);
                      const cat = products.find((p) => p.id === missing?.productId)?.category;
                      const swap = products.find((p) => p.shopId === "sharma" && p.category === cat && p.name !== unavailableItem && p.stock > 0);
                      return swap ? <p className="mt-1.5 font-bold">Suggested swap: {swap.emoji} {swap.name} — {inr(swap.price)}</p> : null;
                    })()}
                  </div>
                )}
              </>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setRejecting(null)}>Go back</Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  shopReject(rejecting.id, reason, reason === "Item unavailable" ? unavailableItem : undefined);
                  pushToast({ title: "Order rejected", body: "Customer has been notified.", kind: "warn" });
                  setRejecting(null);
                }}
              >
                Confirm rejection
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* detail dialog */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} title={`Order ${detail?.code ?? ""}`} wide>
        {detail && (
          <div className="space-y-3">
            <div className="rounded-xl bg-muted p-3 text-sm">
              <p className="font-bold">{detail.customerName}</p>
              <p className="text-xs text-muted-foreground">{detail.address.line1}, {detail.address.area} — {detail.address.pincode}</p>
              <p className="num mt-1 text-xs">{detail.customerPhone} · {detail.payment}</p>
              {detail.address.instructions && <p className="mt-1 rounded-lg bg-accent-soft px-2 py-1 text-xs text-accent">📝 {detail.address.instructions}</p>}
            </div>
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full">
                <thead className="bg-muted"><tr><TH>Item</TH><TH className="text-right">Qty</TH><TH className="text-right">Amount</TH></tr></thead>
                <tbody>
                  {detail.items.map((i) => (
                    <TRow key={i.productId}><TD>{i.emoji} {i.name}</TD><TD className="text-right num">×{i.qty}</TD><TD className="text-right num">{inr(i.price * i.qty)}</TD></TRow>
                  ))}
                  <TRow><TD className="font-bold" >Total</TD><TD /><TD className="text-right num font-bold">{inr(detail.itemTotal)}</TD></TRow>
                </tbody>
              </table>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Timeline</p>
              <ol className="space-y-1 text-sm">
                {detail.timeline.map((t, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="font-semibold">{t.status.replaceAll("_", " ").toLowerCase()}</span>
                    <span className="text-xs text-muted-foreground">· {clockTime(t.at)} · by {t.by ?? "system"}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function AcceptTimer({ placedAt }: { placedAt: number }) {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, 120 - Math.floor((Date.now() - placedAt) / 1000));
  const urgent = left <= 30;
  return (
    <span className={cn("num flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold", urgent ? "bg-danger-soft text-danger" : "bg-muted text-muted-foreground")}>
      <Timer size={13} /> {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
    </span>
  );
}
