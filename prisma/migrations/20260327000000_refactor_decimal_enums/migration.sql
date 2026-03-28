-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "PedidoStatus" AS ENUM ('pendente', 'pago', 'entregue', 'cancelado');

-- AlterTable: Usuario.role String → Role enum (safe: existing values match)
ALTER TABLE "Usuario" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Usuario" ALTER COLUMN "role" TYPE "Role" USING ("role"::"Role");
ALTER TABLE "Usuario" ALTER COLUMN "role" SET DEFAULT 'admin';

-- AlterTable: Pedido.status String → PedidoStatus enum (safe: existing values match)
ALTER TABLE "Pedido" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Pedido" ALTER COLUMN "status" TYPE "PedidoStatus" USING ("status"::"PedidoStatus");
ALTER TABLE "Pedido" ALTER COLUMN "status" SET DEFAULT 'pendente';

-- AlterTable: Float → Decimal(10,2) for monetary fields
ALTER TABLE "Produto" ALTER COLUMN "preco" TYPE DECIMAL(10,2) USING "preco"::DECIMAL(10,2);
ALTER TABLE "Pedido" ALTER COLUMN "total" TYPE DECIMAL(10,2) USING "total"::DECIMAL(10,2);
ALTER TABLE "ItemPedido" ALTER COLUMN "precoUnitario" TYPE DECIMAL(10,2) USING "precoUnitario"::DECIMAL(10,2);
