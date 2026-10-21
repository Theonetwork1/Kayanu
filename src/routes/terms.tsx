import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PolicyPage } from "@/components/Layout";
import { CONTACT_EMAIL, STORE_NAME } from "@/config";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — KAYANU" },
      { name: "description", content: "Terms governing use of the KAYANU website and purchases." },
      { property: "og:title", content: "Terms of Service — KAYANU" },
      { property: "og:description", content: "Terms for using the KAYANU store." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <SiteShell>
      <PolicyPage title="Terms of Service">
        <p>By using this website or purchasing from {STORE_NAME}, you agree to these terms.</p>
        <h2>Orders & pricing</h2>
        <p>All prices are in U.S. dollars. We reserve the right to refuse or cancel orders, for example in case of pricing errors or suspected fraud. If an order is cancelled after payment, you'll be fully refunded.</p>
        <h2>Shipping & returns</h2>
        <p>Shipping and returns are governed by our Shipping Policy and Returns & Refunds policy.</p>
        <h2>Use of the site</h2>
        <p>Content on this site is owned by {STORE_NAME} and may not be copied without permission. You agree not to misuse the site.</p>
        <h2>Limitation of liability</h2>
        <p>To the extent permitted by law, our liability is limited to the amount you paid for the product.</p>
        <h2>Changes</h2>
        <p>We may update these terms from time to time. Questions? Email <a className="text-accent underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      </PolicyPage>
    </SiteShell>
  ),
});
