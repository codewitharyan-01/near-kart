# NearKart Strategy — the 9 missing layers

The product spec describes *what* NearKart is. This document is the *other 90%*: brand, psychology, algorithms, growth, revenue, trust, data, go-to-market, and metrics — and exactly where each one shows up in the demo you're looking at.

---

## 1. Brand system — "modern local"

| Token | Value | Why |
|---|---|---|
| Primary | Emerald `#059669` → `#047857` gradient | Fresh = groceries, green = local/kirana; distinct from Zepto (pink/purple) and Blinkit (yellow) |
| Accent | Amber `#F59E0B` | Offers, NearCoins, streaks — reward energy, never for core actions |
| Ink | Deep navy-black `#0A1220` on warm gray `#F6F8F9` | Premium calm; let colours mean something |
| Danger / Info | Rose / Sky | Used only for risk + logistics states |
| Display font | Plus Jakarta Sans (extrabold, tight) | Startup-premium, friendly geometry |
| Body font | Inter | The workhorse; tabular numerals for all money (`num` utility) |
| Logo | Location pin with a lightning bolt core | "Near" + "speed" in one glyph |
| Voice | Confident, warm, honest. "Honest 15–30 minutes", "Dark stores rent your neighbourhood. We live in it." | Positioning: trust > hype |
| Motion | 150–300ms springs, fade-rise on scroll, no bouncy circus | Feels engineered, not decorated |

**Tagline stack:** *Your local shops, delivered fast.* (product) → *The neighbourhood, delivered.* (brand) → *Blinkit speed. Kirana soul. Zero dark stores.* (investor one-liner).

**In the demo:** every screen, the landing hero, gradient CTAs, dark mode across all four modules.

---

## 2. Psychology playbook (ethical nudges)

Every nudge below is wired into the demo and designed to be *honest* — no fake countdowns, no dark patterns that generate support tickets.

| Principle | Feature | Where |
|---|---|---|
| Goal gradient | Free-delivery progress bar ("Add ₹49 more…") | Cart |
| Loss aversion | "Only 3 left" low-stock badges; auto-hiding sold-out items | Shop pages, product cards |
| Social proof | "23 orders today" on shop cards; "People also add" | Discovery, cart suggestions |
| Anchoring | MRP struck through next to selling price, % OFF badges | All product cards |
| Reciprocity | Rider tip selector (₹10/₹20/₹30) — 100% pass-through | Checkout |
| Commitment & streaks | Daily order streak 🔥 with visible progress | Customer home, profile |
| Variable reward | NearCoins earn rate + Platinum tier progress | Profile, tracking |
| Default effect | UPI preselected, recommended basket one tap away | Checkout, min-order gate |
| Urgency (real) | 2-minute shop acceptance timer; auto-accept protects ratings | Shop dashboard |
| Curiosity gap | "Ranked by distance, rating & speed" transparency chips | Shops page |

**Guardrail:** nudge toward *bigger baskets and trust*, never toward anxiety. Countdowns that exist are real system timers.

---

## 3. Algorithms — the intelligence layer

All implemented in `src/lib/algorithms.ts`, all observable in the demo:

1. **Shop ranking** — `score = 0.30·rating + 0.25·proximity + 0.20·speed + 0.15·reliability + 0.10·demand`, boosted ×1.15 for sponsored, damped for busy/offline. → *Customer discovery ordering.*
2. **Rider matching** — filter online, score = `rating·12 + acceptance·0.1 − 3·distance-to-shop`. → *Job assignment in the sim engine and rider accept.*
3. **Dynamic ETA** — `prep + 3.2·distance + supply buffer(rider count)`, clamped 12–38 min. No fake 10-minute promises. → *Checkout, tracking.*
4. **Fraud risk engine** — COD value bands + new customer + out-of-radius address + recent cancellations → `normal / watch / review`. High-value COD shows a friction warning. → *Checkout, admin order table.*
5. **Basket builder** — popular same-shop items priced to close the gap to the ₹100 minimum. → *Cart min-order gate.*
6. **Demand forecast** — hour-of-day curve → next-hour order estimate + surge flag when predicted jobs exceed rider supply 20%. → *Admin overview.*
7. **Rider pay** — `₹20 base + ₹2.5/km + ₹7 peak + 100% tips`, shown *before* job acceptance. → *Rider app.*
8. **Stock automation** — accept → deduct; cancel-before-pack → restore; zero → auto-hide; repeat-unavailable → pause + alert. → *Shop inventory + store engine.*

---

## 4. Growth & loyalty loops

