"use client";

import { useMemo, useState } from "react";
import { Search, Store } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Input, EmptyState, Badge } from "@/components/ui/base";
import { ProductCard } from "@/components/customer/shared";

export default function SearchPage() {
  const products = useApp((s) => s.products);
  const shops = useApp((s) => s.shops);
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (query.length < 2) return [];
    return products
      .filter(
        (p) =>
          p.status === "active" &&
          p.stock > 0 &&
          (p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)),
      )
      .sort((a, b) => b.popularity - a.popularity);
  }, [products, query]);

  const byShop = useMemo(() => {
    const map = new Map<string, typeof results>();
    for (const p of results) {
      const arr = map.get(p.shopId) ?? [];
      arr.push(p);
      map.set(p.shopId, arr);
    }
    return [...map.entries()];
  }, [results]);

  const names = new Set(results.map((r) => r.name));
  const suggestions = ["milk", "bread", "atta", "oil", "cold drink", "notebook", "earphones", "tomato"];

  return (
    <div className="space-y-4">
      <div className="sticky top-[57px] z-40 -mx-4 bg-background/90 px-4 pb-2 pt-1 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="relative">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand" />
          <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search across all nearby shops…" className="pl-10" aria-label="Search products" />
        </div>
        {query.length < 2 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => setQ(s)} className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-brand/40 hover:text-foreground">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {query.length >= 2 && results.length === 0 && (
        <EmptyState emoji="🔍" title="No products found nearby" body="Try another search — or browse shops directly." />
      )}

      {byShop.map(([shopId, list]) => {
        const shop = shops.find((s) => s.id === shopId);
        if (!shop || shop.status === "offline") return null;
        return (
          <section key={shopId}>
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-bold">
                <Store size={14} className="text-brand" /> {shop.name}
              </p>
              <Badge tone={shop.status === "online" ? "brand" : "accent"}>{shop.status === "online" ? "15–30 min" : "Busy"}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {list.map((p) => (
                <div key={p.id}>
                  <ProductCard product={p} />
                  {/* cross-shop hint */}
                  {names.has(p.name) && byShop.length > 1 && (
                    <p className="mt-1 text-center text-[10px] text-muted-foreground">Also at other nearby shops</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {query.length >= 2 && results.length > 0 && (
        <p className="pb-4 text-center text-xs text-muted-foreground">Cart holds one shop per order — switching shops starts a fresh cart.</p>
      )}
    </div>
  );
}
