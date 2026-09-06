import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { UserProgress } from "./types";
import { ALL_LESSONS, MODULES } from "@/data/curriculum";
import { LABS } from "@/data/labs";
import { BOSSES, CHALLENGES } from "@/data/challenges";
import { PROJECT_STEPS } from "@/data/project";
import { BADGES, levelFromXp } from "@/data/world";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

const STORAGE_KEY = "devops-quest-rpg:progress:v1";

export const EMPTY_PROGRESS: UserProgress = {
  xp: 0,
  completedLessons: [],
  completedLabs: [],
  completedChallenges: [],
  defeatedBosses: [],
  completedProjectSteps: [],
  quizPassed: [],
  notes: {},
  minutesStudied: 0,
  streak: 0,
  lastActive: null,
  currentLessonId: null,
};

const XP = {
  lesson: 25,
  quiz: 15,
  lab: 100,
  challenge: 250,
  boss: 750,
  projectStep: 200,
  module: 1000,
} as const;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

interface ProgressContextValue {
  progress: UserProgress;
  hydrated: boolean;
  level: ReturnType<typeof levelFromXp>;
  completeLesson: (lessonId: string) => void;
  passQuiz: (lessonId: string) => void;
  completeLab: (labId: string) => void;
  completeChallenge: (challengeId: string) => void;
  defeatBoss: (bossId: string) => void;
  toggleProjectStep: (stepId: string) => void;
  saveNote: (lessonId: string, note: string) => void;
  setCurrentLesson: (lessonId: string) => void;
  reset: () => void;
  earnedBadges: string[];
  moduleProgress: (moduleId: string) => { done: number; total: number; percent: number };
  regionProgress: (moduleIds: string[]) => number;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function readLocal(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_PROGRESS };
    return { ...EMPTY_PROGRESS, ...(JSON.parse(raw) as Partial<UserProgress>) };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

function applyStreak(input: UserProgress): UserProgress {
  const today = todayISO();
  const next = { ...input };
  if (next.lastActive && next.lastActive !== today) {
    const gap = daysBetween(next.lastActive, today);
    next.streak = gap === 1 ? next.streak + 1 : 1;
  } else if (!next.lastActive) {
    next.streak = 1;
  }
  next.lastActive = today;
  return next;
}

function hasAnyProgress(p: UserProgress) {
  return (
    p.xp > 0 ||
    p.completedLessons.length > 0 ||
    p.completedLabs.length > 0 ||
    p.completedChallenges.length > 0 ||
    p.defeatedBosses.length > 0 ||
    p.completedProjectSteps.length > 0 ||
    p.quizPassed.length > 0
  );
}

function union(a: string[], b: string[]) {
  return Array.from(new Set([...a, ...b]));
}

function mergeProgress(remote: UserProgress, local: UserProgress | null): UserProgress {
  if (!local) return remote;
  return {
    xp: Math.max(remote.xp, local.xp),
    completedLessons: union(remote.completedLessons, local.completedLessons),
    completedLabs: union(remote.completedLabs, local.completedLabs),
    completedChallenges: union(remote.completedChallenges, local.completedChallenges),
    defeatedBosses: union(remote.defeatedBosses, local.defeatedBosses),
    completedProjectSteps: union(remote.completedProjectSteps, local.completedProjectSteps),
    quizPassed: union(remote.quizPassed, local.quizPassed),
    notes: { ...remote.notes, ...local.notes },
    minutesStudied: Math.max(remote.minutesStudied, local.minutesStudied),
    streak: Math.max(remote.streak, local.streak),
    lastActive: remote.lastActive ?? local.lastActive,
    currentLessonId: local.currentLessonId ?? remote.currentLessonId,
  };
}

interface ProgressRow {
  xp: number;
  completed_lessons: string[];
  completed_labs: string[];
  completed_challenges: string[];
  defeated_bosses: string[];
  completed_project_steps: string[];
  quiz_passed: string[];
  notes: unknown;
  minutes_studied: number;
  streak: number;
  last_active: string | null;
  current_lesson_id: string | null;
}

function rowToProgress(row: ProgressRow): UserProgress {
  return {
    xp: row.xp ?? 0,
    completedLessons: row.completed_lessons ?? [],
    completedLabs: row.completed_labs ?? [],
    completedChallenges: row.completed_challenges ?? [],
    defeatedBosses: row.defeated_bosses ?? [],
    completedProjectSteps: row.completed_project_steps ?? [],
    quizPassed: row.quiz_passed ?? [],
    notes: (row.notes as Record<string, string> | null) ?? {},
    minutesStudied: row.minutes_studied ?? 0,
    streak: row.streak ?? 0,
    lastActive: row.last_active ?? null,
    currentLessonId: row.current_lesson_id ?? null,
  };
}

function progressToRow(userId: string, p: UserProgress) {
  return {
    user_id: userId,
    xp: p.xp,
    completed_lessons: p.completedLessons,
    completed_labs: p.completedLabs,
    completed_challenges: p.completedChallenges,
    defeated_bosses: p.defeatedBosses,
    completed_project_steps: p.completedProjectSteps,
    quiz_passed: p.quizPassed,
    notes: p.notes,
    minutes_studied: p.minutesStudied,
    streak: p.streak,
    last_active: p.lastActive,
    current_lesson_id: p.currentLessonId,
  };
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [progress, setProgress] = useState<UserProgress>(EMPTY_PROGRESS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    setHydrated(false);

    void (async () => {
      const local = readLocal();
      let base = local;
      if (userId) {
        const { data } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        if (data) {
          base = mergeProgress(
            rowToProgress(data as unknown as ProgressRow),
            hasAnyProgress(local) ? local : null,
          );
        }
      }
      if (cancelled) return;
      setProgress(applyStreak(base));
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, authLoading]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* armazenamento indisponível: seguimos apenas em memória */
    }
    if (!userId) return;
    const timer = setTimeout(() => {
      void supabase.from("progress").upsert(progressToRow(userId, progress), {
        onConflict: "user_id",
      });
    }, 700);
    return () => clearTimeout(timer);
  }, [progress, hydrated, userId]);

