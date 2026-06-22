import {
  BookMarked,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  FileJson,
  ImageUp,
  Layers3,
  Rocket,
  Save,
  Search,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Feedback } from '../components/Feedback';
import { apiService } from '../services/apiService';
import { assetCatalogUrl, lessonAssetCatalog } from '../services/lessonAssetCatalog';
import {
  addTopic,
  asText,
  buildChapters,
  formatQuestionJson,
  getQuestionKey,
  getQuestionTitle,
  getQuestionType,
  nodeQuestions,
  normalizeDataset,
  parseLessonDataset,
  parseQuestionJson,
  replaceTopic,
  updateChapterBackground,
  updateNodeSize,
  updateQuestionInTopic,
  validateChapter,
} from '../services/lessonDataAdapter';
import type { ChapterModel, LessonNode, QuizDataset, QuizQuestion, QuizTopic } from '../services/lessonDataAdapter';
import type { LessonAsset, LessonContentDocument, LessonContentSummary } from '../services/apiService';

type SortMode = 'unit' | 'questions-desc' | 'questions-asc';
type ChapterActionMode = 'update' | 'create';
type Operation = 'idle' | 'loading-status' | 'preview' | 'import' | 'save-topic' | 'save-question' | 'publish' | 'upload' | 'upload-background' | 'create-topic' | 'delete-topic';

const questionTypes = ['all', 'multiple_choice', 'matching', 'fill_blank', 'true_false', 'essay'];

function datasetSummary(dataset: QuizDataset): LessonContentSummary {
  const chapters = buildChapters(dataset);
  return {
    title: dataset.title || 'Lesson dataset',
    subtitle: dataset.subtitle,
    topic_count: chapters.length,
    totalQuestions: chapters.reduce((total, chapter) => total + chapter.questionCount, 0),
    topics: chapters.map((chapter) => ({
      id: chapter.topicId,
      unitId: chapter.unitId,
      name: chapter.name,
      title: chapter.title,
      question_count: chapter.questionCount,
    })),
  };
}

function documentDataset(doc: LessonContentDocument | null): QuizDataset | null {
  return doc?.dataset as QuizDataset | null;
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function downloadJson(filename: string, dataset: Record<string, unknown>) {
  const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function absoluteAssetUrl(url: string) {
  if (!url) return '';
  return url.startsWith('http') ? url : `http://localhost:8000${url}`;
}

function previewImageUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('/assets/')) return `http://localhost:5173${url}`;
  return absoluteAssetUrl(url);
}

function assetKey(unitId: string, lessonId: string) {
  return `${unitId}:${lessonId}`;
}

function getLessonAssetUrl(assets: LessonAsset[], unitId: string, lessonId: string) {
  const asset = assets.find((item) => item.unitId === unitId && item.lessonId === lessonId);
  return asset ? absoluteAssetUrl(asset.url) : '';
}

function filterChapters(chapters: ChapterModel[], search: string, typeFilter: string, sortMode: SortMode) {
  const query = search.trim().toLowerCase();
  const filtered = chapters.filter((chapter) => {
    const hasType = typeFilter === 'all' || chapter.questions.some((question) => getQuestionType(question) === typeFilter);
    const haystack = [
      chapter.unitId,
      chapter.name,
      chapter.title,
      ...chapter.nodes.map((node) => `${node.id} ${node.title}`),
      ...chapter.questions.map((question) => `${getQuestionTitle(question)} ${asText(question.explanation)}`),
    ].join(' ').toLowerCase();
    return hasType && (!query || haystack.includes(query));
  });

  if (sortMode === 'questions-desc') return filtered.sort((a, b) => b.questionCount - a.questionCount);
  if (sortMode === 'questions-asc') return filtered.sort((a, b) => a.questionCount - b.questionCount);
  return filtered.sort((a, b) => a.unitId.localeCompare(b.unitId, 'vi', { numeric: true }));
}

