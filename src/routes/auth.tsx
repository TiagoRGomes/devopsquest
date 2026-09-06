import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, LogIn, Mail, ShieldCheck, Terminal } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Panel } from "@/components/ui-bits";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: "signup" } =>
    search["mode"] === "signup" ? { mode: "signup" } : {},

  head: () => ({
    meta: [
      { title: "Entrar — Jornada DevOps" },
      {
        name: "description",
        content:
          "Crie sua conta na Jornada DevOps para salvar XP, aulas, laboratórios e conquistas em qualquer aparelho.",
      },
      { property: "og:title", content: "Entrar — Jornada DevOps" },
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
  const { mode: initialMode } = Route.useSearch();
  const { t } = useI18n();
  const navigate = useNavigate();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode === "signup" ? "signup" : "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentEmail, setSentEmail] = useState(false);

  useEffect(() => {
    if (!loading && session) void navigate({ to: "/dashboard", replace: true });
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
          toast.success(t("auth.emailSent"));
          return;
        }
        toast.success(t("auth.created"));
        router.invalidate();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.welcomeBack"));
        router.invalidate();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.genericError"));
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
        toast.error(t("auth.googleError"));
        return;
      }
      if (result.redirected) return;
      router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            {t("auth.back")}
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-level text-primary-foreground">
            <Terminal className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold text-foreground">
              {mode === "signin" ? t("auth.signinTitle") : t("auth.signupTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("auth.subtitle")}</p>
          </div>
        </div>

        <Panel>
          {sentEmail ? (
            <div className="space-y-3 text-center">
              <Mail className="mx-auto size-8 text-primary" />
              <p className="font-display text-lg text-foreground">{t("auth.checkEmail")}</p>
              <p className="text-sm text-muted-foreground">{t("auth.checkEmailText", { email })}</p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-60"
              >
                <LogIn className="size-4" /> {t("auth.google")}
              </button>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {t("auth.orEmail")}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "signup" && (
                  <label className="block">
                    <span className="text-xs text-muted-foreground">{t("auth.name")}</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    />
                  </label>
                )}
                <label className="block">
                  <span className="text-xs text-muted-foreground">{t("auth.email")}</span>
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
                  <span className="text-xs text-muted-foreground">{t("auth.password")}</span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    placeholder={t("auth.passwordHint")}
                  />
                </label>

                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  {mode === "signin" ? t("auth.signin") : t("auth.signup")}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="mt-4 w-full text-center text-sm text-accent hover:underline"
              >
                {mode === "signin" ? t("auth.toSignup") : t("auth.toSignin")}
              </button>
            </>
          )}
        </Panel>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-success" />
          {t("auth.localNote")}
        </p>
      </div>
    </div>
  );
}
