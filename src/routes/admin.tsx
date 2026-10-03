import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Plus, ShieldAlert, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n, type Lang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useIsAdmin, deleteOverride, saveOverride } from "@/lib/admin";
import { useContentOverrides, type OverrideData } from "@/lib/content-overrides";
import { contentLinks, contentList, contentObjects, contentText, type ContentLink } from "@/lib/content-i18n";
import { MODULES } from "@/data/curriculum";
import { getExam } from "@/data/exams";
import { Panel, SectionTitle } from "@/components/ui-bits";
import { RichTextEditor } from "@/components/RichTextEditor";
import { RichText } from "@/lib/rich-text";
import type { CodeBlock, ExamLevel, ExamQuestion, QuizQuestion } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administração de conteúdo — DevOpsQuest" },
      {
        name: "description",
        content:
          "Área de administração da DevOpsQuest para editar módulos, aulas, quizzes e exames em português, espanhol e inglês.",
      },
      { property: "og:title", content: "Administração — DevOpsQuest" },
      { property: "og:description", content: "Edite módulos, aulas, quizzes e exames do curso em cada idioma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

type Tab = "module" | "lesson" | "exam";

interface QuizDraft extends QuizQuestion {
  level?: ExamLevel;
}

interface Draft {
  texts: Record<string, string>;
  lists: Record<string, string[]>;
  quiz: QuizDraft[];
  glossary: { term: string; definition: string }[];
  code: CodeBlock[];
  links: ContentLink[];
}

const EMPTY: Draft = { texts: {}, lists: {}, quiz: [], glossary: [], code: [], links: [] };

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{children}</span>
  );
}

function PlainField({
  label,
  value,
  onChange,
  rows = 1,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      {rows > 1 ? (
        <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
    </label>
  );
}

function RichField({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="block">
      <Label>{label}</Label>
      <div className="mt-1">
        <RichTextEditor value={value} onChange={onChange} rows={rows} />
      </div>
    </div>
  );
}

function RowActions({
  onUp,
  onDown,
  onRemove,
}: {
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  const btn =
    "rounded-md border border-border p-1.5 text-muted-foreground hover:border-primary/50 hover:text-foreground";
  return (
    <div className="flex shrink-0 gap-1">
      <button type="button" title={t("admin.up")} aria-label={t("admin.up")} onClick={onUp} className={btn}>
        <ArrowUp className="size-3.5" />
      </button>
      <button type="button" title={t("admin.down")} aria-label={t("admin.down")} onClick={onDown} className={btn}>
        <ArrowDown className="size-3.5" />
      </button>
      <button
        type="button"
        title={t("admin.remove")}
        aria-label={t("admin.remove")}
        onClick={onRemove}
        className="rounded-md border border-border p-1.5 text-muted-foreground hover:border-destructive/60 hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground"
    >
      <Plus className="size-3.5" /> {label}
    </button>
  );
}

function ListEditor({
  label,
  items,
  onChange,
  rich = false,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  rich?: boolean;
}) {
  const { t } = useI18n();
  return (
    <section className="space-y-2 rounded-xl border border-border/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold text-foreground">{label}</h3>
        <AddButton label={t("admin.add")} onClick={() => onChange([...items, ""])} />
      </div>
      {items.length === 0 && <p className="text-xs text-muted-foreground">{t("admin.empty")}</p>}
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            {rich ? (
              <RichTextEditor
                value={item}
                rows={4}
                onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))}
              />
            ) : (
              <textarea
                value={item}
                rows={2}
                onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
                className={inputClass}
              />
            )}
          </div>
          <RowActions
            onUp={() => onChange(move(items, i, i - 1))}
            onDown={() => onChange(move(items, i, i + 1))}
            onRemove={() => onChange(items.filter((_, j) => j !== i))}
          />
        </div>
      ))}
    </section>
  );
}

