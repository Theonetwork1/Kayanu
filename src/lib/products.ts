// Central store products catalog.
// 100% white-label: branded exclusively for KAYANU.
//
// IMAGES ARE TEMPORARY HOTLINKS (supplier/store photos, verified loading
// 2026-11-07) — replace with the real CJ supplier photos once Theo sends the
// CJ listing links from his logged-in account. The GitHub connector cannot
// push binary files, so local product photos must be uploaded another way.
// - Blender: advertise soft-fruit smoothies & protein shakes. Do NOT promise
//   ice/frozen-fruit crushing and do NOT quote cups-per-charge — battery life
//   is the #1 complaint in this category, even on the best models.
// - Espresso: ~4 shots per charge on COLD water (more with hot water). One
//   shot = 50 ml. Ground coffee + Nespresso Original capsules ONLY (Vertuo
//   NOT supported). Never quote "50+/150 cups" headline figures.
// - Never source a BlendJet-style blender (4.5M-unit recall, Jan 2024) or a
//   WONDER FAMILY espresso maker (3.7/5, units dying after a few uses).

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  vid: string;
  image: string;
  price: number;
  compareAt?: number;
  colorSwatch?: string;
};

export type StoreProduct = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  price: number;
  compareAt: number;
  badge?: string;
  images: string[];
  variants: ProductVariant[];
  defaultCheckoutUrl: string;
  features: string[];
  specs: { label: string; value: string }[];
  includes: string[];
};

export const PRODUCTS: StoreProduct[] = [
  {
    slug: "kayanu-portable-blender",
    name: "KAYANU Portable Blender — USB-C",
    shortName: "Portable Blender",
    tagline: "Smoothies & protein shakes anywhere, in about 30 seconds.",
    description:
      "A pocket-size blender that turns soft fruit, milk and protein powder into a smooth drink wherever you are — gym, office, car or trail. Six stainless-steel blades, USB-C rechargeable, 350 ml. Built for soft fruit and shakes: charge fully before first use and don't overfill.",
    price: 29.99,
    compareAt: 39.99,
    badge: "NEW",
    images: [
      "https://shopnpic.com/cdn/shop/files/IMG_8566_1.png?v=1785131970", // TEMPORARY hotlink — pink 350 ml 6-blade bottle, clean shot; replace with CJ photo
    ],
    variants: [
      {
        id: "standard",
        name: "Standard",
        sku: "",
        vid: "",
        image: "https://shopnpic.com/cdn/shop/files/IMG_8566_1.png?v=1785131970",
        price: 29.99,
        compareAt: 39.99,
      },
    ],
    defaultCheckoutUrl: "",
    features: [
      "6 stainless-steel blades for smooth blends",
      "USB-C rechargeable — charge from a laptop, power bank or car",
      "350 ml single-serve cup with leak-proof lid & carry strap",
      "One-button blend, easy to rinse clean",
      "Lightweight (~500 g) — fits a bag or cup holder",
    ],
    specs: [
      { label: "Capacity", value: "350 ml (12 oz)" },
      { label: "Power", value: "USB-C rechargeable" },
      { label: "Blades", value: "6 × stainless steel" },
      { label: "Weight", value: "~500 g" },
      { label: "Best for", value: "Soft fruit, protein shakes, smoothies" },
    ],
    includes: [
      "1 × Portable Blender",
      "1 × USB-C charging cable",
      "1 × Quick-start guide",
    ],
  },
  {
    slug: "kayanu-portable-espresso-maker",
    name: "KAYANU Portable Espresso Maker — 20-Bar",
    shortName: "Portable Espresso Maker",
    tagline: "Real espresso with rich crema — anywhere. No café, no outlet.",
    description:
      "A 20-bar self-heating espresso maker that brews a real shot with crema from cold water, ground coffee or Original capsules — in the car, at camp, at the office. One charge brews about 4 shots on cold water (more with hot water). One shot = 50 ml.",
    price: 49.99,
    compareAt: 59.99,
    badge: "NEW",
    images: [
      "https://m.media-amazon.com/images/I/61WVkvds34L.jpg_BO30,255,255,255_UF750,750_SR1910,1000,0,C_QL100_.jpg", // TEMPORARY hotlink — 20-bar unit with ground + capsule adapters, pouring; replace with CJ photo
      "https://www.bubblitz.com/cdn/shop/files/1_1.png?v=1776510373", // TEMPORARY hotlink — matte-black unit with crema cup; replace with CJ photo
    ],
    variants: [
      {
        id: "standard",
        name: "Standard",
        sku: "",
        vid: "",
        image: "https://m.media-amazon.com/images/I/61WVkvds34L.jpg_BO30,255,255,255_UF750,750_SR1910,1000,0,C_QL100_.jpg",
        price: 49.99,
        compareAt: 59.99,
      },
    ],
    defaultCheckoutUrl: "",
    features: [
      "20-bar pressure for a rich, creamy crema",
      "Self-heating — cold water to ~194°F (90°C) in about 5 minutes",
      "Ground coffee + Nespresso Original capsules (not Vertuo)",
      "USB-C rechargeable — about 4 shots per charge on cold water",
      "Compact (~680 g) — fits a bag or cup holder",
    ],
    specs: [
      { label: "Pressure", value: "20-bar" },
      { label: "Heating", value: "Self-heating, ~194°F (90°C) in ~5 min" },
      { label: "Battery", value: "7500 mAh, USB-C rechargeable" },
      { label: "Tank", value: "80 ml (one shot ≈ 50 ml)" },
      { label: "Compatibility", value: "Ground coffee + Nespresso Original capsules (Vertuo not supported)" },
      { label: "Weight", value: "~680 g" },
    ],
    includes: [
      "1 × Portable Espresso Maker",
      "1 × Ground-coffee adapter",
      "1 × Capsule adapter (Original)",
      "1 × USB-C charging cable",
      "1 × Quick-start guide",
    ],
  },
];

export function getProductBySlug(slug: string): StoreProduct | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
