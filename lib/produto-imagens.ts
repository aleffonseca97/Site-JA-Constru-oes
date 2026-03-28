import type { ProdutoImagem, Prisma } from "@prisma/client";

/** Include Prisma para carregar imagens na ordem de exibição. */
export const produtoImagensQuery = {
  imagens: { orderBy: { ordem: "asc" as const } },
} as const;

/** Converte Decimal para number em campos monetários. */
function toNumber(v: Prisma.Decimal | number): number {
  return typeof v === "number" ? v : Number(v);
}

/** Converte relação `imagens` em array de URLs e Decimal → number. */
export function produtoComUrlsDeImagens<T extends { imagens: ProdutoImagem[]; preco: Prisma.Decimal | number }>(
  p: T
): Omit<T, "imagens" | "preco"> & { imagens: string[]; preco: number } {
  const { imagens, preco, ...rest } = p;
  const urls = imagens.map((i) => i.url);
  return { ...rest, imagens: urls, preco: toNumber(preco) } as Omit<T, "imagens" | "preco"> & { imagens: string[]; preco: number };
}
