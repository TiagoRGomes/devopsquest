import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Check, Target } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { CHALLENGES } from "@/data/challenges";
import { Chip, DifficultyChip, Panel, SectionTitle } from "@/components/ui-bits";
import { tChallenge } from "@/lib/content-translate";

export const Route = createFileRoute("/desafios")({
  head: () => ({
    meta: [
      { title: "Desafios — DevOpsQuest" },
      {
        name: "description",
        content: "12 desafios técnicos de DevOps com critérios de aceitação, do runbook Linux ao SLO com postmortem.",
      },
      { property: "og:title", content: "Desafios — DevOpsQuest" },
      { property: "og:description", content: "Entregas avaliadas por critérios objetivos, como no trabalho real." },
    ],
  }),
  component: DesafiosPage,
});

function DesafiosPage() {
  const { t, lang } = useI18n();
  const { progress, completeChallenge } = useProgress();
  const challenges = CHALLENGES.map((c) => tChallenge(lang, c));

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow={t("chal.eyebrow")}
        title={t("chal.title", { count: CHALLENGES.length })}
        description={t("chal.description")}
      />

      <ul className="grid gap-4 lg:grid-cols-2">
        {challenges.map((c) => {
          const done = progress.completedChallenges.includes(c.id);
          return (
            <Panel as="li" key={c.id}>
              <div className="flex flex-wrap items-center gap-2">
                <Target className="size-4 text-warning" />
                <h3 className="font-display font-semibold text-foreground">{c.title}</h3>
                <DifficultyChip level={c.level} />
                <Chip tone="primary">+{c.xp} XP</Chip>
                {done && (
                  <Chip tone="success">
                    <Check className="size-3" /> {t("chal.delivered")}
                  </Chip>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{c.brief}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.tools.map((t) => (
                  <Chip key={t} tone="accent">
                    {t}
                  </Chip>
                ))}
              </div>
              <h4 className="mt-4 text-sm font-medium text-foreground">{t("chal.acceptance")}</h4>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {c.acceptance.map((a) => (
                  <li key={a} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    {a}
                  </li>
                ))}
              </ul>
              {done && <p className="mt-3 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground/90">{c.feedback}</p>}
              <button
                type="button"
                onClick={() => completeChallenge(c.id)}
                disabled={done}
                className="mt-4 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {done ? t("chal.doneBtn") : t("chal.markDelivered", { xp: c.xp })}
              </button>
            </Panel>
          );
        })}
      </ul>
    </div>
  );
}
