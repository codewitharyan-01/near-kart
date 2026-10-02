import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { GeoPoint } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function inr(n: number, opts?: { compact?: boolean }) {
  if (opts?.compact && n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (opts?.compact && n >= 1000) return `₹${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function clockTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function dateShort(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function uid(prefix = "") {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function haversineKm(a: GeoPoint, b: GeoPoint) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function orderCode() {
  return `NK-${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
}

export function otp4() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function pct(n: number) {
  return `${Math.round(n)}%`;
}
