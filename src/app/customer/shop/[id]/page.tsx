"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Clock3, Info, MapPin, ShieldCheck, Star } from "lucide-react";
import { useApp, selectUserLoc } from "@/store/useApp";
import { Badge, Button, EmptyState } from "@/components/ui/base";
import { Sheet, Tabs } from "@/components/ui/overlays";
import { ProductCard, ProductQuickView } from "@/components/customer/shared";
import { SmartImage } from "@/components/ui/smart-image";
import { canonicalProducts } from "@/lib/catalog";
import { shopImage } from "@/lib/images";
import { haversineKm, inr } from "@/lib/utils";
import type { Canonical } from "@/lib/catalog";

export default function ShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const shops = useApp((s) => s.shops);
  const products = useApp((s) => s.products);
  const userLoc = useApp(selectUserLoc);
  const [cat, setCat] = useState("all");
  const [infoOpen, setInfoOpen] = useState(false);
  const [quick, setQuick] = useState<Canonical | null>(null);

  const shop = shops.find((s) => s.id === id);
  const items = useMemo(() => products.filter((p) => p.shopId === id && p.status === "active"), [products, id]);
  const canon = useMemo(() => canonicalProducts(items), [items]);
  const cats = useMemo(() => {
    const set = new Set(items.map((p) => p.category));
    return [
      { id: "all", label: `All · ${items.length}` },
      ...[...set].map((c) => ({ id: c, label: c, count: items.filter((p) => p.category === c).length })),
    ];
  }, [items]);
  const shown = cat === "all" ? canon : canon.filter((c) => c.category === cat);
  const productsOf = (c: Canonical) => items.find((p) => p.name.toLowerCase() === c.key)!;

  if (!shop) {
    return <EmptyState emoji="🤷" title="Shop not found" body="It may have been removed from the demo." action={<Link href="/customer/shops"><Button>Back to shops</Button></Link>} />;
  }

  const dist = haversineKm(userLoc, shop.location);
  const eta = shop.prepTimeMin + Math.round(dist * 3.2) + 6;
  const closed = shop.status === "offline";

  return (
    <div className="space-y-5">
      <Link href="/customer/shops" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-brand">
        <ChevronLeft size={15} /> All shops
      </Link>

      {/* hero */}
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="relative h-44 sm:h-52">
          <SmartImage src={shopImage(shop)} alt={shop.name} seed={shop.id} className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <button onClick={() => setInfoOpen(true)} aria-label="Shop info" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow transition hover:bg-white">
            <Info size={15} />
          </button>
          <div className="absolute inset-x-4 bottom-3.5">
            <div className="flex flex-wrap items-center gap-2">
              {shop.status === "online" ? <Badge tone="success">● Open</Badge> : shop.status === "busy" ? <Badge tone="accent">● Busy — slower delivery</Badge> : <Badge tone="danger">● Closed</Badge>}
              {shop.verified && <span className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-brand"><ShieldCheck size={10} /> Verified Local Shop</span>}
              {shop.sponsored && <span className="rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] font-bold text-white">Promoted</span>}
            </div>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white">{shop.name}</h1>
            <p className="text-xs text-white/80">{shop.tagline}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 divide-x border-t text-center">
          {[
            { v: `${shop.rating}`, l: `${shop.ratingCount.toLocaleString("en-IN")} ratings` },
            { v: `${eta} min`, l: "delivery" },
            { v: `${dist.toFixed(1)} km`, l: "distance" },
            { v: inr(shop.minOrder), l: "min order" },
          ].map((m) => (
            <div key={m.l} className="px-2 py-3">
              <p className="num text-sm font-bold">{m.v}</p>
              <p className="text-[10px] text-muted-foreground">{m.l}</p>
            </div>
          ))}
        </div>
        {shop.status === "busy" && (
          <p className="border-t bg-accent-soft px-4 py-2.5 text-xs font-medium text-accent">
            This store is handling a rush right now. Orders may take a few minutes longer.
          </p>
        )}
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
              {shown.map((c) => {
                const p = productsOf(c);
                return p ? <ProductCard key={c.key} product={p} canonical={c} onQuickView={setQuick} /> : null;
              })}
            </div>
          )}
        </>
      )}

      {/* info sheet */}
      <Sheet open={infoOpen} onClose={() => setInfoOpen(false)} title="Store details" side="bottom">
        <div className="space-y-3 text-sm">
          <div className="rounded-xl bg-muted p-3">
            <p className="font-bold">{shop.name}</p>
            <p className="text-xs text-muted-foreground">{shop.address}, {shop.area} — {shop.pincode}</p>
          </div>
          {[
            ["Timings", `${shop.openTime} – ${shop.closeTime}`],
            ["Owner", shop.ownerName],
            ["Delivery radius", `${shop.radiusKm} km`],
            ...(shop.docs.fssai ? [["FSSAI", shop.docs.fssai]] : []),
            ...(shop.docs.gstin ? [["GSTIN", shop.docs.gstin]] : []),
          ].map(([l, v]) => (
            <div key={l} className="flex items-center justify-between border-b border-dashed pb-2">
              <span className="text-muted-foreground">{l}</span><span className="font-semibold">{v}</span>
            </div>
          ))}
          <div className="rounded-xl bg-brand-softer p-3 text-xs leading-relaxed text-brand">
            🛡️ Documents verified by NearKart operations. Fresh perishables auto-hide near expiry. Report any issue within 12 hours for an instant refund or replacement.
          </div>
          <Button variant="secondary" className="w-full">Contact support</Button>
        </div>
      </Sheet>

      <ProductQuickView canonical={quick} onClose={() => setQuick(null)} />
    </div>
  );
}
