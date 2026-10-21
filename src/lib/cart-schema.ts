import { z } from "zod";
import {
  ADDONS,
  COLORS,
  VARIANTS,
  getAddon,
  getVariant,
  type AddonId,
  type ColorId,
  type VariantId,
} from "@/config";

export const MAX_LINE_QTY = 20;

const variantIds = VARIANTS.map((v) => v.id) as [VariantId, ...VariantId[]];
const colorIds = COLORS.map((c) => c.id) as [ColorId, ...ColorId[]];
const addonIds = ADDONS.map((a) => a.id) as [AddonId, ...AddonId[]];
const qty = z.number().int().min(1).max(MAX_LINE_QTY);

// Shared by the browser (localStorage) and the server (checkout), so a line the
// store no longer sells can never reach a price lookup.
export const setLineSchema = z.object({
  type: z.literal("set"),
  variant: z.enum(variantIds),
  color: z.enum(colorIds),
  qty,
});
export const addonLineSchema = z.object({
  type: z.literal("addon"),
  addon: z.enum(addonIds),
  qty,
});
export const cartLineSchema = z.discriminatedUnion("type", [setLineSchema, addonLineSchema]);
export type SetLine = z.infer<typeof setLineSchema>;
export type AddonLine = z.infer<typeof addonLineSchema>;
export type CartLine = z.infer<typeof cartLineSchema>;

export const cartSchema = z
  .array(cartLineSchema)
  .min(1)
  .max(VARIANTS.length * COLORS.length + ADDONS.length);

export const clampQty = (n: number) => Math.min(MAX_LINE_QTY, Math.max(1, Math.floor(n)));

export const sameItem = (a: CartLine, b: CartLine) =>
  a.type === "set"
    ? b.type === "set" && a.variant === b.variant && a.color === b.color
    : b.type === "addon" && a.addon === b.addon;

export const unitPrice = (l: CartLine) =>
  l.type === "set" ? getVariant(l.variant).price : getAddon(l.addon).price;

// Lenient reader for whatever is in localStorage: drops unknown products/colors
// (e.g. after a config change), clamps quantities and merges duplicate lines.
// Lines saved before add-ons existed have no `type` and are read as sets.
export function parseStoredCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const lines: CartLine[] = [];
  for (const item of data) {
    if (item === null || typeof item !== "object") continue;
    const { qty: n, type } = item as { qty?: unknown; type?: unknown };
    if (typeof n !== "number" || !Number.isFinite(n) || n < 1) continue;
    const parsed = cartLineSchema.safeParse({ ...item, type: type ?? "set", qty: clampQty(n) });
    if (!parsed.success) continue;
    const l = parsed.data;
    const existing = lines.find((p) => sameItem(p, l));
    if (existing) existing.qty = clampQty(existing.qty + l.qty);
    else lines.push(l);
  }
  return lines;
}
