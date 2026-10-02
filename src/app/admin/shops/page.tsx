"use client";

import { useState } from "react";
import { BadgeCheck, FileCheck2, MapPin, ShieldX, Star, XCircle } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Badge, Button, EmptyState, StatCard } from "@/components/ui/base";
import { Dialog, TRow, TH, TD } from "@/components/ui/overlays";
import { inr } from "@/lib/utils";
import type { Shop } from "@/types";

export default function AdminShopsPage() {
  const shops = useApp((s) => s.shops);
  const products = useApp((s) => s.products);
  const orders = useApp((s) => s.orders);
  const pushToast = useApp((s) => s.pushToast);
  const setShopStatus = useApp((s) => s.setShopStatus);

  /* demo: one pending application to showcase the verification queue */
  const [queue, setQueue] = useState<Shop[]>([
    {
      ...shops[0],
      id: "pending1",
      name: "New Krishna Grocers",
      ownerName: "Dinesh Krishna",
      area: "Jodhpur",
      status: "offline",
      verified: false,
      rating: 0,
      ratingCount: 0,
      ordersToday: 0,
      joinedAt: "2026-10-02",
      emoji: "🛕",
      gradient: "from-teal-500 to-emerald-700",
    },
  ]);
  const [review, setReview] = useState<Shop | null>(null);
  const [checklist, setChecklist] = useState({ pan: true, gstin: true, fssai: true, bank: false, location: false });

  const active = shops.filter((s) => s.status !== "offline").length;
  const gmvByShop = (id: string) => orders.filter((o) => o.shopId === id && !["CANCELLED", "REJECTED"].includes(o.status)).reduce((t, o) => t + o.itemTotal, 0);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Shops</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Pending verification" value={queue.length} tone="accent" sub="avg. TAT 21h" />
        <StatCard label="Active shops" value={active} tone="brand" />
        <StatCard label="Avg. acceptance" value="93%" sub="last 7 days" tone="info" />
        <StatCard label="Suspended (lifetime)" value={0} tone="danger" />
      </div>

      {/* verification queue */}
      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Verification queue</p>
        {queue.length === 0 ? (
          <EmptyState emoji="✅" title="Queue is clear" body="All shop applications have been reviewed." />
        ) : (
          <div className="space-y-3">
            {queue.map((s) => (
              <div key={s.id} className="card-surface flex flex-wrap items-center gap-3 p-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-2xl ${s.gradient}`}>{s.emoji}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.ownerName} · {s.area} · applied {s.joinedAt}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge tone={checklist.pan ? "brand" : "accent"}>PAN {checklist.pan ? "✓" : "…"}</Badge>
                    <Badge tone={checklist.gstin ? "brand" : "accent"}>GSTIN {checklist.gstin ? "✓" : "…"}</Badge>
                    <Badge tone={checklist.fssai ? "brand" : "accent"}>FSSAI {checklist.fssai ? "✓" : "…"}</Badge>
                    <Badge tone={checklist.bank ? "brand" : "accent"}>Bank {checklist.bank ? "✓" : "…"}</Badge>
                    <Badge tone={checklist.location ? "brand" : "accent"}>Location {checklist.location ? "✓" : "…"}</Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setReview(s)}>Review documents</Button>
                <Button size="sm" onClick={() => { setQueue((q) => q.filter((x) => x.id !== s.id)); pushToast({ title: "Shop approved 🎉", body: `${s.name} is live in the ${s.area} zone.`, kind: "success" }); }} disabled={!Object.values(checklist).every(Boolean)}>
                  <BadgeCheck size={14} /> Approve
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setQueue((q) => q.filter((x) => x.id !== s.id)); pushToast({ title: "Application rejected", body: "Owner notified with reason via WhatsApp.", kind: "warn" }); }}>
                  <XCircle size={14} /> Reject
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* active shops */}
      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Live shops</p>
        <div className="card-surface overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <thead className="border-b bg-muted/50">
              <tr><TH>Shop</TH><TH>Area</TH><TH>Rating</TH><TH>Orders today</TH><TH>GMV</TH><TH>Acceptance</TH><TH>Status</TH><TH className="text-right">Action</TH></tr>
            </thead>
            <tbody>
              {shops.map((s) => (
                <TRow key={s.id}>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-lg ${s.gradient}`}>{s.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold">{s.name} {s.verified && <BadgeCheck size={12} className="inline text-brand" />}</p>
                        <p className="text-[11px] text-muted-foreground">{s.type} · {products.filter((p) => p.shopId === s.id).length} SKUs</p>
                      </div>
                    </div>
                  </TD>
                  <TD className="text-xs">{s.area}<span className="block text-[10px] text-muted-foreground"><MapPin size={9} className="inline" /> {s.radiusKm} km</span></TD>
                  <TD className="text-xs font-bold">{s.rating > 0 ? <><Star size={11} className="inline text-amber-400" /> {s.rating}</> : "—"}</TD>
                  <TD className="num text-sm font-bold">{s.ordersToday}</TD>
                  <TD className="num text-sm">{inr(gmvByShop(s.id), { compact: true })}</TD>
                  <TD className="num text-xs">{s.acceptanceRate}%</TD>
                  <TD><Badge tone={s.status === "online" ? "brand" : s.status === "busy" ? "accent" : "danger"}>{s.status}</Badge></TD>
                  <TD className="text-right">
                    <Button size="xs" variant="ghost" onClick={() => setShopStatus(s.id, s.status === "offline" ? "online" : "offline")}>
                      {s.status === "offline" ? "Bring online" : "Force offline"}
                    </Button>
                  </TD>
                </TRow>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* document review dialog */}
      <Dialog open={!!review} onClose={() => setReview(null)} title={`Verify — ${review?.name ?? ""}`} wide>
        {review && (
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border p-3">
              <p className="flex items-center gap-2 font-bold"><FileCheck2 size={15} className="text-brand" /> Uploaded documents</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {["PAN card", "FSSAI license", "Cancelled cheque"].map((d) => (
                  <div key={d} className="flex h-20 flex-col items-center justify-center gap-1 rounded-xl bg-muted text-xs text-muted-foreground">
                    <span className="text-xl">📄</span>{d}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {([
                ["pan", "PAN — ABCPS1234F"],
                ["gstin", "GSTIN — 24ABCDE1234F1Z5"],
                ["fssai", "FSSAI — 10725019000123"],
                ["bank", "Bank account — penny-drop verified"],
                ["location", "Shop location — GPS within 50 m of address"],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between rounded-xl border px-3.5 py-2.5">
                  <span className="font-semibold">{label}</span>
                  <input
                    type="checkbox"
                    checked={checklist[key]}
                    onChange={(e) => setChecklist((c) => ({ ...c, [key]: e.target.checked }))}
                    className="h-4 w-4 rounded accent-emerald-600"
                    aria-label={label}
                  />
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Approve unlocks once every check is ticked. Rejections require a reason — shared with the applicant on WhatsApp.</p>
            <Button className="w-full" variant="outline" onClick={() => setReview(null)}>Done reviewing</Button>
          </div>
        )}
      </Dialog>

      <div className="rounded-xl border border-danger/30 bg-danger-soft p-4 text-xs leading-relaxed text-danger">
        <p className="flex items-center gap-1.5 font-bold"><ShieldX size={14} /> Suspension policy</p>
        Three verified product-complaints in 7 days, or a proven counterfeit listing, triggers automatic suspension pending re-verification. Payouts freeze during investigation.
      </div>
    </div>
  );
}
