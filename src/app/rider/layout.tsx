"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bike, Coins, Wallet } from "lucide-react";
import { NotificationsBell, Logo, AppReady, ThemeToggle, LocationGate } from "@/components/brand/shell";
import { Badge } from "@/components/ui/base";
import { useApp } from "@/store/useApp";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/rider", label: "Today", icon: Bike },
  { href: "/rider/earnings", label: "Earnings", icon: Wallet },
  { href: "/rider/profile", label: "Profile", icon: Coins },
];

export default function RiderLayout({ children }: LayoutProps<"/rider">) {
  const pathname = usePathname();
  const riders = useApp((s) => s.riders);
  const me = riders.find((r) => r.id === "r1")!;

  if (pathname.startsWith("/rider/onboarding") || pathname.startsWith("/rider/delivery")) {
    return <AppReady>{children}</AppReady>;
  }

  return (
    <AppReady>
      <LocationGate role="rider" />
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col border-x bg-background">
        {/* top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b bg-background/90 px-4 backdrop-blur-lg">
          <Logo withWordmark={false} size={28} />
          <div className="flex items-center gap-2">
            <Badge tone={me.online ? "brand" : "neutral"}>{me.online ? "🟢 Online" : "⚪ Offline"}</Badge>
            <NotificationsBell />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 pb-24 pt-4">{children}</main>

        {/* bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t bg-card/95 backdrop-blur-lg">
          <div className="flex items-stretch justify-around py-1.5">
            {NAV.map((n) => {
              const active = pathname === n.href;
              return (
                <Link key={n.href} href={n.href} className={cn("flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors", active ? "text-brand" : "text-muted-foreground hover:text-foreground")}>
                  <n.icon size={19} />
                  {n.label}
                  {active && <span className="absolute top-0 h-1 w-8 rounded-full bg-brand" style={{ position: "relative" }} />}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </AppReady>
  );
}
