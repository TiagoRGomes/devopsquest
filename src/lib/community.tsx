// Comunidade: perfis públicos (nick + nível), fórum e bate-papo.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n, type Lang } from "@/lib/i18n";
import { levelFromXp } from "@/data/world";
import { contentText, slugifyClassName } from "@/lib/content-i18n";
import { Chip } from "@/components/ui-bits";

export interface Author {
  nickname: string;
  xp: number;
}

const DICT: Record<Lang, Record<string, string>> = {
  pt: {
    eyebrow: "Comunidade",
    title: "Comunidade Jornada DevOps",
    lead: "Tire dúvidas, ajude outros alunos e converse ao vivo. Seu nível aparece ao lado do nick.",
    open: "Tópicos abertos",
    closed: "Tópicos fechados",
    chat: "Bate-papo",
    newTopic: "Abrir tópico",
    topicTitle: "Título",
    topicBody: "Descreva sua dúvida ou assunto",
    publish: "Publicar",
    cancel: "Cancelar",
    replies: "respostas",
    solved: "Solucionado",
    unsolved: "Não solucionado",
    markSolved: "Marcar como solucionado",
    markUnsolved: "Marcar como não solucionado",
    close: "Fechar tópico",
    reopen: "Reabrir tópico",
    pin: "Fixar",
    unpin: "Desafixar",
    pinned: "Fixado",
    closedTag: "Fechado",
    delete: "Apagar",
    ban: "Bloquear usuário",
    unban: "Desbloquear",
    banned: "Você está bloqueado e não pode publicar.",
    reply: "Responder",
    replyPlaceholder: "Escreva sua resposta",
    closedNoReply: "Este tópico está fechado para novas respostas.",
    empty: "Nenhum tópico aqui ainda.",
    chatEmpty: "Nenhuma mensagem ainda. Diga olá!",
    send: "Enviar",
    chatPlaceholder: "Escreva uma mensagem",
    signIn: "Entre na sua conta para participar",
    signInBtn: "Entrar",
    nickTitle: "Escolha seu nick",
    nickHint: "3 a 24 caracteres: letras, números, ponto, hífen ou sublinhado. Ele aparece para todos.",
    nickSave: "Salvar nick",
    nickTaken: "Esse nick já está em uso.",
    nickInvalid: "Nick inválido.",
    you: "Seu nick",
    back: "Voltar para a comunidade",
    notFound: "Tópico não encontrado.",
    level: "Nv.",
    confirmDelete: "Apagar definitivamente?",
    error: "Não foi possível concluir. Tente de novo.",
  },
  es: {
    eyebrow: "Comunidad",
    title: "Comunidad Jornada DevOps",
    lead: "Resuelve dudas, ayuda a otros alumnos y charla en directo. Tu nivel aparece junto a tu nick.",
    open: "Temas abiertos",
    closed: "Temas cerrados",
    chat: "Chat",
    newTopic: "Abrir tema",
    topicTitle: "Título",
    topicBody: "Describe tu duda o asunto",
    publish: "Publicar",
    cancel: "Cancelar",
    replies: "respuestas",
    solved: "Resuelto",
    unsolved: "Sin resolver",
    markSolved: "Marcar como resuelto",
    markUnsolved: "Marcar como sin resolver",
    close: "Cerrar tema",
    reopen: "Reabrir tema",
    pin: "Fijar",
    unpin: "Desfijar",
    pinned: "Fijado",
    closedTag: "Cerrado",
    delete: "Borrar",
    ban: "Bloquear usuario",
    unban: "Desbloquear",
    banned: "Estás bloqueado y no puedes publicar.",
    reply: "Responder",
    replyPlaceholder: "Escribe tu respuesta",
    closedNoReply: "Este tema está cerrado a nuevas respuestas.",
    empty: "Todavía no hay temas aquí.",
    chatEmpty: "Aún no hay mensajes. ¡Saluda!",
    send: "Enviar",
    chatPlaceholder: "Escribe un mensaje",
    signIn: "Inicia sesión para participar",
    signInBtn: "Entrar",
    nickTitle: "Elige tu nick",
    nickHint: "De 3 a 24 caracteres: letras, números, punto, guion o guion bajo. Todos lo verán.",
    nickSave: "Guardar nick",
    nickTaken: "Ese nick ya está en uso.",
    nickInvalid: "Nick no válido.",
    you: "Tu nick",
    back: "Volver a la comunidad",
    notFound: "Tema no encontrado.",
    level: "Nv.",
    confirmDelete: "¿Borrar definitivamente?",
    error: "No se pudo completar. Inténtalo de nuevo.",
  },
  en: {
    eyebrow: "Community",
    title: "Jornada DevOps Community",
    lead: "Ask questions, help other students and chat live. Your level shows next to your nickname.",
    open: "Open topics",
    closed: "Closed topics",
    chat: "Chat",
    newTopic: "Open a topic",
    topicTitle: "Title",
    topicBody: "Describe your question or subject",
    publish: "Publish",
    cancel: "Cancel",
    replies: "replies",
    solved: "Solved",
    unsolved: "Unsolved",
    markSolved: "Mark as solved",
    markUnsolved: "Mark as unsolved",
    close: "Close topic",
    reopen: "Reopen topic",
    pin: "Pin",
    unpin: "Unpin",
    pinned: "Pinned",
    closedTag: "Closed",
    delete: "Delete",
    ban: "Block user",
    unban: "Unblock",
    banned: "You are blocked and cannot post.",
    reply: "Reply",
    replyPlaceholder: "Write your reply",
    closedNoReply: "This topic is closed to new replies.",
    empty: "No topics here yet.",
    chatEmpty: "No messages yet. Say hi!",
    send: "Send",
    chatPlaceholder: "Write a message",
    signIn: "Sign in to take part",
    signInBtn: "Sign in",
    nickTitle: "Choose your nickname",
    nickHint: "3 to 24 characters: letters, numbers, dot, hyphen or underscore. Everyone will see it.",
    nickSave: "Save nickname",
    nickTaken: "That nickname is taken.",
    nickInvalid: "Invalid nickname.",
    you: "Your nickname",
    back: "Back to the community",
    notFound: "Topic not found.",
    level: "Lv.",
    confirmDelete: "Delete permanently?",
    error: "Could not complete. Please try again.",
  },
};

