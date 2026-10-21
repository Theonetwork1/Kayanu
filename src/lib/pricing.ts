import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT } from "@/config";

export function shippingFor(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
}

export function freeShippingProgress(subtotal: number) {
  return Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);
}
