import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BookOpen, Clock, Flame, FlaskConical, Play, Skull, Target, Zap } from "lucide-react";
import { useProgress, nextLesson } from "@/lib/progress";
import { MODULES, ALL_LESSONS, TOTAL_WEEKS } from "@/data/curriculum";
import { LABS } from "@/data/labs";
import { BOSSES, CHALLENGES } from "@/data/challenges";
import { PROJECT_STEPS, maturityScore } from "@/data/project";
import { REGIONS, XP_RULES } from "@/data/world";
import { Chip, Panel, SectionTitle, StatTile, XpBar } from "@/components/ui-bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — DevOps Quest RPG" },
      {
        name: "description",
        content:
          "Seu painel de progresso na jornada DevOps: XP, nível, próxima aula, laboratórios e projeto PrintQuest.",
      },
      { property: "og:title", content: "Dashboard — DevOps Quest RPG" },
      { property: "og:description", content: "Acompanhe XP, nível, streak e a próxima etapa da sua trilha DevOps." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { progress, level, earnedBadges, moduleProgress } = useProgress();
  const upcoming = nextLesson(progress.completedLessons);
  const upcomingModule = MODULES.find((m) => m.id === upcoming?.moduleId);
  const maturity = maturityScore(progress.completedProjectSteps);
  const lessonsPercent = Math.round((progress.completedLessons.length / ALL_LESSONS.length) * 100);

  return (
    <div className="space-y-8">
      <section className="panel overflow-hidden bg-hero p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          Nível {level.level} · {level.className}
        </p>
        <h1 className="mt-2 max-w-3xl font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          Do primeiro comando no terminal até entregar em produção com confiança.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {MODULES.length} módulos, {ALL_LESSONS.length} aulas, {LABS.length} laboratórios, {CHALLENGES.length}{" "}
          desafios e {BOSSES.length} Boss Battles em {TOTAL_WEEKS} semanas de estudo guiado — com o projeto
          PrintQuest como portfólio.
        </p>
        <div className="mt-6 max-w-xl">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Progresso do nível</span>
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
              {progress.completedLessons.length ? "Continuar de onde parei" : "Começar a jornada"}
            </Link>
            <span className="text-sm text-muted-foreground">
              Próxima: <span className="text-foreground">{upcoming.title}</span>
              {upcomingModule && ` · Módulo ${upcomingModule.index}`}
            </span>
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="XP total" value={`${progress.xp}`} hint={`Nível ${level.level} de 50`} icon={<Zap className="size-4" />} />
        <StatTile label="Sequência" value={`${progress.streak} dias`} hint="Estude um pouco todo dia" icon={<Flame className="size-4" />} />
        <StatTile
          label="Aulas concluídas"
          value={`${progress.completedLessons.length}/${ALL_LESSONS.length}`}
          hint={`${lessonsPercent}% do currículo`}
          icon={<BookOpen className="size-4" />}
        />
        <StatTile
          label="Tempo estudado"
          value={`${Math.round(progress.minutesStudied / 60)}h`}
          hint={`${progress.minutesStudied} minutos registrados`}
          icon={<Clock className="size-4" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <SectionTitle
            eyebrow="Trilha"
            title="Seus módulos"
            description="Cada módulo mistura aulas, laboratórios e uma entrega verificável."
            action={
              <Link to="/modulos" className="text-sm text-primary hover:underline">
                Ver todos
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
                        <span className="font-mono text-xs text-muted-foreground">M{m.index}</span> {m.title}
                      </p>
                      <span className="font-mono text-xs text-accent">{p.percent}%</span>
                    </div>
                    <XpBar percent={p.percent} className="mt-2 h-1.5" />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {p.done}/{p.total} itens · {m.weeks} semanas · {m.xp} XP
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <SectionTitle eyebrow="Missões" title="Onde jogar agora" />
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/laboratorios" className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5 hover:border-primary/50">
                  <span className="flex items-center gap-2 text-foreground">
                    <FlaskConical className="size-4 text-accent" /> Laboratórios
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {progress.completedLabs.length}/{LABS.length}
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/desafios" className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5 hover:border-primary/50">
                  <span className="flex items-center gap-2 text-foreground">
                    <Target className="size-4 text-warning" /> Desafios
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {progress.completedChallenges.length}/{CHALLENGES.length}
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/boss-battles" className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5 hover:border-primary/50">
                  <span className="flex items-center gap-2 text-foreground">
                    <Skull className="size-4 text-destructive" /> Boss Battles
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {progress.defeatedBosses.length}/{BOSSES.length}
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/conquistas" className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5 hover:border-primary/50">
                  <span className="flex items-center gap-2 text-foreground">
                    <Award className="size-4 text-legendary" /> Conquistas
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{earnedBadges.length}</span>
                </Link>
              </li>
            </ul>
          </Panel>

          <Panel>
            <SectionTitle eyebrow="Portfólio" title="PrintQuest" />
            <p className="mt-3 text-sm text-muted-foreground">
              {progress.completedProjectSteps.length} de {PROJECT_STEPS.length} etapas entregues.
            </p>
            <XpBar percent={maturity.overall} className="mt-3" />
            <p className="mt-2 text-xs text-muted-foreground">Maturidade da plataforma: {maturity.overall}%</p>
            <Link to="/projeto" className="mt-4 inline-block text-sm text-primary hover:underline">
              Abrir o projeto
            </Link>
          </Panel>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <SectionTitle eyebrow="Mapa" title="Regiões da jornada" />
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {REGIONS.map((r) => (
              <li key={r.id} className="rounded-lg border border-border bg-surface-2 px-3 py-2.5">
                <p className="text-sm text-foreground">
                  <span className="font-mono text-xs text-muted-foreground">{r.order}.</span> {r.name}
                </p>
                <p className="text-xs text-muted-foreground">{r.theme}</p>
              </li>
            ))}
          </ul>
          <Link to="/mapa" className="mt-4 inline-block text-sm text-primary hover:underline">
            Ver o mapa completo
          </Link>
        </Panel>
        <Panel>
          <SectionTitle eyebrow="Regras" title="Como você ganha XP" />
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
