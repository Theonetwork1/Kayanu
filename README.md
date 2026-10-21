# KAYANU Travel Essentials

Build a complete one-product e-commerce storefront for the brand KAYANU (premium travel essentials), selling ONE hero product: an 8-piece compression packing cube set. The store targets US customers and is written entirely in English. This is a real store that will take orders, so make it polished, conversion-focused and mobile-first.

DESIGN
- Warm off-white background (#FAF7F2), deep teal ink (#0C3B3C) for headings and primary buttons, terracotta accent (#E07856) for badges and highlights. Clean premium DTC look (think Away / July luggage brands).
- Headings in a bold geometric sans (Sora or Manrope), body in Inter. Rounded cards, soft shadows, generous spacing, subtle scroll reveal animations.
- For imagery, generate warm, photorealistic-style visuals of UNBRANDED compression packing cubes neatly packed inside an open suitcase (neutral charcoal/teal/sand colors), plus a flat-lay of the 8 pieces. Keep every image in a clearly replaceable <img>/component slot.

CENTRAL CONFIG (very important)
- Create src/config.ts exporting STORE_NAME ("KAYANU"), CONTACT_EMAIL ("support@kayanu.com"), product variants with prices, and CHECKOUT_URLS (one placeholder URL string per variant, default "#") so prices and Stripe payment links can be changed in ONE place. All prices and checkout buttons across the site must read from this config.
- Variants: "1 Set" $29.99 (compare-at $39.99), "2 Sets" $49.99 (compare-at $59.98) with a "MOST POPULAR" badge. Colors: Charcoal, Ocean Teal, Sand (color selector updates the selected variant state).
- Shipping: flat $4.95, FREE on orders of $49 or more. Cart drawer shows a free-shipping progress bar toward $49.

HOME PAGE SECTIONS (in this order)
1. Announcement bar: "FAST U.S. SHIPPING — DELIVERED IN 3–8 DAYS • 30-DAY HAPPINESS GUARANTEE"
2. Header: KAYANU wordmark, links (Shop, How It Works, What's Inside, FAQ), cart icon with item count.
3. Hero: headline "Pack twice as much. Stress half as much." Subcopy: "KAYANU compression cubes squeeze the air out of your clothes with a second zipper, so everything fits — and stays organized — in any suitcase." CTA button "Get the 8-Piece Set — $29.99" scrolling to the buy section, secondary link "See how it works". Trust chips under CTA: "Quality-checked zippers", "Ships from U.S. warehouse", "30-day guarantee".
4. Problem/solution strip: "Still sitting on your suitcase to zip it shut?" with 3 pain points (overpacking chaos, wasted space, wrinkled messy clothes) and how KAYANU fixes each.
5. "How it works" — 3 steps: 1) Pack each cube by category, 2) Zip the compression zipper to squeeze out the air, 3) Drop them in your suitcase and go.
6. "What's inside the set": grid of the 8 pieces — 2 XL compression cubes, 2 Large, 2 Medium, 2 Small... plus a shoe pouch and a laundry bag (present as "8 compression cubes + shoe pouch + laundry bag").
7. Buy section: product visual, color selector, variant selector (1 Set / 2 Sets with prices and savings), quantity, Add to Cart button, bullet guarantees, accordion details (materials: ripstop nylon; care; dimensions note "fits carry-on and checked luggage").
8. Comparison table: KAYANU compression cubes vs Regular packing cubes vs No cubes at all (rows: space saved, organization, zipper quality, dirty-clothes separation).
9. Guarantee band: "Try them on your next trip. If you don't pack lighter, send them back within 30 days for a full refund."
10. FAQ (accordion, 6 questions): How long is shipping? (Processing 1–2 business days, then 3–8 business days from our U.S. warehouse, tracking provided.) What's included? Will the set fit a carry-on? How does compression work? What if a zipper breaks? (we replace or refund — quality-checked before shipping) What is your return policy? (30 days, full refund.)
11. Email capture: "Get 10% off your first order" with email input and success state (front-end only for now).
12. Footer: KAYANU, short tagline, links to Shipping Policy, Returns & Refunds, Privacy Policy, Terms of Service, Contact; copyright line.

OTHER PAGES (React Router)
- /shipping — Shipping Policy page with the processing + 3–8 business day U.S. delivery details and tracking explanation.
- /returns — Returns & Refunds: 30-day window, how to start a return via support email, refund timing.
- /privacy — concise standard Privacy Policy.
- /terms — concise standard Terms of Service.
- /contact — contact page with support email and a simple form (front-end only).

CART
- Slide-in cart drawer using a cart context: line items with variant + color, quantity controls, remove, subtotal, shipping logic (free at $49+, otherwise $4.95), free-shipping progress bar, Checkout button that navigates to the CHECKOUT_URLS entry of the chosen configuration (placeholder "#" is fine for now).

HONESTY RULES (strict)
- Do NOT add fake customer reviews, star ratings, testimonial names, "X happy customers" counters, fake countdown timers or any invented social proof. The brand is new: sell the product, the demonstration and the guarantee.
- Only make the shipping and guarantee claims written above.

SEO: page title "KAYANU — Compression Packing Cubes | Pack More, Stress Less", a proper meta description, semantic headings.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://kayanu.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cc74609f-0cf3-494b-a31f-117fc90ee57c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
