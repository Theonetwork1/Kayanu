import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ShoppingBag, X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { startCheckout } from "@/lib/checkout";
import {
  STORE_NAME,
  COLORS,
  CONTACT_EMAIL,
  FREE_SHIPPING_THRESHOLD,
  formatPrice,
  getAddon,
  getVariant,
} from "@/config";
import { unitPrice, type CartLine } from "@/lib/cart-schema";
import { freeShippingProgress } from "@/lib/pricing";

export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Header() {
  const { count, setOpen } = useCart();
  const links = [
    ["Shop", "buy"],
    ["How It Works", "how-it-works"],
    ["What's Inside", "inside"],
    ["FAQ", "faq"],
  ];
  return (
    <>
      <div className="bg-primary px-4 py-2 text-center text-[11px] font-semibold tracking-widest text-primary-foreground sm:text-xs">
        FAST U.S. SHIPPING — DELIVERED IN 3–8 DAYS • 30-DAY HAPPINESS GUARANTEE
      </div>
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-xl font-extrabold tracking-[0.2em]">
            {STORE_NAME}
          </Link>
          <nav className="hidden gap-8 text-sm font-medium md:flex">
            {links.map(([l, id]) => (
              <a
                key={id}
                href={`/#${id}`}
                className="text-muted-foreground transition hover:text-foreground"
              >
                {l}
              </a>
            ))}
          </nav>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open cart"
            className="relative rounded-full p-2 hover:bg-muted"
          >
            <ShoppingBag className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </button>
        </div>
        <nav className="flex justify-center gap-5 overflow-x-auto pb-3 text-xs font-medium text-muted-foreground md:hidden">
          {links.map(([l, id]) => (
            <a key={id} href={`/#${id}`}>
              {l}
            </a>
          ))}
        </nav>
      </header>
    </>
  );
}

function CartDrawer() {
  const { open, setOpen, lines, setQty, remove, subtotal, shipping } = useCart();
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // Coming back from Stripe with the Back button restores the page from the
  // bfcache with the button still in its "redirecting" state.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => e.persisted && setPending(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const checkout = async () => {
    if (!lines.length || pending) return;
    setPending(true);
    setError(null);
    try {
      const { url } = await startCheckout({ data: lines });
      window.location.href = url;
    } catch (e) {
      console.error(e);
      setError(`Checkout is unavailable right now. Please try again or email ${CONTACT_EMAIL}.`);
      setPending(false);
    }
  };
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} inert={!open}>
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-primary/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b p-5">
          <h2 id="cart-title" className="text-lg font-bold">
            Your cart
          </h2>
          <button ref={closeBtn} onClick={() => setOpen(false)} aria-label="Close cart">
            <X />
          </button>
        </div>
        <div className="border-b p-5">
          <p className="mb-2 text-sm font-medium">
            {subtotal >= FREE_SHIPPING_THRESHOLD
              ? "🎉 You've unlocked FREE shipping!"
              : `You're ${formatPrice(Math.max(0, remaining))} away from FREE shipping`}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${freeShippingProgress(subtotal) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {!lines.length && <p className="text-muted-foreground">Your cart is empty.</p>}
          {lines.map((l, i) => {
            const item = describeLine(l);
            return (
              <div key={item.key} className="card-soft flex items-center gap-4 p-4">
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span
                    className="h-12 w-12 shrink-0 rounded-xl"
                    style={{ background: item.swatch }}
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      aria-label="Decrease"
                      onClick={() => setQty(i, l.qty - 1)}
                      className="rounded-full border p-1"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm">{l.qty}</span>
                    <button
                      aria-label="Increase"
                      onClick={() => setQty(i, l.qty + 1)}
                      className="rounded-full border p-1"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      aria-label="Remove"
                      onClick={() => remove(i)}
                      className="ml-auto text-muted-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="font-semibold">{formatPrice(unitPrice(l) * l.qty)}</p>
              </div>
            );
          })}
        </div>
        <div className="space-y-2 border-t p-5 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{lines.length ? (shipping === 0 ? "FREE" : formatPrice(shipping)) : "—"}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(subtotal + shipping)}</span>
          </div>
          <button
            onClick={checkout}
            disabled={!lines.length || pending}
            className="btn-primary mt-3 w-full"
          >
            {pending ? "Redirecting to secure checkout…" : "Checkout"}
          </button>
          {error && (
            <p role="alert" className="text-center text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function describeLine(l: CartLine) {
  if (l.type === "addon") {
    const a = getAddon(l.addon);
    return {
      key: `addon:${l.addon}`,
      title: a.name,
      subtitle: null,
      image: a.image,
      swatch: undefined,
    };
  }
  const c = COLORS.find((c) => c.id === l.color);
  return {
    key: `set:${l.variant}:${l.color}`,
    title: `8-Piece Compression Set — ${getVariant(l.variant).label}`,
    subtitle: c?.label ?? null,
    image: null,
    swatch: c?.swatch,
  };
}

function Footer() {
  const links = [
    ["/shipping", "Shipping Policy"],
    ["/returns", "Returns & Refunds"],
    ["/privacy", "Privacy Policy"],
    ["/terms", "Terms of Service"],
    ["/contact", "Contact"],
  ] as const;
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-2">
        <div>
          <p className="font-display text-2xl font-extrabold tracking-[0.2em]">{STORE_NAME}</p>
          <p className="mt-2 opacity-80">Premium travel essentials. Pack more, stress less.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm md:justify-end">
          {links.map(([to, l]) => (
            <Link key={to} to={to} className="opacity-80 hover:opacity-100">
              {l}
            </Link>
          ))}
        </nav>
      </div>
      <p className="border-t border-primary-foreground/15 py-5 text-center text-xs opacity-70">
        © {new Date().getFullYear()} {STORE_NAME}. All rights reserved.
      </p>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

export function PolicyPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-extrabold">{title}</h1>
      <div className="mt-8 space-y-5 leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground">
        {children}
      </div>
    </article>
  );
}
