// Central store configuration — change prices, colors and checkout links here only.
export const STORE_NAME = "KAYANU";
export const CONTACT_EMAIL = "support@kayanu.com";
// Canonical domain: the Lovable preview (kayanu.lovable.app) points search engines here.
export const SITE_URL = "https://www.kayanu.com";
export const canonicalLink = (path: string) => ({ rel: "canonical", href: `${SITE_URL}${path}` });

export type VariantId = "1-set" | "2-sets";

// Each variant is sold through its own Stripe payment link. Color is picked again on
// the Stripe page ("Set color" dropdown); quantity is fixed to 1 on the 1 Set link and
// adjustable (1–10) on the 2 Sets link, so free shipping always matches the policy.
export const VARIANTS: {
  id: VariantId;
  label: string;
  includes: string;
  price: number;
  compareAt: number;
  checkoutUrl: string;
  badge?: string;
}[] = [
  {
    id: "1-set",
    label: "1 Set",
    includes: "5 compression cubes + 1 drawstring shoe/laundry bag (6 pieces total)",
    price: 34.99,
    compareAt: 44.99,
    checkoutUrl: "https://buy.stripe.com/aFabJ09nMeWR9Br87W3wQ09",
  },
  {
    id: "2-sets",
    label: "2 Sets",
    includes: "10 compression cubes + 2 drawstring shoe/laundry bags (12 pieces total) · Free shipping",
    price: 59.99,
    compareAt: 89.98,
    checkoutUrl: "https://buy.stripe.com/7sYdR8arQ6ql8xnbk83wQ0a",
    badge: "MOST POPULAR",
  },
];

export const COLORS = [
  { id: "sand", label: "Sand (Beige)", swatch: "oklch(0.84 0.04 80)" },
  { id: "charcoal", label: "Charcoal (Black)", swatch: "oklch(0.32 0.01 250)" },
  { id: "ocean-teal", label: "Ocean Teal (Navy)", swatch: "oklch(0.45 0.07 200)" },
  { id: "cloud-gray", label: "Cloud Gray", swatch: "oklch(0.65 0.02 240)" },
  { id: "crimson-red", label: "Crimson Red", swatch: "oklch(0.55 0.20 25)" },
  { id: "sage-green", label: "Sage Green", swatch: "oklch(0.60 0.12 145)" },
  { id: "sky-blue", label: "Sky Blue", swatch: "oklch(0.70 0.10 220)" },
  { id: "blossom-pink", label: "Blossom Pink", swatch: "oklch(0.78 0.10 350)" },
] as const;
export type ColorId = (typeof COLORS)[number]["id"];

// Add-on products (upsells) — each is sold through its own Stripe payment link.
// Note: "Vacuum Bags" and "The Complete Kit" are hidden per store request
// until confirmed suppliers are established.
export type Addon = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  image: string;
  checkoutUrl: string;
  badge?: string;
};
export const ADDONS: Addon[] = [
  {
    id: "toiletry-xl",
    name: "KAYANU Hanging Toiletry Bag — XL",
    tagline:
      "Hangs from any hook — built for cruise cabins and tiny bathrooms with no counter space. Every bottle in its place.",
    price: 24.99,
    image: "https://cf.cjdropshipping.com/20200614/1723440734944.jpg", // Stealth Black
    checkoutUrl: "https://buy.stripe.com/5kQfZg2Zo01X28Z3RG3wQ0b",
    badge: "TRAVEL FAVORITE",
  },
];

// Welcome discount shown on the home page. Leave null until the code exists as an
// active Promotion Code in Stripe (the payment links already accept promotion codes);
// while null, the offer is hidden so the site never promises a code that fails.
export const WELCOME_CODE: string | null = null;

export const SHIPPING_FLAT = 4.95;
export const FREE_SHIPPING_THRESHOLD = 50;

export const getVariant = (id: VariantId) => VARIANTS.find((v) => v.id === id)!;
export const formatPrice = (n: number) => `$${n.toFixed(2)}`;
