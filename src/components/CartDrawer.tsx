import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/config";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from "lucide-react";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalItems,
    subtotal,
    shipping,
    total,
  } = useCart();

  const [checkingOut, setCheckingOut] = useState(false);

  if (!isCartOpen) return null;

  const diffForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      // 1. Try dynamic multi-item server checkout if configured
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
    } catch {
      // Fallback
    }

    // 2. Direct fallback to Stripe checkout URL of primary item or default
    const fallbackItem = items.find((i) => i.checkoutUrl) || items[0];
    if (fallbackItem?.checkoutUrl) {
      window.location.href = fallbackItem.checkoutUrl;
    } else {
      window.location.href = "https://buy.stripe.com/dRm5kC57waGBcND87W3wQ00";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="relative flex w-screen max-w-md flex-col bg-background shadow-2xl border-l border-border">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/70 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">
                Your Cart ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="border-b border-border/50 bg-secondary/35 px-6 py-3.5">
            {diffForFreeShipping > 0 ? (
              <div>
                <p className="text-xs text-muted-foreground">
                  Add <span className="font-bold text-foreground">{formatPrice(diffForFreeShipping)}</span> more for{" "}
                  <strong className="text-primary font-bold">FREE U.S. Shipping</strong>!
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-accent transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <Truck className="h-4 w-4" />
                <span>You qualify for FREE U.S. Shipping! 🎉</span>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="rounded-full bg-muted p-5 text-muted-foreground">
                  <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-foreground">
                  Your cart is empty
                </h3>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Looks like you haven't added any compression gear yet.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-6 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Explore Essentials
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 flex-shrink-0 rounded-2xl border border-border/80 object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between">
                          <h4 className="font-display text-sm font-bold text-foreground line-clamp-1">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground transition hover:text-destructive"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-accent">
                          {item.variantName}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-display text-sm font-extrabold text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center rounded-lg border border-border bg-card">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2 py-1 text-muted-foreground transition hover:text-foreground"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-6 text-center text-xs font-semibold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2 py-1 text-muted-foreground transition hover:text-foreground"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-border bg-card p-6 shadow-inner">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping (U.S.)</span>
                  <span className="font-semibold text-foreground">
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2 font-display text-base font-extrabold text-foreground">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="btn-primary mt-5 flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold shadow-lg shadow-primary/20"
              >
                {checkingOut ? (
                  <span>Redirecting to Checkout...</span>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>30-Day Guarantee</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-accent" />
                  <span>3–8 Day U.S. Delivery</span>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
