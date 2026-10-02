"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Home, LayoutGrid, Package, Percent, ReceiptIndianRupee, Settings, ExternalLink } from "lucide-react";
import { NotificationsBell, Logo, AppReady, ThemeToggle, LocationGate } from "@/components/brand/shell";
import { Badge } from "@/components/ui/base";
import { SmartImage } from "@/components/ui/smart-image";
import { useApp } from "@/store/useApp";
import { shopImage } from "@/lib/images";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/shop", label: "Home", icon: Home },
  { href: "/shop/orders", label: "Orders", icon: ReceiptIndianRupee },
  { href: "/shop/products", label: "Products", icon: Package },
  { href: "/shop/offers", label: "Offers", icon: Percent },
  { href: "/shop/payouts", label: "Payouts", icon: LayoutGrid },
  { href: "/shop/settings", label: "Settings", icon: Settings },
];

export function StatusToggle() {
  const shops = useApp((s) => s.shops);
  const setShopStatus = useApp((s) => s.setShopStatus);
  const shop = shops.find((s) => s.id === "sharma")!;
  const options: { id: "online" | "busy" | "offline"; label: string }[] = [
    { id: "online", label: "Online" },
    { id: "busy", label: "Busy" },
    { id: "offline", label: "Offline" },
  ];
  return (
    <div className="flex rounded-xl bg-muted p-1" role="radiogroup" aria-label="Shop availability">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={shop.status === o.id}
          onClick={() => setShopStatus(shop.id, o.id)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
            shop.status === o.id
              ? o.id === "online"
                ? "bg-brand text-white shadow-sm"
                : o.id === "busy"
                  ? "bg-accent text-black shadow-sm"
                  : "bg-danger text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function ShopLayout({ children }: LayoutProps<"/shop">) {
  const pathname = usePathname();
  const shops = useApp((s) => s.shops);
  const orders = useApp((s) => s.orders);
  const setRole = useApp((s) => s.setRole);
  const setRole2 = setRole;
  const shop = shops.find((s) => s.id === "sharma")!;
  const newOrders = orders.filter((o) => o.shopId === "sharma" && o.status === "PLACED").length;

  /* auto-accept guard: expiring orders auto-accept to protect shop rating */
  const shopAccept = useApp((s) => s.shopAccept);
  const pushToast = useApp((s) => s.pushToast);
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      for (const o of useApp.getState().orders) {
        if (o.shopId === "sharma" && o.status === "PLACED" && now - o.placedAt > 120000) {
          shopAccept(o.id);
          pushToast({ title: "Auto-accepted", body: `${o.code} hit the 2-min timer — accepted to protect your rating.`, kind: "info" });
        }
      }
    }, 3000);
    return () => clearInterval(id);
  }, [shopAccept, pushToast]);

  if (pathname.startsWith("/shop/onboarding")) return <AppReady>{children}</AppReady>;

  return (
    <AppReady>
      <LocationGate role="shop" />
      <div className="flex min-h-screen">
        {/* sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-card lg:flex">
          <div className="flex h-16 items-center border-b px-5">
            <Link href="/" onClick={() => setRole2("shop")}><Logo size={30} /></Link>
          </div>
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 overflow-hidden rounded-xl">
                <SmartImage src={shopImage(shop)} alt={shop.name} seed={shop.id} className="h-full w-full" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{shop.name}</p>
                <p className="text-[11px] text-muted-foreground">ID: NK-SH-0042</p>
              </div>
            </div>
            <div className="mt-3"><StatusToggle /></div>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {NAV.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setRole2("shop")}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                    active ? "bg-brand-soft text-brand" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <n.icon size={17} />
                  {n.label}
                  {n.label === "Orders" && newOrders > 0 && (
                    <span className="num ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">{newOrders}</span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <div className="rounded-xl bg-brand-softer p-3">
              <p className="text-xs font-bold text-brand">🏆 Rank #1 in Satellite</p>
              <p className="mt-1 text-[11px] text-muted-foreground">97% acceptance rate keeps you on top.</p>
            </div>
          </div>
        </aside>

        {/* main */}
        <div className="flex min-h-screen flex-1 flex-col lg:pl-60">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur-lg sm:px-6">
            <div className="flex items-center gap-3">
              <span className="lg:hidden"><Logo withWordmark={false} size={28} /></span>
              <div className="hidden sm:block">
                <p className="text-sm font-bold">Shop Dashboard</p>
                <p className="text-[11px] text-muted-foreground">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
              </div>
              <div className="lg:hidden"><StatusToggle /></div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/customer/shop/sharma" className="hidden items-center gap-1.5 rounded-xl border bg-card px-3 py-2 text-xs font-bold transition-colors hover:bg-muted sm:flex">
                <ExternalLink size={13} /> View storefront
              </Link>
              <Badge tone={shop.verified ? "brand" : "neutral"} className="hidden md:inline-flex">
                {shop.verified ? "✓ Verified" : "Pending"}
              </Badge>
              <NotificationsBell />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-4 pb-24 sm:p-6 lg:pb-6">{children}</main>

          {/* mobile bottom nav */}
          <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t bg-card/95 py-1.5 backdrop-blur-lg lg:hidden">
            {NAV.map((n) => {
              const active = pathname === n.href;
              return (
                <Link key={n.href} href={n.href} className={cn("flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-semibold", active ? "text-brand" : "text-muted-foreground")}>
                  <n.icon size={18} />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </AppReady>
  );
}
