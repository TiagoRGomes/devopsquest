import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Panel } from "@/components/ui-bits";
import { useCT, useMyCommunity } from "@/lib/community";

/** Mostra o conteúdo de participação só para quem está logado, tem nick e não está bloqueado. */
export function CommunityGate({
  me,
  children,
}: {
  me: ReturnType<typeof useMyCommunity>;
  children: ReactNode;
}) {
  const ct = useCT();
  const [nick, setNick] = useState("");
  const [saving, setSaving] = useState(false);

  if (me.loading) return null;
  if (!me.user)
    return (
      <Panel className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{ct("signIn")}</p>
        <Link to="/auth" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {ct("signInBtn")}
        </Link>
      </Panel>
    );
  if (me.banned) return <Panel className="text-sm text-destructive">{ct("banned")}</Panel>;
  if (!me.nickname)
    return (
      <Panel>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            const r = await me.saveNickname(nick.trim());
            setSaving(false);
            if (r === "taken") toast.error(ct("nickTaken"));
            else if (r === "invalid") toast.error(ct("nickInvalid"));
            else if (r === "error") toast.error(ct("error"));
          }}
        >
          <label className="block text-sm font-semibold text-foreground" htmlFor="nick">
            {ct("nickTitle")}
          </label>
          <p className="text-xs text-muted-foreground">{ct("nickHint")}</p>
          <div className="flex flex-wrap gap-2">
            <input
              id="nick"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              maxLength={24}
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-foreground"
            />
            <button
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {ct("nickSave")}
            </button>
          </div>
        </form>
      </Panel>
    );
  return <>{children}</>;
}
