"use client";

import { use, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, CheckCircle2, ChevronLeft, Navigation, Phone, TriangleAlert } from "lucide-react";
import { useApp } from "@/store/useApp";
import { Badge, Button, EmptyState, Input } from "@/components/ui/base";
import { Dialog } from "@/components/ui/overlays";
import { cn, inr } from "@/lib/utils";

const ISSUES = ["Shop closed", "Item missing", "Customer unavailable", "Wrong address", "Vehicle issue"];

export default function DeliveryFlowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const order = useApp((s) => s.orders.find((o) => o.id === id));
  const shops = useApp((s) => s.shops);
  const riderPickup = useApp((s) => s.riderPickup);
  const riderOut = useApp((s) => s.riderOut);
  const riderDeliver = useApp((s) => s.riderDeliver);
  const pushToast = useApp((s) => s.pushToast);
  const addDispute = useApp((s) => s.addDispute);

  const [otp, setOtp] = useState("");
  const [photo, setPhoto] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [error, setError] = useState("");

  if (!order) {
    return <EmptyState emoji="🤷" title="Trip not found" action={<Link href="/rider"><Button>Back to jobs</Button></Link>} />;
  }

  const shop = shops.find((s) => s.id === order.shopId)!;
  const status = order.status;
  const stepsDone = ["RIDER_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];
  const stepIdx = stepsDone.indexOf(status);
  const payout = 20 + 5 + (new Date().getHours() >= 17 && new Date().getHours() <= 21 ? 7 : 0);

  /* OTP inputs show the real OTP as a hint chip (demo mode) */
  const hintOtp = status === "RIDER_ASSIGNED" ? order.otpPickup : status === "OUT_FOR_DELIVERY" ? order.otpDelivery : "";

  const submitOtp = () => {
    setError("");
    if (status === "RIDER_ASSIGNED") {
      const r = riderPickup(order.id, otp);
      if (!r.ok) return setError("Wrong pickup OTP — ask the shop again.");
      pushToast({ title: "Picked up ✅", body: `${order.items.length} items confirmed. Ride safe!`, kind: "success" });
      setOtp("");
    } else if (status === "PICKED_UP") {
      riderOut(order.id);
      pushToast({ title: "Out for delivery 🛵", body: "Navigate to the customer.", kind: "info" });
    } else if (status === "OUT_FOR_DELIVERY") {
      const r = riderDeliver(order.id, otp || order.otpDelivery);
      if (!r.ok) return setError("Wrong delivery OTP — confirm with the customer.");
      pushToast({ title: `Delivered! ${inr(payout)} added 💰`, kind: "success" });
    }
  };

  const deliverFlow = () => {
    if (status === "OUT_FOR_DELIVERY" && !photo && otp.length !== 4) {
      setError("Enter the 4-digit OTP or capture delivery photo.");
      return;
    }
    submitOtp();
  };

  const routeSteps = [
    { id: "assigned", label: "Trip accepted", done: true },
    { id: "reachShop", label: `Navigate to ${shop.name}`, done: stepIdx >= 0, active: stepIdx === 0 },
    { id: "pickup", label: "Enter pickup OTP", done: stepIdx >= 1, active: stepIdx === 0 },
    { id: "pickup2", label: "Confirm items packed", done: stepIdx >= 1 },
    { id: "drop", label: `Deliver to ${order.address.area}`, done: stepIdx >= 3, active: stepIdx === 2 },
    { id: "proof", label: "Delivery OTP / photo proof", done: stepIdx >= 3, active: stepIdx === 2 },
  ];

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-4 py-5">
      <Link href="/rider" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-brand"><ChevronLeft size={16} /> Today&apos;s jobs</Link>

      {/* earnings banner */}
      <div className="bg-foreground mt-3 rounded-2xl p-4 text-background">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white/80">Trip {order.code} · {order.items.length} items</p>
            <p className="font-display text-2xl font-extrabold">{inr(payout)} <span className="text-sm font-semibold text-white/80">+ tips</span></p>
          </div>
          <Badge tone="brand" className="bg-white/20 text-white">{order.payment === "COD" ? `Collect ${inr(order.total)}` : "Prepaid"}</Badge>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-white/25">
          <motion.div className="h-full rounded-full bg-white" animate={{ width: `${((stepIdx + 1) / 4) * 100}%` }} transition={{ type: "spring", stiffness: 70, damping: 18 }} />
        </div>
      </div>

      {/* mock map */}
      <div className="card-surface relative mt-3 h-40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_35%,rgba(16,185,129,0.15),transparent_50%),radial-gradient(circle_at_80%_75%,rgba(245,158,11,0.13),transparent_45%)]" />
        <svg className="absolute inset-0 h-full w-full opacity-20" preserveAspectRatio="none" viewBox="0 0 400 160">
          <path d="M0 50 H400 M0 110 H400 M100 0 V160 M250 0 V160" stroke="currentColor" strokeWidth="6" className="text-muted-foreground" />
        </svg>
        <span className="absolute left-[12%] top-8">📍</span>
        <span className="absolute bottom-8 right-[14%]">🏠</span>
        <AnimatePresence>
          {stepIdx >= 1 && (
            <motion.span initial={{ left: "16%", top: "34%", opacity: 0 }} animate={{ left: ["16%", "55%", "80%"], top: ["34%", "45%", "55%"], opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute text-2xl">
              🛵
            </motion.span>
          )}
        </AnimatePresence>
        <div className="absolute inset-x-3 bottom-2.5 flex items-center justify-between rounded-xl bg-card/90 px-3 py-2 backdrop-blur">
          <p className="text-xs font-bold">{stepIdx >= 1 ? `To: ${order.address.area}` : `To: ${shop.name}`}</p>
          <Button size="xs" variant="secondary" onClick={() => pushToast({ title: "Demo mode", body: "Turn-by-turn navigation opens Google Maps in production.", kind: "info" })}>
            <Navigation size={12} /> Navigate
          </Button>
        </div>
      </div>

      {/* steps */}
      <div className="card-surface mt-3 p-4">
        <ol className="space-y-3">
          {routeSteps.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3">
              <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", s.done ? "bg-brand text-white" : s.active ? "bg-foreground text-white ring-4 ring-foreground/15" : "bg-muted text-muted-foreground")}>
                {s.done ? "✓" : i + 1}
              </div>
              <p className={cn("text-sm", s.active ? "font-bold text-brand" : s.done ? "text-muted-foreground" : "font-semibold text-foreground")}>{s.label}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* pickup / delivery actions by state */}
      {status === "RIDER_ASSIGNED" && (
        <div className="card-surface mt-3 space-y-3 p-4">
          <div>
            <p className="text-sm font-bold">Enter pickup OTP</p>
            <p className="text-xs text-muted-foreground">Shop: {shop.name} · demo hint: <span className="num font-mono font-bold text-brand">{hintOtp}</span></p>
          </div>
          <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="4-digit OTP" className="num text-center text-xl font-bold tracking-[0.5em]" inputMode="numeric" aria-label="Pickup OTP" />
          {error && <p className="text-xs font-semibold text-danger">{error}</p>}
          <Button className="w-full" onClick={submitOtp}>Confirm pickup</Button>
        </div>
      )}

      {status === "PICKED_UP" && (
        <div className="card-surface mt-3 space-y-3 p-4 text-center">
          <CheckCircle2 className="mx-auto text-brand" size={32} />
          <p className="text-sm font-bold">Order picked up — {order.items.length} items</p>
          <p className="text-xs text-muted-foreground">Handle perishables on top. Head to {order.address.line1}, {order.address.area}.</p>
          <Button className="w-full" onClick={submitOtp}>Start delivery 🛵</Button>
        </div>
      )}

      {status === "OUT_FOR_DELIVERY" && (
        <div className="card-surface mt-3 space-y-3 p-4">
          <div className="rounded-xl bg-muted p-3 text-sm">
            <p className="font-bold">{order.customerName}</p>
            <p className="text-xs text-muted-foreground">{order.address.line1}, {order.address.area} — {order.address.pincode}</p>
            {order.address.instructions && <p className="mt-1 rounded-lg bg-accent-soft px-2 py-1 text-xs text-accent">📝 {order.address.instructions}</p>}
          </div>
          <div>
            <p className="text-sm font-bold">Delivery proof</p>
            <p className="text-xs text-muted-foreground">Customer OTP: ask them · demo hint: <span className="num font-mono font-bold text-brand">{hintOtp}</span></p>
          </div>
          <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="4-digit OTP" className="num text-center text-xl font-bold tracking-[0.5em]" inputMode="numeric" aria-label="Delivery OTP" />
          <button
            onClick={() => { setPhoto(true); pushToast({ title: "Photo captured 📸", body: "Delivery photo proof attached.", kind: "success" }); }}
            className={cn("flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-semibold transition", photo ? "border-brand bg-brand-softer text-brand" : "text-muted-foreground hover:border-brand hover:text-brand")}
          >
            <Camera size={16} /> {photo ? "Photo attached ✓" : "Or capture delivery photo"}
          </button>
          {error && <p className="text-xs font-semibold text-danger">{error}</p>}
          <Button className="w-full" onClick={deliverFlow}>Mark delivered 🎉</Button>
        </div>
      )}

      {status === "DELIVERED" && (
        <div className="card-surface mt-3 space-y-3 p-6 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 240, damping: 14 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft">
            <span className="text-4xl">🎉</span>
          </motion.div>
          <p className="font-display text-xl font-extrabold">{inr(payout)} added to today&apos;s earnings</p>
          <p className="text-xs text-muted-foreground">{order.code} delivered · proof on record · rating protected</p>
          <Link href="/rider"><Button className="w-full">Find next order →</Button></Link>
        </div>
      )}

      {/* call + report */}
      {status !== "DELIVERED" && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => pushToast({ title: "Demo only", body: `Masked call to ${order.customerName.split(" ")[0]} — real numbers stay private.`, kind: "info" })}>
            <Phone size={14} /> Call customer
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIssueOpen(true)}>
            <TriangleAlert size={14} /> Report issue
          </Button>
        </div>
      )}

      <Dialog open={issueOpen} onClose={() => setIssueOpen(false)} title="Report an issue">
        <div className="space-y-2">
          {ISSUES.map((i) => (
            <button
              key={i}
              onClick={() => {
                addDispute({ orderId: order.id, orderCode: order.code, by: "rider", type: "Rider misconduct", description: `Rider reported: ${i}`, amount: 0, evidence: { photo: false, otpVerified: false, gpsMatch: true } });
                setIssueOpen(false);
                pushToast({ title: "Issue reported", body: "Support will call you within 5 minutes.", kind: "success" });
              }}
              className="flex w-full items-center gap-2 rounded-xl border p-3 text-left text-sm font-semibold transition hover:border-brand hover:bg-brand-softer"
            >
              <TriangleAlert size={14} className="text-accent" /> {i}
            </button>
          ))}
        </div>
      </Dialog>
    </div>
  );
}
