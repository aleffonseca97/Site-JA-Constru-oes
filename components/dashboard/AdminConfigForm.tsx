"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

type Props = { currentEmail: string };

export default function AdminConfigForm({ currentEmail }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [email, setEmail] = useState(currentEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          email: email.trim() || undefined,
          newPassword: newPassword || undefined,
          confirmPassword: confirmPassword || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Não foi possível salvar." });
        setLoading(false);
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      if (data.emailChanged) {
        setMessage({
          type: "ok",
          text: "E-mail atualizado. Você será desconectado para entrar com o novo e-mail.",
        });
        setTimeout(() => {
          signOut({ callbackUrl: "/admin/login" });
        }, 2000);
        return;
      }
      if (data.passwordChanged) {
        setMessage({
          type: "ok",
          text: "Senha alterada com sucesso.",
        });
      } else {
        setMessage({ type: "ok", text: "Alterações salvas." });
      }
    } catch {
      setMessage({ type: "err", text: "Erro de rede. Tente novamente." });
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      {message && (
        <div
          role="status"
          className={
            message.type === "ok"
              ? "text-green-300 text-sm bg-green-900/30 border border-green-600/50 rounded px-3 py-2"
              : "text-red-400 text-sm bg-red-900/30 border border-red-500/50 rounded px-3 py-2"
          }
        >
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="cfg-email" className="block text-sm font-medium text-gray-300 mb-1">
          E-mail de acesso
        </label>
        <input
          id="cfg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
        />
        <p className="text-gray-500 text-xs mt-1">
          Este é o usuário utilizado no login da área administrativa.
        </p>
      </div>

      <div>
        <label htmlFor="cfg-new-pass" className="block text-sm font-medium text-gray-300 mb-1">
          Nova senha
        </label>
        <div className="relative">
          <input
            id="cfg-new-pass"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full pl-4 pr-11 py-2 rounded bg-black border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
            placeholder="Deixe em branco para não alterar"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            aria-label={showNewPassword ? "Ocultar nova senha" : "Mostrar nova senha"}
          >
            {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="cfg-confirm" className="block text-sm font-medium text-gray-300 mb-1">
          Confirmar nova senha
        </label>
        <div className="relative">
          <input
            id="cfg-confirm"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full pl-4 pr-11 py-2 rounded bg-black border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
            placeholder="Repita a nova senha"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
          >
            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6">
        <label htmlFor="cfg-current" className="block text-sm font-medium text-gray-300 mb-1">
          Senha atual
        </label>
        <div className="relative">
          <input
            id="cfg-current"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full pl-4 pr-11 py-2 rounded bg-black border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
            placeholder="Obrigatória para confirmar alterações"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            aria-label={showCurrentPassword ? "Ocultar senha atual" : "Mostrar senha atual"}
          >
            {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-1">
          Por segurança, informe a senha atual para salvar o novo e-mail ou a nova senha.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 rounded bg-yellow-500 text-black font-medium hover:bg-yellow-400 disabled:opacity-50 transition"
      >
        {loading ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}
