// CJdropshipping API 2.0 client (server-only): access token, order creation, webhook
// signature and event parsing. Docs: https://developers.cjdropshipping.com/en/api/api2/
//
// Env vars (Vercel): CJ_API_KEY (CJ → Apps → API → API Key), CJ_OPEN_ID (openId returned
// with the access token, used to verify CJ webhooks), CJ_SANDBOX ("0" to send real orders;
// anything else, or unset, creates sandbox orders), CJ_AUTO_PAY ("1" pays new orders from
// the CJ balance; otherwise orders are created unpaid and paid in My CJ).
import "@/lib/env.server";
import Stripe from "stripe";
import { CJ_PRODUCTS, CJ_SET_VIDS, CJ_SHIPPING, type SetColor } from "@/lib/cj-catalog";
import { getStripeKey } from "@/lib/emails.server";

const BASE = "https://developers.cjdropshipping.com/api2.0/v1";

export const cjSandbox = () => process.env["CJ_SANDBOX"] !== "0";
const cjAutoPay = () => process.env["CJ_AUTO_PAY"] === "1";

// ---------- HTTP ----------

export class CjError extends Error {
  constructor(
    readonly code: number | undefined,
    message: string,
  ) {
    super(message);
  }
}

// Error codes documented in "Appendix 1: Global Error Codes".
export const CJ_ORDER_EXISTS = 1603003;

type CjEnvelope<T> = { code?: number; result?: boolean; message?: string; data?: T };

async function callCj<T>(
  path: string,
  init: { method?: "GET" | "POST"; token?: string; body?: unknown; query?: Record<string, string> },
): Promise<T> {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(init.query ?? {})) url.searchParams.set(k, v);
  const res = await fetch(url, {
    method: init.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
      ...(init.token ? { "CJ-Access-Token": init.token } : {}),
    },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
  });
  let json: CjEnvelope<T> | undefined;
  try {
    json = (await res.json()) as CjEnvelope<T>;
  } catch {
    json = undefined;
  }
  // Per the docs: success = HTTP 200 AND (code === 200 OR no code field). `message` is informative only.
  if (!res.ok || (json?.code !== undefined && json.code !== 200)) {
    throw new CjError(
      json?.code,
      `CJ ${path} failed (HTTP ${res.status}, code ${json?.code}): ${json?.message ?? ""}`,
    );
  }
  return json?.data as T;
}

// The access token lives 180 days and CJ returns the same one for 24h, so a warm
// function reuses it; cold starts fetch it again (the endpoint allows 1 call/second).
let tokenCache: { token: string; expiresAt: number } | undefined;

async function getToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;
  const apiKey = process.env["CJ_API_KEY"];
  if (!apiKey) throw new CjError(undefined, "CJ_API_KEY is not set");
  const data = await callCj<{ accessToken: string; accessTokenExpiryDate: string }>(
    "/authentication/getAccessToken",
    { body: { apiKey } },
  );
  const expiresAt = Date.parse(data.accessTokenExpiryDate) || Date.now() + 24 * 3600_000;
  tokenCache = { token: data.accessToken, expiresAt };
  return data.accessToken;
}

export async function cjRequest<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; query?: Record<string, string> } = {},
) {
  return callCj<T>(path, { ...init, token: await getToken() });
}

// ---------- webhook signature ----------
// sign header = Base64(HMAC-SHA256(key = openId as a string, message = raw request body)).

const enc = new TextEncoder();

export async function cjSign(openId: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(openId),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(body)));
  let bin = "";
  for (const b of mac) bin += String.fromCharCode(b);
  return btoa(bin);
}

export async function verifyCjSignature(body: string, sign: string | null, openId: string) {
  if (!sign) return false;
  const expected = await cjSign(openId, body);
  if (expected.length !== sign.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sign.charCodeAt(i);
  return diff === 0;
}

// ---------- order building (pure, unit-tested) ----------

export type PaidSession = {
  paymentIntent: string;
  number: string;
  email?: string | undefined;
  phone?: string | undefined;
  name?: string | undefined;
  address: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  };
  color?: string | undefined;
  lines: { product: string; qty: number; description: string }[];
};

export type CjOrderBody = Record<string, unknown> & {
  products: { vid: string; quantity: number }[];
};

const countryName = (code: string) => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};

