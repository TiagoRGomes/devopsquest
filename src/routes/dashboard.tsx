import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BookOpen, Clock, Flame, FlaskConical, Play, Skull, Target, Zap } from "lucide-react";
import { useProgress, nextLesson } from "@/lib/progress";
import { MODULES, ALL_LESSONS, TOTAL_WEEKS } from "@/data/curriculum";
import { LABS } from "@/data/labs";
import { BOSSES, CHALLENGES } from "@/data/challenges";
import { PROJECT_STEPS, maturityScore } from "@/data/project";
import { REGIONS, XP_RULES } from "@/data/world";
import { Chip, Panel, SectionTitle, StatTile, XpBar } from "@/components/ui-bits";
import { useI18n } from "@/lib/i18n";
import { contentText, slugifyClassName } from "@/lib/content-i18n";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel — Jornada DevOps" },
      {
        name: "description",
        content:
          "Seu painel de progresso na jornada DevOps: XP, nível, próxima aula, laboratórios e projeto CloudShop.",
      },
      { property: "og:title", content: "Painel — Jornada DevOps" },
      { property: "og:description", content: "Acompanhe XP, nível, streak e a próxima etapa da sua trilha DevOps." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t, lang } = useI18n();
  const { progress, level, earnedBadges, moduleProgress } = useProgress();
  const upcoming = nextLesson(progress.completedLessons);
  const upcomingModule = MODULES.find((m) => m.id === upcoming?.moduleId);
  const maturity = maturityScore(progress.completedProjectSteps);
  const lessonsPercent = Math.round((progress.completedLessons.length / ALL_LESSONS.length) * 100);

  return (
    <div className="space-y-8">
      <section className="panel overflow-hidden bg-hero p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          {t("dash.levelClass", { level: level.level, className: contentText(lang, `class.${slugifyClassName(level.className)}`, "title", level.className) })}
        </p>
        <h1 className="mt-2 max-w-3xl font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {t("dash.heroTitle")}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t("dash.heroSubtitle", {
            modules: MODULES.length,
            lessons: ALL_LESSONS.length,
            labs: LABS.length,
            challenges: CHALLENGES.length,
            bosses: BOSSES.length,
            weeks: TOTAL_WEEKS,
          })}
        </p>
        <div className="mt-6 max-w-xl">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">{t("dash.levelProgress")}</span>
            <span className="font-mono text-accent">
              {level.xpIntoLevel}/{level.xpForNext} XP
            </span>
          </div>
          <XpBar percent={level.progress} className="mt-2 h-2.5" />
        </div>
        {upcoming && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/aulas/$lessonId"
              params={{ lessonId: upcoming.id }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
            >
              <Play className="size-4" />
              {progress.completedLessons.length ? t("dash.continue") : t("dash.start")}
            </Link>
            <span className="text-sm text-muted-foreground">
              {t("dash.next")} <span className="text-foreground">{contentText(lang, upcoming.id, "title", upcoming.title)}</span>
              {upcomingModule && ` · ${t("dash.moduleShort", { index: upcomingModule.index })}`}
            </span>
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label={t("dash.statXp")} value={`${progress.xp}`} hint={t("dash.statXpHint", { level: level.level })} icon={<Zap className="size-4" />} />
        <StatTile label={t("dash.statStreak")} value={t("dash.statStreakValue", { days: progress.streak })} hint={t("dash.statStreakHint")} icon={<Flame className="size-4" />} />
        <StatTile
          label={t("dash.statLessons")}
          value={`${progress.completedLessons.length}/${ALL_LESSONS.length}`}
          hint={t("dash.statLessonsHint", { percent: lessonsPercent })}
          icon={<BookOpen className="size-4" />}
        />
        <StatTile
          label={t("dash.statTime")}
          value={`${Math.round(progress.minutesStudied / 60)}h`}
          hint={t("dash.statTimeHint", { minutes: progress.minutesStudied })}
          icon={<Clock className="size-4" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <SectionTitle
            eyebrow={t("dash.trailEyebrow")}
            title={t("dash.trailTitle")}
            description={t("dash.trailDesc")}
            action={
              <Link to="/modulos" className="text-sm text-primary hover:underline">
                {t("dash.viewAll")}
              </Link>
            }
          />
          <ul className="mt-5 space-y-3">
            {MODULES.map((m) => {
              const p = moduleProgress(m.id);
              return (
                <li key={m.id}>
                  <Link
                    to="/modulos/$slug"
                    params={{ slug: m.slug }}
                    className="block rounded-xl border border-border bg-surface-2 px-4 py-3 transition-colors hover:border-primary/50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        <span className="font-mono text-xs text-muted-foreground">M{m.index}</span> {contentText(lang, m.id, "title", m.title)}
                      </p>
                      <span className="font-mono text-xs text-accent">{p.percent}%</span>
                    </div>
                    <XpBar percent={p.percent} className="mt-2 h-1.5" />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {t("dash.itemsWeeksXp", { done: p.done, total: p.total, weeks: m.weeks, xp: m.xp })}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <SectionTitle eyebrow={t("dash.missionsEyebrow")} title={t("dash.missionsTitle")} />
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/laboratorios" className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5 hover:border-primary/50">
                  <span className="flex items-center gap-2 text-foreground">
                    <FlaskConical className="size-4 text-accent" /> {t("dash.labs")}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {progress.completedLabs.length}/{LABS.length}
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/desafios" className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5 hover:border-primary/50">
                  <span className="flex items-center gap-2 text-foreground">
                    <Target className="size-4 text-warning" /> {t("dash.challenges")}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {progress.completedChallenges.length}/{CHALLENGES.length}
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/boss-battles" className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5 hover:border-primary/50">
                  <span className="flex items-center gap-2 text-foreground">
                    <Skull className="size-4 text-destructive" /> {t("dash.bosses")}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {progress.defeatedBosses.length}/{BOSSES.length}
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/conquistas" className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5 hover:border-primary/50">
                  <span className="flex items-center gap-2 text-foreground">
                    <Award className="size-4 text-legendary" /> {t("dash.achievements")}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{earnedBadges.length}</span>
                </Link>
              </li>
            </ul>
          </Panel>

          <Panel>
            <SectionTitle eyebrow={t("dash.portfolioEyebrow")} title="CloudShop" />
            <p className="mt-3 text-sm text-muted-foreground">
              {t("dash.portfolioStepsDone", { done: progress.completedProjectSteps.length, total: PROJECT_STEPS.length })}
            </p>
            <XpBar percent={maturity.overall} className="mt-3" />
            <p className="mt-2 text-xs text-muted-foreground">{t("dash.maturity", { percent: maturity.overall })}</p>
            <Link to="/projeto" className="mt-4 inline-block text-sm text-primary hover:underline">
              {t("dash.openProject")}
            </Link>
          </Panel>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <SectionTitle eyebrow={t("dash.mapEyebrow")} title={t("dash.mapTitle")} />
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {REGIONS.map((r) => (
              <li key={r.id} className="rounded-lg border border-border bg-surface-2 px-3 py-2.5">
                <p className="text-sm text-foreground">
                  <span className="font-mono text-xs text-muted-foreground">{r.order}.</span> {contentText(lang, r.id, "name", r.name)}
                </p>
                <p className="text-xs text-muted-foreground">{r.theme}</p>
              </li>
            ))}
          </ul>
          <Link to="/mapa" className="mt-4 inline-block text-sm text-primary hover:underline">
            {t("dash.viewFullMap")}
          </Link>
        </Panel>
        <Panel>
          <SectionTitle eyebrow={t("dash.rulesEyebrow")} title={t("dash.rulesTitle")} />
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {XP_RULES.map((r) => (
              <li key={r.action} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm">
                <span className="text-muted-foreground">{r.action}</span>
                <Chip tone="primary">+{r.xp}</Chip>
              </li>
            ))}
          </ul>
        </Panel>
      </section>
    </div>
  );
}
