import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Check,
  ShieldCheck,
  Truck,
  Package,
  X,
  Layers,
  Wind,
  Shirt,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { trackPurchase } from "@/lib/meta-pixel";
import { SiteShell, useReveal } from "@/components/Layout";
import {
  ADDONS,
  COLORS,
  SITE_URL,
  VARIANTS,
  WELCOME_CODE,
  canonicalLink,
  formatPrice,
  getVariant,
  type ColorId,
  type VariantId,
} from "@/config";
import type { LucideIcon } from "lucide-react";
import { imageAt, responsiveImage } from "@/lib/images";
export const COLOR_IMAGES: Record<ColorId, string> = {
  sand: "https://cf.cjdropshipping.com/quick/product/950a6309-811c-4153-9968-c00074f91019.jpg", // Beige / Sand (CJYD196103714NM)
  charcoal: "https://cf.cjdropshipping.com/quick/product/9118dbac-738e-4f46-a0b7-48020296dbd8.jpg", // Black / Charcoal (CJYD196103707GT)
  "ocean-teal": "https://cf.cjdropshipping.com/quick/product/7bdc3f77-c082-4293-847c-ebb2fab5cb1f.jpg", // Navy / Ocean Teal (CJYD196103712LO)
  "cloud-gray": "https://cf.cjdropshipping.com/quick/product/2a3984ad-5b1b-4db3-989b-5f03dfaf42cd.jpg", // Gray (CJYD196103709IR)
  "crimson-red": "https://cf.cjdropshipping.com/quick/product/fab60df4-850e-440c-a734-1e8439211055.jpg", // Red (CJYD196103708HS)
  "sage-green": "https://cf.cjdropshipping.com/quick/product/34348907-750a-41e6-bdec-9444e2e93445.jpg", // Green (CJYD196103710JQ)
  "sky-blue": "https://cf.cjdropshipping.com/quick/product/f187d3df-9b61-4730-8d4b-d41734e961ac.jpg", // Sky Blue (CJYD196103711KP)
  "blossom-pink": "https://cf.cjdropshipping.com/quick/product/0fdadc7d-1508-4b9c-bae0-3b9f45d26454.jpg", // Pink (CJYD196103713MN)
};

// High-definition product visuals
const heroImg = "/images/products/kayanu-6pc-suitcase-packed.jpg"; // Real packed suitcase lifestyle
const compressImg = "https://cf.cjdropshipping.com/17159040/2405170951120324600.jpg"; // Step 1 -> Step 2 -> Step 3 60% compression demo
const insideImg = "/images/products/kayanu-6pc-lineup.png"; // All 6 pieces standing together with garment classification icons

const TITLE = "Compression Packing Cubes — 6-Piece Travel Set | KAYANU";
const DESC =
  "Pack twice as much: 5 graduated compression cubes plus a dedicated drawstring shoe/laundry bag (6 pieces total). Fits carry-on and checked luggage. Free U.S. shipping on orders $50+, 30-day returns.";
const PRODUCT_NAME = "KAYANU 6-Piece Compression Packing Cube Set";

const FAQ: [string, string][] = [
  [
    "How long is shipping?",
    "Orders are processed in 1–2 business days, then delivered in 3–8 business days anywhere in the U.S. You'll receive tracking by email as soon as your order ships.",
  ],
  [
    "What's included in the set?",
    "Each set includes 6 pieces: 1 Extra Large cube (for jackets and sweaters), 1 Large cube (for pants and dresses), 1 Medium cube (for shirts), 1 Small cube (for underwear), 1 Slim accessories pouch (for socks and cords), and 1 versatile drawstring shoe/laundry bag.",
  ],
  [
    "Will the set fit a carry-on?",
    "Yes. The graduated sizes fit carry-on and checked luggage — use the smaller cubes for a carry-on and the full set for checked bags.",
  ],
  [
    "How does compression work?",
    "Pack the cube and close the main zipper. Then close the second compression zipper around the edge — it pulls the cube flatter and pushes out the air.",
  ],
  [
    "What if a zipper breaks?",
    "Every zipper is quality-checked before shipping. If one fails, contact us and we'll replace it or refund you.",
  ],
  [
    "What is your return policy?",
    "You have 30 days from delivery to return your order for a full refund.",
  ],
];