export function buildCjOrder(
  s: PaidSession,
  opts: { sandbox: boolean; autoPay: boolean },
): { ok: true; body: CjOrderBody } | { ok: false; reason: string } {
  if (!CJ_SHIPPING.logisticName || !CJ_SHIPPING.fromCountryCode) {
    return {
      ok: false,
      reason: "CJ_SHIPPING (logisticName / fromCountryCode) is not set in cj-catalog.ts",
    };
  }
  const a = s.address;
  if (!s.name || !a.line1 || !a.city || !a.state || !a.country) {
    return { ok: false, reason: "Incomplete shipping address on the Stripe session" };
  }

  const qtyByVid = new Map<string, number>();
  for (const line of s.lines) {
    const product = CJ_PRODUCTS[line.product];
    if (!product)
      return {
        ok: false,
        reason: `No CJ mapping for Stripe product ${line.product} (${line.description})`,
      };
    for (const c of product.components) {
      let vid: string | null;
      if (c.kind === "set") {
        if (!s.color || !(s.color in CJ_SET_VIDS)) {
          return { ok: false, reason: `Missing or unknown set color "${s.color ?? ""}"` };
        }
        vid = CJ_SET_VIDS[s.color as SetColor];
      } else {
        vid = c.vid;
      }
      if (!vid)
        return {
          ok: false,
          reason: `CJ vid not set in cj-catalog.ts for ${product.label}${c.kind === "set" ? ` (${s.color})` : ""}`,
        };
      qtyByVid.set(vid, (qtyByVid.get(vid) ?? 0) + c.qty * line.qty);
    }
  }
  if (!qtyByVid.size) return { ok: false, reason: "No items to send to CJ" };

  return {
    ok: true,
    body: {
      // The Stripe PaymentIntent id is the store order number: it is unique, fits CJ's
      // 50-character limit, lets CJ reject duplicates (code 1603003) when Stripe retries,
      // and leads back to the checkout session when CJ webhooks arrive.
      orderNumber: s.paymentIntent,
      remark: `KAYANU ${s.number}`,
      shippingCustomerName: s.name,
      shippingAddress: a.line1,
      ...(a.line2 ? { shippingAddress2: a.line2 } : {}),
      shippingCity: a.city,
      shippingProvince: a.state,
      ...(a.postal_code ? { shippingZip: a.postal_code } : {}),
      shippingCountryCode: a.country,
      shippingCountry: countryName(a.country),
      ...(s.phone ? { shippingPhone: s.phone } : {}),
      ...(s.email ? { email: s.email } : {}),
      logisticName: CJ_SHIPPING.logisticName,
      fromCountryCode: CJ_SHIPPING.fromCountryCode,
      payType: opts.autoPay ? 2 : 3,
      isSandbox: opts.sandbox ? 1 : 0,
      products: [...qtyByVid].map(([vid, quantity]) => ({ vid, quantity })),
    },
  };
}

// ---------- CJ webhook events (pure, unit-tested) ----------

export type CjShipmentEvent = {
  storeOrderNumber: string;
  kind: "shipped" | "delivered";
  trackingNumber?: string | undefined;
  trackingUrl?: string | undefined;
};

type CjWebhookPayload = {
  type?: string;
  messageId?: string;
  params?: {
    orderNumber?: string;
    orderStatus?: string;
    trackNumber?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    trackingStatus?: number;
    storeOrderNumbers?: string[];
  };
};

const DELIVERED_STATUS = 12; // LOGISTIC trackingStatus: 12 = Delivered

export function readCjShipment(payload: CjWebhookPayload): CjShipmentEvent | null {
  const p = payload.params ?? {};
  const trackingUrl = p.trackingUrl ?? undefined;
  if (payload.type === "ORDER" && p.orderNumber) {
    if (p.orderStatus === "DELIVERED")
      return { storeOrderNumber: p.orderNumber, kind: "delivered" };
    if (p.orderStatus === "SHIPPED" && p.trackNumber) {
      return {
        storeOrderNumber: p.orderNumber,
        kind: "shipped",
        trackingNumber: p.trackNumber,
        trackingUrl,
      };
    }
    return null;
  }
  const storeOrderNumber = p.storeOrderNumbers?.[0];
  if (payload.type === "LOGISTIC" && storeOrderNumber) {
    if (p.trackingStatus === DELIVERED_STATUS) return { storeOrderNumber, kind: "delivered" };
    // 1–11 = in transit; 0 = no info yet, 13/14 = exception/return (not "shipped" news).
    if (
      p.trackingNumber &&
      p.trackingStatus !== undefined &&
      p.trackingStatus >= 1 &&
      p.trackingStatus <= 11
    ) {
      return { storeOrderNumber, kind: "shipped", trackingNumber: p.trackingNumber, trackingUrl };
    }
  }
  return null;
}

