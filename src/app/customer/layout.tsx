"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ReceiptText, Search, ShoppingBag, User } from "lucide-react";
import { NotificationsBell, AppReady, ThemeToggle, LocationGate, ChangeLocationButton } from "@/components/brand/shell";
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
  const setRole = useApp((s) => s.setRole);
  const items = useApp((s) => s.cart.items);
  const count = cartCount(items);

  return (
    <AppReady>
      <LocationGate role="customer" />
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
        {/* top bar */}
        <header className="sticky top-0 z-50 border-b bg-background/92 backdrop-blur-lg">
          <div className="flex items-center gap-2 px-4 py-2.5">
            <Link href="/customer" className="shrink-0"><LogoMini /></Link>
            <div className="min-w-0 flex-1"><ChangeLocationButton compact /></div>
            <NotificationsBell />
            <ThemeToggle />
            <Link href="/customer/cart" aria-label={`Cart with ${count} items`} className="relative flex h-9 w-9 items-center justify-center rounded-full border bg-card transition-colors hover:bg-muted">
              <ShoppingBag size={15} />
              {count > 0 && (
                <span className="num absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background">
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
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <n.icon size={18} strokeWidth={active ? 2.4 : 2} />
                  {n.label}
                  {n.label === "Cart" && count > 0 && (
                    <span className="num absolute right-1/4 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-bold text-background">{count}</span>
                  )}
                  {active && <span className="absolute -top-1.5 h-0.5 w-7 rounded-full bg-foreground" />}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </AppReady>
  );
}

function LogoMini() {
  return (
    <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden>
      <rect width="40" height="40" rx="10" fill="#171812" />
      <path d="M20 8.5c-4.3 0-7.8 3.4-7.8 7.6 0 5.5 6.8 12.1 7.4 12.7.2.3.6.3.8 0 .6-.6 7.4-7.2 7.4-12.7 0-4.2-3.5-7.6-7.8-7.6Z" fill="#fff" />
      <path d="M21.6 13 16.2 19.4h3.2l-1 5.6 5.8-7.2h-3.4l.8-4.8Z" fill="#171812" />
    </svg>
  );
}
