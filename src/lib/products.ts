// Central store products catalog with rich supplier data from CJ Dropshipping.
// 100% white-label: branded exclusively for KAYANU.

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
    slug: "kayanu-6-piece-compression-set",
    name: "KAYANU 6-Piece Compression Packing Cube Set",
    shortName: "6-Piece Compression Set",
    tagline: "Compress your clothes by up to 60%. Pack twice as much, stress half as much.",
    description:
      "Engineered with a reinforced double-zipper compression system, the KAYANU 6-Piece Set pushes trapped air out of your garments so they lie completely flat. Fits seamlessly in carry-ons, weekenders, and full-sized checked luggage.",
    price: 34.99,
    compareAt: 44.99,
    badge: "BESTSELLER",
    images: [
      "/images/products/kayanu-6pc-lineup.png", // Clean standing 6-piece lineup with garment icons
      "/images/products/kayanu-6pc-suitcase-packed.jpg", // Real suitcase packed with cubes
      "/images/products/kayanu-6pc-fabric-detail.png", // Premium Durable Fabric, water-resistant ripstop nylon
      "/images/products/kayanu-6pc-size-guide.png", // 6 Size combination breakdown & exact dimensions
      "https://cf.cjdropshipping.com/17159040/2405170951120324600.jpg", // Compression demo: Step 1 -> 2 -> 3 saving 60% space
      "https://cf.cjdropshipping.com/quick/product/950a6309-811c-4153-9968-c00074f91019.jpg", // Beige / Sand (CJYD196103714NM)
      "https://cf.cjdropshipping.com/quick/product/9118dbac-738e-4f46-a0b7-48020296dbd8.jpg", // Black / Charcoal (CJYD196103707GT)
      "https://cf.cjdropshipping.com/quick/product/7bdc3f77-c082-4293-847c-ebb2fab5cb1f.jpg", // Navy / Ocean Teal (CJYD196103712LO)
      "https://cf.cjdropshipping.com/quick/product/2a3984ad-5b1b-4db3-989b-5f03dfaf42cd.jpg", // Gray (CJYD196103709IR)
      "https://cf.cjdropshipping.com/quick/product/fab60df4-850e-440c-a734-1e8439211055.jpg", // Red (CJYD196103708HS)
      "https://cf.cjdropshipping.com/quick/product/34348907-750a-41e6-bdec-9444e2e93445.jpg", // Green (CJYD196103710JQ)
      "https://cf.cjdropshipping.com/quick/product/f187d3df-9b61-4730-8d4b-d41734e961ac.jpg", // Sky Blue (CJYD196103711KP)
      "https://cf.cjdropshipping.com/quick/product/0fdadc7d-1508-4b9c-bae0-3b9f45d26454.jpg", // Pink (CJYD196103713MN)
    ],
    variants: [
      {
        id: "sand",
        name: "Sand (Beige)",
        sku: "CJYD196103714NM",
        vid: "1752620058599235584",
        image: "https://cf.cjdropshipping.com/quick/product/950a6309-811c-4153-9968-c00074f91019.jpg",
        price: 34.99,
        compareAt: 44.99,
        colorSwatch: "oklch(0.84 0.04 80)",
      },
      {
        id: "charcoal",
        name: "Charcoal (Black)",
        sku: "CJYD196103707GT",
        vid: "1752620058049781760",
        image: "https://cf.cjdropshipping.com/quick/product/9118dbac-738e-4f46-a0b7-48020296dbd8.jpg",
        price: 34.99,
        compareAt: 44.99,
        colorSwatch: "oklch(0.32 0.01 250)",
      },
      {
        id: "ocean-teal",
        name: "Ocean Teal (Navy)",
        sku: "CJYD196103712LO",
        vid: "1752620058444046336",
        image: "https://cf.cjdropshipping.com/quick/product/7bdc3f77-c082-4293-847c-ebb2fab5cb1f.jpg",
        price: 34.99,
        compareAt: 44.99,
        colorSwatch: "oklch(0.45 0.07 200)",
      },
      {
        id: "cloud-gray",
        name: "Cloud Gray",
        sku: "CJYD196103709IR",
        vid: "1752620058217553920",
        image: "https://cf.cjdropshipping.com/quick/product/2a3984ad-5b1b-4db3-989b-5f03dfaf42cd.jpg",
        price: 34.99,
        compareAt: 44.99,
        colorSwatch: "oklch(0.65 0.02 240)",
      },
      {
        id: "crimson-red",
        name: "Crimson Red",
        sku: "CJYD196103708HS",
        vid: "1752620058142056448",
        image: "https://cf.cjdropshipping.com/quick/product/fab60df4-850e-440c-a734-1e8439211055.jpg",
        price: 34.99,
        compareAt: 44.99,
        colorSwatch: "oklch(0.55 0.20 25)",
      },
      {
        id: "sage-green",
        name: "Sage Green",
        sku: "CJYD196103710JQ",
        vid: "1752620058293051392",
        image: "https://cf.cjdropshipping.com/quick/product/34348907-750a-41e6-bdec-9444e2e93445.jpg",
        price: 34.99,
        compareAt: 44.99,
        colorSwatch: "oklch(0.60 0.12 145)",
      },
      {
        id: "sky-blue",
        name: "Sky Blue",
        sku: "CJYD196103711KP",
        vid: "1752620058368548864",
        image: "https://cf.cjdropshipping.com/quick/product/f187d3df-9b61-4730-8d4b-d41734e961ac.jpg",
        price: 34.99,
        compareAt: 44.99,
        colorSwatch: "oklch(0.70 0.10 220)",
      },
      {
        id: "blossom-pink",
        name: "Blossom Pink",
        sku: "CJYD196103713MN",
        vid: "1752620058519543808",
        image: "https://cf.cjdropshipping.com/quick/product/0fdadc7d-1508-4b9c-bae0-3b9f45d26454.jpg",
        price: 34.99,
        compareAt: 44.99,
        colorSwatch: "oklch(0.78 0.10 350)",
      },
    ],
    defaultCheckoutUrl: "https://buy.stripe.com/aFabJ09nMeWR9Br87W3wQ09",
    features: [
      "Secondary perimeter compression zipper removes up to 60% of excess air volume",
      "Water-repellent tear-resistant woven nylon with breathable diamond mesh panels",
      "Visual garment icons (Jackets, Pants, Shirts, Underwear, Socks) for effortless packing",
      "Sturdy webbed carry handle on each cube for fast packing & unpacking",
    ],
    specs: [
      { label: "Material", value: "Water-repellent tear-resistant woven nylon & breathable mesh" },
      { label: "Zippers", value: "Heavy-duty double reinforced perimeter compression zippers" },
      { label: "Compatibility", value: "Carry-on & checked suitcases (20″–30″), duffels & backpacks" },
      { label: "Care", value: "Wipe clean with a damp cloth or hand wash cold, air dry" },
    ],
    includes: [
      "1 × Extra Large Cube (15.7″ × 15.7″ × 3.5″ / 40 × 40 × 9 cm) — Coats, jackets & sweaters",
      "1 × Large Cube (11.8″ × 15.7″ × 3.5″ / 30 × 40 × 9 cm) — Jeans, pants & dresses",
      "1 × Medium Cube (9.8″ × 13.7″ × 3.5″ / 25 × 35 × 9 cm) — Shirts, tops & activewear",
      "1 × Small Cube (7.8″ × 11.8″ × 3.5″ / 20 × 30 × 9 cm) — Underwear, bras & swimwear",
      "1 × Slim Accessories Pouch (13.7″ × 3.9″ × 3.5″ / 35 × 10 × 9 cm) — Socks, cables & adapters",
      "1 × Drawstring Bag (18.5″ × 13.7″ / 47 × 35 cm) — Dedicated shoe or laundry bag",
    ],
  },
  {
    slug: "hanging-toiletry-bag-xl",
    name: "KAYANU Hanging Toiletry Bag — XL",
    shortName: "Hanging Toiletry Bag XL",
    tagline: "Water-resistant multi-compartment travel organizer designed to hang from any hook or door.",
    description:
      "Tired of cluttered hotel and cruise ship bathroom counters? The KAYANU XL Hanging Toiletry Bag unfolds to reveal 3 distinct organized zones with an upper leak-proof PVC compartment, breathable mesh pockets, and a deep main storage area to keep full-size bottles upright and spill-free.",
    price: 24.99,
    compareAt: 34.99,
    badge: "TRAVEL FAVORITE",
    images: [
      "https://cf.cjdropshipping.com/20200614/2445321016976.jpg", // Real hanging open view in bathroom with toiletries
      "https://cf.cjdropshipping.com/16367616/1636823812176.jpg", // Open close-up: upper transparent leak-proof PVC pocket
      "https://cf.cjdropshipping.com/20200614/723454966257.jpg", // Packed travel situation view
      "https://cf.cjdropshipping.com/8f66f8ba-41a5-44eb-b060-1092dd3c0258.jpg", // Closed view in bathroom setting
      "https://cf.cjdropshipping.com/20200614/1723440734944.jpg", // Stealth Black (CJBHNSNS16022-Black)
      "https://cf.cjdropshipping.com/20200614/63161490373112.jpg", // Classic Grey (CJBHNSNS16022-Grey)
      "https://cf.cjdropshipping.com/20200614/1651542993816.jpg", // Deep Navy (CJBHNSNS16022-Navy)
      "https://cf.cjdropshipping.com/20200614/3222559376202.jpg", // Wine Red (CJBHNSNS16022-Wine Red)
      "https://cf.cjdropshipping.com/20200614/1496132150298.jpg", // Plum Purple (CJBHNSNS16022-Purple)
      "https://cf.cjdropshipping.com/20200614/66532742498.jpg", // Sky Blue (CJBHNSNS16022-Sky Blue)
    ],
    variants: [
      {
        id: "black",
        name: "Stealth Black",
        sku: "CJBHNSNS16022-Black",
        vid: "096FDDA3-178F-4B3D-AD72-23C77A241455",
        image: "https://cf.cjdropshipping.com/20200614/1723440734944.jpg",
        price: 24.99,
        compareAt: 34.99,
        colorSwatch: "oklch(0.28 0.01 250)",
      },
      {
        id: "grey",
        name: "Classic Grey",
        sku: "CJBHNSNS16022-Grey",
        vid: "42FD7A64-21BB-4269-BAA5-6B94C277D924",
        image: "https://cf.cjdropshipping.com/20200614/63161490373112.jpg",
        price: 24.99,
        compareAt: 34.99,
        colorSwatch: "oklch(0.62 0.02 240)",
      },
      {
        id: "navy",
        name: "Deep Navy",
        sku: "CJBHNSNS16022-Navy",
        vid: "70C3CEC3-7AA3-4262-A15B-C12B81B0CAD8",
        image: "https://cf.cjdropshipping.com/20200614/1651542993816.jpg",
        price: 24.99,
        compareAt: 34.99,
        colorSwatch: "oklch(0.42 0.07 220)",
      },
      {
        id: "wine-red",
        name: "Wine Red",
        sku: "CJBHNSNS16022-Wine Red",
        vid: "6C20B098-7B81-449F-8C73-CB822D2893C2",
        image: "https://cf.cjdropshipping.com/20200614/3222559376202.jpg",
        price: 24.99,
        compareAt: 34.99,
        colorSwatch: "oklch(0.45 0.12 25)",
      },
      {
        id: "purple",
        name: "Plum Purple",
        sku: "CJBHNSNS16022-Purple",
        vid: "58BB1AE1-113A-42B7-86BE-72D39839C582",
        image: "https://cf.cjdropshipping.com/20200614/1496132150298.jpg",
        price: 24.99,
        compareAt: 34.99,
        colorSwatch: "oklch(0.48 0.12 310)",
      },
      {
        id: "sky-blue",
        name: "Sky Blue",
        sku: "CJBHNSNS16022-Sky Blue",
        vid: "F567DE21-CBAD-4E45-B384-15FD325BE27C",
        image: "https://cf.cjdropshipping.com/20200614/66532742498.jpg",
        price: 24.99,
        compareAt: 34.99,
        colorSwatch: "oklch(0.70 0.10 220)",
      },
    ],
    defaultCheckoutUrl: "https://buy.stripe.com/5kQfZg2Zo01X28Z3RG3wQ0b",
    features: [
      "Sturdy 360° swivel metal hook hangs securely on towel racks, doors, or shower rods",
      "Upper leak-proof transparent PVC compartment keeps toothbrushes, paste & liquids sealed",
      "Dual middle breathable mesh pockets store grooming tools, cosmetics & accessories",
      "Deep main zippered mesh compartment keeps full-size bottles upright & secure",
      "Quick dual-action Velcro fold-over closure for easy packing",
    ],
    specs: [
      { label: "Dimensions (Closed)", value: "9.8″ × 7.1″ × 3.9″ (25 × 18 × 10 cm)" },
      { label: "Dimensions (Open)", value: "9.8″ × 28.7″ (25 × 73 cm)" },
      { label: "Material", value: "Water-resistant cationic Oxford polyester with soft handle" },
      { label: "Hook", value: "360-degree Heavy Duty Steel Swivel Hook" },
      { label: "Closure", value: "Quick dual-action Velcro fold-over closure" },
    ],
    includes: [
      "1 × XL Multi-Compartment Hanging Toiletry Bag",
      "1 × Upper leak-proof transparent PVC zippered pocket",
      "2 × Middle breathable mesh drop-in pockets",
      "1 × Lower deep zippered main mesh compartment",
    ],
  },
  // Note: "Vacuum Travel Bags — 12 Pack" and "Complete Kit" are temporarily hidden
  // per store request until reliable suppliers are confirmed.
];

export function getProductBySlug(slug: string): StoreProduct | undefined {
  if (slug === "kayanu-8-piece-compression-set") {
    return PRODUCTS.find((p) => p.slug === "kayanu-6-piece-compression-set");
  }
  return PRODUCTS.find((p) => p.slug === slug);
}