// ---------- Stripe side ----------
// Without a database, the Stripe PaymentIntent metadata records what was already done
// (CJ order id, shipped/delivered emails), so retries and repeated CJ pushes stay quiet.

const stripeClient = () => {
  const key = getStripeKey();
  if (!key) throw new Error("Missing Stripe secret key (STRIPE_SECRET_KEY)");
  return new Stripe(key);
};

export async function loadPaidSession(sessionId: string): Promise<PaidSession> {
  const s = await stripeClient().checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
  const raw = s as unknown as {
    collected_information?: {
      shipping_details?: { name?: string | null; address?: PaidSession["address"] | null } | null;
    } | null;
    shipping_details?: { name?: string | null; address?: PaidSession["address"] | null } | null;
    payment_intent?: string | { id: string } | null;
  };
  const ship = raw.collected_information?.shipping_details ?? raw.shipping_details ?? null;
  const pi = typeof raw.payment_intent === "string" ? raw.payment_intent : raw.payment_intent?.id;
  if (!pi) throw new Error(`Session ${sessionId} has no PaymentIntent`);
  const color = s.custom_fields?.find((f) => f.key === "color")?.dropdown?.value ?? undefined;
  return {
    paymentIntent: pi,
    number: `KAY-${s.id.slice(-8).toUpperCase()}`,
    email: s.customer_details?.email ?? undefined,
    phone: s.customer_details?.phone ?? undefined,
    name: ship?.name ?? s.customer_details?.name ?? undefined,
    address: ship?.address ?? {},
    color,
    lines: (s.line_items?.data ?? []).map((li) => ({
      product:
        typeof li.price?.product === "string" ? li.price.product : (li.price?.product?.id ?? ""),
      qty: li.quantity ?? 1,
      description: li.description ?? "Item",
    })),
  };
}

export async function getOrderFlags(paymentIntent: string): Promise<Record<string, string>> {
  const pi = await stripeClient().paymentIntents.retrieve(paymentIntent);
  return pi.metadata ?? {};
}

export async function setOrderFlags(paymentIntent: string, flags: Record<string, string>) {
  try {
    await stripeClient().paymentIntents.update(paymentIntent, { metadata: flags });
  } catch (err) {
    // A restricted key without PaymentIntent write access only loses de-duplication.
    console.warn("CJ: could not save order flags on the PaymentIntent", err);
  }
}

export async function findSessionIdByPaymentIntent(paymentIntent: string) {
  const list = await stripeClient().checkout.sessions.list({
    payment_intent: paymentIntent,
    limit: 1,
  });
  return list.data[0]?.id;
}

// ---------- orchestration ----------

export type PlaceResult =
  | { status: "created" | "exists"; cjOrderId?: string | undefined; sandbox: boolean }
  // manual = needs a fix (mapping, config, invalid data); retry = CJ or network hiccup.
  | { status: "skipped" | "manual" | "retry"; reason: string; sandbox: boolean };

// System busy, rate limit, quota, read timeout: worth retrying later.
const TRANSIENT_CODES = new Set([1600000, 1600200, 1600201, 1600301, 16900500]);
const isTransient = (err: unknown) =>
  !(err instanceof CjError) || err.code === undefined || TRANSIENT_CODES.has(err.code);

/** Sends a paid Stripe checkout session to CJ as an order. Never throws. */
export async function placeCjOrder(sessionId: string): Promise<PlaceResult> {
  const sandbox = cjSandbox();
  if (!process.env["CJ_API_KEY"])
    return { status: "skipped", reason: "CJ_API_KEY is not set", sandbox };
  try {
    const session = await loadPaidSession(sessionId);
    const built = buildCjOrder(session, { sandbox, autoPay: cjAutoPay() });
    if (!built.ok) return { status: "manual", reason: built.reason, sandbox };
    try {
      const data = await cjRequest<{ orderId?: string }>("/shopping/order/createOrderV2", {
        body: built.body,
      });
      await setOrderFlags(session.paymentIntent, {
        cj_order_id: data?.orderId ?? "pending",
        cj_sandbox: sandbox ? "1" : "0",
      });
      return { status: "created", cjOrderId: data?.orderId, sandbox };
    } catch (err) {
      if (err instanceof CjError && err.code === CJ_ORDER_EXISTS)
        return { status: "exists", sandbox };
      throw err;
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return { status: isTransient(err) ? "retry" : "manual", reason, sandbox };
  }
}
