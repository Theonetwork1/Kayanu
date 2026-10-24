import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ShoppingBag } from "lucide-react";
import { STORE_NAME } from "@/config";

import { useCart } from "@/context/CartContext";

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
  const { openCart, totalItems } = useCart();
  const links = [
    ["Shop Sets", "buy"],
    ["Toiletry Bag", "toiletry"],
    ["What's Inside", "inside"],
    ["FAQ", "faq"],
  ];
  return (
    <>
      <div className="bg-primary px-4 py-2 text-center text-[11px] font-semibold tracking-widest text-primary-foreground sm:text-xs">
        FAST U.S. SHIPPING — DELIVERED IN 3–8 DAYS • 30-DAY HAPPINESS GUARANTEE
      </div>
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2">
          <Link to="/" className="py-3 font-display text-xl font-extrabold tracking-[0.2em]">
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
          
          <div className="flex items-center gap-3">
            <button
              onClick={openCart}
              className="relative flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/40 transition shadow-xs"
              aria-label={`View cart with ${totalItems} items`}
            >
              <ShoppingBag className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground shadow-xs animate-in zoom-in-75 duration-200">
                  {totalItems}
                </span>
              )}
            </button>

            <a
              href="/#buy"
              className="flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Shop now
            </a>
          </div>
        </div>
        <nav className="flex justify-center gap-1 overflow-x-auto pb-1 text-xs font-medium text-muted-foreground md:hidden">
          {links.map(([l, id]) => (
            <a key={id} href={`/#${id}`} className="whitespace-nowrap px-2.5 py-3">
              {l}
            </a>
          ))}
        </nav>
      </header>
    </>
  );
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
        <nav className="-mx-2 flex flex-wrap gap-x-2 text-sm md:justify-end">
          {links.map(([to, l]) => (
            <Link key={to} to={to} className="px-2 py-3 opacity-80 hover:opacity-100">
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
