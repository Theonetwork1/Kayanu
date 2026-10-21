// Resend webhook helpers. Resend signs webhooks with Svix: headers svix-id,
// svix-timestamp and svix-signature ("v1,<base64> v1,<base64>…"), signed with the
// endpoint's signing secret ("whsec_<base64>") over `${id}.${timestamp}.${rawBody}`.
// Web Crypto only, so it runs on Vercel (Node) and Cloudflare alike.

const TOLERANCE_SECONDS = 5 * 60;

export type SvixHeaders = { id: string | null; timestamp: string | null; signature: string | null };

export type VerifyResult = { ok: true } | { ok: false; reason: string };

const enc = new TextEncoder();

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64(bytes: ArrayBuffer): string {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin);
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signSvix(secret: string, id: string, timestamp: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    base64ToBytes(secret.replace(/^whsec_/, "")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`${id}.${timestamp}.${body}`));
  return bytesToBase64(mac);
}

export async function verifySvixSignature(
  h: SvixHeaders,
  body: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<VerifyResult> {
  if (!h.id || !h.timestamp || !h.signature) return { ok: false, reason: "missing svix headers" };
  const ts = Number(h.timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowSeconds - ts) > TOLERANCE_SECONDS) {
    return { ok: false, reason: "timestamp outside tolerance" };
  }
  let expected: string;
  try {
    expected = await signSvix(secret, h.id, h.timestamp, body);
  } catch {
    return { ok: false, reason: "invalid signing secret" };
  }
  // The header can carry several space-separated signatures (secret rotation).
  const valid = h.signature
    .split(" ")
    .map((s) => s.split(","))
    .some(([version, sig]) => version === "v1" && !!sig && safeEqual(sig, expected));
  return valid ? { ok: true } : { ok: false, reason: "no matching signature" };
}

// Delivery problems worth telling the owner about (the customer never got the email).
export const PROBLEM_EVENTS = ["email.bounced", "email.complained", "email.failed"] as const;
export type ProblemEvent = (typeof PROBLEM_EVENTS)[number];

export type ResendEvent = {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string[] | string;
    subject?: string;
    bounce?: { message?: string; type?: string; subType?: string };
    failed?: { reason?: string };
  };
};

export const isProblemEvent = (type: string): type is ProblemEvent =>
  (PROBLEM_EVENTS as readonly string[]).includes(type);

export function describeProblem(e: ResendEvent) {
  const d = e.data ?? {};
  const to = Array.isArray(d.to) ? d.to.join(", ") : (d.to ?? "");
  const reason =
    e.type === "email.bounced"
      ? [d.bounce?.type, d.bounce?.subType, d.bounce?.message].filter(Boolean).join(" — ")
      : e.type === "email.complained"
        ? "Le destinataire a marqué l'e-mail comme spam."
        : (d.failed?.reason ?? "");
  return {
    to,
    subject: d.subject ?? "",
    emailId: d.email_id ?? "",
    reason: reason || "Non précisé",
  };
}
