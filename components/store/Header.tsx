"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function Header() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:opacity-90 transition">
          <Image
            src="/logo-ja.png"
            alt="J.A Construções"
            width={48}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
          <span className="logo-construcoes text-2xl">Construções</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-yellow-600 transition font-medium">
            Início
          </Link>
          <Link href="/produtos" className="text-gray-600 hover:text-yellow-600 transition font-medium">
            Produtos
          </Link>
          <Link href="/carrinho" className="flex items-center gap-1 text-gray-600 hover:text-yellow-600 transition font-medium">
            Carrinho
            {count > 0 && (
              <span className="bg-yellow-500 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        </nav>
        <div className="flex items-center gap-4 md:hidden">
          <Link href="/carrinho" className="relative p-2 text-gray-700 hover:text-yellow-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-yellow-500 text-gray-900 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 text-gray-600 hover:text-yellow-600"
            aria-label="Abrir menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-gray-50 px-4 py-3 flex flex-col gap-2">
          <Link href="/" className="text-gray-700 hover:text-yellow-600 py-2 font-medium" onClick={() => setMenuOpen(false)}>
            Início
          </Link>
          <Link href="/produtos" className="text-gray-700 hover:text-yellow-600 py-2 font-medium" onClick={() => setMenuOpen(false)}>
            Produtos
          </Link>
          <Link href="/carrinho" className="text-gray-700 hover:text-yellow-600 py-2 font-medium" onClick={() => setMenuOpen(false)}>
            Carrinho {count > 0 && `(${count})`}
          </Link>
        </div>
      )}
    </header>
  );
}
