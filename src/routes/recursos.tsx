import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { RESOURCES, RESOURCE_CATEGORIES } from "@/data/resources";
import { Chip, Panel, SectionTitle } from "@/components/ui-bits";
import { useI18n } from "@/lib/i18n";
import { contentText } from "@/lib/content-i18n";

export const Route = createFileRoute("/recursos")({
  head: () => ({
    meta: [
      { title: "Recursos — DevOpsQuest" },
      {
        name: "description",
        content: "Documentações oficiais e ferramentas para estudar DevOps: Linux, Nginx, Docker, Terraform, Kubernetes, Prometheus e mais.",
      },
      { property: "og:title", content: "Recursos — DevOpsQuest" },
      { property: "og:description", content: "Fontes confiáveis para aprofundar cada tema da trilha." },
    ],
  }),
  component: RecursosPage,
});

function RecursosPage() {
  const { t, lang } = useI18n();
  const ALL = t("res.all");
  const [cat, setCat] = useState(ALL);
  const translated = RESOURCES.map((r, i) => ({
    ...r,
    title: contentText(lang, `res.${i}`, "title", r.title),
    description: contentText(lang, `res.${i}`, "description", r.description),
  }));
  const list = cat === ALL ? translated : translated.filter((r) => r.category === cat);

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow={t("res.eyebrow")}
        title={t("res.title")}
        description={t("res.description")}
      />

      <div className="flex flex-wrap gap-2">
        {[ALL, ...RESOURCE_CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1.5 text-xs ${
              cat === c ? "border-primary/60 bg-primary/12 text-primary" : "border-border text-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((r) => (
          <Panel as="li" key={r.url + r.title}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-foreground">{r.title}</p>
              <Chip tone="accent">{r.kind}</Chip>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              {t("res.open")} <ExternalLink className="size-3.5" />
            </a>
          </Panel>
        ))}
      </ul>
    </div>
  );
}
