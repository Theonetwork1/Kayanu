import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";

// Stripe webhook endpoint: POST https://www.kayanu.com/api/stripe-webhook (use www:
// the apex domain redirects, and Stripe does not follow redirects).
// Env var (set in Vercel): STRIPE_WEBHOOK_SECRET (KAYANU_WEBHOOK is accepted as an alias).
// Signature verification only needs the webhook signing secret, not the API key.
export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      // Without this, a browser visit renders the home page with a 200.
      GET: () => new Response("Method Not Allowed", { status: 405, headers: { allow: "POST" } }),
      POST: async ({ request }: { request: Request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"] ?? process.env["KAYANU_WEBHOOK"];
        if (!secret) {
          console.error("Stripe webhook: missing STRIPE_WEBHOOK_SECRET (or KAYANU_WEBHOOK)");
          return new Response("Webhook not configured", { status: 500 });
        }

        const signature = request.headers.get("stripe-signature");
        if (!signature) return new Response("Missing stripe-signature", { status: 400 });

        const payload = await request.text(); // raw body is required for verification
        const stripe = new Stripe(
          process.env["STRIPE_SECRET_KEY"] ?? "sk_unused_for_webhook_verification",
        );

        let event: Stripe.Event;
        try {
          event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
        } catch (err) {
          console.error("Stripe webhook: invalid signature", err);
          return new Response("Invalid signature", { status: 400 });
        }

        switch (event.type) {
          case "checkout.session.completed":
          case "checkout.session.async_payment_succeeded": {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.payment_status === "paid") {
              // TODO: fulfill the order (confirmation email, notify supplier, etc.)
              console.log(
                "Order paid:",
                session.id,
                session.amount_total,
                session.customer_details?.email,
              );
            }
            break;
          }
          case "checkout.session.async_payment_failed":
            console.warn(
              "Async payment failed:",
              (event.data.object as Stripe.Checkout.Session).id,
            );
            break;
          default:
            break;
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
