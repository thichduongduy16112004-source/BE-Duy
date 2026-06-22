export type QuizQuestion = Record<string, unknown> & {
  id?: string | number;
  globalId?: string | number;
  type?: string;
  question?: string;
  text?: string;
  title?: string;
  answer?: unknown;
  explanation?: string;
  unitId?: string;
  lessonId?: string;
};

export type LessonNode = {
  id: string;
  title: string;
  questionStart: number;
  questionCount: number;
};

export type QuizTopic = {
  id: string | number;
  unitId?: string;
  name?: string;
  title?: string;
  icon?: string;
  color?: string;
  backgroundImage?: string;
  lessonNodes?: LessonNode[];
  questions?: QuizQuestion[];
};

export type QuizDataset = {
  title?: string;
  subtitle?: string;
  totalQuestions?: number;
  topics?: QuizTopic[];
};

export type ChapterModel = {
  unitId: string;
  topicId: string | number;
  name: string;
  title: string;
  topic: QuizTopic;
  nodes: LessonNode[];
  questions: QuizQuestion[];
  questionCount: number;
};

export type ValidationIssue = {
  tone: 'error' | 'warning';
  message: string;
};

const MIN_NODE_SIZE = 5;
const MAX_NODE_SIZE = 10;

export function unitIdFromTopic(topicId: string | number) {
  const text = String(topicId).trim();
  return text.startsWith('u') ? text : `u${text}`;
}

export function compareNatural(a: string, b: string) {
  return a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' });
}

export function asText(value: unknown) {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value === 'string') {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  return JSON.stringify(value);
}

export function getQuestionTitle(question: QuizQuestion) {
  return asText(question.question || question.text || question.title || `Câu hỏi ${question.id ?? question.globalId ?? ''}`);
}

export function getQuestionType(question: QuizQuestion) {
  return String(question.type || 'multiple_choice');
}

export function extractDatasetText(rawText: string) {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error('File hoặc nội dung JSON đang trống.');
  }

  if (trimmed.startsWith('{')) {
    return trimmed;
  }

  const assignmentIndex = trimmed.search(/(?:let|const|var)\s+QUIZ_DATA\s*=/);
  if (assignmentIndex === -1) {
    return trimmed;
  }

  const start = trimmed.indexOf('{', assignmentIndex);
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Không tìm thấy object QUIZ_DATA trong file.');
  }
  return trimmed.slice(start, end + 1);
}

export function parseLessonDataset(rawText: string): QuizDataset {
  const datasetText = extractDatasetText(rawText);
  try {
    return validateDataset(JSON.parse(datasetText));
  } catch (jsonError) {
    try {
      return validateDataset(Function(`"use strict"; return (${datasetText});`)());
    } catch {
      throw jsonError instanceof Error ? jsonError : new Error('Không thể parse dataset.');
    }
  }
}

export function validateDataset(value: unknown): QuizDataset {
  if (!value || typeof value !== 'object') {
    throw new Error('Dataset phải là object.');
  }
  const dataset = value as QuizDataset;
  if (!Array.isArray(dataset.topics)) {
    throw new Error('Dataset phải có trường topics dạng mảng.');
  }
  return dataset;
}

export function buildDefaultNodes(unitId: string, questionCount: number, preferredSize = MIN_NODE_SIZE): LessonNode[] {
  const size = clampNodeSize(preferredSize);
  const nodes: LessonNode[] = [];
  for (let start = 0; start < questionCount; start += size) {
    const nodeIndex = nodes.length + 1;
    nodes.push({
      id: `${unitId}-l${nodeIndex}`,
      title: `Node ${nodeIndex}`,
      questionStart: start,
      questionCount: Math.min(size, questionCount - start),
    });
  }
  return nodes;
}

