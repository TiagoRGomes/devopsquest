// Camada de tradução do conteúdo estruturado (títulos, resumos, objetivos, corpo das aulas…).
// As chaves seguem o padrão `${id}.${field}` e apontam para o texto no idioma.
import type { Lang } from "@/lib/i18n";
import { CONTENT_ES_A, CONTENT_EN_A } from "@/lib/content-i18n/a";
import { CONTENT_ES_B, CONTENT_EN_B } from "@/lib/content-i18n/b";
import { CONTENT_ES_C, CONTENT_EN_C } from "@/lib/content-i18n/c";
import { CONTENT_GEN_ES } from "@/lib/content-i18n/gen-es";
import { CONTENT_GEN_EN } from "@/lib/content-i18n/gen-en";
import { overrideList, overrideObjects, overrideText } from "@/lib/content-overrides";

export type ContentDict = Record<string, string>;

const DICTS: Record<Lang, ContentDict> = {
  pt: {},
  es: { ...CONTENT_GEN_ES, ...CONTENT_ES_A, ...CONTENT_ES_B, ...CONTENT_ES_C },
  en: { ...CONTENT_GEN_EN, ...CONTENT_EN_A, ...CONTENT_EN_B, ...CONTENT_EN_C },
};

/** Retorna o texto editado na administração, o traduzido, ou o original em português. */
export function contentText(lang: Lang, id: string, field: string, fallback: string): string {
  return overrideText(lang, id, field) ?? DICTS[lang][`${id}.${field}`] ?? fallback;
}

/** Traduz uma lista de textos curtos (passos, critérios) quando houver tradução. */
export function contentList(lang: Lang, id: string, field: string, fallback: string[]): string[] {
  const edited = overrideList(lang, id, field);
  if (edited && edited.length > 0) return edited;
  const joined = DICTS[lang][`${id}.${field}`];
  if (!joined) return fallback;
  const parts = joined.split(" | ").map((s) => s.trim());
  return parts.length === fallback.length ? parts : fallback;
}

/** Estruturas completas editadas na administração (quiz, glossário, códigos…). */
export function contentObjects<T>(lang: Lang, id: string, field: string, fallback: T[]): T[] {
  return overrideObjects<T>(lang, id, field) ?? fallback;
}

export interface ContentLink {
  label: string;
  url: string;
}

/** Links extras adicionados na administração para um módulo ou aula. */
export function contentLinks(lang: Lang, id: string): ContentLink[] {
  const list = overrideObjects<ContentLink>(lang, id, "linksJson") ?? [];
  return list.filter((l) => Boolean(l?.url));
}

/** Converte o nome da classe de nível em uma chave estável. */
export function slugifyClassName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
