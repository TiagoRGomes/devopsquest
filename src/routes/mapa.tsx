import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, MapPin, Skull, Trophy } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { REGIONS } from "@/data/world";
import { getModuleById } from "@/data/curriculum";
import { getBoss } from "@/data/challenges";
import { Chip, Panel, SectionTitle, XpBar } from "@/components/ui-bits";
import { useI18n } from "@/lib/i18n";
import { contentText } from "@/lib/content-i18n";
import { RealmAtlas } from "@/components/RealmAtlas";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa da Jornada — DevOpsQuest" },
      {
        name: "description",
        content: "As 10 regiões da jornada DevOps, da Vila do Terminal à Torre da Confiabilidade, com quests e chefes.",
      },
      { property: "og:title", content: "Mapa da Jornada — DevOpsQuest" },
      { property: "og:description", content: "Explore as regiões, quests e Boss Battles da trilha DevOps." },
    ],
  }),
  component: MapaPage,
});

function MapaPage() {
  const { t, lang } = useI18n();
  const { level, regionProgress, progress } = useProgress();

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow={t("map.eyebrow")}
        title={t("map.title")}
        description={t("map.desc")}
      />

      <RealmAtlas />
      <ol className="grid gap-4 xl:grid-cols-2">
        {REGIONS.map((region) => {
          const unlocked = level.level >= region.requiredLevel;
          const percent = regionProgress(region.moduleIds);
          const boss = getBoss(region.bossId);
          const bossDone = progress.defeatedBosses.includes(region.bossId);
          const regionName = contentText(lang, region.id, "name", region.name);
          const regionTheme = contentText(lang, region.id, "theme", region.theme);

          return (
            <Panel as="li" key={region.id} className={unlocked ? "" : "opacity-70"}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-level font-mono text-xs font-semibold text-primary-foreground">
                      {region.order}
                    </span>
                    <h3 className="font-display text-lg font-semibold text-foreground">{regionName}</h3>
                    <Chip tone="accent">{regionTheme}</Chip>
                    {unlocked ? (
                      <Chip tone="success">{t("map.unlocked")}</Chip>
                    ) : (
                      <Chip tone="muted">
                        <Lock className="size-3" /> {t("map.level", { n: region.requiredLevel })}
                      </Chip>
                    )}
                  </div>
                  <p className="mt-2.5 max-w-3xl text-sm text-muted-foreground">{region.description}</p>
                  <p className="mt-2 flex items-start gap-2 text-sm text-foreground/90">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>
                      <strong className="font-medium">{t("map.questLabel")}</strong> {region.quest}
                    </span>
                  </p>
                  {boss && (
                    <p className="mt-1.5 flex items-start gap-2 text-sm text-foreground/90">
                      <Skull className={`mt-0.5 size-4 shrink-0 ${bossDone ? "text-success" : "text-destructive"}`} />
                      <span>
                        <strong className="font-medium">{t("map.bossLabel")}</strong> {boss.name}
                        {bossDone && t("map.defeated")}
                      </span>
                    </p>
                  )}
                  <p className="mt-1.5 flex items-start gap-2 text-sm text-foreground/90">
                    <Trophy className="mt-0.5 size-4 shrink-0 text-legendary" />
                    <span>
                      <strong className="font-medium">{t("map.rewardLabel")}</strong> {region.badge} · {region.xp} XP
                    </span>
                  </p>
                </div>

                <div className="w-full max-w-xs">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-muted-foreground">{t("map.progress")}</span>
                    <span className="font-mono text-accent">{percent}%</span>
                  </div>
                  <XpBar percent={percent} className="mt-1.5" />
                  <ul className="mt-3 space-y-1.5">
                    {region.moduleIds.map((id) => {
                      const mod = getModuleById(id);
                      if (!mod) return null;
                      return (
                        <li key={id}>
                          <Link
                            to="/modulos/$slug"
                            params={{ slug: mod.slug }}
                            className="block truncate rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-foreground hover:border-primary/50"
                          >
                            M{mod.index} · {contentText(lang, mod.id, "title", mod.title)}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </Panel>
          );
        })}
      </ol>
    </div>
  );
}
