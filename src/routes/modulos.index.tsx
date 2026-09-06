import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Lock } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { useI18n } from "@/lib/i18n";
import { MODULES, TOTAL_MODULE_XP, TOTAL_WEEKS } from "@/data/curriculum";
import { labsByModule } from "@/data/labs";
import { Chip, Panel, SectionTitle, XpBar } from "@/components/ui-bits";

export const Route = createFileRoute("/modulos/")({
  head: () => ({
    meta: [
      { title: "Módulos — DevOps Quest RPG" },
      {
        name: "description",
        content: "Os 12 módulos da trilha DevOps: Linux, redes, Git, Docker, CI/CD, AWS, Terraform, Kubernetes, GitOps, SRE e segurança.",
      },
      { property: "og:title", content: "Módulos — DevOps Quest RPG" },
      { property: "og:description", content: "Currículo completo de DevOps com aulas, labs e entregas por módulo." },
    ],
  }),
  component: ModulosPage,
});

function ModulosPage() {
  const { moduleProgress, isModuleUnlocked, examResult } = useProgress();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Currículo"
        title="Minha trilha completa"
        description={`${MODULES.length} módulos, ${TOTAL_WEEKS} semanas e ${TOTAL_MODULE_XP} XP em conteúdo. Cada módulo termina com uma entrega que você pode mostrar em entrevista.`}
      />

      <ul className="grid gap-4 lg:grid-cols-2">
        {MODULES.map((m) => {
          const p = moduleProgress(m.id);
          const labs = labsByModule(m.id);
          const unlocked = isModuleUnlocked(m.id);
          const exam = examResult(m.id);
          return (
            <Panel as="li" key={m.id}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-level font-mono text-xs font-semibold text-primary-foreground">
                  {m.index}
                </span>
                <h3 className="font-display text-lg font-semibold text-foreground">{m.title}</h3>
                {!unlocked && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-warning/50 bg-warning/10 px-2 py-1 text-xs text-warning">
                    <Lock className="size-3" /> {t("exam.locked")}
                  </span>
                )}
                {exam.passedAt && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-success/50 bg-success/10 px-2 py-1 text-xs text-success">
                    <Award className="size-3" /> {exam.best}%
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-accent">{m.tagline}</p>
              <p className="mt-2 text-sm text-muted-foreground">{m.overview}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {m.topics.slice(0, 6).map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
              <XpBar percent={p.percent} className="mt-4 h-1.5" />
              <p className="mt-2 text-xs text-muted-foreground">
                {m.lessons.length} aulas · {labs.length} labs · {m.weeks} semanas · {m.xp} XP · {p.percent}% concluído
              </p>
              <Link
                to="/modulos/$slug"
                params={{ slug: m.slug }}
                className="mt-4 inline-flex rounded-lg border border-primary/50 bg-primary/12 px-3.5 py-2 text-sm font-medium text-primary hover:bg-primary/20"
              >
                Abrir módulo
              </Link>
              {!unlocked && <p className="mt-2 text-xs text-muted-foreground">{t("exam.lockedText")}</p>}
            </Panel>
          );
        })}
      </ul>
    </div>
  );
}
