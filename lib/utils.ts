import type { Endereco } from "@/types";

export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function parseEndereco(raw: string | null | undefined): Endereco {
  if (!raw) {
    return { rua: "", numero: "", bairro: "", cidade: "", cep: "" };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      rua: parsed.rua ?? "",
      numero: parsed.numero ?? "",
      bairro: parsed.bairro ?? "",
      cidade: parsed.cidade ?? "",
      cep: parsed.cep ?? "",
      complemento: parsed.complemento,
    };
  } catch {
    return { rua: "", numero: "", bairro: "", cidade: "", cep: "" };
  }
}

/**
 * Validates that a URL is safe for redirect (same origin only).
 * Returns the fallback if the URL is external or invalid.
 */
export function safeRedirectUrl(url: string, fallback: string): string {
  try {
    const parsed = new URL(url, "http://localhost");
    if (parsed.origin !== "http://localhost") return fallback;
    return parsed.pathname + parsed.search;
  } catch {
    return fallback;
  }
}
