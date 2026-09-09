import { createFileRoute } from "@tanstack/react-router";
import { Award, Lock, ScrollText } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { BADGES, LEVEL_TIERS } from "@/data/world";
import { ALL_LESSONS, MODULES } from "@/data/curriculum";
import { LABS } from "@/data/labs";
import { BOSSES, CHALLENGES } from "@/data/challenges";
import { PROJECT_STEPS } from "@/data/project";
import { Panel, RarityChip, SectionTitle, XpBar } from "@/components/ui-bits";
import { useI18n } from "@/lib/i18n";
import { contentText, slugifyClassName } from "@/lib/content-i18n";

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
  const { t, lang } = useI18n();

  const requirements = [
    { label: t("badge.req.lessons"), done: progress.completedLessons.length, total: ALL_LESSONS.length },
    { label: t("badge.req.labs"), done: progress.completedLabs.length, total: LABS.length },
    { label: t("badge.req.challenges"), done: progress.completedChallenges.length, total: CHALLENGES.length },
    { label: t("badge.req.bosses"), done: progress.defeatedBosses.length, total: BOSSES.length },
    { label: t("badge.req.project"), done: progress.completedProjectSteps.length, total: PROJECT_STEPS.length },
  ];
  const completed = requirements.every((r) => r.done >= r.total);

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow={t("badge.eyebrow")}
        title={t("badge.title", { earned: earnedBadges.length, total: BADGES.length })}
        description={t("badge.description")}
      />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {BADGES.map((badge) => {
          const earned = earnedBadges.includes(badge.id);
          const badgeName = contentText(lang, badge.id, "name", badge.name);
          const badgeDescription = contentText(lang, badge.id, "description", badge.condition);
          return (
            <Panel as="li" key={badge.id} className={earned ? "" : "opacity-60"}>
              <div className="flex items-start justify-between gap-2">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  {earned ? (
                    <Award className="size-4 text-legendary" />
                  ) : (
                    <Lock className="size-4 text-muted-foreground" />
                  )}
                  {badgeName}
                </p>
                <RarityChip rarity={badge.rarity} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{badgeDescription}</p>
              <p className="mt-1.5 font-mono text-xs text-accent">+{badge.xp} XP</p>
            </Panel>
          );
        })}
      </ul>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="font-display text-lg font-semibold text-foreground">{t("badge.tiersTitle")}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {LEVEL_TIERS.map((tier) => {
              const current = level.level >= tier.from && level.level <= tier.to;
              const className = contentText(lang, `class.${slugifyClassName(tier.className)}`, "title", tier.className);
              return (
                <li
                  key={tier.className}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                    current ? "border-primary/50 bg-primary/12 text-foreground" : "border-border text-muted-foreground"
                  }`}
                >
                  <span>{className}</span>
                  <span className="font-mono text-xs">{t("badge.levelAbbrev", { from: tier.from, to: tier.to })}</span>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <ScrollText className="size-4 text-accent" /> {t("badge.certTitle")}
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
              <p className="font-display text-lg font-semibold text-foreground">{t("badge.certDone")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("badge.certDoneText", { modules: MODULES.length, xp: progress.xp })}
              </p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">{t("badge.certLocked")}</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
