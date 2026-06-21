import type { ArenaQuestion, ArenaQuestionFilter, ContentQuestion, LessonQuizQuestion } from "./content.types";
import { getContentProvider } from "./contentProvider";
import { DEFAULT_TENANT_ID } from "./mockContent";

const getPublishedQuestions = () => getContentProvider().getQuestions().filter((question) => question.status === "published");

export function getAllUnits() {
  return getContentProvider().getUnits();
}

export function getLessonById(id: string) {
  for (const unit of getAllUnits()) {
    const lesson = unit.lessons.find((item) => item.id === id);
    if (lesson) return { ...lesson, unit };
  }

  return null;
}

export function getStoryByLessonId(lessonId: string) {
  const story = getContentProvider().getStoryByLessonId(lessonId);
  if (!story || story.status !== "published") return null;

  return story;
}

export function getQuestionsForLesson(lessonId: string): LessonQuizQuestion[] {
  const lesson = getLessonById(lessonId);
  const publishedQuestions = getPublishedQuestions();
  const lessonQuestions = publishedQuestions.filter(
    (question) => question.lessonId === lessonId && question.scopes.includes("lesson"),
  );

  const questions = lessonQuestions.length > 0 ? lessonQuestions : getFallbackLessonQuestions(lesson?.unit.id);

  return questions.map(toLessonQuizQuestion);
}

export function getArenaQuestions(filter: ArenaQuestionFilter = {}): ArenaQuestion[] {
  const tenantId = filter.tenantId ?? DEFAULT_TENANT_ID;
  const limit = filter.limit ?? 5;
  const completedLessonIds = filter.completedLessonIds ?? [];
  const publishedQuestions = getPublishedQuestions();

  let questions = publishedQuestions.filter(
    (question) => question.tenantId === tenantId && question.scopes.includes("arena"),
  );

  if (filter.unitId) {
    questions = questions.filter((question) => question.unitId === filter.unitId);
  }

  if (filter.grade) {
    const sameGrade = questions.filter((question) => question.grade === filter.grade);
    if (sameGrade.length >= limit) questions = sameGrade;
  }

  if (completedLessonIds.length > 0) {
    const reviewQuestions = questions.filter((question) => completedLessonIds.includes(question.lessonId));
    if (reviewQuestions.length >= Math.min(2, limit)) questions = reviewQuestions;
  }

  return shuffleQuestions(questions).slice(0, limit).map(toArenaQuestion);
}

export function getQuestionBankSummary() {
  const publishedQuestions = getPublishedQuestions();

  return {
    tenantId: DEFAULT_TENANT_ID,
    totalPublished: publishedQuestions.length,
    arenaReady: publishedQuestions.filter((question) => question.scopes.includes("arena")).length,
    lessonReady: publishedQuestions.filter((question) => question.scopes.includes("lesson")).length,
  };
}

function getFallbackLessonQuestions(unitId?: string): ContentQuestion[] {
  const publishedQuestions = getPublishedQuestions();
  const sameUnit = unitId ? publishedQuestions.filter((question) => question.unitId === unitId) : [];
  return (sameUnit.length > 0 ? sameUnit : publishedQuestions).slice(0, 5);
}

function toLessonQuizQuestion(question: ContentQuestion): LessonQuizQuestion {
  return {
    id: question.id,
    q: question.prompt,
    options: question.options,
    answer: question.correctOptionIndex,
    explanation: question.explanation,
  };
}

function toArenaQuestion(question: ContentQuestion): ArenaQuestion {
  return {
    id: question.id,
    q: question.prompt,
    opts: question.options,
    ans: question.correctOptionIndex,
    lessonId: question.lessonId,
    unitId: question.unitId,
    explanation: question.explanation,
  };
}

function shuffleQuestions<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
