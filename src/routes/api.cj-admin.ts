import { createFileRoute } from "@tanstack/react-router";
import { cjRequest, cjSandbox, placeCjOrder } from "@/lib/cj.server";

// Owner-only CJdropshipping actions (call from a terminal, n8n or Postman):
// POST https://www.kayanu.com/api/cj-admin
//   Authorization: Bearer <ORDER_ADMIN_SECRET>
//   {"action": "registerWebhook"}                         → CJ pushes ORDER + LOGISTIC to /api/cj-webhook
//   {"action": "placeOrder", "sessionId": "cs_live_..."}   → (re)send a paid Stripe session to CJ
//   {"action": "order", "orderId": "..."}                  → CJ order detail
// Sandbox only (CJ_SANDBOX not "0"), to walk a test order through its life cycle:
//   {"action": "sandboxPay", "orderId": "..."}
//   {"action": "sandboxStatus", "orderId": "...", "targetStatus": 400 | 500 | 600 | 700}
//   {"action": "sandboxTrack", "orderId": "...", "trackNumber": "SBX123"}

const WEBHOOK_URL = "https://www.kayanu.com/api/cj-webhook";

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

export const Route = createFileRoute("/api/cj-admin")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const secret = process.env["ORDER_ADMIN_SECRET"];
        if (!secret || secret.length < 24) return json({ error: "not_configured" }, 503);
        const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
        if (!safeEqual(token, secret)) return json({ error: "unauthorized" }, 401);
        if (!process.env["CJ_API_KEY"]) return json({ error: "CJ_API_KEY not set" }, 503);

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ error: "invalid_json" }, 400);
        }
        const action = str(body["action"]);
        const orderId = str(body["orderId"]);
        const sandboxOnly = action?.startsWith("sandbox");
        if (sandboxOnly && !cjSandbox())
          return json({ error: "sandbox actions are disabled (CJ_SANDBOX=0)" }, 400);
        if ((sandboxOnly || action === "order") && !orderId)
          return json({ error: "orderId required" }, 400);

        try {
          switch (action) {
            case "registerWebhook": {
              const on = { type: "ENABLE", callbackUrls: [WEBHOOK_URL] };
              const off = { type: "CANCEL", callbackUrls: [WEBHOOK_URL] };
              const data = await cjRequest("/webhook/set", {
                body: { product: off, stock: off, order: on, logistics: on },
              });
              return json({ ok: true, data });
            }
            case "placeOrder": {
              const sessionId = str(body["sessionId"]);
              if (!sessionId?.startsWith("cs_")) return json({ error: "sessionId required" }, 400);
              return json(await placeCjOrder(sessionId));
            }
            case "order":
              return json({
                ok: true,
                data: await cjRequest("/shopping/order/getOrderDetail", {
                  method: "GET",
                  query: { orderId: orderId! },
                }),
              });
            case "sandboxPay":
              return json({
                ok: true,
                data: await cjRequest("/shopping/sandbox/simulatePay", { body: { orderId } }),
              });
            case "sandboxStatus": {
              const targetStatus = Number(body["targetStatus"]);
              if (![400, 500, 600, 700].includes(targetStatus))
                return json({ error: "targetStatus must be 400, 500, 600 or 700" }, 400);
              return json({
                ok: true,
                data: await cjRequest("/shopping/sandbox/updateStatus", {
                  body: { orderId, targetStatus },
                }),
              });
            }
            case "sandboxTrack": {
              const trackNumber = str(body["trackNumber"]);
              if (!trackNumber || trackNumber.length > 64)
                return json({ error: "trackNumber required (max 64 chars)" }, 400);
              return json({
                ok: true,
                data: await cjRequest("/shopping/sandbox/updateTrackNumber", {
                  body: { orderId, trackNumber },
                }),
              });
            }
            default:
              return json({ error: "unknown action" }, 400);
          }
        } catch (err) {
          console.error("CJ admin:", action, err);
          return json({ error: err instanceof Error ? err.message : String(err) }, 502);
        }
      },
    },
  },
});
