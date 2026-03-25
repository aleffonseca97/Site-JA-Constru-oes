"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CarrinhoContent() {
  const { items, removeItem, updateQuantity, total, count } = useCart();

  if (count === 0) {
    return (
      <div className="text-center py-12">
        <p className="ui-muted mb-4">Seu carrinho está vazio.</p>
        <Link
          href="/produtos"
          className="ui-btn ui-btn-primary px-6 py-3"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.produtoId}
              className="flex gap-4 ui-card p-4"
            >
              <div className="relative w-20 h-20 rounded overflow-hidden bg-gray-100 shrink-0">
                {item.imagem ? (
                  <Image
                    src={item.imagem}
                    alt={item.nome}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <span className="text-gray-400 text-xs flex items-center justify-center h-full">
                    —
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/produtos/${item.slug}`}
                  className="font-medium text-gray-900 hover:text-yellow-700 transition duration-200 line-clamp-2 rounded-sm"
                >
                  {item.nome}
                </Link>
                <p className="text-yellow-700 text-sm mt-0.5 font-medium">
                  R$ {item.preco.toFixed(2).replace(".", ",")} cada
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={item.quantidade}
                  onChange={(e) =>
                    updateQuantity(
                      item.produtoId,
                      parseInt(e.target.value, 10) || 1
                    )
                  }
                  className="ui-input w-14 px-2 py-1 text-center text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.produtoId)}
                  className="text-red-700 hover:text-red-600 text-sm font-medium transition duration-200 cursor-pointer rounded-md px-1.5 py-1"
                  aria-label="Remover do carrinho"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="ui-card p-6 sticky top-24">
          <p className="ui-muted mb-2 font-medium">Total</p>
          <p className="text-2xl font-bold text-yellow-700 mb-6">
            R$ {total.toFixed(2).replace(".", ",")}
          </p>
          <Link
            href="/checkout"
            className="ui-btn ui-btn-primary w-full py-3 text-center"
          >
            Finalizar compra
          </Link>
          <Link
            href="/produtos"
            className="block text-center ui-muted hover:text-yellow-700 transition duration-200 text-sm mt-4 font-medium rounded-md py-2"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
