// Maps what Stripe sells (payment-link products) to what CJdropshipping ships.
// Fill in the CJ variant ids ("vid", from CJ → My Products, or GET /product/variant/query)
// and the shipping method before turning sandbox off. Not secret: safe to commit.
//
// While a vid or the shipping method is null, paid orders are not sent to CJ: the owner
// gets an email asking to place that order manually.

// Set color values sent by the Stripe "Set color" dropdown (custom field key "color").
export type SetColor =
  | "charcoal"
  | "oceanteal"
  | "sand"
  | "cloudgray"
  | "crimsonred"
  | "sagegreen"
  | "skyblue"
  | "blossompink";

type Component =
  // One CJ variant per set color.
  | { kind: "set"; qty: number }
  // A single CJ variant (no color).
  | { kind: "fixed"; vid: string | null; qty: number };

// Selected with the CJ catalog (2026-10-21).
// Set: "Travel Can Be Compression Storage Bag Suit With Shoe Bag Mesh Visual Luggage Organizing"
// SKU CJYD1961037, pid 1752620057236086784.
export const CJ_SET_VIDS: Record<SetColor, string | null> = {
  sand: "1752620058599235584", // Beige Six Piece Set (CJYD196103714NM)
  charcoal: "1752620058049781760", // Black Six Piece Set (CJYD196103707GT)
  oceanteal: "1752620058444046336", // Navy Blue Six Piece Set (CJYD196103712LO)
  cloudgray: "1752620058217553920", // Gray Six Piece Set (CJYD196103709IR)
  crimsonred: "1752620058142056448", // Red Six Piece Set (CJYD196103708HS)
  sagegreen: "1752620058293051392", // Green Six Piece Set (CJYD196103710JQ)
  skyblue: "1752620058368548864", // Sky Blue Six Piece Set (CJYD196103711KP)
  blossompink: "1752620058519543808", // Pink Six Piece Set (CJYD196103713MN)
};

// Stripe product id → CJ components shipped for one unit of that product.
export const CJ_PRODUCTS: Record<string, { label: string; components: Component[] }> = {
  prod_VTzjI2JA2uorKe: { label: "1 Set", components: [{ kind: "set", qty: 1 }] },
  prod_VTzjxle0Qj1kVQ: { label: "2 Sets", components: [{ kind: "set", qty: 2 }] },
  // "Travel Sized Roll Up Compression Bag" — CJYD3095685, pid 2608260124491616700: pump-free
  // roll-up bags sold one by one (CJ's 12-bag sets include an electric pump, which makes
  // them "battery" goods and doubles shipping). 4 + 4 + 4 sizes = the advertised 12 pack,
  // $4.80 and ~750 g in total.
  prod_VTzj7CDzYr5gR2: {
    label: "Vacuum Travel Bags — 12 Pack",
    components: [
      { kind: "fixed", vid: "2608260124491617600", qty: 4 }, // 35×50 cm
      { kind: "fixed", vid: "2608260124491617602", qty: 4 }, // 40×60 cm
      { kind: "fixed", vid: "2608260124491617603", qty: 4 }, // 50×70 cm
    ],
  },
  // "Multi function storage bag" — CJBHNSNS16022, Grey variant (CJBHNSNS16022-Grey).
  prod_VTzjxkKc2C396N: {
    label: "Hanging Toiletry Bag — XL",
    components: [{ kind: "fixed", vid: "42FD7A64-21BB-4269-BAA5-6B94C277D924", qty: 1 }],
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
