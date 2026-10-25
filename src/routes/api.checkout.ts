import "@/lib/env.server";
import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { getStripeKey } from "@/lib/emails.server";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT, SITE_URL } from "@/config";
import type { CartItem } from "@/context/CartContext";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let body: { items?: CartItem[] };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, 400);
        }

        const items = body.items;
        if (!items || !items.length) {
          return json({ error: "Cart is empty" }, 400);
        }

        const stripeKey = getStripeKey();
        if (!stripeKey) {
          // If Stripe secret key isn't set yet in .env, return the first available fallback checkout URL
          const fallback = items.find((i) => i.checkoutUrl)?.checkoutUrl || "https://buy.stripe.com/aFabJ09nMeWR9Br87W3wQ09";
          return json({ url: fallback });
        }

        try {
          const stripe = new Stripe(stripeKey);
          const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

          const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
            price_data: {
              currency: "usd",
              product_data: {
                name: `${item.name} (${item.variantName})`,
                images: item.image ? [item.image] : [],
                metadata: {
                  productId: item.productId,
                  vid: item.vid || "",
                },
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          }));

          const origin = request.headers.get("origin") || SITE_URL;

          const session = await stripe.checkout.sessions.create({
            mode: "payment",
            allow_promotion_codes: true,
            line_items: lineItems,
            shipping_address_collection: {
              allowed_countries: ["US"],
            },
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: {
                    amount: isFreeShipping ? 0 : Math.round(SHIPPING_FLAT * 100),
                    currency: "usd",
                  },
                  display_name: isFreeShipping ? "Free Standard Shipping (3–8 business days)" : "Standard Shipping (3–8 business days)",
                },
              },
            ],
            success_url: `${origin}/?order=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/`,
            metadata: {
              store: "KAYANU",
              itemsCount: String(items.length),
              vids: items.map((i) => i.vid).filter(Boolean).join(","),
            },
          });

          return json({ url: session.url });
        } catch (err) {
          console.error("Stripe checkout session creation failed:", err);
          const fallback = items.find((i) => i.checkoutUrl)?.checkoutUrl || "https://buy.stripe.com/aFabJ09nMeWR9Br87W3wQ09";
          return json({ url: fallback });
        }
      },
    },
  },
});