  const award = useCallback((amount: number, message: string) => {
    setProgress((prev) => {
      const before = levelFromXp(prev.xp).level;
      const next = { ...prev, xp: prev.xp + amount };
      const after = levelFromXp(next.xp);
      if (after.level > before) {
        setTimeout(
          () => toast.success(`Nível ${after.level} alcançado!`, { description: after.className }),
          150,
        );
      }
      return next;
    });
    toast.success(message, { description: `+${amount} XP` });
  }, []);

  const completeLesson = useCallback(
    (lessonId: string) => {
      setProgress((prev) => {
        if (prev.completedLessons.includes(lessonId)) return prev;
        const lesson = ALL_LESSONS.find((l) => l.id === lessonId);
        return {
          ...prev,
          completedLessons: [...prev.completedLessons, lessonId],
          minutesStudied: prev.minutesStudied + (lesson?.duration ?? 20),
          currentLessonId: lessonId,
        };
      });
      if (!progress.completedLessons.includes(lessonId)) {
        award(XP.lesson, "Aula concluída");
        const lesson = ALL_LESSONS.find((l) => l.id === lessonId);
        const mod = MODULES.find((m) => m.id === lesson?.moduleId);
        if (mod) {
          const done = mod.lessons.filter(
            (l) => l.id === lessonId || progress.completedLessons.includes(l.id),
          ).length;
          if (done === mod.lessons.length) award(XP.module, `Módulo ${mod.index} completo: ${mod.title}`);
        }
      }
    },
    [award, progress.completedLessons],
  );

  const passQuiz = useCallback(
    (lessonId: string) => {
      if (progress.quizPassed.includes(lessonId)) {
        toast.info("Quiz já concluído nesta aula");
        return;
      }
      setProgress((prev) => ({ ...prev, quizPassed: [...prev.quizPassed, lessonId] }));
      award(XP.quiz, "Quiz correto");
    },
    [award, progress.quizPassed],
  );

  const completeLab = useCallback(
    (labId: string) => {
      if (progress.completedLabs.includes(labId)) return;
      setProgress((prev) => ({
        ...prev,
        completedLabs: [...prev.completedLabs, labId],
        minutesStudied: prev.minutesStudied + (LABS.find((l) => l.id === labId)?.minutes ?? 45),
      }));
      award(XP.lab, "Laboratório concluído");
    },
    [award, progress.completedLabs],
  );

  const completeChallenge = useCallback(
    (challengeId: string) => {
      if (progress.completedChallenges.includes(challengeId)) return;
      setProgress((prev) => ({ ...prev, completedChallenges: [...prev.completedChallenges, challengeId] }));
      award(XP.challenge, "Desafio entregue");
    },
    [award, progress.completedChallenges],
  );

  const defeatBoss = useCallback(
    (bossId: string) => {
      if (progress.defeatedBosses.includes(bossId)) return;
      setProgress((prev) => ({ ...prev, defeatedBosses: [...prev.defeatedBosses, bossId] }));
      const boss = BOSSES.find((b) => b.id === bossId);
      award(XP.boss, `Boss derrotado: ${boss?.name ?? ""}`);
    },
    [award, progress.defeatedBosses],
  );

