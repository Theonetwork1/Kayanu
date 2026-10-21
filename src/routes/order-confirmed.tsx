import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteShell, PolicyPage } from "@/components/Layout";
import { useCart } from "@/lib/cart";
import { CONTACT_EMAIL } from "@/config";

export const Route = createFileRoute("/order-confirmed")({
  head: () => ({
    meta: [{ title: "Order confirmed — KAYANU" }, { name: "robots", content: "noindex" }],
  }),
  component: OrderConfirmed,
});

function OrderConfirmed() {
  const { clear } = useCart();
  // Stripe only redirects here after a successful payment, so the cart is done.
  useEffect(() => clear(), [clear]);
  return (
    <SiteShell>
      <PolicyPage title="Thank you for your order!">
        <p>
          Your payment went through. You'll get a confirmation email from us shortly, then tracking
          as soon as your order ships (processing takes 1–2 business days).
        </p>
        <p>
          Questions about your order? Email{" "}
          <a className="text-accent underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <Link to="/" className="btn-primary">
          Back to the store
        </Link>
      </PolicyPage>
    </SiteShell>
  );
}
