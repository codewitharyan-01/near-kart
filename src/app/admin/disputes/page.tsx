"use client";

import { useState } from "react";
import { Camera, Gavel, Lock, MapPin, ShieldCheck } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Badge, Button, EmptyState, StatCard } from "@/components/ui/base";
import { Dialog, Tabs, TRow, TH, TD } from "@/components/ui/overlays";
import { timeAgo } from "@/lib/utils";
import type { Dispute } from "@/types";

const LIABILITY_MATRIX = [
  ["Wrong / missing / damaged / expired product", "Shop", "Replacement first, then refund; 12–24h report window"],
  ["Proven rider mishandling", "Rider", "Evidence: OTP, GPS trail, photo, timestamp logs"],
  ["Wrong address entered by customer", "Customer", "Platform discretion on goodwill re-delivery"],
  ["Payment failure", "Platform", "Auto-retry + gateway reconciliation"],
  ["Goodwill gesture", "Platform", "Capped at ₹150 per customer per month"],
];

export default function AdminDisputesPage() {
  const disputes = useApp((s) => s.disputes);
  const resolveDispute = useApp((s) => s.resolveDispute);
  const pushToast = useApp((s) => s.pushToast);
  const [tab, setTab] = useState("Open");
  const [review, setReview] = useState<Dispute | null>(null);

  const open = disputes.filter((d) => d.status === "Open");
  const resolved = disputes.filter((d) => d.status === "Resolved");
  const shown = tab === "Open" ? open : resolved;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Dispute & refund centre</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Open disputes" value={open.length} tone="danger" sub="SLA: resolve < 24h" />
        <StatCard label="Resolved (7d)" value={resolved.length + 3} tone="brand" />
        <StatCard label="Refunds issued" value="₹486" sub="lifetime demo" tone="accent" />
        <StatCard label="Fraud blocks" value="2" sub="repeat abusers flagged" tone="info" />
      </div>

      <Tabs tabs={[{ id: "Open", label: "Open", count: open.length }, { id: "Resolved", label: "Resolved", count: resolved.length }]} active={tab} onChange={setTab} />

      {shown.length === 0 ? (
        <EmptyState emoji="⚖️" title={tab === "Open" ? "No open disputes" : "Nothing resolved yet"} />
      ) : (
        <div className="space-y-3">
          {shown.map((d) => (
            <div key={d.id} className="card-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <Gavel size={14} className="text-danger" /> {d.type}
                    <span className="num text-xs font-normal text-muted-foreground">· {d.orderCode} · by {d.by}</span>
                  </p>
                  <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">{d.description}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Filed {timeAgo(d.filedAt)} · claim value {`₹${d.amount}`}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge tone={d.status === "Open" ? "danger" : "brand"}>{d.status}</Badge>
                  {d.liability && <Badge tone="outline">liability: {d.liability}</Badge>}
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Badge tone={d.evidence.photo ? "brand" : "neutral"}><Camera size={10} /> photo {d.evidence.photo ? "✓" : "—"}</Badge>
                <Badge tone={d.evidence.otpVerified ? "brand" : "neutral"}>OTP {d.evidence.otpVerified ? "✓" : "—"}</Badge>
                <Badge tone={d.evidence.gpsMatch ? "brand" : "neutral"}><MapPin size={10} /> GPS {d.evidence.gpsMatch ? "✓" : "—"}</Badge>
              </div>
              {d.status === "Open" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setReview(d)}>Review evidence</Button>
                  <Button size="sm" onClick={() => { resolveDispute(d.id, d.by === "rider" ? "Rider" : "Shop"); pushToast({ title: "Dispute resolved", body: "Refund scheduled · liability recorded.", kind: "success" }); }}>
                    <ShieldCheck size={14} /> Refund & resolve
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { resolveDispute(d.id, "Platform"); pushToast({ title: "Goodwill refund issued", body: "Covered by platform — capped at ₹150/customer/mo.", kind: "info" }); }}>
                    Goodwill refund
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { resolveDispute(d.id, "Customer"); pushToast({ title: "Claim rejected", body: "Evidence contradicts claim — customer notified.", kind: "warn" }); }}>
                    Reject claim
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* evidence dialog */}
      <Dialog open={!!review} onClose={() => setReview(null)} title="Evidence file" wide>
        {review && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-2">
              {["Customer photo", "Rider GPS trail", "Delivery OTP log"].map((e) => (
                <div key={e} className="flex h-24 flex-col items-center justify-center gap-1 rounded-xl bg-muted text-xs text-muted-foreground">
                  <span className="text-xl">🗂️</span>{e}
                </div>
              ))}
            </div>
            <div className="rounded-xl border p-3 text-xs leading-relaxed">
              <p className="flex items-center gap-1.5 font-bold"><Lock size={13} className="text-brand" /> Immutable evidence chain</p>
              <p className="mt-1 text-muted-foreground">Every event on order {review.orderCode} is timestamped and append-only: placement, acceptance, stock deduction, pickup OTP at shop, GPS breadcrumbs, delivery OTP. Logs are shared only with authorized dispute handlers.</p>
            </div>
            <Button className="w-full" variant="outline" onClick={() => setReview(null)}>Close file</Button>
          </div>
        )}
      </Dialog>

      {/* liability matrix */}
      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Liability matrix — how we decide</p>
        <div className="card-surface overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead className="border-b bg-muted/50">
              <tr><TH>Issue</TH><TH>Primary liability</TH><TH>Resolution logic</TH></tr>
            </thead>
            <tbody>
              {LIABILITY_MATRIX.map(([issue, who, logic]) => (
                <TRow key={issue}>
                  <TD className="text-sm font-semibold">{issue}</TD>
                  <TD><Badge tone={who === "Shop" ? "accent" : who === "Rider" ? "info" : who === "Customer" ? "danger" : "neutral"}>{who}</Badge></TD>
                  <TD className="text-xs text-muted-foreground">{logic}</TD>
                </TRow>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
