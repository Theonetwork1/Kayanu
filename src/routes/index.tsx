import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Check,
  ShieldCheck,
  Truck,
  Coffee,
  CupSoda,
  Zap,
  ChevronDown,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { trackPurchase, getLastCheckoutTotal } from "@/lib/meta-pixel";
import { SiteShell, useReveal } from "@/components/Layout";
import {
  SITE_URL,
  WELCOME_CODE,
  canonicalLink,
  formatPrice,
} from "@/config";
import { PRODUCTS, type StoreProduct } from "@/lib/products";
import type { LucideIcon } from "lucide-react";
import { imageAt, responsiveImage } from "@/lib/images";

const blender = PRODUCTS.find((p) => p.slug === "kayanu-portable-blender")!;
const espresso = PRODUCTS.find((p) => p.slug === "kayanu-portable-espresso-maker")!;

const TITLE = "Portable Blender & Espresso Maker | KAYANU — Take It Anywhere";
const DESC =
  "KAYANU portable USB-C blender and 20-bar self-heating espresso maker. Smoothies and real espresso anywhere — gym, office, car or trail. Free U.S. shipping on orders $50+, 30-day returns.";

const FAQ: [string, string][] = [
  [
    "How long is shipping?",
    "Orders are processed in 1–2 business days, then delivered in 3–8 business days anywhere in the U.S. You'll receive tracking by email as soon as your order ships.",
  ],
  [
    "How many smoothies can the blender make per charge?",
    "It varies with the fruit and the load. Charge it fully before first use, use soft fruit with enough liquid, and don't overfill — overfilling strains the motor.",
  ],
  [
    "Can the blender crush ice?",
    "It's built for soft fruit, shakes and smoothies. It can handle a few small ice cubes with enough liquid, but heavy frozen fruit and big ice cubes are not what it's made for.",
  ],
  [
    "How many espressos per charge?",
    "About 4 shots on cold water. Use hot water and you'll get many more — the heater is what uses the battery. One shot is 50 ml.",
  ],
  [
    "Does the espresso maker work with Vertuo capsules?",
    "No — ground coffee and Nespresso Original capsules only. Vertuo capsules are not supported.",
  ],
  [
    "What if something stops working?",
    "Every unit is covered by the 30-day happiness guarantee. If it fails, contact us and we'll replace it or refund you.",
  ],
  [
    "What is your return policy?",
    "You have 30 days from delivery to return your order for a full refund.",
  ],
];

