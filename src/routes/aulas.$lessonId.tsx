import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Clock } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { getLesson, getLessonNeighbors, getModuleById } from "@/data/curriculum";
import { Chip, DifficultyChip, EmptyState, InsightBox, Panel } from "@/components/ui-bits";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/aulas/$lessonId")({
  loader: ({ params }) => {
    const lesson = getLesson(params.lessonId);
    if (!lesson) throw notFound();
    return { title: lesson.title, description: lesson.whyItMatters.slice(0, 155) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Aula não encontrada" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.title} — DevOps Quest RPG` },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: `${loaderData.title} — DevOps Quest RPG` },
        { property: "og:description", content: loaderData.description },
      ],
    };
  },
  notFoundComponent: () => (
    <EmptyState title="Aula não encontrada" description="Escolha uma aula na página de módulos." />
  ),
  component: LessonPage,
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  const lesson = getLesson(lessonId);
  const { progress, completeLesson, passQuiz, saveNote, setCurrentLesson } = useProgress();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    setAnswers({});
    setChecked(false);
    setNote(progress.notes[lessonId] ?? "");
    setCurrentLesson(lessonId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  if (!lesson) {
    return <EmptyState title="Aula não encontrada" description="Escolha uma aula na página de módulos." />;
  }

  const mod = getModuleById(lesson.moduleId);
  const { previous, next } = getLessonNeighbors(lesson.id);
  const done = progress.completedLessons.includes(lesson.id);
  const quizDone = progress.quizPassed.includes(lesson.id);
  const allCorrect =
    lesson.quiz.length > 0 && lesson.quiz.every((q, i) => answers[i] === q.answerIndex);

  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <header>
        {mod && (
          <Link to="/modulos/$slug" params={{ slug: mod.slug }} className="text-sm text-primary hover:underline">
            Módulo {mod.index} · {mod.title}
          </Link>
        )}
        <h1 className="mt-2 font-display text-2xl font-semibold text-foreground sm:text-3xl">{lesson.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <DifficultyChip level={lesson.difficulty} />
          <Chip>
            <Clock className="size-3" /> {lesson.duration} min
          </Chip>
          <Chip tone="primary">+{lesson.xp} XP</Chip>
          {lesson.tools.map((t) => (
            <Chip key={t} tone="accent">
              {t}
            </Chip>
          ))}
        </div>
      </header>

      <Panel>
        <h2 className="font-display font-semibold text-foreground">Objetivos desta aula</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {lesson.objectives.map((o) => (
            <li key={o} className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-success" />
              {o}
            </li>
          ))}
        </ul>
      </Panel>

      <div className="space-y-4">
        {lesson.body.map((p, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-foreground/90">
            {p}
          </p>
        ))}
      </div>

      {lesson.code.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Na prática</h2>
          {lesson.code.map((block, i) => (
            <CodeBlock key={i} block={block} />
          ))}
        </section>
      )}

      <section className="space-y-3">
        <InsightBox label="Por que isso importa" tone="why">
          {lesson.whyItMatters}
        </InsightBox>
        <InsightBox label="Erro comum" tone="mistake">
          {lesson.commonMistake}
        </InsightBox>
        <InsightBox label="Dica de produção" tone="tip">
          {lesson.productionTip}
        </InsightBox>
        {lesson.securityAlert && (
          <InsightBox label="Alerta de segurança" tone="security">
            {lesson.securityAlert}
          </InsightBox>
        )}
        <InsightBox label="Pergunta de entrevista" tone="interview">
          {lesson.interviewQuestion}
        </InsightBox>
      </section>

      <Panel>
        <h2 className="font-display font-semibold text-foreground">Glossário</h2>
        <dl className="mt-3 space-y-2.5">
          {lesson.glossary.map((g) => (
            <div key={g.term}>
              <dt className="font-mono text-sm text-accent">{g.term}</dt>
              <dd className="text-sm text-muted-foreground">{g.definition}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel>
        <h2 className="font-display font-semibold text-foreground">Conexão com o PrintQuest</h2>
        <p className="mt-2 text-sm text-muted-foreground">{lesson.printQuestLink}</p>
      </Panel>

      {lesson.quiz.length > 0 && (
        <Panel>
          <h2 className="font-display font-semibold text-foreground">Quiz da aula</h2>
          <ol className="mt-4 space-y-5">
            {lesson.quiz.map((q, qi) => (
              <li key={qi}>
                <p className="text-sm font-medium text-foreground">
                  {qi + 1}. {q.question}
                </p>
                <div className="mt-2.5 space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[qi] === oi;
                    const state = checked
                      ? oi === q.answerIndex
                        ? "border-success/60 bg-success/10"
                        : selected
                          ? "border-destructive/60 bg-destructive/10"
                          : "border-border"
                      : selected
                        ? "border-primary/60 bg-primary/10"
                        : "border-border";
                    return (
                      <label
                        key={oi}
                        className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 text-sm text-foreground/90 ${state}`}
                      >
                        <input
                          type="radio"
                          name={`q-${lesson.id}-${qi}`}
                          checked={selected}
                          onChange={() => {
                            setAnswers((a) => ({ ...a, [qi]: oi }));
                            setChecked(false);
                          }}
                          className="mt-0.5"
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
                {checked && (
                  <p className="mt-2 text-xs text-muted-foreground">{q.explanation}</p>
                )}
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setChecked(true);
                if (lesson.quiz.every((q, i) => answers[i] === q.answerIndex)) passQuiz(lesson.id);
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Corrigir respostas
            </button>
            {quizDone && <Chip tone="success">Quiz concluído</Chip>}
            {checked && !allCorrect && <Chip tone="warning">Revise as marcadas em vermelho</Chip>}
          </div>
        </Panel>
      )}

      <Panel>
        <h2 className="font-display font-semibold text-foreground">Minhas anotações</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => saveNote(lesson.id, note)}
          rows={4}
          placeholder="Comandos que você quer lembrar, dúvidas, links…"
          className="mt-3 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">Salvo automaticamente neste navegador.</p>
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        {previous ? (
          <Link
            to="/aulas/$lessonId"
            params={{ lessonId: previous.id }}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm text-foreground hover:border-primary/50"
          >
            <ArrowLeft className="size-4" /> Anterior
          </Link>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => completeLesson(lesson.id)}
          disabled={done}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Check className="size-4" /> {done ? "Aula concluída" : `Concluir aula (+${lesson.xp} XP)`}
        </button>
        {next ? (
          <Link
            to="/aulas/$lessonId"
            params={{ lessonId: next.id }}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm text-foreground hover:border-primary/50"
          >
            Próxima <ArrowRight className="size-4" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}
