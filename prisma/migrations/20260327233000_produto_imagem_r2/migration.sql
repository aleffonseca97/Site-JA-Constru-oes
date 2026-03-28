-- CreateTable
CREATE TABLE "ProdutoImagem" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "produtoId" TEXT NOT NULL,

    CONSTRAINT "ProdutoImagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProdutoImagem_produtoId_idx" ON "ProdutoImagem"("produtoId");

-- AddForeignKey
ALTER TABLE "ProdutoImagem" ADD CONSTRAINT "ProdutoImagem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migra dados antigos (coluna JSON em texto) para linhas
INSERT INTO "ProdutoImagem" ("id", "url", "ordem", "produtoId")
SELECT
  gen_random_uuid()::text,
  value,
  ordinality - 1,
  p."id"
FROM "Produto" p,
LATERAL jsonb_array_elements_text(
  CASE
    WHEN p."imagens" IS NULL OR TRIM(p."imagens") = '' THEN '[]'::jsonb
    ELSE p."imagens"::jsonb
  END
) WITH ORDINALITY AS t(value, ordinality);

-- AlterTable
ALTER TABLE "Produto" DROP COLUMN "imagens";
