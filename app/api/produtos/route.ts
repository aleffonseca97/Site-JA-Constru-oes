import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, assertAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { produtoComUrlsDeImagens, produtoImagensQuery } from "@/lib/produto-imagens";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const createSchema = z.object({
  nome: z.string().min(1),
  slug: z.string().min(1).optional(),
  descricao: z.string().optional(),
  preco: z.number().positive(),
  estoque: z.number().int().min(0),
  categoriaId: z.string().min(1),
  imagens: z.array(z.string().min(1)).default([]),
  ativo: z.boolean().default(true),
  destaque: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get("categoriaId");
    const ativo = searchParams.get("ativo");
    const busca = searchParams.get("q");
    const ordem = searchParams.get("ordem") ?? "nome";
    const dir = searchParams.get("dir") ?? "asc";

    const where: { categoriaId?: string; ativo?: boolean; nome?: { contains: string } } = {};
    if (categoriaId) where.categoriaId = categoriaId;
    if (ativo) {
      where.ativo = ativo === "true";
    }
    if (busca?.trim()) {
      where.nome = { contains: busca.trim() };
    }

    const validDir = dir === "desc" ? "desc" : "asc";
    const orderBy = ordem === "preco"
      ? { preco: validDir as "asc" | "desc" }
      : { nome: validDir as "asc" | "desc" };

    const produtos = await prisma.produto.findMany({
      where,
      orderBy,
      include: {
        categoria: { select: { id: true, nome: true, slug: true } },
        ...produtoImagensQuery,
      },
    });

    const parsed = produtos.map((p) => produtoComUrlsDeImagens(p));

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
  const denied = assertAdmin(session);
  if (denied) return denied;

  try {
    const body = await request.json();
    const data = createSchema.parse({
      ...body,
      preco: typeof body.preco === "string" ? parseFloat(body.preco) : body.preco,
      estoque: typeof body.estoque === "string" ? parseInt(body.estoque, 10) : body.estoque,
    });

    const slug = data.slug?.trim() || slugify(data.nome);

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
        ativo: data.ativo,
        destaque: data.destaque,
        imagens: {
          create: data.imagens.map((url, ordem) => ({ url, ordem })),
        },
      },
      include: {
        categoria: { select: { id: true, nome: true, slug: true } },
        ...produtoImagensQuery,
      },
    });

    return NextResponse.json(produtoComUrlsDeImagens(produto));
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
