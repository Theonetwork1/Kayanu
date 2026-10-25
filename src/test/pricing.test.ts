import { describe, it, expect } from "vitest";
import { shippingFor } from "@/lib/pricing";
import { getVariant } from "@/config";

describe("shipping", () => {
  it("charges $4.95 under $50", () => expect(shippingFor(34.99)).toBe(4.95));
  it("is free at exactly $50", () => expect(shippingFor(50)).toBe(0));
  it("is free for the 2-set bundle", () => expect(shippingFor(getVariant("2-sets").price)).toBe(0));
});

describe("prices", () => {
  it("1 Set is $34.99", () => expect(getVariant("1-set").price).toBe(34.99));
  it("2 Sets is $59.99", () => expect(getVariant("2-sets").price).toBe(59.99));
});
