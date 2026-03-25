"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export type CartItem = {
  produtoId: string;
  nome: string;
  slug: string;
  preco: number;
  imagem?: string;
  quantidade: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantidade">, quantidade?: number) => void;
  removeItem: (produtoId: string) => void;
  updateQuantity: (produtoId: string, quantidade: number) => void;
  total: number;
  count: number;
  clear: () => void;
};

const STORAGE_KEY = "ja-construcoes-cart";

const CartContext = createContext<CartContextType | null>(null);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let inMemoryCart: CartItem[] = [];
let hasInitialized = false;
const listeners = new Set<() => void>();

function ensureInitialized() {
  if (hasInitialized) return;
  if (typeof window === "undefined") return;
  inMemoryCart = loadCart();
  hasInitialized = true;
}

function emitChange() {
  for (const l of listeners) l();
}

function setCart(next: CartItem[]) {
  inMemoryCart = next;
  saveCart(next);
  emitChange();
}

function updateCart(updater: (prev: CartItem[]) => CartItem[]) {
  ensureInitialized();
  setCart(updater(inMemoryCart));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  ensureInitialized();
  return inMemoryCart;
}

const SERVER_SNAPSHOT: CartItem[] = [];
function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantidade">, quantidade = 1) => {
      updateCart((prev) => {
        const i = prev.findIndex((x) => x.produtoId === item.produtoId);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], quantidade: next[i].quantidade + quantidade };
          return next;
        }
        return [...prev, { ...item, quantidade }];
      });
    },
    []
  );

  const removeItem = useCallback((produtoId: string) => {
    updateCart((prev) => prev.filter((x) => x.produtoId !== produtoId));
  }, []);

  const updateQuantity = useCallback((produtoId: string, quantidade: number) => {
    if (quantidade <= 0) {
      updateCart((prev) => prev.filter((x) => x.produtoId !== produtoId));
      return;
    }
    updateCart((prev) =>
      prev.map((x) =>
        x.produtoId === produtoId ? { ...x, quantidade } : x
      )
    );
  }, []);

  const total = useMemo(
    () => items.reduce((s, i) => s + i.preco * i.quantidade, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((s, i) => s + i.quantidade, 0), [items]);

  const clear = useCallback(() => setCart([]), []);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      total,
      count,
      clear,
    }),
    [items, addItem, removeItem, updateQuantity, total, count, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
