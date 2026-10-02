import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { DemoBanner, RoleSwitcher, SimEngine, SyncBridge } from "@/components/brand/shell";
import { Toaster } from "@/components/ui/toaster";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NearKart — Your local shops, delivered fast",
  description:
    "NearKart is a hyperlocal quick-commerce marketplace connecting verified neighbourhood shops, customers and delivery partners for 15–30 minute delivery. Asset-light, community-powered commerce.",
  keywords: ["hyperlocal", "quick commerce", "kirana", "delivery", "marketplace", "NearKart"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <DemoBanner />
          <SimEngine />
          <SyncBridge />
          {children}
          <RoleSwitcher />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
