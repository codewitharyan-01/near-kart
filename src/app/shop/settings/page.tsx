"use client";

import { FileCheck2, Landmark, Save, Settings2, Store, Truck } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Badge, Button, Field, Input, Select } from "@/components/ui/base";
import { StatusToggle } from "../layout";

export default function ShopSettingsPage() {
  const shops = useApp((s) => s.shops);
  const pushToast = useApp((s) => s.pushToast);
  const shop = shops.find((s) => s.id === "sharma")!;

  const save = () => pushToast({ title: "Settings saved ✅", body: "Changes sync to the customer app within a minute.", kind: "success" });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Shop settings</h1>

      <section className="card-surface p-4">
        <p className="mb-3 flex items-center gap-2 font-bold"><Store size={16} className="text-brand" /> Business details</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Shop name"><Input defaultValue={shop.name} /></Field>
          <Field label="Owner name"><Input defaultValue={shop.ownerName} /></Field>
          <Field label="Address" className="sm:col-span-2"><Input defaultValue={shop.address} /></Field>
          <Field label="Area"><Input defaultValue={shop.area} /></Field>
          <Field label="Pincode"><Input defaultValue={shop.pincode} /></Field>
        </div>
      </section>

      <section className="card-surface p-4">
        <p className="mb-1 flex items-center gap-2 font-bold"><Truck size={16} className="text-brand" /> Delivery & availability</p>
        <p className="mb-3 text-xs text-muted-foreground">These settings decide when and where customers can order from you.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Delivery radius" hint="Wider radius = more customers, longer rides">
            <Select defaultValue={String(shop.radiusKm)}>
              <option value="1">1 km</option>
              <option value="1.5">1.5 km</option>
              <option value="2">2 km</option>
              <option value="3">3 km</option>
            </Select>
          </Field>
          <Field label="Preparation time" hint="Added to every ETA">
            <Select defaultValue={String(shop.prepTimeMin)}>
              <option value="5">5 minutes</option>
              <option value="8">8 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
            </Select>
          </Field>
          <Field label="Minimum order (₹)" hint="Platform floor is ₹100">
            <Input type="number" defaultValue={shop.minOrder} />
          </Field>
          <Field label="Open hours">
            <div className="flex gap-2">
              <Input defaultValue={shop.openTime} type="time" />
              <Input defaultValue={shop.closeTime} type="time" />
            </div>
          </Field>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-muted p-3">
          <div>
            <p className="text-sm font-semibold">Current status</p>
            <p className="text-xs text-muted-foreground">Busy mode shows your store but pauses new orders.</p>
          </div>
          <StatusToggle />
        </div>
      </section>

      <section className="card-surface p-4">
        <p className="mb-3 flex items-center gap-2 font-bold"><Landmark size={16} className="text-brand" /> Banking & payouts</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Account number"><Input defaultValue="5011••••4231" /></Field>
          <Field label="IFSC"><Input defaultValue="HDFC0000123" /></Field>
        </div>
      </section>

      <section className="card-surface p-4">
        <p className="mb-3 flex items-center gap-2 font-bold"><FileCheck2 size={16} className="text-brand" /> Documents & compliance</p>
        <div className="space-y-2 text-sm">
          {[
            ["PAN", shop.docs.pan, true],
            ["GSTIN", shop.docs.gstin, true],
            ["FSSAI", shop.docs.fssai, true],
            ["Seller agreement", "Signed on 14 Jun 2026", true],
          ].map(([l, v, ok]) => (
            <div key={l as string} className="flex items-center justify-between rounded-xl border px-3.5 py-2.5">
              <div>
                <p className="font-semibold">{l}</p>
                <p className="font-mono text-xs text-muted-foreground">{v}</p>
              </div>
              {ok ? <Badge tone="brand">✓ Verified</Badge> : <Badge tone="accent">Pending</Badge>}
            </div>
          ))}
        </div>
      </section>

      <section className="card-surface p-4">
        <p className="mb-3 flex items-center gap-2 font-bold"><Settings2 size={16} className="text-brand" /> Notifications</p>
        <div className="space-y-2 text-sm">
          {["New order sound + popup", "Low stock daily digest at 8 PM", "Payout deposited alerts", "Weekly performance report"].map((l) => (
            <label key={l} className="flex items-center justify-between rounded-xl border px-3.5 py-2.5">
              <span className="font-semibold">{l}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-emerald-600" aria-label={l} />
            </label>
          ))}
        </div>
      </section>

      <Button className="w-full" size="lg" onClick={save}><Save size={16} /> Save all settings</Button>
    </div>
  );
}
