"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { safeRedirectUrl } from "@/lib/utils";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") ?? "/admin/produtos";
  const callbackUrl = safeRedirectUrl(rawCallback, "/admin/produtos");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    if (res?.ok) window.location.href = callbackUrl;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-yellow-500/50 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-yellow-400">J.A Construções</h1>
            <p className="text-gray-400 mt-1">Área administrativa</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-400 text-sm bg-red-900/30 border border-red-500/50 rounded px-3 py-2">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                placeholder="admin@jaconstrucoes.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded font-medium bg-yellow-500 text-black hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 transition"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p className="mt-6 text-center">
            <Link href="/" className="text-sm text-yellow-400 hover:text-yellow-300">
              Voltar para a loja
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