function QuizEditor({
  label,
  items,
  onChange,
  withLevel,
}: {
  label: string;
  items: QuizDraft[];
  onChange: (v: QuizDraft[]) => void;
  withLevel: boolean;
}) {
  const { t } = useI18n();
  const update = (i: number, patch: Partial<QuizDraft>) =>
    onChange(items.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  return (
    <section className="space-y-3 rounded-xl border border-border/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold text-foreground">{label}</h3>
        <AddButton
          label={t("admin.addQuestion")}
          onClick={() =>
            onChange([
              ...items,
              {
                question: "",
                options: ["", ""],
                answerIndex: 0,
                explanation: "",
                ...(withLevel ? { level: "facil" as ExamLevel } : {}),
              },
            ])
          }
        />
      </div>
      {items.length === 0 && <p className="text-xs text-muted-foreground">{t("admin.empty")}</p>}
      {items.map((q, i) => (
        <div key={i} className="space-y-2.5 rounded-lg border border-border/70 bg-surface-2/40 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="font-mono text-xs text-muted-foreground">{t("admin.f.question", { n: i + 1 })}</p>
            <RowActions
              onUp={() => onChange(move(items, i, i - 1))}
              onDown={() => onChange(move(items, i, i + 1))}
              onRemove={() => onChange(items.filter((_, j) => j !== i))}
            />
          </div>
          <PlainField
            label={t("admin.f.question", { n: i + 1 })}
            value={q.question}
            onChange={(v) => update(i, { question: v })}
            rows={2}
          />
          {withLevel && (
            <label className="block">
              <Label>{t("admin.f.level")}</Label>
              <select
                value={q.level ?? "facil"}
                onChange={(e) => update(i, { level: e.target.value as ExamLevel })}
                className={inputClass}
              >
                <option value="facil">{t("exam.level.facil")}</option>
                <option value="medio">{t("exam.level.medio")}</option>
                <option value="dificil">{t("exam.level.dificil")}</option>
              </select>
            </label>
          )}
          <div className="space-y-1.5">
            <Label>{t("admin.f.options")}</Label>
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${i}`}
                  title={t("admin.f.correct")}
                  checked={q.answerIndex === oi}
                  onChange={() => update(i, { answerIndex: oi })}
                />
                <input
                  value={opt}
                  onChange={(e) =>
                    update(i, { options: q.options.map((o, j) => (j === oi ? e.target.value : o)) })
                  }
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary/60"
                />
                <button
                  type="button"
                  title={t("admin.remove")}
                  aria-label={t("admin.remove")}
                  onClick={() =>
                    update(i, {
                      options: q.options.filter((_, j) => j !== oi),
                      answerIndex: q.answerIndex > oi ? q.answerIndex - 1 : q.answerIndex,
                    })
                  }
                  className="rounded-md border border-border p-1.5 text-muted-foreground hover:border-destructive/60 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
            <AddButton
              label={t("admin.addOption")}
              onClick={() => update(i, { options: [...q.options, ""] })}
            />
            <p className="text-[11px] text-muted-foreground">{t("admin.f.correct")}</p>
          </div>
          <PlainField
            label={t("admin.f.explanation")}
            value={q.explanation}
            onChange={(v) => update(i, { explanation: v })}
            rows={2}
          />
        </div>
      ))}
    </section>
  );
}

function GlossaryEditor({
  items,
  onChange,
}: {
  items: { term: string; definition: string }[];
  onChange: (v: { term: string; definition: string }[]) => void;
}) {
  const { t } = useI18n();
  return (
    <section className="space-y-2 rounded-xl border border-border/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold text-foreground">{t("admin.f.glossary")}</h3>
        <AddButton
          label={t("admin.add")}
          onClick={() => onChange([...items, { term: "", definition: "" }])}
        />
      </div>
      {items.map((g, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
            <PlainField
              label={t("admin.f.term")}
              value={g.term}
              onChange={(v) => onChange(items.map((x, j) => (j === i ? { ...x, term: v } : x)))}
            />
            <PlainField
              label={t("admin.f.definition")}
              value={g.definition}
              onChange={(v) => onChange(items.map((x, j) => (j === i ? { ...x, definition: v } : x)))}
              rows={2}
            />
          </div>
          <RowActions
            onUp={() => onChange(move(items, i, i - 1))}
            onDown={() => onChange(move(items, i, i + 1))}
            onRemove={() => onChange(items.filter((_, j) => j !== i))}
          />
        </div>
      ))}
    </section>
  );
}

function CodeEditor({ items, onChange }: { items: CodeBlock[]; onChange: (v: CodeBlock[]) => void }) {
  const { t } = useI18n();
  const update = (i: number, patch: Partial<CodeBlock>) =>
    onChange(items.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  return (
    <section className="space-y-2 rounded-xl border border-border/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold text-foreground">{t("admin.f.code")}</h3>
        <AddButton
          label={t("admin.add")}
          onClick={() => onChange([...items, { label: "", language: "bash", code: "" }])}
        />
      </div>
      {items.map((c, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border/70 bg-surface-2/40 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="font-mono text-xs text-muted-foreground">{t("admin.item", { n: i + 1 })}</p>
            <RowActions
              onUp={() => onChange(move(items, i, i - 1))}
              onDown={() => onChange(move(items, i, i + 1))}
              onRemove={() => onChange(items.filter((_, j) => j !== i))}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <PlainField label={t("admin.f.codeLabel")} value={c.label} onChange={(v) => update(i, { label: v })} />
            <PlainField
              label={t("admin.f.codeLang")}
              value={c.language}
              onChange={(v) => update(i, { language: v })}
            />
          </div>
          <label className="block">
            <Label>{t("admin.f.codeContent")}</Label>
            <textarea
              value={c.code}
              rows={6}
              onChange={(e) => update(i, { code: e.target.value })}
              className={`${inputClass} font-mono text-[13px]`}
            />
          </label>
          <PlainField
            label={t("admin.f.codeNote")}
            value={c.securityNote ?? ""}
            onChange={(v) => update(i, { securityNote: v })}
            rows={2}
          />
        </div>
      ))}
    </section>
  );
}

function LinksEditor({ items, onChange }: { items: ContentLink[]; onChange: (v: ContentLink[]) => void }) {
  const { t } = useI18n();
  return (
    <section className="space-y-2 rounded-xl border border-border/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold text-foreground">{t("admin.f.links")}</h3>
        <AddButton label={t("admin.add")} onClick={() => onChange([...items, { label: "", url: "" }])} />
      </div>
      {items.map((l, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
            <PlainField
              label={t("admin.f.linkLabel")}
              value={l.label}
              onChange={(v) => onChange(items.map((x, j) => (j === i ? { ...x, label: v } : x)))}
            />
            <PlainField
              label={t("admin.f.linkUrl")}
              value={l.url}
              onChange={(v) => onChange(items.map((x, j) => (j === i ? { ...x, url: v } : x)))}
            />
          </div>
          <RowActions
            onUp={() => onChange(move(items, i, i - 1))}
            onDown={() => onChange(move(items, i, i + 1))}
            onRemove={() => onChange(items.filter((_, j) => j !== i))}
          />
        </div>
      ))}
    </section>
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
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mod && !mod.lessons.some((l) => l.id === lessonId)) setLessonId(mod.lessons[0]?.id ?? "");
  }, [mod, lessonId]);

  // Recarrega o formulário quando muda idioma, módulo, aula ou aba.
  useEffect(() => {
    if (!mod) return;
    const next: Draft = { texts: {}, lists: {}, quiz: [], glossary: [], code: [], links: [] };
    if (tab === "module") {
      const id = mod.id;
      next.texts = {
        title: contentText(editLang, id, "title", mod.title),
        tagline: contentText(editLang, id, "tagline", mod.tagline),
        overview: contentText(editLang, id, "overview", mod.overview),
        delivery: contentText(editLang, id, "delivery", mod.delivery),
        troubleshooting: contentText(editLang, id, "troubleshooting", mod.troubleshooting),
        capstone: contentText(editLang, id, "capstone", mod.printQuest),
      };
      next.lists = {
        objectives: contentList(editLang, id, "objectives", mod.objectives),
        prerequisites: contentList(editLang, id, "prerequisites", mod.prerequisites),
        topics: contentList(editLang, id, "topics", mod.topics),
        checklist: contentList(editLang, id, "checklist", mod.checklist),
        interviewQuestions: contentList(editLang, id, "interviewQuestions", mod.interviewQuestions),
      };
      next.links = contentLinks(editLang, id);
    } else if (tab === "lesson" && lesson) {
      const id = lesson.id;
      next.texts = {
        title: contentText(editLang, id, "title", lesson.title),
        whyItMatters: contentText(editLang, id, "whyItMatters", lesson.whyItMatters),
        commonMistake: contentText(editLang, id, "commonMistake", lesson.commonMistake),
        productionTip: contentText(editLang, id, "productionTip", lesson.productionTip),
        securityAlert: contentText(editLang, id, "securityAlert", lesson.securityAlert ?? ""),
        interviewQuestion: contentText(editLang, id, "interviewQuestion", lesson.interviewQuestion),
        capstone: contentText(editLang, id, "capstone", lesson.printQuestLink),
      };
      next.lists = {
        objectives: contentList(editLang, id, "objectives", lesson.objectives),
        body: contentList(editLang, id, "body", lesson.body),
      };
      next.quiz = contentObjects<QuizDraft>(editLang, id, "quizJson", lesson.quiz).map((q) => ({
        ...q,
        question: contentText(editLang, id, `q${lesson.quiz.indexOf(q as QuizQuestion)}`, q.question),
      }));
      next.glossary = contentObjects(editLang, id, "glossaryJson", lesson.glossary).map((g) => ({ ...g }));
      next.code = contentObjects<CodeBlock>(editLang, id, "codeJson", lesson.code).map((c) => ({ ...c }));
      next.links = contentLinks(editLang, id);
    } else if (tab === "exam" && exam) {
      const id = `exam.${exam.moduleId}`;
      const base = contentObjects<ExamQuestion>(editLang, id, "questionsJson", exam.questions);
      next.quiz = base.map((q, i) => ({
        ...q,
        question: contentText(editLang, id, `q${i}`, q.question),
        options: contentList(editLang, id, `q${i}opts`, q.options),
        explanation: contentText(editLang, id, `q${i}exp`, q.explanation),
      }));
    }
    setDraft(next);
  }, [tab, editLang, mod, lesson, exam, version]);

  const entity = useMemo(() => {
    if (tab === "module") return { kind: "module" as const, id: mod?.id ?? "" };
    if (tab === "lesson") return { kind: "lesson" as const, id: lesson?.id ?? "" };
    return { kind: "exam" as const, id: exam ? `exam.${exam.moduleId}` : "" };
  }, [tab, mod, lesson, exam]);

  const setText = (key: string) => (value: string) =>
    setDraft((prev) => ({ ...prev, texts: { ...prev.texts, [key]: value } }));
  const setList = (key: string) => (value: string[]) =>
    setDraft((prev) => ({ ...prev, lists: { ...prev.lists, [key]: value } }));

  async function handleSave() {
    if (!entity.id) return;
    setSaving(true);
    try {
      const data: OverrideData = {};
      for (const [key, value] of Object.entries(draft.texts)) {
        const trimmed = value.trim();
        if (trimmed) data[key] = trimmed;
      }
      for (const [key, list] of Object.entries(draft.lists)) {
        const clean = list.map((s) => s.trim()).filter(Boolean);
        if (clean.length > 0) data[key] = clean;
      }
      if (draft.links.length > 0) {
        data["linksJson"] = draft.links
          .filter((l) => l.url.trim())
          .map((l) => ({ label: l.label.trim() || l.url.trim(), url: l.url.trim() }));
      }
      if (tab === "lesson") {
        if (draft.quiz.length > 0) {
          data["quizJson"] = draft.quiz
            .filter((q) => q.question.trim())
            .map((q) => ({
              question: q.question.trim(),
              options: q.options.map((o) => o.trim()).filter(Boolean),
              answerIndex: q.answerIndex,
              explanation: q.explanation.trim(),
            }));
        }
        if (draft.glossary.length > 0) {
          data["glossaryJson"] = draft.glossary
            .filter((g) => g.term.trim())
            .map((g) => ({ term: g.term.trim(), definition: g.definition.trim() }));
        }
        if (draft.code.length > 0) {
          data["codeJson"] = draft.code
            .filter((c) => c.code.trim())
            .map((c) => ({
              label: c.label.trim(),
              language: c.language.trim() || "bash",
              code: c.code,
              ...(c.securityNote?.trim() ? { securityNote: c.securityNote.trim() } : {}),
            }));
        }
      }
      if (tab === "exam" && draft.quiz.length > 0) {
        data["questionsJson"] = draft.quiz
          .filter((q) => q.question.trim())
          .map((q) => ({
            question: q.question.trim(),
            options: q.options.map((o) => o.trim()).filter(Boolean),
            answerIndex: q.answerIndex,
            explanation: q.explanation.trim(),
            level: q.level ?? "facil",
          }));
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
          <Label>{t("admin.lang")}</Label>
          <select value={editLang} onChange={(e) => setEditLang(e.target.value as Lang)} className={inputClass}>
            <option value="pt">Português (BR)</option>
            <option value="es">Español (ES)</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className="block">
          <Label>{t("admin.module")}</Label>
          <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} className={inputClass}>
            {MODULES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.index}. {m.title}
              </option>
            ))}
          </select>
        </label>
        {tab === "lesson" && (
          <label className="block">
            <Label>{t("admin.lesson")}</Label>
            <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className={inputClass}>
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
          title={t(
            tab === "module" ? "admin.tabModule" : tab === "lesson" ? "admin.tabLesson" : "admin.tabExam",
          )}
        />
        <p className="text-xs text-muted-foreground">{t("admin.richHint")}</p>

        {tab === "module" && (
          <div className="space-y-4">
            <PlainField label={t("admin.f.title")} value={draft.texts["title"] ?? ""} onChange={setText("title")} />
            <PlainField
              label={t("admin.f.tagline")}
              value={draft.texts["tagline"] ?? ""}
              onChange={setText("tagline")}
              rows={2}
            />
            <RichField
              label={t("admin.f.overview")}
              value={draft.texts["overview"] ?? ""}
              onChange={setText("overview")}
            />
            <ListEditor
              label={t("admin.f.objectives")}
              items={draft.lists["objectives"] ?? []}
              onChange={setList("objectives")}
            />
            <ListEditor
              label={t("admin.f.prerequisites")}
              items={draft.lists["prerequisites"] ?? []}
              onChange={setList("prerequisites")}
            />
            <ListEditor
              label={t("admin.f.topics")}
              items={draft.lists["topics"] ?? []}
              onChange={setList("topics")}
            />
            <RichField
              label={t("admin.f.delivery")}
              value={draft.texts["delivery"] ?? ""}
              onChange={setText("delivery")}
              rows={4}
            />
            <ListEditor
              label={t("admin.f.checklist")}
              items={draft.lists["checklist"] ?? []}
              onChange={setList("checklist")}
            />
            <RichField
              label={t("admin.f.troubleshooting")}
              value={draft.texts["troubleshooting"] ?? ""}
              onChange={setText("troubleshooting")}
              rows={4}
            />
            <RichField
              label={t("admin.f.capstone")}
              value={draft.texts["capstone"] ?? ""}
              onChange={setText("capstone")}
              rows={4}
            />
            <ListEditor
              label={t("admin.f.interviewQuestions")}
              items={draft.lists["interviewQuestions"] ?? []}
              onChange={setList("interviewQuestions")}
            />
            <LinksEditor
              items={draft.links}
              onChange={(links) => setDraft((prev) => ({ ...prev, links }))}
            />
          </div>
        )}

        {tab === "lesson" && lesson && (
          <div className="space-y-4">
            <PlainField label={t("admin.f.title")} value={draft.texts["title"] ?? ""} onChange={setText("title")} />
            <ListEditor
              label={t("admin.f.objectives")}
              items={draft.lists["objectives"] ?? []}
              onChange={setList("objectives")}
            />
            <ListEditor
              label={t("admin.blocks")}
              items={draft.lists["body"] ?? []}
              onChange={setList("body")}
              rich
            />
            <CodeEditor items={draft.code} onChange={(code) => setDraft((prev) => ({ ...prev, code }))} />
            <RichField
              label={t("admin.f.why")}
              value={draft.texts["whyItMatters"] ?? ""}
              onChange={setText("whyItMatters")}
              rows={3}
            />
            <RichField
              label={t("admin.f.mistake")}
              value={draft.texts["commonMistake"] ?? ""}
              onChange={setText("commonMistake")}
              rows={3}
            />
            <RichField
              label={t("admin.f.tip")}
              value={draft.texts["productionTip"] ?? ""}
              onChange={setText("productionTip")}
              rows={3}
            />
            <RichField
              label={t("admin.f.security")}
              value={draft.texts["securityAlert"] ?? ""}
              onChange={setText("securityAlert")}
              rows={3}
            />
            <RichField
              label={t("admin.f.interview")}
              value={draft.texts["interviewQuestion"] ?? ""}
              onChange={setText("interviewQuestion")}
              rows={3}
            />
            <RichField
              label={t("admin.f.capstone")}
              value={draft.texts["capstone"] ?? ""}
              onChange={setText("capstone")}
              rows={3}
            />
            <GlossaryEditor
              items={draft.glossary}
              onChange={(glossary) => setDraft((prev) => ({ ...prev, glossary }))}
            />
            <QuizEditor
              label={t("admin.f.quiz")}
              items={draft.quiz}
              onChange={(quiz) => setDraft((prev) => ({ ...prev, quiz }))}
              withLevel={false}
            />
            <LinksEditor items={draft.links} onChange={(links) => setDraft((prev) => ({ ...prev, links }))} />
            <div>
              <Label>{t("admin.preview")}</Label>
              <div className="mt-1 space-y-2 rounded-xl border border-border/70 p-3">
                {(draft.lists["body"] ?? []).map((block, i) => (
                  <RichText key={i} value={block} />
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "exam" && exam && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">{t("admin.examHint")}</p>
            <QuizEditor
              label={t("admin.tabExam")}
              items={draft.quiz}
              onChange={(quiz) => setDraft((prev) => ({ ...prev, quiz }))}
              withLevel
            />
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
