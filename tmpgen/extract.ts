// Extrai todos os textos PT do conteúdo do curso em pares chave/valor.
import { MODULES } from "@/data/curriculum";
import { LABS } from "@/data/labs";
import { CHALLENGES, BOSSES } from "@/data/challenges";
import { REGIONS, SKILLS, BADGES } from "@/data/world";
import { PROJECT, PROJECT_STEPS, MATURITY_AXES } from "@/data/project";
import { CAREER_TRACKS, FIRST_JOB_CHECKLIST, RESUME_LINES, INTERVIEW_BANK } from "@/data/career";
import { RESOURCES } from "@/data/resources";
import { MODULE_EXAMS } from "@/data/exams";
import { slugifyClassName } from "@/lib/content-i18n";

const out: Record<string, string> = {};
const put = (id: string, field: string, v?: string) => {
  if (v && v.trim()) out[`${id}.${field}`] = v;
};
const putList = (id: string, field: string, v?: string[]) => {
  if (v && v.length) out[`${id}.${field}`] = v.join(" | ");
};

for (const m of MODULES) {
  put(m.id, "title", m.title);
  put(m.id, "tagline", m.tagline);
  put(m.id, "overview", m.overview);
  putList(m.id, "objectives", m.objectives);
  putList(m.id, "prerequisites", m.prerequisites);
  put(m.id, "delivery", m.delivery);
  putList(m.id, "checklist", m.checklist);
  put(m.id, "troubleshooting", m.troubleshooting);
  putList(m.id, "interviewQuestions", m.interviewQuestions);
  put(m.id, "capstone", m.printQuest);
  for (const l of m.lessons) {
    put(l.id, "title", l.title);
    putList(l.id, "objectives", l.objectives);
    putList(l.id, "body", l.body);
    put(l.id, "whyItMatters", l.whyItMatters);
    put(l.id, "commonMistake", l.commonMistake);
    put(l.id, "productionTip", l.productionTip);
    put(l.id, "securityAlert", l.securityAlert);
    put(l.id, "interviewQuestion", l.interviewQuestion);
    putList(l.id, "glossaryTerms", l.glossary.map((g) => g.term));
    putList(l.id, "glossaryDefs", l.glossary.map((g) => g.definition));
    put(l.id, "capstone", l.printQuestLink);
    putList(l.id, "codeLabels", l.code.map((c) => c.label));
    l.code.forEach((c, i) => put(l.id, `codeNote${i}`, c.securityNote));
    l.quiz.forEach((q, i) => {
      put(l.id, `q${i}`, q.question);
      putList(l.id, `q${i}opts`, q.options);
      put(l.id, `q${i}exp`, q.explanation);
    });
  }
}

for (const lab of LABS) {
  put(lab.id, "title", lab.title);
  put(lab.id, "goal", lab.goal);
  put(lab.id, "professionalContext", lab.professionalContext);
  putList(lab.id, "prerequisites", lab.prerequisites);
  put(lab.id, "environment", lab.environment);
  putList(lab.id, "steps", lab.steps);
  put(lab.id, "commandsLabel", lab.commands.label);
  put(lab.id, "commandsNote", lab.commands.securityNote);
  putList(lab.id, "validation", lab.validation);
  putList(lab.id, "errorNames", lab.commonErrors.map((e) => e.error));
  putList(lab.id, "errorFixes", lab.commonErrors.map((e) => e.fix));
  put(lab.id, "solution", lab.solution);
}

for (const c of CHALLENGES) {
  put(c.id, "title", c.title);
  put(c.id, "brief", c.brief);
  putList(c.id, "acceptance", c.acceptance);
  put(c.id, "feedback", c.feedback);
}

for (const b of BOSSES) {
  put(b.id, "name", b.name);
  put(b.id, "scenario", b.scenario);
  putList(b.id, "symptoms", b.symptoms);
  putList(b.id, "investigationSteps", b.investigation.map((i) => i.step));
  put(b.id, "rootCause", b.rootCause);
  putList(b.id, "resolution", b.resolution);
}

for (const r of REGIONS) {
  put(r.id, "name", r.name);
  put(r.id, "theme", r.theme);
  put(r.id, "description", r.description);
  put(r.id, "quest", r.quest);
}

for (const s of SKILLS) {
  put(s.id, "name", s.name);
  put(s.id, "description", s.description);
  put(s.id, "reward", s.reward);
}

for (const b of BADGES) {
  put(b.id, "name", b.name);
  put(b.id, "description", b.condition);
}

put("project", "name", PROJECT.name);
for (const [k, v] of Object.entries(PROJECT as Record<string, unknown>)) {
  if (typeof v === "string" && k !== "name") put("project", k, v);
}
for (const r of (PROJECT as unknown as { repos: { name: string; purpose: string }[] }).repos) {
  put(`repo.${r.name}`, "purpose", r.purpose);
}
for (const s of PROJECT_STEPS) {
  put(s.id, "title", s.title);
  put(s.id, "phase", s.phase);
  put(s.id, "description", s.description);
  put(s.id, "deliverable", s.deliverable);
}
for (const a of MATURITY_AXES) {
  put(`axis.${slugifyClassName(a.axis)}`, "title", a.axis);
  put(`axis.${slugifyClassName(a.axis)}`, "description", a.description);
}

for (const t of CAREER_TRACKS) {
  put(t.id, "name", t.name);
  put(t.id, "focus", t.focus);
  putList(t.id, "dayToDay", t.dayToDay);
  putList(t.id, "niceToHave", t.niceToHave);
  put(t.id, "salaryNote", t.salaryNote);
  put(t.id, "fitFor", t.fitFor);
}
putList("career", "firstJobChecklist", FIRST_JOB_CHECKLIST as unknown as string[]);
putList("career", "resumeLines", RESUME_LINES as unknown as string[]);
INTERVIEW_BANK.forEach((q, i) => {
  const rec = q as unknown as Record<string, unknown>;
  for (const [k, v] of Object.entries(rec)) {
    if (typeof v === "string") put(`interview.${i}`, k, v);
    else if (Array.isArray(v) && v.every((x) => typeof x === "string")) putList(`interview.${i}`, k, v as string[]);
  }
});

RESOURCES.forEach((r, i) => {
  put(`res.${i}`, "title", r.title);
  put(`res.${i}`, "description", r.description);
});

for (const ex of MODULE_EXAMS) {
  ex.questions.forEach((q, i) => {
    put(`exam.${ex.moduleId}`, `q${i}`, q.question);
    putList(`exam.${ex.moduleId}`, `q${i}opts`, q.options);
    put(`exam.${ex.moduleId}`, `q${i}exp`, q.explanation);
  });
}

await Bun.write("/tmp/tr/pt.json", JSON.stringify(out, null, 1));
console.log("keys", Object.keys(out).length, "chars", JSON.stringify(out).length);
