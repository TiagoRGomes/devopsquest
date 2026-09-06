import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogIn, Mail, ShieldCheck, Terminal } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Panel } from "@/components/ui-bits";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — DevOps Quest RPG" },
      {
        name: "description",
        content:
          "Entre na sua conta do DevOps Quest RPG para salvar XP, aulas, laboratórios e conquistas em qualquer aparelho.",
      },
      { property: "og:title", content: "Entrar — DevOps Quest RPG" },
      {
        property: "og:description",
        content: "Sua jornada DevOps salva na nuvem: entre com e-mail ou Google.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentEmail, setSentEmail] = useState(false);

  useEffect(() => {
    if (!loading && session) void navigate({ to: "/", replace: true });
  }, [loading, session, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name.trim() || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSentEmail(true);
          toast.success("Confira seu e-mail para confirmar a conta");
          return;
        }
        toast.success("Conta criada! Bem-vindo à jornada.");
        router.invalidate();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        router.invalidate();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível continuar");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Não foi possível entrar com o Google");
        return;
      }
      if (result.redirected) return;
      router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-level text-primary-foreground">
          <Terminal className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground">
            {mode === "signin" ? "Entrar na sua jornada" : "Criar sua conta"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Seu XP, aulas e conquistas ficam salvos na nuvem.
          </p>
        </div>
      </div>

      <Panel>
        {sentEmail ? (
          <div className="space-y-3 text-center">
            <Mail className="mx-auto size-8 text-primary" />
            <p className="font-display text-lg text-foreground">Confirme seu e-mail</p>
            <p className="text-sm text-muted-foreground">
              Enviamos um link para <span className="text-foreground">{email}</span>. Depois de
              confirmar, você já entra direto.
            </p>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-60"
            >
              <LogIn className="size-4" /> Continuar com Google
            </button>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                ou com e-mail
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <label className="block">
                  <span className="text-xs text-muted-foreground">Como quer ser chamado</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    placeholder="Tiago Gomes"
                  />
                </label>
              )}
              <label className="block">
                <span className="text-xs text-muted-foreground">E-mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="voce@email.com"
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted-foreground">Senha</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="mínimo 6 caracteres"
                />
              </label>

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                {mode === "signin" ? "Entrar" : "Criar conta"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-4 w-full text-center text-sm text-accent hover:underline"
            >
              {mode === "signin"
                ? "Ainda não tenho conta — criar agora"
                : "Já tenho conta — entrar"}
            </button>
          </>
        )}
      </Panel>

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-success" />
        Seu progresso atual neste navegador é levado para a conta ao entrar.
      </p>
    </div>
  );
}
