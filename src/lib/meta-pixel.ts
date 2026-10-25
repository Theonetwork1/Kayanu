// Meta (Facebook) Pixel integration helper

export const FB_PIXEL_ID = "1926316712086674";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export function trackEvent(name: string, options?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (options) {
      window.fbq("track", name, options);
    } else {
      window.fbq("track", name);
    }
  }
}

export function trackCustomEvent(name: string, options?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (options) {
      window.fbq("trackCustom", name, options);
    } else {
      window.fbq("trackCustom", name);
    }
  }
}

export function trackPageView() {
  trackEvent("PageView");
}

export function trackViewContent(item: { name: string; price: number; id?: string }) {
  trackEvent("ViewContent", {
    content_name: item.name,
    content_ids: item.id ? [item.id] : undefined,
    content_type: "product",
    value: item.price,
    currency: "USD",
  });
}

export function trackAddToCart(item: { name: string; price: number; quantity?: number; id?: string }) {
  trackEvent("AddToCart", {
    content_name: item.name,
    content_ids: item.id ? [item.id] : undefined,
    content_type: "product",
    value: item.price * (item.quantity ?? 1),
    currency: "USD",
  });
}

const LAST_CHECKOUT_KEY = "kayanu_last_checkout_total";

export function trackInitiateCheckout(total: number, itemsCount: number) {
  try {
    window.localStorage.setItem(LAST_CHECKOUT_KEY, String(total));
  } catch {
    /* storage unavailable */
  }
  trackEvent("InitiateCheckout", {
    value: total,
    currency: "USD",
    num_items: itemsCount,
  });
}

/** Returns the cart total saved at checkout start (real order value), if any. */
export function getLastCheckoutTotal(): number | undefined {
  try {
    const v = Number(window.localStorage.getItem(LAST_CHECKOUT_KEY));
    return Number.isFinite(v) && v > 0 ? v : undefined;
  } catch {
    return undefined;
  }
}

export function trackPurchase(value?: number, currency = "USD") {
  if (value && value > 0) {
    trackEvent("Purchase", { value, currency });
  } else {
    trackEvent("Purchase");
  }
}
