"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, Info, MapPin, ShieldCheck, Star } from "lucide-react";
import { useApp, selectUserLoc } from "@/store/useApp";
import { Badge, Button, EmptyState } from "@/components/ui/base";
import { Sheet, Tabs } from "@/components/ui/overlays";
import { ProductCard } from "@/components/customer/shared";
import { haversineKm, inr } from "@/lib/utils";

export default function ShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const shops = useApp((s) => s.shops);
  const products = useApp((s) => s.products);
  const userLoc = useApp(selectUserLoc);
  const [cat, setCat] = useState("all");
  const [infoOpen, setInfoOpen] = useState(false);

  const shop = shops.find((s) => s.id === id);
  const items = useMemo(() => products.filter((p) => p.shopId === id && p.status === "active"), [products, id]);
  const cats = useMemo(() => {
    const set = new Set(items.map((p) => p.category));
    return [
      { id: "all", label: "All", count: items.length },
      ...[...set].map((c) => ({ id: c, label: c, count: items.filter((p) => p.category === c).length })),
    ];
  }, [items]);
  const shown = cat === "all" ? items : items.filter((p) => p.category === cat);

  if (!shop) {
    return <EmptyState emoji="🤷" title="Shop not found" body="It may have been removed from the demo." action={<Link href="/customer/shops"><Button>Back to shops</Button></Link>} />;
  }

  const dist = haversineKm(userLoc, shop.location);
  const eta = shop.prepTimeMin + Math.round(dist * 3.2) + 6;
  const closed = shop.status === "offline";

  return (
    <div className="space-y-5">
      {/* hero header */}
      <div className="card-surface overflow-hidden">
        <div className={`brand-gradient relative h-24 ${shop.gradient}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <button onClick={() => setInfoOpen(true)} aria-label="Shop info" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur transition hover:bg-white/30">
            <Info size={15} />
          </button>
        </div>
        <div className="relative px-4 pb-4">
          <div className="-mt-8 flex items-end justify-between">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-card bg-gradient-to-br text-4xl shadow-md ${shop.gradient}`}>{shop.emoji}</div>
            {shop.status === "online" ? <Badge tone="brand">● Open now</Badge> : shop.status === "busy" ? <Badge tone="accent">● Busy — slower delivery</Badge> : <Badge tone="danger">● Closed</Badge>}
          </div>
          <div className="mt-2 flex items-start justify-between gap-2">
            <div>
              <h1 className="flex items-center gap-1.5 font-display text-xl font-extrabold tracking-tight">
                {shop.name}
                {shop.verified && <ShieldCheck size={17} className="text-brand" />}
              </h1>
              <p className="text-xs text-muted-foreground">{shop.tagline}</p>
            </div>
            {shop.sponsored && <Badge tone="outline">Promoted</Badge>}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            {[
              { icon: Star, v: `${shop.rating}`, l: `${(shop.ratingCount / 1000).toFixed(1)}k` },
              { icon: Clock3, v: `${eta} min`, l: "delivery" },
              { icon: MapPin, v: `${dist.toFixed(1)} km`, l: "away" },
              { icon: null, v: inr(shop.minOrder), l: "min order" },
            ].map((m, i) => (
              <div key={i} className="rounded-xl bg-muted px-2 py-2">
                <p className="num text-sm font-bold">{m.v}</p>
                <p className="text-[10px] text-muted-foreground">{m.l}</p>
              </div>
            ))}
          </div>
          {shop.status === "busy" && (
            <p className="mt-3 rounded-xl bg-accent-soft px-3 py-2 text-xs font-medium text-accent">
              This store is handling a rush right now. Orders may take a few minutes longer.
            </p>
          )}
        </div>
      </div>

      {closed ? (
        <EmptyState emoji="🌙" title={`Opens at ${shop.openTime}`} body={`${shop.name} is closed right now. Browse other shops that deliver in 15–30 minutes.`} action={<Link href="/customer/shops"><Button>See open shops</Button></Link>} />
      ) : (
        <>
          <Tabs tabs={cats} active={cat} onChange={setCat} />
          {shown.length === 0 ? (
            <EmptyState emoji="📦" title="No products in this category" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      )}

      {/* shop info sheet */}
      <Sheet open={infoOpen} onClose={() => setInfoOpen(false)} title="Store details" side="bottom">
        <div className="space-y-3 text-sm">
          <div className="rounded-xl bg-muted p-3">
            <p className="font-bold">{shop.name}</p>
            <p className="text-xs text-muted-foreground">{shop.address}, {shop.area} — {shop.pincode}</p>
          </div>
          <div className="flex items-center justify-between border-b border-dashed pb-2">
            <span className="text-muted-foreground">Timings</span><span className="font-semibold">{shop.openTime} – {shop.closeTime}</span>
          </div>
          <div className="flex items-center justify-between border-b border-dashed pb-2">
            <span className="text-muted-foreground">Owner</span><span className="font-semibold">{shop.ownerName}</span>
          </div>
          {shop.docs.fssai && (
            <div className="flex items-center justify-between border-b border-dashed pb-2">
              <span className="text-muted-foreground">FSSAI</span><span className="font-mono text-xs font-semibold">{shop.docs.fssai}</span>
            </div>
          )}
          {shop.docs.gstin && (
            <div className="flex items-center justify-between border-b border-dashed pb-2">
              <span className="text-muted-foreground">GSTIN</span><span className="font-mono text-xs font-semibold">{shop.docs.gstin}</span>
            </div>
          )}
          <div className="rounded-xl bg-brand-softer p-3 text-xs leading-relaxed text-brand">
            🛡️ <strong>Verified Local Shop</strong> — documents verified by NearKart. Fresh-perishable items are auto-hidden near expiry.
            Report any issue within 12 hours for a fast refund or replacement.
          </div>
          <Button variant="secondary" className="w-full">Contact support</Button>
        </div>
      </Sheet>
    </div>
  );
}