export function normalizeTopic(topic: QuizTopic): QuizTopic {
  const unitId = topic.unitId || unitIdFromTopic(topic.id);
  const questions = topic.questions || [];
  const nodes = topic.lessonNodes?.length ? topic.lessonNodes : buildDefaultNodes(unitId, questions.length);
  return {
    ...topic,
    unitId,
    lessonNodes: normalizeNodes(unitId, questions.length, nodes),
    questions: questions.map((question, index) => ({
      ...question,
      unitId: question.unitId || unitId,
      lessonId: getNodeForQuestion(index, nodes)?.id || question.lessonId || `${unitId}-l${Math.floor(index / MIN_NODE_SIZE) + 1}`,
    })),
  };
}

export function normalizeDataset(dataset: QuizDataset): QuizDataset {
  const topics = (dataset.topics || []).map(normalizeTopic);
  return {
    ...dataset,
    topics,
    totalQuestions: topics.reduce((total, topic) => total + (topic.questions?.length || 0), 0),
  };
}

export function buildChapters(dataset: QuizDataset | null): ChapterModel[] {
  if (!dataset?.topics?.length) {
    return [];
  }
  return dataset.topics.map((rawTopic) => {
    const topic = normalizeTopic(rawTopic);
    return {
      unitId: topic.unitId || unitIdFromTopic(topic.id),
      topicId: topic.id,
      name: topic.name || `Chương ${topic.id}`,
      title: topic.title || 'Chưa đặt tên chương',
      topic,
      nodes: topic.lessonNodes || [],
      questions: topic.questions || [],
      questionCount: topic.questions?.length || 0,
    };
  }).sort((a, b) => compareNatural(a.unitId, b.unitId));
}

export function updateNodeSize(topic: QuizTopic, nodeId: string, nextSize: number): QuizTopic {
  const unitId = topic.unitId || unitIdFromTopic(topic.id);
  const questions = topic.questions || [];
  const currentNodes = normalizeNodes(unitId, questions.length, topic.lessonNodes || buildDefaultNodes(unitId, questions.length));
  const nodeIndex = currentNodes.findIndex((node) => node.id === nodeId);
  if (nodeIndex === -1) {
    return normalizeTopic(topic);
  }

  const resized = currentNodes.map((node, index) => index === nodeIndex ? { ...node, questionCount: clampNodeSize(nextSize) } : node);
  const normalized = normalizeNodes(unitId, questions.length, resized);
  return normalizeTopic({ ...topic, unitId, lessonNodes: normalized });
}

export function replaceTopic(dataset: QuizDataset, nextTopic: QuizTopic): QuizDataset {
  const nextTopics = (dataset.topics || []).map((topic) => String(topic.id) === String(nextTopic.id) ? normalizeTopic(nextTopic) : topic);
  return normalizeDataset({ ...dataset, topics: nextTopics });
}

export function topicExists(dataset: QuizDataset, topicId: string | number) {
  const targetId = String(topicId).trim();
  const targetUnitId = unitIdFromTopic(targetId);
  return (dataset.topics || []).some((topic) => {
    const topicUnitId = topic.unitId || unitIdFromTopic(topic.id);
    return String(topic.id) === targetId || topicUnitId === targetUnitId;
  });
}

export function addTopic(dataset: QuizDataset, topic: QuizTopic): QuizDataset {
  const topicId = String(topic.id || topic.unitId || '').trim();
  if (!topicId) {
    throw new Error('Chương mới cần có id hoặc unitId.');
  }
  if (topicExists(dataset, topicId)) {
    throw new Error(`Chương ${unitIdFromTopic(topicId)} đã tồn tại. Hãy dùng Update chương hoặc chọn ID khác.`);
  }

  const nextTopic = normalizeTopic({ ...topic, id: topic.id || topicId });
  return normalizeDataset({ ...dataset, topics: [...(dataset.topics || []), nextTopic] });
}

export function updateChapterBackground(topic: QuizTopic, backgroundImage: string): QuizTopic {
  const normalizedImage = backgroundImage.trim();
  return normalizeTopic({ ...topic, backgroundImage: normalizedImage || undefined });
}

