import "@/lib/env.server";
import { createFileRoute } from "@tanstack/react-router";
import { sendMail, type Mail } from "@/lib/emails.server";
import { CONTACT_EMAIL, SITE_URL } from "@/config";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Newsletter signup: no list provider yet, so a signup sends a welcome email to
// the subscriber and a notification to the owner, who collects the addresses.
// If RESEND_API_KEY is not configured, the signup is refused cleanly (503)
// instead of pretending it worked.
export const Route = createFileRoute("/api/newsletter")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let body: { email?: unknown };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request." }, 400);
        }
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
          return json({ error: "Please enter a valid email address." }, 400);
        }

        const key = email.replace(/[^a-z0-9]/g, "");
        const welcome: Mail = {
          to: email,
          subject: "Welcome to KAYANU",
          html: `<!DOCTYPE html><html><body style="margin:0;padding:24px;background-color:#FAF7F2;font-family:Inter,Arial,sans-serif;color:#3D5A5B;"><div style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;padding:36px;border:1px solid #EFE9E0;"><p style="font-size:13px;letter-spacing:3px;font-weight:800;color:#0C3B3C;">KAYANU</p><h1 style="font-size:26px;color:#0C3B3C;">Welcome aboard</h1><p style="font-size:16px;line-height:25px;">Thanks for joining the KAYANU list. You&apos;ll hear from us about new products, restocks and honest updates — no spam, no daily noise.</p><p style="font-size:16px;line-height:25px;">In the meantime, take a look at the two essentials that started it all:</p><p><a href="${SITE_URL}/product/kayanu-portable-blender" style="color:#E07856;">Portable Blender — $29.99</a><br><a href="${SITE_URL}/product/kayanu-portable-espresso-maker" style="color:#E07856;">Portable Espresso Maker — $49.99</a></p><p style="font-size:13px;color:#6B7F80;">Changed your mind? Just reply to this email and we&apos;ll remove you.</p></div></body></html>`,
          idempotencyKey: `newsletter-welcome-${key}`,
          replyTo: CONTACT_EMAIL,
        };
        const ownerNote: Mail = {
          to: CONTACT_EMAIL,
          subject: `New newsletter signup: ${email}`,
          html: `<p>New newsletter signup on kayanu.com:</p><p><strong>${email}</strong></p><p>Add this address to the mailing list.</p>`,
          idempotencyKey: `newsletter-owner-${key}`,
          replyTo: email,
        };

        try {
          await sendMail(welcome);
          await sendMail(ownerNote);
        } catch (err) {
          console.error("Newsletter signup failed:", err);
          return json(
            { error: "Email signup is temporarily unavailable. Please try again later." },
            503,
          );
        }
        return json({ ok: true });
      },
    },
  },
});
