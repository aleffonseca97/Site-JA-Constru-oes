# J.A Construções — E-commerce

Plataforma e-commerce para venda de materiais de construção. Next.js (App Router), Prisma (SQLite), NextAuth (admin), Stripe (pagamentos).

## Requisitos

- Node.js 18+
- npm

## Instalação

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Copie o arquivo de ambiente e configure as variáveis:

```bash
cp .env.example .env
```

Edite `.env` e preencha:

- **DATABASE_URL**: já configurado para SQLite (`file:./dev.db`)
- **NEXTAUTH_URL**: URL da aplicação (ex: `http://localhost:3000`)
- **NEXTAUTH_SECRET**: gere com `openssl rand -base64 32`
- **STRIPE_SECRET_KEY**, **STRIPE_PUBLISHABLE_KEY**: chaves do [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- **STRIPE_WEBHOOK_SECRET**: necessário para confirmar pagamentos (ver abaixo)
- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**: mesma chave pública do Stripe (para o cliente, se usar no front)

3. Crie o banco e rode o seed (categorias + usuário admin):

```bash
npx prisma migrate dev
npx prisma db seed
```

**Login admin:** `admin@jaconstrucoes.com` / `admin123` (altere em produção.)

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Webhook Stripe (pagamentos)

Para que os pedidos sejam marcados como **pagos** e o estoque seja atualizado, o Stripe precisa enviar o evento `checkout.session.completed` para sua API.

### Desenvolvimento local

1. Instale a [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Faça login: `stripe login`.
3. Encaminhe eventos para sua rota local:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. Copie o valor de `whsec_...` exibido e coloque em `STRIPE_WEBHOOK_SECRET` no `.env`.
5. Reinicie o `npm run dev` e finalize um pedido de teste; o webhook será chamado e o status do pedido será atualizado.

### Produção

No [Stripe Dashboard](https://dashboard.stripe.com/webhooks), crie um webhook apontando para `https://seu-dominio.com/api/webhooks/stripe` e selecione o evento `checkout.session.completed`. Use o signing secret do webhook em `STRIPE_WEBHOOK_SECRET`.

## Estrutura

- **Loja (cliente):** `/` (home), `/produtos`, `/produtos/[slug]`, `/carrinho`, `/checkout`, `/checkout/sucesso`
- **Admin:** `/admin/login`, `/admin/produtos`, `/admin/produtos/novo`, `/admin/produtos/[id]`, `/admin/vendas`, `/admin/vendas/[id]`
- **API:** `/api/categorias`, `/api/produtos`, `/api/produtos/[id]`, `/api/upload`, `/api/checkout/stripe`, `/api/webhooks/stripe`, `/api/pedidos`, `/api/pedidos/[id]`, `/api/auth/[...nextauth]`

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run start` — servidor de produção
- `npm run db:seed` — rodar seed do banco
- `npm run db:studio` — abrir Prisma Studio no banco

## Cores e identidade

- **Branco** e **cinza claro** como fundo da loja.
- **Amarelo** como cor de destaque (botões, preços, links, marca J.A).
- Loja: fundo claro e acentos em amarelo; admin mantém tema próprio.
