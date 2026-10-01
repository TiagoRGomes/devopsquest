import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Ban, CheckCircle2, Lock, Pin, Trash2, Unlock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useIsAdmin } from "@/lib/admin";
import { AuthorBadge, formatWhen, useCT, useMyCommunity, type Author } from "@/lib/community";
import { CommunityGate } from "@/components/community/CommunityGate";
import { Chip, Panel } from "@/components/ui-bits";

export const Route = createFileRoute("/comunidade/$topicId")({
  head: () => ({
    meta: [
      { title: "Tópico da comunidade | Jornada DevOps" },
      { name: "description", content: "Discussão da comunidade Jornada DevOps: pergunta, respostas e status de solução." },
      { property: "og:title", content: "Tópico da comunidade Jornada DevOps" },
      { property: "og:description", content: "Veja a pergunta, as respostas dos alunos e se foi solucionada." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TopicPage,
});

interface Topic {
  id: string;
  author_id: string;
  title: string;
  body: string;
  is_closed: boolean;
  is_solved: boolean;
  is_pinned: boolean;
  created_at: string;
  author: Author | null;
}
interface Reply {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
  author: Author | null;
}

function TopicPage() {
  const { topicId } = Route.useParams();
  const ct = useCT();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const me = useMyCommunity();
  const { isAdmin } = useIsAdmin();
  const [topic, setTopic] = useState<Topic | null | undefined>(undefined);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [text, setText] = useState("");

  const load = useCallback(async () => {
    const [{ data: t }, { data: r }] = await Promise.all([
      supabase
        .from("forum_topics")
        .select("id,author_id,title,body,is_closed,is_solved,is_pinned,created_at,author:community_profiles(nickname,xp)")
        .eq("id", topicId)
        .maybeSingle(),
      supabase
        .from("forum_replies")
        .select("id,author_id,body,created_at,author:community_profiles(nickname,xp)")
        .eq("topic_id", topicId)
        .order("created_at"),
    ]);
    setTopic((t as unknown as Topic) ?? null);
    setReplies((r as unknown as Reply[]) ?? []);
  }, [topicId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (topic === undefined) return null;
  if (topic === null)
    return (
      <Panel className="space-y-3">
        <p className="text-sm text-muted-foreground">{ct("notFound")}</p>
        <Link to="/comunidade" className="text-sm text-primary">{ct("back")}</Link>
      </Panel>
    );

  const isAuthor = me.user?.id === topic.author_id;
  const canManage = isAuthor || isAdmin;

  async function update(values: Partial<Pick<Topic, "is_closed" | "is_solved" | "is_pinned">>) {
    const { error } = await supabase.from("forum_topics").update(values).eq("id", topicId);
    if (error) { toast.error(ct("error")); return; }
    void load();
  }
  async function removeTopic() {
    if (!confirm(ct("confirmDelete"))) return;
    const { error } = await supabase.from("forum_topics").delete().eq("id", topicId);
    if (error) { toast.error(ct("error")); return; }
    void navigate({ to: "/comunidade" });
  }
  async function removeReply(id: string) {
    if (!confirm(ct("confirmDelete"))) return;
    const { error } = await supabase.from("forum_replies").delete().eq("id", id);
    if (error) { toast.error(ct("error")); return; }
    void load();
  }
  async function ban(userId: string) {
    if (!confirm(ct("ban") + "?")) return;
    const { error } = await supabase.from("community_bans").insert({ user_id: userId });
    if (error && error.code !== "23505") { toast.error(ct("error")); return; }
    toast.success(ct("ban"));
  }
  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!me.user || !text.trim()) return;
    const { error } = await supabase.from("forum_replies").insert({ topic_id: topicId, author_id: me.user.id, body: text.trim() });
    if (error) { toast.error(ct("error")); return; }
    setText("");
    void load();
  }

  const btn = "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-surface-2";

  return (
    <div className="space-y-5">
      <Link to="/comunidade" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {ct("back")}
      </Link>
      <Panel className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {topic.is_pinned && <Chip tone="warning"><Pin className="size-3" /> {ct("pinned")}</Chip>}
          {topic.is_closed && <Chip tone="danger"><Lock className="size-3" /> {ct("closedTag")}</Chip>}
          {topic.is_solved ? <Chip tone="success"><CheckCircle2 className="size-3" /> {ct("solved")}</Chip> : <Chip>{ct("unsolved")}</Chip>}
        </div>
        <h1 className="text-2xl font-semibold text-foreground">{topic.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <AuthorBadge author={topic.author} /> · {formatWhen(topic.created_at, lang)}
        </div>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">{topic.body}</p>
        {canManage && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <button className={btn} onClick={() => void update({ is_solved: !topic.is_solved })}>
              <CheckCircle2 className="size-3.5" /> {topic.is_solved ? ct("markUnsolved") : ct("markSolved")}
            </button>
            <button className={btn} onClick={() => void update({ is_closed: !topic.is_closed })}>
              {topic.is_closed ? <Unlock className="size-3.5" /> : <Lock className="size-3.5" />}
              {topic.is_closed ? ct("reopen") : ct("close")}
            </button>
            {isAdmin && (
              <button className={btn} onClick={() => void update({ is_pinned: !topic.is_pinned })}>
                <Pin className="size-3.5" /> {topic.is_pinned ? ct("unpin") : ct("pin")}
              </button>
            )}
            <button className={btn} onClick={() => void removeTopic()}>
              <Trash2 className="size-3.5" /> {ct("delete")}
            </button>
            {isAdmin && !isAuthor && (
              <button className={btn} onClick={() => void ban(topic.author_id)}>
                <Ban className="size-3.5" /> {ct("ban")}
              </button>
            )}
          </div>
        )}
      </Panel>

      <p className="text-sm font-semibold text-foreground">
        {replies.length} {ct("replies")}
      </p>
      <ul className="space-y-3">
        {replies.map((r) => (
          <li key={r.id}>
            <Panel className="space-y-2 p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <AuthorBadge author={r.author} /> · {formatWhen(r.created_at, lang)}
                {(isAdmin || r.author_id === me.user?.id) && (
                  <button aria-label={ct("delete")} onClick={() => void removeReply(r.id)} className="ml-auto hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </button>
                )}
                {isAdmin && r.author_id !== me.user?.id && (
                  <button aria-label={ct("ban")} onClick={() => void ban(r.author_id)} className="hover:text-destructive">
                    <Ban className="size-3.5" />
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap break-words text-sm text-foreground">{r.body}</p>
            </Panel>
          </li>
        ))}
      </ul>

      {topic.is_closed ? (
        <Panel className="text-sm text-muted-foreground">{ct("closedNoReply")}</Panel>
      ) : (
        <CommunityGate me={me}>
          <form onSubmit={sendReply} className="space-y-2">
            <textarea
              aria-label={ct("replyPlaceholder")}
              placeholder={ct("replyPlaceholder")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              required
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
            />
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">{ct("reply")}</button>
          </form>
        </CommunityGate>
      )}
    </div>
  );
}
