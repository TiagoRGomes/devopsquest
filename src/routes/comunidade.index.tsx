import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, CircleDashed, Lock, MessageSquare, Pin, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useIsAdmin } from "@/lib/admin";
import { AuthorBadge, formatWhen, useCT, useMyCommunity, type Author } from "@/lib/community";
import { CommunityGate } from "@/components/community/CommunityGate";
import { Chip, Panel, SectionTitle } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

type Tab = "open" | "closed" | "chat";

export const Route = createFileRoute("/comunidade/")({
  head: () => ({
    meta: [
      { title: "Comunidade — fórum e bate-papo | DevOpsQuest" },
      { name: "description", content: "Fórum de dúvidas e bate-papo ao vivo dos alunos da DevOpsQuest, com nick e nível de cada pessoa." },
      { property: "og:title", content: "Comunidade DevOpsQuest" },
      { property: "og:description", content: "Tópicos abertos e fechados, dúvidas solucionadas e bate-papo ao vivo entre alunos de DevOps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityPage,
});

interface TopicRow {
  id: string;
  title: string;
  is_closed: boolean;
  is_solved: boolean;
  is_pinned: boolean;
  reply_count: number;
  last_activity_at: string;
  author: Author | null;
}

function CommunityPage() {
  const ct = useCT();
  const [tab, setTab] = useState<Tab>("open");
  const me = useMyCommunity();

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: "open", label: ct("open"), icon: CircleDashed },
    { id: "closed", label: ct("closed"), icon: Lock },
    { id: "chat", label: ct("chat"), icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow={ct("eyebrow")} title={ct("title")} description={ct("lead")} />
      {me.nickname && (
        <p className="text-xs text-muted-foreground">
          {ct("you")}: <span className="font-mono text-foreground">{me.nickname}</span>
        </p>
      )}
      <div role="tablist" className="flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
              tab === id ? "border-primary bg-primary/14 text-foreground" : "border-border text-muted-foreground hover:bg-surface-2",
            )}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>
      {tab === "chat" ? <Chat me={me} /> : <TopicList closed={tab === "closed"} me={me} />}
    </div>
  );
}

function TopicList({ closed, me }: { closed: boolean; me: ReturnType<typeof useMyCommunity> }) {
  const ct = useCT();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [rows, setRows] = useState<TopicRow[] | null>(null);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("forum_topics")
      .select("id,title,is_closed,is_solved,is_pinned,reply_count,last_activity_at,author:community_profiles(nickname,xp)")
      .eq("is_closed", closed)
      .order("is_pinned", { ascending: false })
      .order("last_activity_at", { ascending: false })
      .limit(100);
    setRows((data as unknown as TopicRow[]) ?? []);
  }, [closed]);

  useEffect(() => {
    setRows(null);
    void load();
  }, [load]);

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!me.user) return;
    const { data, error } = await supabase
      .from("forum_topics")
      .insert({ author_id: me.user.id, title: title.trim(), body: body.trim() })
      .select("id")
      .single();
    if (error || !data) { toast.error(ct("error")); return; }
    setTitle("");
    setBody("");
    setComposing(false);
    void navigate({ to: "/comunidade/$topicId", params: { topicId: data.id } });
  }

  return (
    <div className="space-y-4">
      {!closed && (
        <CommunityGate me={me}>
          {composing ? (
            <Panel>
              <form onSubmit={publish} className="space-y-3">
                <input
                  aria-label={ct("topicTitle")}
                  placeholder={ct("topicTitle")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  minLength={3}
                  maxLength={160}
                  required
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
                />
                <textarea
                  aria-label={ct("topicBody")}
                  placeholder={ct("topicBody")}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  rows={6}
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
                />
                <div className="flex gap-2">
                  <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">{ct("publish")}</button>
                  <button type="button" onClick={() => setComposing(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground">
                    {ct("cancel")}
                  </button>
                </div>
              </form>
            </Panel>
          ) : (
            <button onClick={() => setComposing(true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              {ct("newTopic")}
            </button>
          )}
        </CommunityGate>
      )}
      {rows === null ? null : rows.length === 0 ? (
        <Panel className="text-sm text-muted-foreground">{ct("empty")}</Panel>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id}>
              <Link to="/comunidade/$topicId" params={{ topicId: r.id }} className="panel block p-4 transition-colors hover:bg-surface-2">
                <div className="flex flex-wrap items-center gap-2">
                  {r.is_pinned && <Chip tone="warning"><Pin className="size-3" /> {ct("pinned")}</Chip>}
                  {r.is_solved ? (
                    <Chip tone="success"><CheckCircle2 className="size-3" /> {ct("solved")}</Chip>
                  ) : (
                    <Chip>{ct("unsolved")}</Chip>
                  )}
                  <h3 className="min-w-0 flex-1 font-semibold text-foreground">{r.title}</h3>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <AuthorBadge author={r.author} />
                  <span>
                    {r.reply_count} {ct("replies")} · {formatWhen(r.last_activity_at, lang)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ChatRow {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
  author: Author | null;
}

function Chat({ me }: { me: ReturnType<typeof useMyCommunity> }) {
  const ct = useCT();
  const { lang } = useI18n();
  const { isAdmin } = useIsAdmin();
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const SELECT = "id,author_id,body,created_at,author:community_profiles(nickname,xp)";

  useEffect(() => {
    let alive = true;
    void supabase
      .from("chat_messages")
      .select(SELECT)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (alive) setRows(((data as unknown as ChatRow[]) ?? []).reverse());
      });
    const channel = supabase
      .channel("community-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, async (payload) => {
        const id = (payload.new as { id: string }).id;
        const { data } = await supabase.from("chat_messages").select(SELECT).eq("id", id).maybeSingle();
        if (data) setRows((prev) => (prev.some((m) => m.id === id) ? prev : [...prev, data as unknown as ChatRow]));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "chat_messages" }, (payload) => {
        const id = (payload.old as { id: string }).id;
        setRows((prev) => prev.filter((m) => m.id !== id));
      })
      .subscribe();
    return () => {
      alive = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [rows.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || !me.user) return;
    setText("");
    const { error } = await supabase.from("chat_messages").insert({ author_id: me.user.id, body });
    if (error) toast.error(ct("error"));
  }

  async function remove(id: string) {
    const { error } = await supabase.from("chat_messages").delete().eq("id", id);
    if (error) { toast.error(ct("error")); return; }
    setRows((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-3">
      <Panel className="h-[28rem] overflow-y-auto p-4">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{ct("chatEmpty")}</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((m) => (
              <li key={m.id} className="group">
                <div className="flex flex-wrap items-center gap-2">
                  <AuthorBadge author={m.author} />
                  <span className="text-[11px] text-muted-foreground">{formatWhen(m.created_at, lang)}</span>
                  {(isAdmin || m.author_id === me.user?.id) && (
                    <button
                      onClick={() => void remove(m.id)}
                      aria-label={ct("delete")}
                      className="text-muted-foreground opacity-60 hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">{m.body}</p>
              </li>
            ))}
          </ul>
        )}
        <div ref={endRef} />
      </Panel>
      <CommunityGate me={me}>
        <form onSubmit={send} className="flex gap-2">
          <input
            aria-label={ct("chatPlaceholder")}
            placeholder={ct("chatPlaceholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
          />
          <button aria-label={ct("send")} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Send className="size-4" /> {ct("send")}
          </button>
        </form>
      </CommunityGate>
    </div>
  );
}