export function useCT() {
  const { lang } = useI18n();
  return useCallback((k: string) => DICT[lang]?.[k] ?? DICT.pt[k] ?? k, [lang]);
}

/** Perfil da comunidade do usuário atual + se está bloqueado. */
export function useMyCommunity() {
  const { user } = useAuth();
  const [nickname, setNickname] = useState<string | null>(null);
  const [banned, setBanned] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setNickname(null);
      setBanned(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: p }, { data: b }] = await Promise.all([
      supabase.from("community_profiles").select("nickname").eq("user_id", user.id).maybeSingle(),
      supabase.from("community_bans").select("user_id").eq("user_id", user.id).maybeSingle(),
    ]);
    setNickname(p?.nickname ?? null);
    setBanned(Boolean(b));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveNickname = useCallback(
    async (nick: string): Promise<"ok" | "taken" | "invalid" | "error"> => {
      if (!user) return "error";
      if (!/^[A-Za-z0-9_.-]{3,24}$/.test(nick)) return "invalid";
      const { error } = nickname
        ? await supabase.from("community_profiles").update({ nickname: nick }).eq("user_id", user.id)
        : await supabase.from("community_profiles").insert({ user_id: user.id, nickname: nick });
      if (error) return error.code === "23505" ? "taken" : "error";
      setNickname(nick);
      return "ok";
    },
    [user, nickname],
  );

  return { user, nickname, banned, loading, saveNickname, reload: load };
}

export function AuthorBadge({ author }: { author: Author | null | undefined }) {
  const { lang } = useI18n();
  const ct = useCT();
  if (!author) return <span className="text-sm text-muted-foreground">—</span>;
  const lvl = levelFromXp(author.xp);
  const cls = contentText(lang, `class.${slugifyClassName(lvl.className)}`, "title", lvl.className);
  const tone = lvl.level >= 40 ? "legendary" : lvl.level >= 25 ? "epic" : lvl.level >= 10 ? "accent" : "primary";
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="font-mono text-sm font-semibold text-foreground">{author.nickname}</span>
      <Chip tone={tone}>
        {ct("level")} {lvl.level} · {cls}
      </Chip>
    </span>
  );
}

export function formatWhen(iso: string, lang: Lang) {
  const loc = lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en";
  return new Date(iso).toLocaleString(loc, { dateStyle: "short", timeStyle: "short" });
}
