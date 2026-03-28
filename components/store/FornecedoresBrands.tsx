"use client";

import { useEffect, useRef } from "react";

const cardBase =
  'group relative flex items-center justify-center overflow-hidden border border-gray-200/90 bg-white/85 text-center shadow-sm backdrop-blur-[2px] transition duration-300 ' +
  'hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_50%,#d1d5db)] hover:shadow-[0_14px_36px_-20px_rgba(15,23,42,0.35),0_0_0_1px_rgba(234,179,8,0.1)]';

const hoverWash = (
  <span
    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    aria-hidden
    style={{
      background:
        'linear-gradient(145deg, transparent 20%, color-mix(in srgb, var(--accent) 10%, transparent) 50%, transparent 80%)',
    }}
  />
);

/** Cartão só leitura — sem hover (carrossel automático, sem interação) */
function SupplierBrandCarouselTile({ nome }: { nome: string }) {
  return (
    <div className="relative flex min-h-[2.75rem] items-center justify-center overflow-hidden rounded-xl border border-gray-200/90 bg-white/85 px-1.5 py-2 text-center shadow-sm backdrop-blur-[2px]">
      <span className="relative font-mono text-[0.58rem] font-bold uppercase leading-tight tracking-[0.1em] text-gray-800">
        {nome}
      </span>
    </div>
  );
}

function SupplierBrandTile({ nome }: { nome: string }) {
  return (
    <div className={`${cardBase} min-h-[5.25rem] rounded-2xl px-3 py-5`}>
      {hoverWash}
      <span className="relative font-mono text-[0.7rem] font-bold uppercase leading-tight tracking-[0.18em] text-gray-800 transition-colors group-hover:text-gray-950 sm:text-xs">
        {nome}
      </span>
    </div>
  );
}

type Props = {
  items: readonly string[];
};

/** Deslocamento horizontal por frame (~60fps) */
const SCROLL_PX_PER_FRAME = 1.0;

export function FornecedoresBrands({ items }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const looped = [...items, ...items];

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let raf = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const half = el.scrollWidth / 2;
      if (half <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      el.scrollLeft += SCROLL_PX_PER_FRAME;
      if (el.scrollLeft >= half - 1) {
        el.scrollLeft = 0;
      }
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      el.scrollLeft = 0;
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [items.length]);

  return (
    <>
      <div
        className="pointer-events-none relative select-none sm:hidden"
        aria-hidden="true"
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[color-mix(in_srgb,white_92%,var(--background-alt))] to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[color-mix(in_srgb,white_92%,var(--background-alt))] to-transparent"
          aria-hidden
        />

        <ul
          ref={listRef}
          className={
            'flex w-full flex-nowrap gap-2 overflow-x-scroll overflow-y-hidden pb-2 ' +
            'pl-4 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] ' +
            '[&::-webkit-scrollbar]:hidden -mx-4 touch-none overscroll-x-none'
          }
        >
          {looped.map((nome, index) => (
            <li
              key={`${nome}-${index}`}
              className="highlight-card-reveal w-[calc((100%-1.5rem)/4)] max-w-[calc((100%-1.5rem)/4)] shrink-0"
              style={{
                animationDelay: `${Math.min(index % items.length, 12) * 45}ms`,
              }}
            >
              <SupplierBrandCarouselTile nome={nome} />
            </li>
          ))}
        </ul>
      </div>

      <ul className="hidden gap-3 sm:grid sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
        {items.map((nome, index) => (
          <li
            key={nome}
            className="highlight-card-reveal min-w-0"
            style={{
              animationDelay: `${Math.min(index, 12) * 45}ms`,
            }}
          >
            <SupplierBrandTile nome={nome} />
          </li>
        ))}
      </ul>
    </>
  );
}
