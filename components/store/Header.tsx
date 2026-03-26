"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useCallback, useEffect, useId, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
] as const;

function CartBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={
        "inline-flex min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-center text-xs font-bold text-[var(--foreground)] " +
        (className ?? "")
      }
      aria-hidden
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function Header() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTitleId = useId();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeMenu]);

  return (
    <header
      className="sticky top-0 z-50 border-b border-gray-200/80 bg-[color-mix(in_srgb,var(--background)_92%,transparent)] shadow-[0_1px_0_0_rgba(234,179,8,0.12)] backdrop-blur-md supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--background)_88%,transparent)] [padding-top:env(safe-area-inset-top)]"
    >
      <div className="ui-container">
        <div className="flex h-14 min-w-0 items-center justify-between gap-3 sm:h-16 sm:gap-4">
          <Link
            href="/"
            className="group flex min-w-0 max-w-[min(100%,18rem)] items-center gap-2 rounded-lg sm:max-w-none"
            aria-label="Ir para a página inicial"
          >
            <span className="relative shrink-0 overflow-hidden rounded-md ring-1 ring-black/5 transition duration-200 group-hover:ring-yellow-500/40">
              <Image
                src="/logo-ja.png"
                alt=""
                width={48}
                height={48}
                className="h-9 w-auto object-contain sm:h-10"
                priority
              />
            </span>
            <span className="logo-construcoes truncate text-xl leading-tight sm:text-2xl">Construções</span>
          </Link>

          <nav
            className="hidden shrink-0 items-center md:flex"
            aria-label="Navegação principal"
          >
            <ul className="flex items-center gap-0.5 lg:gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="ui-btn ui-btn-ghost rounded-lg px-3 py-2 text-sm font-medium lg:px-4"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/carrinho"
                  className="ui-btn ui-btn-ghost inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium lg:px-4"
                >
                  <span>Carrinho</span>
                  <CartBadge count={count} className="h-5 min-w-5 px-1.5 text-[11px]" />
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1 md:hidden">
            <Link
              href="/carrinho"
              className="relative flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-800 transition duration-200 hover:bg-yellow-500/10 hover:text-[var(--accent-hover)]"
              aria-label={count > 0 ? `Carrinho, ${count} itens` : "Carrinho"}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {count > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-0.5 text-[10px] font-bold leading-none text-[var(--foreground)]">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-800 transition duration-200 hover:bg-yellow-500/10 hover:text-[var(--accent-hover)]"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="store-mobile-nav"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden" role="dialog" aria-modal="true" aria-labelledby={menuTitleId}>
          <div
            className="fixed inset-x-0 bottom-0 top-14 z-[100] bg-black/50 backdrop-blur-[2px] sm:top-16 [padding-bottom:env(safe-area-inset-bottom)]"
            aria-hidden
            onClick={closeMenu}
          />
          <div className="pointer-events-none fixed inset-x-0 top-14 z-[101] sm:top-16">
            <nav
              id="store-mobile-nav"
              className="pointer-events-auto mx-auto w-full max-h-[min(70vh,calc(100dvh-3.5rem-env(safe-area-inset-bottom)))] animate-[store-header-panel-in_0.2s_ease-out_both] overflow-y-auto border-b border-gray-200/90 bg-[var(--background)] shadow-xl sm:max-h-[min(70vh,calc(100dvh-4rem-env(safe-area-inset-bottom)))]"
              aria-labelledby={menuTitleId}
            >
              <h2 id={menuTitleId} className="sr-only">
                Menu de navegação
              </h2>
              <div className="ui-container py-1">
                <ul className="divide-y divide-gray-100 py-1">
                  {NAV_LINKS.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="block px-4 py-3.5 text-base font-medium text-gray-900 transition hover:bg-yellow-500/[0.08] active:bg-yellow-500/15"
                        onClick={closeMenu}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/carrinho"
                      className="flex items-center justify-between gap-3 px-4 py-3.5 text-base font-medium text-gray-900 transition hover:bg-yellow-500/[0.08] active:bg-yellow-500/15"
                      onClick={closeMenu}
                    >
                      <span>Carrinho</span>
                      <CartBadge count={count} className="h-6 min-w-6 px-2 text-xs" />
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
