import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppNotification, Customer, Dispute, Offer, Order, OrderItem, Product,
  Rider, Role, Shop, ShopStatus, Toast, Transaction, RiderPayout,
} from "@/types";
import { AREAS } from "@/data/areas";
import { SHOPS } from "@/data/shops";
import { PRODUCTS } from "@/data/products";
import { RIDERS } from "@/data/riders";
import { DEMO_CUSTOMER, OTHER_CUSTOMERS } from "@/data/customers";
import { SEED_ORDERS } from "@/data/orders";
import { OFFERS, SEED_TRANSACTIONS, SEED_DISPUTES, SEED_RIDER_PAYOUTS } from "@/data/misc";
import { computeEta, coinsFor, groupEta, multiStoreFees, CART_RULES, fraudRisk, matchRiders, riderPayFor } from "@/lib/algorithms";
import { haversineKm, otp4, orderCode, uid } from "@/lib/utils";

export const MIN_ORDER = 100;

const DURATIONS: Partial<Record<Order["status"], number>> = {
  PLACED: 10000,
  ACCEPTED: 8000,
  PACKING: 8000,
  READY_FOR_PICKUP: 10000,
  RIDER_ASSIGNED: 8000,
  PICKED_UP: 6000,
  OUT_FOR_DELIVERY: 14000,
};

const LIVE_STATUSES: Order["status"][] = [
  "PLACED", "ACCEPTED", "PACKING", "READY_FOR_PICKUP", "RIDER_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY",
];

interface CartState {
  shopId: string | null;
  items: Record<string, number>;
}

interface Loyalty {
  coins: number;
  streakDays: number;
  lastOrderDay: string;
}

export interface PlaceOrderArgs {
  address: Customer["addresses"][number];
  payment: Order["payment"];
  tip: number;
  instructions?: string;
}

export interface CartValidation {
  ok: boolean;
  reason?: string;
  shopId?: string;
  needed?: number;
}

interface AppState {
  role: Role;
  areaId: string;
  shops: Shop[];
  products: Product[];
  riders: Rider[];
  orders: Order[];
  transactions: Transaction[];
  disputes: Dispute[];
  riderPayouts: RiderPayout[];
  offers: Offer[];
  cart: CartState;
  appliedCoupons: string[];
  useCoins: boolean;
  notifications: AppNotification[];
  toasts: Toast[];
  loyalty: Loyalty;
  customer: Customer;
  simAuto: boolean;
  onboarded: { shop: boolean; rider: boolean };
  locationAsked: boolean;

  setRole: (r: Role) => void;
  setArea: (id: string) => void;
  setLocationAsked: (v: boolean) => void;

  addToCart: (productId: string, qty?: number) => { ok: boolean; reason?: string; shopName?: string };
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  adoptCart: (shopId: string, items: Record<string, number>) => void;

  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: (code: string) => void;
  toggleUseCoins: () => void;

  validateCart: () => CartValidation;
  placeOrder: (args: PlaceOrderArgs) => Order[];

  shopAccept: (orderId: string) => void;
  shopReject: (orderId: string, reason: string, item?: string) => void;
  markPacked: (orderId: string) => void;
  setShopStatus: (shopId: string, status: ShopStatus) => void;
  updateStock: (productId: string, qty: number) => void;
  setProductStatus: (productId: string, status: Product["status"]) => void;

  riderAccept: (orderId: string) => void;
  riderReject: (orderId: string) => void;
  riderPickup: (orderId: string, otp: string) => { ok: boolean };
  riderOut: (orderId: string) => void;
  riderDeliver: (orderId: string, otp: string) => { ok: boolean };
  toggleRiderOnline: () => void;

  cancelOrder: (orderId: string, by: string, reason: string) => void;
  rateOrder: (orderId: string, rating: number, tags: string[]) => void;
  reorder: (orderId: string) => void;

  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  notify: (n: Omit<AppNotification, "id" | "at" | "read">) => void;
  markNotificationsRead: () => void;

  setSimAuto: (v: boolean) => void;
  simTick: () => void;
  addDispute: (d: Omit<Dispute, "id" | "filedAt" | "status">) => void;
  resolveDispute: (id: string, liability: Dispute["liability"]) => void;
  resetDemo: () => void;
}

