import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const bodySchema = z.object({
  clienteNome: z.string().min(1),
  clienteEmail: z.string().email(),
  clienteTelefone: z.string().optional(),
  endereco: z.object({
    rua: z.string().min(1),
    numero: z.string().min(1),
    bairro: z.string().min(1),
    cidade: z.string().min(1),
    cep: z.string().min(1),
    complemento: z.string().optional(),
  }),
  itens: z.array(
    z.object({
      produtoId: z.string(),
      quantidade: z.number().int().min(1),
    })
  ).min(1),
});

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe não configurado" },
      { status: 500 }
    );
  }
  try {
    const body = await request.json();
    const data = bodySchema.parse(body);

    const produtoIds = data.itens.map((i) => i.produtoId);
    const produtos = await prisma.produto.findMany({
      where: { id: { in: produtoIds }, ativo: true },
      select: { id: true, nome: true, preco: true, estoque: true },
    });

    const produtoMap = new Map(produtos.map((p) => [p.id, p]));

    const errosEstoque: string[] = [];
    for (const item of data.itens) {
      const produto = produtoMap.get(item.produtoId);
      if (!produto) {
        errosEstoque.push(`Produto ${item.produtoId} não encontrado ou inativo`);
        continue;
      }
      if (produto.estoque < item.quantidade) {
        errosEstoque.push(
          `${produto.nome}: estoque insuficiente (disponível: ${produto.estoque}, solicitado: ${item.quantidade})`
        );
      }
    }
    if (errosEstoque.length > 0) {
      return NextResponse.json(
        { error: errosEstoque.join("; ") },
        { status: 400 }
      );
    }

    const itensComPreco = data.itens.map((i) => {
      const produto = produtoMap.get(i.produtoId)!;
      return {
        produtoId: i.produtoId,
        quantidade: i.quantidade,
        precoUnitario: Number(produto.preco),
        nome: produto.nome,
      };
    });

    const total = itensComPreco.reduce(
      (s, i) => s + i.precoUnitario * i.quantidade,
      0
    );

    if (total <= 0) {
      return NextResponse.json(
        { error: "Carrinho vazio" },
        { status: 400 }
      );
    }

    const pedido = await prisma.pedido.create({
      data: {
        clienteNome: data.clienteNome,
        clienteEmail: data.clienteEmail,
        clienteTelefone: data.clienteTelefone ?? null,
        endereco: JSON.stringify(data.endereco),
        total,
        status: "pendente",
        itens: {
          create: itensComPreco.map((i) => ({
            produtoId: i.produtoId,
            quantidade: i.quantidade,
            precoUnitario: i.precoUnitario,
          })),
        },
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? request.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: itensComPreco.map((i) => ({
        price_data: {
          currency: "brl",
          product_data: {
            name: i.nome,
            description: `${i.quantidade} unidade(s)`,
          },
          unit_amount: Math.round(i.precoUnitario * 100),
        },
        quantity: i.quantidade,
      })),
      mode: "payment",
      success_url: `${baseUrl}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/carrinho`,
      metadata: {
        pedidoId: pedido.id,
      },
    });

    await prisma.pedido.update({
      where: { id: pedido.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao criar sessão de pagamento" },
      { status: 500 }
    );
  }
}
