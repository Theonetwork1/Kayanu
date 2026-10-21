// Maps what Stripe sells (payment-link products) to what CJdropshipping ships.
// Fill in the CJ variant ids ("vid", from CJ → My Products, or GET /product/variant/query)
// and the shipping method before turning sandbox off. Not secret: safe to commit.
//
// While a vid or the shipping method is null, paid orders are not sent to CJ: the owner
// gets an email asking to place that order manually.

// Set color values sent by the Stripe "Set color" dropdown (custom field key "color").
export type SetColor = "charcoal" | "oceanteal" | "sand";

type Component =
  // One CJ variant per set color.
  | { kind: "set"; qty: number }
  // A single CJ variant (no color).
  | { kind: "fixed"; vid: string | null; qty: number };

// Selected with the CJ catalog (2026-10-21). CJ has no matching compression set in its U.S.
// warehouse, so everything ships from China: a CJ order has a single origin, and the
// Complete Kit (set + vacuum bags) must leave from one warehouse.
//
// Set: "Compressible Travel Storage Bags Set" — CJYD2790879, pid 2603171149031616200,
// "8pc Set" variants ($4.44, 410 g). Order a sample first: CJ lists 8 pieces in total,
// while the site describes 8 cubes + shoe pouch + laundry bag.
export const CJ_SET_VIDS: Record<SetColor, string | null> = {
  charcoal: "2603171149031618600", // Gray 8pc Set
  oceanteal: "2603171149031618900", // Blue 8pc Set
  sand: "2603171149031617900", // Beige 8pc Set
};

// Stripe product id → CJ components shipped for one unit of that product.
export const CJ_PRODUCTS: Record<string, { label: string; components: Component[] }> = {
  prod_VTzjI2JA2uorKe: { label: "1 Set", components: [{ kind: "set", qty: 1 }] },
  prod_VTzjxle0Qj1kVQ: { label: "2 Sets", components: [{ kind: "set", qty: 2 }] },
  // "Travel Sized Roll Up Compression Bag" — CJYD3095685, pid 2608260124491616700: pump-free
  // roll-up bags sold one by one (CJ's 12-bag sets include an electric pump, which makes
  // them "battery" goods and doubles shipping). 4 + 4 + 4 sizes = the advertised 12 pack,
  // $4.80 and ~750 g in total. New on CJ (no other store lists it yet): sample it first.
  prod_VTzj7CDzYr5gR2: {
    label: "Vacuum Travel Bags — 12 Pack",
    components: [
      { kind: "fixed", vid: "2608260124491617600", qty: 4 }, // 35×50 cm
      { kind: "fixed", vid: "2608260124491617602", qty: 4 }, // 40×60 cm
      { kind: "fixed", vid: "2608260124491617603", qty: 4 }, // 50×70 cm
    ],
  },
  // "Travel Hanging Toiletry Bag … Large Makeup Bag" — CJCZ2111531, Gray ($11.02, 200 g).
  prod_VTzjxkKc2C396N: {
    label: "Hanging Toiletry Bag — XL",
    components: [{ kind: "fixed", vid: "1824032070281613313", qty: 1 }],
  },
};

// Shipping method name and origin exactly as CJ lists them (see get_logistics_timeliness /
// POST /logistic/freightCalculate). YunExpress Ordinary: 4–7 days China → U.S., about
// $10.83 for one set, $16.48 for two, $22.28 for the Complete Kit. Cheaper but slower:
// "CJPacket Ordinary" (4–9 days). Note it requires a 5-digit ZIP and a house number.
export const CJ_SHIPPING: { logisticName: string | null; fromCountryCode: string | null } = {
  logisticName: "YunExpress Ordinary",
  fromCountryCode: "CN",
};
