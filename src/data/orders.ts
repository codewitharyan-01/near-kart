import type { Order, OrderItem } from "@/types";
import { findProductByName } from "./products";
import { DEMO_CUSTOMER, OTHER_CUSTOMERS } from "./customers";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const now = Date.now();

function item(name: string, qty: number): OrderItem | null {
  const p = findProductByName(name);
  if (!p) return null;
  return { productId: p.id, name: p.name, emoji: p.emoji, packSize: p.packSize, price: p.price, qty };
}

function items(list: [string, number][]): OrderItem[] {
  return list.map(([n, q]) => item(n, q)).filter((x): x is OrderItem => x !== null);
}

function itemTotal(list: OrderItem[]) {
  return list.reduce((s, i) => s + i.price * i.qty, 0);
}

interface Seed {
  code: string;
  shopId: string;
  customerId: string;
  list: [string, number][];
  status: Order["status"];
  ago: number;
  payment?: Order["payment"];
  riderId?: string;
  rating?: number;
  tags?: string[];
  cancelReason?: string;
  note?: string;
}

const SEEDS: Seed[] = [
  { code: "NK-8841", shopId: "sharma", customerId: "c1", list: [["Amul Taaza Milk 500ml", 2], ["Britannia Good Day Cashew 200g", 1], ["Tata Salt 1kg", 1]], status: "DELIVERED", ago: 1 * DAY + 3 * HOUR, payment: "UPI", rating: 5, tags: ["Fast delivery", "Correct items"] },
  { code: "NK-8842", shopId: "balaji", customerId: "c1", list: [["Britannia Brown Bread 400g", 1], ["Farm Eggs (6 pc)", 1], ["Gujarati Lassi 200ml", 2]], status: "DELIVERED", ago: 2 * DAY + 5 * HOUR, payment: "COD", rating: 4, tags: ["Fresh products"] },
  { code: "NK-8843", shopId: "freshcorner", customerId: "c2", list: [["Tomato", 1], ["Onion", 1], ["Coriander", 2]], status: "DELIVERED", ago: 3 * DAY, payment: "UPI", riderId: "r2", rating: 5, tags: ["Fast delivery", "Fresh products"] },
  { code: "NK-8844", shopId: "satyam", customerId: "c3", list: [["Coca-Cola 750ml", 2], ["Haldiram Bhujia 400g", 1]], status: "CANCELLED", ago: 3 * DAY + 2 * HOUR, payment: "UPI", cancelReason: "Changed my mind — ordered from shop directly" },
  { code: "NK-8845", shopId: "shreeji", customerId: "c4", list: [["Clinic Plus Shampoo 355ml", 1], ["Fiama Gel Bar Peach", 2]], status: "REJECTED", ago: 4 * DAY, payment: "COD", cancelReason: "Item unavailable: Clinic Plus Shampoo 355ml" },
  { code: "NK-8846", shopId: "gujarat", customerId: "c1", list: [["Toor Dal 1kg", 1], ["Kolam Rice 5kg", 1], ["Rajma Chitra 500g", 1]], status: "DELIVERED", ago: 7 * HOUR, payment: "UPI", riderId: "r1", rating: 5, tags: ["Fast delivery", "Good packaging"] },
  { code: "NK-8847", shopId: "balaji", customerId: "c1", list: [["Amul Taaza Milk 1L", 2], ["Butter Croissant", 2], ["Malai Paneer 200g", 1]], status: "OUT_FOR_DELIVERY", ago: 6 * MIN, payment: "UPI", riderId: "r3" },
  { code: "NK-8848", shopId: "sharma", customerId: "c5", list: [["Maggi Noodles 70g", 5], ["Coca-Cola 750ml", 2], ["Kurkure Masala Munch 90g", 3]], status: "READY_FOR_PICKUP", ago: 9 * MIN, payment: "COD" },
  { code: "NK-8849", shopId: "freshcorner", customerId: "c1", list: [["Spinach (Palak)", 1], ["Tomato", 1], ["Lemon (4 pc)", 1]], status: "PLACED", ago: 1 * MIN, payment: "UPI" },
  { code: "NK-8850", shopId: "patel", customerId: "c2", list: [["Classmate Notebook 172pg", 4], ["Reynolds Trimax Pen", 2]], status: "DELIVERED", ago: 5 * DAY, payment: "Card", riderId: "r5", rating: 4, tags: ["Good packaging"] },
];

function stage(status: Order["status"], placedAt: number): { status: Order["status"]; at: number; by?: string }[] {
  const chain: Order["status"][] = ["PLACED", "ACCEPTED", "PACKING", "READY_FOR_PICKUP", "RIDER_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];
  const idx = chain.indexOf(status);
  const list: { status: Order["status"]; at: number; by?: string }[] = [];
  if (status === "REJECTED") {
    return [{ status: "PLACED", at: placedAt }, { status: "REJECTED", at: placedAt + 3 * MIN, by: "shop" }];
  }
  if (status === "CANCELLED") {
    return [{ status: "PLACED", at: placedAt }, { status: "CANCELLED", at: placedAt + 5 * MIN, by: "customer" }];
  }
  for (let i = 0; i <= idx; i++) {
    list.push({ status: chain[i], at: placedAt + i * 4 * MIN, by: i === 0 ? "customer" : i >= 4 ? "rider" : "shop" });
  }
  return list;
}

export const SEED_ORDERS: Order[] = SEEDS.map((s, idx) => {
  const customer = s.customerId === "c1" ? DEMO_CUSTOMER : OTHER_CUSTOMERS.find((c) => c.id === s.customerId)!;
  const address = customer.addresses[0];
  const oi = items(s.list);
  const total0 = itemTotal(oi);
  const deliveryFee = total0 >= 299 ? 0 : 25;
  const placedAt = now - s.ago;
  const timeline = stage(s.status, placedAt);
  const last = timeline[timeline.length - 1];
  return {
    id: `o${idx + 1}`,
    code: s.code,
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    address,
    shopId: s.shopId,
    riderId: s.riderId ?? (s.status === "DELIVERED" || s.status === "OUT_FOR_DELIVERY" ? (s.riderId ?? "r1") : undefined),
    items: oi,
    itemTotal: total0,
    deliveryFee,
    couponDiscount: 0,
    coinDiscount: 0,
    tip: 0,
    total: total0 + deliveryFee,
    payment: s.payment ?? "UPI",
    paymentRisk: s.payment === "COD" && total0 > 400 ? "review" : "normal",
    status: s.status,
    placedAt,
    lastStatusAt: last.at,
    timeline,
    otpPickup: String(1000 + ((idx * 3719) % 9000)),
    otpDelivery: String(1000 + ((idx * 5171) % 9000)),
    etaMin: 22 - (idx % 6),
    rating: s.rating,
    ratingTags: s.tags,
    cancelReason: s.cancelReason,
    instructions: s.customerId === "c1" ? DEMO_CUSTOMER.addresses[0].instructions : undefined,
  };
});
