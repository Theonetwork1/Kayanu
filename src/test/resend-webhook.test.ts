import { describe, it, expect } from "vitest";
import {
  describeProblem,
  isProblemEvent,
  signSvix,
  verifySvixSignature,
} from "@/lib/resend-webhook.server";

const SECRET = "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw";
const ID = "msg_p5jXN8AQM9LWM0D4loKWxJek";
const TS = "1614265330";
const BODY = '{"test": 2432232314}';
const NOW = Number(TS);

describe("Svix signature (Resend webhooks)", () => {
  it("matches the example from the Svix documentation", async () => {
    expect(await signSvix(SECRET, ID, TS, BODY)).toBe(
      "g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=",
    );
  });

  it("accepts a valid signature, also among several (secret rotation)", async () => {
    const sig = await signSvix(SECRET, ID, TS, BODY);
    const h = { id: ID, timestamp: TS, signature: `v1,${sig}` };
    expect(await verifySvixSignature(h, BODY, SECRET, NOW)).toEqual({ ok: true });
    const rotated = { ...h, signature: `v1,AAAA v1,${sig}` };
    expect(await verifySvixSignature(rotated, BODY, SECRET, NOW)).toEqual({ ok: true });
  });

  it("rejects a tampered body, a wrong secret or missing headers", async () => {
    const sig = await signSvix(SECRET, ID, TS, BODY);
    const h = { id: ID, timestamp: TS, signature: `v1,${sig}` };
    expect((await verifySvixSignature(h, '{"test": 1}', SECRET, NOW)).ok).toBe(false);
    expect((await verifySvixSignature(h, BODY, "whsec_c2VjcmV0", NOW)).ok).toBe(false);
    expect((await verifySvixSignature({ ...h, signature: null }, BODY, SECRET, NOW)).ok).toBe(
      false,
    );
  });

  it("rejects replays outside the 5-minute window", async () => {
    const sig = await signSvix(SECRET, ID, TS, BODY);
    const h = { id: ID, timestamp: TS, signature: `v1,${sig}` };
    expect(await verifySvixSignature(h, BODY, SECRET, NOW + 301)).toEqual({
      ok: false,
      reason: "timestamp outside tolerance",
    });
  });
});

describe("Resend delivery problems", () => {
  it("only alerts on bounced, complained and failed emails", () => {
    expect(isProblemEvent("email.bounced")).toBe(true);
    expect(isProblemEvent("email.complained")).toBe(true);
    expect(isProblemEvent("email.failed")).toBe(true);
    expect(isProblemEvent("email.delivered")).toBe(false);
    expect(isProblemEvent("email.opened")).toBe(false);
  });

  it("extracts recipient and reason from a bounce", () => {
    const p = describeProblem({
      type: "email.bounced",
      data: {
        email_id: "em_1",
        to: ["jane@example.com"],
        subject: "Your KAYANU order is confirmed",
        bounce: { type: "Permanent", subType: "General", message: "Mailbox does not exist" },
      },
    });
    expect(p).toEqual({
      to: "jane@example.com",
      subject: "Your KAYANU order is confirmed",
      emailId: "em_1",
      reason: "Permanent — General — Mailbox does not exist",
    });
  });
});
