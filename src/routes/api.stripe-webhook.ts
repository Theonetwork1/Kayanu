import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import {
  abandonedCart,
  getStripeKey,
  getWebhookSecret,
  loadOrder,
  orderConfirmation,
  ownerNewOrder,
  sendMail,
} from "@/lib/emails.server";

// Stripe webhook endpoint: POST https://www.kayanu.com/api/stripe-webhook
// Env vars (Vercel): STRIPE_WEBHOOK_SECRET (alias KAYANU_WEBHOOK), STRIPE_SECRET_KEY (alias KAYANU),
// RESEND_API_KEY, ORDER_NOTIFY_EMAIL (where new-order alerts go).
// Signature verification only needs the signing secret, not the API key.
export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      // Without this, a browser visit renders the home page with a 200.
      GET: () => new Response("Method Not Allowed", { status: 405, headers: { allow: "POST" } }),
      POST: async ({ request }: { request: Request }) => {
        const secret = getWebhookSecret();
        if (!secret) {
          console.error("Stripe webhook: missing STRIPE_WEBHOOK_SECRET (or KAYANU_WEBHOOK)");
          return new Response("Webhook not configured", { status: 500 });
        }

        const signature = request.headers.get("stripe-signature");
        if (!signature) return new Response("Missing stripe-signature", { status: 400 });

        const payload = await request.text(); // raw body is required for verification
        const stripe = new Stripe(getStripeKey() ?? "sk_unused_for_webhook_verification");

        let event: Stripe.Event;
        try {
          event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
        } catch (err) {
          console.error("Stripe webhook: invalid signature", err);
          return new Response("Invalid signature", { status: 400 });
        }

        const ok = () =>
          new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });

        const isPaid =
          (event.type === "checkout.session.completed" &&
            (event.data.object as Stripe.Checkout.Session).payment_status === "paid") ||
          event.type === "checkout.session.async_payment_succeeded";
        const isExpired = event.type === "checkout.session.expired";

        if (!isPaid && !isExpired) return ok();

        // Missing configuration can't be fixed by a retry: log loudly and acknowledge,
        // otherwise Stripe would retry for days and then disable this endpoint.
        if (!process.env["RESEND_API_KEY"] || !getStripeKey()) {
          console.error(
            "Stripe webhook: emails skipped, set RESEND_API_KEY and STRIPE_SECRET_KEY in Vercel",
          );
          return ok();
        }

        try {
          const sessionId = (event.data.object as Stripe.Checkout.Session).id;
          const order = await loadOrder(sessionId);

          if (isPaid) {
            console.log("Order paid:", order.number, order.total);
            const customerMail = orderConfirmation(order);
            if (customerMail) await sendMail(customerMail);
            const owner = process.env["ORDER_NOTIFY_EMAIL"];
            if (owner) await sendMail(ownerNewOrder(order, owner));
            else console.warn("ORDER_NOTIFY_EMAIL not set: owner notification skipped");
          } else {
            const cartMail = abandonedCart(order);
            if (cartMail) await sendMail(cartMail);
          }
        } catch (err) {
          // Transient failure (Resend/Stripe API): 500 makes Stripe retry; idempotency keys prevent duplicates.
          console.error("Stripe webhook: email step failed", err);
          return new Response("Email step failed", { status: 500 });
        }

        return ok();
      },
    },
  },
});
