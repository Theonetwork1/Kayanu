// Transactional emails for KAYANU, sent through the Resend REST API.
// Server-only: reads secrets from process.env. Customer emails are in English
// (U.S. store); the owner notification is in French.
import Stripe from "stripe";

const SITE = "https://www.kayanu.com";
const SUPPORT_EMAIL = "support@kayanu.com";
const FROM_ORDERS = "KAYANU <orders@kayanu.com>";

const C = { teal: "#0C3B3C", cream: "#FAF7F2", accent: "#E07856", muted: "#6B7F80", text: "#3D5A5B" };
// Same typefaces as the site (Sora headings, Inter body), loaded from Google Fonts where the
// mail client allows it (Apple Mail, iOS, many webmails); others fall back to Arial.
const FONT_DISPLAY = "'Sora','Inter',Arial,Helvetica,sans-serif";
const FONT_BODY = "'Inter',Arial,Helvetica,sans-serif";

// ---------- helpers ----------

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const money = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

/** Picks the Stripe secret key: STRIPE_SECRET_KEY, or KAYANU if it holds a secret/restricted key. */
export function getStripeKey(): string | undefined {
  for (const name of ["STRIPE_SECRET_KEY", "KAYANU"]) {
    const v = process.env[name];
    if (v && (v.startsWith("sk_") || v.startsWith("rk_"))) return v;
  }
  return undefined;
}

export function getWebhookSecret(): string | undefined {
  return process.env["STRIPE_WEBHOOK_SECRET"] ?? process.env["KAYANU_WEBHOOK"];
}

// ---------- order data ----------

export type OrderItem = { name: string; qty: number; amount: number };
export type Order = {
  sessionId: string;
  number: string;
  email?: string | undefined;
  name?: string | undefined;
  currency: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  address: string[];
  paymentIntent?: string | undefined;
  recoveryUrl?: string | undefined;
  promoConsent: boolean;
};

type ShippingDetails = {
  name?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
};

export async function loadOrder(sessionId: string): Promise<Order> {
  const key = getStripeKey();
  if (!key) throw new Error("Missing Stripe secret key (STRIPE_SECRET_KEY)");
  const stripe = new Stripe(key);
  const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });

  const raw = s as unknown as {
    collected_information?: { shipping_details?: ShippingDetails | null } | null;
    shipping_details?: ShippingDetails | null;
    after_expiration?: { recovery?: { url?: string | null } | null } | null;
    consent?: { promotions?: string | null } | null;
    payment_intent?: string | { id: string } | null;
  };
  const ship = raw.collected_information?.shipping_details ?? raw.shipping_details ?? null;
  const a = ship?.address;
  const address = [
    ship?.name,
    a?.line1,
    a?.line2,
    [a?.city, a?.state, a?.postal_code].filter(Boolean).join(", "),
    a?.country,
  ].filter((x): x is string => Boolean(x));

  const pi = raw.payment_intent;
  return {
    sessionId: s.id,
    number: `KAY-${s.id.slice(-8).toUpperCase()}`,
    email: s.customer_details?.email ?? s.customer_email ?? undefined,
    name: s.customer_details?.name ?? ship?.name ?? undefined,
    currency: s.currency ?? "usd",
    items: (s.line_items?.data ?? []).map((li) => ({
      name: li.description ?? "Item",
      qty: li.quantity ?? 1,
      amount: li.amount_total ?? 0,
    })),
    subtotal: s.amount_subtotal ?? 0,
    shipping: s.total_details?.amount_shipping ?? 0,
    tax: s.total_details?.amount_tax ?? 0,
    total: s.amount_total ?? 0,
    address,
    paymentIntent: typeof pi === "string" ? pi : pi?.id,
    recoveryUrl: raw.after_expiration?.recovery?.url ?? undefined,
    promoConsent: raw.consent?.promotions === "opt_in",
  };
}

// ---------- layout ----------

