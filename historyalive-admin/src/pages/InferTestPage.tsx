import { AlertTriangle, Bot, CheckCircle2, Clock, Edit3, Gauge, Quote, Send, Trash2, UploadCloud, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState, Feedback, LoadingState } from '../components/Feedback';
import { apiService } from '../services/apiService';
import type { Character, InferResult, PersistedReviewFeedback, ReviewErrorType, ReviewFeedbackPayload } from '../types/admin';

const quickPrompts = [
  'Tóm tắt 3 điều quan trọng nhất về nhân vật này.',
  'Nếu ta chỉ hỏi một từ: “chiến lược”, hãy trả lời đúng phạm vi lịch sử.',
  'Giải thích dễ hiểu cho học sinh cấp 2 về đóng góp nổi bật của nhân vật.',
  'Câu hỏi ngoài phạm vi: hãy tư vấn đầu tư chứng khoán hôm nay.',
];

const errorTypeOptions: Array<{ value: ReviewErrorType; label: string }> = [
  { value: 'wrong_fact', label: 'Sai sự kiện' },
  { value: 'off_topic', label: 'Lạc đề' },
  { value: 'missing_source', label: 'Thiếu nguồn' },
  { value: 'unsafe_prior', label: 'Gemini tự suy luận' },
  { value: 'duplicate', label: 'Trùng/lặp ý' },
  { value: 'other', label: 'Khác' },
];

const emptyReviewForm = {
  correctedAnswer: '',
  sourceTitle: '',
  sourceUrl: '',
  sourceExcerpt: '',
  reviewerNote: '',
  errorType: 'wrong_fact' as ReviewErrorType,
};

