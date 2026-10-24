import { createFileRoute } from "@tanstack/react-router";
import {
  cjSandbox,
  findSessionIdByPaymentIntent,
  getOrderFlags,
  readCjShipment,
  setOrderFlags,
  verifyCjSignature,
} from "@/lib/cj.server";
import { loadOrder, orderStatus, sendMail } from "@/lib/emails.server";

// CJdropshipping webhook endpoint: POST https://www.kayanu.com/api/cj-webhook
// Registered for the ORDER and LOGISTIC topics with POST /api/cj-admin {"action":"registerWebhook"}.
// Env vars (Vercel): CJ_OPEN_ID (signature secret), RESEND_API_KEY, STRIPE_SECRET_KEY,
// ORDER_NOTIFY_EMAIL (receives the customer emails instead of the customer in sandbox mode).
//
// CJ closes a topic when fewer than 80% of pushes succeed for 2 hours, and expects an
// answer within 3 seconds: once the signature is valid we always answer 200 and only log
// processing errors.
const ok = () =>
  new Response(JSON.stringify({ code: 200, result: "success", message: "ok" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/cj-webhook")({
  server: {
    handlers: {
      // Without this, a browser visit renders the home page with a 200.
      GET: () => new Response("Method Not Allowed", { status: 405, headers: { allow: "POST" } }),
      POST: async ({ request }: { request: Request }) => {
        const openId = process.env["CJ_OPEN_ID"];
        if (!openId) {
          console.error("CJ webhook: missing CJ_OPEN_ID");
          return new Response("Webhook not configured", { status: 500 });
        }

        const payload = await request.text(); // raw body is required for verification
        if (!(await verifyCjSignature(payload, request.headers.get("sign"), openId))) {
          console.error("CJ webhook: invalid signature");
          return new Response("Invalid signature", { status: 401 });
        }

        let event: Parameters<typeof readCjShipment>[0];
        try {
          event = JSON.parse(payload) as Parameters<typeof readCjShipment>[0];
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        console.log("CJ event:", event.type, event.messageId ?? "");

        const shipment = readCjShipment(event);
        // Only orders created by this store use a Stripe PaymentIntent id as order number.
        if (!shipment || !shipment.storeOrderNumber.startsWith("pi_")) return ok();

        try {
          const pi = shipment.storeOrderNumber;
          const flag = shipment.kind === "shipped" ? "shipped_email" : "delivered_email";
          const flags = await getOrderFlags(pi);
          // CJ pushes tracking updates for days: email the customer once per milestone.
          if (flags[flag]) return ok();

          const sessionId = await findSessionIdByPaymentIntent(pi);
          if (!sessionId) {
            console.warn("CJ webhook: no Stripe session for", pi);
            return ok();
          }
          const order = await loadOrder(sessionId);

          // Sandbox orders are fake: send the customer email to the owner instead.
          const sandbox = cjSandbox();
          const owner =
            process.env["ORDER_NOTIFY_EMAIL"] ||
            process.env["ADMIN_EMAIL"] ||
            process.env["OWNER_EMAIL"];
          if (sandbox && !owner) return ok();
          const mail = orderStatus(sandbox ? { ...order, email: owner } : order, shipment.kind, {
            trackingNumber: shipment.trackingNumber,
            trackingUrl: shipment.trackingUrl,
          });
          if (!mail || !process.env["RESEND_API_KEY"]) return ok();
          await sendMail(
            sandbox
              ? {
                  ...mail,
                  subject: `[SANDBOX] ${mail.subject}`,
                  idempotencyKey: `sandbox/${mail.idempotencyKey}`,
                }
              : mail,
          );
          await setOrderFlags(pi, { [flag]: new Date().toISOString() });
        } catch (err) {
          console.error("CJ webhook: processing failed", err);
        }
        return ok();
      },
    },
  },
});
