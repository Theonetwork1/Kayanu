import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PolicyPage } from "@/components/Layout";
import { CONTACT_EMAIL, canonicalLink } from "@/config";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — KAYANU" },
      {
        name: "description",
        content:
          "KAYANU makes portable essentials for people on the move: a USB-C blender and a 20-bar self-heating espresso maker. Real specs, honest limits, 30-day guarantee.",
      },
      { property: "og:title", content: "About — KAYANU" },
      {
        property: "og:description",
        content: "Portable essentials. Take it anywhere.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [canonicalLink("/about")],
  }),
  component: About,
});

function About() {
  return (
    <SiteShell>
      <PolicyPage title="About KAYANU">
        <p>
          KAYANU makes portable essentials for people who are always moving. Two products, one
          idea: the drinks you love, made by you, anywhere — gym, office, car or trail.
        </p>
        <h2>Why these two?</h2>
        <p>
          A café stop costs $5–$7 a day — over $150 a month — for a smoothie or a coffee you
          could make yourself in minutes. Our portable blender turns soft fruit, milk and
          protein powder into a smoothie in about 30 seconds. Our portable espresso maker
          brews a real shot with rich crema under 20-bar pressure, heating cold water itself.
          Both charge over USB-C and fit in a bag or a cup holder.
        </p>
        <h2>Honest products</h2>
        <p>
          We state the real limits on every product page: how many shots you get per charge,
          what the blender is built for (soft fruit and shakes — not heavy frozen fruit), and
          which capsules work. A product that disappoints costs more than a sale, so we would
          rather you buy knowing exactly what it does.
        </p>
        <h2>Our promise</h2>
        <p>
          Every order ships fast in the U.S. (1–2 business days processing, 3–8 business days
          delivery) and is covered by our 30-day happiness guarantee: if a product doesn&apos;t
          earn its place in your bag, send it back within 30 days for a full refund. Questions?
          Email us at{" "}
          <a className="font-semibold text-accent underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{" "}
          — we reply within 1–2 business days.
        </p>
        <p>
          <a href="/#blender" className="font-semibold text-accent underline">
            Shop the Blender
          </a>{" "}
          ·{" "}
          <a href="/#espresso" className="font-semibold text-accent underline">
            Shop the Espresso Maker
          </a>
        </p>
      </PolicyPage>
    </SiteShell>
  );
}
