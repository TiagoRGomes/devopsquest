import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarRange, CheckCircle2, Circle, FlaskConical, Lock, PlayCircle, ScrollText } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { useI18n } from "@/lib/i18n";
import { contentText } from "@/lib/content-i18n";
import { STUDY_PLAN, type PlanItem } from "@/lib/study-plan";
import { ALL_LESSONS, getModuleById } from "@/data/curriculum";
import { LABS } from "@/data/labs";
import { Chip, Panel, SectionTitle, XpBar } from "@/components/ui-bits";

export const Route = createFileRoute("/minha-trilha")({
  head: () => ({
    meta: [
      { title: "Minha Trilha — plano semanal | Jornada DevOps" },
      {
        name: "description",
        content:
          "Plano de estudo semana a semana da Jornada DevOps: aulas, laboratórios e exames de cada módulo, atualizados conforme seu progresso.",
      },
      { property: "og:title", content: "Minha Trilha — Jornada DevOps" },
      {
        property: "og:description",
        content: "Seu plano semanal de aulas, laboratórios e exames de DevOps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MinhaTrilhaPage,
});

function MinhaTrilhaPage() {
  const { t, lang } = useI18n();
  const { progress, isModuleUnlocked, examResult } = useProgress();

  const done = useMemo(() => {
    const lessons = new Set(progress.completedLessons);
    const labs = new Set(progress.completedLabs);
    return (item: PlanItem) => {
      if (item.kind === "lesson") return lessons.has(item.id);
      if (item.kind === "lab") return labs.has(item.id);
      return Boolean(examResult(item.id).passedAt);
    };
  }, [progress.completedLessons, progress.completedLabs, examResult]);

  const weeks = useMemo(
    () =>
      STUDY_PLAN.map((w) => {
        const total = w.items.length;
        const completed = w.items.filter(done).length;
        return { ...w, total, completed, complete: total > 0 && completed === total };
      }),
    [done],
  );

  const totalItems = weeks.reduce((a, w) => a + w.total, 0);
  const doneItems = weeks.reduce((a, w) => a + w.completed, 0);
  const percent = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;
  const currentWeek = weeks.find((w) => !w.complete) ?? weeks[weeks.length - 1];
  const nextItem = currentWeek?.items.find((i) => !done(i));

  function itemLabel(item: PlanItem) {
    if (item.kind === "lesson") {
      const lesson = ALL_LESSONS.find((l) => l.id === item.id);
      return contentText(lang, item.id, "title", lesson?.title ?? item.id);
    }
    if (item.kind === "lab") {
      const lab = LABS.find((l) => l.id === item.id);
      return contentText(lang, item.id, "title", lab?.title ?? item.id);
    }
    return t("path.exam");
  }

  function ItemLink({ item }: { item: PlanItem }) {
    const complete = done(item);
    const Icon = item.kind === "lab" ? FlaskConical : item.kind === "exam" ? ScrollText : PlayCircle;
    const content = (
      <>
        {complete ? (
          <CheckCircle2 className="size-4 shrink-0 text-success" />
        ) : (
          <Circle className="size-4 shrink-0 text-muted-foreground" />
        )}
        <Icon className="size-3.5 shrink-0 text-accent" />
        <span className={`min-w-0 flex-1 truncate ${complete ? "text-muted-foreground line-through" : "text-foreground"}`}>
          {itemLabel(item)}
        </span>
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{item.minutes}m</span>
      </>
    );
    const cls =
      "flex items-center gap-2 rounded-lg border border-border/70 bg-surface-2 px-3 py-2 text-sm hover:border-primary/50";

    if (item.kind === "lesson") {
      return (
        <Link to="/aulas/$lessonId" params={{ lessonId: item.id }} className={cls}>
          {content}
        </Link>
      );
    }
    if (item.kind === "exam") {
      const mod = getModuleById(item.id);
      return mod ? (
        <Link to="/exame/$slug" params={{ slug: mod.slug }} className={cls}>
          {content}
        </Link>
      ) : (
        <div className={cls}>{content}</div>
      );
    }
    return (
      <Link to="/laboratorios" className={cls}>
        {content}
      </Link>
    );
  }

  return (
    <div className="space-y-6">
      <Panel className="bg-hero">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          <CalendarRange className="mr-1 inline size-3.5" /> {t("path.eyebrow")}
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {t("path.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t("path.lead")}</p>
        <p className="mt-4 text-sm text-foreground">
          {t("path.overall", { current: currentWeek?.index ?? 1, total: weeks.length, percent })}
        </p>
        <XpBar percent={percent} className="mt-2" />
        {nextItem && (
          <p className="mt-3 text-sm text-muted-foreground">
            {t("path.next")}: <span className="text-foreground">{itemLabel(nextItem)}</span>
          </p>
        )}
        {progress.currentLessonId && (
          <Link
            to="/aulas/$lessonId"
            params={{ lessonId: progress.currentLessonId }}
            className="mt-4 inline-flex rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {t("path.continue")}
          </Link>
        )}
      </Panel>

      <SectionTitle eyebrow={`${weeks.length}`} title={t("path.title")} />

      <ul className="grid gap-4 lg:grid-cols-2">
        {weeks.map((w) => {
          const mod = getModuleById(w.moduleId);
          const unlocked = isModuleUnlocked(w.moduleId);
          const isCurrent = currentWeek?.index === w.index;
          return (
            <Panel
              as="li"
              key={w.index}
              className={isCurrent ? "border-primary/50 shadow-[0_0_0_1px_var(--primary)]" : ""}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-level font-mono text-xs font-semibold text-primary-foreground">
                  {w.index}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-semibold text-foreground">
                    {t("path.week", { n: w.index })}
                  </h3>
                  <p className="truncate text-xs text-accent">
                    {contentText(lang, w.moduleId, "title", mod?.title ?? w.moduleId)}
                  </p>
                </div>
                <span className="ml-auto flex items-center gap-1.5">
                  {!unlocked && (
                    <Chip tone="warning">
                      <Lock className="mr-1 inline size-3" />
                      {t("path.locked")}
                    </Chip>
                  )}
                  {w.complete ? (
                    <Chip tone="success">{t("path.doneWeek")}</Chip>
                  ) : isCurrent ? (
                    <Chip tone="primary">{t("path.current")}</Chip>
                  ) : null}
                </span>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                {t("path.progress", { done: w.completed, total: w.total })} ·{" "}
                {t("path.time", { minutes: w.minutes })}
              </p>
              <XpBar percent={w.total ? Math.round((w.completed / w.total) * 100) : 0} className="mt-2 h-1.5" />

              <div className="mt-3 space-y-1.5">
                {w.items.length === 0 && <p className="text-sm text-muted-foreground">{t("path.empty")}</p>}
                {w.items.map((item) => (
                  <ItemLink key={`${item.kind}-${item.id}`} item={item} />
                ))}
              </div>

              {!unlocked && <p className="mt-3 text-xs text-muted-foreground">{t("path.lockedText")}</p>}
            </Panel>
          );
        })}
      </ul>
    </div>
  );
}
