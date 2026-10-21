import { COLORS, STORE_NAME, getAddon, getVariant } from "@/config";
import { shippingFor } from "@/lib/pricing";
import { unitPrice, type CartLine } from "@/lib/cart-schema";

const toCents = (n: number) => Math.round(n * 100);

// Builds the form-encoded body for POST /v1/checkout/sessions. Prices always come
// from src/config.ts on the server, never from the browser.
export function buildCheckoutSessionParams(lines: CartLine[], origin: string): URLSearchParams {
  const p = new URLSearchParams();
  p.set("mode", "payment");
  p.set("success_url", `${origin}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`);
  p.set("cancel_url", `${origin}/#buy`);
  p.set("shipping_address_collection[allowed_countries][0]", "US");
  p.set("billing_address_collection", "auto");
  p.set("phone_number_collection[enabled]", "true");
  // Lets customers enter the welcome code (WELCOME_CODE) created in Stripe.
  p.set("allow_promotion_codes", "true");

  let subtotal = 0;
  lines.forEach((l, i) => {
    const k = `line_items[${i}]`;
    const price = unitPrice(l);
    subtotal += price * l.qty;
    p.set(`${k}[quantity]`, String(l.qty));
    p.set(`${k}[price_data][currency]`, "usd");
    p.set(`${k}[price_data][unit_amount]`, String(toCents(price)));
    if (l.type === "set") {
      const v = getVariant(l.variant);
      const color = COLORS.find((c) => c.id === l.color);
      if (!color) throw new Error(`Unknown color ${l.color}`);
      p.set(
        `${k}[price_data][product_data][name]`,
        `${STORE_NAME} 8-Piece Compression Set — ${v.label}`,
      );
      p.set(`${k}[price_data][product_data][description]`, `Color: ${color.label}`);
      p.set(`${k}[price_data][product_data][metadata][variant]`, l.variant);
      p.set(`${k}[price_data][product_data][metadata][color]`, l.color);
    } else {
      p.set(`${k}[price_data][product_data][name]`, `${STORE_NAME} ${getAddon(l.addon).name}`);
      p.set(`${k}[price_data][product_data][metadata][addon]`, l.addon);
    }
  });

  // Readable summary for fulfillment, visible on the payment in the Stripe dashboard.
  const summary = lines
    .map((l) =>
      l.type === "set"
        ? `${l.qty}x ${getVariant(l.variant).label} / ${l.color}`
        : `${l.qty}x ${l.addon}`,
    )
    .join(", ");
  p.set("metadata[cart]", summary.slice(0, 500));
  p.set("payment_intent_data[metadata][cart]", summary.slice(0, 500));

  const shipping = shippingFor(subtotal);
  p.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  p.set(
    "shipping_options[0][shipping_rate_data][display_name]",
    shipping === 0 ? "Free U.S. shipping" : "U.S. shipping",
  );
  p.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(toCents(shipping)));
  p.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "usd");
  p.set(
    "shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]",
    "business_day",
  );
  p.set("shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]", "4");
  p.set(
    "shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]",
    "business_day",
  );
  p.set("shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]", "10");

  return p;
}

export async function createCheckoutSession(lines: CartLine[], origin: string): Promise<string> {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: buildCheckoutSessionParams(lines, origin),
  });
  const data = (await res.json()) as { url?: string; error?: { message?: string } };
  if (!res.ok || !data.url) {
    throw new Error(
      `Stripe checkout session failed (${res.status}): ${data.error?.message ?? "no url"}`,
    );
  }
  return data.url;
}
