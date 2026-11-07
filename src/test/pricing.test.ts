import { describe, it, expect } from "vitest";
import { shippingFor } from "@/lib/pricing";
import { getProductBySlug } from "@/lib/products";

const blender = getProductBySlug("kayanu-portable-blender")!;
const espresso = getProductBySlug("kayanu-portable-espresso-maker")!;

describe("shipping", () => {
  it("charges $4.95 under $50", () => expect(shippingFor(blender.price)).toBe(4.95));
  it("charges $4.95 for the espresso maker alone ($49.99)", () =>
    expect(shippingFor(espresso.price)).toBe(4.95));
  it("is free at exactly $50", () => expect(shippingFor(50)).toBe(0));
  it("is free when both products are in the cart", () =>
    expect(shippingFor(blender.price + espresso.price)).toBe(0));
  it("is zero for an empty cart", () => expect(shippingFor(0)).toBe(0));
});

describe("prices", () => {
  it("Blender is $29.99", () => expect(blender.price).toBe(29.99));
  it("Espresso Maker is $49.99", () => expect(espresso.price).toBe(49.99));
});
