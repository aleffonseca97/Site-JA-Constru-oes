import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { confirmarPedidoPago } from "@/lib/confirmar-pedido-pago";

export const metadata = {
  title: "Pedido recebido — J.A Construções",
  description: "Obrigado pela sua compra",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CheckoutSucessoPage({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : undefined;

  if (sessionId && stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid" && session.metadata?.pedidoId) {
        await confirmarPedidoPago(session.metadata.pedidoId);
      }
    } catch {
      // Ignora erro (sessão inválida ou já processada)
    }
  }

  return (
    <section
      className="relative isolate min-h-[min(100svh,52rem)] overflow-hidden"
      aria-labelledby="sucesso-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-50/80 via-white to-amber-50/40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:repeating-linear-gradient(-45deg,transparent,transparent_10px,rgba(5,150,105,0.05)_10px,rgba(5,150,105,0.05)_11px)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl sm:top-28 sm:h-80 sm:w-80"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="checkout-fade-up-slow text-center">
          {/* Ícone de sucesso — SVG para nitidez em qualquer DPR */}
          <div className="mb-8 flex justify-center sm:mb-10">
            <div className="relative">
              <span
                className="absolute inset-0 animate-ping rounded-full bg-emerald-400/25 motion-reduce:hidden"
                style={{ animationDuration: "2.5s" }}
                aria-hidden
              />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-500/90 bg-white shadow-[0_12px_40px_-12px_rgba(5,150,105,0.45)] sm:h-24 sm:w-24">
                <svg
                  className="h-10 w-10 text-emerald-600 sm:h-12 sm:w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.25}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-emerald-800/85 sm:text-xs">
            Tudo certo
          </p>
          <h1
            id="sucesso-heading"
            className="checkout-heading-font text-balance text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-4xl"
          >
            Pedido recebido!
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-stone-600 sm:text-lg">
            Obrigado pela sua compra. Em breve você receberá a confirmação por
            e-mail com os detalhes do pedido.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/produtos"
              className="ui-btn ui-btn-primary order-1 min-h-[3rem] w-full px-6 py-3.5 text-base shadow-lg shadow-yellow-500/20 sm:order-2 sm:w-auto sm:min-w-[12rem]"
            >
              Continuar comprando
            </Link>
            <Link
              href="/"
              className="ui-btn order-2 min-h-[3rem] w-full rounded-lg border border-stone-300 bg-white px-6 py-3.5 text-base font-medium text-stone-800 transition hover:border-amber-400 hover:bg-amber-50/80 sm:order-1 sm:w-auto sm:min-w-[12rem]"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
