// Camada de tradução do conteúdo estruturado (títulos, resumos, objetivos).
// As chaves seguem o padrão `${id}.${field}` e apontam para o texto no idioma.
import type { Lang } from "@/lib/i18n";
import { CONTENT_ES_A, CONTENT_EN_A } from "@/lib/content-i18n/a";
import { CONTENT_ES_B, CONTENT_EN_B } from "@/lib/content-i18n/b";
import { CONTENT_ES_C, CONTENT_EN_C } from "@/lib/content-i18n/c";

export type ContentDict = Record<string, string>;

const DICTS: Record<Lang, ContentDict> = {
  pt: {},
  es: { ...CONTENT_ES_A, ...CONTENT_ES_B, ...CONTENT_ES_C },
  en: { ...CONTENT_EN_A, ...CONTENT_EN_B, ...CONTENT_EN_C },
};

/** Retorna o texto traduzido do conteúdo ou o original em português. */
export function contentText(lang: Lang, id: string, field: string, fallback: string): string {
  return DICTS[lang][`${id}.${field}`] ?? fallback;
}

/** Traduz uma lista de textos curtos (passos, critérios) quando houver tradução. */
export function contentList(lang: Lang, id: string, field: string, fallback: string[]): string[] {
  const joined = DICTS[lang][`${id}.${field}`];
  if (!joined) return fallback;
  return joined.split("|").map((s) => s.trim());
}
