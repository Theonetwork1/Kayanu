# KAYANU

Small e-commerce store (TanStack Start on Vercel) selling two products: the KAYANU Portable Blender (USB-C) and the KAYANU Portable Espresso Maker (20-bar).

- Catalog and copy rules: `src/lib/products.ts` (read the header comment before writing product claims)
- Prices, shipping, canonical domain: `src/config.ts`
- Checkout: `POST /api/checkout` builds a Stripe Checkout Session from the cart; webhook at `/api/stripe-webhook`
- Fulfillment: CJdropshipping (`src/lib/cj*.ts`); orders without a CJ mapping trigger an email to place them manually
- Tests: `bun run test` / `npm test`