const seedState = () => ({
  role: "customer" as Role,
  areaId: "satellite",
  shops: SHOPS,
  products: PRODUCTS,
  riders: RIDERS,
  orders: SEED_ORDERS,
  transactions: SEED_TRANSACTIONS,
  disputes: SEED_DISPUTES,
  riderPayouts: SEED_RIDER_PAYOUTS,
  offers: OFFERS,
  cart: { shopId: null, items: {} } as CartState,
  appliedCoupons: [] as string[],
  useCoins: false,
  notifications: [] as AppNotification[],
  toasts: [] as Toast[],
  loyalty: { coins: 120, streakDays: 2, lastOrderDay: "" } as Loyalty,
  customer: DEMO_CUSTOMER,
  simAuto: true,
  onboarded: { shop: true, rider: true },
  locationAsked: false,
});

function areaLoc(areaName: string) {
  const a = AREAS.find((x) => x.name === areaName);
  return a?.location ?? AREAS[0].location;
}

function dayKey(ts = Date.now()) {
  return new Date(ts).toDateString();
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => {
      const notify = (n: Omit<AppNotification, "id" | "at" | "read">) =>
        set((s) => ({
          notifications: [{ ...n, id: uid("n"), at: Date.now(), read: false }, ...s.notifications].slice(0, 60),
        }));

      const pushStatus = (orderId: string, status: Order["status"], by: string, patch: Partial<Order> = {}) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, ...patch, status, lastStatusAt: Date.now(), timeline: [...o.timeline, { status, at: Date.now(), by }] }
              : o,
          ),
        }));

      const deductStock = (order: Order, sign: 1 | -1) =>
        set((s) => ({
          products: s.products.map((p) => {
            const it = order.items.find((i) => i.productId === p.id);
            if (!it) return p;
            const stock = Math.max(0, p.stock + sign * it.qty);
            return { ...p, stock, updateSource: sign === -1 ? ("order" as const) : ("manual" as const), lastUpdatedAt: Date.now() };
          }),
        }));

      const advance = (orderId: string) => {
        const s = get();
        const order = s.orders.find((o) => o.id === orderId);
        if (!order || !LIVE_STATUSES.includes(order.status)) return;
        switch (order.status) {
          case "PLACED": {
            pushStatus(orderId, "ACCEPTED", "shop");
            deductStock(order, -1);
            notify({ role: "customer", kind: "order", title: "Shop accepted your order", body: `${s.shops.find((x) => x.id === order.shopId)?.name} is packing ${order.code}` });
            notify({ role: "shop", kind: "stock", title: "Stock auto-deducted", body: `${order.items.length} items reduced for ${order.code}` });
            break;
          }
          case "ACCEPTED":
            pushStatus(orderId, "PACKING", "shop");
            break;
          case "PACKING":
            pushStatus(orderId, "READY_FOR_PICKUP", "shop");
            notify({ role: "shop", kind: "order", title: "Order ready", body: `${order.code} waiting for pickup` });
            break;
          case "READY_FOR_PICKUP": {
            const shop = s.shops.find((x) => x.id === order.shopId);
            if (!shop) break;
            const ranked = matchRiders(s.riders, shop.location);
            const pick = ranked.find((r) => r.rider.id === "r1") ?? ranked[0];
            if (!pick) break;
            pushStatus(orderId, "RIDER_ASSIGNED", "rider", { riderId: pick.rider.id });
            notify({ role: "customer", kind: "rider", title: "Rider assigned", body: `${pick.rider.name} is picking up ${order.code}` });
            notify({ role: "rider", kind: "order", title: "Job accepted", body: `Pickup: ${shop.name}` });
            break;
          }
          case "RIDER_ASSIGNED":
            pushStatus(orderId, "PICKED_UP", "rider");
            break;
          case "PICKED_UP":
            pushStatus(orderId, "OUT_FOR_DELIVERY", "rider");
            break;
          case "OUT_FOR_DELIVERY": {
            pushStatus(orderId, "DELIVERED", "rider");
            const rider = s.riders.find((r) => r.id === order.riderId);
            const shop = s.shops.find((x) => x.id === order.shopId);
            if (shop && rider) {
              const dist = haversineKm(shop.location, areaLoc(order.address.area));
              const hour = new Date().getHours();
              const pay = riderPayFor(dist, hour >= 17 && hour <= 21);
              set((st) => ({
                riders: st.riders.map((r) => (r.id === rider.id ? { ...r, earningsToday: r.earningsToday + pay.total, trips: r.trips + 1 } : r)),
                transactions: [
                  {
                    id: uid("t"),
                    date: Date.now(),
                    orderId: order.id,
                    orderCode: order.code,
                    gross: order.itemTotal,
                    commission: +(order.itemTotal * (shop.commissionPct / 100)).toFixed(1),
                    tcs: +(order.itemTotal * 0.01).toFixed(1),
                    net: +(order.itemTotal - order.itemTotal * (shop.commissionPct / 100) - order.itemTotal * 0.01).toFixed(1),
                    status: "Pending",
                  },
                  ...st.transactions,
                ],
              }));
            }
            const earned = coinsFor(order.itemTotal);
            const today = dayKey();
            const yest = dayKey(Date.now() - 86400000);
            set((st) => ({
              loyalty: {
                coins: st.loyalty.coins + earned,
                streakDays: st.loyalty.lastOrderDay === today ? st.loyalty.streakDays : st.loyalty.lastOrderDay === yest ? st.loyalty.streakDays + 1 : 1,
                lastOrderDay: today,
              },
            }));
            notify({ role: "customer", kind: "order", title: "Delivered!", body: `${order.code} delivered. +${earned} NearCoins earned 🎉` });
            notify({ role: "rider", kind: "payout", title: `₹ added to earnings`, body: `${order.code} completed` });
            break;
          }
        }
      };

      return {
        ...seedState(),

        setRole: (role) => set({ role }),
        setArea: (areaId) => set({ areaId }),
        setLocationAsked: (locationAsked) => set({ locationAsked }),

        addToCart: (productId, qty = 1) => {
          const s = get();
          const p = s.products.find((x) => x.id === productId);
          if (!p) return { ok: false, reason: "Product not found" };
          if (p.status !== "active" || p.stock <= 0) return { ok: false, reason: "Out of stock" };
          const cur = s.cart.items[productId] ?? 0;
          const next = cur + qty;
          if (next > p.stock) return { ok: false, reason: `Only ${p.stock} left in stock` };
          const items = { ...s.cart.items };
          if (next <= 0) delete items[productId];
          else items[productId] = next;
          set({ cart: { shopId: Object.keys(items).length ? p.shopId : null, items } });
          return { ok: true };
        },
        setQty: (productId, qty) => {
          const s = get();
          const p = s.products.find((x) => x.id === productId);
          if (!p) return;
          if (qty <= 0) {
            const items = { ...s.cart.items };
            delete items[productId];
            set({ cart: { shopId: Object.keys(items).length ? s.cart.shopId : null, items } });
            return;
          }
          set((st) => ({ cart: { ...st.cart, items: { ...st.cart.items, [productId]: Math.min(qty, p.stock) } } }));
        },
        clearCart: () => set({ cart: { shopId: null, items: {} }, appliedCoupons: [], useCoins: false }),
        adoptCart: (shopId, items) => set({ cart: { shopId, items }, appliedCoupons: [] }),

        applyCoupon: (code) => {
          const s = get();
          const c = code.trim().toUpperCase();
          const offer = s.offers.find((o) => o.code === c && o.active);
          if (!offer) return { ok: false, message: "Invalid coupon code" };
          const itemTotal = Object.entries(s.cart.items).reduce((sum, [pid, q]) => {
            const p = s.products.find((x) => x.id === pid);
            return sum + (p ? p.price * q : 0);
          }, 0);
          if (itemTotal < offer.minOrder) return { ok: false, message: `Add items worth ₹${offer.minOrder - Math.round(itemTotal)} more to use ${c}` };
          if (s.appliedCoupons.includes(c)) return { ok: false, message: "Coupon already applied" };
          set((st) => ({ appliedCoupons: [...st.appliedCoupons, c] }));
          return { ok: true, message: `${c} applied — ${offer.title}` };
        },
        removeCoupon: (code) => set((s) => ({ appliedCoupons: s.appliedCoupons.filter((c) => c !== code) })),
        toggleUseCoins: () => set((s) => ({ useCoins: !s.useCoins })),

        validateCart: () => {
          const s = get();
          const entries = Object.entries(s.cart.items);
          if (entries.length === 0 || !s.cart.shopId) return { ok: false, reason: "empty" };
          const byShop = new Map<string, number>();
          for (const [pid, qty] of entries) {
            const p = s.products.find((x) => x.id === pid);
            if (p) byShop.set(p.shopId, (byShop.get(p.shopId) ?? 0) + p.price * qty);
          }
          const overall = [...byShop.values()].reduce((a, b) => a + b, 0);
          if (overall < CART_RULES.overallMin) return { ok: false, reason: "overall", needed: CART_RULES.overallMin - overall };
          if (byShop.size === 1) {
            if (overall < CART_RULES.singleMin) return { ok: false, reason: "single", shopId: [...byShop.keys()][0], needed: CART_RULES.singleMin - overall };
          } else {
            for (const [sid, v] of byShop) {
              if (v < CART_RULES.multiPerShopMin) return { ok: false, reason: "multi", shopId: sid, needed: CART_RULES.multiPerShopMin - v };
            }
          }
          return { ok: true };
        },

        placeOrder: ({ address, payment, tip, instructions }) => {
          const s = get();
          if (Object.keys(s.cart.items).length === 0) return [];
          const validation = get().validateCart();
          if (!validation.ok) return [];

          /* group the basket by shop — one sub-order per store */
          const byShop = new Map<string, OrderItem[]>();
          for (const [pid, qty] of Object.entries(s.cart.items)) {
            const p = s.products.find((x) => x.id === pid)!;
            const item: OrderItem = { productId: p.id, name: p.name, emoji: p.emoji, packSize: p.packSize, price: p.price, qty };
            byShop.set(p.shopId, [...(byShop.get(p.shopId) ?? []), item]);
          }
          const shopIds = [...byShop.keys()];
          const overall = [...byShop.values()].reduce((t, items) => t + items.reduce((a, i) => a + i.price * i.qty, 0), 0);
          const fees = multiStoreFees(shopIds.length, overall);

          /* coupons apply to the group; coins redeem against the group */
          let couponDiscount = 0;
          for (const code of s.appliedCoupons) {
            const offer = s.offers.find((o) => o.code === code && o.active);
            if (offer && overall >= offer.minOrder) {
              if (offer.type === "flat") couponDiscount += offer.value;
              else fees.total = 0;
            }
          }
          const coinDiscount = s.useCoins ? Math.min(s.loyalty.coins, 50) : 0;

          const risk = fraudRisk({
            payment,
            total: overall,
            isNewCustomer: false,
            areaMatch: shopIds.every((sid) => {
              const shop = s.shops.find((x) => x.id === sid);
              return shop ? haversineKm(shop.location, areaLoc(address.area)) <= shop.radiusKm : false;
            }),
            recentCancels: s.orders.filter((o) => o.customerId === s.customer.id && ["CANCELLED", "REJECTED"].includes(o.status) && Date.now() - o.placedAt < 7 * 86400000).length,
          });

          const onlineRiders = s.riders.filter((r) => r.online).length;
          let groupCode = `NK-G${Math.floor(1000 + Math.random() * 9000)}`;
          while (s.orders.some((o) => o.groupCode === groupCode)) groupCode = `NK-G${Math.floor(1000 + Math.random() * 9000)}`;
          const usedCodes = new Set(s.orders.map((o) => o.code));

          const created: Order[] = shopIds.map((sid, idx) => {
            const shop = s.shops.find((x) => x.id === sid)!;
            const items = byShop.get(sid)!;
            const itemTotal = items.reduce((t, i) => t + i.price * i.qty, 0);
            /* fee allocation: base on first store, extra-shop fee on the following ones */
            const deliveryFee = idx === 0 ? fees.baseFee : 0;
            const multiStoreFee = idx === 0 ? 0 : fees.extraShopFees / (shopIds.length - 1);
            /* discounts land on the first sub-order to keep the ledger exact */
            const share = itemTotal / overall;
            const oCoupon = idx === 0 ? couponDiscount : 0;
            const oCoins = Math.round(coinDiscount * share * 100) / 100;
            let code = orderCode();
            while (usedCodes.has(code)) code = orderCode();
            usedCodes.add(code);
            return {
              id: uid("o"),
              code,
              groupCode: shopIds.length > 1 ? groupCode : undefined,
              customerId: s.customer.id,
              customerName: s.customer.name,
              customerPhone: s.customer.phone,
              address: { ...address, instructions: instructions || address.instructions },
              shopId: sid,
              items,
              itemTotal,
              deliveryFee,
              multiStoreFee: Math.round(multiStoreFee * 100) / 100,
              couponDiscount: oCoupon,
              coinDiscount: oCoins,
              tip: idx === 0 ? tip : 0,
              total: Math.round((itemTotal + deliveryFee + multiStoreFee - oCoupon - oCoins + (idx === 0 ? tip : 0)) * 100) / 100,
              payment,
              paymentRisk: risk.level === "review" ? "review" : "normal",
              status: "PLACED" as const,
              placedAt: Date.now(),
              lastStatusAt: Date.now(),
              timeline: [{ status: "PLACED", at: Date.now(), by: "customer" }],
              otpPickup: otp4(),
              otpDelivery: otp4(),
              etaMin: computeEta(shop, areaLoc(address.area), onlineRiders),
              instructions,
            };
          });

          const eta = groupEta(created.map((o) => o.etaMin));
          for (const o of created) {
            notify({ role: "shop", kind: "order", title: "New order received!", body: `${o.code}${shopIds.length > 1 ? ` (part of ${groupCode})` : ""} • ₹${o.itemTotal} • ${o.items.length} items` });
          }
          notify({ role: "customer", kind: "order", title: shopIds.length > 1 ? `Order placed across ${shopIds.length} stores` : "Order placed", body: `${groupCode ?? created[0].code} • arriving in ~${eta} min` });

          set((st) => ({
            orders: [...created, ...st.orders],
            cart: { shopId: null, items: {} },
            appliedCoupons: [],
            useCoins: false,
            loyalty: coinDiscount > 0 ? { ...st.loyalty, coins: st.loyalty.coins - coinDiscount } : st.loyalty,
          }));
          return created;
        },

        shopAccept: (orderId) => advance(orderId),
        markPacked: (orderId) => {
          const o = get().orders.find((x) => x.id === orderId);
          if (o?.status === "ACCEPTED") advance(orderId);
          if (o?.status === "PACKING") advance(orderId);
        },
        shopReject: (orderId, reason, item) => {
          set((s) => ({
            orders: s.orders.map((o) =>
              o.id === orderId
                ? { ...o, status: "REJECTED" as const, cancelReason: item ? `${reason}: ${item}` : reason, lastStatusAt: Date.now(), timeline: [...o.timeline, { status: "REJECTED", at: Date.now(), by: "shop", note: reason }] }
                : o,
            ),
          }));
          notify({ role: "customer", kind: "order", title: "Order rejected by shop", body: reason });
        },
        setShopStatus: (shopId, status) => {
          set((s) => ({ shops: s.shops.map((x) => (x.id === shopId ? { ...x, status } : x)) }));
          notify({ role: "admin", kind: "trust", title: "Shop status changed", body: `${get().shops.find((x) => x.id === shopId)?.name} → ${status}` });
        },
        updateStock: (productId, qty) =>
          set((s) => ({
            products: s.products.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, qty), lastUpdatedAt: Date.now(), updateSource: "manual" } : p)),
          })),
        setProductStatus: (productId, status) =>
          set((s) => ({ products: s.products.map((p) => (p.id === productId ? { ...p, status, lastUpdatedAt: Date.now() } : p)) })),

        riderAccept: (orderId) => {
          const s = get();
          const order = s.orders.find((o) => o.id === orderId);
          if (!order || order.status !== "READY_FOR_PICKUP") return;
          const me = s.riders.find((r) => r.id === "r1") ?? s.riders.find((r) => r.online);
          if (!me) return;
          pushStatus(orderId, "RIDER_ASSIGNED", "rider", { riderId: me.id });
          notify({ role: "customer", kind: "rider", title: "Rider assigned", body: `${me.name} will pick up ${order.code}` });
        },
        riderReject: (orderId) => notify({ role: "admin", kind: "rider", title: "Rider declined job", body: `Order ${get().orders.find((o) => o.id === orderId)?.code} needs reassignment` }),
        riderPickup: (orderId, otp) => {
          const o = get().orders.find((x) => x.id === orderId);
          if (!o || o.otpPickup !== otp) return { ok: false };
          advance(orderId);
          return { ok: true };
        },
        riderOut: (orderId) => {
          const o = get().orders.find((x) => x.id === orderId);
          if (o?.status === "PICKED_UP") advance(orderId);
        },
        riderDeliver: (orderId, otp) => {
          const o = get().orders.find((x) => x.id === orderId);
          if (!o || o.otpDelivery !== otp) return { ok: false };
          advance(orderId);
          return { ok: true };
        },
        toggleRiderOnline: () =>
          set((s) => ({ riders: s.riders.map((r, i) => (i === 0 ? { ...r, online: !r.online } : r)) })),

        cancelOrder: (orderId, by, reason) => {
          const s = get();
          const o = s.orders.find((x) => x.id === orderId);
          if (!o) return;
          if (["ACCEPTED", "PACKING"].includes(o.status)) deductStock(o, 1);
          pushStatus(orderId, "CANCELLED", by);
          set((st) => ({ orders: st.orders.map((x) => (x.id === orderId ? { ...x, cancelReason: reason } : x)) }));
          notify({ role: "shop", kind: "order", title: "Order cancelled", body: `${o.code} • ${reason}` });
        },
        rateOrder: (orderId, rating, tags) => {
          const s = get();
          const o = s.orders.find((x) => x.id === orderId);
          if (!o || o.rating) return;
          set((st) => ({ orders: st.orders.map((x) => (x.id === orderId ? { ...x, rating, ratingTags: tags } : x)), loyalty: { ...st.loyalty, coins: st.loyalty.coins + 5 } }));
          notify({ role: "shop", kind: "growth", title: "New rating received", body: `${o.code} • ${"★".repeat(rating)}` });
        },
        reorder: (orderId) => {
          const s = get();
          const o = s.orders.find((x) => x.id === orderId);
          if (!o) return;
          const items: Record<string, number> = {};
          let shop = o.shopId;
          for (const it of o.items) {
            const p = s.products.find((x) => x.id === it.productId);
            if (p && p.status === "active" && p.stock > 0) items[p.id] = Math.min(it.qty, p.stock);
          }
          if (Object.keys(items).length === 0) return;
          if (s.cart.shopId && s.cart.shopId !== shop && Object.keys(s.cart.items).length > 0) {
            shop = s.cart.shopId;
            set({ cart: { shopId: shop, items } });
          } else {
            set({ cart: { shopId: shop, items } });
          }
        },

        pushToast: (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: uid("toast") }].slice(-3) })),
        dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
        notify,
        markNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

        setSimAuto: (simAuto) => set({ simAuto }),
        simTick: () => {
          const s = get();
          if (!s.simAuto) return;
          const now = Date.now();
          for (const o of s.orders) {
            if (!LIVE_STATUSES.includes(o.status)) continue;
            const dur = DURATIONS[o.status] ?? 10000;
            if (now - o.lastStatusAt > dur) advance(o.id);
          }
        },
        addDispute: (d) => {
          set((s) => ({ disputes: [{ ...d, id: uid("d"), filedAt: Date.now(), status: "Open" as const }, ...s.disputes] }));
          notify({ role: "admin", kind: "trust", title: "New dispute filed", body: `${d.type} • ${d.orderCode}` });
        },
        resolveDispute: (id, liability) =>
          set((s) => ({ disputes: s.disputes.map((d) => (d.id === id ? { ...d, status: "Resolved" as const, liability } : d)) })),
        resetDemo: () => {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("nearkart-v1");
            window.location.href = "/";
            window.location.reload();
          }
        },
      };
    },
    {
      name: "nearkart-v1",
      partialize: (s) => {
        const { toasts, ...rest } = s;
        return rest as AppState;
      },
    },
  ),
);

/* ------------------------- derived helpers ------------------------- */
export function useHydrated() {
  return useApp.persist.hasHydrated();
}

export const selectUserLoc = (s: AppState) => AREAS.find((a) => a.id === s.areaId)?.location ?? AREAS[0].location;

export function cartCount(items: Record<string, number>) {
  return Object.values(items).reduce((a, b) => a + b, 0);
}

export function cartValue(items: Record<string, number>, products: Product[]) {
  return Object.entries(items).reduce((sum, [pid, q]) => {
    const p = products.find((x) => x.id === pid);
    return sum + (p ? p.price * q : 0);
  }, 0);
}

export { OTHER_CUSTOMERS };
