"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VendasRefreshButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded bg-gray-900 border border-gray-700 text-yellow-400 px-3 py-1.5 text-sm hover:border-yellow-600/50 hover:bg-gray-800/80 focus:border-yellow-500 outline-none disabled:opacity-50 disabled:pointer-events-none"
    >
      {pending ? "Atualizando…" : "Atualizar lista"}
    </button>
  );
}
