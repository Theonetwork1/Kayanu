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
    includes: "8 cubes + shoe pouch + laundry bag",
    price: 29.99,
    compareAt: 39.99,
    checkoutUrl: "https://buy.stripe.com/dRm5kC57waGBcND87W3wQ00",
  },
  {
    id: "2-sets",
    label: "2 Sets",
    includes: "16 cubes + 2 shoe pouches + 2 laundry bags · Free shipping",
    price: 49.99,
    compareAt: 59.98,
    checkoutUrl: "https://buy.stripe.com/cNi28qgQe9Cx8xnag43wQ01",
    badge: "MOST POPULAR",
  },
];

export const COLORS = [
  { id: "charcoal", label: "Charcoal", swatch: "oklch(0.32 0.01 250)" },
  { id: "ocean-teal", label: "Ocean Teal", swatch: "oklch(0.45 0.07 200)" },
  { id: "sand", label: "Sand", swatch: "oklch(0.84 0.04 80)" },
] as const;
export type ColorId = (typeof COLORS)[number]["id"];

// Add-on products (upsells) — each is sold through its own Stripe payment link.
// The kit link checks out the 1 Set + the vacuum bags in a single payment, with free
// shipping and a set-color dropdown.
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
    id: "kit-set-vacuum",
    name: "The Complete Kit — Set + Vacuum Bags",
    tagline:
      "The 8-piece set plus the 12 vacuum bags in one checkout — and at $49.98 it ships free.",
    price: 49.98,
    image: "https://s.alicdn.com/@sc04/kf/H98ada98627f3418784ac2191c9f120b0R.jpg",
    checkoutUrl: "https://buy.stripe.com/00w5kCczY6qlbJz0Fu3wQ04",
    badge: "SHIPS FREE",
  },
  {
    id: "vacuum-bags",
    name: "Vacuum Travel Bags — 12 Pack",
    tagline:
      "For the bulky stuff cubes can't tame — sweaters, jackets, coats. Roll the air out; no vacuum cleaner needed.",
    price: 19.99,
    image: "https://s.alicdn.com/@sc04/kf/Hf089375455364446bca22cbbd3ee3660q.jpg",
    checkoutUrl: "https://buy.stripe.com/00w4gyfMa7up4h74VK3wQ02",
  },
  {
    id: "toiletry-xl",
    name: "Hanging Toiletry Bag — XL",
    tagline:
      "Hangs from any hook — built for cruise cabins and tiny bathrooms with no counter space. Every bottle in its place.",
    price: 24.99,
    image: "https://s.alicdn.com/@sc04/kf/Hae2fe615a8de4e938e76ff78839e06aaf.jpg",
    checkoutUrl: "https://buy.stripe.com/3cI8wO57wdSNaFv1Jy3wQ03",
  },
];

// Welcome discount shown on the home page. Leave null until the code exists as an
// active Promotion Code in Stripe (the payment links already accept promotion codes);
// while null, the offer is hidden so the site never promises a code that fails.
export const WELCOME_CODE: string | null = null;

export const SHIPPING_FLAT = 4.95;
export const FREE_SHIPPING_THRESHOLD = 49;

export const getVariant = (id: VariantId) => VARIANTS.find((v) => v.id === id)!;
export const formatPrice = (n: number) => `$${n.toFixed(2)}`;
