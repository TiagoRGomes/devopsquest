// Traduz objetos de conteúdo inteiros (aula, módulo, lab, desafio, boss…) para o idioma escolhido.
// Cada campo cai no português original quando não existe tradução.
import type { Lang } from "@/lib/i18n";
import type {
  BadgeDef,
  BossBattle,
  Challenge,
  Lab,
  Lesson,
  MaturityAxis,
  Module,
  ProjectStep,
  Region,
  Skill,
} from "@/lib/types";
import type { ExamQuestion, ModuleExam, QuizQuestion } from "@/lib/types";
import { contentList, contentText, slugifyClassName } from "@/lib/content-i18n";

function quiz<T extends QuizQuestion>(lang: Lang, id: string, questions: T[]): T[] {
  return questions.map((q, i) => ({
    ...q,
    question: contentText(lang, id, `q${i}`, q.question),
    options: contentList(lang, id, `q${i}opts`, q.options),
    explanation: contentText(lang, id, `q${i}exp`, q.explanation),
  }));
}

export function tLesson(lang: Lang, l: Lesson): Lesson {
  if (lang === "pt") return l;
  const terms = contentList(lang, l.id, "glossaryTerms", l.glossary.map((g) => g.term));
  const defs = contentList(lang, l.id, "glossaryDefs", l.glossary.map((g) => g.definition));
  const labels = contentList(lang, l.id, "codeLabels", l.code.map((c) => c.label));
  return {
    ...l,
    title: contentText(lang, l.id, "title", l.title),
    objectives: contentList(lang, l.id, "objectives", l.objectives),
    body: contentList(lang, l.id, "body", l.body),
    whyItMatters: contentText(lang, l.id, "whyItMatters", l.whyItMatters),
    commonMistake: contentText(lang, l.id, "commonMistake", l.commonMistake),
    productionTip: contentText(lang, l.id, "productionTip", l.productionTip),
    securityAlert: l.securityAlert
      ? contentText(lang, l.id, "securityAlert", l.securityAlert)
      : l.securityAlert,
    interviewQuestion: contentText(lang, l.id, "interviewQuestion", l.interviewQuestion),
    glossary: l.glossary.map((g, i) => ({
      term: terms[i] ?? g.term,
      definition: defs[i] ?? g.definition,
    })),
    code: l.code.map((c, i) => ({
      language: c.language,
      code: c.code,
      label: labels[i] ?? c.label,
      ...(c.securityNote
        ? { securityNote: contentText(lang, l.id, `codeNote${i}`, c.securityNote) }
        : {}),
    })),
    printQuestLink: contentText(lang, l.id, "capstone", l.printQuestLink),
    quiz: quiz(lang, l.id, l.quiz),
  };
}

export function tModule(lang: Lang, m: Module): Module {
  if (lang === "pt") return m;
  return {
    ...m,
    title: contentText(lang, m.id, "title", m.title),
    tagline: contentText(lang, m.id, "tagline", m.tagline),
    overview: contentText(lang, m.id, "overview", m.overview),
    objectives: contentList(lang, m.id, "objectives", m.objectives),
    prerequisites: contentList(lang, m.id, "prerequisites", m.prerequisites),
    delivery: contentText(lang, m.id, "delivery", m.delivery),
    checklist: contentList(lang, m.id, "checklist", m.checklist),
    troubleshooting: contentText(lang, m.id, "troubleshooting", m.troubleshooting),
    interviewQuestions: contentList(lang, m.id, "interviewQuestions", m.interviewQuestions),
    printQuest: contentText(lang, m.id, "capstone", m.printQuest),
    lessons: m.lessons.map((l) => tLesson(lang, l)),
  };
}

