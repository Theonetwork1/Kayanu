import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PolicyPage } from "@/components/Layout";
import { CONTACT_EMAIL } from "@/config";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Refunds — KAYANU" },
      { name: "description", content: "30-day returns with a full refund. Learn how to start a KAYANU return." },
      { property: "og:title", content: "Returns & Refunds — KAYANU" },
      { property: "og:description", content: "30-day happiness guarantee and how to start a return." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <SiteShell>
      <PolicyPage title="Returns & Refunds">
        <h2>30-day happiness guarantee</h2>
        <p>If you're not happy with your purchase, you can return it within 30 days of delivery for a full refund.</p>
        <h2>How to start a return</h2>
        <p>Email <a className="text-accent underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with your order number and reason for return. We'll reply with return instructions.</p>
        <h2>Damaged or defective items</h2>
        <p>If a zipper or any part of your set fails, contact us and we'll replace it or refund you.</p>
        <h2>Refund timing</h2>
        <p>Once we receive and inspect your return, we'll issue your refund to the original payment method, usually within 5–10 business days. Your bank may take additional time to post it.</p>
      </PolicyPage>
    </SiteShell>
  ),
});
