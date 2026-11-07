// Central store configuration — change prices and checkout links here only.
export const STORE_NAME = "KAYANU";
export const CONTACT_EMAIL = "support@kayanu.com";
// Canonical domain: the Lovable preview (kayanu.lovable.app) points search engines here.
export const SITE_URL = "https://www.kayanu.com";
export const canonicalLink = (path: string) => ({ rel: "canonical", href: `${SITE_URL}${path}` });

// Checkout goes through the cart's /api/checkout (Stripe Checkout Sessions built
// from the cart items), so the store works without per-product Stripe payment
// links. Payment links can be added later (Stripe connector needs
// reauthorization first) for direct Buy-now links.
export const CHECKOUT_URLS: Record<string, string> = {};

// Welcome discount shown on the home page. Leave null until the code exists as an
// active Promotion Code in Stripe; while null, the offer is hidden so the site
// never promises a code that fails.
export const WELCOME_CODE: string | null = null;

export const SHIPPING_FLAT = 4.95;
export const FREE_SHIPPING_THRESHOLD = 50;

export const formatPrice = (n: number) => `$${n.toFixed(2)}`;
