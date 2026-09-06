import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Check, Lock, Skull } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { BOSSES } from "@/data/challenges";
import { Chip, Panel, SectionTitle } from "@/components/ui-bits";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/boss-battles")({
  head: () => ({
    meta: [
      { title: "Boss Battles — DevOps Quest RPG" },
      {
        name: "description",
        content: "Incidentes reais para investigar: 502, CrashLoopBackOff, drift de Terraform, pipeline quebrado e queda em produção.",
      },
      { property: "og:title", content: "Boss Battles — DevOps Quest RPG" },
      { property: "og:description", content: "Diagnostique sintomas, siga a investigação e resolva como um plantonista." },
    ],
  }),
  component: BossPage,
});

function BossPage() {
  const { progress, level, defeatBoss } = useProgress();
  const [revealed, setRevealed] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Boss Battles"
        title="Incidentes que você vai encontrar de verdade"
        description="Leia os sintomas, monte a hipótese e só depois abra a investigação. Isso treina exatamente o que uma entrevista técnica testa."
      />

      <ul className="space-y-4">
        {BOSSES.map((boss) => {
          const defeated = progress.defeatedBosses.includes(boss.id);
          const unlocked = level.level >= boss.requiredLevel;
          const open = revealed === boss.id;
          return (
            <Panel as="li" key={boss.id} className={unlocked ? "" : "opacity-70"}>
              <div className="flex flex-wrap items-center gap-2">
                <Skull className={`size-5 ${defeated ? "text-success" : "text-destructive"}`} />
                <h3 className="font-display text-lg font-semibold text-foreground">{boss.name}</h3>
                <Chip tone="danger">+{boss.xp} XP</Chip>
                {defeated ? (
                  <Chip tone="success">
                    <Check className="size-3" /> Derrotado
                  </Chip>
                ) : unlocked ? (
                  <Chip tone="warning">Disponível</Chip>
                ) : (
                  <Chip tone="muted">
                    <Lock className="size-3" /> Nível {boss.requiredLevel}
                  </Chip>
                )}
              </div>

              <p className="mt-3 text-sm text-foreground/90">{boss.scenario}</p>

              <h4 className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
                <AlertTriangle className="size-4 text-warning" /> Sintomas
              </h4>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {boss.symptoms.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setRevealed(open ? null : boss.id)}
                  className="rounded-lg border border-border px-3.5 py-2 text-xs text-foreground hover:border-primary/50"
                >
                  {open ? "Esconder investigação" : "Abrir investigação"}
                </button>
                <button
                  type="button"
                  onClick={() => defeatBoss(boss.id)}
                  disabled={defeated || !unlocked}
                  className="rounded-lg bg-destructive px-3.5 py-2 text-xs font-medium text-destructive-foreground disabled:opacity-50"
                >
                  {defeated ? "Boss derrotado" : `Derrotar (+${boss.xp} XP)`}
                </button>
              </div>

              {open && (
                <div className="mt-5 space-y-4 border-t border-border pt-5">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Investigação</h4>
                    <ol className="mt-2 space-y-2">
                      {boss.investigation.map((step, i) => (
                        <li key={i} className="rounded-lg border border-border bg-surface-2 px-3 py-2">
                          <p className="text-sm text-foreground/90">
                            <span className="font-mono text-xs text-accent">{i + 1}.</span> {step.step}
                          </p>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">{step.command}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <CodeBlock
                    block={{
                      label: "Causa raiz",
                      language: "texto",
                      code: boss.rootCause,
                    }}
                  />
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Resolução</h4>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {boss.resolution.map((r) => (
                        <li key={r} className="flex gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-success" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Panel>
          );
        })}
      </ul>
    </div>
  );
}
