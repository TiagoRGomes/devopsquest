import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Check, FileText, MessageSquare } from "lucide-react";
import { CAREER_TRACKS, FIRST_JOB_CHECKLIST, INTERVIEW_BANK, RESUME_LINES } from "@/data/career";
import { Chip, Panel, SectionTitle } from "@/components/ui-bits";

export const Route = createFileRoute("/carreira")({
  head: () => ({
    meta: [
      { title: "Carreira DevOps — DevOps Quest RPG" },
      {
        name: "description",
        content: "Trilhas de DevOps, Cloud, Platform, SRE e DevSecOps: o que as vagas pedem, checklist da primeira vaga e banco de entrevistas.",
      },
      { property: "og:title", content: "Carreira DevOps — DevOps Quest RPG" },
      { property: "og:description", content: "Prepare currículo, portfólio e entrevistas com base nas vagas atuais." },
    ],
  }),
  component: CarreiraPage,
});

function CarreiraPage() {
  const [openQ, setOpenQ] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Carreira"
        title="Para onde essa jornada leva"
        description="Cinco caminhos que compartilham a mesma base. Escolha depois de dominar Linux, Git, containers, uma nuvem e IaC."
      />

      <ul className="grid gap-4 lg:grid-cols-2">
        {CAREER_TRACKS.map((t) => (
          <Panel as="li" key={t.id}>
            <p className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Briefcase className="size-4 text-primary" /> {t.name}
            </p>
            <p className="mt-2 text-sm text-accent">{t.focus}</p>
            <h3 className="mt-4 text-sm font-medium text-foreground">Dia a dia</h3>
            <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
              {t.dayToDay.map((d) => (
                <li key={d}>• {d}</li>
              ))}
            </ul>
            <h3 className="mt-4 text-sm font-medium text-foreground">Obrigatório</h3>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {t.mustHave.map((s) => (
                <Chip key={s} tone="primary">
                  {s}
                </Chip>
              ))}
            </div>
            <h3 className="mt-3 text-sm font-medium text-foreground">Diferenciais</h3>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {t.niceToHave.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{t.salaryNote}</p>
            <p className="mt-2 text-sm text-foreground/80">Indicado para: {t.fitFor}</p>
          </Panel>
        ))}
      </ul>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <Check className="size-4 text-success" /> Checklist da primeira vaga
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {FIRST_JOB_CHECKLIST.map((c) => (
              <li key={c}>☐ {c}</li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <FileText className="size-4 text-accent" /> Linhas de currículo com resultado
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {RESUME_LINES.map((r) => (
              <li key={r} className="rounded-lg border border-border bg-surface-2 px-3 py-2">
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Troque os números pelos seus, medidos no PrintQuest. Nunca invente métrica.
          </p>
        </Panel>
      </div>

      <Panel>
        <SectionTitle
          eyebrow="Entrevistas"
          title={`${INTERVIEW_BANK.length} perguntas com resposta forte`}
          description="Responda em voz alta antes de abrir a resposta. O que avaliam está sempre no método, não na decoreba."
        />
        <ul className="mt-4 space-y-2.5">
          {INTERVIEW_BANK.map((q) => (
            <li key={q.id} className="rounded-xl border border-border bg-surface-2 px-4 py-3">
              <button
                type="button"
                onClick={() => setOpenQ(openQ === q.id ? null : q.id)}
                className="flex w-full items-start gap-2 text-left"
              >
                <MessageSquare className="mt-0.5 size-4 shrink-0 text-epic" />
                <span className="flex-1 text-sm font-medium text-foreground">{q.question}</span>
                <Chip tone="accent">{q.area}</Chip>
              </button>
              {openQ === q.id && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">Avaliam: {q.whatTheyEvaluate}</p>
                  <p className="text-sm text-foreground/90">{q.strongAnswer}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
