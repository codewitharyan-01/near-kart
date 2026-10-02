import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { DemoBanner, RoleSwitcher, SimEngine, SyncBridge } from "@/components/brand/shell";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NearKart — Your local shops, delivered fast",
  description:
    "NearKart is a hyperlocal quick-commerce marketplace connecting verified neighbourhood shops, customers and delivery partners for 15–30 minute delivery. Asset-light, community-powered commerce.",
  keywords: ["hyperlocal", "quick commerce", "kirana", "delivery", "marketplace", "NearKart"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable} h-full antialiased`}>
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
