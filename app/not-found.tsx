import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="mt-4 text-lg text-gray-600">
        Página não encontrada.
      </p>
      <Link
        href="/"
        className="ui-btn ui-btn-primary mt-8 px-6 py-3"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
