"use client";

import { useMemo, useState } from "react";
import { RefreshCcw, XCircle, BanknoteArrowUp, Eye } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Badge, Button, EmptyState, Input, Select, StatCard } from "@/components/ui/base";
import { Dialog, TRow, TH, TD } from "@/components/ui/overlays";
import { clockTime, inr, timeAgo } from "@/lib/utils";
import type { Order } from "@/types";

export default function AdminOrdersPage() {
  const orders = useApp((s) => s.orders);
  const shops = useApp((s) => s.shops);
  const riders = useApp((s) => s.riders);
  const pushToast = useApp((s) => s.pushToast);
  const cancelOrder = useApp((s) => s.cancelOrder);

  const [status, setStatus] = useState("all");
  const [shopF, setShopF] = useState("all");
  const [payment, setPayment] = useState("all");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    let list = orders;
    if (status !== "all") list = list.filter((o) => (status === "live" ? !["DELIVERED", "CANCELLED", "REJECTED"].includes(o.status) : o.status === status));
    if (shopF !== "all") list = list.filter((o) => o.shopId === shopF);
    if (payment !== "all") list = list.filter((o) => o.payment === payment);
    if (query) list = list.filter((o) => o.code.toLowerCase().includes(query.toLowerCase()) || o.customerName.toLowerCase().includes(query.toLowerCase()));
    return list.sort((a, b) => b.placedAt - a.placedAt);
  }, [orders, status, shopF, payment, query]);

  const liveCount = orders.filter((o) => !["DELIVERED", "CANCELLED", "REJECTED"].includes(o.status)).length;
  const codCount = orders.filter((o) => o.payment === "COD").length;
  const riskCount = orders.filter((o) => o.paymentRisk === "review").length;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Order monitoring</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Live orders" value={liveCount} tone="brand" />
        <StatCard label="COD share" value={`${Math.round((codCount / Math.max(1, orders.length)) * 100)}%`} tone="accent" />
        <StatCard label="Risk-flagged" value={riskCount} tone="danger" sub="manual review advised" />
        <StatCard label="Total orders" value={orders.length} tone="info" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 w-40 text-xs" aria-label="Status filter">
          <option value="all">All statuses</option>
          <option value="live">● Live only</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REJECTED">Rejected</option>
        </Select>
        <Select value={shopF} onChange={(e) => setShopF(e.target.value)} className="h-9 w-44 text-xs" aria-label="Shop filter">
          <option value="all">All shops</option>
          {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Select value={payment} onChange={(e) => setPayment(e.target.value)} className="h-9 w-36 text-xs" aria-label="Payment filter">
          <option value="all">All payments</option>
          <option value="UPI">UPI</option>
          <option value="COD">COD</option>
          <option value="Card">Card</option>
        </Select>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search code / customer…" className="h-9 w-52 text-xs" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState emoji="🔍" title="No orders match" />
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="border-b bg-muted/50">
              <tr><TH>Order</TH><TH>Shop</TH><TH>Customer</TH><TH>Value</TH><TH>Payment</TH><TH>Rider</TH><TH>Status</TH><TH>Placed</TH><TH className="text-right">Actions</TH></tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const isLive = !["DELIVERED", "CANCELLED", "REJECTED"].includes(o.status);
                return (
                  <TRow key={o.id}>
                    <TD className="num text-xs font-bold">{o.code}</TD>
                    <TD className="text-xs">{shops.find((s) => s.id === o.shopId)?.name}</TD>
                    <TD className="text-xs">{o.customerName}<span className="block text-[10px] text-muted-foreground">{o.address.area}</span></TD>
                    <TD className="num text-sm font-bold">{inr(o.total)}</TD>
                    <TD><Badge tone={o.payment === "COD" ? "accent" : "brand"}>{o.payment}{o.paymentRisk === "review" ? " ⚠" : ""}</Badge></TD>
                    <TD className="text-xs">{o.riderId ? riders.find((r) => r.id === o.riderId)?.name : <span className="text-muted-foreground">—</span>}</TD>
                    <TD>
                      <Badge tone={o.status === "DELIVERED" ? "brand" : ["CANCELLED", "REJECTED"].includes(o.status) ? "danger" : isLive ? "accent" : "neutral"}>
                        {o.status.replaceAll("_", " ").toLowerCase()}
                      </Badge>
                    </TD>
                    <TD className="text-[11px] text-muted-foreground">{clockTime(o.placedAt)}<span className="block">{timeAgo(o.placedAt)}</span></TD>
                    <TD>
                      <div className="flex justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" aria-label={`View ${o.code}`} onClick={() => setDetail(o)}><Eye size={14} /></Button>
                        {isLive && (
                          <Button size="icon-sm" variant="ghost" aria-label={`Reassign rider for ${o.code}`} onClick={() => pushToast({ title: "Rider reassignment", body: "Nearest available rider will be auto-paged.", kind: "info" })}>
                            <RefreshCcw size={14} />
                          </Button>
                        )}
                        {isLive && (
                          <Button size="icon-sm" variant="ghost" aria-label={`Cancel ${o.code}`} onClick={() => { cancelOrder(o.id, "admin", "Cancelled by operations"); pushToast({ title: "Order cancelled", body: `${o.code} — refund flow triggered if prepaid.`, kind: "warn" }); }}>
                            <XCircle size={14} />
                          </Button>
                        )}
                      </div>
                    </TD>
                  </TRow>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* detail drawer-dialog */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} title={`Order ${detail?.code ?? ""}`} wide>
        {detail && (
          <div className="space-y-3 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border p-3">
                <p className="text-[11px] font-bold uppercase text-muted-foreground">Customer</p>
                <p className="font-bold">{detail.customerName}</p>
                <p className="num text-xs text-muted-foreground">{detail.customerPhone}</p>
                <p className="text-xs text-muted-foreground">{detail.address.line1}, {detail.address.area} — {detail.address.pincode}</p>
              </div>
              <div className="rounded-xl border p-3">
                <p className="text-[11px] font-bold uppercase text-muted-foreground">Fulfilment</p>
                <p className="font-bold">{shops.find((s) => s.id === detail.shopId)?.name}</p>
                <p className="text-xs text-muted-foreground">Rider: {detail.riderId ? riders.find((r) => r.id === detail.riderId)?.name : "unassigned"}</p>
                <p className="text-xs text-muted-foreground">ETA at placement: {detail.etaMin} min</p>
              </div>
            </div>
            <div className="rounded-xl border p-3">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">Immutable timeline</p>
              <ol className="mt-2 space-y-1.5">
                {detail.timeline.map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    <span className="font-bold">{t.status.replaceAll("_", " ").toLowerCase()}</span>
                    <span className="text-muted-foreground">· {clockTime(t.at)} · by {t.by ?? "system"}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => pushToast({ title: "Refund initiated", body: `₹${Math.round(detail.total)} to original payment method.`, kind: "success" })}>
                <BanknoteArrowUp size={14} /> Issue refund
              </Button>
              <Button size="sm" variant="outline" onClick={() => pushToast({ title: "Stakeholders paged", body: "Shop owner + rider notified via WhatsApp.", kind: "info" })}>Contact parties</Button>
              <Button size="sm" variant="danger" onClick={() => pushToast({ title: "Escalated to trust & safety", body: "Senior ops will review evidence logs.", kind: "warn" })}>Escalate</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
