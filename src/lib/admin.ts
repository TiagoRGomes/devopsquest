// Verificação de administrador no cliente (a escrita é protegida pelas regras do banco).
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { OverrideData } from "@/lib/content-overrides";

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }
    let alive = true;
    setChecking(true);
    void supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        setIsAdmin(Boolean(data));
        setChecking(false);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  return { isAdmin, checking };
}

export async function saveOverride(
  kind: "module" | "lesson" | "exam",
  entityId: string,
  lang: string,
  data: OverrideData,
) {
  const { error } = await supabase
    .from("content_overrides")
    .upsert(
      { kind, entity_id: entityId, lang, data: data as never },
      { onConflict: "kind,entity_id,lang" },
    );
  if (error) throw error;
}

export async function deleteOverride(kind: string, entityId: string, lang: string) {
  const { error } = await supabase
    .from("content_overrides")
    .delete()
    .eq("kind", kind)
    .eq("entity_id", entityId)
    .eq("lang", lang);
  if (error) throw error;
}
