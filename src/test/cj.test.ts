import { afterEach, describe, it, expect } from "vitest";
import { CJ_PRODUCTS, CJ_SET_VIDS, CJ_SHIPPING } from "@/lib/cj-catalog";
import {
  buildCjOrder,
  cjSign,
  readCjShipment,
  verifyCjSignature,
  type PaidSession,
} from "@/lib/cj.server";

describe("CJ webhook signature", () => {
  const body = '{"messageId":"123111","messageType":"INSERT","params":"123","type":"PRODUCT"}';

  it("matches the example from the CJ documentation", async () => {
    expect(await cjSign("123", body)).toBe("AHxoGFMoS/4mZfJ5vFes5//Pz2QibFQhh3GlrTtnWpk=");
  });

  it("rejects a tampered body, another openId or a missing header", async () => {
    const sign = await cjSign("123", body);
    expect(await verifyCjSignature(body, sign, "123")).toBe(true);
    expect(await verifyCjSignature(body.replace("123111", "999"), sign, "123")).toBe(false);
    expect(await verifyCjSignature(body, sign, "124")).toBe(false);
    expect(await verifyCjSignature(body, null, "123")).toBe(false);
  });
});

describe("buildCjOrder", () => {
  const session: PaidSession = {
    paymentIntent: "pi_3TestABC",
    number: "KAY-ABCD1234",
    email: "jane@example.com",
    name: "Jane Doe",
    address: {
      line1: "123 Main St",
      city: "Austin",
      state: "TX",
      postal_code: "78701",
      country: "US",
    },
    color: "sand",
    lines: [
      { product: "prod_VTzjxle0Qj1kVQ", qty: 1, description: "2 Sets" },
      { product: "prod_VTzjI2JA2uorKe", qty: 1, description: "1 Set" },
      { product: "prod_VTzj7CDzYr5gR2", qty: 1, description: "Vacuum bags" },
    ],
  };
  const vacuum = CJ_PRODUCTS["prod_VTzj7CDzYr5gR2"]!.components[0]!;
  const saved = {
    sand: CJ_SET_VIDS.sand,
    vacuumVid: vacuum.kind === "fixed" ? vacuum.vid : null,
    shipping: { ...CJ_SHIPPING },
  };
  afterEach(() => {
    CJ_SET_VIDS.sand = saved.sand;
    if (vacuum.kind === "fixed") vacuum.vid = saved.vacuumVid;
    Object.assign(CJ_SHIPPING, saved.shipping);
  });

  it("every Stripe product and set color has a CJ variant, and a shipping method is set", () => {
    expect(Object.values(CJ_SET_VIDS).every(Boolean)).toBe(true);
    for (const p of Object.values(CJ_PRODUCTS)) {
      for (const c of p.components) if (c.kind === "fixed") expect(c.vid, p.label).toBeTruthy();
    }
    expect(CJ_SHIPPING.logisticName && CJ_SHIPPING.fromCountryCode).toBeTruthy();
    // The vacuum pack is advertised as 12 bags.
    const bags = CJ_PRODUCTS["prod_VTzj7CDzYr5gR2"]!.components.reduce((n, c) => n + c.qty, 0);
    expect(bags).toBe(12);
  });

  it("refuses to build when a variant or the shipping method is missing", () => {
    CJ_SHIPPING.logisticName = null;
    expect(buildCjOrder(session, { sandbox: true, autoPay: false })).toEqual({
      ok: false,
      reason: "CJ_SHIPPING (logisticName / fromCountryCode) is not set in cj-catalog.ts",
    });
    Object.assign(CJ_SHIPPING, saved.shipping);
    CJ_SET_VIDS.sand = null;
    const r = buildCjOrder(session, { sandbox: true, autoPay: false });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.reason).toContain("CJ vid not set");
  });

  it("maps Stripe products and the set color to CJ variants and quantities", () => {
    const r = buildCjOrder(session, { sandbox: true, autoPay: false });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.body.products).toEqual([
      { vid: CJ_SET_VIDS.sand, quantity: 3 }, // 2 Sets + 1 Set, same color
      { vid: "2608260124491617600", quantity: 4 }, // vacuum bags, 3 sizes × 4
      { vid: "2608260124491617602", quantity: 4 },
      { vid: "2608260124491617603", quantity: 4 },
    ]);
    expect(r.body).toMatchObject({
      orderNumber: "pi_3TestABC",
      shippingCountryCode: "US",
      shippingCountry: "United States",
      shippingProvince: "TX",
      logisticName: CJ_SHIPPING.logisticName,
      fromCountryCode: CJ_SHIPPING.fromCountryCode,
      isSandbox: 1,
      payType: 3,
    });
    expect(buildCjOrder(session, { sandbox: false, autoPay: true })).toMatchObject({
      ok: true,
      body: { isSandbox: 0, payType: 2 },
    });
  });

  it("refuses unknown products, colors and incomplete addresses", () => {
    expect(buildCjOrder({ ...session, color: "red" }, { sandbox: true, autoPay: false }).ok).toBe(
      false,
    );
    expect(
      buildCjOrder(
        { ...session, lines: [{ product: "prod_x", qty: 1, description: "?" }] },
        { sandbox: true, autoPay: false },
      ).ok,
    ).toBe(false);
    expect(
      buildCjOrder(
        { ...session, address: { ...session.address, line1: null } },
        { sandbox: true, autoPay: false },
      ).ok,
    ).toBe(false);
  });
});

describe("readCjShipment", () => {
  it("reads shipped and delivered milestones from ORDER and LOGISTIC pushes", () => {
    expect(
      readCjShipment({
        type: "ORDER",
        params: {
          orderNumber: "pi_1",
          orderStatus: "SHIPPED",
          trackNumber: "TN1",
          trackingUrl: "https://t/1",
        },
      }),
    ).toEqual({
      storeOrderNumber: "pi_1",
      kind: "shipped",
      trackingNumber: "TN1",
      trackingUrl: "https://t/1",
    });
    expect(
      readCjShipment({ type: "ORDER", params: { orderNumber: "pi_1", orderStatus: "DELIVERED" } }),
    ).toEqual({
      storeOrderNumber: "pi_1",
      kind: "delivered",
    });
    expect(
      readCjShipment({
        type: "LOGISTIC",
        params: { storeOrderNumbers: ["pi_2"], trackingNumber: "TN2", trackingStatus: 5 },
      }),
    ).toMatchObject({ storeOrderNumber: "pi_2", kind: "shipped", trackingNumber: "TN2" });
    expect(
      readCjShipment({
        type: "LOGISTIC",
        params: { storeOrderNumbers: ["pi_2"], trackingStatus: 12 },
      }),
    ).toEqual({
      storeOrderNumber: "pi_2",
      kind: "delivered",
    });
  });

  it("ignores pushes that are not shipping news", () => {
    expect(
      readCjShipment({ type: "ORDER", params: { orderNumber: "pi_1", orderStatus: "UNSHIPPED" } }),
    ).toBeNull();
    expect(
      readCjShipment({
        type: "ORDER",
        params: { orderNumber: "pi_1", orderStatus: "SHIPPED", trackNumber: null },
      }),
    ).toBeNull();
    expect(
      readCjShipment({
        type: "LOGISTIC",
        params: { storeOrderNumbers: ["pi_2"], trackingNumber: "TN2", trackingStatus: 13 },
      }),
    ).toBeNull();
    expect(readCjShipment({ type: "PRODUCT", params: {} })).toBeNull();
  });
});