// Structured data for Google rich results (price, availability, shipping and returns;
// FAQ). Mirrors the visible page and products.ts: no ratings, nothing invented.
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
const productLd = [blender, espresso].map((p) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: p.name,
  description: p.description,
  brand: { "@type": "Brand", name: "KAYANU" },
  image: p.images.map((img) => (img.startsWith("http") ? img : `${SITE_URL}${img}`)),
  offers: {
    "@type": "Offer",
    name: p.shortName,
    price: p.price.toFixed(2),
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    url: `${SITE_URL}/product/${p.slug}`,
    shippingDetails: shippingDetails(p.price),
    hasMerchantReturnPolicy: returnPolicy,
  },
}));
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
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: imageAt(espresso.images[0]!, 1200) },
      { property: "og:image:alt", content: "KAYANU portable espresso maker brewing a shot with crema" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: imageAt(espresso.images[0]!, 1200) },
      ...productLd.map((p) => ({ "script:ld+json": p }) as any),
      { "script:ld+json": faqLd } as any,
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
        trackPurchase(getLastCheckoutTotal(), "USD");
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
      <ProductSection product={blender} id="blender" howItWorks={[
        ["Add soft fruit + liquid", "Fruit, milk or water — fill to the line, don't overfill."],
        ["Press the button", "One press blends it smooth in about 30 seconds."],
        ["Drink anywhere", "Screw the lid on and go — gym, office, car or trail."],
      ]} />
      <ProductSection product={espresso} id="espresso" howItWorks={[
        ["Add water + coffee", "Cold water in the tank, ground coffee or an Original capsule."],
        ["Press the button", "It heats the water and brews under 20-bar pressure."],
        ["Espresso with crema", "A real shot in about 5 minutes — no café, no outlet."],
      ]} />
      <Comparison />
      <Guarantee />
      <Faq />
      {WELCOME_CODE && <WelcomeOffer code={WELCOME_CODE} />}
      <MobileBuyBar />
    </SiteShell>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:py-20">
      {/* No .reveal here: the first screen must paint immediately (LCP, first impression). */}
      <div>
        <p className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-bold tracking-wider text-accent">
          PORTABLE BLENDER + ESPRESSO MAKER
        </p>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
          Your smoothie. Your espresso. Anywhere.
        </h1>
        <p className="mt-5 max-w-lg text-lg text-muted-foreground">
          Two pocket-size essentials that replace the $5 café stop: a USB-C blender for
          smoothies and shakes, and a 20-bar self-heating espresso maker with real crema.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <a id="hero-cta" href="#blender" className="btn-primary w-full sm:w-auto">
            Shop the Blender — {formatPrice(blender.price)}
          </a>
          <a
            href="#espresso"
            className="inline-block py-3 font-semibold underline underline-offset-4"
          >
            See the Espresso Maker — {formatPrice(espresso.price)}
          </a>
        </div>
        <ul className="mt-8 flex flex-wrap gap-2 text-sm">
          {(
            [
              [Zap, "USB-C rechargeable"],
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
      <div className="grid gap-4 sm:grid-cols-2">
        <a href="#blender" className="group block overflow-hidden rounded-3xl shadow-[var(--shadow-lift)]">
          <img
            {...responsiveImage(blender.images[0]!, "(min-width: 768px) 25vw, 100vw")}
            width={800}
            height={800}
            fetchPriority="high"
            decoding="async"
            alt="KAYANU portable blender with fresh smoothie"
            className="aspect-square w-full object-cover transition group-hover:scale-105"
          />
          <p className="bg-card px-4 py-3 text-sm font-bold">
            Portable Blender — {formatPrice(blender.price)}
          </p>
        </a>
        <a href="#espresso" className="group block overflow-hidden rounded-3xl shadow-[var(--shadow-lift)]">
          <img
            {...responsiveImage(espresso.images[0]!, "(min-width: 768px) 25vw, 100vw")}
            width={1200}
            height={630}
            fetchPriority="high"
            decoding="async"
            alt="KAYANU portable espresso maker brewing a shot with crema"
            className="aspect-square w-full object-cover transition group-hover:scale-105"
          />
          <p className="bg-card px-4 py-3 text-sm font-bold">
            Portable Espresso Maker — {formatPrice(espresso.price)}
          </p>
        </a>
      </div>
    </section>
  );
}

function Problem() {
  const items = [
    [
      Coffee,
      "Café prices add up",
      "$5–$7 a day for coffee and smoothies is $150+ a month. Make it yourself, anywhere, for under a dollar a drink.",
    ],
    [
      CupSoda,
      "No healthy option on the go",
      "Between meetings, workouts and road trips, the only options are vending machines and drive-thrus.",
    ],
    [
      Zap,
      "Big gadgets stay home",
      "Full-size blenders and espresso machines never leave the kitchen. These two fit in a bag and charge over USB-C.",
    ],
  ] as const;
  return (
    <section className="bg-secondary py-20">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="reveal mx-auto max-w-2xl text-center text-3xl font-extrabold sm:text-4xl">
          Why carry the café with you?
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

function ProductSection({
  product,
  id,
  howItWorks,
}: {
  product: StoreProduct;
  id: string;
  howItWorks: [string, string][];
}) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const variant = product.variants[0]!;

  const handleAddToCart = () => {
    addItem(
      {
        id: `${product.slug}-${variant.id}`,
        productId: product.slug,
        name: product.shortName || product.name,
        variantName: variant.name,
        price: variant.price,
        image: variant.image || product.images[0] || "",
        vid: variant.vid,
        checkoutUrl: product.defaultCheckoutUrl,
      },
      qty,
    );
  };

  return (
    <section id={id} className="mx-auto grid max-w-6xl scroll-mt-28 gap-12 px-5 py-20 md:grid-cols-2">
      <div className="reveal">
        <img
          {...responsiveImage(product.images[0]!, "(min-width: 1152px) 540px, (min-width: 768px) 50vw, 100vw")}
          width={1200}
          height={1200}
          loading="lazy"
          decoding="async"
          alt={product.name}
          className="sticky top-28 rounded-3xl shadow-[var(--shadow-lift)]"
        />
      </div>
      <div className="reveal">
        <Eyebrow>Shop</Eyebrow>
        <h2 className="text-3xl font-extrabold sm:text-4xl">{product.name}</h2>
        <p className="mt-3 text-lg text-muted-foreground">{product.tagline}</p>
        <p className="mt-4 flex items-baseline gap-3">
          <span className="font-display text-3xl font-bold">{formatPrice(product.price)}</span>
          <span className="text-lg text-muted-foreground line-through">
            {formatPrice(product.compareAt)}
          </span>
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
            SAVE {formatPrice(product.compareAt - product.price)}
          </span>
        </p>

        <ul className="mt-8 space-y-3">
          {product.features.map((f) => (
            <li key={f} className="flex gap-2 text-sm">
              <Check className="h-5 w-5 shrink-0 text-accent" />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <h3 className="font-bold">How it works</h3>
          <ol className="mt-4 space-y-4">
            {howItWorks.map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <div>
                  <h4 className="font-bold text-sm">{t}</h4>
                  <p className="text-sm text-muted-foreground">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 flex gap-3">
          <div className="flex items-center rounded-full border bg-card">
            <button aria-label="Decrease quantity" className="p-3" onClick={() => setQty(Math.max(1, qty - 1))}>
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-semibold">{qty}</span>
            <button aria-label="Increase quantity" className="p-3" onClick={() => setQty(qty + 1)}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button className="btn-primary flex-1" onClick={handleAddToCart}>
            Add to Cart — {formatPrice(product.price * qty)}
          </button>
        </div>
        <button
          onClick={handleAddToCart}
          className="mt-3 w-full rounded-full border-2 border-primary bg-card py-3.5 text-sm font-bold text-primary hover:bg-primary/5 transition"
        >
          Buy now — {formatPrice(product.price * qty)}
        </button>

        <div className="mt-3 text-center">
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
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
            "Processed in 1–2 business days, delivered in 3–8 business days",
            "30-day happiness guarantee — full refund",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <Check className="h-5 w-5 shrink-0 text-accent" />
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Accordion q="Specifications">
            <ul className="space-y-1.5">
              {product.specs.map((s) => (
                <li key={s.label}>
                  <strong className="text-foreground">{s.label}:</strong> {s.value}
                </li>
              ))}
            </ul>
          </Accordion>
          <Accordion q="What's included">
            <ul className="list-disc pl-5 space-y-1">
              {product.includes.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </Accordion>
          <Accordion q="Shipping & returns">
            Orders are processed in 1–2 business days, then delivered in 3–8 business days
            anywhere in the U.S. You have 30 days from delivery to return your order for a full
            refund.
          </Accordion>
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const rows = [
    ["Cost per drink", "~$1", "~$0.50", "$5–$7"],
    ["Ready in", "~30 seconds", "~5 minutes", "10+ min detour"],
    ["Works anywhere", "Yes", "Yes", "No"],
    ["Needs an outlet", "No — USB-C", "No — USB-C", "—"],
  ];
  return (
    <section id="why" className="mx-auto max-w-5xl scroll-mt-28 px-5 py-20">
      <h2 className="reveal text-center text-3xl font-extrabold sm:text-4xl">
        Why make it yourself?
      </h2>
      <div className="reveal card-soft mt-10 overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-5" />
              <th className="bg-primary p-5 font-display text-primary-foreground">KAYANU Blender</th>
              <th className="p-5 font-display">KAYANU Espresso Maker</th>
              <th className="p-5 font-display">Café / juice bar</th>
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
                <td className="p-5 font-medium">
                  <span className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-accent" />
                    {b}
                  </span>
                </td>
                <td className="p-5 text-muted-foreground">{c}</td>
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
          Try them on your next trip, workout or workday. If they don&apos;t earn their place in
          your bag, send them back within 30 days for a full refund.
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
      document.getElementById("blender"),
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
      <a href="#blender" className="btn-primary w-full">
        Shop the Blender — from {formatPrice(blender.price)}
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
