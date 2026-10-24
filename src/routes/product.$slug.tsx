import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteShell } from "@/components/Layout";
import { PRODUCTS, getProductBySlug, type StoreProduct, type ProductVariant } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { canonicalLink, formatPrice, STORE_NAME } from "@/config";
import {
  Check,
  ShieldCheck,
  Truck,
  Package,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: `Product Not Found — ${STORE_NAME}` }] };
    return {
      meta: [
        { title: `${p.name} — ${STORE_NAME}` },
        { name: "description", content: p.description },
        { property: "og:title", content: `${p.name} — ${STORE_NAME}` },
        { property: "og:description", content: p.tagline },
        { property: "og:image", content: p.images[0] },
        { property: "og:type", content: "product" },
      ],
      links: [canonicalLink(`/product/${p.slug}`)],
    };
  },
  component: ProductDetailPage,
});

function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/70 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left font-display text-sm font-bold text-foreground transition hover:text-primary"
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>
      {open && <div className="mt-3 text-xs leading-relaxed text-muted-foreground">{children}</div>}
    </div>
  );
}

function ProductDetailPage() {
  const { product } = Route.useLoaderData();
  const { addItem } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [overrideImage, setOverrideImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // If variant changes, change image to match the variant
  const handleSelectVariant = (v: ProductVariant) => {
    setSelectedVariant(v);
    const variantImgIdx = product.images.findIndex((img) => img === v.image);
    if (variantImgIdx >= 0) {
      setActiveImageIndex(variantImgIdx);
      setOverrideImage(null);
    } else if (v.image) {
      setOverrideImage(v.image);
    }
  };

  const currentImage =
    overrideImage || product.images[activeImageIndex] || selectedVariant.image || product.images[0];

  const handleAddToCart = () => {
    addItem(
      {
        id: `${product.slug}-${selectedVariant.id}`,
        productId: product.slug,
        name: product.shortName || product.name,
        variantName: selectedVariant.name,
        price: selectedVariant.price,
        image: selectedVariant.image || currentImage,
        vid: selectedVariant.vid,
        checkoutUrl: product.defaultCheckoutUrl,
      },
      quantity,
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
  };

  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl px-5 py-8 md:py-14">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <a href="/#buy" className="hover:text-foreground transition">
            Store
          </a>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold line-clamp-1">{product.shortName}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left Column: Multi-Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[var(--shadow-soft)]">
              <img
                src={currentImage}
                alt={product.name}
                className="h-full w-full object-cover object-center transition-all duration-300"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-wider text-accent-foreground shadow-sm">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setOverrideImage(null);
                    }}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                      activeImageIndex === idx && !overrideImage
                        ? "border-primary shadow-sm"
                        : "border-border/60 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust highlights under gallery */}
            <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-border/60 bg-secondary/40 p-4 text-center">
              <div className="flex flex-col items-center">
                <Truck className="h-5 w-5 text-accent" />
                <span className="mt-1 text-[11px] font-bold text-foreground">3–8 Day U.S.</span>
                <span className="text-[10px] text-muted-foreground">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center border-x border-border/60 px-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="mt-1 text-[11px] font-bold text-foreground">30-Day Window</span>
                <span className="text-[10px] text-muted-foreground">Full Refund</span>
              </div>
              <div className="flex flex-col items-center">
                <Check className="h-5 w-5 text-accent" />
                <span className="mt-1 text-[11px] font-bold text-foreground">Quality Check</span>
                <span className="text-[10px] text-muted-foreground">Ripstop & Zippers</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Buy Action */}
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">
              Official KAYANU Travel Gear
            </span>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              {product.tagline}
            </p>

            {/* Price Box */}
            <div className="mt-6 flex items-baseline gap-4 rounded-2xl border border-border/60 bg-card p-4">
              <span className="font-display text-3xl font-extrabold text-foreground">
                {formatPrice(selectedVariant.price)}
              </span>
              {selectedVariant.compareAt && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(selectedVariant.compareAt)}
                </span>
              )}
              {selectedVariant.compareAt && (
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
                  SAVE {formatPrice(selectedVariant.compareAt - selectedVariant.price)}
                </span>
              )}
              <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                In Stock & Ready
              </span>
            </div>

            {/* Variants Selector */}
            {product.variants.length > 1 && (
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">
                    Color / Option:{" "}
                    <span className="font-bold text-primary">{selectedVariant.name}</span>
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {product.variants.length} available
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleSelectVariant(v)}
                      className={`flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-xs font-semibold transition ${
                        selectedVariant.id === v.id
                          ? "border-primary bg-primary/10 text-primary shadow-xs"
                          : "border-border bg-card text-foreground hover:border-foreground/30"
                      }`}
                    >
                      {v.colorSwatch && (
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/20"
                          style={{ background: v.colorSwatch }}
                        />
                      )}
                      <span>{v.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-foreground">Quantity:</label>
                <div className="flex items-center rounded-xl border border-input bg-card p-1 shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-muted-foreground hover:text-foreground transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-bold text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-muted-foreground hover:text-foreground transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="flex flex-col gap-3 sm:flex-row pt-2">
                <button
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-card py-3.5 text-sm font-bold text-primary transition hover:bg-primary/5 shadow-xs"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="btn-primary flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-bold shadow-lg shadow-primary/20"
                >
                  <span>Buy Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Free shipping unlocked on orders of $49 or more. 30-day money-back guarantee.
              </p>
            </div>

            {/* Key Features Bullet List */}
            <div className="mt-8 rounded-2xl border border-border/60 bg-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Why Travelers Love It
              </h3>
              <ul className="mt-3 space-y-2.5">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-foreground/90">
                    <Check className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Accordions */}
            <div className="mt-8">
              {product.includes.length > 0 && (
                <AccordionItem title="What's Included in the Box">
                  <ul className="list-disc pl-4 space-y-1">
                    {product.includes.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </AccordionItem>
              )}

              <AccordionItem title="Specifications & Dimensions">
                <div className="grid grid-cols-2 gap-2">
                  {product.specs.map((s, i) => (
                    <div key={i} className="rounded-lg bg-secondary/50 p-2">
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                        {s.label}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </AccordionItem>

              <AccordionItem title="Shipping & 30-Day Guarantee">
                <p>
                  Orders process in 1–2 business days and deliver in 3–8 business days anywhere in the U.S.
                  Tracking is provided automatically via email as soon as the package ships. If you are
                  not 100% satisfied, return it within 30 days for a full refund.
                </p>
              </AccordionItem>
            </div>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
