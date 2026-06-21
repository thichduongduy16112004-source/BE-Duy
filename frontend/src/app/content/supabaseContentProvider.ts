import type { ContentProvider } from "./contentProvider";
import { mockContentProvider, setContentProvider } from "./contentProvider";
import type { ContentQuestion, ContentUnit, StoryContent, StoryScene } from "./content.types";

type SupabaseTenantRow = {
  id: string;
  slug: string;
};

type SupabaseUnitRow = {
  id: string;
  legacy_id: string | null;
  title: string;
  era: string | null;
  description: string | null;
  order_index: number;
  theme: Record<string, string> | null;
};

type SupabaseLessonRow = {
  id: string;
  unit_id: string;
  legacy_id: string | null;
  title: string;
  type: "lesson" | "story" | "boss";
  xp: number;
  order_index: number;
};

type SupabaseQuestionRow = {
  id: string;
  unit_id: string | null;
  lesson_id: string | null;
  legacy_id: string | null;
  grade: string | null;
  prompt: string;
  options: string[];
  correct_option_index: number | null;
  explanation: string | null;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  scopes: ("lesson" | "arena" | "flashcard")[];
  status: "draft" | "published" | "archived";
};

type SupabaseStoryBlockRow = {
  lesson_id: string;
  block_type: "scene" | "decision";
  content: StoryScene | StoryContent["decision"];
  order_index: number;
};

type SupabaseContentCache = {
  units: ContentUnit[];
  questions: ContentQuestion[];
  stories: Record<string, StoryContent>;
};

const fallbackCache: SupabaseContentCache = {
  units: mockContentProvider.getUnits(),
  questions: mockContentProvider.getQuestions(),
  stories: Object.fromEntries(
    mockContentProvider
      .getUnits()
      .flatMap((unit) => unit.lessons)
      .map((lesson) => [lesson.id, mockContentProvider.getStoryByLessonId(lesson.id)])
      .filter((entry): entry is [string, StoryContent] => Boolean(entry[1])),
  ),
};

let cache: SupabaseContentCache = fallbackCache;

export const supabaseContentProvider: ContentProvider = {
  getUnits: () => cache.units,
  getQuestions: () => cache.questions,
  getStoryByLessonId: (lessonId) => cache.stories[lessonId] ?? null,
};

export async function initializeSupabaseContentProvider() {
  const config = readSupabaseConfig();
  if (!config) {
    setContentProvider(mockContentProvider);
    return { mode: "mock" as const, reason: "missing-env" };
  }

  try {
    cache = await loadSupabaseContent(config);
    setContentProvider(supabaseContentProvider);
    return { mode: "supabase" as const };
  } catch (error) {
    console.warn("[content] Supabase content load failed. Falling back to mock content.", error);
    cache = fallbackCache;
    setContentProvider(mockContentProvider);
    return { mode: "mock" as const, reason: "load-failed" };
  }
}

async function loadSupabaseContent(config: SupabaseConfig): Promise<SupabaseContentCache> {
  const tenantRows = await supabaseFetch<SupabaseTenantRow[]>(
    config,
    `/tenants?select=id,slug&slug=eq.${encodeURIComponent(config.tenantSlug)}&status=eq.active&limit=1`,
  );
  const tenant = tenantRows[0];
  if (!tenant) throw new Error(`Tenant not found: ${config.tenantSlug}`);

  const tenantFilter = `tenant_id=eq.${tenant.id}`;
  const [unitRows, lessonRows, questionRows, storyBlockRows] = await Promise.all([
    supabaseFetch<SupabaseUnitRow[]>(
      config,
      `/units?select=id,legacy_id,title,era,description,order_index,theme&${tenantFilter}&status=eq.published&order=order_index.asc`,
    ),
    supabaseFetch<SupabaseLessonRow[]>(
      config,
      `/lessons?select=id,unit_id,legacy_id,title,type,xp,order_index&${tenantFilter}&status=eq.published&order=order_index.asc`,
    ),
    supabaseFetch<SupabaseQuestionRow[]>(
      config,
      `/questions?select=id,unit_id,lesson_id,legacy_id,grade,prompt,options,correct_option_index,explanation,difficulty,tags,scopes,status&${tenantFilter}&status=eq.published`,
    ),
    supabaseFetch<SupabaseStoryBlockRow[]>(
      config,
      `/story_blocks?select=lesson_id,block_type,content,order_index&${tenantFilter}&status=eq.published&order=order_index.asc`,
    ),
  ]);

  const unitsById = new Map(unitRows.map((unit) => [unit.id, unit]));
  const lessonsById = new Map(lessonRows.map((lesson) => [lesson.id, lesson]));
  const units = unitRows.map((unit) => toContentUnit(unit, lessonRows.filter((lesson) => lesson.unit_id === unit.id)));
  const questions = questionRows
    .filter((question) => question.unit_id && question.lesson_id)
    .map((question) => toContentQuestion(config.tenantSlug, question, unitsById, lessonsById));
  const stories = toStoryContentMap(config.tenantSlug, storyBlockRows, unitsById, lessonsById);

  return { units, questions, stories };
}

