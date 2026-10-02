"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, Package, PackagePlus, Pencil, Upload } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Badge, Button, EmptyState, Field, Input, Select, StatCard } from "@/components/ui/base";
import { Dialog, TRow, TH, TD } from "@/components/ui/overlays";
import { cn, inr, timeAgo } from "@/lib/utils";
import type { Product } from "@/types";

const CATEGORIES = ["Grocery", "Dairy & Bakery", "Fruits & Vegetables", "Snacks", "Beverages", "Personal Care", "Household", "Stationery", "Electronics"];

export default function ShopProductsPage() {
  const products = useApp((s) => s.products);
  const updateStock = useApp((s) => s.updateStock);
  const setProductStatus = useApp((s) => s.setProductStatus);
  const pushToast = useApp((s) => s.pushToast);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const mine = useMemo(() => products.filter((p) => p.shopId === "sharma"), [products]);
  const filtered = useMemo(() => {
    let list = mine;
    if (tab === "active") list = list.filter((p) => p.status === "active" && p.stock > 0);
    if (tab === "low") list = list.filter((p) => p.stock <= p.lowStockThreshold && p.stock > 0);
    if (tab === "out") list = list.filter((p) => p.stock === 0);
    if (tab === "hidden") list = list.filter((p) => p.status === "hidden");
    if (query) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [mine, tab, query]);

  const stats = {
    live: mine.filter((p) => p.status === "active" && p.stock > 0).length,
    low: mine.filter((p) => p.stock <= p.lowStockThreshold && p.stock > 0).length,
    out: mine.filter((p) => p.stock === 0).length,
    hidden: mine.filter((p) => p.status === "hidden").length,
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Products & inventory</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => pushToast({ title: "CSV demo", body: "Bulk upload parses in production — UI only here.", kind: "info" })}><Upload size={14} /> Import CSV</Button>
          <Button size="sm" onClick={() => setEditing({ gstRate: 5, lowStockThreshold: 6, status: "active" })}><PackagePlus size={14} /> Add product</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Live products" value={stats.live} icon={<Package size={16} />} />
        <StatCard label="Low stock" value={stats.low} tone="accent" sub="below threshold" />
        <StatCard label="Out of stock" value={stats.out} tone="danger" sub="hidden from app" />
        <StatCard label="Hidden" value={stats.hidden} tone="info" sub="paused by you" />
      </div>

      {/* filters + bulk */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          ["all", `All (${mine.length})`],
          ["active", `Active (${stats.live})`],
          ["low", `Low (${stats.low})`],
          ["out", `Out (${stats.out})`],
          ["hidden", `Hidden (${stats.hidden})`],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn("rounded-full px-3.5 py-1.5 text-xs font-bold transition", tab === id ? "brand-gradient text-white" : "bg-muted text-muted-foreground hover:text-foreground")}
          >
            {label}
          </button>
        ))}
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="ml-auto h-9 w-48 text-xs" />
        {selected.size > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-brand-soft px-3 py-1.5">
            <span className="num text-xs font-bold text-brand">{selected.size} selected</span>
            <Button size="xs" variant="outline" onClick={() => { selected.forEach((id) => setProductStatus(id, "hidden")); pushToast({ title: `${selected.size} products hidden`, kind: "success" }); setSelected(new Set()); }}>Hide</Button>
            <Button size="xs" variant="outline" onClick={() => { selected.forEach((id) => setProductStatus(id, "active")); setSelected(new Set()); }}>Unhide</Button>
          </div>
        )}
      </div>

      {/* table */}
      {filtered.length === 0 ? (
        <EmptyState emoji="📦" title="No products match" body="Adjust filters or add your first product." />
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b bg-muted/50">
              <tr>
                <TH className="w-8"><input type="checkbox" aria-label="Select all" checked={selected.size === filtered.length && filtered.length > 0} onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map((p) => p.id)) : new Set())} className="h-4 w-4 rounded accent-emerald-600" /></TH>
                <TH>Product</TH><TH>Category</TH><TH>Price</TH><TH>Stock</TH><TH>Status</TH><TH>Updated</TH><TH className="text-right">Actions</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const out = p.stock === 0;
                const low = !out && p.stock <= p.lowStockThreshold;
                return (
                  <TRow key={p.id}>
                    <TD><input type="checkbox" aria-label={`Select ${p.name}`} checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="h-4 w-4 rounded accent-emerald-600" /></TD>
                    <TD>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-lg">{p.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.brand} · {p.packSize}</p>
                        </div>
                      </div>
                    </TD>
                    <TD className="text-xs text-muted-foreground">{p.category}</TD>
                    <TD>
                      <span className="num text-sm font-bold">{inr(p.price)}</span>
                      {p.mrp > p.price && <span className="num ml-1 text-[11px] text-muted-foreground line-through">{p.mrp}</span>}
                    </TD>
                    <TD>
                      <input
                        type="number"
                        min={0}
                        value={p.stock}
                        onChange={(e) => updateStock(p.id, Number(e.target.value))}
                        aria-label={`Stock for ${p.name}`}
                        className={cn("num w-16 rounded-lg border bg-card px-2 py-1 text-sm font-bold focus:outline-2 focus:outline-ring", out ? "border-danger text-danger" : low ? "border-accent text-accent" : "")}
                      />
                    </TD>
                    <TD>
                      {out ? <Badge tone="danger">Out of stock</Badge> : low ? <Badge tone="accent">Low · {p.stock} left</Badge> : p.status === "hidden" ? <Badge tone="neutral">Hidden</Badge> : <Badge tone="brand">Active</Badge>}
                    </TD>
                    <TD className="text-[11px] text-muted-foreground">{timeAgo(p.lastUpdatedAt)} · {p.updateSource}</TD>
                    <TD>
                      <div className="flex justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)}><Pencil size={14} /></Button>
                        <Button size="icon-sm" variant="ghost" aria-label={p.status === "hidden" ? `Unhide ${p.name}` : `Hide ${p.name}`} onClick={() => setProductStatus(p.id, p.status === "hidden" ? "active" : "hidden")}>
                          {p.status === "hidden" ? <Eye size={14} /> : <EyeOff size={14} />}
                        </Button>
                      </div>
                    </TD>
                  </TRow>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="rounded-xl bg-brand-softer px-4 py-3 text-xs text-brand">
        ⚡ Auto-inventory: accepted orders deduct stock instantly. Zero stock auto-hides the product from customers. Items unavailable in 3 consecutive orders get paused with a restock alert.
      </p>

      {/* add/edit dialog */}
      <Dialog open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit product" : "Add product"} wide>
        {editing && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Product name" className="sm:col-span-2"><Input defaultValue={editing.name} placeholder="e.g. Amul Taaza Milk 500ml" /></Field>
            <Field label="Brand"><Input defaultValue={editing.brand} placeholder="Amul" /></Field>
            <Field label="Category">
              <Select defaultValue={editing.category}><option>{editing.category ?? CATEGORIES[0]}</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
            </Field>
            <Field label="Pack size"><Input defaultValue={editing.packSize} placeholder="500 ml" /></Field>
            <Field label="Emoji / image"><Input defaultValue={editing.emoji} placeholder="🥛" /></Field>
            <Field label="MRP (₹)"><Input type="number" defaultValue={editing.mrp} placeholder="28" /></Field>
            <Field label="Selling price (₹)"><Input type="number" defaultValue={editing.price} placeholder="27" /></Field>
            <Field label="GST rate (%)"><Input type="number" defaultValue={editing.gstRate} placeholder="5" /></Field>
            <Field label="Stock quantity"><Input type="number" defaultValue={editing.stock} placeholder="50" /></Field>
            <Field label="Low-stock alert at"><Input type="number" defaultValue={editing.lowStockThreshold} placeholder="6" /></Field>
            <Field label="Expiry date (perishables)" hint="Auto-hides near expiry"><Input type="date" /></Field>
            <div className="sm:col-span-2 flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
              <Button
                className="flex-1"
                onClick={() => {
                  pushToast({ title: editing.id ? "Product updated ✅" : "Product added ✅", body: "Catalog syncs to the customer app instantly.", kind: "success" });
                  setEditing(null);
                }}
              >
                {editing.id ? "Save changes" : "Add to catalog"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      <Button variant="ghost" size="sm" className="w-full" onClick={() => pushToast({ title: "Barcode scanner", body: "Camera scanning ships with the Android app.", kind: "info" })}>
        📷 Scan barcode to add (coming on mobile)
      </Button>
    </div>
  );
}
