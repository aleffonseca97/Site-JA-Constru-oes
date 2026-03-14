import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  nome: z.string().min(1),
  slug: z.string().min(1).optional(),
  descricao: z.string().optional(),
  preco: z.number().positive(),
  estoque: z.number().int().min(0),
  categoriaId: z.string().min(1),
  imagens: z.array(z.string()).default([]),
  ativo: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get("categoriaId");
    const ativo = searchParams.get("ativo");
    const busca = searchParams.get("q");
    const ordem = searchParams.get("ordem") ?? "nome"; // nome | preco
    const dir = searchParams.get("dir") ?? "asc";

    const where: { categoriaId?: string; ativo?: boolean; nome?: { contains: string } } = {};
    if (categoriaId) where.categoriaId = categoriaId;
    if (ativo !== null && ativo !== undefined && ativo !== "") {
      where.ativo = ativo === "true";
    }
    if (busca?.trim()) {
      where.nome = { contains: busca.trim() };
    }

    const orderBy = ordem === "preco" ? { preco: dir as "asc" | "desc" } : { nome: dir as "asc" | "desc" };

    const produtos = await prisma.produto.findMany({
      where,
      orderBy,
      include: { categoria: { select: { id: true, nome: true, slug: true } } },
    });

    // Parse imagens JSON for response
    const parsed = produtos.map((p) => ({
      ...p,
      imagens: JSON.parse(p.imagens || "[]") as string[],
    }));

    return NextResponse.json(parsed);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao listar produtos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const data = createSchema.parse({
      ...body,
      preco: typeof body.preco === "string" ? parseFloat(body.preco) : body.preco,
      estoque: typeof body.estoque === "string" ? parseInt(body.estoque, 10) : body.estoque,
    });

    const slug =
      data.slug?.trim() ||
      data.nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const existente = await prisma.produto.findUnique({ where: { slug } });
    const slugFinal = existente ? `${slug}-${Date.now()}` : slug;

    const produto = await prisma.produto.create({
      data: {
        nome: data.nome,
        slug: slugFinal,
        descricao: data.descricao ?? null,
        preco: data.preco,
        estoque: data.estoque,
        categoriaId: data.categoriaId,
        imagens: JSON.stringify(data.imagens),
        ativo: data.ativo,
      },
      include: { categoria: { select: { id: true, nome: true, slug: true } } },
    });

    return NextResponse.json({
      ...produto,
      imagens: JSON.parse(produto.imagens || "[]") as string[],
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}
