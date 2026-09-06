import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Lock, ScrollText } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { ALL_LESSONS, MODULES } from "@/data/curriculum";
import { LABS } from "@/data/labs";
import { Chip, EmptyState, Panel, SectionTitle } from "@/components/ui-bits";
import { Certificate, type CertificateData } from "@/components/Certificate";

export const Route = createFileRoute("/certificados")({
  head: () => ({
    meta: [
      { title: "Certificados — Jornada DevOps" },
      {
        name: "description",
        content:
          "Baixe o certificado de cada módulo aprovado e o certificado final do curso Jornada DevOps, com carga horária total.",
      },
      { property: "og:title", content: "Certificados — Jornada DevOps" },
      { property: "og:description", content: "Certificados por módulo e certificado final da Jornada DevOps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CertificadosPage,
});

function moduleHours(moduleId: string) {
  const mod = MODULES.find((m) => m.id === moduleId);
  const lessonMinutes = (mod?.lessons ?? []).reduce((a, l) => a + l.duration, 0);
  const labMinutes = LABS.filter((l) => l.moduleId === moduleId).reduce((a, l) => a + l.minutes, 0);
  return Math.max(1, Math.round((lessonMinutes + labMinutes) / 60));
}

export function totalCourseHours() {
  const lessonMinutes = ALL_LESSONS.reduce((a, l) => a + l.duration, 0);
  const labMinutes = LABS.reduce((a, l) => a + l.minutes, 0);
  return Math.round((lessonMinutes + labMinutes) / 60) + 40; // + projeto final e desafios
}

function code(prefix: string, seed: string) {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) % 1_679_616;
  return `${prefix}-${hash.toString(36).toUpperCase().padStart(4, "0")}`;
}

function CertificadosPage() {
  const { t } = useI18n();
  const { progress, moduleCertificates, courseComplete } = useProgress();
  const { profile, user } = useAuth();
  const [selected, setSelected] = useState<string>("final");

  const studentName = profile?.display_name?.trim() || user?.email || t("cert.namePlaceholder");

  const items = useMemo(
    () => MODULES.filter((m) => moduleCertificates.includes(m.id)),
    [moduleCertificates],
  );

  const activeModule = items.find((m) => m.id === selected);
  const data: CertificateData | null = activeModule
    ? {
        kind: "module",
        studentName,
        moduleTitle: activeModule.title,
        score: progress.moduleExams[activeModule.id]?.best ?? 0,
        hours: moduleHours(activeModule.id),
        issuedAt: progress.moduleExams[activeModule.id]?.passedAt ?? new Date().toISOString().slice(0, 10),
        code: code("MOD", `${studentName}${activeModule.id}`),
      }
    : courseComplete
      ? {
          kind: "final",
          studentName,
          hours: totalCourseHours(),
          issuedAt: new Date().toISOString().slice(0, 10),
          code: code("JDO", `${studentName}final`),
          lessons: ALL_LESSONS.length,
          labs: LABS.length,
        }
      : null;

  return (
    <div className="space-y-6">
      <Panel className="bg-hero no-print">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          <ScrollText className="mr-1 inline size-3.5" /> {t("exam.nav")}
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {t("cert.pageTitle")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t("cert.pageLead")}</p>
        {!profile?.display_name && (
          <p className="mt-3 text-xs text-warning">
            {t("cert.nameHint")}{" "}
            <Link to="/perfil" className="underline">
              {t("nav.profile")}
            </Link>
          </p>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Panel className="no-print h-fit">
          <SectionTitle eyebrow={`${moduleCertificates.length}/${MODULES.length}`} title={t("cert.pageTitle")} />
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => setSelected("final")}
              disabled={!courseComplete}
              className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm disabled:opacity-50 ${
                selected === "final" ? "border-legendary/60 bg-legendary/10 text-foreground" : "border-border text-muted-foreground"
              }`}
            >
              {courseComplete ? <Award className="size-4 text-legendary" /> : <Lock className="size-4" />}
              {t("cert.final")}
            </button>
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelected(m.id)}
                className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm ${
                  selected === m.id ? "border-primary/60 bg-primary/10 text-foreground" : "border-border text-muted-foreground"
                }`}
              >
                <Award className="size-4 text-success" />
                <span className="min-w-0 flex-1 truncate">{m.title}</span>
                <Chip tone="success">{progress.moduleExams[m.id]?.best ?? 0}%</Chip>
              </button>
            ))}
          </div>
          {!courseComplete && (
            <p className="mt-4 text-xs text-muted-foreground">
              {t("cert.finalLocked", { done: moduleCertificates.length, total: MODULES.length })}
            </p>
          )}
        </Panel>

        <div>
          {data ? (
            <Certificate data={data} />
          ) : (
            <div className="no-print">
              <EmptyState title={t("cert.pageTitle")} description={t("cert.empty")} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
