import type { Offer, Transaction, Dispute, RiderPayout } from "@/types";

const MIN = 60_000;
const DAY = 24 * 60 * MIN;
const now = Date.now();

export const OFFERS: Offer[] = [
  {
    id: "of1",
    code: "NEAR25",
    title: "₹25 off above ₹199",
    type: "flat",
    value: 25,
    minOrder: 199,
    description: "Flat ₹25 off on orders above ₹199",
    active: true,
    views: 1840,
    usedCount: 214,
    revenue: 92800,
  },
  {
    id: "of2",
    code: "WELCOME50",
    title: "₹50 off first order",
    type: "flat",
    value: 50,
    minOrder: 249,
    description: "₹50 off on your first NearKart order above ₹249",
    active: true,
    firstOrderOnly: true,
    views: 960,
    usedCount: 87,
    revenue: 38400,
  },
  {
    id: "of3",
    code: "FREESHIP",
    title: "Free delivery above ₹199",
    type: "percent",
    value: 100,
    minOrder: 199,
    maxDiscount: 25,
    description: "Free delivery (up to ₹25) on orders above ₹199",
    active: true,
    views: 1310,
    usedCount: 156,
    revenue: 61200,
  },
];

export const SEED_TRANSACTIONS: Transaction[] = [
  { id: "t1", date: now - 2 * DAY, orderId: "o1", orderCode: "NK-8841", gross: 107, commission: 7.5, tcs: 1, net: 98.5, status: "Settled" },
  { id: "t2", date: now - 2 * DAY, orderId: "o2", orderCode: "NK-8842", gross: 151, commission: 10.6, tcs: 1.4, net: 139, status: "Settled" },
  { id: "t3", date: now - 3 * DAY, orderId: "o3", orderCode: "NK-8843", gross: 120, commission: 8.4, tcs: 1.1, net: 110.5, status: "Settled" },
  { id: "t4", date: now - 4 * DAY, orderId: "o4", orderCode: "NK-8844", gross: 0, commission: 0, tcs: 0, net: 0, status: "Settled" },
  { id: "t5", date: now - 5 * DAY, orderId: "o5", orderCode: "NK-8850", gross: 240, commission: 16.8, tcs: 2.3, net: 220.9, status: "Settled" },
  { id: "t6", date: now - 7 * 3600_000, orderId: "o6", orderCode: "NK-8846", gross: 593, commission: 41.5, tcs: 5.7, net: 545.8, status: "Pending" },
  { id: "t7", date: now - 2 * DAY - 3600_000, orderId: "o7", orderCode: "NK-8847", gross: 199, commission: 13.9, tcs: 1.9, net: 183.2, status: "Pending" },
  { id: "t8", date: now - 3 * DAY - 3600_000, orderId: "o8", orderCode: "NK-8848", gross: 190, commission: 13.3, tcs: 1.8, net: 174.9, status: "Pending" },
];

export const SEED_DISPUTES: Dispute[] = [
  {
    id: "d1",
    orderId: "o5",
    orderCode: "NK-8850",
    by: "customer",
    type: "Damaged item",
    description: "One notebook had a torn cover and bent pages.",
    amount: 45,
    evidence: { photo: true, otpVerified: true, gpsMatch: true },
    status: "Resolved",
    liability: "Shop",
    filedAt: now - 5 * DAY + 2 * 3600_000,
  },
  {
    id: "d2",
    orderId: "o2",
    orderCode: "NK-8842",
    by: "customer",
    type: "Late delivery",
    description: "Order arrived 20 minutes after the promised window.",
    amount: 25,
    evidence: { photo: false, otpVerified: true, gpsMatch: true },
    status: "Resolved",
    liability: "Platform",
    filedAt: now - 2 * DAY + 3600_000,
  },
  {
    id: "d3",
    orderId: "o6",
    orderCode: "NK-8846",
    by: "customer",
    type: "Missing item",
    description: "Rajma packet missing from the bag at delivery.",
    amount: 98,
    evidence: { photo: true, otpVerified: true, gpsMatch: true },
    status: "Open",
    filedAt: now - 4 * 3600_000,
  },
  {
    id: "d4",
    orderId: "o8",
    orderCode: "NK-8848",
    by: "shop",
    type: "Payment issue",
    description: "COD amount of ₹215 not reflected in shop ledger.",
    amount: 215,
    evidence: { photo: false, otpVerified: true, gpsMatch: true },
    status: "Open",
    filedAt: now - 2 * 3600_000,
  },
];

export const SEED_RIDER_PAYOUTS: RiderPayout[] = [
  { id: "rp1", date: now - 2 * DAY, trips: 26, amount: 728, method: "UPI • rajesh@upi", status: "Paid" },
  { id: "rp2", date: now - 3 * DAY, trips: 31, amount: 869, method: "UPI • rajesh@upi", status: "Paid" },
  { id: "rp3", date: now - 4 * DAY, trips: 22, amount: 616, method: "UPI • rajesh@upi", status: "Paid" },
  { id: "rp4", date: now - 5 * DAY, trips: 28, amount: 784, method: "UPI • rajesh@upi", status: "Paid" },
];
