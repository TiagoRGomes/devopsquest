import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { SKILLS, SKILL_TREES } from "@/data/world";
import { getLesson } from "@/data/curriculum";
import { Chip, Panel, SectionTitle, XpBar } from "@/components/ui-bits";
import { useI18n } from "@/lib/i18n";
import { contentText } from "@/lib/content-i18n";
import { tSkill } from "@/lib/content-translate";

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
  const { t, lang } = useI18n();
  const { progress } = useProgress();

  function skillState(skillId: string): { unlocked: boolean; mastered: boolean; percent: number } {
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
        title={t("skills.title")}
        description={t("skills.desc", { mastered, total: SKILLS.length })}
      />

      <div className="space-y-6">
        {SKILL_TREES.map((tree) => (
          <section key={tree}>
            <h3 className="mb-3 font-display text-lg font-semibold text-foreground">{tree}</h3>
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {SKILLS.filter((s) => s.tree === tree).map((rawSkill) => {
                const skill = tSkill(lang, rawSkill);
                const state = skillState(skill.id);
                return (
                  <Panel as="li" key={skill.id} className={state.unlocked ? "" : "opacity-70"}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-foreground">{skill.name}</p>
                      {state.mastered ? (
                        <Chip tone="success">
                          <Check className="size-3" /> {t("skills.mastered")}
                        </Chip>
                      ) : state.unlocked ? (
                        <Chip tone="primary">{t("skills.available")}</Chip>
                      ) : (
                        <Chip tone="muted">
                          <Lock className="size-3" /> {t("skills.locked")}
                        </Chip>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{skill.description}</p>
                    <XpBar percent={state.percent} className="mt-3 h-1.5" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t("skills.reward", { reward: skill.reward, xp: skill.xp })}
                    </p>
                    {skill.requires.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("skills.requires", { list: skill.requires.map((r) => SKILLS.find((s) => s.id === r)?.name ?? r).join(", ") })}
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
                            {contentText(lang, lesson.id, "title", lesson.title)}
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
