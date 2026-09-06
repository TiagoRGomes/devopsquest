import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookOpen, Check, FlaskConical, Skull } from "lucide-react";
import { useProgress } from "@/lib/progress";
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
  notFoundComponent: () => (
    <EmptyState title="Módulo não encontrado" description="Volte para a lista de módulos e escolha outro." />
  ),
  component: ModuloDetail,
});

function ModuloDetail() {
  const { slug } = Route.useParams();
  const mod = getModule(slug);
  const { progress, moduleProgress, completeLab } = useProgress();

  if (!mod) {
    return <EmptyState title="Módulo não encontrado" description="Escolha outro módulo na lista." />;
  }

  const labs = labsByModule(mod.id);
  const p = moduleProgress(mod.id);
  const boss = mod.bossId ? getBoss(mod.bossId) : undefined;
  const badge = BADGES.find((b) => b.id === mod.badge);

  return (
    <div className="space-y-6">
      <Panel className="bg-hero">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Módulo {mod.index}</p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold text-foreground sm:text-3xl">{mod.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{mod.overview}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Chip tone="primary">{mod.weeks} semanas</Chip>
          <Chip tone="accent">{mod.xp} XP</Chip>
          {badge && <Chip tone="legendary">Badge: {badge.name}</Chip>}
        </div>
        <XpBar percent={p.percent} className="mt-5 max-w-lg" />
        <p className="mt-2 text-xs text-muted-foreground">
          {p.done}/{p.total} itens concluídos
        </p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <h2 className="font-display font-semibold text-foreground">O que você vai saber fazer</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {mod.objectives.map((o) => (
              <li key={o} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                {o}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <h2 className="font-display font-semibold text-foreground">Pré-requisitos</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {mod.prerequisites.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
          <h3 className="mt-4 font-medium text-foreground">Tópicos</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {mod.topics.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </Panel>
        <Panel>
          <h2 className="font-display font-semibold text-foreground">Entrega do módulo</h2>
          <p className="mt-3 text-sm text-muted-foreground">{mod.delivery}</p>
          <h3 className="mt-4 font-medium text-foreground">Checklist</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {mod.checklist.map((c) => (
              <li key={c}>☐ {c}</li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel>
        <SectionTitle eyebrow="Aulas" title={`${mod.lessons.length} aulas neste módulo`} />
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
                    <span className="block text-sm font-medium text-foreground">{lesson.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {lesson.duration} min · {lesson.tools.join(", ")}
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
        <SectionTitle eyebrow="Prática" title="Laboratórios do módulo" />
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
                      {done ? "Concluído" : `Marcar (+${lab.xp} XP)`}
                    </button>
                  </div>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{lab.goal}</p>
                <Link to="/laboratorios" className="mt-2 inline-block text-xs text-primary hover:underline">
                  Ver passo a passo
                </Link>
              </li>
            );
          })}
        </ul>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-3">
          <h2 className="font-display font-semibold text-foreground">Troubleshooting típico</h2>
          <InsightBox label="Quando quebra" tone="mistake">
            {mod.troubleshooting}
          </InsightBox>
          <InsightBox label="No PrintQuest" tone="tip">
            {mod.printQuest}
          </InsightBox>
        </Panel>
        <Panel>
          <h2 className="font-display font-semibold text-foreground">Perguntas de entrevista</h2>
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
              <Skull className="size-4" /> Boss do módulo: {boss.name}
            </Link>
          )}
        </Panel>
      </div>
    </div>
  );
}
