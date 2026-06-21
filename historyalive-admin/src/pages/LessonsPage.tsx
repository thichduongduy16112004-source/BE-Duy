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
  UploadCloud,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Feedback } from '../components/Feedback';
import { apiService } from '../services/apiService';
import { assetCatalogUrl, lessonAssetCatalog } from '../services/lessonAssetCatalog';
import {
  asText,
  buildChapters,
  getQuestionTitle,
  getQuestionType,
  nodeQuestions,
  normalizeDataset,
  replaceTopic,
  parseLessonDataset,
  updateChapterBackground,
  updateNodeSize,
  validateChapter,
} from '../services/lessonDataAdapter';
import type { ChapterModel, LessonNode, QuizDataset } from '../services/lessonDataAdapter';
import type { LessonAsset, LessonContentDocument, LessonContentSummary } from '../services/apiService';

type SortMode = 'unit' | 'questions-desc' | 'questions-asc';
type Operation = 'idle' | 'loading-status' | 'preview' | 'import' | 'save-topic' | 'publish' | 'upload' | 'upload-background';

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

  async function saveSelectedChapter() {
    if (!selectedChapter) {
      setError('Chưa chọn chương để lưu.');
      return;
    }
    setOperation('save-topic');
    setMessage('');
    setError('');
    try {
      const response = await apiService.patchLessonContentTopic(selectedChapter.topic as Record<string, unknown>, `admin-${selectedChapter.unitId}`);
      setSummary(response.summary);
      setMessage(`Đã lưu draft cho ${selectedChapter.name}. Publish riêng khi muốn học sinh thấy thay đổi.`);
      await loadContentStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu chương vào draft.');
    } finally {
      setOperation('idle');
    }
  }

  async function publishDraft() {
    if (!confirm('Publish toàn bộ draft hiện tại cho học sinh dùng ngay?')) return;
    setOperation('publish');
    setMessage('');
    setError('');
    try {
      const response = await apiService.publishLessonContent();
      setMessage(`${response.message} lúc ${new Date(response.published_at).toLocaleString()}`);
      await loadContentStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể publish draft.');
    } finally {
      setOperation('idle');
    }
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

      <section className="lesson-console-grid">
        <aside className="command-panel lesson-import-panel">
          <p className="panel-kicker"><UploadCloud size={16} /> Import Center</p>
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

          <div className="lesson-action-bar">
            <button className="ghost-button" type="button" disabled={isBusy || !rawText.trim()} onClick={handlePastePreview}>Preview local</button>
            <button className="ghost-button" type="button" disabled={isBusy || !activeDataset} onClick={() => void previewJson()}>{operation === 'preview' ? 'Đang preview...' : 'Check backend'}</button>
            <button className="primary-button" type="button" disabled={isBusy || !activeDataset} onClick={() => void importDraft()}>{operation === 'import' ? 'Đang import...' : 'Import full draft'}</button>
            <button className="primary-button" type="button" disabled={isBusy || !selectedChapter || !draftDoc} onClick={() => void saveSelectedChapter()}><Save size={16} /> {operation === 'save-topic' ? 'Đang lưu...' : 'Lưu chương'}</button>
            <button className="primary-button" type="button" disabled={isBusy || !draftDoc} onClick={() => void publishDraft()}><Rocket size={16} /> {operation === 'publish' ? 'Đang publish...' : 'Publish draft'}</button>
          </div>

          <div className="lesson-export-grid">
            <button className="ghost-button" type="button" disabled={!draftDoc} onClick={() => exportDataset('draft')}><Download size={16} /> Export Draft</button>
            <button className="ghost-button" type="button" disabled={!publishedDoc} onClick={() => exportDataset('published')}><Download size={16} /> Export Published</button>
          </div>
        </aside>

        <main className="command-panel lesson-explorer-panel">
          <div className="lesson-panel-header">
            <div>
              <p className="panel-kicker"><Layers3 size={16} /> Content Explorer</p>
              <h3>Chương → Node → Câu hỏi</h3>
            </div>
          </div>

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

          <div className="lesson-unit-list">
            {visibleChapters.length === 0 ? (
              <div className="lesson-empty-state">Chưa có dataset hoặc không tìm thấy kết quả phù hợp.</div>
            ) : visibleChapters.map((chapter) => {
              const isExpanded = expandedChapters.has(chapter.unitId);
              return (
                <article className="lesson-unit-card" key={chapter.unitId}>
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

              <div className="lesson-background-editor">
                <div className="lesson-section-title">
                  <strong>Ảnh nền chương</strong>
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
              </div>

              <label className="field-group lesson-node-size-field">
                <span>Số câu trong node này (5-10)</span>
                <input type="number" min={5} max={10} value={selectedNode.questionCount} onChange={(event) => resizeSelectedNode(Number(event.target.value))} />
              </label>

              <div className="lesson-type-pills">
                {chapterIssues.length === 0 ? <span>Validation: OK</span> : chapterIssues.map((issue) => <span key={issue.message} className={`lesson-issue-${issue.tone}`}>{issue.message}</span>)}
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

              <div className="lesson-question-list">
                {selectedQuestions.map((question, index) => (
                  <article className="lesson-question-card" key={`${question.globalId || question.id || index}-${index}`}>
                    <div>
                      <span>{question.globalId || question.id || selectedNode.questionStart + index + 1}</span>
                      <strong>{getQuestionType(question)}</strong>
                    </div>
                    <p>{getQuestionTitle(question)}</p>
                    <small>Answer: {asText(question.answer).slice(0, 140) || 'Chưa có answer preview'}</small>
                    <small>Explain: {asText(question.explanation).slice(0, 180) || 'Chưa có explanation'}</small>
                  </article>
                ))}
              </div>
            </>
          )}
        </aside>
      </section>

      <section className="command-panel lesson-assets-panel">
        <div className="lesson-panel-header">
          <div>
            <p className="panel-kicker"><ImageUp size={16} /> Public Asset Catalog</p>
            <h3>Ảnh đang có trong frontend/public/assets</h3>
          </div>
          <strong>{lessonAssetCatalog.length} ảnh</strong>
        </div>
        <div className="lesson-asset-catalog-grid">
          {lessonAssetCatalog.map((asset) => (
            <button
              className={`lesson-asset-catalog-card ${selectedBackgroundUrl === `/assets/${asset.filename}` ? 'selected' : ''}`}
              key={asset.filename}
              type="button"
              onClick={() => applyChapterBackground(`/assets/${asset.filename}`, `Đã chọn ${asset.label} làm ảnh nền cho ${selectedChapter?.name || 'chương'}. Bấm Lưu chương để ghi vào draft.`)}
              disabled={!selectedChapter}
            >
              <img src={assetCatalogUrl(asset.filename)} alt={asset.label} />
              <span>{asset.group}</span>
              <strong>{asset.label}</strong>
              <small>{asset.filename}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