export function tLab(lang: Lang, lab: Lab): Lab {
  if (lang === "pt") return lab;
  const names = contentList(lang, lab.id, "errorNames", lab.commonErrors.map((e) => e.error));
  const fixes = contentList(lang, lab.id, "errorFixes", lab.commonErrors.map((e) => e.fix));
  return {
    ...lab,
    title: contentText(lang, lab.id, "title", lab.title),
    goal: contentText(lang, lab.id, "goal", lab.goal),
    professionalContext: contentText(lang, lab.id, "professionalContext", lab.professionalContext),
    prerequisites: contentList(lang, lab.id, "prerequisites", lab.prerequisites),
    environment: contentText(lang, lab.id, "environment", lab.environment),
    steps: contentList(lang, lab.id, "steps", lab.steps),
    commands: {
      ...lab.commands,
      label: contentText(lang, lab.id, "commandsLabel", lab.commands.label),
      ...(lab.commands.securityNote
        ? { securityNote: contentText(lang, lab.id, "commandsNote", lab.commands.securityNote) }
        : {}),
    },
    validation: contentList(lang, lab.id, "validation", lab.validation),
    commonErrors: lab.commonErrors.map((e, i) => ({
      error: names[i] ?? e.error,
      fix: fixes[i] ?? e.fix,
    })),
    solution: contentText(lang, lab.id, "solution", lab.solution),
  };
}

export function tChallenge(lang: Lang, c: Challenge): Challenge {
  if (lang === "pt") return c;
  return {
    ...c,
    title: contentText(lang, c.id, "title", c.title),
    brief: contentText(lang, c.id, "brief", c.brief),
    acceptance: contentList(lang, c.id, "acceptance", c.acceptance),
    feedback: contentText(lang, c.id, "feedback", c.feedback),
  };
}

export function tBoss(lang: Lang, b: BossBattle): BossBattle {
  if (lang === "pt") return b;
  const steps = contentList(lang, b.id, "investigationSteps", b.investigation.map((i) => i.step));
  return {
    ...b,
    name: contentText(lang, b.id, "name", b.name),
    scenario: contentText(lang, b.id, "scenario", b.scenario),
    symptoms: contentList(lang, b.id, "symptoms", b.symptoms),
    investigation: b.investigation.map((i, idx) => ({ ...i, step: steps[idx] ?? i.step })),
    rootCause: contentText(lang, b.id, "rootCause", b.rootCause),
    resolution: contentList(lang, b.id, "resolution", b.resolution),
  };
}

export function tRegion(lang: Lang, r: Region): Region {
  if (lang === "pt") return r;
  return {
    ...r,
    name: contentText(lang, r.id, "name", r.name),
    theme: contentText(lang, r.id, "theme", r.theme),
    description: contentText(lang, r.id, "description", r.description),
    quest: contentText(lang, r.id, "quest", r.quest),
  };
}

export function tSkill(lang: Lang, s: Skill): Skill {
  if (lang === "pt") return s;
  return {
    ...s,
    name: contentText(lang, s.id, "name", s.name),
    description: contentText(lang, s.id, "description", s.description),
    reward: contentText(lang, s.id, "reward", s.reward),
  };
}

export function tBadge(lang: Lang, b: BadgeDef): BadgeDef {
  if (lang === "pt") return b;
  return {
    ...b,
    name: contentText(lang, b.id, "name", b.name),
    condition: contentText(lang, b.id, "description", b.condition),
  };
}

export function tProjectStep(lang: Lang, s: ProjectStep): ProjectStep {
  if (lang === "pt") return s;
  return {
    ...s,
    phase: contentText(lang, s.id, "phase", s.phase),
    title: contentText(lang, s.id, "title", s.title),
    description: contentText(lang, s.id, "description", s.description),
    deliverable: contentText(lang, s.id, "deliverable", s.deliverable),
  };
}

export function tAxis(lang: Lang, a: MaturityAxis): MaturityAxis {
  if (lang === "pt") return a;
  const id = `axis.${slugifyClassName(a.axis)}`;
  return {
    ...a,
    axis: contentText(lang, id, "title", a.axis),
    description: contentText(lang, id, "description", a.description),
  };
}

export function tExam(lang: Lang, ex: ModuleExam): ModuleExam {
  if (lang === "pt") return ex;
  return {
    ...ex,
    questions: quiz(lang, `exam.${ex.moduleId}`, ex.questions as ExamQuestion[]),
  };
}

export function tProjectField(lang: Lang, field: string, fallback: string): string {
  return contentText(lang, "project", field, fallback);
}

export function tCareerField(lang: Lang, id: string, field: string, fallback: string): string {
  return contentText(lang, id, field, fallback);
}

export function tCareerList(lang: Lang, id: string, field: string, fallback: string[]): string[] {
  return contentList(lang, id, field, fallback);
}
