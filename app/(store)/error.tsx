"use client";

import Link from "next/link";

export default function StoreError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-bold text-gray-900">
        Algo deu errado
      </h2>
      <p className="mt-2 text-gray-600">
        Ocorreu um erro ao carregar esta página.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="ui-btn ui-btn-primary px-5 py-2.5"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="ui-btn rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-gray-800 hover:bg-gray-50"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