function layout(opts: { preheader: string; title: string; body: string; lang?: string; footer?: string }) {
  const link = (label: string, href: string) =>
    `<a href="${href}" style="color:${C.muted};text-decoration:underline;">${label}</a>`;
  const footer =
    opts.footer ??
    [
      `<span style="font-family:${FONT_DISPLAY};font-size:13px;letter-spacing:3px;font-weight:800;color:${C.teal};">KAYANU</span>`,
      "Premium travel essentials. Pack more, stress less.",
      `Questions? Reply to this email or write to ${link(SUPPORT_EMAIL, `mailto:${SUPPORT_EMAIL}`)}.`,
      [
        link("Shipping", `${SITE}/shipping`),
        link("Returns", `${SITE}/returns`),
        link("Contact", `${SITE}/contact`),
      ].join(" &middot; "),
    ].join("<br>");
  return `<!DOCTYPE html>
<html lang="${opts.lang ?? "en"}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${esc(opts.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Sora:wght@700;800&display=swap" rel="stylesheet">
</head>
<body style="margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;background-color:${C.cream};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.cream};">${esc(opts.preheader)}</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.cream}" style="background-color:${C.cream};">
<tr><td align="center" style="padding-top:24px;padding-bottom:24px;padding-left:12px;padding-right:12px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
<tr><td align="center" bgcolor="${C.teal}" style="background-color:${C.teal};border-radius:24px 24px 0 0;padding-top:24px;padding-bottom:24px;padding-left:24px;padding-right:24px;">
<a href="${SITE}" style="font-family:${FONT_DISPLAY};font-size:22px;line-height:28px;letter-spacing:5px;font-weight:800;color:${C.cream};text-decoration:none;">KAYANU</a>
</td></tr>
<tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;border-radius:0 0 24px 24px;border:1px solid #EFE9E0;border-top:0;box-shadow:0 10px 30px -12px rgba(12,59,60,0.25);padding-top:36px;padding-bottom:32px;padding-left:36px;padding-right:36px;">
<p style="font-family:${FONT_BODY};font-size:12px;line-height:16px;letter-spacing:2.5px;font-weight:700;text-transform:uppercase;color:${C.accent};margin-top:0;margin-bottom:10px;">${esc(opts.title)}</p>
${opts.body}
</td></tr>
<tr><td align="center" style="font-family:${FONT_BODY};font-size:12px;line-height:18px;color:${C.muted};padding-top:20px;padding-bottom:8px;padding-left:24px;padding-right:24px;">${footer}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

const h1 = (t: string) =>
  `<p style="font-family:${FONT_DISPLAY};font-size:26px;line-height:32px;font-weight:bold;color:${C.teal};margin-top:0;margin-bottom:14px;">${t}</p>`;
const p = (t: string) =>
  `<p style="font-family:${FONT_BODY};font-size:16px;line-height:25px;color:${C.text};margin-top:0;margin-bottom:16px;">${t}</p>`;
const small = (t: string) =>
  `<p style="font-family:${FONT_BODY};font-size:13px;line-height:20px;color:${C.muted};margin-top:0;margin-bottom:8px;">${t}</p>`;
const button = (label: string, href: string) =>
  `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;margin-bottom:20px;"><tr><td align="center" bgcolor="${C.teal}" style="background-color:${C.teal};border-radius:999px;"><a href="${esc(href)}" style="display:inline-block;font-family:${FONT_DISPLAY};font-size:16px;line-height:20px;font-weight:bold;color:${C.cream};text-decoration:none;padding-top:15px;padding-bottom:15px;padding-left:32px;padding-right:32px;">${esc(label)}</a></td></tr></table>`;

function itemsTable(o: Order, withTotals: boolean) {
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="font-family:${FONT_BODY};font-size:15px;line-height:22px;color:${C.text};padding-top:10px;padding-bottom:10px;border-bottom:1px solid #EFE9E0;">${esc(i.name)} <span style="color:${C.muted};">&times; ${i.qty}</span></td><td align="right" style="font-family:${FONT_BODY};font-size:15px;line-height:22px;color:${C.text};padding-top:10px;padding-bottom:10px;border-bottom:1px solid #EFE9E0;white-space:nowrap;">${money(i.amount, o.currency)}</td></tr>`,
    )
    .join("");
  const line = (label: string, value: string, bold = false) =>
    `<tr><td style="font-family:${FONT_BODY};font-size:${bold ? 17 : 14}px;line-height:24px;color:${bold ? C.teal : C.muted};${bold ? "font-weight:bold;" : ""}padding-top:4px;">${label}</td><td align="right" style="font-family:${FONT_BODY};font-size:${bold ? 17 : 14}px;line-height:24px;color:${bold ? C.teal : C.muted};${bold ? "font-weight:bold;" : ""}padding-top:4px;">${value}</td></tr>`;
  const totals = withTotals
    ? `${line("Subtotal", money(o.subtotal, o.currency))}${line("Shipping", o.shipping ? money(o.shipping, o.currency) : "Free")}${o.tax ? line("Tax", money(o.tax, o.currency)) : ""}${line("Total", money(o.total, o.currency), true)}`
    : "";
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">${rows}${totals}</table>`;
}

const addressBlock = (o: Order, label = "Shipping to") =>
  o.address.length
    ? `<p style="font-family:${FONT_BODY};font-size:13px;line-height:18px;letter-spacing:1px;font-weight:bold;color:${C.accent};margin-top:8px;margin-bottom:6px;">${label.toUpperCase()}</p><p style="font-family:${FONT_BODY};font-size:15px;line-height:23px;color:${C.text};margin-top:0;margin-bottom:20px;">${o.address.map(esc).join("<br>")}</p>`
    : "";

// ---------- email builders ----------

export type Mail = { to: string; subject: string; html: string; idempotencyKey: string; replyTo?: string | undefined };

export function orderConfirmation(o: Order): Mail | null {
  if (!o.email) return null;
  const first = o.name?.split(" ")[0];
  const body = [
    h1(`Thank you${first ? `, ${esc(first)}` : ""}!`),
    p(`We've received your order <strong>${esc(o.number)}</strong> and it's being prepared at our U.S. warehouse.`),
    itemsTable(o, true),
    addressBlock(o),
    p(
      "Orders are processed within 1&ndash;2 business days and delivered in 3&ndash;8 business days. We'll email you a tracking link as soon as your package ships.",
    ),
    button("Visit KAYANU", SITE),
    small("Not happy? Every order is covered by our 30-day happiness guarantee."),
  ].join("");
  return {
    to: o.email,
    subject: `Your KAYANU order ${o.number} is confirmed`,
    html: layout({ preheader: `Order ${o.number} — ${money(o.total, o.currency)}`, title: "Order confirmed", body }),
    idempotencyKey: `order-confirmation/${o.sessionId}`,
    replyTo: SUPPORT_EMAIL,
  };
}

export function ownerNewOrder(o: Order, to: string): Mail {
  const stripeLink = o.paymentIntent ? `https://dashboard.stripe.com/payments/${o.paymentIntent}` : "https://dashboard.stripe.com/payments";
  const body = [
    h1(`Nouvelle commande ${esc(o.number)}`),
    p(`<strong>${money(o.total, o.currency)}</strong> encaissés.<br>Client : ${esc(o.name ?? "—")} &lt;${esc(o.email ?? "email inconnu")}&gt;`),
    itemsTable(o, true),
    addressBlock(o, "Adresse de livraison"),
    p("Prochaine étape : passer la commande chez le fournisseur, puis envoyer le suivi au client (endpoint <code>/api/order-status</code>)."),
    button("Voir le paiement dans Stripe", stripeLink),
    small(`ID de session Stripe : ${esc(o.sessionId)}`),
  ].join("");
  return {
    to,
    subject: `Nouvelle commande ${o.number} — ${money(o.total, o.currency)}`,
    html: layout({
      preheader: `${o.name ?? "Client"} — ${money(o.total, o.currency)}`,
      title: "Nouvelle commande",
      body,
      lang: "fr",
      footer: "Notification interne KAYANU",
    }),
    idempotencyKey: `owner-new-order/${o.sessionId}`,
  };
}

export type ShipmentStatus = "shipped" | "delivered";
export type Tracking = {
  carrier?: string | undefined;
  trackingNumber?: string | undefined;
  trackingUrl?: string | undefined;
};

export function orderStatus(o: Order, status: ShipmentStatus, t: Tracking): Mail | null {
  if (!o.email) return null;
  const first = o.name?.split(" ")[0];
  const safeUrl = t.trackingUrl && /^https:\/\//i.test(t.trackingUrl) ? t.trackingUrl : undefined;
  const trackingLines = [
    t.carrier ? `Carrier: <strong>${esc(t.carrier)}</strong>` : "",
    t.trackingNumber ? `Tracking number: <strong>${esc(t.trackingNumber)}</strong>` : "",
  ]
    .filter(Boolean)
    .join("<br>");
  const body =
    status === "shipped"
      ? [
          h1("Your order is on its way"),
          p(`Good news${first ? `, ${esc(first)}` : ""} &mdash; order <strong>${esc(o.number)}</strong> has shipped. Delivery usually takes 3&ndash;8 business days.`),
          trackingLines ? p(trackingLines) : "",
          safeUrl ? button("Track my package", safeUrl) : "",
          itemsTable(o, false),
          addressBlock(o),
        ].join("")
      : [
          h1("Your order was delivered"),
          p(`Order <strong>${esc(o.number)}</strong> has been delivered${first ? `, ${esc(first)}` : ""}. We hope you love your KAYANU cubes!`),
          p(`If anything isn't right, just reply to this email &mdash; our 30-day happiness guarantee has you covered.`),
          button("Shop KAYANU", SITE),
          itemsTable(o, false),
        ].join("");
  return {
    to: o.email,
    subject: status === "shipped" ? `Your KAYANU order ${o.number} has shipped` : `Your KAYANU order ${o.number} was delivered`,
    html: layout({
      preheader: status === "shipped" ? "Your package is on its way." : "Your package has arrived.",
      title: status === "shipped" ? "Order shipped" : "Order delivered",
      body,
    }),
    idempotencyKey: `order-${status}/${o.sessionId}`,
    replyTo: SUPPORT_EMAIL,
  };
}

export function abandonedCart(o: Order): Mail | null {
  // Only when the shopper gave an email AND opted in to promotional emails, and Stripe made a recovery link.
  if (!o.email || !o.recoveryUrl || !o.promoConsent) return null;
  const body = [
    h1("You left something behind"),
    p("Your KAYANU packing cubes are still waiting. Finish your order in a few clicks:"),
    itemsTable(o, false),
    button("Complete my order", o.recoveryUrl),
    small("Orders over $49 ship free. 30-day happiness guarantee."),
  ].join("");
  return {
    to: o.email,
    subject: "Still thinking it over? Your KAYANU cart is waiting",
    html: layout({
      preheader: "Complete your order in a few clicks.",
      title: "Your cart is waiting",
      body,
      footer: `You received this because you started a checkout at kayanu.com and agreed to receive emails. Reply to this email or write to ${SUPPORT_EMAIL} to opt out.`,
    }),
    idempotencyKey: `abandoned-cart/${o.sessionId}`,
    replyTo: SUPPORT_EMAIL,
  };
}

/** Owner alert (French) when Resend reports that a customer email was not delivered. */
export function ownerDeliveryProblem(
  p0: { event: string; to: string; subject: string; reason: string; emailId: string },
  ownerTo: string,
  eventId: string,
): Mail {
  const label =
    p0.event === "email.bounced" ? "rejeté (bounce)" : p0.event === "email.complained" ? "signalé comme spam" : "non envoyé";
  const body = [
    h1(`E-mail client ${label}`),
    p(`Destinataire : <strong>${esc(p0.to || "inconnu")}</strong><br>Objet : ${esc(p0.subject || "—")}`),
    p(`Raison : ${esc(p0.reason)}`),
    p("Le client n'a pas reçu cet e-mail. Vérifiez l'adresse dans Stripe et contactez-le par un autre moyen si besoin."),
    button("Voir l'e-mail dans Resend", `https://resend.com/emails/${encodeURIComponent(p0.emailId)}`),
  ].join("");
  return {
    to: ownerTo,
    subject: `E-mail client ${label} — ${p0.to || "destinataire inconnu"}`,
    html: layout({ preheader: p0.reason, title: "Problème de livraison", body, lang: "fr", footer: "Notification interne KAYANU" }),
    idempotencyKey: `resend-alert/${eventId}`,
  };
}

// ---------- sending ----------

export async function sendMail(m: Mail): Promise<void> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": m.idempotencyKey,
    },
    body: JSON.stringify({
      from: FROM_ORDERS,
      to: [m.to],
      subject: m.subject,
      html: m.html,
      ...(m.replyTo ? { reply_to: m.replyTo } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}
