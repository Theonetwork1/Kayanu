// Central store configuration — change prices, colors and checkout links here only.
export const STORE_NAME = "KAYANU";
export const CONTACT_EMAIL = "support@kayanu.com";

export type VariantId = "1-set" | "2-sets";

export const VARIANTS: {
  id: VariantId;
  label: string;
  price: number;
  compareAt: number;
  badge?: string;
}[] = [
  { id: "1-set", label: "1 Set", price: 29.99, compareAt: 39.99 },
  { id: "2-sets", label: "2 Sets", price: 49.99, compareAt: 59.98, badge: "MOST POPULAR" },
];

export const COLORS = [
  { id: "charcoal", label: "Charcoal", swatch: "oklch(0.32 0.01 250)" },
  { id: "ocean-teal", label: "Ocean Teal", swatch: "oklch(0.45 0.07 200)" },
  { id: "sand", label: "Sand", swatch: "oklch(0.84 0.04 80)" },
] as const;
export type ColorId = (typeof COLORS)[number]["id"];

// Cart checkout: the whole cart (variants, colors, quantities, shipping) is sent to a
// Stripe Checkout Session created server-side in src/lib/checkout.ts, priced from the
// values above. It needs the STRIPE_SECRET_KEY secret; no payment links are used.

// Add-on products (upsells). They go in the cart like the set and are paid in the
// same Stripe Checkout Session.
export type AddonId = "vacuum-bags" | "toiletry-xl";
export type Addon = {
  id: AddonId;
  name: string;
  tagline: string;
  price: number;
  image: string;
};
export const ADDONS: Addon[] = [
  {
    id: "vacuum-bags",
    name: "Vacuum Travel Bags — 12 Pack",
    tagline:
      "For the bulky stuff cubes can't tame — sweaters, jackets, coats. Roll the air out; no vacuum cleaner needed.",
    price: 19.99,
    image: "https://s.alicdn.com/@sc04/kf/Hf089375455364446bca22cbbd3ee3660q.jpg",
  },
  {
    id: "toiletry-xl",
    name: "Hanging Toiletry Bag — XL",
    tagline:
      "Hangs from any hook — built for cruise cabins and tiny bathrooms with no counter space. Every bottle in its place.",
    price: 24.99,
    image: "https://s.alicdn.com/@sc04/kf/Hae2fe615a8de4e938e76ff78839e06aaf.jpg",
  },
];

// The Complete Kit card adds 1 Set (in the chosen color) + this add-on to the cart.
export const KIT = {
  name: "The Complete Kit — Set + Vacuum Bags",
  tagline:
    "The 8-piece set plus the 12 vacuum bags — together they clear the free-shipping threshold.",
  image: "https://s.alicdn.com/@sc04/kf/H98ada98627f3418784ac2191c9f120b0R.jpg",
  badge: "SHIPS FREE",
  variant: "1-set" as VariantId,
  addon: "vacuum-bags" as AddonId,
};

// Code shown after the email sign-up. It must exist as a Promotion Code in Stripe
// (Products → Coupons) or customers will get "invalid code" at checkout.
export const WELCOME_CODE = "WELCOME10";

export const SHIPPING_FLAT = 4.95;
export const FREE_SHIPPING_THRESHOLD = 49;

export const getVariant = (id: VariantId) => VARIANTS.find((v) => v.id === id)!;
export const getAddon = (id: AddonId) => ADDONS.find((a) => a.id === id)!;
export const formatPrice = (n: number) => `$${n.toFixed(2)}`;
