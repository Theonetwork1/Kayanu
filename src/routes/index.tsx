import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
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
// Supplier photos: replace with your own hosted images when available.
const heroImg = "https://s.alicdn.com/@sc04/kf/H98ada98627f3418784ac2191c9f120b0R.jpg"; // 8-piece compression set
const flatlayImg = "https://s.alicdn.com/@sc04/kf/H88755db5b1d64dfd8cda54d16e9559c88.jpg"; // charcoal cubes lineup
const compressImg = "https://s.alicdn.com/@sc04/kf/He37eee519eb344c2a9c3a13c32dbeff9I.jpg"; // beige cubes, lifestyle

const TITLE = "KAYANU — Compression Packing Cubes | Pack More, Stress Less";
const DESC =
  "KAYANU 8-piece compression packing cube set with shoe pouch and laundry bag. Fits carry-on and checked luggage. Fast U.S. shipping, 30-day guarantee.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "product" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: heroImg },
      { name: "twitter:card", content: "summary_large_image" },
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
  return (
    <SiteShell>
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
    </SiteShell>
  );
}

function Hero() {
  const price = getVariant("1-set").price;
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:py-20">
      <div className="reveal">
        <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-bold tracking-wider text-accent">
          8-PIECE COMPRESSION SET
        </span>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
          Pack twice as much. Stress half as much.
        </h1>
        <p className="mt-5 max-w-lg text-lg text-muted-foreground">
          KAYANU compression cubes squeeze the air out of your clothes with a second zipper, so
          everything fits — and stays organized — in any suitcase.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <a href="#buy" className="btn-primary">
            Get the 8-Piece Set — {formatPrice(price)}
          </a>
          <a href="#how-it-works" className="font-semibold underline underline-offset-4">
            See how it works
          </a>
        </div>
        <ul className="mt-8 flex flex-wrap gap-2 text-sm">
          {(
            [
              [Check, "Quality-checked zippers"],
              [Truck, "Ships from U.S. warehouse"],
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
      <div className="reveal">
        <img
          src={heroImg}
          width={1536}
          height={1152}
          alt="Open suitcase packed with KAYANU compression cubes"
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
        src={compressImg}
        width={1280}
        height={1024}
        loading="lazy"
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
    ["2 × XL compression cubes", "Jackets, sweaters, jeans"],
    ["2 × Large compression cubes", "Shirts, dresses, pants"],
    ["2 × Medium compression cubes", "T-shirts, shorts, sleepwear"],
    ["2 × Small compression cubes", "Underwear, socks, swimwear"],
    ["1 × Shoe pouch", "Keeps soles away from clothes"],
    ["1 × Laundry bag", "Separates dirty from clean"],
  ];
  return (
    <section id="inside" className="scroll-mt-28 bg-secondary py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="reveal text-center">
          <Eyebrow>What's inside the set</Eyebrow>
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            8 compression cubes + shoe pouch + laundry bag
          </h2>
        </div>
        <div className="mt-12 grid items-center gap-10 md:grid-cols-2">
          <img
            src={flatlayImg}
            width={1280}
            height={1280}
            loading="lazy"
            alt="Flat lay of all pieces in the KAYANU set"
            className="reveal rounded-3xl shadow-[var(--shadow-soft)]"
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
  const [color, setColor] = useState<ColorId>("charcoal");
  const [variant, setVariant] = useState<VariantId>("2-sets");
  const v = getVariant(variant);
  const colorLabel = COLORS.find((c) => c.id === color)!.label;
  return (
    <section
      id="buy"
      className="mx-auto grid max-w-6xl scroll-mt-28 gap-12 px-5 py-20 md:grid-cols-2"
    >
      <div className="reveal">
        <img
          src={flatlayImg}
          width={1280}
          height={1280}
          loading="lazy"
          alt="KAYANU 8-piece compression packing cube set"
          className="sticky top-28 rounded-3xl shadow-[var(--shadow-lift)]"
        />
      </div>
      <div className="reveal">
        <Eyebrow>Shop</Eyebrow>
        <h2 className="text-3xl font-extrabold sm:text-4xl">
          KAYANU 8-Piece Compression Packing Cube Set
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
        <div className="mt-3 flex gap-3">
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

        {/* Each bundle checks out through its own Stripe payment link. The link asks for
            the color again (a payment link can't be prefilled), so say it here. */}
        <a href={v.checkoutUrl} className="btn-primary mt-6 w-full">
          Buy now — {formatPrice(v.price)}
        </a>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Secure checkout by Stripe. Select <strong>{colorLabel}</strong> as your set color on the
          next page
          {variant === "2-sets" ? " — need more sets? You can change the quantity there." : "."}
        </p>

        <ul className="mt-6 space-y-2 text-sm">
          {[
            "FREE shipping on orders $49+ (otherwise $4.95)",
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
      </div>
    </section>
  );
}

function CompleteKit() {
  return (
    <section id="complete-kit" className="scroll-mt-28 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="reveal text-center">
          <Eyebrow>Complete your kit</Eyebrow>
          <h2 className="text-3xl font-extrabold sm:text-4xl">More room. Zero chaos.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            The add-ons travelers pair with the set. The Complete Kit is a single checkout; solo
            add-ons check out separately. Everything ships in 3–8 business days.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ADDONS.map((a) => (
            <div
              key={a.id}
              className="reveal flex flex-col overflow-hidden rounded-3xl bg-secondary shadow-[var(--shadow-soft)]"
            >
              <img
                src={a.image}
                alt={a.name}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-6">
                {a.badge ? (
                  <span className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">
                    {a.badge}
                  </span>
                ) : null}
                <h3 className="font-bold">{a.name}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{a.tagline}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xl font-extrabold">{formatPrice(a.price)}</span>
                  <a href={a.checkoutUrl} className="btn-primary">
                    Buy now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const rows = [
    ["Space saved", "Compresses clothes with a 2nd zipper", "Organizes, no compression", "None"],
    ["Organization", "4 sizes + shoe & laundry bags", "Sorted by cube", "Everything mixed"],
    ["Zipper quality", "Quality-checked before shipping", "Varies", "—"],
    ["Dirty-clothes separation", "Dedicated laundry bag", "Rarely included", "Not at all"],
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
        <Accordion q="How long is shipping?">
          Orders are processed in 1–2 business days, then delivered in 3–8 business days from our
          U.S. warehouse. You'll receive tracking by email as soon as your order ships.
        </Accordion>
        <Accordion q="What's included?">
          Each set includes 8 compression cubes (2 XL, 2 Large, 2 Medium, 2 Small), plus a shoe
          pouch and a laundry bag.
        </Accordion>
        <Accordion q="Will the set fit a carry-on?">
          Yes. The graduated sizes fit carry-on and checked luggage — use the smaller cubes for a
          carry-on and the full set for checked bags.
        </Accordion>
        <Accordion q="How does compression work?">
          Pack the cube and close the main zipper. Then close the second compression zipper around
          the edge — it pulls the cube flatter and pushes out the air.
        </Accordion>
        <Accordion q="What if a zipper breaks?">
          Every zipper is quality-checked before shipping. If one fails, contact us and we'll
          replace it or refund you.
        </Accordion>
        <Accordion q="What is your return policy?">
          You have 30 days from delivery to return your order for a full refund.
        </Accordion>
      </div>
    </section>
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
