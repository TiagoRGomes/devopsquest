import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Award, CheckCircle2, Lock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useProgress } from "@/lib/progress";
import { useI18n } from "@/lib/i18n";
import { getModule } from "@/data/curriculum";
import { DAILY_ATTEMPTS, PASS_SCORE, getExam } from "@/data/exams";
import { Chip, EmptyState, Panel, XpBar } from "@/components/ui-bits";
import type { ExamLevel } from "@/lib/types";
import { tExam, tModule } from "@/lib/content-translate";

export const Route = createFileRoute("/exame/$slug")({
  loader: ({ params }) => {
    const mod = getModule(params.slug);
    if (!mod) throw notFound();
    return { title: mod.title };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Exame não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `Exame — ${loaderData.title} — Jornada DevOps` },
        {
          name: "description",
          content: `Exame final do módulo ${loaderData.title}: 8 perguntas do fácil ao difícil, 70% para aprovação e certificado.`,
        },
        { property: "og:title", content: `Exame — ${loaderData.title} — Jornada DevOps` },
        { property: "og:description", content: "Exame de módulo com aprovação mínima de 70%." },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => <NotFoundExam />,
  component: ExamePage,
});

const LEVEL_TONE: Record<ExamLevel, "success" | "warning" | "danger"> = {
  facil: "success",
  medio: "warning",
  dificil: "danger",
};

function NotFoundExam() {
  const { t } = useI18n();
  return <EmptyState title={t("certx.notFound")} description={t("certx.notFoundDesc")} />;
}

function ExamePage() {
  const { slug } = Route.useParams();
  const { t, lang } = useI18n();
  const rawMod = getModule(slug);
  const mod = rawMod ? tModule(lang, rawMod) : undefined;
  const { examResult, attemptsLeftToday, submitExam, isModuleUnlocked } = useProgress();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  const rawExam = mod ? getExam(mod.id) : undefined;
  const exam = rawExam ? tExam(lang, rawExam) : undefined;
  const questions = useMemo(() => exam?.questions ?? [], [exam]);

  if (!mod || !exam) {
    return <NotFoundExam />;
  }

  const unlocked = isModuleUnlocked(mod.id);
  const best = examResult(mod.id);
  const left = attemptsLeftToday(mod.id);
  const answered = Object.keys(answers).length;

  if (!unlocked) {
    return (
      <Panel className="mx-auto max-w-2xl text-center">
        <Lock className="mx-auto size-8 text-warning" />
        <h1 className="mt-3 font-display text-xl font-semibold text-foreground">{t("exam.locked")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("exam.lockedText")}</p>
        <Link
          to="/modulos"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          {t("nav.modules")}
        </Link>
      </Panel>
    );
  }

  function handleSubmit() {
    if (answered < questions.length) {
      toast.error(t("exam.answerAll"));
      return;
    }
    if (left <= 0) {
      toast.error(t("exam.noAttempts", { max: DAILY_ATTEMPTS }));
      return;
    }
    const correct = questions.filter((q, i) => answers[i] === q.answerIndex).length;
    const score = Math.round((correct / questions.length) * 100);
    const outcome = submitExam(mod!.id, score);
    setResult({ score, passed: outcome.passed });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRetry() {
    setAnswers({});
    setResult(null);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link
          to="/modulos/$slug"
          params={{ slug: mod.slug }}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> {mod.title}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">{t("exam.title")}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("exam.subtitle", { pass: PASS_SCORE })}</p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Chip tone={left > 0 ? "primary" : "danger"}>
            {t("exam.attemptsLeft", { n: left, max: DAILY_ATTEMPTS })}
          </Chip>
          {best.best > 0 && <Chip tone="accent">{t("exam.best")}: {best.best}%</Chip>}
          {best.passedAt && <Chip tone="success">{t("exam.passed")}</Chip>}
        </div>
      </div>

      {result && (
        <Panel className={result.passed ? "border-success/50" : "border-destructive/50"}>
          <div className="flex items-start gap-3">
            {result.passed ? (
              <CheckCircle2 className="size-6 shrink-0 text-success" />
            ) : (
              <XCircle className="size-6 shrink-0 text-destructive" />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold text-foreground">
                {result.passed ? t("exam.passed") : t("exam.failed")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.passed ? t("exam.passedText") : t("exam.failedText", { pass: PASS_SCORE })}
              </p>
              <p className="mt-3 font-mono text-sm text-foreground">
                {t("exam.score")}: {result.score}%
              </p>
              <XpBar percent={result.score} className="mt-2" />
              <div className="mt-4 flex flex-wrap gap-2">
                {result.passed ? (
                  <Link
                    to="/certificados"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    <Award className="size-4" /> {t("exam.viewCertificate")}
                  </Link>
                ) : left > 0 ? (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    {t("exam.retry")}
                  </button>
                ) : (
                  <p className="text-sm text-warning">{t("exam.noAttempts", { max: DAILY_ATTEMPTS })}</p>
                )}
              </div>
            </div>
          </div>
        </Panel>
      )}

      <Panel>
        <p className="text-xs text-muted-foreground">
          {t("exam.answered", { n: answered, total: questions.length })}
        </p>
        <ol className="mt-4 space-y-6">
          {questions.map((q, qi) => {
            const chosen = answers[qi];
            return (
              <li key={qi}>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone={LEVEL_TONE[q.level]}>{t(`exam.level.${q.level}`)}</Chip>
                  <span className="font-mono text-xs text-muted-foreground">
                    {qi + 1}/{questions.length}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{q.question}</p>
                <div className="mt-2.5 space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = chosen === oi;
                    const state = result
                      ? oi === q.answerIndex
                        ? "border-success/60 bg-success/10"
                        : selected
                          ? "border-destructive/60 bg-destructive/10"
                          : "border-border"
                      : selected
                        ? "border-primary/60 bg-primary/10"
                        : "border-border";
                    return (
                      <label
                        key={oi}
                        className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 text-sm text-foreground/90 ${state}`}
                      >
                        <input
                          type="radio"
                          name={`exam-${mod.id}-${qi}`}
                          checked={selected}
                          disabled={Boolean(result)}
                          onChange={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                          className="mt-0.5"
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
                {result && <p className="mt-2 text-xs text-muted-foreground">{q.explanation}</p>}
              </li>
            );
          })}
        </ol>

        {!result && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={left <= 0}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
          >
            {t("exam.submit")}
          </button>
        )}
        {left <= 0 && !result && (
          <p className="mt-2 text-sm text-warning">{t("exam.noAttempts", { max: DAILY_ATTEMPTS })}</p>
        )}
      </Panel>
    </div>
  );
}
