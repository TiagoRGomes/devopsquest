import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Clock, Flame, LogOut, RotateCcw, Save, Trash2, Upload, Zap } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { initials, useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { ALL_LESSONS } from "@/data/curriculum";
import { LABS } from "@/data/labs";
import { BOSSES, CHALLENGES } from "@/data/challenges";
import { PROJECT_STEPS } from "@/data/project";
import { Panel, SectionTitle, StatTile, XpBar } from "@/components/ui-bits";

const YEAR_SECONDS = 60 * 60 * 24 * 365;

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — DevOps Quest RPG" },
      {
        name: "description",
        content: "Seu perfil de aprendiz DevOps: nível, XP, sequência de estudo, anotações e progresso por área.",
      },
      { property: "og:title", content: "Meu perfil — DevOps Quest RPG" },
      { property: "og:description", content: "Resumo do seu progresso na jornada DevOps." },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { progress, level, earnedBadges, reset } = useProgress();
  const { user, profile, updateProfile, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notes = Object.entries(progress.notes).filter(([, v]) => v.trim().length > 0);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(profile?.display_name ?? "");
    setAvatar(profile?.avatar_url ?? "");
  }, [profile?.display_name, profile?.avatar_url]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({ display_name: name.trim(), avatar_url: avatar.trim() || null });
      toast.success("Perfil atualizado");
    } catch {
      toast.error("Não foi possível salvar o perfil");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(file: File) {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("profile.uploadError"));
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data, error: signErr } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, YEAR_SECONDS);
      if (signErr || !data?.signedUrl) throw signErr ?? new Error("sign");
      setAvatar(data.signedUrl);
      await updateProfile({ display_name: name.trim(), avatar_url: data.signedUrl });
      toast.success(t("profile.uploadOk"));
    } catch {
      toast.error(t("profile.uploadError"));
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto() {
    setAvatar("");
    try {
      await updateProfile({ display_name: name.trim(), avatar_url: null });
      toast.success(t("profile.uploadOk"));
    } catch {
      toast.error(t("profile.uploadError"));
    }
  }


  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-6">
      <Panel className="bg-hero">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-level font-display text-xl font-semibold text-primary-foreground">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name ?? "Foto do perfil"}
                className="size-full object-cover"
              />
            ) : (
              initials(profile?.display_name, user?.email)
            )}
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">
              {profile?.display_name || user?.email || "Visitante"}
            </h1>
            <p className="text-sm text-accent">
              Nível {level.level} · {level.className}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {user
                ? "Progresso salvo na sua conta — abra em qualquer aparelho."
                : "Você está sem conta: o progresso fica só neste navegador."}
            </p>
          </div>
          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="ml-auto inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" /> Sair
            </button>
          ) : (
            <Link
              to="/auth"
              className="ml-auto inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Entrar e salvar na nuvem
            </Link>
          )}
        </div>
        <div className="mt-6 max-w-lg">
          <XpBar percent={level.progress} />
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {level.xpIntoLevel}/{level.xpForNext} XP para o nível {level.level + 1}
          </p>
        </div>
      </Panel>

      {user && (
        <Panel>
          <SectionTitle eyebrow="Conta" title={t("profile.photo")} />
          <div className="mt-4 flex flex-wrap items-start gap-5">
            <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-surface-2 font-display text-lg text-muted-foreground">
              {avatar ? (
                <img src={avatar} alt={name || "Foto do perfil"} className="size-full object-cover" />
              ) : (
                initials(name, user.email)
              )}
            </span>
            <div className="min-w-[220px] flex-1 space-y-3">
              <label className="block">
                <span className="text-xs text-muted-foreground">Nome de exibição</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="Seu nome"
                />
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleUpload(file);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/12 px-3.5 py-2 text-sm font-medium text-primary disabled:opacity-60"
                >
                  <Upload className="size-4" /> {uploading ? t("profile.uploading") : t("profile.upload")}
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={() => void handleRemovePhoto()}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="size-4" /> {t("profile.remove")}
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{t("profile.uploadHint")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            <Save className="size-4" /> Salvar perfil
          </button>
        </Panel>
      )}


      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="XP total" value={`${progress.xp}`} icon={<Zap className="size-4" />} />
        <StatTile label="Sequência" value={`${progress.streak} dias`} icon={<Flame className="size-4" />} />
        <StatTile label="Tempo estudado" value={`${Math.round(progress.minutesStudied / 60)}h`} icon={<Clock className="size-4" />} />
        <StatTile label="Badges" value={`${earnedBadges.length}`} />
      </div>

      <Panel>
        <SectionTitle eyebrow="Progresso" title="Onde você está em cada frente" />
        <ul className="mt-4 space-y-3">
          {[
            { label: "Aulas", done: progress.completedLessons.length, total: ALL_LESSONS.length },
            { label: "Laboratórios", done: progress.completedLabs.length, total: LABS.length },
            { label: "Desafios", done: progress.completedChallenges.length, total: CHALLENGES.length },
            { label: "Boss Battles", done: progress.defeatedBosses.length, total: BOSSES.length },
            { label: "Quizzes", done: progress.quizPassed.length, total: ALL_LESSONS.length },
            { label: "PrintQuest", done: progress.completedProjectSteps.length, total: PROJECT_STEPS.length },
          ].map((row) => (
            <li key={row.label}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-mono text-xs text-accent">
                  {row.done}/{row.total}
                </span>
              </div>
              <XpBar percent={Math.round((row.done / row.total) * 100)} className="mt-1.5 h-1.5" />
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <SectionTitle eyebrow="Caderno" title={`Minhas anotações (${notes.length})`} />
        {notes.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Você ainda não anotou nada. Cada aula tem um campo de anotações no final.
          </p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {notes.map(([lessonId, text]) => {
              const lesson = ALL_LESSONS.find((l) => l.id === lessonId);
              return (
                <li key={lessonId} className="rounded-xl border border-border bg-surface-2 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{lesson?.title ?? lessonId}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{text}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel>
        <h2 className="font-display font-semibold text-foreground">Reiniciar progresso</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Apaga XP, aulas, labs e anotações — inclusive na sua conta. Não dá para desfazer.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/12 px-3.5 py-2 text-sm text-destructive hover:bg-destructive/20"
        >
          <RotateCcw className="size-4" /> Reiniciar tudo
        </button>
      </Panel>
    </div>
  );
}
