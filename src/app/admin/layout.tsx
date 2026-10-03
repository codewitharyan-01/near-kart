"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Gavel, LayoutDashboard, Package, ShieldCheck, Users } from "lucide-react";
import { NotificationsBell, Logo, AppReady, LocationGate } from "@/components/brand/shell";
import { Badge } from "@/components/ui/base";
import { useApp } from "@/store/useApp";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/shops", label: "Shops", icon: ShieldCheck },
  { href: "/admin/riders", label: "Riders", icon: Users },
  { href: "/admin/disputes", label: "Disputes", icon: Gavel },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const pathname = usePathname();
  const disputes = useApp((s) => s.disputes);
  const openDisputes = disputes.filter((d) => d.status === "Open").length;

  return (
    <AppReady>
      <LocationGate role="admin" />
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r bg-card lg:flex">
          <div className="flex h-16 items-center border-b px-5"><Logo size={28} /></div>
          <div className="px-4 pt-4">
            <Badge tone="danger" className="mb-3">🛡️ Operations console</Badge>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {NAV.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                    active ? "bg-brand-soft text-brand" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <n.icon size={16} />
                  {n.label}
                  {n.label === "Disputes" && openDisputes > 0 && (
                    <span className="num ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">{openDisputes}</span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <p className="text-[11px] text-muted-foreground">Signed in as</p>
            <p className="text-sm font-bold">Ops Admin · NK-HQ</p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:pl-56">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur-lg sm:px-6">
            <div className="flex items-center gap-3">
              <span className="lg:hidden"><Logo withWordmark={false} size={28} /></span>
              <Badge tone="danger" className="lg:hidden">🛡️ Admin</Badge>
              <div className="hidden lg:block">
                <p className="text-sm font-bold">Platform overview</p>
                <p className="text-[11px] text-muted-foreground">Satellite cluster · Ahmedabad West</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-brand">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" /> Live
              </span>
              <NotificationsBell />
            </div>
          </header>
          <main className="flex-1 p-4 pb-24 sm:p-6 lg:pb-6">{children}</main>

          <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t bg-card/95 py-1.5 backdrop-blur-lg lg:hidden">
            {NAV.map((n) => {
              const active = pathname === n.href;
              return (
                <Link key={n.href} href={n.href} className={cn("flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[9px] font-semibold", active ? "text-brand" : "text-muted-foreground")}>
                  <n.icon size={17} />
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
