import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/store/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categorias, produtos] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { nome: "asc" }, take: 6 }),
    prisma.produto.findMany({
      where: { ativo: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { categoria: { select: { slug: true, nome: true } } },
    }),
  ]);

  const produtosComImagens = produtos.map((p) => ({
    ...p,
    imagens: JSON.parse(p.imagens || "[]") as string[],
  }));

  return (
    <div>
      <section className="bg-gray-100 border-b border-gray-200 py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="flex items-center justify-center gap-3 text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <Image
              src="/logo-ja.png"
              alt="J.A"
              width={80}
              height={80}
              className="h-16 md:h-20 w-auto object-contain"
              priority
            />
            <span className="logo-construcoes text-4xl md:text-5xl">Construções</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Materiais de construção com qualidade e preço justo. Tudo para sua obra.
          </p>
          <Link
            href="/produtos"
            className="inline-block px-6 py-3 rounded-lg font-medium bg-yellow-500 text-gray-900 hover:bg-yellow-400 shadow-md hover:shadow transition"
          >
            Ver produtos
          </Link>
        </div>
      </section>

      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            <span className="text-yellow-500">Categorias</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categorias.map((c) => (
              <Link
                key={c.id}
                href={`/produtos?categoria=${c.slug}`}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center hover:border-yellow-500 hover:bg-yellow-50 transition"
              >
                <span className="text-gray-800 font-medium">{c.nome}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              <span className="text-yellow-500">Destaques</span>
            </h2>
            <Link
              href="/produtos"
              className="text-yellow-600 hover:text-yellow-500 text-sm font-medium"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {produtosComImagens.map((p) => (
              <ProductCard key={p.id} produto={p} />
            ))}
          </div>
          {produtosComImagens.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Nenhum produto em destaque no momento.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
