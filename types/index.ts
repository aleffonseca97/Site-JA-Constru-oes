import type { Prisma } from "@prisma/client";

export type Categoria = {
  id: string;
  nome: string;
  slug: string;
};

export type CategoriaComFilhos = Categoria & {
  parentId: string | null;
  filhos?: Categoria[];
  _count?: { produtos: number };
};

export type ProdutoBase = {
  id: string;
  nome: string;
  slug: string;
  preco: number;
  estoque: number;
  ativo: boolean;
};

export type ProdutoComImagens = ProdutoBase & {
  imagens: string[];
};

export type ProdutoComCategoria = ProdutoComImagens & {
  categoria: Categoria;
};

export type ProdutoDetalhado = ProdutoComCategoria & {
  descricao: string | null;
};

export type Endereco = {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  cep: string;
  complemento?: string;
};

export type PedidoStatus = "pendente" | "pago" | "entregue" | "cancelado";

export type ItemPedidoComProduto = {
  id: string;
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  produto: { id: string; nome: string; slug: string };
};

export type PedidoComItens = {
  id: string;
  clienteNome: string;
  clienteEmail: string;
  clienteTelefone: string | null;
  endereco: Endereco;
  total: number;
  status: PedidoStatus;
  stripeSessionId: string | null;
  itens: ItemPedidoComProduto[];
  createdAt: Date;
  updatedAt: Date;
};

export type ProdutoImagensQuery = Prisma.ProdutoInclude;
