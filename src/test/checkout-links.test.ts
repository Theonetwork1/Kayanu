import { describe, it, expect } from "vitest";
import { WELCOME_CODE } from "@/config";
import { PRODUCTS } from "@/lib/products";

describe("catalog", () => {
  it("has unique slugs and at least one product", () => {
    expect(PRODUCTS.length).toBeGreaterThan(0);
    expect(new Set(PRODUCTS.map((p) => p.slug)).size).toBe(PRODUCTS.length);
  });

  it("every product has a valid price, a higher compare-at price and an image", () => {
    for (const p of PRODUCTS) {
      expect(p.price, p.slug).toBeGreaterThan(0);
      expect(p.compareAt, p.slug).toBeGreaterThan(p.price);
      expect(p.images.length, p.slug).toBeGreaterThan(0);
      expect(p.variants.length, p.slug).toBeGreaterThan(0);
      expect(p.variants[0]!.price, p.slug).toBe(p.price);
    }
  });

  it("the welcome code is either unset or a real-looking code", () => {
    if (WELCOME_CODE !== null) expect(WELCOME_CODE).toMatch(/^[A-Z0-9]{3,}$/);
  });
});