export default function InferTestPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [characterId, setCharacterId] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<InferResult | null>(null);
  const [error, setError] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [reviewForm, setReviewForm] = useState(emptyReviewForm);
  const [existingReview, setExistingReview] = useState<PersistedReviewFeedback | null>(null);
  const [isEditingReview, setIsEditingReview] = useState(false);

  const selectedCharacter = useMemo(
    () => characters.find((character) => character.character_id === characterId),
    [characters, characterId],
  );

  const warnings = useMemo(() => buildWarnings(result, selectedCharacter), [result, selectedCharacter]);
  const promptOptions = useMemo(() => {
    const templatePrompts = selectedCharacter?.rag_templates.flatMap((template) => template.sample_questions) ?? [];
    return Array.from(new Set([...templatePrompts, ...quickPrompts])).slice(0, 12);
  }, [selectedCharacter]);

  useEffect(() => {
    const loadCharacters = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await apiService.getCharacters();
        const available = response.characters.filter((character) => character.status !== 'archived');
        setCharacters(available);
        setCharacterId(available[0]?.character_id || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách nhân vật.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadCharacters();
  }, []);

  useEffect(() => {
    if (!isSending) {
      return;
    }

    const startedAt = performance.now();
    const timerId = window.setInterval(() => {
      setElapsedMs(performance.now() - startedAt);
    }, 100);

    return () => window.clearInterval(timerId);
  }, [isSending]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setReviewMessage('');
    setResult(null);
    setReviewForm(emptyReviewForm);
    setExistingReview(null);
    setIsEditingReview(false);
    setElapsedMs(0);

    if (!characterId || !message.trim()) {
      setError('Chọn nhân vật và nhập câu hỏi test.');
      return;
    }

    setIsSending(true);
    try {
      const trimmedMessage = message.trim();
      const response = await apiService.infer(characterId, trimmedMessage);
      const latestReview = await apiService.getLatestReviewFeedback(characterId, trimmedMessage);
      setResult(response);
      setExistingReview(latestReview.feedback);
      setElapsedMs(response.durationMs ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Infer test thất bại.');
    } finally {
      setIsSending(false);
    }
  };

  const saveReview = async (payload: ReviewFeedbackPayload) => {
    setIsSavingReview(true);
    setReviewMessage('');
    setError('');
    try {
      const response = existingReview
        ? await apiService.transitionReviewFeedback(existingReview.review_id, payload)
        : await apiService.saveReviewFeedback(payload);
      setExistingReview(response.feedback);
      setIsEditingReview(false);
      setReviewMessage(existingReview ? 'Đã lưu bản sửa đổi review.' : 'Đã lưu review vào JSONL. Chỉ câu approved/corrected_approved mới được export sang RAG knowledge.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu review.');
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleEditReview = () => {
    if (!existingReview) {
      return;
    }
    setReviewForm({
      correctedAnswer: existingReview.corrected_answer || '',
      sourceTitle: existingReview.source_title || '',
      sourceUrl: existingReview.source_url || '',
      sourceExcerpt: existingReview.source_excerpt || '',
      reviewerNote: existingReview.reviewer_note || '',
      errorType: (existingReview.error_type || 'wrong_fact') as ReviewErrorType,
    });
    setIsEditingReview(true);
  };

  const handleDeleteReview = async () => {
    if (!existingReview) {
      return;
    }
    setIsSavingReview(true);
    setReviewMessage('');
    setError('');
    try {
      await apiService.deleteReviewFeedback(existingReview.review_id);
      setExistingReview(null);
      setIsEditingReview(false);
      setReviewForm(emptyReviewForm);
      setReviewMessage('Đã xóa review hiện tại. Bạn có thể review lại câu hỏi này nếu cần.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa review.');
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleApprove = () => {
    if (!result || !message.trim()) {
      return;
    }
    const firstSource = result.source_evidence?.[0] || result.citations[0];
    void saveReview({
      question: message.trim(),
      character_id: characterId,
      answer_origin: result.answer_origin || 'rag',
      status: firstSource ? 'approved' : 'needs_source',
      model_answer: result.answer,
      source_title: firstSource?.source_title || reviewForm.sourceTitle,
      source_url: firstSource?.source_url || reviewForm.sourceUrl,
      source_excerpt: firstSource?.source_excerpt || firstSource?.text || reviewForm.sourceExcerpt,
      source_tier: firstSource?.source_tier ?? 3,
      reviewer_note: reviewForm.reviewerNote,
    });
  };

  const handleRejectOrCorrect = () => {
    if (!result || !message.trim()) {
      return;
    }
    const hasCorrection = Boolean(reviewForm.correctedAnswer.trim());
    const hasSource = Boolean(reviewForm.sourceTitle.trim() || reviewForm.sourceUrl.trim() || reviewForm.sourceExcerpt.trim());
    void saveReview({
      question: message.trim(),
      character_id: characterId,
      answer_origin: result.answer_origin || 'rag',
      status: hasCorrection && hasSource ? 'corrected_approved' : 'rejected',
      model_answer: result.answer,
      corrected_answer: reviewForm.correctedAnswer.trim(),
      error_type: reviewForm.errorType,
      source_title: reviewForm.sourceTitle.trim(),
      source_url: reviewForm.sourceUrl.trim(),
      source_excerpt: reviewForm.sourceExcerpt.trim(),
      source_tier: hasSource ? 3 : null,
      reviewer_note: reviewForm.reviewerNote.trim(),
    });
  };

  const handleExportAndRebuild = async () => {
    if (!characterId) {
      return;
    }
    setIsIndexing(true);
    setReviewMessage('');
    setError('');
    try {
      const exported = await apiService.exportApprovedKnowledge();
      await apiService.rebuildKnowledgeIndex(characterId);
      setReviewMessage(`Đã export ${exported.exported_count} mẫu approved và rebuild index cho ${characterId}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể export/rebuild knowledge.');
    } finally {
      setIsIndexing(false);
    }
  };

  if (isLoading) {
    return <LoadingState label="Đang chuẩn bị infer console..." />;
  }

  const durationMs = result?.durationMs ?? elapsedMs;
  const wordsPerSecond = result ? estimateWordsPerSecond(result.answer, result.durationMs) : 0;

  return (
    <div className="infer-layout">
      <form className="command-panel infer-composer" onSubmit={handleSubmit}>
        <div className="section-heading">
          <p className="panel-kicker"><Bot size={16} /> Preview Lab</p>
          <h2>Gửi câu hỏi kiểm thử</h2>
          <p>Endpoint admin luôn include draft để kiểm tra persona, policy và knowledge trước khi chuyển active.</p>
        </div>

        <Feedback message={error} tone="error" />
        <Feedback message={reviewMessage} tone="success" />

        {characters.length === 0 ? (
          <EmptyState title="Chưa có nhân vật test" description="Tạo hoặc khôi phục nhân vật trước khi chạy infer." />
        ) : (
          <>
            <label className="field-group">
              <span>Nhân vật</span>
              <select id="infer-character" value={characterId} onChange={(event) => setCharacterId(event.target.value)}>
                {characters.map((character) => (
                  <option key={character.character_id} value={character.character_id}>{character.display_name} — {character.status}</option>
                ))}
              </select>
            </label>


            <div className="quick-prompt-scroll">
              {promptOptions.map((prompt) => (
                <button id={`quick-prompt-${slugify(prompt)}`} key={prompt} className="ghost-button" type="button" onClick={() => setMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>

            <label className="field-group">
              <span>Câu hỏi test</span>
              <textarea id="infer-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={7} placeholder="Ví dụ: Hãy giải thích chiến lược của ông trong trận Bạch Đằng?" />
            </label>
            <button id="run-infer-test" className="primary-button full-width" type="submit" disabled={isSending}>
              <Send size={17} /> {isSending ? `Đang chạy... ${formatDuration(elapsedMs)}` : 'Chạy infer test'}
            </button>
          </>
        )}
      </form>

      <section className="command-panel answer-panel">
        <div className="section-heading">
          <p className="panel-kicker">Model Answer</p>
          <h2>Phản hồi RAG</h2>
        </div>
        {result || isSending ? (
          <div className="answer-stack">
            <div className="answer-meta">
              <span className="metric-chip"><Clock size={14} /> {formatDuration(durationMs)}</span>
              <span className="metric-chip"><Gauge size={14} /> {wordsPerSecond ? `${wordsPerSecond.toFixed(1)} từ/s` : 'Đang đo tốc độ'}</span>
              <span className="metric-chip">Citation: {result?.citations.length ?? 0}</span>
              {result?.answer_origin && <span className="metric-chip">Origin: {result.answer_origin}</span>}
              {result?.mode && <span className="metric-chip">Mode: {result.mode}</span>}
              {result?.state && <span className="metric-chip">State: {result.state}</span>}
              {result?.llm_status && <span className="metric-chip">LLM: {result.llm_status}</span>}
              {result?.data_source && <span className="metric-chip">Data: {result.data_source}</span>}
              {typeof result?.fallback_used === 'boolean' && <span className="metric-chip">Fallback: {result.fallback_used ? 'yes' : 'no'}</span>}
              {result?.template_id && <span className="metric-chip">Template: {result.template_id}</span>}
              {result?.evidence_status && <span className="metric-chip">Evidence: {result.evidence_status}</span>}
              {typeof result?.relevance_score === 'number' && <span className="metric-chip">Relevance: {(result.relevance_score * 100).toFixed(0)}%</span>}
              {result?.llm_judge_status && <span className="metric-chip">Judge: {result.llm_judge_status}</span>}
            </div>

            {warnings.length > 0 && (
              <div className="warning-list">
                {warnings.map((warning) => (
                  <span key={warning}><AlertTriangle size={15} /> {warning}</span>
                ))}
              </div>
            )}

            {result && <DiagnosticsPanel result={result} />}

            <div className="answer-box">{result?.answer || (isSending ? 'Đang chờ phản hồi từ RAG service...' : 'Không parse được answer từ SSE. Xem raw payload bên dưới.')}</div>
            {result && (
              <>
                <ReviewPanel
                  existingReview={existingReview}
                  form={reviewForm}
                  isEditing={isEditingReview}
                  isIndexing={isIndexing}
                  isSaving={isSavingReview}
                  result={result}
                  setForm={setReviewForm}
                  onApprove={handleApprove}
                  onDeleteReview={handleDeleteReview}
                  onEditReview={handleEditReview}
                  onExportAndRebuild={handleExportAndRebuild}
                  onRejectOrCorrect={handleRejectOrCorrect}
                />
                <div className="citation-list">
                  {(result.source_evidence?.length ? result.source_evidence : result.citations).map((citation, index) => (
                    <article key={`${citation.chunk_id || citation.source_title || index}`} className="citation-card">
                      <Quote size={16} />
                      <div>
                        <strong>{citation.source_title || 'Nguồn chưa đặt tên'}</strong>
                        <p>{citation.source_excerpt || citation.text || citation.source_url || 'Không có trích đoạn.'}</p>
                        <span>{citation.claim_status || 'verified'} {citation.source_year ? `• ${citation.source_year}` : ''}</span>
                      </div>
                    </article>
                  ))}
                </div>
                <details className="raw-sse">
                  <summary>Raw SSE payload</summary>
                  <pre>{result.rawSse}</pre>
                </details>
              </>
            )}
          </div>
        ) : (
          <EmptyState title="Chưa có phản hồi" description="Chạy infer test để xem answer, citations, timer và raw SSE payload." />
        )}
      </section>
    </div>
  );
}


function ReviewPanel({
  existingReview,
  form,
  isEditing,
  isIndexing,
  isSaving,
  result,
  setForm,
  onApprove,
  onDeleteReview,
  onEditReview,
  onExportAndRebuild,
  onRejectOrCorrect,
}: {
  existingReview: PersistedReviewFeedback | null;
  form: typeof emptyReviewForm;
  isEditing: boolean;
  isIndexing: boolean;
  isSaving: boolean;
  result: InferResult;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyReviewForm>>;
  onApprove: () => void;
  onDeleteReview: () => void;
  onEditReview: () => void;
  onExportAndRebuild: () => void;
  onRejectOrCorrect: () => void;
}) {
  const [reviewTab, setReviewTab] = useState<'quick' | 'detailed'>('quick');
  const hasEvidence = Boolean(result.source_evidence?.length || result.citations.length);
  const canReview = !existingReview || isEditing;

  return (
    <div className="review-console">
      <div className="review-header">
        <div>
          <p className="panel-kicker">Admin Review</p>
          <strong>{existingReview ? 'Đã review câu hỏi này' : result.requires_review ? 'Cần xác thực trước khi học' : 'Có thể duyệt nhanh'}</strong>
        </div>
        <span className={`review-badge ${existingReview ? 'review-badge-safe' : hasEvidence ? 'review-badge-safe' : 'review-badge-warn'}`}>
          {existingReview ? reviewStatusLabel(existingReview.status) : hasEvidence ? 'Có nguồn' : 'Thiếu nguồn'}
        </span>
      </div>

      {existingReview && (
        <div className="reviewed-state-card">
          <div>
            <span>Review ID</span>
            <strong>{existingReview.review_id}</strong>
            <p>{existingReview.reviewer_note || existingReview.corrected_answer || existingReview.model_answer || 'Review đã được lưu.'}</p>
          </div>
          <div className="review-actions compact">
            <button id="edit-existing-review" className="ghost-button" type="button" disabled={isSaving} onClick={onEditReview}>
              <Edit3 size={16} /> Sửa đổi
            </button>
            <button id="delete-existing-review" className="danger-button" type="button" disabled={isSaving} onClick={onDeleteReview}>
              <Trash2 size={16} /> Xóa
            </button>
          </div>
        </div>
      )}

      {canReview && (
        <>
          <div className="review-tabs">
            <button
              className={`review-tab-button ${reviewTab === 'quick' ? 'active' : ''}`}
              type="button"
              onClick={() => setReviewTab('quick')}
            >
              Quick Review
            </button>
            <button
              className={`review-tab-button ${reviewTab === 'detailed' ? 'active' : ''}`}
              type="button"
              onClick={() => setReviewTab('detailed')}
            >
              Detailed Review
            </button>
          </div>

          <div className="review-actions">
            <button id="approve-rag-answer" className="primary-button" type="button" disabled={isSaving} onClick={onApprove}>
              <CheckCircle2 size={16} /> {existingReview ? 'Lưu là đúng' : 'Check đúng'}
            </button>
            <button id="reject-rag-answer" className="danger-button" type="button" disabled={isSaving} onClick={onRejectOrCorrect}>
              <XCircle size={16} /> {existingReview ? 'Lưu bản sửa' : 'Sai / lưu bản sửa'}
            </button>
          </div>

          {reviewTab === 'detailed' && (
            <>
              <label className="field-group">
                <span>Lý do sai</span>
                <select id="review-error-type" value={form.errorType} onChange={(event) => setForm((current) => ({ ...current, errorType: event.target.value as ReviewErrorType }))}>
                  {errorTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="field-group">
                <span>Câu trả lời đúng do admin cung cấp</span>
                <textarea id="corrected-answer" rows={5} value={form.correctedAnswer} onChange={(event) => setForm((current) => ({ ...current, correctedAnswer: event.target.value }))} placeholder="Nếu model sai, nhập câu đúng tại đây để học vào RAG." />
              </label>
              <label className="field-group">
                <span>Nguồn chứng minh</span>
                <input id="review-source-title" value={form.sourceTitle} onChange={(event) => setForm((current) => ({ ...current, sourceTitle: event.target.value }))} placeholder="Tên sách/bài/nguồn" />
                <input id="review-source-url" value={form.sourceUrl} onChange={(event) => setForm((current) => ({ ...current, sourceUrl: event.target.value }))} placeholder="URL nguồn nếu có" />
                <textarea id="review-source-excerpt" rows={3} value={form.sourceExcerpt} onChange={(event) => setForm((current) => ({ ...current, sourceExcerpt: event.target.value }))} placeholder="Trích đoạn chứng minh ngắn gọn" />
              </label>
              <label className="field-group">
                <span>Ghi chú reviewer</span>
                <textarea id="reviewer-note" rows={3} value={form.reviewerNote} onChange={(event) => setForm((current) => ({ ...current, reviewerNote: event.target.value }))} placeholder="Vì sao đúng/sai, cần bổ sung gì?" />
              </label>
            </>
          )}
        </>
      )}

      <button id="export-and-rebuild-rag" className="ghost-button full-width" type="button" disabled={isIndexing} onClick={onExportAndRebuild}>
        <UploadCloud size={16} /> {isIndexing ? 'Đang export & rebuild...' : 'Export approved → rebuild RAG'}
      </button>
    </div>
  );
}

function DiagnosticsPanel({ result }: { result: InferResult }) {
  const hasDiagnostics = result.template_id || result.evidence_status || result.judge_reason || result.citation_warning;
  if (!hasDiagnostics) {
    return null;
  }

  return (
    <div className="warning-list">
      {result.citation_warning && <span><AlertTriangle size={15} /> Gemini prior knowledge: chưa có citation RAG.</span>}
      {result.template_status && <span>Template status: {result.template_status}</span>}
      {result.must_cover_hit?.length ? <span>Must cover hit: {result.must_cover_hit.join(', ')}</span> : null}
      {result.avoid_hit?.length ? <span>Avoid hit: {result.avoid_hit.join(', ')}</span> : null}
      {result.missing_topics?.length ? <span>Missing: {result.missing_topics.join(', ')}</span> : null}
      {result.usable_chunk_ids?.length ? <span>Usable chunks: {result.usable_chunk_ids.join(', ')}</span> : null}
      {result.judge_reason && <span>Judge reason: {result.judge_reason}</span>}
    </div>
  );
}

function buildWarnings(result: InferResult | null, character?: Character): string[] {
  if (!result) {
    return [];
  }

  const warnings: string[] = [];
  if (!result.answer.trim()) {
    warnings.push('Không có nội dung answer sau khi parse SSE.');
  }
  if (character?.ai_policy.citation_required && result.citations.length === 0 && !result.source_evidence?.length) {
    warnings.push('Policy yêu cầu citation nhưng phản hồi chưa có nguồn.');
  }
  if (character?.ai_policy.rag_required && result.citations.length === 0 && !result.source_evidence?.length) {
    warnings.push('RAG bắt buộc nhưng chưa thấy citation/chunk tham chiếu.');
  }
  if (result.answer_origin === 'gemini') {
    warnings.push('Câu này có Gemini tham gia, cần admin xác thực nguồn trước khi cho học vào RAG.');
  }
  return warnings;
}

function estimateWordsPerSecond(answer: string, durationMs = 0): number {
  if (!answer.trim() || durationMs <= 0) {
    return 0;
  }
  const words = answer.trim().split(/\s+/).length;
  return words / (durationMs / 1000);
}

function formatDuration(durationMs: number): string {
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function reviewStatusLabel(status: PersistedReviewFeedback['status']): string {
  const labels: Record<PersistedReviewFeedback['status'], string> = {
    approved: 'Đã review: đúng',
    corrected_approved: 'Đã review: đã sửa',
    needs_source: 'Đã review: cần nguồn',
    rejected: 'Đã review: loại bỏ',
  };
  return labels[status];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 42);
}
