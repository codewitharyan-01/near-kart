"use client";

import { use, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Clock3, MapPin, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useApp, selectUserLoc } from "@/store/useApp";
import { canonicalProducts, rankVariants } from "@/lib/catalog";
import { productImage } from "@/lib/images";
import { Badge, Button, SectionTitle, Stepper } from "@/components/ui/base";
import { PairingsRow } from "@/components/customer/shared";
import { SmartImage } from "@/components/ui/smart-image";
import { inr } from "@/lib/utils";

export default function ProductDetailPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = use(params);
  const router = useRouter();
  const products = useApp((s) => s.products);
  const shops = useApp((s) => s.shops);
  const userLoc = useApp(selectUserLoc);
  const setQty = useApp((s) => s.setQty);
  const cartItems = useApp((s) => s.cart.items);
  const pushToast = useApp((s) => s.pushToast);
  const [qty, setQtyLocal] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const canonical = useMemo(
    () => canonicalProducts(products).find((c) => c.key === decodeURIComponent(key).toLowerCase()) ?? null,
    [products, key],
  );

  const ranked = useMemo(() => (canonical ? rankVariants(canonical, shops, userLoc) : []), [canonical, shops, userLoc]);
  const best = ranked[0] ?? null;
  const chosenShopId = picked ?? best?.shop.id;
  const chosen = ranked.find((r) => r.shop.id === chosenShopId);
  const chosenProduct = chosen ? products.find((p) => p.id === chosen.v.productId) : null;
  const inCart = chosenProduct ? cartItems[chosenProduct.id] ?? 0 : 0;
  const effectiveQty = qty || inCart;

  if (!canonical || !best) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-lg font-bold">Product unavailable nearby</p>
        <Button className="mt-4" onClick={() => router.push("/customer")}>Back to essentials</Button>
      </div>
    );
  }

  const eta = chosen ? chosen.shop.prepTimeMin + Math.round(chosen.distKm * 3.2) + 6 : 20;
  const discount = canonical.mrp > canonical.price ? Math.round((1 - canonical.price / canonical.mrp) * 100) : 0;

  const changeQty = (q: number) => {
    setQtyLocal(Math.max(0, q));
    if (chosenProduct) setQty(chosenProduct.id, q);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-brand">
        <ChevronLeft size={15} /> Back
      </button>

      <div className="mt-5 grid gap-10 lg:grid-cols-2">
        {/* gallery */}
        <div className="space-y-3">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-3xl border bg-card">
            <SmartImage src={productImage(canonical)} alt={canonical.name} seed={canonical.key} className="aspect-square w-full" />
            {discount > 0 && <span className="num absolute left-4 top-4 rounded-lg bg-foreground px-2.5 py-1 text-xs font-bold text-background">{discount}% off</span>}
          </motion.div>
          <div className="grid grid-cols-4 gap-3">
            {[...groups2(canonical.category)].map((g, i) => (
              <div key={i} className="overflow-hidden rounded-xl border bg-card">
                <SmartImage src={`https://images.unsplash.com/${g}?auto=format&fit=crop&w=300&q=60`} alt={`${canonical.name} view ${i + 1}`} seed={canonical.key + i} className="aspect-square w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* details */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{canonical.brand} · {canonical.packSize} · {canonical.category}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{canonical.name}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="num text-3xl font-bold">{inr(chosen?.v.price ?? canonical.price)}</span>
            {(chosen?.v.mrp ?? canonical.mrp) > (chosen?.v.price ?? canonical.price) && (
              <>
                <span className="num text-lg text-muted-foreground line-through">{inr(chosen?.v.mrp ?? canonical.mrp)}</span>
                <Badge tone="brand">Save {inr((chosen?.v.mrp ?? canonical.mrp) - (chosen?.v.price ?? canonical.price))}</Badge>
              </>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">Inclusive of all taxes</p>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {canonical.category === "Fruits & Vegetables"
              ? "Sourced fresh each morning from the wholesale mandi and stocked by your neighbourhood seller within the last 24 hours. Perishables are auto-hidden near expiry, so what you see is always fresh."
              : `Genuine ${canonical.brand} stock, live-counted by the shop owner. Stock syncs with every accepted order, and sold-out items disappear from the app automatically — no surprises at the door.`}
          </p>

          {/* routing card */}
          <div className="mt-6 rounded-2xl border border-brand/30 bg-brand-softer p-4">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand"><Truck size={13} /> Fastest fulfilment</p>
            {chosen && (
              <p className="mt-1.5 text-sm font-semibold">{chosen.shop.name} · {chosen.distKm.toFixed(1)} km · <Clock3 size={12} className="inline" /> ~{eta} min</p>
            )}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {ranked.map((r) => (
                <button
                  key={r.shop.id}
                  onClick={() => setPicked(r.shop.id)}
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${r.shop.id === chosenShopId ? "border-brand bg-brand-soft text-brand" : "text-muted-foreground hover:border-foreground/30"}`}
                >
                  {r.shop.id === chosenShopId && <Check size={10} />}
                  {r.shop.name.split(" ")[0]} · {r.distKm.toFixed(1)} km · {inr(r.v.price)}
                </button>
              ))}
            </div>
          </div>

          {/* add to cart */}
          <div className="mt-6 flex items-center gap-3">
            <Stepper qty={effectiveQty} max={chosen?.v.stock ?? 9} onChange={changeQty} />
            <Button
              variant="brand"
              size="lg"
              className="flex-1"
              disabled={!chosenProduct || effectiveQty === 0}
              onClick={() => pushToast({ title: `${canonical.name} ×${effectiveQty} in cart`, kind: "success" })}
            >
              {effectiveQty > 0 ? `${inr((chosen?.v.price ?? canonical.price) * effectiveQty)} · Go to checkout →` : "Add to cart"}
            </Button>
          </div>
          {effectiveQty > 0 && (
            <button onClick={() => changeQty(0)} className="mt-2 text-xs font-semibold text-muted-foreground hover:text-danger">Remove from cart</button>
          )}

          {/* trust row */}
          <div className="mt-7 grid grid-cols-3 gap-3 border-t pt-5 text-center">
            {[
              { icon: ShieldCheck, l: "Verified shop", d: "KYC + FSSAI checked" },
              { icon: RotateCcw, l: "12-hour refunds", d: "Photo-proof claims" },
              { icon: MapPin, l: "Live stock", d: "Synced on every order" },
            ].map((f) => (
              <div key={f.l}>
                <f.icon size={17} className="mx-auto text-brand" />
                <p className="mt-1.5 text-xs font-bold">{f.l}</p>
                <p className="text-[10px] text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* pairings */}
      {chosenShopId && chosenProduct && (
        <section className="mt-12 border-t pt-8">
          <SectionTitle title="Pairs perfectly with this" sub={`Everything below is in stock at ${chosen?.shop.name}`} />
          <div className="card-surface p-4">
            <PairingsRow seedNames={[canonical.name]} shopId={chosenShopId} exclude={[chosenProduct.id]} />
          </div>
        </section>
      )}
    </div>
  );
}

function groups2(category: string): string[] {
  const map: Record<string, string[]> = {
    "Fruits & Vegetables": ["photo-1512621776951-a57141f2eefd", "photo-1592924357228-91a4daadcfea", "photo-1540420773420-3366772f4999"],
    "Dairy & Bakery": ["photo-1550583724-b2692b85b150", "photo-1555507036-ab1f4038808a", "photo-1509440159596-0249088772ff"],
  };
  return map[category] ?? ["photo-1542838132-92c53300491e", "photo-1583258292688-d0213dc5a3a8", "photo-1604719312566-8912e9227c6a"];
}
