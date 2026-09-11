import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronDown } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { LABS } from "@/data/labs";
import { MODULES, getModuleById } from "@/data/curriculum";
import { Chip, DifficultyChip, Panel, SectionTitle } from "@/components/ui-bits";
import { CodeBlock } from "@/components/CodeBlock";
import { tLab } from "@/lib/content-translate";

export const Route = createFileRoute("/laboratorios")({
  head: () => ({
    meta: [
      { title: "Laboratórios — DevOps Quest RPG" },
      {
        name: "description",
        content: "30 laboratórios práticos de DevOps: Linux, Nginx, Docker, CI/CD, AWS, Terraform, Kubernetes, GitOps e observabilidade.",
      },
      { property: "og:title", content: "Laboratórios — DevOps Quest RPG" },
      { property: "og:description", content: "Pratique com passo a passo, comandos, validação e erros comuns." },
    ],
  }),
  component: LabsPage,
});

function LabsPage() {
  const { t, lang } = useI18n();
  const { progress, completeLab } = useProgress();
  const [filter, setFilter] = useState<string>("todos");
  const [openId, setOpenId] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState<string | null>(null);

  const labs = (filter === "todos" ? LABS : LABS.filter((l) => l.moduleId === filter)).map((l) =>
    tLab(lang, l),
  );

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow={t("labs.eyebrow")}
        title={t("labs.title", { count: LABS.length })}
        description={t("labs.description")}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("todos")}
          className={`rounded-full border px-3 py-1.5 text-xs ${
            filter === "todos" ? "border-primary/60 bg-primary/12 text-primary" : "border-border text-muted-foreground"
          }`}
        >
          {t("labs.filterAll", { count: LABS.length })}
        </button>
        {MODULES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setFilter(m.id)}
            className={`rounded-full border px-3 py-1.5 text-xs ${
              filter === m.id ? "border-primary/60 bg-primary/12 text-primary" : "border-border text-muted-foreground"
            }`}
          >
            M{m.index}
          </button>
        ))}
      </div>

      <ul className="space-y-4">
        {labs.map((lab) => {
          const done = progress.completedLabs.includes(lab.id);
          const open = openId === lab.id;
          const mod = getModuleById(lab.moduleId);
          return (
            <Panel as="li" key={lab.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-semibold text-foreground">{lab.title}</h3>
                    <DifficultyChip level={lab.difficulty} />
                    <Chip>{lab.minutes} min</Chip>
                    {mod && <Chip tone="accent">M{mod.index}</Chip>}
                    {done && (
                      <Chip tone="success">
                        <Check className="size-3" /> {t("labs.done")}
                      </Chip>
                    )}
                  </div>
                  <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{lab.goal}</p>
                  <p className="mt-1.5 max-w-3xl text-sm text-foreground/80">{lab.professionalContext}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : lab.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:border-primary/50"
                  >
                    {open ? t("labs.close") : t("labs.open")}
                    <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => completeLab(lab.id)}
                    disabled={done}
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
                  >
                    {done ? t("labs.doneBtn") : t("labs.completeBtn", { xp: lab.xp })}
                  </button>
                </div>
              </div>

              {open && (
                <div className="mt-5 space-y-4 border-t border-border pt-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{t("labs.environment")}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{lab.environment}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{t("labs.prerequisites")}</h4>
                      <ul className="mt-1 text-sm text-muted-foreground">
                        {lab.prerequisites.map((p) => (
                          <li key={p}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground">{t("labs.stepsTitle")}</h4>
                    <ol className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {lab.steps.map((s, i) => (
                        <li key={i}>
                          <span className="font-mono text-xs text-accent">{i + 1}.</span> {s}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <CodeBlock block={lab.commands} />

                  <div>
                    <h4 className="text-sm font-medium text-foreground">{t("labs.validate")}</h4>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {lab.validation.map((v) => (
                        <li key={v} className="flex gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-success" />
                          {v}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground">{t("labs.commonErrors")}</h4>
                    <ul className="mt-2 space-y-2 text-sm">
                      {lab.commonErrors.map((e) => (
                        <li key={e.error} className="rounded-lg border border-border bg-surface-2 px-3 py-2">
                          <p className="font-mono text-xs text-warning">{e.error}</p>
                          <p className="mt-1 text-muted-foreground">{e.fix}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setShowSolution(showSolution === lab.id ? null : lab.id)}
                      className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showSolution === lab.id ? t("labs.hideSolution") : t("labs.showSolution")}
                    </button>
                    {showSolution === lab.id && (
                      <p className="mt-2 text-sm text-foreground/90">{lab.solution}</p>
                    )}
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
