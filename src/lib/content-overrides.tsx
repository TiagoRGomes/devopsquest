// Conteúdo editado na área de administração. Fica salvo no banco e substitui o
// conteúdo padrão do curso em qualquer idioma, sem precisar mexer no código.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Lang } from "@/lib/i18n";

export type OverrideValue = string | string[];
export type OverrideData = Record<string, OverrideValue>;

export interface OverrideRow {
  kind: string;
  entity_id: string;
  lang: string;
  data: OverrideData;
}

/** Mapa `${lang}:${entityId}.${field}` → texto ou lista. */
let REGISTRY: Record<string, OverrideValue> = {};

export function setOverrideRegistry(rows: OverrideRow[]) {
  const next: Record<string, OverrideValue> = {};
  for (const row of rows) {
    for (const [field, value] of Object.entries(row.data ?? {})) {
      if (value === null || value === undefined || value === "") continue;
      next[`${row.lang}:${row.entity_id}.${field}`] = value as OverrideValue;
    }
  }
  REGISTRY = next;
}

export function overrideText(lang: Lang, id: string, field: string): string | undefined {
  const v = REGISTRY[`${lang}:${id}.${field}`];
  return typeof v === "string" ? v : undefined;
}

export function overrideList(lang: Lang, id: string, field: string): string[] | undefined {
  const v = REGISTRY[`${lang}:${id}.${field}`];
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v.includes(" | ")) return v.split(" | ").map((s) => s.trim());
  return undefined;
}

interface OverridesContextValue {
  version: number;
  rows: OverrideRow[];
  reload: () => Promise<void>;
}

const OverridesContext = createContext<OverridesContextValue>({
  version: 0,
  rows: [],
  reload: async () => {},
});

export function ContentOverridesProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const [rows, setRows] = useState<OverrideRow[]>([]);

  const reload = useMemo(
    () => async () => {
      const { data, error } = await supabase
        .from("content_overrides")
        .select("kind, entity_id, lang, data");
      if (error || !data) return;
      const list = data as unknown as OverrideRow[];
      setOverrideRegistry(list);
      setRows(list);
      setVersion((v) => v + 1);
    },
    [],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <OverridesContext.Provider value={{ version, rows, reload }}>
      {children}
    </OverridesContext.Provider>
  );
}

export function useContentOverrides() {
  return useContext(OverridesContext);
}
