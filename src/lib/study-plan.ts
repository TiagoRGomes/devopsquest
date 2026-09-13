// Monta o plano semanal a partir dos módulos, aulas, labs e exames do curso.
import { MODULES } from "@/data/curriculum";
import { LABS } from "@/data/labs";

export type PlanItemKind = "lesson" | "lab" | "exam";

export interface PlanItem {
  kind: PlanItemKind;
  id: string;
  minutes: number;
}

export interface PlanWeek {
  index: number; // 1..n
  moduleId: string;
  moduleIndex: number;
  weekOfModule: number;
  weeksInModule: number;
  items: PlanItem[];
  minutes: number;
}

function chunk<T>(list: T[], parts: number): T[][] {
  const buckets: T[][] = Array.from({ length: Math.max(1, parts) }, () => []);
  list.forEach((item, i) => {
    const bucket = buckets[i % buckets.length];
    if (bucket) bucket.push(item);
  });
  return buckets;
}

/** Semanas do curso inteiro, na ordem do currículo. */
export function buildStudyPlan(): PlanWeek[] {
  const weeks: PlanWeek[] = [];
  let counter = 0;

  for (const mod of MODULES) {
    const weeksInModule = Math.max(1, mod.weeks);
    const lessonBuckets = chunk(mod.lessons, weeksInModule);
    const labBuckets = chunk(
      LABS.filter((l) => l.moduleId === mod.id),
      weeksInModule,
    );

    for (let w = 0; w < weeksInModule; w++) {
      counter += 1;
      const items: PlanItem[] = [
        ...(lessonBuckets[w] ?? []).map<PlanItem>((l) => ({
          kind: "lesson",
          id: l.id,
          minutes: l.duration,
        })),
        ...(labBuckets[w] ?? []).map<PlanItem>((l) => ({
          kind: "lab",
          id: l.id,
          minutes: l.minutes,
        })),
      ];
      if (w === weeksInModule - 1) {
        items.push({ kind: "exam", id: mod.id, minutes: 30 });
      }
      weeks.push({
        index: counter,
        moduleId: mod.id,
        moduleIndex: mod.index,
        weekOfModule: w + 1,
        weeksInModule,
        items,
        minutes: items.reduce((a, i) => a + i.minutes, 0),
      });
    }
  }

  return weeks;
}

export const STUDY_PLAN = buildStudyPlan();
