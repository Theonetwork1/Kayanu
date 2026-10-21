import { createFileRoute } from "@tanstack/react-router";
import { getStripeKey, loadOrder, orderStatus, sendMail, type ShipmentStatus } from "@/lib/emails.server";

// Sends a "shipped" / "delivered" email to the customer of an order.
// POST https://www.kayanu.com/api/order-status
//   Authorization: Bearer <ORDER_ADMIN_SECRET>
//   { "sessionId": "cs_live_...", "status": "shipped", "carrier": "USPS",
//     "trackingNumber": "9400...", "trackingUrl": "https://..." }
// Meant to be called from n8n (or any script) once the supplier gives tracking info.

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export const Route = createFileRoute("/api/order-status")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const secret = process.env["ORDER_ADMIN_SECRET"];
        if (!secret || secret.length < 24) return json({ error: "not_configured" }, 503);

        const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
        if (!safeEqual(token, secret)) return json({ error: "unauthorized" }, 401);

        if (!process.env["RESEND_API_KEY"] || !getStripeKey()) return json({ error: "not_configured" }, 503);

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ error: "invalid_json" }, 400);
        }

        const sessionId = typeof body["sessionId"] === "string" ? body["sessionId"] : "";
        const status = body["status"];
        if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sessionId)) return json({ error: "invalid_sessionId" }, 400);
        if (status !== "shipped" && status !== "delivered") return json({ error: "invalid_status" }, 400);

        const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 200) : undefined);

        try {
          const order = await loadOrder(sessionId);
          const mail = orderStatus(order, status as ShipmentStatus, {
            carrier: str(body["carrier"]),
            trackingNumber: str(body["trackingNumber"]),
            trackingUrl: str(body["trackingUrl"]),
          });
          if (!mail) return json({ error: "no_customer_email" }, 422);
          await sendMail(mail);
          return json({ sent: true, order: order.number, status });
        } catch (err) {
          console.error("order-status failed", err);
          return json({ error: "send_failed" }, 502);
        }
      },
    },
  },
});
