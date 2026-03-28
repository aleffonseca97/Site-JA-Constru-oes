import { prisma } from "@/lib/prisma";
import CategoriasTable from "@/components/dashboard/CategoriasTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categorias — Admin",
};

export default async function AdminCategoriasPage() {
  const categorias = await prisma.categoria.findMany({
    orderBy: { nome: "asc" },
    include: {
      _count: { select: { produtos: true } },
      parent: { select: { id: true, nome: true, slug: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">Configurações de categorias</h1>
      </div>
      <CategoriasTable categorias={categorias} />
    </div>
  );
}
