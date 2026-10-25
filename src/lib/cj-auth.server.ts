import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

export class CjError extends Error {
  constructor(readonly code: number | undefined, message: string) {
    super(message);
  }
}

// Never include provider text in diagnostics: an authentication response may echo credentials.
export function parseCjEnvelope<T>(value: unknown, httpStatus: number): T {
  const parsed = z.object({ code: z.number(), result: z.boolean(), data: z.unknown(), success: z.boolean().optional() }).safeParse(value);
  if (httpStatus < 200 || httpStatus >= 300 || !parsed.success || parsed.data.code !== 200 || !parsed.data.result || parsed.data.success === false) {
    throw new CjError(parsed.success ? parsed.data.code : undefined, `CJ request failed (HTTP ${httpStatus}, code ${parsed.success ? parsed.data.code : "invalid_response"})`);
  }
  return parsed.data.data as T;
}

export async function callCj<T>(path: string, init: { method?: "GET" | "POST"; token?: string; body?: unknown; query?: Record<string, string> }): Promise<T> {
  const url = new URL(CJ_BASE + path);
  for (const [key, value] of Object.entries(init.query ?? {})) url.searchParams.set(key, value);
  const response = await fetch(url, {
    method: init.method ?? "POST",
    headers: { "Content-Type": "application/json", ...(init.token ? { "CJ-Access-Token": init.token } : {}) },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
    signal: AbortSignal.timeout(20_000),
  });
  let body: unknown;
  try { body = await response.json(); } catch { body = undefined; }
  return parseCjEnvelope<T>(body, response.status);
}

const tokenSchema = z.object({
  openId: z.union([z.string().min(1), z.number()]).transform(String),
  accessToken: z.string().min(1),
  accessTokenExpiryDate: z.string().refine((v) => Number.isFinite(Date.parse(v)) && Date.parse(v) > Date.now()),
  refreshToken: z.string().min(1),
  refreshTokenExpiryDate: z.string().refine((v) => Number.isFinite(Date.parse(v))),
});

export async function getCjConnection() {
  const { data, error } = await supabaseAdmin.from("cj_connection").select("access_token,access_expires_at,open_id").eq("id", "primary").maybeSingle();
  if (error) throw new CjError(undefined, "CJ connection storage unavailable");
  return data;
}

export async function getCjToken(): Promise<string> {
  const current = await getCjConnection();
  if (current?.access_token && current.access_expires_at && Date.parse(current.access_expires_at) > Date.now() + 60_000) return current.access_token;
  const { data: acquired, error } = await supabaseAdmin.rpc("cj_acquire_token_lock");
  if (error || !acquired) throw new CjError(undefined, "CJ authentication in progress; retry later");
  try {
    // Recheck after acquiring the cross-instance lock.
    const newer = await getCjConnection();
    if (newer?.access_token && newer.access_expires_at && Date.parse(newer.access_expires_at) > Date.now() + 60_000) return newer.access_token;
    const apiKey = process.env["CJ_API_KEY"];
    if (!apiKey) throw new CjError(undefined, "CJ_API_KEY is not set");
    const raw = await callCj<unknown>("/authentication/getAccessToken", { body: { apiKey } });
    const parsed = tokenSchema.safeParse(raw);
    if (!parsed.success) throw new CjError(undefined, "CJ authentication response is invalid");
    const token = parsed.data;
    const saved = await supabaseAdmin.from("cj_connection").update({
      access_token: token.accessToken, access_expires_at: new Date(token.accessTokenExpiryDate).toISOString(),
      open_id: token.openId, refresh_token: token.refreshToken, refresh_expires_at: new Date(token.refreshTokenExpiryDate).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", "primary");
    if (saved.error) throw new CjError(undefined, "CJ authentication could not be saved");
    return token.accessToken;
  } finally {
    await supabaseAdmin.from("cj_connection").update({ token_lock_until: null }).eq("id", "primary");
  }
}

export async function cjRequest<T>(path: string, init: { method?: "GET" | "POST"; body?: unknown; query?: Record<string, string> } = {}): Promise<T> {
  const token = await getCjToken();
  try { return await callCj<T>(path, { ...init, token }); }
  catch (error) {
    // Retry only reads. Never replay an order/payment automatically after an ambiguous failure.
    if (error instanceof CjError && error.code === 1600001) {
      await supabaseAdmin.from("cj_connection").update({ access_token: null, access_expires_at: null }).eq("id", "primary").eq("access_token", token);
      if (init.method === "GET") return callCj<T>(path, { ...init, token: await getCjToken() });
    }
    throw error;
  }
}