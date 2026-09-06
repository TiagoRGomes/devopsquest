import { createFileRoute } from "@tanstack/react-router";
import { Check, GitBranch } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { MATURITY_AXES, PROJECT, PROJECT_STEPS, maturityScore } from "@/data/project";
import { Chip, Panel, SectionTitle, XpBar } from "@/components/ui-bits";

export const Route = createFileRoute("/projeto")({
  head: () => ({
    meta: [
      { title: "Projeto PrintQuest — DevOps Quest RPG" },
      {
        name: "description",
        content: "Construa a PrintQuest Platform em 24 etapas: containers, CI/CD, AWS, Terraform, Kubernetes, GitOps e observabilidade.",
      },
      { property: "og:title", content: "Projeto PrintQuest — DevOps Quest RPG" },
      { property: "og:description", content: "O projeto de portfólio que prova sua competência em DevOps." },
    ],
  }),
  component: ProjetoPage,
});

function ProjetoPage() {
  const { progress, toggleProjectStep } = useProgress();
  const maturity = maturityScore(progress.completedProjectSteps);
  const phases = Array.from(new Set(PROJECT_STEPS.map((s) => s.phase)));

  return (
    <div className="space-y-6">
      <Panel className="bg-hero">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Projeto final</p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold text-foreground sm:text-3xl">{PROJECT.name}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{PROJECT.pitch}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {PROJECT.stack.map((s) => (
            <Chip key={s} tone="accent">
              {s}
            </Chip>
          ))}
        </div>
        <div className="mt-5 max-w-lg">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Maturidade da plataforma</span>
            <span className="font-mono text-accent">{maturity.overall}%</span>
          </div>
          <XpBar percent={maturity.overall} className="mt-2" />
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        {PROJECT.repos.map((r) => (
          <Panel key={r.name}>
            <p className="flex items-center gap-2 font-mono text-sm text-foreground">
              <GitBranch className="size-4 text-primary" /> {r.name}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{r.purpose}</p>
          </Panel>
        ))}
      </div>

      <Panel>
        <SectionTitle eyebrow="Avaliação" title="Eixos de maturidade" />
        <ul className="mt-4 space-y-3">
          {maturity.perAxis.map((a) => {
            const axis = MATURITY_AXES.find((m) => m.axis === a.axis);
            return (
              <li key={a.axis}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-foreground">{a.axis}</span>
                  <span className="font-mono text-xs text-accent">{a.percent}%</span>
                </div>
                <XpBar percent={a.percent} className="mt-1.5 h-1.5" />
                {axis && <p className="mt-1 text-xs text-muted-foreground">{axis.description}</p>}
              </li>
            );
          })}
        </ul>
      </Panel>

      {phases.map((phase) => (
        <Panel key={phase}>
          <h2 className="font-display text-lg font-semibold text-foreground">{phase}</h2>
          <ul className="mt-4 space-y-2.5">
            {PROJECT_STEPS.filter((s) => s.phase === phase).map((step) => {
              const done = progress.completedProjectSteps.includes(step.id);
              return (
                <li key={step.id} className="rounded-xl border border-border bg-surface-2 px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{step.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Entrega: {step.deliverable} · repo {step.repo}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {step.stack.map((t) => (
                          <Chip key={t}>{t}</Chip>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleProjectStep(step.id)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs ${
                        done
                          ? "border-success/50 bg-success/12 text-success"
                          : "border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      <Check className="size-3.5" /> {done ? "Concluída" : "Marcar etapa"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      ))}
    </div>
  );
}
