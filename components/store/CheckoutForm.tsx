"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CheckoutForm() {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [cep, setCep] = useState("");
  const [complemento, setComplemento] = useState("");

  if (items.length === 0 && !loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Seu carrinho está vazio.</p>
        <Link
          href="/produtos"
          className="text-yellow-600 hover:text-yellow-500 font-medium"
        >
          Ir para produtos
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const itens = items.map((i) => ({
        produtoId: i.produtoId,
        quantidade: i.quantidade,
        precoUnitario: i.preco,
      }));
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteNome: nome,
          clienteEmail: email,
          clienteTelefone: telefone || undefined,
          endereco: { rua, numero, bairro, cidade, cep, complemento: complemento || undefined },
          itens,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message ?? data.error ?? "Erro ao processar");
        setLoading(false);
        return;
      }
      if (data.url) {
        clear();
        window.location.href = data.url;
        return;
      }
      setError("Resposta inválida do servidor");
      setLoading(false);
    } catch {
      setError("Erro de conexão");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-red-400 text-sm bg-red-900/30 border border-red-500/50 rounded px-3 py-2">
          {error}
        </div>
      )}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-3"><span className="text-yellow-500">Dados pessoais</span></h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="nome" className="block text-sm text-gray-600 mb-1 font-medium">Nome *</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-gray-600 mb-1 font-medium">E-mail *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="telefone" className="block text-sm text-gray-600 mb-1 font-medium">Telefone</label>
            <input
              id="telefone"
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
            />
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-3"><span className="text-yellow-500">Endereço de entrega</span></h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="rua" className="block text-sm text-gray-600 mb-1 font-medium">Rua *</label>
            <input
              id="rua"
              type="text"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="numero" className="block text-sm text-gray-600 mb-1 font-medium">Número *</label>
              <input
                id="numero"
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="complemento" className="block text-sm text-gray-600 mb-1 font-medium">Complemento</label>
              <input
                id="complemento"
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="bairro" className="block text-sm text-gray-600 mb-1 font-medium">Bairro *</label>
            <input
              id="bairro"
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cidade" className="block text-sm text-gray-600 mb-1 font-medium">Cidade *</label>
              <input
                id="cidade"
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="cep" className="block text-sm text-gray-600 mb-1 font-medium">CEP *</label>
              <input
                id="cep"
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                required
                placeholder="00000-000"
                className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-gray-200">
        <p className="text-gray-600 mb-2 font-medium">Total: <span className="text-yellow-600 font-bold">R$ {total.toFixed(2).replace(".", ",")}</span></p>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-medium bg-yellow-500 text-gray-900 hover:bg-yellow-400 disabled:opacity-50 transition"
        >
          {loading ? "Redirecionando..." : "Ir para pagamento"}
        </button>
        <p className="text-gray-500 text-xs mt-2 text-center">
          Você será redirecionado ao Stripe para pagamento seguro.
        </p>
      </div>
    </form>
  );
}