- **NearCoins** — earn on every delivered order (₹50 → 1 coin), redeem up to ₹50/order, +5 for rating. Sinks: redemption. Sources: orders, ratings, referrals. → *Cart toggle, profile tier progress.*
- **Streaks** — consecutive-day ordering tracked; visual flame. Cheap retention for a daily-need product. → *Customer home.*
- **Referrals** — `ARYAN-NEAR50` give-₹50/get-₹50 with copy/share. → *Profile.*
- **Coupons** — `NEAR25` (basket builder), `WELCOME50` (activation), `FREESHIP` (threshold training). Views/usage/revenue tracked per offer. → *Cart, shop offers manager.*
- **Sponsored placement** — shops bid for discovery ranking; labeled "Promoted" so trust isn't burned. → *Shop cards, offers page.*
- **Cross-side flywheel** — more shops → wider inventory → more customers → more rider earnings → faster delivery → more shops. The demo makes the loop *visible* because all four sides share one live engine.

---

## 5. Revenue architecture (six streams, one order)

1. Shop commission — 7% (ledger + GST TCS 1% shown line-by-line in Shop → Payouts).
2. Delivery fee — ₹25, free above ₹299 (drives AOV).
3. Shop subscriptions — ₹299–₹999/mo (Phase 2).
4. Sponsored listings + in-app ads (post-density).
5. White-label storefronts — shops run their own WhatsApp commerce on NearKart rails.
6. Data & insights — demand forecasting, category analytics for FMCG partners.

Unit economics per ₹250 basket: platform keeps ₹17.5 commission + delivery share, pays ₹28 rider + ₹6 payment/ops → **₹8.5+ contribution**, positive before batching and ads. The landing page and admin analytics both show this math.

---

## 6. Trust & safety as the product

- **Verification theatre → reality**: PAN/GSTIN/FSSAI/bank checklist in admin queue; "Verified Local Shop" badge everywhere for customers.
- **Evidence chain**: pickup OTP, delivery OTP, photo proof, GPS match, immutable timeline — repeated in customer tracking, rider flow, admin dispute centre.
- **Liability matrix** (admin): shop owns product issues; rider owns proven mishandling; platform covers goodwill (capped); customer owns wrong addresses. Disputes resolve against *evidence*, not whoever shouts loudest.
- **Anti-fraud**: COD risk bands, cancellation-pattern flagging, repeat-abuser blocklist notes, payout hold during disputes.
- **Compliance baked in**: GST TCS line items, FSSAI display, gig-worker social-security accrual in admin riders page, restricted-category exclusion.

---

## 7. Data & moat thesis

The demo's mock data hints at the real asset: every order writes back *inventory truth* for shops that have no software. Over 12 months that becomes:

- **Real-time stock map** of a neighbourhood (nobody has this for kirana India)
- **Demand curves per street** → rider positioning, shop restocking, FMCG distribution
- **Trust graph** — ratings, dispute history, acceptance reliability per node

Dark stores can copy features in a quarter; they cannot copy ten thousand verified neighbourhood nodes + their inventory data + exclusive local trust. That's the moat: **the network is the barrier, the app is just the window.**

---

## 8. Go-to-market — micro-market domination

1. **Pick one PIN code** (Satellite, Ahmedabad). Not a city — a 2 km circle.
2. **Hand-hold 10–20 shops**: owner visits, catalog built *for* them (templates → 100 SKUs in 30 min), WhatsApp support group.
3. **Recruit 10–15 riders** from the same area (they know the lanes; zones map to their daily routes).
4. **Demand ignition without deep discounts**: building WhatsApp groups + society gate QR posters + ₹50 first-order (not 50% off — protects unit economics and price integrity).
5. **Win condition**: 30–50 orders/day, <30 min delivery, <5% cancellation, >95% stock accuracy — *then* clone to the adjacent circle. Density before geography, always.
6. **Wedding-cake expansion**: circle → locality → city → Gujarat → Tier-2 India, where dark stores won't go for years.

---

## 9. Metrics that matter

| North star | Weekly orders per micro-market |
|---|---|
| Liquidity | % orders with rider assigned < 90s |
| Quality | Cancellation rate < 5%, stock accuracy > 95% |
| Economics | Contribution per order > ₹8 by month 6 |
| Retention | 40%+ of customers reorder within 30 days |
| Supply health | Shop 30-day retention > 85%, rider utilization > 70% |
| Trust | Dispute rate < 1.5%, resolution SLA < 24h |

Every one of these is *computable from the demo's data model* — that's deliberate: the prototype isn't a mockup, it's a functioning schema wearing demo clothes.
