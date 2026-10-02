import type { Product, Shop } from "@/types";
import { haversineKm } from "./utils";

/**
 * Catalog intelligence:
 *  - the same real-world product (e.g. "Onion 1kg") exists as separate rows per shop
 *  - canonicalProducts() dedupes them; nearestVariant() routes an add-to-cart to the
 *    nearest shop that actually has stock — so orders land where delivery is fastest
 *  - pairingsFor() suggests complementary items the SAME shop has in stock
 */

export interface Variant {
  productId: string;
  shopId: string;
  price: number;
  mrp: number;
  stock: number;
}

export interface Canonical {
  key: string;
  name: string;
  brand: string;
  category: string;
  emoji: string;
  packSize: string;
  price: number;
  mrp: number;
  variants: Variant[];
}

export function canonicalProducts(products: Product[]): Canonical[] {
  const map = new Map<string, Canonical>();
  for (const p of products) {
    if (p.status !== "active") continue;
    const key = p.name.toLowerCase();
    const c = map.get(key) ?? {
      key,
      name: p.name,
      brand: p.brand,
      category: p.category,
      emoji: p.emoji,
      packSize: p.packSize,
      price: p.price,
      mrp: p.mrp,
      variants: [],
    };
    c.variants.push({ productId: p.id, shopId: p.shopId, price: p.price, mrp: p.mrp, stock: p.stock });
    c.price = Math.min(c.price, p.price);
    map.set(key, c);
  }
  return [...map.values()];
}

export function rankVariants(c: Canonical, shops: Shop[], userLoc: { lat: number; lng: number }) {
  return c.variants
    .flatMap((v) => {
      const shop = shops.find((s) => s.id === v.shopId);
      if (!shop || shop.status === "offline" || v.stock <= 0) return [];
      return [{ v, shop, distKm: haversineKm(userLoc, shop.location) }];
    })
    .sort((a, b) => a.distKm - b.distKm);
}

export function nearestVariant(c: Canonical, shops: Shop[], userLoc: { lat: number; lng: number }) {
  return rankVariants(c, shops, userLoc)[0] ?? null;
}

/* ------------------------------------------------------------------ */
/*  Pairings — complementary items, only what THIS shop has in stock  */
/* ------------------------------------------------------------------ */
const PAIRINGS: [RegExp, RegExp[]][] = [
  [/bread|pav|croissant/i, [/butter/i, /egg/i, /taaza|gold milk/i]],
  [/egg/i, [/bread/i, /taaza|gold milk/i, /tomato/i]],
  [/taaza|gold milk|lassi|chaas/i, [/bournvita/i, /cookie|good day|parle/i, /bread/i]],
  [/maggi|noodle/i, [/onion/i, /tomato/i, /cola|thums|dew/i]],
  [/cola|thums|pepsi|dew|cold drink/i, [/kurkure|lays|chips/i, /bhujia|namkeen/i]],
  [/atta|flour|maida/i, [/salt/i, /oil|fortune/i, /tata tea/i]],
  [/rice|dal|rajma|moong|toor|chana/i, [/salt/i, /oil|fortune/i, /onion/i]],
  [/oil|fortune/i, [/salt/i, /dal|rajma|toor/i]],
  [/cookie|biscuit|good day|parle/i, [/taaza|gold milk/i, /tea/i]],
  [/tea/i, [/cookie|biscuit|parle|good day/i, /jaggery/i]],
  [/coffee/i, [/cookie|biscuit/i, /taaza|gold milk/i]],
  [/paneer/i, [/onion/i, /capsicum/i, /tomato/i]],
  [/tomato|onion|potato|capsicum|spinach|carrot/i, [/coriander/i, /lemon/i, /chilli/i, /ginger|garlic/i]],
  [/detergent|surf|rin|ariel/i, [/vim|harpic|dishwash/i, /scotch|scrub/i]],
  [/soap|dove|lifebuoy/i, [/shampoo|clinic/i, /colgate|tooth/i]],
  [/tooth/i, [/soap/i, /nivea|cream/i]],
  [/shampoo/i, [/soap/i, /nivea|cream/i]],
  [/notebook/i, [/reynolds|cello|pen/i, /natraj|pencil|apsara/i]],
  [/pen|pencil/i, [/notebook/i, /apsara|eraser|camlin/i]],
  [/earphone|headphone/i, [/charger|adapter/i, /cover|tempered/i]],
  [/charger|adapter|cable/i, [/power bank/i, /earphone/i]],
  [/bhujia|namkeen/i, [/cola|thums/i, /tea/i]],
  [/shrikhand|ice cream/i, [/donut|muffin|croissant/i]],
];

export function pairingsFor(
  seedNames: string[],
  shopProducts: Product[],
  excludeProductIds: string[],
  limit = 6,
): Product[] {
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const name of seedNames) {
    for (const [trigger, targets] of PAIRINGS) {
      if (!trigger.test(name)) continue;
      for (const t of targets) {
        const match = shopProducts.find(
          (p) =>
            t.test(p.name) &&
            p.stock > 0 &&
            p.status === "active" &&
            !excludeProductIds.includes(p.id) &&
            !seen.has(p.id),
        );
        if (match) {
          seen.add(match.id);
          out.push(match);
          if (out.length >= limit) return out;
        }
      }
    }
  }
  return out;
}
