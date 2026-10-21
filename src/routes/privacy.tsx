import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PolicyPage } from "@/components/Layout";
import { CONTACT_EMAIL, STORE_NAME } from "@/config";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — KAYANU" },
      {
        name: "description",
        content: "How KAYANU collects, uses and protects your personal information.",
      },
      { property: "og:title", content: "Privacy Policy — KAYANU" },
      { property: "og:description", content: "How KAYANU handles your personal information." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <SiteShell>
      <PolicyPage title="Privacy Policy">
        <p>
          This policy explains how {STORE_NAME} ("we") collects and uses your information when you
          visit our site or place an order.
        </p>
        <h2>Information we collect</h2>
        <p>
          Contact details (name, email, shipping address), order details, and basic device and
          browsing data such as IP address and pages viewed. Payment details are handled by our
          payment processor; we do not store full card numbers.
        </p>
        <h2>How we use it</h2>
        <p>
          To process and ship orders, provide customer support, send order updates, and — if you opt
          in — send marketing emails. You can unsubscribe at any time.
        </p>
        <h2>Sharing</h2>
        <p>
          We share information only with service providers needed to run our store (payment,
          shipping, email). We do not sell your personal information.
        </p>
        <h2>Cookies</h2>
        <p>We use cookies and local storage to keep your cart and understand site usage.</p>
        <h2>Your rights</h2>
        <p>
          You may request access to, correction of, or deletion of your data by emailing{" "}
          <a className="text-accent underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </PolicyPage>
    </SiteShell>
  ),
});