export function getQuestionKey(question: QuizQuestion, index: number) {
  return String(question.globalId ?? question.id ?? `${question.unitId || 'question'}-${question.lessonId || 'node'}-${index}`);
}

export function formatQuestionJson(question: QuizQuestion) {
  return JSON.stringify(question, null, 2);
}

export function parseQuestionJson(text: string): QuizQuestion {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('JSON câu hỏi phải là object.');
    }
    return parsed as QuizQuestion;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`JSON không hợp lệ: ${error.message}`);
    }
    throw error instanceof Error ? error : new Error('Không thể đọc JSON câu hỏi.');
  }
}

export function updateQuestionInTopic(topic: QuizTopic, questionIndex: number, nextQuestion: QuizQuestion): QuizTopic {
  const questions = [...(topic.questions || [])];
  if (questionIndex < 0 || questionIndex >= questions.length) {
    throw new Error('Không tìm thấy câu hỏi cần cập nhật trong chương này.');
  }
  questions[questionIndex] = { ...questions[questionIndex], ...nextQuestion };
  return normalizeTopic({ ...topic, questions });
}

export function validateChapter(chapter: ChapterModel | null): ValidationIssue[] {
  if (!chapter) {
    return [{ tone: 'warning', message: 'Chưa chọn chương để kiểm tra.' }];
  }
  const issues: ValidationIssue[] = [];
  if (chapter.nodes.length === 0) {
    issues.push({ tone: 'error', message: 'Chương chưa có lessonNodes.' });
  }
  chapter.nodes.forEach((node) => {
    if (node.questionCount < MIN_NODE_SIZE && chapter.questionCount >= MIN_NODE_SIZE) {
      issues.push({ tone: 'warning', message: `${node.id} có dưới ${MIN_NODE_SIZE} câu.` });
    }
    if (node.questionCount > MAX_NODE_SIZE) {
      issues.push({ tone: 'error', message: `${node.id} vượt quá ${MAX_NODE_SIZE} câu.` });
    }
  });
  const covered = chapter.nodes.reduce((total, node) => total + node.questionCount, 0);
  if (covered !== chapter.questionCount) {
    issues.push({ tone: 'error', message: `Node đang phủ ${covered}/${chapter.questionCount} câu.` });
  }
  return issues;
}

export function nodeQuestions(questions: QuizQuestion[], node: LessonNode) {
  return questions.slice(node.questionStart, node.questionStart + node.questionCount);
}

function clampNodeSize(size: number) {
  return Math.max(MIN_NODE_SIZE, Math.min(MAX_NODE_SIZE, Math.round(size || MIN_NODE_SIZE)));
}

function normalizeNodes(unitId: string, questionCount: number, nodes: LessonNode[]) {
  const normalized: LessonNode[] = [];
  let cursor = 0;
  nodes.forEach((node, index) => {
    if (cursor >= questionCount) {
      return;
    }
    const remaining = questionCount - cursor;
    normalized.push({
      id: node.id || `${unitId}-l${index + 1}`,
      title: node.title || `Node ${index + 1}`,
      questionStart: cursor,
      questionCount: Math.min(clampNodeSize(node.questionCount), remaining),
    });
    cursor += normalized[normalized.length - 1].questionCount;
  });

  while (cursor < questionCount) {
    const index = normalized.length + 1;
    normalized.push({
      id: `${unitId}-l${index}`,
      title: `Node ${index}`,
      questionStart: cursor,
      questionCount: Math.min(MIN_NODE_SIZE, questionCount - cursor),
    });
    cursor += normalized[normalized.length - 1].questionCount;
  }
  return normalized;
}

function getNodeForQuestion(index: number, nodes: LessonNode[]) {
  return nodes.find((node) => index >= node.questionStart && index < node.questionStart + node.questionCount);
}
