import Link from "next/link";
import CheckoutForm from "@/components/store/CheckoutForm";

export const metadata = {
  title: "Checkout — J.A Construções",
  description: "Finalize sua compra",
};

export default function CheckoutPage() {
  return (
    <section
      className="relative isolate min-h-[min(100svh,56rem)] overflow-hidden"
      aria-labelledby="checkout-heading"
    >
      {/* Camadas de fundo: profundidade sem gradiente roxo genérico */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-stone-100 via-white to-amber-50/35"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45] [background-image:repeating-linear-gradient(-45deg,transparent,transparent_8px,rgba(120,113,108,0.06)_8px,rgba(120,113,108,0.06)_9px)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[min(70vw,28rem)] w-[min(70vw,28rem)] rounded-full bg-amber-400/10 blur-3xl sm:-right-16"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-[min(60vw,22rem)] w-[min(60vw,22rem)] rounded-full bg-stone-400/15 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8 lg:pt-12">
        {/* Breadcrumb — empilha em telas muito estreitas */}
        <nav
          className="mb-8 text-sm text-stone-600"
          aria-label="Caminho na loja"
        >
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/" className="ui-link font-medium">
                Início
              </Link>
            </li>
            <li className="text-stone-400" aria-hidden>
              /
            </li>
            <li>
              <Link href="/produtos" className="ui-link font-medium">
                Produtos
              </Link>
            </li>
            <li className="text-stone-400" aria-hidden>
              /
            </li>
            <li className="font-medium text-stone-900" aria-current="page">
              Checkout
            </li>
          </ol>
        </nav>

        <header className="mb-8 sm:mb-10">
          <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-amber-800/90 sm:text-xs">
            Pagamento seguro via Stripe
          </p>
          <h1
            id="checkout-heading"
            className="checkout-heading-font text-balance text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-4xl"
          >
            Finalizar compra
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-stone-600 sm:text-lg">
            Preencha seus dados e o endereço de entrega. Você será redirecionado
            para concluir o pagamento com segurança.
          </p>
        </header>

        <div className="checkout-form-surface checkout-fade-up rounded-2xl border border-stone-200/90 bg-white/85 p-5 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-7 md:p-8">
          <CheckoutForm />
        </div>
      </div>
    </section>
  );
}
