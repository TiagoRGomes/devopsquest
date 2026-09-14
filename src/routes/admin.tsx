import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n, type Lang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useIsAdmin, deleteOverride, saveOverride } from "@/lib/admin";
import { useContentOverrides } from "@/lib/content-overrides";
import { contentList, contentText } from "@/lib/content-i18n";
import { MODULES } from "@/data/curriculum";
import { getExam } from "@/data/exams";
import { Panel, SectionTitle } from "@/components/ui-bits";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administração de conteúdo — Jornada DevOps" },
      {
        name: "description",
        content:
          "Área de administração da Jornada DevOps para editar módulos, aulas e exames em português, espanhol e inglês.",
      },
      { property: "og:title", content: "Administração — Jornada DevOps" },
      { property: "og:description", content: "Edite módulos, aulas e exames do curso em cada idioma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

type Tab = "module" | "lesson" | "exam";

function Field({
  label,
  value,
  onChange,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
      />
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function AdminPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { isAdmin, checking } = useIsAdmin();
  const { reload, version } = useContentOverrides();

  const [editLang, setEditLang] = useState<Lang>(lang);
  const [tab, setTab] = useState<Tab>("module");
  const [moduleId, setModuleId] = useState<string>(MODULES[0]?.id ?? "");
  const mod = useMemo(() => MODULES.find((m) => m.id === moduleId) ?? MODULES[0], [moduleId]);
  const [lessonId, setLessonId] = useState<string>(mod?.lessons[0]?.id ?? "");
  const lesson = useMemo(
    () => mod?.lessons.find((l) => l.id === lessonId) ?? mod?.lessons[0],
    [mod, lessonId],
  );
  const exam = mod ? getExam(mod.id) : undefined;
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mod && !mod.lessons.some((l) => l.id === lessonId)) setLessonId(mod.lessons[0]?.id ?? "");
  }, [mod, lessonId]);

  // Recarrega o formulário quando muda idioma, módulo, aula ou aba.
  useEffect(() => {
    if (!mod) return;
    const next: Record<string, string> = {};
    const lines = (list: string[]) => list.join("\n");
    if (tab === "module") {
      next["title"] = contentText(editLang, mod.id, "title", mod.title);
      next["tagline"] = contentText(editLang, mod.id, "tagline", mod.tagline);
      next["overview"] = contentText(editLang, mod.id, "overview", mod.overview);
      next["objectives"] = lines(contentList(editLang, mod.id, "objectives", mod.objectives));
    } else if (tab === "lesson" && lesson) {
      next["title"] = contentText(editLang, lesson.id, "title", lesson.title);
      next["objectives"] = lines(contentList(editLang, lesson.id, "objectives", lesson.objectives));
      next["body"] = lines(contentList(editLang, lesson.id, "body", lesson.body));
      next["whyItMatters"] = contentText(editLang, lesson.id, "whyItMatters", lesson.whyItMatters);
      next["commonMistake"] = contentText(editLang, lesson.id, "commonMistake", lesson.commonMistake);
      next["productionTip"] = contentText(editLang, lesson.id, "productionTip", lesson.productionTip);
      next["interviewQuestion"] = contentText(
        editLang,
        lesson.id,
        "interviewQuestion",
        lesson.interviewQuestion,
      );
    } else if (tab === "exam" && exam) {
      exam.questions.forEach((q, i) => {
        next[`q${i}`] = contentText(editLang, `exam.${exam.moduleId}`, `q${i}`, q.question);
        next[`q${i}opts`] = lines(
          contentList(editLang, `exam.${exam.moduleId}`, `q${i}opts`, q.options),
        );
        next[`q${i}exp`] = contentText(editLang, `exam.${exam.moduleId}`, `q${i}exp`, q.explanation);
      });
    }
    setDraft(next);
  }, [tab, editLang, mod, lesson, exam, version]);

  const entity = useMemo(() => {
    if (tab === "module") return { kind: "module" as const, id: mod?.id ?? "" };
    if (tab === "lesson") return { kind: "lesson" as const, id: lesson?.id ?? "" };
    return { kind: "exam" as const, id: exam ? `exam.${exam.moduleId}` : "" };
  }, [tab, mod, lesson, exam]);

  const listFields = useMemo(() => {
    const set = new Set<string>(["objectives", "body"]);
    if (tab === "exam" && exam) exam.questions.forEach((_, i) => set.add(`q${i}opts`));
    return set;
  }, [tab, exam]);

  async function handleSave() {
    if (!entity.id) return;
    setSaving(true);
    try {
      const data: Record<string, string | string[]> = {};
      for (const [key, value] of Object.entries(draft)) {
        const trimmed = value.trim();
        if (!trimmed) continue;
        data[key] = listFields.has(key)
          ? trimmed.split("\n").map((s) => s.trim()).filter(Boolean)
          : trimmed;
      }
      await saveOverride(entity.kind, entity.id, editLang, data);
      await reload();
      toast.success(t("admin.saved"));
    } catch {
      toast.error(t("admin.saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleRestore() {
    if (!entity.id) return;
    setSaving(true);
    try {
      await deleteOverride(entity.kind, entity.id, editLang);
      await reload();
      toast.success(t("admin.restored"));
    } catch {
      toast.error(t("admin.saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <Panel>
        <p className="text-sm text-muted-foreground">…</p>
      </Panel>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Panel className="text-center">
        <ShieldAlert className="mx-auto size-8 text-warning" />
        <h1 className="mt-3 font-display text-xl font-semibold text-foreground">{t("admin.denied")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("admin.deniedText")}</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex rounded-lg border border-border px-3.5 py-2 text-sm text-foreground hover:border-primary/50"
        >
          {t("nav.dashboard")}
        </Link>
      </Panel>
    );
  }

  const set = (key: string) => (value: string) => setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <Panel className="bg-hero">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          <Wand2 className="mr-1 inline size-3.5" /> {t("admin.eyebrow")}
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {t("admin.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t("admin.lead")}</p>
      </Panel>

      <Panel className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{t("admin.lang")}</span>
          <select
            value={editLang}
            onChange={(e) => setEditLang(e.target.value as Lang)}
            className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
          >
            <option value="pt">Português (BR)</option>
            <option value="es">Español (ES)</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{t("admin.module")}</span>
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
          >
            {MODULES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.index}. {m.title}
              </option>
            ))}
          </select>
        </label>
        {tab === "lesson" && (
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{t("admin.lesson")}</span>
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
            >
              {(mod?.lessons ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </Panel>

      <div className="flex flex-wrap gap-2">
        {(["module", "lesson", "exam"] as Tab[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-lg border px-3.5 py-2 text-sm ${
              tab === k
                ? "border-primary/60 bg-primary/12 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {t(k === "module" ? "admin.tabModule" : k === "lesson" ? "admin.tabLesson" : "admin.tabExam")}
          </button>
        ))}
      </div>

      <Panel className="space-y-4">
        <SectionTitle
          eyebrow={entity.id}
          title={t(tab === "module" ? "admin.tabModule" : tab === "lesson" ? "admin.tabLesson" : "admin.tabExam")}
        />

        {tab === "module" && (
          <div className="space-y-3">
            <Field label={t("admin.f.title")} value={draft["title"] ?? ""} onChange={set("title")} rows={2} />
            <Field label={t("admin.f.tagline")} value={draft["tagline"] ?? ""} onChange={set("tagline")} rows={2} />
            <Field label={t("admin.f.overview")} value={draft["overview"] ?? ""} onChange={set("overview")} rows={4} />
            <Field
              label={t("admin.f.objectives")}
              value={draft["objectives"] ?? ""}
              onChange={set("objectives")}
              rows={5}
              hint={t("admin.listHint")}
            />
          </div>
        )}

        {tab === "lesson" && lesson && (
          <div className="space-y-3">
            <Field label={t("admin.f.title")} value={draft["title"] ?? ""} onChange={set("title")} rows={2} />
            <Field
              label={t("admin.f.objectives")}
              value={draft["objectives"] ?? ""}
              onChange={set("objectives")}
              rows={4}
              hint={t("admin.listHint")}
            />
            <Field
              label={t("admin.f.body")}
              value={draft["body"] ?? ""}
              onChange={set("body")}
              rows={10}
              hint={t("admin.listHint")}
            />
            <Field label={t("admin.f.why")} value={draft["whyItMatters"] ?? ""} onChange={set("whyItMatters")} />
            <Field label={t("admin.f.mistake")} value={draft["commonMistake"] ?? ""} onChange={set("commonMistake")} />
            <Field label={t("admin.f.tip")} value={draft["productionTip"] ?? ""} onChange={set("productionTip")} />
            <Field
              label={t("admin.f.interview")}
              value={draft["interviewQuestion"] ?? ""}
              onChange={set("interviewQuestion")}
            />
          </div>
        )}

        {tab === "exam" && exam && (
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">{t("admin.examHint")}</p>
            {exam.questions.map((q, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-border/70 p-3">
                <Field
                  label={t("admin.f.question", { n: i + 1 })}
                  value={draft[`q${i}`] ?? ""}
                  onChange={set(`q${i}`)}
                  rows={2}
                />
                <Field
                  label={t("admin.f.options")}
                  value={draft[`q${i}opts`] ?? ""}
                  onChange={set(`q${i}opts`)}
                  rows={4}
                  hint={t("admin.listHint")}
                />
                <Field
                  label={t("admin.f.explanation")}
                  value={draft[`q${i}exp`] ?? ""}
                  onChange={set(`q${i}exp`)}
                  rows={2}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="inline-flex rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? t("admin.saving") : t("admin.save")}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleRestore()}
            className="inline-flex rounded-lg border border-border px-3.5 py-2 text-sm text-foreground hover:border-destructive/50 disabled:opacity-60"
          >
            {t("admin.restore")}
          </button>
        </div>
      </Panel>
    </div>
  );
}
