import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { cartSchema } from "@/lib/cart-schema";
import { createCheckoutSession } from "@/lib/stripe.server";

// Turns the whole cart (every line, quantity and color) into one Stripe Checkout
// Session and returns its URL. Input is re-validated here: never trust the browser.
export const startCheckout = createServerFn({ method: "POST" })
  .inputValidator(cartSchema)
  .handler(async ({ data }) => {
    const origin = new URL(getRequest().url).origin;
    const url = await createCheckoutSession(data, origin);
    return { url };
  });
