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

export function trackInitiateCheckout(total: number, itemsCount: number) {
  trackEvent("InitiateCheckout", {
    value: total,
    currency: "USD",
    num_items: itemsCount,
  });
}

export function trackPurchase(value: number, currency = "USD") {
  trackEvent("Purchase", {
    value,
    currency,
  });
}
