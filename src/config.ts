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

// Stripe payment links, one per variant. Replace "#" with real URLs.
export const CHECKOUT_URLS: Record<VariantId, string> = {
  "1-set": "#",
  "2-sets": "#",
};

export const SHIPPING_FLAT = 4.95;
export const FREE_SHIPPING_THRESHOLD = 49;

export const getVariant = (id: VariantId) => VARIANTS.find((v) => v.id === id)!;
export const formatPrice = (n: number) => `$${n.toFixed(2)}`;
