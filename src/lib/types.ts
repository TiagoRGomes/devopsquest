export type Difficulty = "Iniciante" | "Intermediário" | "Avançado" | "Ninja";

export type Rarity = "Comum" | "Raro" | "Épico" | "Lendário";

export interface CodeBlock {
  label: string;
  language: string;
  code: string;
  securityNote?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export type ExamLevel = "facil" | "medio" | "dificil";

export interface ExamQuestion extends QuizQuestion {
  level: ExamLevel;
}

export interface ModuleExam {
  moduleId: string;
  questions: ExamQuestion[];
}

export interface ExamResult {
  best: number;
  passedAt: string | null;
}

export interface ExamAttemptDay {
  date: string;
  count: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  duration: number; // minutes
  difficulty: Difficulty;
  tools: string[];
  xp: number;
  objectives: string[];
  body: string[];
  code: CodeBlock[];
  whyItMatters: string;
  commonMistake: string;
  productionTip: string;
  securityAlert?: string;
  interviewQuestion: string;
  glossary: { term: string; definition: string }[];
  printQuestLink: string;
  quiz: QuizQuestion[];
}

export interface Module {
  id: string;
  index: number;
  slug: string;
  title: string;
  tagline: string;
  weeks: number;
  xp: number;
  badge: string;
  overview: string;
  objectives: string[];
  prerequisites: string[];
  topics: string[];
  delivery: string;
  checklist: string[];
  troubleshooting: string;
  interviewQuestions: string[];
  printQuest: string;
  regionId: string;
  bossId?: string;
  lessons: Lesson[];
}

export interface Lab {
  id: string;
  moduleId: string;
  title: string;
  goal: string;
  professionalContext: string;
  minutes: number;
  difficulty: Difficulty;
  prerequisites: string[];
  environment: string;
  steps: string[];
  commands: CodeBlock;
  validation: string[];
  commonErrors: { error: string; fix: string }[];
  solution: string;
  xp: number;
}

export interface Challenge {
  id: string;
  title: string;
  level: Difficulty;
  xp: number;
  tools: string[];
  brief: string;
  acceptance: string[];
  feedback: string;
}

export interface BossBattle {
  id: string;
  regionId: string;
  name: string;
  scenario: string;
  symptoms: string[];
  investigation: { step: string; command: string }[];
  rootCause: string;
  resolution: string[];
  xp: number;
  requiredLevel: number;
}

export interface Region {
  id: string;
  name: string;
  order: number;
  theme: string;
  description: string;
  moduleIds: string[];
  quest: string;
  badge: string;
  labId: string;
  bossId: string;
  xp: number;
  requiredLevel: number;
}

export interface Skill {
  id: string;
  tree: string;
  name: string;
  description: string;
  xp: number;
  requires: string[];
  lessonIds: string[];
  reward: string;
}

export interface BadgeDef {
  id: string;
  name: string;
  rarity: Rarity;
  xp: number;
  condition: string;
  icon: string;
}

export interface ProjectStep {
  id: string;
  phase: string;
  title: string;
  description: string;
  stack: string[];
  deliverable: string;
  repo: string;
}

export interface MaturityAxis {
  axis: string;
  weight: number;
  description: string;
}

export interface UserProgress {
  xp: number;
  completedLessons: string[];
  completedLabs: string[];
  completedChallenges: string[];
  defeatedBosses: string[];
  completedProjectSteps: string[];
  quizPassed: string[];
  notes: Record<string, string>;
  minutesStudied: number;
  streak: number;
  lastActive: string | null;
  currentLessonId: string | null;
  moduleExams: Record<string, ExamResult>;
  examAttempts: Record<string, ExamAttemptDay>;
}

export interface LevelTier {
  from: number;
  to: number;
  className: string;
}
