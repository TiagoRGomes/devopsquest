import type { ModuleExam } from "@/lib/types";
import { MODULES } from "./curriculum";
import { EXAMS_A } from "./exams-a";
import { EXAMS_B } from "./exams-b";

export const MODULE_EXAMS: ModuleExam[] = [...EXAMS_A, ...EXAMS_B];

export const PASS_SCORE = 70;
export const DAILY_ATTEMPTS = 3;

export function getExam(moduleId: string) {
  return MODULE_EXAMS.find((e) => e.moduleId === moduleId);
}

/** Módulos em ordem de currículo — usado para liberar o próximo depois do exame. */
export const MODULE_ORDER = MODULES.map((m) => m.id);

export function previousModuleId(moduleId: string) {
  const i = MODULE_ORDER.indexOf(moduleId);
  return i > 0 ? (MODULE_ORDER[i - 1] as string) : null;
}

/** Carga horária total do curso, em horas, somando aulas, labs e projeto. */
export function courseHours(extraMinutes: number) {
  return Math.max(1, Math.round(extraMinutes / 60));
}
