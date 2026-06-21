import type { ContentQuestion, ContentUnit, StoryContent } from "./content.types";
import { CONTENT_UNITS, QUESTION_BANK, STORY_CONTENT } from "./mockContent";

export type ContentProvider = {
  getUnits: () => ContentUnit[];
  getQuestions: () => ContentQuestion[];
  getStoryByLessonId: (lessonId: string) => StoryContent | null;
};

export const mockContentProvider: ContentProvider = {
  getUnits: () => CONTENT_UNITS,
  getQuestions: () => QUESTION_BANK,
  getStoryByLessonId: (lessonId) => STORY_CONTENT[lessonId] ?? null,
};

let activeContentProvider: ContentProvider = mockContentProvider;

export function setContentProvider(provider: ContentProvider) {
  activeContentProvider = provider;
}

export function getContentProvider() {
  return activeContentProvider;
}