// Structured data for Google rich results (price, availability, shipping and returns;
// FAQ). Mirrors the visible page and config.ts: no ratings, nothing invented.
const shippingDetails = (price: number) => ({
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: price >= 50 ? 0 : 4.95, currency: "USD" },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 8, unitCode: "DAY" },
  },
});
const returnPolicy = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "US",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 30,
  returnMethod: "https://schema.org/ReturnByMail",
};
const productLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: PRODUCT_NAME,
  description: DESC,
  brand: { "@type": "Brand", name: "KAYANU" },
  image: [
    heroImg.startsWith("http") ? heroImg : `${SITE_URL}${heroImg}`,
    insideImg.startsWith("http") ? insideImg : `${SITE_URL}${insideImg}`,
    compressImg.startsWith("http") ? compressImg : `${SITE_URL}${compressImg}`,
  ],
  color: COLORS.map((c) => c.label).join(", "),
  offers: VARIANTS.map((v) => ({
    "@type": "Offer",
    name: v.label,
    price: v.price.toFixed(2),
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    url: `${SITE_URL}/#buy`,
    shippingDetails: shippingDetails(v.price),
    hasMerchantReturnPolicy: returnPolicy,
  })),
};
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "product" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: imageAt(heroImg, 1200) },
      { property: "og:image:alt", content: "KAYANU compression packing cubes in an open suitcase" },
      { property: "product:price:amount", content: getVariant("1-set").price.toFixed(2) },
      { property: "product:price:currency", content: "USD" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: imageAt(heroImg, 1200) },
      { "script:ld+json": productLd },
      { "script:ld+json": faqLd },
    ],
    links: [canonicalLink("/")],
  }),
  component: Home,
});

function Accordion({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group border-b py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
        {q}
        <ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" />
      </summary>
      <div className="mt-3 leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">{children}</p>
);

function Home() {
  useReveal();
  const { clearCart } = useCart();
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("order") === "success") {
      setShowOrderSuccess(true);
      clearCart();
      const sessionId = params.get("session_id") || "completed";
      const trackedKey = `kayanu_tracked_${sessionId}`;
      if (!sessionStorage.getItem(trackedKey)) {
        sessionStorage.setItem(trackedKey, "1");
        trackPurchase(39.99, "USD");
      }
    }
  }, [clearCart]);

  return (
    <SiteShell>
      {showOrderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="card-soft relative max-w-md w-full p-6 text-center animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowOrderSuccess(false)}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent">
              <Check className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold">Thank You For Your Order!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your payment has been successfully processed. We've sent a confirmation email with all the details.
            </p>
            <button
              onClick={() => setShowOrderSuccess(false)}
              className="btn-primary mt-6 w-full"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}
      <Hero />
      <Problem />
      <HowItWorks />
      <Inside />
      <Buy />
      <CompleteKit />
      <Comparison />
      <Guarantee />
      <Faq />
      {WELCOME_CODE && <WelcomeOffer code={WELCOME_CODE} />}
      <MobileBuyBar />
    </SiteShell>
  );
}

