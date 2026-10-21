import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getVariant, type ColorId, type VariantId } from "@/config";
import { shippingFor } from "@/lib/pricing";

export type CartLine = { variant: VariantId; color: ColorId; qty: number };

type CartCtx = {
  lines: CartLine[];
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (l: CartLine) => void;
  setQty: (i: number, qty: number) => void;
  remove: (i: number) => void;
  count: number;
  subtotal: number;
  shipping: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("kayanu-cart");
      if (s) setLines(JSON.parse(s));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("kayanu-cart", JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartCtx>(() => {
    const subtotal = lines.reduce((s, l) => s + getVariant(l.variant).price * l.qty, 0);
    return {
      lines,
      open,
      setOpen,
      add: (l) =>
        setLines((prev) => {
          const i = prev.findIndex((p) => p.variant === l.variant && p.color === l.color);
          if (i >= 0) return prev.map((p, j) => (j === i ? { ...p, qty: p.qty + l.qty } : p));
          return [...prev, l];
        }),
      setQty: (i, qty) =>
        setLines((prev) => (qty <= 0 ? prev.filter((_, j) => j !== i) : prev.map((p, j) => (j === i ? { ...p, qty } : p)))),
      remove: (i) => setLines((prev) => prev.filter((_, j) => j !== i)),
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal,
      shipping: shippingFor(subtotal),
    };
  }, [lines, open]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
