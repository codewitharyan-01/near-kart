"use client";

import { Bike, ShieldCheck, Star } from "lucide-react";
import { useApp } from "@/store/useApp";
import { ThemeToggle } from "@/components/brand/shell";
import { Badge, Field, Input, Select, Stars, Switch } from "@/components/ui/base";
import { inr } from "@/lib/utils";

export default function RiderProfilePage() {
  const riders = useApp((s) => s.riders);
  const me = riders.find((r) => r.id === "r1")!;

  return (
    <div className="space-y-4">
      <div className="card-surface p-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-700 text-xl font-extrabold text-white">RK</div>
        <h1 className="mt-2 font-display text-xl font-extrabold">{me.name}</h1>
        <p className="num text-xs text-muted-foreground">{me.phone} · {me.vehicle} · {me.vehicleNumber}</p>
        <div className="mt-2 flex justify-center gap-2">
          <Badge tone="brand"><ShieldCheck size={11} /> KYC verified</Badge>
          <Badge tone="accent"><Star size={11} /> {me.rating} rating</Badge>
          <Badge tone="outline">{me.trips.toLocaleString("en-IN")} trips</Badge>
        </div>
      </div>

      <div className="card-surface flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><Bike size={17} /></div>
          <div>
            <p className="text-sm font-bold">Available for jobs</p>
            <p className="text-xs text-muted-foreground">Zone: {me.zone}</p>
          </div>
        </div>
        <Switch checked={me.online} onChange={() => useApp.getState().toggleRiderOnline()} label="Online" />
      </div>

      <div className="card-surface p-4">
        <p className="mb-3 font-bold">Safety & support</p>
        <div className="space-y-2 text-sm">
          {[
            ["🛡️", "Accident insurance", "₹5L coverage on every active trip"],
            ["🆘", "Emergency SOS", "Connects to control room + shares live location"],
            ["⚖️", "Evidence-based disputes", "Your OTP, GPS and photo logs protect you"],
            ["📞", "Rider support", "WhatsApp + in-app chat, 7 AM – 11 PM"],
          ].map(([e, t, d]) => (
            <div key={t} className="flex items-center gap-3 rounded-xl border p-3">
              <span className="text-lg">{e}</span>
              <div><p className="font-semibold">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-surface p-4">
        <p className="mb-3 font-bold">Vehicle & documents</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Vehicle type"><Select defaultValue={me.vehicle}><option>Bike</option><option>Scooter</option><option>Bicycle</option></Select></Field>
          <Field label="Vehicle number"><Input defaultValue={me.vehicleNumber} /></Field>
          <Field label="Driving license" hint="Verified 15 Jun 2026"><Input defaultValue="GJ-DL-2019-884213" /></Field>
          <Field label="Aadhaar/PAN" hint="KYC on file"><Input defaultValue="XXXX-XXXX-8842" /></Field>
        </div>
      </div>

      <div className="card-surface flex items-center justify-between p-4">
        <div>
          <p className="text-sm font-bold">Dark mode</p>
          <p className="text-xs text-muted-foreground">Comfortable night rides</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="card-surface p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">Lifetime earnings</p>
            <p className="text-xs text-muted-foreground">since joining {me.joinedAt}</p>
          </div>
          <p className="num font-display text-xl font-extrabold text-brand">{inr(184260)}</p>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Stars value={me.rating} size={12} /> Top 10% of NearKart riders</div>
      </div>
    </div>
  );
}
