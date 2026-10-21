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
  const configure = () => {
    CJ_SET_VIDS.sand = "VID-SET-SAND";
    if (vacuum.kind === "fixed") vacuum.vid = "VID-VACUUM";
    CJ_SHIPPING.logisticName = "USPS+";
    CJ_SHIPPING.fromCountryCode = "US";
  };
  afterEach(() => {
    CJ_SET_VIDS.sand = null;
    if (vacuum.kind === "fixed") vacuum.vid = null;
    CJ_SHIPPING.logisticName = null;
    CJ_SHIPPING.fromCountryCode = null;
  });

  it("refuses to build while the catalog is not configured", () => {
    expect(buildCjOrder(session, { sandbox: true, autoPay: false })).toEqual({
      ok: false,
      reason: "CJ_SHIPPING (logisticName / fromCountryCode) is not set in cj-catalog.ts",
    });
    CJ_SHIPPING.logisticName = "USPS+";
    CJ_SHIPPING.fromCountryCode = "US";
    const r = buildCjOrder(session, { sandbox: true, autoPay: false });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.reason).toContain("CJ vid not set");
  });

  it("maps Stripe products and the set color to CJ variants and quantities", () => {
    configure();
    const r = buildCjOrder(session, { sandbox: true, autoPay: false });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.body.products).toEqual([
      { vid: "VID-SET-SAND", quantity: 3 }, // 2 Sets + 1 Set, same color
      { vid: "VID-VACUUM", quantity: 1 },
    ]);
    expect(r.body).toMatchObject({
      orderNumber: "pi_3TestABC",
      shippingCountryCode: "US",
      shippingCountry: "United States",
      shippingProvince: "TX",
      logisticName: "USPS+",
      fromCountryCode: "US",
      isSandbox: 1,
      payType: 3,
    });
    expect(buildCjOrder(session, { sandbox: false, autoPay: true }).ok && true).toBe(true);
  });

  it("refuses unknown products, colors and incomplete addresses", () => {
    configure();
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