function countQuestionTypes(chapters: ChapterModel[]) {
  return chapters.reduce<Record<string, number>>((counts, chapter) => {
    chapter.questions.forEach((question) => {
      const type = getQuestionType(question);
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, {});
}

export default function LessonsPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [rawText, setRawText] = useState('');
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(null);
  const [dataset, setDataset] = useState<QuizDataset | null>(null);
  const [summary, setSummary] = useState<LessonContentSummary | null>(null);
  const [draftDoc, setDraftDoc] = useState<LessonContentDocument | null>(null);
  const [publishedDoc, setPublishedDoc] = useState<LessonContentDocument | null>(null);
  const [operation, setOperation] = useState<Operation>('idle');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('unit');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [uploadedAssetUrl, setUploadedAssetUrl] = useState('');
  const [backgroundDraftUrl, setBackgroundDraftUrl] = useState('');
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [lessonAssets, setLessonAssets] = useState<LessonAsset[]>([]);
  const [editingQuestionKey, setEditingQuestionKey] = useState('');
  const [questionDraftText, setQuestionDraftText] = useState('');
  const [questionDraftAnswer, setQuestionDraftAnswer] = useState('');
  const [questionDraftExplanation, setQuestionDraftExplanation] = useState('');
  const [questionDraftType, setQuestionDraftType] = useState('multiple_choice');
  const [questionDraftJson, setQuestionDraftJson] = useState('');
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [publishConfirmError, setPublishConfirmError] = useState('');
  const [deleteConfirmChapter, setDeleteConfirmChapter] = useState<ChapterModel | null>(null);
  const [chapterActionMode, setChapterActionMode] = useState<ChapterActionMode>('update');
  const [newChapterId, setNewChapterId] = useState('');
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterJson, setNewChapterJson] = useState('');

  const activeDataset = dataset || documentDataset(draftDoc) || documentDataset(publishedDoc);
  const chapters = useMemo(() => buildChapters(activeDataset), [activeDataset]);
  const visibleChapters = useMemo(() => filterChapters(chapters, search, typeFilter, sortMode), [chapters, search, typeFilter, sortMode]);
  const typeCounts = useMemo(() => countQuestionTypes(chapters), [chapters]);
  const selectedChapter = useMemo(
    () => chapters.find((chapter) => chapter.unitId === selectedChapterId) || chapters[0] || null,
    [chapters, selectedChapterId],
  );
  const selectedNode = useMemo(
    () => selectedChapter?.nodes.find((node) => node.id === selectedNodeId) || selectedChapter?.nodes[0] || null,
    [selectedChapter, selectedNodeId],
  );
  const selectedQuestions = selectedChapter && selectedNode ? nodeQuestions(selectedChapter.questions, selectedNode) : [];
  const selectedAssetUrl = selectedChapter && selectedNode
    ? uploadedAssetUrl || getLessonAssetUrl(lessonAssets, selectedChapter.unitId, selectedNode.id)
    : '';
  const selectedBackgroundUrl = selectedChapter ? backgroundDraftUrl || selectedChapter.topic.backgroundImage || '' : '';
  const selectedBackgroundPreviewUrl = previewImageUrl(selectedBackgroundUrl);
  const chapterIssues = validateChapter(selectedChapter);
  const totalNodes = chapters.reduce((total, chapter) => total + chapter.nodes.length, 0);
  const totalQuestions = chapters.reduce((total, chapter) => total + chapter.questionCount, 0);
  const isBusy = operation !== 'idle';
  const modalDatasetTitle = summary?.title || activeDataset?.title || 'Chưa rõ';
  const modalTopicCount = summary?.topic_count ?? chapters.length;
  const modalTotalQuestions = summary?.totalQuestions ?? totalQuestions;

  useEffect(() => {
    void loadContentStatus();
  }, []);

  useEffect(() => {
    if (!selectedChapter && chapters[0]) {
      setSelectedChapterId(chapters[0].unitId);
      setExpandedChapters(new Set([chapters[0].unitId]));
    }
  }, [chapters, selectedChapter]);

  useEffect(() => {
    if (selectedChapter && (!selectedNodeId || !selectedChapter.nodes.some((node) => node.id === selectedNodeId))) {
      setSelectedNodeId(selectedChapter.nodes[0]?.id || '');
    }
  }, [selectedChapter, selectedNodeId]);

  useEffect(() => {
    if (!isPublishConfirmOpen || operation === 'publish') return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsPublishConfirmOpen(false);
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isPublishConfirmOpen, operation]);

  async function loadContentStatus() {
    setOperation('loading-status');
    try {
      const [draft, published, assetsResponse] = await Promise.all([
        apiService.getLessonContentDraft().catch(() => null),
        apiService.getPublishedLessonContent().catch(() => null),
        apiService.listLessonAssets().catch(() => ({ assets: [] })),
      ]);
      setDraftDoc(draft);
      setPublishedDoc(published);
      setLessonAssets(assetsResponse.assets);
      const initialDataset = dataset || documentDataset(draft) || documentDataset(published);
      if (initialDataset) setSummary(datasetSummary(initialDataset));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải trạng thái lesson content.');
    } finally {
      setOperation('idle');
    }
  }

  function applyDataset(nextDataset: QuizDataset, nextMessage: string) {
    const normalized = normalizeDataset(nextDataset);
    const nextChapters = buildChapters(normalized);
    setDataset(normalized);
    setSummary(datasetSummary(normalized));
    setExpandedChapters(new Set(nextChapters.slice(0, 2).map((chapter) => chapter.unitId)));
    setSelectedChapterId(nextChapters[0]?.unitId || '');
    setSelectedNodeId(nextChapters[0]?.nodes[0]?.id || '');
    setUploadedAssetUrl('');
    setBackgroundFile(null);
    setBackgroundDraftUrl('');
    setMessage(nextMessage);
  }

  function applyRawDataset(text: string, meta?: { name: string; size: number }) {
    const parsed = parseLessonDataset(text);
    setRawText(text);
    setFileMeta(meta || null);
    applyDataset(parsed, 'Đã đọc data.js/JSON và tạo lessonNodes mặc định. Kiểm tra node trước khi import draft.');
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage('');
    setError('');
    try {
      const text = await file.text();
      applyRawDataset(text, { name: file.name, size: file.size });
    } catch (err) {
      setDataset(null);
      setSummary(null);
      setError(err instanceof Error ? err.message : 'Không thể đọc file.');
    } finally {
      event.target.value = '';
    }
  }

  function handlePastePreview() {
    setMessage('');
    setError('');
    try {
      applyRawDataset(rawText);
    } catch (err) {
      setDataset(null);
      setSummary(null);
      setError(err instanceof Error ? err.message : 'Không thể parse nội dung JSON.');
    }
  }

  function handleSelectChapter(chapter: ChapterModel) {
    setSelectedChapterId(chapter.unitId);
    setSelectedNodeId(chapter.nodes[0]?.id || '');
    setExpandedChapters((current) => new Set([...current, chapter.unitId]));
    setUploadedAssetUrl('');
    setBackgroundFile(null);
    setBackgroundDraftUrl(chapter.topic.backgroundImage || '');
  }

  function handleSelectNode(chapter: ChapterModel, node: LessonNode) {
    setSelectedChapterId(chapter.unitId);
    setSelectedNodeId(node.id);
    setUploadedAssetUrl('');
    setBackgroundFile(null);
    setBackgroundDraftUrl(chapter.topic.backgroundImage || '');
  }

  function resizeSelectedNode(nextSize: number) {
    if (!activeDataset || !selectedChapter || !selectedNode) return;
    const nextTopic = updateNodeSize(selectedChapter.topic, selectedNode.id, nextSize);
    const nextDataset = replaceTopic(activeDataset, nextTopic);
    applyDataset(nextDataset, `Đã đổi ${selectedNode.id} sang ${nextSize} câu và dồn lại các node sau.`);
  }

  function applyChapterBackground(backgroundImage: string, nextMessage: string) {
    if (!activeDataset || !selectedChapter) return;
    const nextTopic = updateChapterBackground(selectedChapter.topic, backgroundImage);
    const nextDataset = replaceTopic(activeDataset, nextTopic);
    const normalizedImage = nextTopic.backgroundImage || '';
    applyDataset(nextDataset, nextMessage);
    setSelectedChapterId(selectedChapter.unitId);
    setBackgroundDraftUrl(normalizedImage);
  }

  async function previewJson() {
    if (!activeDataset) {
      setError('Hãy chọn file data.js/JSON hoặc dùng draft hiện có trước.');
      return;
    }
    setOperation('preview');
    setMessage('');
    setError('');
    try {
      const response = await apiService.previewLessonContent(activeDataset as Record<string, unknown>, fileMeta?.name || 'lesson-content-preview.json');
      setSummary(response.summary);
      setMessage('Backend xác nhận dataset hợp lệ. Có thể import hoặc lưu chương.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể preview JSON.');
    } finally {
      setOperation('idle');
    }
  }

  async function importDraft() {
    if (!activeDataset) {
      setError('Chưa có dataset hợp lệ để import.');
      return;
    }
    setOperation('import');
    setMessage('');
    setError('');
    try {
      const response = await apiService.importLessonContentDraft(activeDataset as Record<string, unknown>, fileMeta?.name || 'lesson-content-import.json');
      setSummary(response.summary);
      setMessage(response.message);
      await loadContentStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể import draft.');
    } finally {
      setOperation('idle');
    }
  }

  async function saveChapter(chapter: ChapterModel) {
    setOperation('save-topic');
    setMessage('');
    setError('');
    try {
      const response = await apiService.patchLessonContentTopic(chapter.topic as Record<string, unknown>, `admin-${chapter.unitId}`);
      setSummary(response.summary);
      setMessage(`Đã update draft cho ${chapter.name}. Publish riêng khi muốn học sinh thấy thay đổi.`);
      setSelectedChapterId(chapter.unitId);
      setExpandedChapters((current) => new Set([...current, chapter.unitId]));
      await loadContentStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể update chương vào draft.');
    } finally {
      setOperation('idle');
    }
  }

  async function saveSelectedChapter() {
    if (!selectedChapter) {
      setError('Chưa chọn chương để update.');
      return;
    }
    await saveChapter(selectedChapter);
  }

  async function deleteChapter(chapter: ChapterModel) {
    setOperation('delete-topic');
    setMessage('');
    setError('');
    try {
      const response = await apiService.deleteLessonContentTopic(chapter.unitId);
      setSummary(response.summary);
      setMessage(`Đã xóa chương ${chapter.name} khỏi draft.`);
      
      if (selectedChapter?.unitId === chapter.unitId) {
        setSelectedChapterId('');
        setSelectedNodeId('');
      }
      
      await loadContentStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa chương.');
    } finally {
      setOperation('idle');
      setDeleteConfirmChapter(null);
    }
  }

  function buildNewChapterTopic(): QuizTopic {
    const jsonText = newChapterJson.trim();
    if (!jsonText) {
      return {
        id: newChapterId.trim(),
        unitId: newChapterId.trim(),
        name: newChapterName.trim() || `Chương ${newChapterId.trim()}`,
        title: newChapterTitle.trim() || newChapterName.trim() || 'Chương mới',
        questions: [],
      };
    }

    const parsed = JSON.parse(jsonText) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('JSON tạo chương phải là một object topic.');
    }
    if (Array.isArray((parsed as { topics?: unknown }).topics)) {
      throw new Error('JSON này là full dataset. Hãy dùng Import JSON thành draft mới ở Import Center.');
    }
    return parsed as QuizTopic;
  }

  async function createChapter() {
    if (!activeDataset) {
      setError('Cần có draft hoặc import dataset trước khi tạo chương mới.');
      return;
    }
    setOperation('create-topic');
    setMessage('');
    setError('');
    try {
      const nextTopic = buildNewChapterTopic();
      const nextDataset = addTopic(activeDataset, nextTopic);
      const createdId = String((nextTopic as { unitId?: unknown; id?: unknown }).unitId || (nextTopic as { id?: unknown }).id || newChapterId).trim();
      const createdUnitId = createdId.startsWith('u') ? createdId : `u${createdId}`;
      const response = await apiService.importLessonContentDraft(nextDataset as Record<string, unknown>, `admin-create-topic-${createdUnitId}`);
      setDataset(nextDataset);
      setSummary(response.summary);
      setSelectedChapterId(createdUnitId);
      setSelectedNodeId('');
      setExpandedChapters((current) => new Set([...current, createdUnitId]));
      setNewChapterId('');
      setNewChapterName('');
      setNewChapterTitle('');
      setNewChapterJson('');
      setMessage(`Đã tạo ${createdUnitId} trong draft. Publish riêng khi muốn học sinh thấy thay đổi.`);
      await loadContentStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo chương mới.');
    } finally {
      setOperation('idle');
    }
  }

  function startEditQuestion(question: QuizQuestion, nodeQuestionIndex: number) {
    setError('');
    setMessage('');
    setEditingQuestionKey(getQuestionKey(question, selectedNode ? selectedNode.questionStart + nodeQuestionIndex : nodeQuestionIndex));
    setQuestionDraftType(getQuestionType(question));
    setQuestionDraftText(asText(question.question || question.text || question.title));
    setQuestionDraftAnswer(asText(question.answer));
    setQuestionDraftExplanation(asText(question.explanation));
    setQuestionDraftJson(formatQuestionJson(question));
  }

  function cancelEditQuestion() {
    setEditingQuestionKey('');
    setQuestionDraftText('');
    setQuestionDraftAnswer('');
    setQuestionDraftExplanation('');
    setQuestionDraftType('multiple_choice');
    setQuestionDraftJson('');
  }

  async function saveQuestionEdit(nodeQuestionIndex: number) {
    if (!activeDataset || !selectedChapter || !selectedNode) {
      setError('Chưa chọn câu hỏi để lưu.');
      return;
    }

    setOperation('save-question');
    setMessage('');
    setError('');

    try {
      const globalQuestionIndex = selectedNode.questionStart + nodeQuestionIndex;
      const parsedQuestion = parseQuestionJson(questionDraftJson);
      const nextQuestion = {
        ...parsedQuestion,
        type: questionDraftType,
        question: questionDraftText,
        answer: questionDraftAnswer,
        explanation: questionDraftExplanation,
      };
      const nextTopic = updateQuestionInTopic(selectedChapter.topic, globalQuestionIndex, nextQuestion);
      const nextDataset = replaceTopic(activeDataset, nextTopic);
      setDataset(nextDataset);
      setSummary(datasetSummary(nextDataset));
      setSelectedChapterId(selectedChapter.unitId);
      setSelectedNodeId(selectedNode.id);
      const response = await apiService.patchLessonContentTopic(nextTopic as Record<string, unknown>, `admin-question-${selectedChapter.unitId}`);
      setSummary(response.summary);
      setMessage(`Đã lưu câu ${globalQuestionIndex + 1} vào draft. Publish để học sinh thấy thay đổi.`);
      cancelEditQuestion();
      await loadContentStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu câu hỏi vào draft.');
    } finally {
      setOperation('idle');
    }
  }

  async function publishDraft() {
    setOperation('publish');
    setMessage('');
    setError('');
    setPublishConfirmError('');
    try {
      const response = await apiService.publishLessonContent();
      setIsPublishConfirmOpen(false);
      setMessage(`${response.message} lúc ${new Date(response.published_at).toLocaleString()}`);
      await loadContentStatus();
    } catch (err) {
      const nextError = err instanceof Error ? err.message : 'Không thể publish draft.';
      setPublishConfirmError(nextError);
      setError(nextError);
    } finally {
      setOperation('idle');
    }
  }

  function openPublishConfirm() {
    setError('');
    setMessage('');
    setPublishConfirmError('');
    setIsPublishConfirmOpen(true);
  }

  function closePublishConfirm() {
    if (operation === 'publish') return;
    setIsPublishConfirmOpen(false);
    setPublishConfirmError('');
  }

  async function uploadAsset() {
    if (!selectedChapter || !selectedNode || !assetFile) {
      setError('Hãy chọn node và file ảnh trước khi upload.');
      return;
    }
    setOperation('upload');
    setMessage('');
    setError('');
    try {
      const response = await apiService.uploadLessonAsset(selectedChapter.unitId, selectedNode.id, assetFile);
      const absoluteUrl = absoluteAssetUrl(response.asset.url);
      setLessonAssets((current) => [response.asset, ...current.filter((item) => assetKey(item.unitId, item.lessonId) !== assetKey(response.asset.unitId, response.asset.lessonId))]);
      setUploadedAssetUrl(absoluteUrl);
      setMessage(`Đã upload ảnh minh họa cho ${selectedNode.id}.`);
      setAssetFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể upload ảnh.');
    } finally {
      setOperation('idle');
    }
  }

  async function uploadBackgroundAsset() {
    if (!selectedChapter || !backgroundFile) {
      setError('Hãy chọn chương và file ảnh nền trước khi upload.');
      return;
    }
    setOperation('upload-background');
    setMessage('');
    setError('');
    try {
      const response = await apiService.uploadChapterBackground(selectedChapter.unitId, backgroundFile);
      setLessonAssets((current) => [response.asset, ...current.filter((item) => assetKey(item.unitId, item.lessonId) !== assetKey(response.asset.unitId, response.asset.lessonId))]);
      applyChapterBackground(response.asset.url, `Đã upload và gắn ảnh nền cho ${selectedChapter.name}. Bấm Lưu chương để ghi vào draft.`);
      setBackgroundFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể upload ảnh nền chương.');
    } finally {
      setOperation('idle');
    }
  }

  function exportDataset(kind: 'draft' | 'published') {
    const doc = kind === 'draft' ? draftDoc : publishedDoc;
    if (!doc?.dataset) {
      setError(kind === 'draft' ? 'Chưa có draft để export.' : 'Chưa có published dataset để export.');
      return;
    }
    downloadJson(`lesson-content-${kind}.json`, doc.dataset);
    setMessage(`Đã export ${kind} JSON.`);
  }

  function toggleChapter(unitId: string) {
    setExpandedChapters((current) => {
      const next = new Set(current);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  }

  return (
    <div className="page-stack lesson-console-page">
      <div className="command-panel hero-panel lesson-hero-panel">
        <div>
          <p className="panel-kicker"><BookMarked size={16} /> Lesson Studio</p>
          <h2>Quản lý bài học</h2>
          <p>Đọc trực tiếp data.js, chỉnh node 5-10 câu, lưu draft từng chương và publish nguyên chương khi đã duyệt.</p>
        </div>
        <div className="lesson-hero-stats">
          <span>{chapters.length} chương</span>
          <strong>{totalNodes} node</strong>
          <span>{totalQuestions} câu hỏi</span>
        </div>
      </div>

      <Feedback message={message} tone="success" />
      <Feedback message={error} tone="error" />

      <section className="lesson-status-grid">
        <article className="lesson-status-card">
          <span>Draft</span>
          <strong>{draftDoc ? 'Đã có draft' : 'Chưa có draft'}</strong>
          <small>{draftDoc?.updated_at ? new Date(draftDoc.updated_at).toLocaleString() : 'Import data.js để tạo draft'}</small>
        </article>
        <article className="lesson-status-card">
          <span>Published</span>
          <strong>{publishedDoc ? 'Đang phát hành' : 'Chưa publish'}</strong>
          <small>{publishedDoc?.published_at ? new Date(publishedDoc.published_at).toLocaleString() : 'Publish draft để frontend sử dụng'}</small>
        </article>
        <article className="lesson-status-card accent">
          <span>Dataset đang xem</span>
          <strong>{summary?.title || activeDataset?.title || 'Chưa chọn'}</strong>
          <small>{summary ? `${summary.topic_count} chương • ${summary.totalQuestions} câu` : 'Chọn data.js để bắt đầu'}</small>
        </article>
        <article className="lesson-status-card">
          <span>Ảnh public/assets</span>
          <strong>{lessonAssetCatalog.length} ảnh</strong>
          <small>{lessonAssets.length} ảnh admin upload theo node</small>
        </article>
      </section>

      <section className="lesson-action-bar" aria-label="Lesson release actions">
        <div className="lesson-action-bar-copy">
          <strong>Xuất bản & xuất file</strong>
          <span>Publish là bước riêng sau khi import hoặc lưu chương vào draft.</span>
        </div>
        <div className="lesson-action-bar-actions">
          <button className="ghost-button lesson-neutral-button" type="button" disabled={!draftDoc} onClick={() => exportDataset('draft')}><Download size={16} /> Export Draft</button>
          <button className="ghost-button lesson-neutral-button" type="button" disabled={!publishedDoc} onClick={() => exportDataset('published')}><Download size={16} /> Export Published</button>
          <button className="primary-button lesson-publish-button" type="button" disabled={isBusy || !draftDoc} onClick={openPublishConfirm}><Rocket size={16} /> {operation === 'publish' ? 'Đang publish...' : 'Publish Draft'}</button>
        </div>
      </section>

      <section className="lesson-console-grid">
        <aside className="command-panel lesson-import-panel">
          <p className="panel-kicker"><UploadCloud size={16} /> Import Center</p>
          <p className="lesson-panel-note">Dùng để kiểm tra hoặc thay toàn bộ draft từ file data.js / JSON. Không dùng khu vực này để update một chương.</p>
          <label className="lesson-import-dropzone" htmlFor="lesson-json-file">
            <FileJson size={34} />
            <strong>Chọn file data.js / JSON</strong>
            <span>Nguồn thật: frontend/public/quiz/data.js. Không dùng legacy lessons.</span>
            <input id="lesson-json-file" type="file" accept=".json,.js,application/json,text/javascript" onChange={(event) => void handleFileChange(event)} />
          </label>

          {fileMeta && (
            <div className="lesson-file-meta">
              <CheckCircle2 size={16} />
              <div>
                <strong>{fileMeta.name}</strong>
                <span>{formatBytes(fileMeta.size)}</span>
              </div>
            </div>
          )}

          <button className="ghost-button full-width" type="button" onClick={() => setIsPasteOpen((value) => !value)}>
            {isPasteOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />} Paste JSON nâng cao
          </button>

          {isPasteOpen && (
            <label className="field-group">
              <span>Nội dung JSON hoặc data.js</span>
              <textarea
                id="lesson-content-json"
                value={rawText}
                onChange={(event) => setRawText(event.target.value)}
                rows={8}
                placeholder='let QUIZ_DATA = { title: "Trắc nghiệm Lịch Sử 11", topics: [...] }'
              />
            </label>
          )}

          <div className="lesson-action-groups">
            <div className="lesson-read-actions" aria-label="Read only lesson actions">
              <button className="ghost-button lesson-read-button" type="button" disabled={isBusy || !rawText.trim()} onClick={handlePastePreview}>Preview local</button>
              <button className="ghost-button lesson-read-button" type="button" disabled={isBusy || !activeDataset} onClick={() => void previewJson()}>{operation === 'preview' ? 'Đang preview...' : 'Check backend'}</button>
            </div>
            <div className="lesson-import-warning" role="note">
              <strong>⚠️ Ghi đè toàn bộ draft</strong>
              <span>Hành động này thay toàn bộ draft hiện tại. Nếu chỉ sửa một chương, dùng Content Explorer.</span>
            </div>
            <button className="ghost-button lesson-danger-button full-width" type="button" disabled={isBusy || !activeDataset} onClick={() => void importDraft()}>{operation === 'import' ? 'Đang import...' : 'Import → Draft mới'}</button>
          </div>
        </aside>

        <main className="command-panel lesson-explorer-panel">
          <div className="lesson-panel-header">
            <div>
              <p className="panel-kicker"><Layers3 size={16} /> Content Explorer</p>
              <h3>Chương → Node → Câu hỏi</h3>
            </div>
            <div className="lesson-mode-switch" aria-label="Content Explorer mode">
              <button className={chapterActionMode === 'update' ? 'active' : ''} type="button" onClick={() => setChapterActionMode('update')}>Chỉnh chương có sẵn</button>
              <button className={chapterActionMode === 'create' ? 'active' : ''} type="button" onClick={() => setChapterActionMode('create')}>Tạo chương mới</button>
            </div>
          </div>

          <p className="lesson-mode-helper">
            {chapterActionMode === 'update'
              ? 'Chọn chương → chọn node → chỉnh nội dung → lưu chương vào draft.'
              : 'Điền thông tin hoặc paste JSON topic chuẩn để tạo một chương mới trong draft.'}
          </p>

          <div className="lesson-filter-grid">
            <label className="search-box lesson-search-box">
              <Search size={17} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm chương, node, câu hỏi..." />
            </label>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              {questionTypes.map((type) => <option key={type} value={type}>{type === 'all' ? 'Tất cả type' : `${type} (${typeCounts[type] || 0})`}</option>)}
            </select>
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
              <option value="unit">Sắp xếp chương</option>
              <option value="questions-desc">Nhiều câu nhất</option>
              <option value="questions-asc">Ít câu nhất</option>
            </select>
          </div>

          {chapterActionMode === 'create' && (
            <div className="lesson-create-chapter-panel">
              <div className="lesson-section-title">
                <strong>Tạo chương mới trong draft</strong>
                <span>Không publish tự động</span>
              </div>
              <div className="lesson-create-grid">
                <label className="field-group">
                  <span>Chapter ID / Unit ID</span>
                  <input value={newChapterId} onChange={(event) => setNewChapterId(event.target.value)} placeholder="u12 hoặc 12" />
                </label>
                <label className="field-group">
                  <span>Tên chương</span>
                  <input value={newChapterName} onChange={(event) => setNewChapterName(event.target.value)} placeholder="Chương 12" />
                </label>
                <label className="field-group">
                  <span>Tiêu đề</span>
                  <input value={newChapterTitle} onChange={(event) => setNewChapterTitle(event.target.value)} placeholder="Chủ đề bài học mới" />
                </label>
              </div>
              <details className="lesson-create-json">
                <summary>JSON topic nâng cao</summary>
                <textarea value={newChapterJson} onChange={(event) => setNewChapterJson(event.target.value)} rows={7} spellCheck={false} placeholder='{"id":"u12","name":"Chương 12","title":"...","questions":[]}' />
              </details>
              <button className="ghost-button lesson-save-button lesson-create-button" type="button" disabled={isBusy || !activeDataset} onClick={() => void createChapter()}>
                {operation === 'create-topic' ? 'Đang tạo chương...' : 'Tạo chương trong draft'}
              </button>
              <p className="lesson-action-hint">Tạo chương mới sẽ thêm 1 topic vào draft hiện tại. Nếu bạn có full dataset, hãy dùng Import → Draft mới.</p>
            </div>
          )}

          <div className="lesson-unit-list">
            {visibleChapters.length === 0 ? (
              <div className="lesson-empty-state">Chưa có dataset hoặc không tìm thấy kết quả phù hợp.</div>
            ) : visibleChapters.map((chapter) => {
              const isExpanded = expandedChapters.has(chapter.unitId);
              return (
                <article className="lesson-unit-card" key={chapter.unitId}>
                  <div className="lesson-unit-card-actions">
                    <button
                      className="ghost-button lesson-danger-button compact"
                      type="button"
                      disabled={isBusy}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmChapter(chapter);
                      }}
                      title="Xóa chương khỏi draft"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <button className="lesson-unit-toggle" type="button" onClick={() => {
                    handleSelectChapter(chapter);
                    toggleChapter(chapter.unitId);
                  }}>
                    {isExpanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                    <div>
                      <strong>{chapter.unitId} — {chapter.name}</strong>
                      <span>{chapter.title}</span>
                    </div>
                    <em>{chapter.nodes.length} node • {chapter.questionCount} câu</em>
                  </button>

                  {isExpanded && (
                    <div className="lesson-row-list">
                      {chapter.nodes.map((node) => {
                        const isSelected = selectedChapter?.unitId === chapter.unitId && selectedNode?.id === node.id;
                        const assetUrl = getLessonAssetUrl(lessonAssets, chapter.unitId, node.id);
                        return (
                          <button className={`lesson-row ${isSelected ? 'selected' : ''}`} key={node.id} type="button" onClick={() => handleSelectNode(chapter, node)}>
                            <span>{node.id}</span>
                            <strong>{node.questionCount} câu{assetUrl ? ' • có ảnh' : ''}</strong>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {chapterActionMode === 'update' && (
            <div className="lesson-selected-chapter-footer">
              <span>{selectedChapter ? `Đang chọn: ${selectedChapter.unitId} — ${selectedChapter.name}` : 'Chọn một chương để lưu vào draft.'}</span>
              <button className="ghost-button lesson-save-button full-width" type="button" disabled={isBusy || !selectedChapter || !draftDoc} onClick={() => void saveSelectedChapter()}>
                <Save size={16} /> {operation === 'save-topic' ? 'Đang lưu chương...' : selectedChapter ? `Lưu chương ${selectedChapter.unitId} vào draft` : 'Lưu chương vào draft'}
              </button>
            </div>
          )}
        </main>

        <aside className="command-panel lesson-detail-panel">
          <p className="panel-kicker"><ImageUp size={16} /> Node Detail</p>
          {!selectedChapter || !selectedNode ? (
            <div className="lesson-empty-state">Chọn một node trong explorer để xem chi tiết, chỉnh số câu và upload ảnh.</div>
          ) : (
            <>
              <div className="lesson-detail-heading">
                <div>
                  <span>{selectedChapter.unitId} • {selectedChapter.name}</span>
                  <h3>{selectedNode.id}</h3>
                  <p>{selectedNode.title} — câu {selectedNode.questionStart + 1} đến {selectedNode.questionStart + selectedNode.questionCount}</p>
                </div>
                <strong>{selectedNode.questionCount} câu</strong>
              </div>

              <section className="lesson-detail-section">
                <div className="lesson-section-title">
                  <strong>Thông tin node</strong>
                  <span>{selectedNode.id}</span>
                </div>
                <label className="field-group lesson-node-size-field">
                  <span>Số câu trong node này (5-10)</span>
                  <input type="number" min={5} max={10} value={selectedNode.questionCount} onChange={(event) => resizeSelectedNode(Number(event.target.value))} />
                </label>
                <div className="lesson-type-pills">
                  {chapterIssues.length === 0 ? <span>Validation: OK</span> : chapterIssues.map((issue) => <span key={issue.message} className={`lesson-issue-${issue.tone}`}>{issue.message}</span>)}
                </div>
              </section>

              <section className="lesson-detail-section lesson-background-editor">
                <div className="lesson-section-title">
                  <strong>Ảnh chương & node</strong>
                  <span>{selectedChapter.unitId}</span>
                </div>
                {selectedBackgroundPreviewUrl ? (
                  <div className="lesson-asset-preview lesson-background-preview">
                    <img src={selectedBackgroundPreviewUrl} alt={`Ảnh nền ${selectedChapter.name}`} />
                    <a href={selectedBackgroundPreviewUrl} target="_blank" rel="noreferrer">Mở ảnh nền chương</a>
                  </div>
                ) : (
                  <div className="lesson-empty-state compact">Chưa có ảnh nền cho chương này.</div>
                )}
                <label className="field-group">
                  <span>Path ảnh nền</span>
                  <input
                    value={selectedBackgroundUrl}
                    onChange={(event) => {
                      setBackgroundDraftUrl(event.target.value);
                      applyChapterBackground(event.target.value, `Đã cập nhật ảnh nền cho ${selectedChapter.name}. Bấm Lưu chương để ghi vào draft.`);
                    }}
                    placeholder="/assets/bg_u1.png hoặc /api/v1/lesson-content/assets/u1/__chapter_background__"
                  />
                </label>
                <div className="lesson-background-actions">
                  <label className="field-group">
                    <span>Upload ảnh nền mới</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setBackgroundFile(event.target.files?.[0] ?? null)} />
                  </label>
                  <button className="primary-button full-width" type="button" disabled={isBusy || !backgroundFile} onClick={() => void uploadBackgroundAsset()}>{operation === 'upload-background' ? 'Đang upload...' : 'Upload ảnh nền chương'}</button>
                </div>

                {selectedAssetUrl && (
                  <div className="lesson-asset-preview">
                    <img src={selectedAssetUrl} alt={`Ảnh nền ${selectedNode.id}`} />
                    <a href={selectedAssetUrl} target="_blank" rel="noreferrer">Mở ảnh node hiện tại</a>
                  </div>
                )}

                <div className="lesson-image-uploader">
                  <label className="field-group">
                    <span>Ảnh minh họa riêng cho {selectedNode.id}</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setAssetFile(event.target.files?.[0] ?? null)} />
                  </label>
                  <button className="primary-button full-width" type="button" disabled={isBusy || !assetFile} onClick={() => void uploadAsset()}>{operation === 'upload' ? 'Đang upload...' : 'Upload ảnh minh họa node'}</button>
                </div>

                <details className="lesson-inline-asset-picker">
                  <summary>Chọn ảnh có sẵn ({lessonAssetCatalog.length} ảnh)</summary>
                  <div className="lesson-inline-asset-grid">
                    {lessonAssetCatalog.map((asset) => (
                      <button
                        className={`lesson-asset-catalog-card compact ${selectedBackgroundUrl === `/assets/${asset.filename}` ? 'selected' : ''}`}
                        key={asset.filename}
                        type="button"
                        onClick={() => applyChapterBackground(`/assets/${asset.filename}`, `Đã chọn ${asset.label} làm ảnh nền cho ${selectedChapter.name}. Bấm Lưu chương để ghi vào draft.`)}
                      >
                        <img src={assetCatalogUrl(asset.filename)} alt={asset.label} />
                        <span>{asset.group}</span>
                        <strong>{asset.label}</strong>
                        <small>{asset.filename}</small>
                      </button>
                    ))}
                  </div>
                </details>
              </section>

              <section className="lesson-detail-section">
                <div className="lesson-section-title">
                  <strong>Câu hỏi trong node</strong>
                  <span>{selectedQuestions.length} câu</span>
                </div>
                <div className="lesson-question-list">
                  {selectedQuestions.map((question, index) => {
                    const globalQuestionIndex = selectedNode.questionStart + index;
                    const questionKey = getQuestionKey(question, globalQuestionIndex);
                    const isEditingQuestion = editingQuestionKey === questionKey;
                    return (
                      <article className={`lesson-question-card ${isEditingQuestion ? 'editing' : ''}`} key={`${questionKey}-${index}`}>
                        <div className="lesson-question-card-header">
                          <div>
                            <span>{question.globalId || question.id || globalQuestionIndex + 1}</span>
                            <strong>{getQuestionType(question)}</strong>
                          </div>
                          <button
                            className="ghost-button lesson-question-edit-button"
                            type="button"
                            disabled={isBusy && !isEditingQuestion}
                            onClick={() => isEditingQuestion ? cancelEditQuestion() : startEditQuestion(question, index)}
                          >
                            {isEditingQuestion ? 'Đóng' : 'Sửa'}
                          </button>
                        </div>

                        {isEditingQuestion ? (
                          <div className="lesson-question-edit-form">
                            <div className="lesson-question-edit-grid">
                              <div className="lesson-question-edit-main">
                                <label className="field-group">
                                  <span>Loại câu hỏi</span>
                                  <select value={questionDraftType} onChange={(event) => setQuestionDraftType(event.target.value)}>
                                    {questionTypes.filter((type) => type !== 'all').map((type) => <option key={type} value={type}>{type}</option>)}
                                  </select>
                                </label>
                                <label className="field-group">
                                  <span>Câu hỏi</span>
                                  <textarea value={questionDraftText} onChange={(event) => setQuestionDraftText(event.target.value)} rows={5} />
                                </label>
                                <label className="field-group">
                                  <span>Đáp án đúng</span>
                                  <textarea value={questionDraftAnswer} onChange={(event) => setQuestionDraftAnswer(event.target.value)} rows={3} />
                                </label>
                              </div>
                              <div className="lesson-question-edit-aside">
                                <label className="field-group">
                                  <span>Giải thích</span>
                                  <textarea value={questionDraftExplanation} onChange={(event) => setQuestionDraftExplanation(event.target.value)} rows={10} />
                                </label>
                              </div>
                            </div>
                            <details className="lesson-question-advanced-json">
                              <summary>JSON nâng cao (giữ options/pairs/items/correctAnswer)</summary>
                              <textarea className="lesson-question-json-editor" value={questionDraftJson} onChange={(event) => setQuestionDraftJson(event.target.value)} rows={8} spellCheck={false} />
                            </details>
                            <div className="lesson-question-edit-actions">
                              <button className="primary-button lesson-save-button" type="button" disabled={isBusy} onClick={() => void saveQuestionEdit(index)}>{operation === 'save-question' ? 'Đang lưu...' : 'Lưu câu hỏi'}</button>
                              <button className="ghost-button lesson-neutral-button" type="button" disabled={isBusy} onClick={cancelEditQuestion}>Hủy</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p>{getQuestionTitle(question)}</p>
                            <small>Answer: {asText(question.answer).slice(0, 140) || 'Chưa có answer preview'}</small>
                            <small>Explain: {asText(question.explanation).slice(0, 180) || 'Chưa có explanation'}</small>
                          </>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>

              <div className="lesson-detail-save-footer">
                <span>Chỉnh xong node/câu hỏi/ảnh thì lưu chương để ghi vào draft.</span>
                <button className="ghost-button lesson-save-button full-width" type="button" disabled={isBusy || !draftDoc} onClick={() => void saveSelectedChapter()}>
                  <Save size={16} /> {operation === 'save-topic' ? 'Đang lưu chương...' : `Lưu thay đổi chương ${selectedChapter.unitId}`}
                </button>
              </div>
            </>
          )}
        </aside>
      </section>


      {isPublishConfirmOpen && (
        <div className="lesson-confirm-backdrop" role="presentation" onMouseDown={closePublishConfirm}>
          <section
            className="lesson-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lesson-publish-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <p className="panel-kicker"><Rocket size={16} /> Publish Draft</p>
            <h3 id="lesson-publish-title">Xác nhận phát hành bài học</h3>
            <p>Bạn sắp phát hành draft hiện tại cho website học sinh.</p>
            <div className="lesson-confirm-summary">
              <span>Dataset</span>
              <strong>{modalDatasetTitle}</strong>
              <span>Nội dung</span>
              <strong>{modalTopicCount} chương • {modalTotalQuestions} câu</strong>
            </div>
            <p className="lesson-confirm-warning">Hành động này sẽ cập nhật bản Published đang được frontend sử dụng.</p>
            {publishConfirmError && <div className="lesson-confirm-error">{publishConfirmError}</div>}
            <div className="lesson-confirm-actions">
              <button className="ghost-button" type="button" disabled={operation === 'publish'} onClick={closePublishConfirm}>Hủy</button>
              <button className="primary-button lesson-publish-button" type="button" disabled={operation === 'publish'} onClick={() => void publishDraft()}>
                {operation === 'publish' ? 'Đang phát hành...' : 'Xác nhận publish'}
              </button>
            </div>
          </section>
        </div>
      )}

      {deleteConfirmChapter && (
        <div className="lesson-confirm-backdrop" role="presentation" onMouseDown={() => setDeleteConfirmChapter(null)}>
          <section
            className="lesson-confirm-modal lesson-danger-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lesson-delete-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <p className="panel-kicker"><Trash2 size={16} /> Xóa chương</p>
            <h3 id="lesson-delete-title">Xác nhận xóa chương {deleteConfirmChapter.name}?</h3>
            <p>Hành động này sẽ xóa chương <strong>{deleteConfirmChapter.unitId}</strong> khỏi draft.</p>
            <div className="lesson-confirm-summary">
              <span>Chương</span>
              <strong>{deleteConfirmChapter.name}</strong>
              <span>Câu hỏi</span>
              <strong>{deleteConfirmChapter.questionCount} câu</strong>
            </div>
            <p className="lesson-confirm-warning">Không thể hoàn tác. Nếu đã publish, học sinh vẫn thấy chương này cho đến khi bạn publish lại.</p>
            <div className="lesson-confirm-actions">
              <button className="ghost-button lesson-neutral-button" type="button" disabled={operation === 'delete-topic'} onClick={() => setDeleteConfirmChapter(null)}>Hủy</button>
              <button className="ghost-button lesson-danger-button" type="button" disabled={operation === 'delete-topic'} onClick={() => void deleteChapter(deleteConfirmChapter)}>
                {operation === 'delete-topic' ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
