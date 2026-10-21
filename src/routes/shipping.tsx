import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PolicyPage } from "@/components/Layout";
import {
  CONTACT_EMAIL,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT,
  formatPrice,
  canonicalLink,
} from "@/config";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — KAYANU" },
      {
        name: "description",
        content:
          "KAYANU ships from our U.S. warehouse: 1–2 day processing, 3–8 business day delivery, tracking on every order.",
      },
      { property: "og:title", content: "Shipping Policy — KAYANU" },
      {
        property: "og:description",
        content: "Processing, delivery times and tracking for KAYANU orders.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [canonicalLink("/shipping")],
  }),
  component: () => (
    <SiteShell>
      <PolicyPage title="Shipping Policy">
        <h2>Where we ship</h2>
        <p>We currently ship to addresses within the United States from our U.S. warehouse.</p>
        <h2>Processing time</h2>
        <p>Orders are processed within 1–2 business days (Monday–Friday, excluding holidays).</p>
        <h2>Delivery time</h2>
        <p>After processing, orders are delivered within 3–8 business days.</p>
        <h2>Shipping cost</h2>
        <p>
          Flat rate of {formatPrice(SHIPPING_FLAT)} per order. Orders of{" "}
          {formatPrice(FREE_SHIPPING_THRESHOLD)} or more ship FREE.
        </p>
        <h2>Tracking</h2>
        <p>
          Once your order ships, you'll receive an email with a tracking number and link so you can
          follow your package until it arrives.
        </p>
        <h2>Questions</h2>
        <p>
          Email us at{" "}
          <a className="text-accent underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </PolicyPage>
    </SiteShell>
  ),
});
