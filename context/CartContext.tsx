"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveCart(items);
  }, [items, mounted]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantidade">, quantidade = 1) => {
      setItems((prev) => {
        const i = prev.findIndex((x) => x.produtoId === item.produtoId);
        if (i >= 0) {
          const next = [...prev];
          next[i].quantidade += quantidade;
          return next;
        }
        return [...prev, { ...item, quantidade }];
      });
    },
    []
  );

  const removeItem = useCallback((produtoId: string) => {
    setItems((prev) => prev.filter((x) => x.produtoId !== produtoId));
  }, []);

  const updateQuantity = useCallback((produtoId: string, quantidade: number) => {
    if (quantidade <= 0) {
      setItems((prev) => prev.filter((x) => x.produtoId !== produtoId));
      return;
    }
    setItems((prev) =>
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

  const clear = useCallback(() => setItems([]), []);

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
