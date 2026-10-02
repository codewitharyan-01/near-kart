export type Role = "customer" | "shop" | "rider" | "admin";

export type ShopStatus = "online" | "busy" | "offline";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ShopDocs {
  pan: string;
  gstin?: string;
  fssai?: string;
  bankAccount: string;
  ifsc: string;
}

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  type: string;
  tagline: string;
  emoji: string;
  gradient: string;
  area: string;
  address: string;
  pincode: string;
  location: GeoPoint;
  rating: number;
  ratingCount: number;
  prepTimeMin: number;
  minOrder: number;
  radiusKm: number;
  status: ShopStatus;
  openTime: string;
  closeTime: string;
  verified: boolean;
  docs: ShopDocs;
  acceptanceRate: number;
  ordersToday: number;
  sponsored?: boolean;
  commissionPct: number;
  joinedAt: string;
}

export type ProductStatus = "active" | "hidden";

export interface Product {
  id: string;
  shopId: string;
  name: string;
  brand: string;
  category: string;
  emoji: string;
  packSize: string;
  mrp: number;
  price: number;
  gstRate: number;
  stock: number;
  lowStockThreshold: number;
  perishableDays?: number;
  status: ProductStatus;
  popularity: number;
  updateSource: "seed" | "order" | "manual";
  lastUpdatedAt: number;
}

export interface Address {
  id: string;
  label: "Home" | "Work" | "Other";
  name: string;
  phone: string;
  line1: string;
  landmark: string;
  area: string;
  city: string;
  pincode: string;
  instructions?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  addresses: Address[];
  joinedAt: string;
}

export type VehicleType = "Bike" | "Scooter" | "Bicycle";

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicle: VehicleType;
  vehicleNumber: string;
  rating: number;
  trips: number;
  earningsToday: number;
  baseLocation: GeoPoint;
  online: boolean;
  acceptanceRate: number;
  zone: string;
  licenseVerified: boolean;
  joinedAt: string;
}

export type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PACKING"
  | "READY_FOR_PICKUP"
  | "RIDER_ASSIGNED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "REJECTED"
  | "CANCELLED";

export interface OrderItem {
  productId: string;
  name: string;
  emoji: string;
  packSize: string;
  price: number;
  qty: number;
}

export interface TimelineEvent {
  status: OrderStatus | string;
  at: number;
  by?: string;
  note?: string;
}

export interface Order {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: Address;
  shopId: string;
  riderId?: string;
  items: OrderItem[];
  itemTotal: number;
  deliveryFee: number;
  couponDiscount: number;
  coinDiscount: number;
  tip: number;
  total: number;
  payment: "UPI" | "Card" | "COD";
  paymentRisk: "normal" | "review";
  status: OrderStatus;
  placedAt: number;
  lastStatusAt: number;
  timeline: TimelineEvent[];
  otpPickup: string;
  otpDelivery: string;
  etaMin: number;
  rating?: number;
  ratingTags?: string[];
  cancelReason?: string;
  deliveryPhoto?: boolean;
  instructions?: string;
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  type: "flat" | "percent";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  description: string;
  active: boolean;
  firstOrderOnly?: boolean;
  views: number;
  usedCount: number;
  revenue: number;
}

export interface Transaction {
  id: string;
  date: number;
  orderId: string;
  orderCode: string;
  gross: number;
  commission: number;
  tcs: number;
  net: number;
  status: "Pending" | "Settled";
}

export interface RiderPayout {
  id: string;
  date: number;
  trips: number;
  amount: number;
  method: string;
  status: "Paid" | "Processing";
}

export type DisputeType =
  | "Missing item"
  | "Wrong item"
  | "Damaged item"
  | "Expired product"
  | "Late delivery"
  | "Non-delivery claim"
  | "Rider misconduct"
  | "Payment issue";

export interface Dispute {
  id: string;
  orderId: string;
  orderCode: string;
  by: "customer" | "shop" | "rider";
  type: DisputeType;
  description: string;
  amount: number;
  evidence: { photo: boolean; otpVerified: boolean; gpsMatch: boolean };
  status: "Open" | "Resolved";
  liability?: "Shop" | "Rider" | "Platform" | "Customer";
  filedAt: number;
}

export interface AppNotification {
  id: string;
  role: Role | "all";
  title: string;
  body: string;
  at: number;
  read: boolean;
  kind: "order" | "stock" | "rider" | "payout" | "trust" | "growth";
}

export interface Toast {
  id: string;
  title: string;
  body?: string;
  kind: "success" | "info" | "warn" | "error";
}

export interface Area {
  id: string;
  name: string;
  city: string;
  location: GeoPoint;
}

export interface CategoryDef {
  id: string;
  label: string;
  emoji: string;
}
