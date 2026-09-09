import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Award, BookOpen, Check, FlaskConical, GraduationCap, Lock, Skull } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { useI18n } from "@/lib/i18n";
import { contentText, contentList } from "@/lib/content-i18n";
import { PASS_SCORE, getExam } from "@/data/exams";
import { getModule } from "@/data/curriculum";
import { labsByModule } from "@/data/labs";
import { getBoss } from "@/data/challenges";
import { BADGES } from "@/data/world";
import { Chip, DifficultyChip, EmptyState, InsightBox, Panel, SectionTitle, XpBar } from "@/components/ui-bits";

export const Route = createFileRoute("/modulos/$slug")({
  loader: ({ params }) => {
    const mod = getModule(params.slug);
    if (!mod) throw notFound();
    return { title: mod.title, tagline: mod.tagline };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Módulo não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.title} — DevOps Quest RPG` },
        { name: "description", content: loaderData.tagline },
        { property: "og:title", content: `${loaderData.title} — DevOps Quest RPG` },
        { property: "og:description", content: loaderData.tagline },
      ],
    };
  },
  notFoundComponent: () => {
    const { t } = useI18n();
    return <EmptyState title={t("mod.notFoundTitle")} description={t("mod.notFoundDescList")} />;
  },
  component: ModuloDetail,
});

function ModuloDetail() {
  const { slug } = Route.useParams();
  const mod = getModule(slug);
  const { progress, moduleProgress, completeLab, isModuleUnlocked, examResult, attemptsLeftToday } = useProgress();
  const { t, lang } = useI18n();

  if (!mod) {
    return <EmptyState title={t("mod.notFoundTitle")} description={t("mod.notFoundDescPick")} />;
  }

  const labs = labsByModule(mod.id);
  const p = moduleProgress(mod.id);
  const boss = mod.bossId ? getBoss(mod.bossId) : undefined;
  const badge = BADGES.find((b) => b.id === mod.badge);
  const unlocked = isModuleUnlocked(mod.id);
  const exam = getExam(mod.id);
  const examStatus = examResult(mod.id);
  const attemptsLeft = attemptsLeftToday(mod.id);
  const modTitle = contentText(lang, mod.id, "title", mod.title);
  const modOverview = contentText(lang, mod.id, "overview", mod.overview);
  const modObjectives = contentList(lang, mod.id, "objectives", mod.objectives);
  const badgeName = badge ? contentText(lang, badge.id, "name", badge.name) : undefined;

  return (
    <div className="space-y-6">
      <Panel className="bg-hero">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{t("mod.moduleIndex", { index: mod.index })}</p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold text-foreground sm:text-3xl">{modTitle}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{modOverview}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Chip tone="primary">{t("mod.weeks", { n: mod.weeks })}</Chip>
          <Chip tone="accent">{mod.xp} XP</Chip>
          {badge && <Chip tone="legendary">{t("mod.badge", { name: badgeName ?? "" })}</Chip>}
        </div>
        <XpBar percent={p.percent} className="mt-5 max-w-lg" />
        <p className="mt-2 text-xs text-muted-foreground">
          {t("mod.itemsDone", { done: p.done, total: p.total })}
        </p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <h2 className="font-display font-semibold text-foreground">{t("mod.objectives")}</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {modObjectives.map((o) => (
              <li key={o} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                {o}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <h2 className="font-display font-semibold text-foreground">{t("mod.prerequisites")}</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {mod.prerequisites.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
          <h3 className="mt-4 font-medium text-foreground">{t("mod.topics")}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {mod.topics.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </Panel>
        <Panel>
          <h2 className="font-display font-semibold text-foreground">{t("mod.delivery")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{mod.delivery}</p>
          <h3 className="mt-4 font-medium text-foreground">{t("mod.checklist")}</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {mod.checklist.map((c) => (
              <li key={c}>☐ {c}</li>
            ))}
          </ul>
        </Panel>
      </div>

      {!unlocked && (
        <Panel className="border-warning/50">
          <p className="flex items-center gap-2 font-display font-semibold text-warning">
            <Lock className="size-4" /> {t("exam.locked")}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">{t("exam.lockedText")}</p>
        </Panel>
      )}

      {exam && unlocked && (
        <Panel className={examStatus.passedAt ? "border-success/50" : "border-primary/40"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-display font-semibold text-foreground">
                <GraduationCap className="size-4 text-primary" /> {t("exam.title")}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">{t("exam.subtitle", { pass: PASS_SCORE })}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Chip tone={attemptsLeft > 0 ? "primary" : "danger"}>
                  {t("exam.attemptsLeft", { n: attemptsLeft, max: 3 })}
                </Chip>
                {examStatus.best > 0 && <Chip tone="accent">{t("exam.best")}: {examStatus.best}%</Chip>}
                {examStatus.passedAt && <Chip tone="success">{t("exam.passed")}</Chip>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/exame/$slug"
                params={{ slug: mod.slug }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <GraduationCap className="size-4" /> {t("exam.openExam")}
              </Link>
              {examStatus.passedAt && (
                <Link
                  to="/certificados"
                  className="inline-flex items-center gap-2 rounded-lg border border-success/50 bg-success/10 px-3.5 py-2 text-sm text-success"
                >
                  <Award className="size-4" /> {t("exam.viewCertificate")}
                </Link>
              )}
            </div>
          </div>
        </Panel>
      )}

      <Panel>
        <SectionTitle eyebrow={t("mod.lessonsEyebrow")} title={t("mod.lessonsTitle", { n: mod.lessons.length })} />
        <ol className="mt-4 space-y-2.5">
          {mod.lessons.map((lesson, i) => {
            const done = progress.completedLessons.includes(lesson.id);
            return (
              <li key={lesson.id}>
                <Link
                  to="/aulas/$lessonId"
                  params={{ lessonId: lesson.id }}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 transition-colors hover:border-primary/50"
                >
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full font-mono text-xs ${
                      done ? "bg-success/20 text-success" : "bg-surface text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{contentText(lang, lesson.id, "title", lesson.title)}</span>
                    <span className="block text-xs text-muted-foreground">
                      {t("mod.lessonDurationTools", { duration: lesson.duration, tools: lesson.tools.join(", ") })}
                    </span>
                  </span>
                  <DifficultyChip level={lesson.difficulty} />
                  <Chip tone="primary">+{lesson.xp} XP</Chip>
                </Link>
              </li>
            );
          })}
        </ol>
      </Panel>

      <Panel>
        <SectionTitle eyebrow={t("mod.labsEyebrow")} title={t("mod.labsTitle")} />
        <ul className="mt-4 space-y-3">
          {labs.map((lab) => {
            const done = progress.completedLabs.includes(lab.id);
            return (
              <li key={lab.id} className="rounded-xl border border-border bg-surface-2 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FlaskConical className="size-4 text-accent" />
                    {lab.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <DifficultyChip level={lab.difficulty} />
                    <button
                      type="button"
                      onClick={() => completeLab(lab.id)}
                      disabled={done}
                      className="rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground transition-colors hover:border-success/60 disabled:opacity-50"
                    >
                      {done ? t("mod.labDone") : t("mod.labMark", { xp: lab.xp })}
                    </button>
                  </div>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{lab.goal}</p>
                <Link to="/laboratorios" className="mt-2 inline-block text-xs text-primary hover:underline">
                  {t("mod.viewSteps")}
                </Link>
              </li>
            );
          })}
        </ul>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-3">
          <h2 className="font-display font-semibold text-foreground">{t("mod.troubleshootingTitle")}</h2>
          <InsightBox label={t("mod.troubleWhenBreaks")} tone="mistake">
            {mod.troubleshooting}
          </InsightBox>
          <InsightBox label={t("mod.troublePrintQuest")} tone="tip">
            {mod.printQuest}
          </InsightBox>
        </Panel>
        <Panel>
          <h2 className="font-display font-semibold text-foreground">{t("mod.interviewTitle")}</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {mod.interviewQuestions.map((q) => (
              <li key={q} className="flex gap-2">
                <BookOpen className="mt-0.5 size-4 shrink-0 text-epic" />
                {q}
              </li>
            ))}
          </ul>
          {boss && (
            <Link
              to="/boss-battles"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/12 px-3.5 py-2 text-sm text-destructive"
            >
              <Skull className="size-4" /> {t("mod.bossOfModule", { name: boss.name })}
            </Link>
          )}
        </Panel>
      </div>
    </div>
  );
}