function toContentUnit(unit: SupabaseUnitRow, lessons: SupabaseLessonRow[]): ContentUnit {
  const theme = unit.theme ?? {};

  return {
    id: unit.legacy_id ?? unit.id,
    title: unit.title,
    era: unit.era ?? "",
    color: theme.color ?? "from-amber-700 to-orange-800",
    accent: theme.accent ?? "#d97706",
    accentGlow: theme.accentGlow ?? "#f59e0b",
    artEmoji: theme.artEmoji ?? "📜",
    bgFrom: theme.bgFrom ?? "#2d1400",
    bgTo: theme.bgTo ?? "#1a0c00",
    description: unit.description ?? "",
    lessons: lessons
      .sort((a, b) => a.order_index - b.order_index)
      .map((lesson) => ({
        id: lesson.legacy_id ?? lesson.id,
        title: lesson.title,
        xp: lesson.xp,
        type: lesson.type,
      })),
  };
}

function toContentQuestion(
  tenantId: string,
  question: SupabaseQuestionRow,
  unitsById: Map<string, SupabaseUnitRow>,
  lessonsById: Map<string, SupabaseLessonRow>,
): ContentQuestion {
  const unit = question.unit_id ? unitsById.get(question.unit_id) : null;
  const lesson = question.lesson_id ? lessonsById.get(question.lesson_id) : null;

  return {
    id: question.legacy_id ?? question.id,
    tenantId,
    unitId: unit?.legacy_id ?? question.unit_id ?? "",
    lessonId: lesson?.legacy_id ?? question.lesson_id ?? "",
    grade: question.grade ?? "",
    prompt: question.prompt,
    options: question.options,
    correctOptionIndex: question.correct_option_index ?? 0,
    explanation: question.explanation ?? "",
    difficulty: question.difficulty,
    tags: question.tags ?? [],
    scopes: question.scopes ?? ["lesson"],
    status: question.status === "archived" ? "draft" : question.status,
  };
}

function toStoryContentMap(
  tenantId: string,
  blocks: SupabaseStoryBlockRow[],
  unitsById: Map<string, SupabaseUnitRow>,
  lessonsById: Map<string, SupabaseLessonRow>,
) {
  const stories: Record<string, StoryContent> = {};
  const blocksByLesson = new Map<string, SupabaseStoryBlockRow[]>();

  for (const block of blocks) {
    const existing = blocksByLesson.get(block.lesson_id) ?? [];
    existing.push(block);
    blocksByLesson.set(block.lesson_id, existing);
  }

  for (const [lessonUuid, lessonBlocks] of blocksByLesson) {
    const lesson = lessonsById.get(lessonUuid);
    if (!lesson) continue;

    const unit = unitsById.get(lesson.unit_id);
    const theme = unit?.theme ?? {};
    const lessonId = lesson.legacy_id ?? lesson.id;
    const sortedBlocks = lessonBlocks.sort((a, b) => a.order_index - b.order_index);
    const scenes = sortedBlocks
      .filter((block) => block.block_type === "scene")
      .map((block) => block.content as StoryScene);
    const decision = sortedBlocks.find((block) => block.block_type === "decision")?.content as StoryContent["decision"] | undefined;

    stories[lessonId] = {
      lessonId,
      tenantId,
      title: lesson.title,
      era: unit?.era ?? "",
      backdrop: { from: theme.bgFrom ?? "#2d1400", to: theme.bgTo ?? "#1a0c00" },
      artEmoji: theme.artEmoji ?? "📜",
      scenes,
      decision,
      status: "published",
    };
  }

  return stories;
}

type SupabaseConfig = {
  url: string;
  anonKey: string;
  tenantSlug: string;
};

function readSupabaseConfig(): SupabaseConfig | null {
  const env = import.meta.env as Record<string, string | undefined>;
  const url = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  const tenantSlug = env.VITE_HISTORY_ALIVE_TENANT_SLUG ?? "ha-tenant";

  if (!url || !anonKey) return null;
  return { url: url.replace(/\/$/, ""), anonKey, tenantSlug };
}

async function supabaseFetch<T>(config: SupabaseConfig, path: string): Promise<T> {
  const response = await fetch(`${config.url}/rest/v1${path}`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed ${response.status}: ${detail}`);
  }

  return response.json() as Promise<T>;
}
