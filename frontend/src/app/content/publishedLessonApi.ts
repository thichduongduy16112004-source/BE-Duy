export type PublishedLessonNode = {
  id?: string;
  title?: string;
  type?: string;
  questionStart?: number;
  questionCount?: number;
};

export type PublishedLessonQuestion = {
  id?: string | number;
};

export type PublishedLessonTopic = {
  id: string | number;
  unitId?: string;
  name?: string;
  title?: string;
  icon?: string;
  color?: string;
  backgroundImage?: string;
  lessonNodes?: PublishedLessonNode[];
  questions?: PublishedLessonQuestion[];
};

export type PublishedLessonDataset = {
  title?: string;
  subtitle?: string;
  topics?: PublishedLessonTopic[];
};

const LESSON_CONTENT_PUBLIC_URL = "http://localhost:8000/api/v1/lesson-content/public";

export async function fetchPublishedLessonDataset(signal?: AbortSignal): Promise<PublishedLessonDataset | null> {
  try {
    const response = await fetch(LESSON_CONTENT_PUBLIC_URL, { signal });

    if (!response.ok) {
      return null;
    }

    const dataset = (await response.json()) as PublishedLessonDataset;
    return Array.isArray(dataset.topics) ? dataset : null;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return null;
    }

    return null;
  }
}
