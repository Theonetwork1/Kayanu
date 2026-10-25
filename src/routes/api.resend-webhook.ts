import { createFileRoute } from "@tanstack/react-router";
import { ownerDeliveryProblem, sendMail } from "@/lib/emails.server";
import {
  describeProblem,
  isProblemEvent,
  verifySvixSignature,
  type ResendEvent,
} from "@/lib/resend-webhook.server";

// Resend webhook endpoint: POST https://www.kayanu.com/api/resend-webhook
// Env vars (Vercel): RESEND_WEBHOOK_SECRET (the endpoint's "whsec_..." signing secret),
// RESEND_API_KEY + ORDER_NOTIFY_EMAIL (to alert the owner).
// Every event is logged; bounced / complained / failed customer emails also send an
// alert to ORDER_NOTIFY_EMAIL, since the customer never got their order email.
const ok = () =>
  new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/resend-webhook")({
  server: {
    handlers: {
      // Without this, a browser visit renders the home page with a 200.
      GET: () => new Response("Method Not Allowed", { status: 405, headers: { allow: "POST" } }),
      POST: async ({ request }: { request: Request }) => {
        const secret = process.env["RESEND_WEBHOOK_SECRET"];
        if (!secret) {
          console.error("Resend webhook: missing RESEND_WEBHOOK_SECRET");
          return new Response("Webhook not configured", { status: 500 });
        }

        const payload = await request.text(); // raw body is required for verification
        const headers = {
          id: request.headers.get("svix-id"),
          timestamp: request.headers.get("svix-timestamp"),
          signature: request.headers.get("svix-signature"),
        };
        const check = await verifySvixSignature(headers, payload, secret);
        if (!check.ok) {
          console.error("Resend webhook: rejected,", check.reason);
          return new Response("Invalid signature", { status: 400 });
        }

        let event: ResendEvent;
        try {
          event = JSON.parse(payload) as ResendEvent;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        console.log("Resend event:", event.type, event.data?.email_id ?? "");

        if (!isProblemEvent(event.type)) return ok();

        const problem = describeProblem(event);
        console.warn("Resend delivery problem:", event.type, problem.to, problem.reason);

        const owner =
          process.env["ORDER_NOTIFY_EMAIL"] ||
          process.env["ADMIN_EMAIL"] ||
          process.env["OWNER_EMAIL"];
        // Missing configuration can't be fixed by a retry: log and acknowledge. Also
        // never alert about an alert, or a bouncing owner address would loop.
        if (!owner || !process.env["RESEND_API_KEY"] || problem.to.includes(owner)) return ok();

        try {
          await sendMail(
            ownerDeliveryProblem({ event: event.type, ...problem }, owner, headers.id!),
          );
        } catch (err) {
          // Transient failure: 500 makes Resend retry; the idempotency key prevents duplicates.
          console.error("Resend webhook: owner alert failed", err);
          return new Response("Alert failed", { status: 500 });
        }
        return ok();
      },
    },
  },
});
