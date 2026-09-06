import { createFileRoute } from "@tanstack/react-router";
import { Award, Lock, ScrollText } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { BADGES, LEVEL_TIERS } from "@/data/world";
import { ALL_LESSONS, MODULES } from "@/data/curriculum";
import { LABS } from "@/data/labs";
import { BOSSES, CHALLENGES } from "@/data/challenges";
import { PROJECT_STEPS } from "@/data/project";
import { Panel, RarityChip, SectionTitle, XpBar } from "@/components/ui-bits";

export const Route = createFileRoute("/conquistas")({
  head: () => ({
    meta: [
      { title: "Conquistas e certificado — DevOps Quest RPG" },
      {
        name: "description",
        content: "Badges conquistadas, níveis e o certificado de conclusão da jornada DevOps Quest RPG.",
      },
      { property: "og:title", content: "Conquistas — DevOps Quest RPG" },
      { property: "og:description", content: "Acompanhe badges, classes de nível e requisitos do certificado." },
    ],
  }),
  component: ConquistasPage,
});

function ConquistasPage() {
  const { progress, level, earnedBadges } = useProgress();

  const requirements = [
    { label: "Aulas concluídas", done: progress.completedLessons.length, total: ALL_LESSONS.length },
    { label: "Laboratórios", done: progress.completedLabs.length, total: LABS.length },
    { label: "Desafios", done: progress.completedChallenges.length, total: CHALLENGES.length },
    { label: "Boss Battles", done: progress.defeatedBosses.length, total: BOSSES.length },
    { label: "Etapas do PrintQuest", done: progress.completedProjectSteps.length, total: PROJECT_STEPS.length },
  ];
  const completed = requirements.every((r) => r.done >= r.total);

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Conquistas"
        title={`${earnedBadges.length} de ${BADGES.length} badges`}
        description="Badges saem de entregas reais: módulo completo, boss derrotado, projeto avançado."
      />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {BADGES.map((badge) => {
          const earned = earnedBadges.includes(badge.id);
          return (
            <Panel as="li" key={badge.id} className={earned ? "" : "opacity-60"}>
              <div className="flex items-start justify-between gap-2">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  {earned ? (
                    <Award className="size-4 text-legendary" />
                  ) : (
                    <Lock className="size-4 text-muted-foreground" />
                  )}
                  {badge.name}
                </p>
                <RarityChip rarity={badge.rarity} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{badge.condition}</p>
              <p className="mt-1.5 font-mono text-xs text-accent">+{badge.xp} XP</p>
            </Panel>
          );
        })}
      </ul>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="font-display text-lg font-semibold text-foreground">Classes por nível</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {LEVEL_TIERS.map((t) => {
              const current = level.level >= t.from && level.level <= t.to;
              return (
                <li
                  key={t.className}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                    current ? "border-primary/50 bg-primary/12 text-foreground" : "border-border text-muted-foreground"
                  }`}
                >
                  <span>{t.className}</span>
                  <span className="font-mono text-xs">
                    Nv {t.from}–{t.to}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <ScrollText className="size-4 text-accent" /> Certificado de conclusão
          </h2>
          <ul className="mt-3 space-y-3">
            {requirements.map((r) => (
              <li key={r.label}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-mono text-xs text-accent">
                    {r.done}/{r.total}
                  </span>
                </div>
                <XpBar percent={Math.round((r.done / r.total) * 100)} className="mt-1.5 h-1.5" />
              </li>
            ))}
          </ul>
          {completed ? (
            <div className="mt-5 rounded-xl border border-legendary/40 bg-legendary/10 px-4 py-4 text-center">
              <p className="font-display text-lg font-semibold text-foreground">
                Jornada concluída — DevOps Professional
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {MODULES.length} módulos, {progress.xp} XP e a PrintQuest Platform no ar.
              </p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">
              Complete todos os requisitos para liberar o certificado final.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
