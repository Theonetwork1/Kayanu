import { describe, it, expect } from "vitest";
import { ADDONS, VARIANTS, WELCOME_CODE } from "@/config";

const isPaymentLink = (url: string) => /^https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+$/.test(url);

describe("checkout links", () => {
  it("every bundle has its own live Stripe payment link", () => {
    for (const v of VARIANTS) expect(isPaymentLink(v.checkoutUrl), v.id).toBe(true);
    expect(new Set(VARIANTS.map((v) => v.checkoutUrl)).size).toBe(VARIANTS.length);
  });

  it("every add-on has its own live Stripe payment link", () => {
    for (const a of ADDONS) expect(isPaymentLink(a.checkoutUrl), a.id).toBe(true);
    expect(new Set(ADDONS.map((a) => a.checkoutUrl)).size).toBe(ADDONS.length);
  });

  it("the welcome code is either unset or a real-looking code", () => {
    if (WELCOME_CODE !== null) expect(WELCOME_CODE).toMatch(/^[A-Z0-9]{3,}$/);
  });
});
