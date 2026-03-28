-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "destaque" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Produto_destaque_idx" ON "Produto"("destaque");
