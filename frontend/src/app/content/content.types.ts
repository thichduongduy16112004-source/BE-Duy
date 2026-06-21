export type LessonKind = "lesson" | "story" | "boss" | "review" | "practice";

export type ContentLesson = {
  id: string;
  title: string;
  xp: number;
  type: LessonKind;
};

export type ContentUnit = {
  id: string;
  title: string;
  era: string;
  color: string;
  accent: string;
  accentGlow: string;
  artEmoji: string;
  bgFrom: string;
  bgTo: string;
  description: string;
  lessons: ContentLesson[];
};

export type QuestionDifficulty = "easy" | "medium" | "hard";

export type QuestionScope = "lesson" | "arena" | "flashcard";

export type ContentQuestion = {
  id: string;
  tenantId: string;
  unitId: string;
  lessonId: string;
  grade: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: QuestionDifficulty;
  tags: string[];
  scopes: QuestionScope[];
  status: "draft" | "published";
};

export type ArenaQuestion = {
  id: string;
  q: string;
  opts: string[];
  ans: number;
  lessonId: string;
  unitId: string;
  explanation: string;
};

export type LessonQuizQuestion = {
  id: string;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type ArenaQuestionFilter = {
  tenantId?: string;
  grade?: string;
  completedLessonIds?: string[];
  unitId?: string;
  limit?: number;
};

export type StoryScene = {
  character: string;
  characterTitle: string;
  avatar: string;
  side: "left" | "right";
  lines: string[];
};

export type StoryDecisionChoice = {
  text: string;
  outcome: string;
  isHistorical: boolean;
};

export type StoryContent = {
  lessonId: string;
  tenantId: string;
  title: string;
  era: string;
  backdrop: { from: string; to: string };
  artEmoji: string;
  scenes: StoryScene[];
  decision?: {
    question: string;
    choices: StoryDecisionChoice[];
  };
  status: "draft" | "published";
};
