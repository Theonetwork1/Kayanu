import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { shippingFor } from "@/lib/pricing";
import { clampQty, parseStoredCart, sameItem, unitPrice, type CartLine } from "@/lib/cart-schema";

export type { CartLine } from "@/lib/cart-schema";

const STORAGE_KEY = "kayanu-cart";

type CartCtx = {
  lines: CartLine[];
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (...lines: CartLine[]) => void;
  setQty: (i: number, qty: number) => void;
  remove: (i: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  shipping: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setLines(parseStoredCart(localStorage.getItem(STORAGE_KEY)));
    } catch {
      // Storage unavailable (private mode, quota): the cart just won't persist.
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    // Wait for the stored cart to be read so the empty initial state never overwrites it.
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage unavailable (private mode, quota): the cart just won't persist.
    }
  }, [lines, loaded]);

  // Also wipes storage: child effects run before the load effect above, which
  // would otherwise restore the old cart right after a clear on first render.
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable (private mode, quota): the cart just won't persist.
    }
    setLines((prev) => (prev.length ? [] : prev));
  }, []);

  const value = useMemo<CartCtx>(() => {
    const subtotal = lines.reduce((s, l) => s + unitPrice(l) * l.qty, 0);
    return {
      lines,
      open,
      setOpen,
      add: (...added) =>
        setLines((prev) =>
          added.reduce((acc, l) => {
            const i = acc.findIndex((p) => sameItem(p, l));
            if (i >= 0)
              return acc.map((p, j) => (j === i ? { ...p, qty: clampQty(p.qty + l.qty) } : p));
            return [...acc, { ...l, qty: clampQty(l.qty) }];
          }, prev),
        ),
      setQty: (i, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((_, j) => j !== i)
            : prev.map((p, j) => (j === i ? { ...p, qty: clampQty(qty) } : p)),
        ),
      remove: (i) => setLines((prev) => prev.filter((_, j) => j !== i)),
      clear,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal,
      shipping: shippingFor(subtotal),
    };
  }, [lines, open, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
