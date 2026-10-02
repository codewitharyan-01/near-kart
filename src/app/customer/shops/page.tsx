"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { useApp, selectUserLoc } from "@/store/useApp";
import { rankShops } from "@/lib/algorithms";
import { Chip, Select, SectionTitle, EmptyState } from "@/components/ui/base";
import { ShopCard } from "@/components/customer/shared";

const FILTERS = [
  { id: "open", label: "Open now" },
  { id: "fast", label: "Fast delivery" },
  { id: "rating", label: "Rating 4+" },
  { id: "lowmin", label: "Low min. order" },
];

export default function ShopsPage() {
  const shops = useApp((s) => s.shops);
  const userLoc = useApp(selectUserLoc);
  const [filter, setFilter] = useState<string[]>(["open"]);
  const [sort, setSort] = useState("ranked");

  const toggle = (id: string) => setFilter((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const results = useMemo(() => {
    let ranked = rankShops(shops, userLoc);
    if (filter.includes("open")) ranked = ranked.filter((r) => r.shop.status === "online");
    if (filter.includes("fast")) ranked = ranked.filter((r) => r.shop.prepTimeMin <= 10);
    if (filter.includes("rating")) ranked = ranked.filter((r) => r.shop.rating >= 4);
    if (filter.includes("lowmin")) ranked = ranked.filter((r) => r.shop.minOrder <= 100);
    if (sort === "nearest") ranked = [...ranked].sort((a, b) => a.distKm - b.distKm);
    if (sort === "rating") ranked = [...ranked].sort((a, b) => b.shop.rating - a.shop.rating);
    if (sort === "minorder") ranked = [...ranked].sort((a, b) => a.shop.minOrder - b.shop.minOrder);
    if (sort === "fastest") ranked = [...ranked].sort((a, b) => a.shop.prepTimeMin - b.shop.prepTimeMin);
    return ranked;
  }, [shops, userLoc, filter, sort]);

  return (
    <div className="space-y-4">
      <SectionTitle title="All nearby shops" sub={`${results.length} verified stores deliver to you`} />
      <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Chip key={f.id} active={filter.includes(f.id)} onClick={() => toggle(f.id)}>{f.label}</Chip>
        ))}
        <div className="ml-auto w-40 shrink-0">
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 rounded-full text-xs" aria-label="Sort shops">
            <option value="ranked">Smart ranked</option>
            <option value="nearest">Nearest first</option>
            <option value="fastest">Fastest delivery</option>
            <option value="rating">Highest rating</option>
            <option value="minorder">Lowest min. order</option>
          </Select>
        </div>
      </div>
      <p className="flex items-center gap-1.5 rounded-xl bg-brand-softer px-3.5 py-2.5 text-xs font-medium text-brand">
        <Sparkles size={13} /> Smart ranking blends distance, rating, prep speed and shop reliability — the first result is usually at your door fastest.
      </p>
      {results.length === 0 ? (
        <EmptyState emoji="🔍" title="No shops match those filters" body="Try removing a filter or check back during shop hours." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((r) => (
            <ShopCard key={r.shop.id} shop={r.shop} distKm={r.distKm} wide />
          ))}
        </div>
      )}
    </div>
  );
}