function Hero() {
  const price = getVariant("1-set").price;
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:py-20">
      {/* No .reveal here: the first screen must paint immediately (LCP, first impression). */}
      <div>
        <p className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-bold tracking-wider text-accent">
          6-PIECE COMPRESSION PACKING CUBES
        </p>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
          Pack twice as much. Stress half as much.
        </h1>
        <p className="mt-5 max-w-lg text-lg text-muted-foreground">
          KAYANU compression cubes squeeze the air out of your clothes with a second zipper, so
          everything fits — and stays organized — in any suitcase.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <a id="hero-cta" href="#buy" className="btn-primary w-full sm:w-auto">
            Get the 6-Piece Set — {formatPrice(price)}
          </a>
          <a
            href="#how-it-works"
            className="inline-block py-3 font-semibold underline underline-offset-4"
          >
            See how it works
          </a>
        </div>
        <ul className="mt-8 flex flex-wrap gap-2 text-sm">
          {(
            [
              [Check, "Quality-checked zippers"],
              [Truck, "Fast U.S. shipping"],
              [ShieldCheck, "30-day guarantee"],
            ] as [LucideIcon, string][]
          ).map(([I, t]) => (
            <li
              key={t}
              className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5"
            >
              <I className="h-4 w-4 text-accent" />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <img
          {...responsiveImage(heroImg, "(min-width: 1152px) 556px, (min-width: 768px) 50vw, 100vw")}
          width={1200}
          height={900}
          fetchPriority="high"
          decoding="async"
          alt="Open suitcase packed with KAYANU compression packing cubes"
          className="aspect-[4/3] w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]"
        />
      </div>
    </section>
  );
}

function Problem() {
  const items = [
    [
      Layers,
      "Overpacking chaos",
      "Everything piled in one heap. KAYANU sorts your clothes by category so you find anything in seconds.",
    ],
    [
      Wind,
      "Wasted space",
      "Air takes up room. The compression zipper squeezes each cube flatter so more fits in the same bag.",
    ],
    [
      Shirt,
      "Wrinkled, messy clothes",
      "Loose clothes shift and crumple. Snug cubes hold folds in place from home to hotel.",
    ],
  ] as const;
  return (
    <section className="bg-secondary py-20">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="reveal mx-auto max-w-2xl text-center text-3xl font-extrabold sm:text-4xl">
          Still sitting on your suitcase to zip it shut?
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map(([I, t, d]) => (
            <div key={t} className="reveal card-soft p-7">
              <I className="h-8 w-8 text-accent" />
              <h3 className="mt-4 text-lg font-bold">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    [
      "Pack each cube by category",
      "Tops in one, bottoms in another, underwear and socks in the small ones.",
    ],
    [
      "Zip the compression zipper",
      "Close the main zipper, then the second one to squeeze out the air.",
    ],
    ["Drop them in and go", "Slide the slim cubes into your suitcase. Done in minutes."],
  ];
  return (
    <section
      id="how-it-works"
      className="mx-auto grid max-w-6xl scroll-mt-28 items-center gap-12 px-5 py-20 md:grid-cols-2"
    >
      <img
        {...responsiveImage(
          compressImg,
          "(min-width: 1152px) 540px, (min-width: 768px) 50vw, 100vw",
        )}
        width={1200}
        height={960}
        loading="lazy"
        decoding="async"
        alt="Zipping the compression zipper on a packing cube"
        className="reveal rounded-3xl object-cover shadow-[var(--shadow-soft)]"
      />
      <div className="reveal">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="text-3xl font-extrabold sm:text-4xl">
          Three steps to a lighter-feeling suitcase
        </h2>
        <ol className="mt-8 space-y-6">
          {steps.map(([t, d], i) => (
            <li key={t} className="flex gap-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div>
                <h3 className="font-bold">{t}</h3>
                <p className="text-muted-foreground">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Inside() {
  const pieces = [
    ["1 × Extra Large cube", "Coats, jackets, heavy sweaters (15.7″ × 15.7″ × 3.5″)"],
    ["1 × Large cube", "Jeans, trousers, dresses (11.8″ × 15.7″ × 3.5″)"],
    ["1 × Medium cube", "Shirts, tops, activewear (9.8″ × 13.7″ × 3.5″)"],
    ["1 × Small cube", "Underwear, bras, swimwear (7.8″ × 11.8″ × 3.5″)"],
    ["1 × Slim accessories pouch", "Socks, charging cables, adapters (13.7″ × 3.9″ × 3.5″)"],
    ["1 × Drawstring bag", "Keeps dirty laundry or shoes separated (18.5″ × 13.7″)"],
  ];
  return (
    <section id="inside" className="scroll-mt-28 bg-secondary py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="reveal text-center">
          <Eyebrow>What's inside the set</Eyebrow>
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            6 pieces: 5 compression cubes + 1 drawstring shoe/laundry bag
          </h2>
        </div>
        <div className="mt-12 grid items-center gap-10 md:grid-cols-2">
          <img
            {...responsiveImage(
              insideImg,
              "(min-width: 1152px) 540px, (min-width: 768px) 50vw, 100vw",
            )}
            width={1200}
            height={1200}
            loading="lazy"
            decoding="async"
            alt="All 6 pieces in the KAYANU compression packing cube set with garment icons"
            className="reveal rounded-3xl shadow-[var(--shadow-soft)] bg-card"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {pieces.map(([t, d]) => (
              <div key={t} className="reveal card-soft p-5">
                <Package className="h-6 w-6 text-accent" />
                <h3 className="mt-3 font-bold">{t}</h3>
                <p className="text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Buy() {
  const { addItem } = useCart();
  const [color, setColor] = useState<ColorId>("charcoal");
  const [variant, setVariant] = useState<VariantId>("2-sets");
  const v = getVariant(variant);
  const colorLabel = COLORS.find((c) => c.id === color)!.label;
  const activeImg = COLOR_IMAGES[color] || flatlayImg;

  const handleAddToCart = () => {
    addItem({
      id: `set-${variant}-${color}`,
      productId: "kayanu-6-piece-compression-set",
      name: `KAYANU 6-Piece Set (${v.label})`,
      variantName: colorLabel,
      price: v.price,
      image: activeImg,
      checkoutUrl: v.checkoutUrl,
    });
  };

  return (
    <section
      id="buy"
      className="mx-auto grid max-w-6xl scroll-mt-28 gap-12 px-5 py-20 md:grid-cols-2"
    >
      <div className="reveal">
        <img
          key={color}
          {...responsiveImage(
            activeImg,
            "(min-width: 1152px) 540px, (min-width: 768px) 50vw, 100vw",
          )}
          width={1200}
          height={1200}
          loading="lazy"
          decoding="async"
          alt={`KAYANU 6-piece compression packing cube set in ${colorLabel}`}
          className="sticky top-28 rounded-3xl shadow-[var(--shadow-lift)] transition-all duration-300"
        />
      </div>
      <div className="reveal">
        <Eyebrow>Shop</Eyebrow>
        <h2 className="text-3xl font-extrabold sm:text-4xl">
          KAYANU 6-Piece Compression Packing Cube Set
        </h2>
        <p className="mt-4 flex items-baseline gap-3">
          <span className="font-display text-3xl font-bold">{formatPrice(v.price)}</span>
          <span className="text-lg text-muted-foreground line-through">
            {formatPrice(v.compareAt)}
          </span>
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
            SAVE {formatPrice(v.compareAt - v.price)}
          </span>
        </p>

        <p className="mt-8 text-sm font-semibold">
          Color: <span className="font-normal text-muted-foreground">{colorLabel}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              aria-label={c.label}
              aria-pressed={color === c.id}
              className={`h-11 w-11 rounded-full border-2 ring-offset-2 ring-offset-background transition ${color === c.id ? "ring-2 ring-primary" : ""}`}
              style={{ background: c.swatch }}
            />
          ))}
        </div>

        <p className="mt-8 text-sm font-semibold">Bundle</p>
        <div className="mt-3 grid gap-3">
          {VARIANTS.map((o) => (
            <button
              key={o.id}
              onClick={() => setVariant(o.id)}
              aria-pressed={variant === o.id}
              className={`relative flex items-center justify-between rounded-2xl border-2 bg-card p-4 text-left transition ${variant === o.id ? "border-primary shadow-[var(--shadow-soft)]" : "border-border"}`}
            >
              {o.badge && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-accent-foreground">
                  {o.badge}
                </span>
              )}
              <span>
                <span className="block font-bold">{o.label}</span>
                <span className="text-sm text-muted-foreground">{o.includes}</span>
              </span>
              <span className="text-right">
                <span className="block font-bold">{formatPrice(o.price)}</span>
                <span className="text-xs text-accent">
                  Save {formatPrice(o.compareAt - o.price)}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Buttons: Add to Cart & Buy Now */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 rounded-full border-2 border-primary bg-card py-3.5 text-sm font-bold text-primary hover:bg-primary/5 transition shadow-xs"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Cart — {formatPrice(v.price)}
          </button>
          <a href={v.checkoutUrl} className="btn-primary flex-1">
            Buy now
          </a>
        </div>

        <div className="mt-3 text-center">
          <Link
            to="/product/$slug"
            params={{ slug: "kayanu-6-piece-compression-set" }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary underline underline-offset-4 hover:opacity-80"
          >
            View full gallery & detailed specifications →
          </Link>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Free shipping on orders of $50 or more. 30-day money-back guarantee.
        </p>

        <ul className="mt-6 space-y-2 text-sm">
          {[
            "FREE shipping on orders $50+ (otherwise $4.95)",
            "Processed in 1–2 business days, delivered in 3–8 days",
            "30-day happiness guarantee — full refund",
            "Quality-checked zippers before shipping",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <Check className="h-5 w-5 shrink-0 text-accent" />
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Accordion q="Materials">
            Lightweight, water-resistant ripstop nylon with smooth double zippers and a carry handle
            on each cube.
          </Accordion>
          <Accordion q="Care">
            Hand wash or machine wash cold on a gentle cycle in a laundry bag. Air dry. Do not iron
            or bleach.
          </Accordion>
          <Accordion q="Dimensions">
            Four graduated sizes designed to fit carry-on and checked luggage. Mix and match to fill
            any suitcase.
          </Accordion>
        </div>

        {/* Highlighted Cross-Sell for the Hanging Toiletry Bag */}
        <div className="mt-8 rounded-2xl border border-primary/25 bg-primary/5 p-4 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <img
              src="https://cf.cjdropshipping.com/20200614/63161490373112.jpg"
              alt="Hanging Toiletry Bag — XL"
              className="h-14 w-14 rounded-xl object-cover border border-border"
            />
            <div>
              <span className="block font-bold text-sm text-foreground">Hanging Toiletry Bag — XL</span>
              <span className="text-xs text-muted-foreground">Waterproof hanging travel organizer • $24.99</span>
            </div>
          </div>
          <a
            href="#toiletry"
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 whitespace-nowrap shadow-sm"
          >
            View bag →
          </a>
        </div>
      </div>
    </section>
  );
}

function CompleteKit() {
  const { addItem } = useCart();
  const toiletryVariants = [
    {
      id: "black",
      name: "Stealth Black",
      sku: "CJBHNSNS16022-Black",
      vid: "096FDDA3-178F-4B3D-AD72-23C77A241455",
      image: "https://cf.cjdropshipping.com/20200614/1723440734944.jpg",
      swatch: "oklch(0.28 0.01 250)",
    },
    {
      id: "grey",
      name: "Classic Grey",
      sku: "CJBHNSNS16022-Grey",
      vid: "42FD7A64-21BB-4269-BAA5-6B94C277D924",
      image: "https://cf.cjdropshipping.com/20200614/63161490373112.jpg",
      swatch: "oklch(0.62 0.02 240)",
    },
    {
      id: "navy",
      name: "Deep Navy",
      sku: "CJBHNSNS16022-Navy",
      vid: "70C3CEC3-7AA3-4262-A15B-C12B81B0CAD8",
      image: "https://cf.cjdropshipping.com/20200614/1651542993816.jpg",
      swatch: "oklch(0.42 0.07 220)",
    },
    {
      id: "wine-red",
      name: "Wine Red",
      sku: "CJBHNSNS16022-Wine Red",
      vid: "6C20B098-7B81-449F-8C73-CB822D2893C2",
      image: "https://cf.cjdropshipping.com/20200614/3222559376202.jpg",
      swatch: "oklch(0.45 0.12 25)",
    },
    {
      id: "purple",
      name: "Plum Purple",
      sku: "CJBHNSNS16022-Purple",
      vid: "58BB1AE1-113A-42B7-86BE-72D39839C582",
      image: "https://cf.cjdropshipping.com/20200614/1496132150298.jpg",
      swatch: "oklch(0.48 0.12 310)",
    },
    {
      id: "sky-blue",
      name: "Sky Blue",
      sku: "CJBHNSNS16022-Sky Blue",
      vid: "F567DE21-CBAD-4E45-B384-15FD325BE27C",
      image: "https://cf.cjdropshipping.com/20200614/66532742498.jpg",
      swatch: "oklch(0.70 0.10 220)",
    },
  ];

  const [selectedToiletryColor, setSelectedToiletryColor] = useState(toiletryVariants[0]);
  const [activeToiletryView, setActiveToiletryView] = useState<"hanging" | "folded">("hanging");
  const hangingOpenImg = "https://cf.cjdropshipping.com/20200614/2445321016976.jpg";

  const handleAddToiletry = () => {
    addItem({
      id: `hanging-toiletry-bag-xl-${selectedToiletryColor.id}`,
      productId: "hanging-toiletry-bag-xl",
      name: "KAYANU Hanging Toiletry Bag — XL",
      variantName: selectedToiletryColor.name,
      price: 24.99,
      image: selectedToiletryColor.image,
      vid: selectedToiletryColor.vid,
      checkoutUrl: "https://buy.stripe.com/5kQfZg2Zo01X28Z3RG3wQ0b",
    });
  };

  const currentToiletryImg = activeToiletryView === "hanging" ? hangingOpenImg : selectedToiletryColor.image;

  return (
    <section id="toiletry" className="scroll-mt-28 py-20 bg-secondary/50">
      <div className="mx-auto max-w-5xl px-5">
        <div className="reveal text-center">
          <Eyebrow>Travel Companion Gear</Eyebrow>
          <h2 className="text-3xl font-extrabold sm:text-4xl">KAYANU Hanging Toiletry Bag — XL</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            The ideal travel partner for your packing cubes. Unfolds and hangs anywhere to keep full-size bottles, grooming gear, and cosmetics leak-free and off cramped hotel countertops.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl bg-card border border-border shadow-[var(--shadow-soft)] grid md:grid-cols-2 items-center">
          {/* Image side with in-use open & folded switcher */}
          <div className="relative aspect-square w-full bg-secondary/40 p-4 flex flex-col justify-between">
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
              <img
                src={currentToiletryImg}
                alt={
                  activeToiletryView === "hanging"
                    ? "KAYANU Hanging Toiletry Bag XL hanging open with toiletries"
                    : `KAYANU Hanging Toiletry Bag XL in ${selectedToiletryColor.name}`
                }
                className="h-full w-full object-cover transition-all duration-300"
              />
              <span className="absolute top-3 left-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground tracking-wider shadow-sm">
                TRAVEL FAVORITE
              </span>
            </div>

            {/* Quick open vs folded preview buttons */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setActiveToiletryView("hanging")}
                className={`flex-1 rounded-lg py-1.5 px-2 text-[11px] font-bold transition border ${
                  activeToiletryView === "hanging"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                Open (Hanging)
              </button>
              <button
                onClick={() => setActiveToiletryView("folded")}
                className={`flex-1 rounded-lg py-1.5 px-2 text-[11px] font-bold transition border ${
                  activeToiletryView === "folded"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                Folded ({selectedToiletryColor.name})
              </button>
            </div>
          </div>

          {/* Details side */}
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              KAYANU Signature Travel Gear
            </span>
            <h3 className="mt-1 text-2xl font-extrabold text-foreground">
              Hanging Toiletry Bag — XL
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              3 dedicated leak-proof & breathable mesh storage zones, 360° swivel metal hanging hook, and water-resistant wipe-clean fabric.
            </p>

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-2xl font-extrabold text-foreground">$24.99</span>
              <span className="text-sm text-muted-foreground line-through">$34.99</span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                In Stock & Ready to Ship
              </span>
            </div>

            {/* Color Swatches */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Selected Color: <span className="text-foreground font-extrabold">{selectedToiletryColor.name}</span>
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2.5">
                {toiletryVariants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedToiletryColor(v)}
                    title={v.name}
                    aria-label={v.name}
                    className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-semibold transition ${
                      selectedToiletryColor.id === v.id
                        ? "border-primary bg-primary/10 text-primary shadow-xs"
                        : "border-border/80 bg-card hover:border-foreground/30 text-foreground"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/20"
                      style={{ background: v.swatch }}
                    />
                    <span>{v.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToiletry}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card py-3 text-xs font-bold text-primary hover:bg-primary/5 transition shadow-xs"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Cart — $24.99
              </button>
              <a
                href="https://buy.stripe.com/5kQfZg2Zo01X28Z3RG3wQ0b"
                className="btn-primary !py-3 !px-5 text-xs font-bold flex-1 text-center"
              >
                Buy now
              </a>
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/product/$slug"
                params={{ slug: "hanging-toiletry-bag-xl" }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary underline underline-offset-4 hover:opacity-85"
              >
                View full product page, 360° hook & gallery →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const rows = [
    ["Space saved", "Compresses clothes with secondary perimeter zipper", "Organizes, no compression", "None"],
    ["Organization", "5 graduated sizes + shoe/laundry bag", "Sorted by cube", "Everything mixed"],
    ["Zipper quality", "Heavy-duty double compression zippers", "Varies", "—"],
    ["Dirty-clothes separation", "Included drawstring shoe/laundry bag", "Rarely included", "Not at all"],
  ];
  return (
    <section className="mx-auto max-w-5xl px-5 py-20">
      <h2 className="reveal text-center text-3xl font-extrabold sm:text-4xl">
        Why compression beats the rest
      </h2>
      <div className="reveal card-soft mt-10 overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-5" />
              <th className="bg-primary p-5 font-display text-primary-foreground">
                KAYANU compression cubes
              </th>
              <th className="p-5 font-display">Regular packing cubes</th>
              <th className="p-5 font-display">No cubes at all</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([r, a, b, c]) => (
              <tr key={r} className="border-b last:border-0">
                <th className="p-5 font-semibold">{r}</th>
                <td className="bg-primary/5 p-5 font-medium">
                  <span className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-accent" />
                    {a}
                  </span>
                </td>
                <td className="p-5 text-muted-foreground">{b}</td>
                <td className="p-5 text-muted-foreground">
                  <span className="flex gap-2">
                    <X className="h-4 w-4 shrink-0" />
                    {c}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Guarantee() {
  return (
    <section className="px-5">
      <div className="reveal mx-auto max-w-5xl rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground">
        <ShieldCheck className="mx-auto h-12 w-12 text-accent" />
        <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">30-Day Happiness Guarantee</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
          Try them on your next trip. If you don't pack lighter, send them back within 30 days for a
          full refund.
        </p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-28 px-5 py-20">
      <h2 className="reveal text-center text-3xl font-extrabold sm:text-4xl">
        Frequently asked questions
      </h2>
      <div className="reveal mt-8">
        {FAQ.map(([q, a]) => (
          <Accordion key={q} q={q}>
            {a}
          </Accordion>
        ))}
      </div>
    </section>
  );
}

// Mobile-only bar that keeps "buy" one tap away once the hero button has scrolled off;
// hidden over the buy section and the footer so it never covers them.
function MobileBuyBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const targets = [
      document.getElementById("hero-cta"),
      document.getElementById("buy"),
      document.querySelector("footer"),
    ].filter((el): el is HTMLElement => el !== null);
    const visible = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) visible.set(e.target, e.isIntersecting);
      setShow(targets.every((t) => !visible.get(t)));
    });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);
  return (
    <div
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 pt-3 backdrop-blur transition-transform duration-300 md:hidden ${show ? "translate-y-0" : "translate-y-full"}`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <a href="#buy" className="btn-primary w-full">
        Shop the set — from {formatPrice(getVariant("1-set").price)}
      </a>
      <p className="mt-1.5 text-center text-xs text-muted-foreground">
        Free U.S. shipping on orders $50+ · 30-day returns
      </p>
    </div>
  );
}

// Shown only when WELCOME_CODE is set in config.ts (the code must exist in Stripe).
function WelcomeOffer({ code }: { code: string }) {
  return (
    <section className="px-5">
      <div className="reveal card-soft mx-auto max-w-3xl p-8 text-center sm:p-12">
        <h2 className="text-2xl font-extrabold sm:text-3xl">10% off your first order</h2>
        <p className="mt-4 text-muted-foreground">
          Enter{" "}
          <span className="rounded-lg bg-accent/15 px-2 py-1 font-mono font-semibold text-accent">
            {code}
          </span>{" "}
          in the promotion code field at checkout.
        </p>
      </div>
    </section>
  );
}