  const toggleProjectStep = useCallback(
    (stepId: string) => {
      const already = progress.completedProjectSteps.includes(stepId);
      setProgress((prev) => ({
        ...prev,
        completedProjectSteps: already
          ? prev.completedProjectSteps.filter((s) => s !== stepId)
          : [...prev.completedProjectSteps, stepId],
      }));
      if (already) {
        toast.info("Etapa desmarcada");
      } else {
        award(XP.projectStep, "Etapa do PrintQuest concluída");
      }
    },
    [award, progress.completedProjectSteps],
  );

  const saveNote = useCallback((lessonId: string, note: string) => {
    setProgress((prev) => ({ ...prev, notes: { ...prev.notes, [lessonId]: note } }));
  }, []);

  const setCurrentLesson = useCallback((lessonId: string) => {
    setProgress((prev) => (prev.currentLessonId === lessonId ? prev : { ...prev, currentLessonId: lessonId }));
  }, []);

  const reset = useCallback(() => {
    setProgress({ ...EMPTY_PROGRESS, streak: 1, lastActive: todayISO() });
    toast.success("Progresso reiniciado");
  }, []);

  const moduleProgress = useCallback(
    (moduleId: string) => {
      const mod = MODULES.find((m) => m.id === moduleId);
      const lessons = mod?.lessons ?? [];
      const labs = LABS.filter((l) => l.moduleId === moduleId);
      const total = lessons.length + labs.length;
      const done =
        lessons.filter((l) => progress.completedLessons.includes(l.id)).length +
        labs.filter((l) => progress.completedLabs.includes(l.id)).length;
      return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
    },
    [progress.completedLessons, progress.completedLabs],
  );

  const regionProgress = useCallback(
    (moduleIds: string[]) => {
      const parts = moduleIds.map((id) => moduleProgress(id));
      const total = parts.reduce((a, p) => a + p.total, 0);
      const done = parts.reduce((a, p) => a + p.done, 0);
      return total ? Math.round((done / total) * 100) : 0;
    },
    [moduleProgress],
  );

  const earnedBadges = useMemo(() => {
    const earned: string[] = [];
    const lessonsDone = progress.completedLessons.length;
    if (lessonsDone >= 1) earned.push("first-commit");
    if (lessonsDone >= 5) earned.push("terminal-apprentice");
    if (progress.completedLabs.length >= 1) earned.push("docker-initiate");

    for (const mod of MODULES) {
      const p = moduleProgress(mod.id);
      if (p.total > 0 && p.done === p.total) earned.push(mod.badge);
    }
    for (const boss of BOSSES) {
      if (!progress.defeatedBosses.includes(boss.id)) continue;
      const map: Record<string, string> = {
        "boss-dragao-502": "nginx-defender",
        "boss-conflito-merge": "git-guardian",
        "boss-crashloop-container": "container-architect",
        "boss-pipeline-quebrado": "pipeline-builder",
        "boss-security-group": "iam-guardian",
        "boss-drift-terraform": "terraform-builder",
        "boss-crashloopbackoff": "kubernetes-operator",
        "boss-out-of-sync": "gitops-keeper",
        "boss-queda-producao": "sre-guardian",
        "boss-processo-zumbi": "log-hunter",
      };
      const badgeId = map[boss.id];
      if (badgeId) earned.push(badgeId);
    }
    if (progress.completedChallenges.length >= 6) earned.push("bash-scripter");
    if (progress.completedChallenges.length >= 10) earned.push("security-sentinel");
    if (progress.completedProjectSteps.length >= 12) earned.push("cloud-explorer");
    if (progress.completedProjectSteps.length >= 20) earned.push("observability-watcher");
    if (progress.completedProjectSteps.length === PROJECT_STEPS.length) earned.push("devops-professional");
    if (progress.completedChallenges.length === CHALLENGES.length) earned.push("cost-optimizer");

    return Array.from(new Set(earned)).filter((id) => BADGES.some((b) => b.id === id));
  }, [progress, moduleProgress]);

  const value: ProgressContextValue = {
    progress,
    hydrated,
    level: levelFromXp(progress.xp),
    completeLesson,
    passQuiz,
    completeLab,
    completeChallenge,
    defeatBoss,
    toggleProjectStep,
    saveNote,
    setCurrentLesson,
    reset,
    earnedBadges,
    moduleProgress,
    regionProgress,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress precisa estar dentro de ProgressProvider");
  return ctx;
}

/** Próxima aula não concluída, para o botão "Continuar de onde parei". */
export function nextLesson(completed: string[]) {
  return ALL_LESSONS.find((l) => !completed.includes(l.id)) ?? ALL_LESSONS[0];
}
