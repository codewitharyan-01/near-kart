"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, ReceiptText, Search, ShoppingBag, TicketPercent, User, CircleHelp, Store } from "lucide-react";
import { NotificationsBell, Logo, AppReady, LocationGate, ChangeLocationButton } from "@/components/brand/shell";
import { cartCount, useApp } from "@/store/useApp";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/customer", label: "Home", icon: Home },
  { href: "/customer/search", label: "Search", icon: Search },
  { href: "/customer/offers", label: "Offers", icon: TicketPercent },
  { href: "/customer/orders", label: "Orders", icon: ReceiptText },
  { href: "/customer/profile", label: "Profile", icon: User },
];

export default function CustomerLayout({ children }: LayoutProps<"/customer">) {
  const pathname = usePathname();
  const router = useRouter();
  const setRole = useApp((s) => s.setRole);
  const items = useApp((s) => s.cart.items);
  const count = cartCount(items);
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AppReady>
      <LocationGate role="customer" />
      <div className="flex min-h-screen flex-col">
        {/* full-width site header */}
        <header className={cn("sticky top-0 z-50 border-b bg-background/95 backdrop-blur-lg transition-shadow", scrolled && "shadow-soft")}>
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
            <Link href="/customer" className="shrink-0"><Logo /></Link>
            <div className="hidden lg:block"><ChangeLocationButton /></div>

            {/* inline search */}
            <form
              className="relative hidden max-w-md flex-1 md:block lg:mx-4"
              onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/customer/search?q=${encodeURIComponent(q.trim())}`); }}
            >
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder='Search "milk" or "bread"…'
                aria-label="Search products"
                className="h-10 w-full rounded-full border bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground/70 focus:outline-2 focus:outline-ring"
              />
            </form>

            <div className="ml-auto flex items-center gap-2">
              <Link href="/customer/offers" className="hidden items-center gap-1.5 rounded-full border bg-card px-3 py-2 text-xs font-bold transition hover:border-foreground/40 sm:flex">
                <TicketPercent size={13} className="text-accent" /> Offers
              </Link>
              <Link href="/sell" className="hidden items-center gap-1.5 rounded-full border bg-card px-3 py-2 text-xs font-bold transition hover:border-foreground/40 xl:flex">
                <Store size={13} className="text-brand" /> Add your shop
              </Link>
              <NotificationsBell />
              <Link href="/customer/cart" aria-label={`Cart with ${count} items`} className="relative flex items-center gap-2 rounded-full btn-ink px-3.5 py-2 text-xs font-bold text-background transition hover:opacity-90">
                <ShoppingBag size={14} />
                <span className="num hidden sm:inline">{count > 0 ? `${count} item${count > 1 ? "s" : ""}` : "Cart"}</span>
                {count > 0 && (
                  <span className="num absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white sm:hidden">
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* mobile search row */}
          <div className="border-t px-4 py-2 md:hidden">
            <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/customer/search?q=${encodeURIComponent(q.trim())}`); }} className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder='Search "milk" or "bread"…'
                aria-label="Search products"
                className="h-9 w-full rounded-full border bg-card pl-9 pr-4 text-sm focus:outline-2 focus:outline-ring"
              />
            </form>
          </div>
        </header>

        <main className="flex-1 pb-28 md:pb-10">{children}</main>

        {/* desktop footer */}
        <footer className="hidden border-t bg-card md:block">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <Logo size={26} />
              <span>Pilot: Satellite, Ahmedabad</span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 font-medium">
              <Link href="/customer/help" className="flex items-center gap-1 hover:text-brand"><CircleHelp size={12} /> Help centre</Link>
              <Link href="/customer/offers" className="hover:text-brand">Offers</Link>
              <Link href="/sell" className="hover:text-brand">For shops</Link>
              <Link href="/rider" className="hover:text-brand">Ride with us</Link>
              <span>© 2026 NearKart</span>
            </div>
          </div>
        </footer>

        {/* mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 backdrop-blur-lg md:hidden">
          <div className="flex items-stretch justify-around px-2 py-1.5">
            {NAV.map((n) => {
              const active = pathname === n.href || (n.href !== "/customer" && pathname.startsWith(n.href));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setRole("customer")}
                  className={cn(
                    "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors",
                    active ? "text-foreground" : "text-muted-foreground",
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
