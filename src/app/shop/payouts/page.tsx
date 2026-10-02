"use client";

import { Banknote, Download, Landmark, Receipt, ShieldCheck } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Badge, Button, StatCard } from "@/components/ui/base";
import { TRow, TH, TD } from "@/components/ui/overlays";
import { dateShort, inr } from "@/lib/utils";

export default function ShopPayoutsPage() {
  const transactions = useApp((s) => s.transactions);
  const pushToast = useApp((s) => s.pushToast);

  const settled = transactions.filter((t) => t.status === "Settled");
  const pending = transactions.filter((t) => t.status === "Pending");
  const settledTotal = settled.reduce((t, x) => t + x.net, 0);
  const pendingTotal = pending.reduce((t, x) => t + x.net, 0);
  const lifetimeGross = transactions.reduce((t, x) => t + x.gross, 0);
  const lifetimeCommission = transactions.reduce((t, x) => t + x.commission + x.tcs, 0);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Payouts & earnings</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Pending settlement" value={inr(pendingTotal)} sub="releases in 24–48h" tone="accent" icon={<Banknote size={16} />} />
        <StatCard label="Settled to bank" value={inr(settledTotal)} sub="lifetime" icon={<Landmark size={16} />} />
        <StatCard label="Lifetime sales" value={inr(lifetimeGross, { compact: true })} sub="gross order value" tone="info" icon={<Receipt size={16} />} />
        <StatCard label="Platform fees" value={inr(lifetimeCommission, { compact: true })} sub="commission + TCS" tone="danger" icon={<ShieldCheck size={16} />} />
      </div>

      <div className="card-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand"><Landmark size={20} /></div>
            <div>
              <p className="text-sm font-bold">HDFC Bank ••••4231</p>
              <p className="text-xs text-muted-foreground">Weekly settlement every Tuesday · T+1 for prepaid</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => pushToast({ title: "Invoice downloaded 📄", body: "Demo — a real PDF invoice generates per order.", kind: "success" })}>
            <Download size={14} /> Download statement
          </Button>
        </div>
      </div>

      <div className="card-surface overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-b bg-muted/50">
            <tr>
              <TH>Date</TH><TH>Order</TH><TH className="text-right">Gross</TH><TH className="text-right">Commission (7%)</TH>
              <TH className="text-right">GST TCS (1%)</TH><TH className="text-right">Net payout</TH><TH>Status</TH><TH className="text-right">Invoice</TH>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <TRow key={t.id}>
                <TD className="text-xs text-muted-foreground">{dateShort(t.date)}</TD>
                <TD className="num text-xs font-bold">{t.orderCode}</TD>
                <TD className="text-right num">{inr(t.gross)}</TD>
                <TD className="text-right num text-danger">− {inr(t.commission)}</TD>
                <TD className="text-right num text-danger">− {inr(t.tcs)}</TD>
                <TD className="text-right num font-bold">{inr(t.net)}</TD>
                <TD><Badge tone={t.status === "Settled" ? "brand" : "accent"}>{t.status}</Badge></TD>
                <TD className="text-right">
                  <button onClick={() => pushToast({ title: "Invoice downloaded 📄", body: `${t.orderCode} tax invoice`, kind: "success" })} className="text-xs font-bold text-brand hover:underline">
                    PDF
                  </button>
                </TD>
              </TRow>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border bg-brand-softer p-4 text-xs leading-relaxed text-brand">
          <p className="font-bold">How your payout is calculated</p>
          <p className="mt-1.5">Net payout = order value − 7% platform commission − 1% GST TCS (collected on behalf of the government under Section 52). Refunds, if any, are adjusted against the next settlement.</p>
        </div>
        <div className="rounded-2xl border bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
          <p className="font-bold text-foreground">Growth tip from NearKart</p>
          <p className="mt-1.5">Shops that keep stock accuracy above 95% get a discovery boost in the customer app and win ~23% more repeat orders. Your accuracy this week: <strong className="text-brand">96%</strong>.</p>
        </div>
      </div>
    </div>
  );
}
