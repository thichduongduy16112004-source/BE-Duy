import type { ContentLesson, ContentUnit, LessonKind } from "./content.types";
import type { PublishedLessonDataset, PublishedLessonNode, PublishedLessonTopic } from "./publishedLessonApi";

const NODE_SIZE = 5;
const PUBLISHED_PALETTE = [
  { color: "#b45309", accent: "#f59e0b", accentGlow: "rgba(245,158,11,0.38)", bgFrom: "#4a2c0a", bgTo: "#2d1400" },
  { color: "#be123c", accent: "#fb7185", accentGlow: "rgba(251,113,133,0.35)", bgFrom: "#5c1a1a", bgTo: "#2d0b0b" },
  { color: "#047857", accent: "#34d399", accentGlow: "rgba(52,211,153,0.32)", bgFrom: "#123d2e", bgTo: "#071f18" },
  { color: "#1d4ed8", accent: "#60a5fa", accentGlow: "rgba(96,165,250,0.32)", bgFrom: "#172554", bgTo: "#0b112f" },
] as const;

export function mapPublishedDatasetToUnits(dataset: PublishedLessonDataset): ContentUnit[] {
  return (dataset.topics ?? []).map((topic, index) => mapTopicToUnit(topic, index));
}

function mapTopicToUnit(topic: PublishedLessonTopic, index: number): ContentUnit {
  const unitNumber = index + 5;
  const originalUnitId = String(topic.unitId || `u${topic.id}`);
  const palette = getPalette(topic.color, index);
  const lessons = mapTopicLessons(topic, originalUnitId);

  return {
    id: `published-${originalUnitId}`,
    originalUnitId,
    source: "published",
    title: topic.title || topic.name || `Chương ${unitNumber}`,
    era: topic.name || datasetEra(unitNumber),
    color: topic.color || palette.color,
    accent: palette.accent,
    accentGlow: palette.accentGlow,
    artEmoji: topic.icon || "📚",
    bgFrom: palette.bgFrom,
    bgTo: palette.bgTo,
    description: topic.name || `Nội dung import từ Admin · Chương ${unitNumber}`,
    backgroundImage: topic.backgroundImage,
    lessons,
  };
}

function mapTopicLessons(topic: PublishedLessonTopic, originalUnitId: string): ContentLesson[] {
  const nodes = topic.lessonNodes?.length ? topic.lessonNodes : buildFallbackNodes(originalUnitId, topic.questions?.length ?? NODE_SIZE);
  return nodes.map((node, index) => ({
    id: node.id || `${originalUnitId}-l${index + 1}`,
    title: node.title || `Bài ${index + 1}`,
    xp: getLessonXp(node, index),
    type: getLessonKind(node, index, nodes.length),
  }));
}

function buildFallbackNodes(originalUnitId: string, questionCount: number): PublishedLessonNode[] {
  const safeQuestionCount = Math.max(questionCount, NODE_SIZE);
  const nodeCount = Math.ceil(safeQuestionCount / NODE_SIZE);

  return Array.from({ length: nodeCount }, (_, index) => ({
    id: `${originalUnitId}-l${index + 1}`,
    title: `Bài ${index + 1}`,
    questionStart: index * NODE_SIZE,
    questionCount: Math.min(NODE_SIZE, safeQuestionCount - index * NODE_SIZE),
  }));
}

function getLessonKind(node: PublishedLessonNode, index: number, total: number): LessonKind {
  if (node.type === "story" || node.type === "boss" || node.type === "review" || node.type === "practice") {
    return node.type;
  }

  if (index === total - 1 && total > 1) return "review";
  return "lesson";
}

function getLessonXp(node: PublishedLessonNode, index: number) {
  if (typeof node.xp === "number") {
    return node.xp;
  }
  const questionCount = node.questionCount ?? NODE_SIZE;
  return Math.max(10, Math.min(80, questionCount * 10 + index * 2));
}

function getPalette(topicColor: string | undefined, index: number) {
  const fallback = PUBLISHED_PALETTE[index % PUBLISHED_PALETTE.length];
  if (!topicColor) return fallback;

  return {
    ...fallback,
    color: topicColor,
    accent: topicColor,
    accentGlow: `${topicColor}55`,
  };
}

function datasetEra(unitNumber: number) {
  return `Chương ${unitNumber}`;
}
