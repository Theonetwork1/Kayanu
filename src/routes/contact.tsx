import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell, PolicyPage } from "@/components/Layout";
import { CONTACT_EMAIL } from "@/config";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — KAYANU" },
      {
        name: "description",
        content: `Questions about your order? Contact KAYANU support at ${CONTACT_EMAIL}.`,
      },
      { property: "og:title", content: "Contact — KAYANU" },
      { property: "og:description", content: "Get in touch with KAYANU support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

function contactMailto(f: FormData) {
  const get = (k: string) => String(f.get(k) ?? "").trim();
  const order = get("order");
  const subject = order
    ? `Order ${order} — question from ${get("name")}`
    : `Question from ${get("name")}`;
  const details = [
    `Name: ${get("name")}`,
    `Email: ${get("email")}`,
    ...(order ? [`Order: ${order}`] : []),
  ];
  const body = `${get("message")}\n\n—\n${details.join("\n")}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function Contact() {
  const [sent, setSent] = useState(false);
  const field =
    "w-full rounded-2xl border bg-card px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring";
  return (
    <SiteShell>
      <PolicyPage title="Contact us">
        <p>
          Email us anytime at{" "}
          <a className="font-semibold text-accent underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{" "}
          — we reply within 1–2 business days.
        </p>
        {sent ? (
          <p className="card-soft p-6 font-semibold text-foreground">
            Your email app should now be open with your message — just hit send. Nothing opened?
            Write to us directly at{" "}
            <a className="text-accent underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        ) : (
          // No backend yet: hand the message to the visitor's email app so it actually reaches support.
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = contactMailto(new FormData(e.currentTarget));
              setSent(true);
            }}
            className="space-y-4"
          >
            <input required name="name" placeholder="Name" aria-label="Name" className={field} />
            <input
              required
              name="email"
              type="email"
              placeholder="Email"
              aria-label="Email"
              className={field}
            />
            <input
              name="order"
              placeholder="Order number (optional)"
              aria-label="Order number"
              className={field}
            />
            <textarea
              required
              name="message"
              rows={5}
              placeholder="Message"
              aria-label="Message"
              className={field}
            />
            <button className="btn-primary">Send message</button>
          </form>
        )}
      </PolicyPage>
    </SiteShell>
  );
}
