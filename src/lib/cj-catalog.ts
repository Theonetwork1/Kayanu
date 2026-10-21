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

export const CJ_SET_VIDS: Record<SetColor, string | null> = {
  charcoal: null,
  oceanteal: null,
  sand: null,
};

// Stripe product id → CJ components shipped for one unit of that product.
export const CJ_PRODUCTS: Record<string, { label: string; components: Component[] }> = {
  prod_VTzjI2JA2uorKe: { label: "1 Set", components: [{ kind: "set", qty: 1 }] },
  prod_VTzjxle0Qj1kVQ: { label: "2 Sets", components: [{ kind: "set", qty: 2 }] },
  prod_VTzj7CDzYr5gR2: {
    label: "Vacuum Travel Bags — 12 Pack",
    components: [{ kind: "fixed", vid: null, qty: 1 }],
  },
  prod_VTzjxkKc2C396N: {
    label: "Hanging Toiletry Bag — XL",
    components: [{ kind: "fixed", vid: null, qty: 1 }],
  },
};

// Shipping method name and origin exactly as CJ lists them for these variants (see
// POST /logistic/freightCalculate). To keep the site's 3–8 business-day promise, pick
// variants stocked in a CJ U.S. warehouse and set fromCountryCode to "US".
export const CJ_SHIPPING: { logisticName: string | null; fromCountryCode: string | null } = {
  logisticName: null,
  fromCountryCode: null,
};
