"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ReceiptText, Search, ShoppingBag, User } from "lucide-react";
import { NotificationsBell, Logo, AppReady, ThemeToggle } from "@/components/brand/shell";
import { Select } from "@/components/ui/base";
import { AREAS } from "@/data/areas";
import { cartCount, useApp } from "@/store/useApp";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/customer", label: "Home", icon: Home },
  { href: "/customer/search", label: "Search", icon: Search },
  { href: "/customer/cart", label: "Cart", icon: ShoppingBag },
  { href: "/customer/orders", label: "Orders", icon: ReceiptText },
  { href: "/customer/profile", label: "Profile", icon: User },
];

export default function CustomerLayout({ children }: LayoutProps<"/customer">) {
  const pathname = usePathname();
  const router = useRouter();
  const areaId = useApp((s) => s.areaId);
  const setArea = useApp((s) => s.setArea);
  const setRole = useApp((s) => s.setRole);
  const items = useApp((s) => s.cart.items);
  const count = cartCount(items);

  return (
    <AppReady>
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
        {/* top bar */}
        <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-lg">
          <div className="flex items-center gap-2 px-4 py-2.5">
            <Link href="/customer" className="shrink-0"><Logo withWordmark={false} size={30} /></Link>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Delivering to</p>
              <Select value={areaId} onChange={(e) => { setArea(e.target.value); router.push("/customer"); }} className="h-8 border-0 bg-transparent px-0 text-sm font-bold focus:outline-none" aria-label="Delivery area">
                {AREAS.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}, {a.city}</option>
                ))}
              </Select>
            </div>
            <span className="hidden rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-brand sm:inline">15–30 min ⚡</span>
            <NotificationsBell />
            <ThemeToggle />
            <Link href="/customer/cart" aria-label={`Cart with ${count} items`} className="relative flex h-9 w-9 items-center justify-center rounded-xl border bg-card transition-colors hover:bg-muted">
              <ShoppingBag size={16} />
              {count > 0 && (
                <span className="num absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-4 sm:px-6">{children}</main>

        {/* bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 backdrop-blur-lg">
          <div className="mx-auto flex max-w-3xl items-stretch justify-around px-2 py-1.5">
            {NAV.map((n) => {
              const active = pathname === n.href || (n.href !== "/customer" && pathname.startsWith(n.href));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setRole("customer")}
                  className={cn(
                    "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors",
                    active ? "text-brand" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <n.icon size={19} strokeWidth={active ? 2.4 : 2} />
                  {n.label}
                  {n.label === "Cart" && count > 0 && (
                    <span className="num absolute right-1/4 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">{count}</span>
                  )}
                  {active && <span className="absolute -top-1.5 h-1 w-8 rounded-full bg-brand" />}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </AppReady>
  );
}
