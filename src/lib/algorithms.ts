import type { Order, Product, Rider, Shop } from "@/types";
import { haversineKm, clamp } from "./utils";

/* ------------------------------------------------------------------ */
/*  Shop ranking — relevance engine for customer discovery            */
/*  score = rating 30% + proximity 25% + speed 20% + reliability 15% + demand 10% */
/* ------------------------------------------------------------------ */
export function shopScore(shop: Shop, userLoc: { lat: number; lng: number }) {
  const dist = haversineKm(userLoc, shop.location);
  const ratingScore = (shop.rating / 5) * 30;
  const proxScore = clamp(1 - dist / 4, 0, 1) * 25;
  const speedScore = clamp(1 - shop.prepTimeMin / 20, 0, 1) * 20;
  const relScore = (shop.acceptanceRate / 100) * 15;
  const demandScore = clamp(shop.ordersToday / 50, 0, 1) * 10;
  let score = ratingScore + proxScore + speedScore + relScore + demandScore;
  if (shop.sponsored) score *= 1.15;
  if (shop.status === "busy") score *= 0.7;
  if (shop.status === "offline") score *= 0.05;
  return { score, distKm: dist };
}

export function rankShops(shops: Shop[], userLoc: { lat: number; lng: number }) {
  return shops
    .map((s) => ({ shop: s, ...shopScore(s, userLoc) }))
    .sort((a, b) => b.score - a.score);
}

/* ------------------------------------------------------------------ */
/*  Rider matching — nearest fit with quality weighting               */
/* ------------------------------------------------------------------ */
export function matchRiders(riders: Rider[], shopLoc: { lat: number; lng: number }) {
  return riders
    .filter((r) => r.online)
    .map((r) => {
      const dist = haversineKm(r.baseLocation, shopLoc);
      const score = r.rating * 12 + r.acceptanceRate * 0.1 - dist * 3;
      return { rider: r, distKm: dist, score };
    })
    .sort((a, b) => b.score - a.score);
}

/* ------------------------------------------------------------------ */
/*  Dynamic ETA — prep + travel + supply buffer, honest 15–30 min      */
/* ------------------------------------------------------------------ */
export function computeEta(shop: Shop, customerLoc: { lat: number; lng: number }, onlineRiders: number) {
  const dist = haversineKm(shop.location, customerLoc);
  const travel = dist * 3.2; // ~19 km/h city speed incl. gates & lifts
  const supplyBuffer = onlineRiders >= 3 ? 3 : onlineRiders >= 1 ? 6 : 11;
  const eta = Math.round(shop.prepTimeMin + travel + supplyBuffer + 2);
  return clamp(eta, 12, 38);
}

export function riderPayFor(distanceKm: number, peakHour: boolean) {
  const base = 20;
  const distancePay = Math.round(distanceKm * 2.5);
  const peak = peakHour ? 7 : 0;
  return { base, distancePay, peak, total: base + distancePay + peak };
}

/* ------------------------------------------------------------------ */
/*  Fraud risk — COD guardrails                                       */
/* ------------------------------------------------------------------ */
export function fraudRisk(opts: { payment: Order["payment"]; total: number; isNewCustomer: boolean; areaMatch: boolean; recentCancels: number }) {
  let score = 0;
  const flags: string[] = [];
  if (opts.payment === "COD") {
    score += 20;
    if (opts.total > 800) { score += 25; flags.push("High-value COD"); }
    if (opts.total > 1500) { score += 30; flags.push("Very high-value COD"); }
  }
  if (opts.isNewCustomer) { score += 10; flags.push("New customer"); }
  if (!opts.areaMatch) { score += 20; flags.push("Address outside shop radius"); }
  if (opts.recentCancels >= 2) { score += 20; flags.push(`${opts.recentCancels} recent cancellations`); }
  return { score, level: score >= 50 ? "review" : score >= 25 ? "watch" : "normal", flags };
}

/* ------------------------------------------------------------------ */
/*  Basket builder — nudge cart over the ₹100 minimum                 */
/* ------------------------------------------------------------------ */
export function basketSuggestions(products: Product[], shopId: string, gap: number, exclude: string[]) {
  return products
    .filter((p) => p.shopId === shopId && p.status === "active" && p.stock > 0 && !exclude.includes(p.id) && p.price <= gap + 60)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6);
}

/* ------------------------------------------------------------------ */
/*  Demand forecast — next-hour order estimate for ops                */
/* ------------------------------------------------------------------ */
const HOUR_CURVE = [2, 1, 1, 1, 2, 4, 8, 14, 18, 14, 12, 16, 22, 20, 16, 18, 24, 32, 38, 34, 26, 16, 8, 4];

export function demandForecast(ordersToday: number, hour = new Date().getHours()) {
  const weight = HOUR_CURVE[hour % 24] + HOUR_CURVE[(hour + 1) % 24];
  const dayTotal = HOUR_CURVE.reduce((a, b) => a + b, 0);
  const expected = Math.max(1, Math.round((ordersToday * weight) / dayTotal));
  const peak = HOUR_CURVE.indexOf(Math.max(...HOUR_CURVE));
  return { expectedNextHour: expected, peakHour: peak, surge: weight >= 60 };
}

/* ------------------------------------------------------------------ */
/*  Loyalty — NearCoins                                               */
/* ------------------------------------------------------------------ */
export function coinsFor(orderTotal: number) {
  return Math.max(1, Math.floor(orderTotal / 50));
}

export function deliveryFeeFor(itemTotal: number) {
  return itemTotal >= 299 ? 0 : 25;
}
