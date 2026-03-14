"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import type { Session } from "next-auth";

export default function AdminNav({ session }: { session: Session | null }) {
  if (!session) return null;
  return (
    <nav className="flex items-center gap-4">
      <Link
        href="/admin/produtos"
        className="text-gray-300 hover:text-yellow-400 transition"
      >
        Produtos
      </Link>
      <Link
        href="/admin/categorias"
        className="text-gray-300 hover:text-yellow-400 transition"
      >
        Categorias
      </Link>
      <Link
        href="/admin/vendas"
        className="text-gray-300 hover:text-yellow-400 transition"
      >
        Vendas
      </Link>
      <span className="text-gray-500 text-sm">{session.user?.email}</span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="text-sm text-gray-400 hover:text-red-400 transition"
      >
        Sair
      </button>
    </nav>
  );
}
