import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { SKILLS, SKILL_TREES } from "@/data/world";
import { getLesson } from "@/data/curriculum";
import { Chip, Panel, SectionTitle, XpBar } from "@/components/ui-bits";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skill Tree — DevOps Quest RPG" },
      {
        name: "description",
        content: "Árvore de habilidades DevOps: Linux, redes, containers, cloud, IaC, Kubernetes, GitOps, SRE e segurança.",
      },
      { property: "og:title", content: "Skill Tree — DevOps Quest RPG" },
      { property: "og:description", content: "Desbloqueie habilidades concluindo as aulas ligadas a cada nó." },
    ],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  const { progress } = useProgress();

  function skillState(skillId: string) {
    const skill = SKILLS.find((s) => s.id === skillId);
    if (!skill) return { unlocked: false, mastered: false, percent: 0 };
    const done = skill.lessonIds.filter((id) => progress.completedLessons.includes(id)).length;
    const percent = skill.lessonIds.length ? Math.round((done / skill.lessonIds.length) * 100) : 0;
    const unlocked = skill.requires.every((r) => skillState(r).mastered);
    return { unlocked, mastered: percent === 100, percent };
  }

  const mastered = SKILLS.filter((s) => skillState(s.id).mastered).length;

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Skill Tree"
        title="Habilidades desbloqueadas pela prática"
        description={`Cada nó é liberado quando você conclui as aulas ligadas a ele. ${mastered} de ${SKILLS.length} habilidades dominadas.`}
      />

      <div className="space-y-6">
        {SKILL_TREES.map((tree) => (
          <section key={tree}>
            <h3 className="mb-3 font-display text-lg font-semibold text-foreground">{tree}</h3>
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {SKILLS.filter((s) => s.tree === tree).map((skill) => {
                const state = skillState(skill.id);
                return (
                  <Panel as="li" key={skill.id} className={state.unlocked ? "" : "opacity-70"}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-foreground">{skill.name}</p>
                      {state.mastered ? (
                        <Chip tone="success">
                          <Check className="size-3" /> Dominada
                        </Chip>
                      ) : state.unlocked ? (
                        <Chip tone="primary">Disponível</Chip>
                      ) : (
                        <Chip tone="muted">
                          <Lock className="size-3" /> Trancada
                        </Chip>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{skill.description}</p>
                    <XpBar percent={state.percent} className="mt-3 h-1.5" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Recompensa: {skill.reward} · {skill.xp} XP
                    </p>
                    {skill.requires.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Requer: {skill.requires.map((r) => SKILLS.find((s) => s.id === r)?.name ?? r).join(", ")}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {skill.lessonIds.map((id) => {
                        const lesson = getLesson(id);
                        if (!lesson) return null;
                        return (
                          <Link
                            key={id}
                            to="/aulas/$lessonId"
                            params={{ lessonId: id }}
                            className="rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] text-foreground hover:border-primary/50"
                          >
                            {lesson.title}
                          </Link>
                        );
                      })}
                    </div>
                  </Panel>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
