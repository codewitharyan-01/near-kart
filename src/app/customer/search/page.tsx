"use client";

import { Suspense } from "react";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Clock3, Search, Sparkles, TrendingUp, X } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { useApp, selectUserLoc } from "@/store/useApp";
import { canonicalProducts, rankVariants, type Canonical } from "@/lib/catalog";
import { productImage } from "@/lib/images";
import { Input, Button, Badge, EmptyState } from "@/components/ui/base";
import { ProductQuickView } from "@/components/customer/shared";
import { SmartImage } from "@/components/ui/smart-image";
import { inr } from "@/lib/utils";

const TRENDING = ["milk", "bread", "eggs", "atta", "cold drink", "maggi", "tomato", "notebook", "earphones"];
const RECENT_KEY = "nearkart-recents";

function SearchPageInner() {
  const products = useApp((s) => s.products);
  const shops = useApp((s) => s.shops);
  const userLoc = useApp(selectUserLoc);
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [recent, setRecent] = useState<string[]>([]);
  const [quick, setQuick] = useState<Canonical | null>(null);
  const [sort, setSort] = useState<"nearest" | "price">("nearest");

  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")); } catch { /* ignore */ }
  }, []);

  const query = q.trim().toLowerCase();

  type Hit = { c: Canonical; best: NonNullable<ReturnType<typeof rankVariants>[number]> };
  const results = useMemo((): Hit[] => {
    if (query.length < 2) return [];
    return canonicalProducts(products)
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.brand.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query),
      )
      .map((c) => ({ c, best: rankVariants(c, shops, userLoc)[0] ?? null }))
      .filter((x): x is Hit => x.best !== null)
      .sort((a, b) =>
        sort === "nearest"
          ? a.best.distKm - b.best.distKm
          : a.best.v.price - b.best.v.price,
      );
  }, [products, shops, userLoc, query, sort]);

  const commitSearch = (term: string) => {
    const t = term.trim().toLowerCase();
    if (t.length < 2) return;
    setRecent((r) => {
      const next = [t, ...r.filter((x) => x !== t)].slice(0, 6);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-[57px] z-40 -mx-4 bg-background/95 px-4 pb-2 pt-1 backdrop-blur sm:-mx-6 sm:px-6">
        <form
          onSubmit={(e) => { e.preventDefault(); commitSearch(q); }}
          className="relative"
        >
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand" />
          <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search milk, bread, charger…" className="rounded-full pl-10 pr-10" aria-label="Search products" />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <X size={12} />
            </button>
          )}
        </form>
        {results.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <button onClick={() => setSort("nearest")} className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${sort === "nearest" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
              ⚡ Nearest first
            </button>
            <button onClick={() => setSort("price")} className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${sort === "price" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
              ₹ Lowest price
            </button>
            <span className="num ml-auto text-[11px] text-muted-foreground">{results.length} items · routed to fastest shop</span>
          </div>
        )}
      </div>

      {/* discovery state */}
      {query.length < 2 && (
        <div className="space-y-6 pt-2">
          {recent.length > 0 && (
            <section>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground"><Clock3 size={12} /> Recent searches</p>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button key={r} onClick={() => setQ(r)} className="flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-2 text-sm transition hover:border-foreground/40">
                    {r} <X size={11} className="text-muted-foreground" />
                  </button>
                ))}
              </div>
            </section>
          )}
          <section>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground"><TrendingUp size={12} className="text-brand" /> Trending in your area</p>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map((t) => (
                <button key={t} onClick={() => setQ(t)} className="rounded-full border bg-card px-3.5 py-2 text-sm transition hover:border-foreground/40">{t}</button>
              ))}
            </div>
          </section>
          <section>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Browse categories</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                <button key={c.id} onClick={() => setQ(c.label.split(" ")[0].toLowerCase())} className="group text-left">
                  <span className="block aspect-square overflow-hidden rounded-2xl border bg-muted transition group-hover:border-foreground/30">
                    <SmartImage src={productImage({ name: c.label, brand: "", category: c.id })} alt={c.label} seed={c.id} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
                  </span>
                  <span className="mt-1.5 block truncate text-xs font-semibold">{c.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* results — each routed to its nearest stocked shop */}
      {query.length >= 2 && results.length === 0 && (
        <EmptyState emoji="🔍" title={`Nothing found for "${q}"`} body="Try a shorter term — or browse the categories above." />
      )}

      {query.length >= 2 && results.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(({ c, best }) => (
            <button
              key={c.key}
              onClick={() => { setQuick(c); commitSearch(q); }}
              className="group flex gap-3 rounded-2xl border bg-card p-3 text-left transition-all hover:shadow-lift"
            >
              <span className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                <SmartImage src={productImage(c)} alt={c.name} seed={c.key} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{c.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{c.brand} · {c.packSize}</span>
                  </span>
                  {c.mrp > c.price && <Badge tone="brand" className="shrink-0">{Math.round((1 - c.price / c.mrp) * 100)}% off</Badge>}
                </span>
                <span className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Sparkles size={10} className="text-brand" />
                  Fastest: {best.shop.name.split(" ")[0]} · {best.distKm.toFixed(1)} km
                  {c.variants.length > 1 && <> · +{c.variants.length - 1} shop{c.variants.length - 1 > 1 ? "s" : ""}</>}
                </span>
                <span className="mt-1.5 flex items-center justify-between">
                  <span className="num text-sm font-bold">{inr(best.v.price)}</span>
                  <span className="rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-bold text-background">View</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      <ProductQuickView canonical={quick} onClose={() => setQuick(null)} />
      <div className="h-2" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-10 text-sm text-muted-foreground">Loading search…</div>}>
      <SearchPageInner />
    </Suspense>
  );
}
