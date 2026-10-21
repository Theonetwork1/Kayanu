import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell, PolicyPage } from "@/components/Layout";
import { CONTACT_EMAIL } from "@/config";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — KAYANU" },
      { name: "description", content: `Questions about your order? Contact KAYANU support at ${CONTACT_EMAIL}.` },
      { property: "og:title", content: "Contact — KAYANU" },
      { property: "og:description", content: "Get in touch with KAYANU support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const field = "w-full rounded-2xl border bg-card px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring";
  return (
    <SiteShell>
      <PolicyPage title="Contact us">
        <p>Email us anytime at <a className="font-semibold text-accent underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> — we reply within 1–2 business days.</p>
        {sent ? (
          <p className="card-soft p-6 font-semibold text-foreground">Thanks! Your message has been received.</p>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
            <input required placeholder="Name" aria-label="Name" className={field} />
            <input required type="email" placeholder="Email" aria-label="Email" className={field} />
            <input placeholder="Order number (optional)" aria-label="Order number" className={field} />
            <textarea required rows={5} placeholder="Message" aria-label="Message" className={field} />
            <button className="btn-primary">Send message</button>
          </form>
        )}
      </PolicyPage>
    </SiteShell>
  );
}
