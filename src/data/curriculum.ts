import type { Lesson, Module } from "@/lib/types";
import { FUNDAMENTOS_MODULES } from "./modules-fundamentos";
import { REDES_GIT_MODULES } from "./modules-redes-git";
import { CONTAINERS_CICD_MODULES } from "./modules-containers-cicd";
import { CLOUD_IAC_MODULES } from "./modules-cloud-iac";
import { K8S_GITOPS_MODULES } from "./modules-k8s-gitops";
import { SRE_FINAL_MODULES } from "./modules-sre-final";
import { DEEP_REDES_GIT, type LessonDeep } from "./deep-redes-git";
import...DEEP_CONTAINERS_CICD, ...DEEP_CLOUD_IAC } from "./deep-containers-cicd";
import { DEEP_CLOUD_IAC } from "./deep-cloud-iac";

const DEEP: Record<string, LessonDeep> = { ...DEEP_REDES_GIT, ...DEEP_CONTAINERS_CICD, ...DEEP_CLOUD_IAC };

function enrich(m: Module): Module {
  return {
    ...m,
    lessons: m.lessons.map((l) => {
      const d = DEEP[l.id];
      if (!d) return l;
      return {
        ...l,
        objectives: [...l.objectives, ...(d.objectives ?? [])],
        body: [...l.body, ...(d.body ?? [])],
        code: [...l.code, ...(d.code ?? [])],
        glossary: [...l.glossary, ...(d.glossary ?? [])],
        quiz: [...l.quiz, ...(d.quiz ?? [])],
      };
    }),
  };
}

export const MODULES: Module[] = [
  ...FUNDAMENTOS_MODULES,
  ...REDES_GIT_MODULES,
  ...CONTAINERS_CICD_MODULES,
  ...CLOUD_IAC_MODULES,
  ...K8S_GITOPS_MODULES,
  ...SRE_FINAL_MODULES,
].map(enrich);

export const ALL_LESSONS: Lesson[] = MODULES.flatMap((m) => m.lessons);

export const TOTAL_WEEKS = MODULES.reduce((acc, m) => acc + m.weeks, 0);
export const TOTAL_MODULE_XP = MODULES.reduce((acc, m) => acc + m.xp, 0);

export function getModule(slug: string) {
  return MODULES.find((m) => m.slug === slug);
}

export function getModuleById(id: string) {
  return MODULES.find((m) => m.id === id);
}

export function getLesson(id: string) {
  return ALL_LESSONS.find((l) => l.id === id);
}

export function getLessonNeighbors(id: string) {
  const index = ALL_LESSONS.findIndex((l) => l.id === id);
  return {
    previous: index > 0 ? ALL_LESSONS[index - 1] : null,
    next: index >= 0 && index < ALL_LESSONS.length - 1 ? ALL_LESSONS[index + 1] : null,
  };
}
