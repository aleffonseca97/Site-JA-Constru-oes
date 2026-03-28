import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { produtoComUrlsDeImagens, produtoImagensQuery } from "@/lib/produto-imagens";
import ProductCard from "@/components/store/ProductCard";
import { FornecedoresBrands } from "@/components/store/FornecedoresBrands";

/** Marcas parceiras exibidas na vitrine da loja */
const FORNECEDORES = [
  "TIGRE",
  "GERDAU",
  "MTX",
  "WURTH",
  "SPARTA",
  "PALISAD",
  "VEDACIT",
] as const;

export const revalidate = 60;

export default async function HomePage() {
  const [categorias, produtosDestaque] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { nome: "asc" }, take: 6 }),
    prisma.produto.findMany({
      where: { ativo: true, destaque: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        categoria: { select: { slug: true, nome: true } },
        ...produtoImagensQuery,
      },
    }),
  ]);

  const produtosComImagens = produtosDestaque.map((p) => produtoComUrlsDeImagens(p));

  return (
    <div>
      <section
        className="relative overflow-hidden bg-white border-b border-gray-200"
        aria-label="Destaque principal"
      >
        <div className="grid min-h-[min(100svh,56rem)] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:min-h-[min(92svh,52rem)]">
          {/* Coluna texto: faixa de acento + sombra suave na junção (sem gradiente na foto) */}
          <div className="relative z-20 flex flex-col justify-center bg-white px-5 py-12 sm:px-8 sm:py-14 lg:px-12 xl:px-16 lg:py-16 lg:shadow-[8px_0_32px_-12px_rgba(15,23,42,0.12)]">
            <div
              className="pointer-events-none absolute inset-y-8 right-0 hidden w-px bg-gradient-to-b from-transparent via-yellow-500/90 to-transparent lg:block"
              aria-hidden
            />
            <div className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
              <h1 className="mb-5 flex flex-wrap items-center justify-center gap-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:justify-start">
                <Image
                  src="/logo-ja.png"
                  alt="J.A"
                  width={80}
                  height={80}
                  className="h-14 w-auto object-contain sm:h-16 md:h-20"
                  priority
                />
                <span className="logo-construcoes text-4xl sm:text-5xl">
                  Construções
                </span>
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-gray-600 sm:text-xl">
                Materiais de construção com qualidade e preço justo. Tudo para sua
                obra.
              </p>
              <Link
                href="/produtos"
                className="ui-btn ui-btn-primary px-7 py-3.5 text-base shadow-lg shadow-yellow-500/15"
              >
                Ver produtos
              </Link>
            </div>
          </div>

          {/* Foto só a partir de lg; telas pequenas: apenas o bloco de texto */}
          <div className="relative z-10 hidden min-h-0 lg:block lg:min-h-full lg:-ml-3 lg:pl-3">
            <div
              className="relative h-full min-h-[min(52vh,28rem)] overflow-hidden bg-neutral-200 shadow-[0_24px_48px_-20px_rgba(15,23,42,0.2)] ring-1 ring-black/5 lg:min-h-full lg:[clip-path:polygon(11%_0,100%_0,100%_100%,0_100%)] lg:[filter:drop-shadow(-10px_0_26px_rgba(15,23,42,0.12))]"
            >
              <Image
                src="/fachada ja contrucoes.jpeg"
                alt="Fachada da loja J.A. Materiais para Construção"
                fill
                className="object-cover object-center opacity-[0.82]"
                sizes="(min-width: 1024px) 50vw, 1px"
              />
              <div
                className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_120%_100%_at_58%_45%,transparent_40%,rgba(15,23,42,0.1)_100%)]"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden border-b border-gray-200/90 bg-[color-mix(in_srgb,var(--background-alt)_55%,white)] py-14 sm:py-16"
        aria-labelledby="categorias-heading"
      >
        {/* Textura leve + grade — atmosfera “obra / catálogo” sem competir com o conteúdo */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          aria-hidden
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_70%)] blur-2xl"
          aria-hidden
        />

        <div className="ui-container relative">
          <header className="mb-10 max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Catálogo
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-4">
                <span
                  className="mt-1 hidden h-12 w-1 shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_20px_-2px_rgba(234,179,8,0.55)] sm:block"
                  aria-hidden
                />
                <div>
                  <h2
                    id="categorias-heading"
                    className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
                  >
                    <span className="text-[var(--accent)]">Categorias</span>
                  </h2>
                  <p className="mt-2 text-base leading-relaxed text-gray-600">
                    Escolha uma linha e veja só o que interessa à sua obra.
                  </p>
                </div>
              </div>
              <Link
                href="/produtos"
                className="group ui-link inline-flex shrink-0 items-center gap-1.5 text-sm sm:mb-0.5"
              >
                Ver todos os produtos
                <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
          </header>

          {categorias.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/80 px-6 py-12 text-center backdrop-blur-sm">
              <p className="text-gray-600">
                Nenhuma categoria cadastrada ainda.
              </p>
              <Link href="/produtos" className="ui-btn ui-btn-primary mt-5 px-5 py-2.5 text-sm">
                Explorar produtos
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {categorias.map((c, index) => (
                <li key={c.id} className="min-w-0">
                  <Link
                    href={`/produtos?categoria=${c.slug}`}
                    className={
                      "category-card-reveal group relative flex min-h-[7.25rem] flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm transition duration-300 " +
                      "hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_55%,#d1d5db)] hover:shadow-[0_12px_40px_-18px_rgba(15,23,42,0.35),0_0_0_1px_rgba(234,179,8,0.12)] " +
                      "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                    }
                    style={{ animationDelay: `${Math.min(index, 12) * 55}ms` }}
                  >
                    <span
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                      style={{
                        background:
                          "linear-gradient(135deg, transparent 0%, color-mix(in srgb, var(--accent) 8%, transparent) 45%, transparent 100%)",
                      }}
                    />
                    <span
                      className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full border border-gray-100/80 transition duration-300 group-hover:border-[color-mix(in_srgb,var(--accent)_35%,transparent)]"
                      aria-hidden
                    />
                    <span className="relative font-mono text-[0.65rem] font-medium tabular-nums text-gray-400 transition-colors group-hover:text-[var(--accent)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="relative text-left text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-gray-950">
                      {c.nome}
                    </span>
                    <span
                      className="relative mt-3 h-0.5 w-8 rounded-full bg-[color-mix(in_srgb,var(--accent)_70%,transparent)] transition-all duration-300 group-hover:w-full"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section
        className="relative overflow-hidden border-t border-gray-200/90 bg-[color-mix(in_srgb,var(--background-alt)_50%,white)] py-14 sm:py-16"
        aria-labelledby="destaques-heading"
      >
        {/* Textura diagonal leve — distingue de Categorias (grade) sem brigar com o grid de cards */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage: `repeating-linear-gradient(
              -12deg,
              transparent,
              transparent 11px,
              rgba(15, 23, 42, 0.045) 11px,
              rgba(15, 23, 42, 0.045) 12px
            )`,
          }}
        />
        <div
          className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_72%)] blur-2xl"
          aria-hidden
        />

        <div className="ui-container relative">
          <header className="mb-10 max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Loja
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-4">
                <span
                  className="mt-1 hidden h-12 w-1 shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_20px_-2px_rgba(234,179,8,0.55)] sm:block"
                  aria-hidden
                />
                <div>
                  <h2
                    id="destaques-heading"
                    className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
                  >
                    <span className="text-[var(--accent)]">Destaques</span>
                  </h2>
                  <p className="mt-2 text-base leading-relaxed text-gray-600">
                    Novidades e itens em evidência — prontos para ir para a sua
                    obra.
                  </p>
                </div>
              </div>
              <Link
                href="/produtos"
                className="group ui-link inline-flex shrink-0 items-center gap-1.5 text-sm sm:mb-0.5"
              >
                Ver todos os produtos
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </div>
          </header>

          {produtosComImagens.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/80 px-6 py-12 text-center backdrop-blur-sm">
              <p className="text-gray-600">
                Nenhum produto em destaque no momento.
              </p>
              <Link
                href="/produtos"
                className="ui-btn ui-btn-primary mt-5 px-5 py-2.5 text-sm"
              >
                Ver catálogo
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {produtosComImagens.map((p, index) => (
                <li
                  key={p.id}
                  className="highlight-card-reveal min-w-0"
                  style={{
                    animationDelay: `${Math.min(index, 12) * 55}ms`,
                  }}
                >
                  <ProductCard produto={p} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section
        className="relative overflow-hidden border-t border-gray-200/90 bg-[color-mix(in_srgb,white_92%,var(--background-alt))] py-14 sm:py-16"
        aria-labelledby="fornecedores-heading"
      >
        {/* Textura halftone — “catálogo industrial”, distinta da grade e das listras da página */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          aria-hidden
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.09) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div
          className="pointer-events-none absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 translate-x-1/4 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--accent)_12%,transparent),transparent_68%)] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--accent)_45%,transparent)] to-transparent opacity-60"
          aria-hidden
        />

        <div className="ui-container relative">
          <header className="mb-10 max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Confiança
            </p>
            <div className="flex items-start gap-4">
              <span
                className="mt-1 hidden h-12 w-1 shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_20px_-2px_rgba(234,179,8,0.55)] sm:block"
                aria-hidden
              />
              <div>
                <h2
                  id="fornecedores-heading"
                  className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
                >
                  <span className="text-[var(--accent)]">Fornecedores</span>
                </h2>
                <p className="mt-2 text-base leading-relaxed text-gray-600">
                  Trabalhamos com marcas reconhecidas no mercado de materiais de
                  construção — qualidade que você encontra na J.A.
                </p>
              </div>
            </div>
          </header>

          <FornecedoresBrands items={FORNECEDORES} />
        </div>
      </section>
    </div>
  );
}
