"use client";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <h2 className="text-xl font-bold text-red-400">Erro</h2>
      <p className="mt-2 text-gray-400">
        Ocorreu um erro ao carregar esta página.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded bg-yellow-500 px-5 py-2.5 font-medium text-black hover:bg-yellow-400 transition"
      >
        Tentar novamente
      </button>
    </div>
  );
}
