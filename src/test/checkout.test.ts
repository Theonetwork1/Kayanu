import { describe, it, expect } from "vitest";
import { MAX_LINE_QTY, cartSchema, parseStoredCart } from "@/lib/cart-schema";
import { buildCheckoutSessionParams } from "@/lib/stripe.server";

describe("parseStoredCart", () => {
  it("returns [] for missing or broken data", () => {
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart("{not json")).toEqual([]);
    expect(parseStoredCart('{"variant":"1-set"}')).toEqual([]);
  });

  it("reads carts saved before add-ons existed (no type) as sets", () => {
    const raw = JSON.stringify([{ variant: "2-sets", color: "sand", qty: 1 }]);
    expect(parseStoredCart(raw)).toEqual([
      { type: "set", variant: "2-sets", color: "sand", qty: 1 },
    ]);
  });

  it("drops lines the store no longer sells instead of crashing", () => {
    const raw = JSON.stringify([
      { variant: "3-sets", color: "sand", qty: 1 },
      { variant: "1-set", color: "purple", qty: 1 },
      { variant: "1-set", color: "sand", qty: "2" },
      { type: "addon", addon: "kit-set-vacuum", qty: 1 },
      null,
      { type: "set", variant: "2-sets", color: "charcoal", qty: 1 },
      { type: "addon", addon: "toiletry-xl", qty: 1 },
    ]);
    expect(parseStoredCart(raw)).toEqual([
      { type: "set", variant: "2-sets", color: "charcoal", qty: 1 },
      { type: "addon", addon: "toiletry-xl", qty: 1 },
    ]);
  });

  it("clamps quantities and merges duplicates", () => {
    const raw = JSON.stringify([
      { type: "set", variant: "1-set", color: "sand", qty: 2.7 },
      { type: "set", variant: "1-set", color: "sand", qty: 1 },
      { type: "set", variant: "2-sets", color: "sand", qty: 999 },
      { type: "set", variant: "2-sets", color: "charcoal", qty: 0 },
    ]);
    expect(parseStoredCart(raw)).toEqual([
      { type: "set", variant: "1-set", color: "sand", qty: 3 },
      { type: "set", variant: "2-sets", color: "sand", qty: MAX_LINE_QTY },
    ]);
  });
});

describe("server cart validation", () => {
  it("rejects empty carts, bad quantities and unknown items", () => {
    expect(cartSchema.safeParse([]).success).toBe(false);
    expect(
      cartSchema.safeParse([{ type: "set", variant: "1-set", color: "sand", qty: 0 }]).success,
    ).toBe(false);
    expect(
      cartSchema.safeParse([{ type: "set", variant: "1-set", color: "sand", qty: 1.5 }]).success,
    ).toBe(false);
    expect(
      cartSchema.safeParse([{ type: "set", variant: "x", color: "sand", qty: 1 }]).success,
    ).toBe(false);
    expect(cartSchema.safeParse([{ type: "addon", addon: "x", qty: 1 }]).success).toBe(false);
    expect(cartSchema.safeParse([{ variant: "1-set", color: "sand", qty: 1 }]).success).toBe(false);
  });
});

describe("Stripe checkout session params", () => {
  it("sends every line with its quantity, color and server-side price", () => {
    const p = buildCheckoutSessionParams(
      [
        { type: "set", variant: "2-sets", color: "ocean-teal", qty: 2 },
        { type: "set", variant: "1-set", color: "sand", qty: 1 },
        { type: "addon", addon: "vacuum-bags", qty: 3 },
      ],
      "https://shop.test",
    );
    expect(p.get("line_items[0][quantity]")).toBe("2");
    expect(p.get("line_items[0][price_data][unit_amount]")).toBe("4999");
    expect(p.get("line_items[0][price_data][product_data][metadata][color]")).toBe("ocean-teal");
    expect(p.get("line_items[0][price_data][product_data][description]")).toBe("Color: Ocean Teal");
    expect(p.get("line_items[1][quantity]")).toBe("1");
    expect(p.get("line_items[1][price_data][unit_amount]")).toBe("2999");
    expect(p.get("line_items[1][price_data][product_data][metadata][color]")).toBe("sand");
    expect(p.get("line_items[2][quantity]")).toBe("3");
    expect(p.get("line_items[2][price_data][unit_amount]")).toBe("1999");
    expect(p.get("line_items[2][price_data][product_data][metadata][addon]")).toBe("vacuum-bags");
    expect(p.get("metadata[cart]")).toBe("2x 2 Sets / ocean-teal, 1x 1 Set / sand, 3x vacuum-bags");
    expect(p.get("shipping_options[0][shipping_rate_data][fixed_amount][amount]")).toBe("0");
    expect(p.get("allow_promotion_codes")).toBe("true");
    expect(p.get("success_url")).toBe(
      "https://shop.test/order-confirmed?session_id={CHECKOUT_SESSION_ID}",
    );
  });

  it("charges flat shipping under the free-shipping threshold", () => {
    const p = buildCheckoutSessionParams(
      [{ type: "set", variant: "1-set", color: "charcoal", qty: 1 }],
      "https://shop.test",
    );
    expect(p.get("shipping_options[0][shipping_rate_data][fixed_amount][amount]")).toBe("495");
  });

  it("gives the Complete Kit (1 Set + vacuum bags) free shipping", () => {
    const p = buildCheckoutSessionParams(
      [
        { type: "set", variant: "1-set", color: "sand", qty: 1 },
        { type: "addon", addon: "vacuum-bags", qty: 1 },
      ],
      "https://shop.test",
    );
    expect(p.get("shipping_options[0][shipping_rate_data][fixed_amount][amount]")).toBe("0");
  });
});
