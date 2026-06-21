import { Plus, Save, ShieldCheck, Trash2, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Feedback, LoadingState } from '../components/Feedback';
import { apiService } from '../services/apiService';
import type { AiPolicy, CharacterPayload, CharacterStatus, PersonaContext, RagTemplate, PriorKnowledgePolicy } from '../types/admin';

const defaultAiPolicy: AiPolicy = {
  answer_style: 'roleplay_educational',
  min_answer_words: 60,
  max_answer_words: 220,
  allowed_topics: ['history', 'biography', 'battle', 'strategy', 'culture'],
  blocked_topics: ['politics_current', 'medical', 'financial', 'adult', 'violence_instruction'],
  rag_required: true,
  allow_gemini_prior_knowledge: false,
  web_fallback_enabled: false,
  citation_required: true,
  gemini_judge_enabled: false,
  gemini_synthesis_enabled: true,
  prior_knowledge_policy: 'disabled',
  out_of_scope_response: 'Ta chỉ có thể bàn về sử liệu và bối cảnh lịch sử liên quan đến nhân vật này.',
};

const defaultPersonaContext: PersonaContext = {
  role_name: '',
  era_context: '',
  tone: '',
  target_audience: 'general',
  speaking_rules: [],
  historical_scope: '',
  sensitive_topics: [],
};

const defaultForm: CharacterPayload = {
  character_id: '',
  display_name: '',
  era: '',
  death_year: null,
  short_bio: '',
  personality_prompt: '',
  portrait_url: '',
  tts_voice_id: 'vi-VN-default',
  status: 'draft',
  ai_policy: defaultAiPolicy,
  persona_context: defaultPersonaContext,
  rag_templates: [],
};

const emptyTemplate = (): RagTemplate => ({
  intent: 'contribution_overview',
  display_name: 'Đóng góp nổi bật',
  sample_questions: ['Đóng góp nổi bật của ông là gì?'],
  rag_queries: [],
  must_cover: [],
  avoid: [],
  expected_answer_outline: [],
});

export default function CharacterEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState<CharacterPayload>(defaultForm);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      setForm(defaultForm);
      return;
    }

    const loadCharacter = async () => {
      setIsLoading(true);
      setError('');
      try {
        const character = await apiService.getCharacter(id);
        setForm({
          character_id: character.character_id,
          display_name: character.display_name,
          era: character.era,
          death_year: character.death_year ?? null,
          short_bio: character.short_bio,
          personality_prompt: character.personality_prompt,
          portrait_url: character.portrait_url,
          tts_voice_id: character.tts_voice_id,
          status: character.status,
          ai_policy: mergeAiPolicy(character.ai_policy),
          persona_context: mergePersonaContext(character.persona_context),
          rag_templates: normalizeTemplates(character.rag_templates),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải nhân vật.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadCharacter();
  }, [id]);

  const updateField = (field: keyof CharacterPayload, value: string | number | null) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updatePolicy = <Key extends keyof AiPolicy>(field: Key, value: AiPolicy[Key]) => {
    setForm((current) => ({
      ...current,
      ai_policy: {
        ...current.ai_policy,
        [field]: value,
        ...(field === 'allow_gemini_prior_knowledge' && value === false ? { prior_knowledge_policy: 'disabled' as PriorKnowledgePolicy } : {}),
      },
    }));
  };

  const updatePersona = <Key extends keyof PersonaContext>(field: Key, value: PersonaContext[Key]) => {
    setForm((current) => ({
      ...current,
      persona_context: { ...current.persona_context, [field]: value },
    }));
  };

  const updateTemplate = <Key extends keyof RagTemplate>(index: number, field: Key, value: RagTemplate[Key]) => {
    setForm((current) => ({
      ...current,
      rag_templates: current.rag_templates.map((template, templateIndex) => (
        templateIndex === index ? { ...template, [field]: value } : template
      )),
    }));
  };

  const addTemplate = () => {
    setForm((current) => ({ ...current, rag_templates: [...current.rag_templates, emptyTemplate()] }));
  };

  const removeTemplate = (index: number) => {
    setForm((current) => ({ ...current, rag_templates: current.rag_templates.filter((_, templateIndex) => templateIndex !== index) }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const payload = normalizePayload(form);
      if (isEditing && id) {
        await apiService.updateCharacter(id, payload);
      } else {
        await apiService.createCharacter(payload as CharacterPayload & { character_id: string });
      }
      navigate('/characters');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu nhân vật.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState label="Đang tải hồ sơ nhân vật..." />;
  }

  return (
    <form className="editor-grid" onSubmit={handleSubmit}>
      <div className="editor-stack">
        <div className="command-panel editor-main">
          <div className="section-heading">
            <p className="panel-kicker">Persona Profile</p>
            <h2>{isEditing ? 'Chỉnh sửa nhân vật' : 'Tạo nhân vật mới'}</h2>
          </div>

          <Feedback message={error} tone="error" />

          <div className="form-grid two-columns">
            <label className="field-group">
              <span>Character ID</span>
              <input id="character-id" value={form.character_id || ''} onChange={(event) => updateField('character_id', event.target.value)} placeholder="tran_hung_dao" pattern="^[a-z0-9][a-z0-9_-]*$" disabled={isEditing} required />
            </label>
            <label className="field-group">
              <span>Tên hiển thị</span>
              <input id="character-display-name" value={form.display_name} onChange={(event) => updateField('display_name', event.target.value)} placeholder="Trần Hưng Đạo" required />
            </label>
            <label className="field-group">
              <span>Thời kỳ</span>
              <input id="character-era" value={form.era} onChange={(event) => updateField('era', event.target.value)} placeholder="Nhà Trần" />
            </label>
            <label className="field-group">
              <span>Năm mất</span>
              <input id="character-death-year" type="number" value={form.death_year ?? ''} onChange={(event) => updateField('death_year', event.target.value ? Number(event.target.value) : null)} placeholder="1300" />
            </label>
            <label className="field-group">
              <span>Portrait URL</span>
              <input id="character-portrait-url" value={form.portrait_url} onChange={(event) => updateField('portrait_url', event.target.value)} placeholder="https://..." />
            </label>
            <label className="field-group">
              <span>TTS Voice ID</span>
              <input id="character-tts-voice" value={form.tts_voice_id} onChange={(event) => updateField('tts_voice_id', event.target.value)} placeholder="vi-VN-default" />
            </label>
          </div>

          <label className="field-group">
            <span>Mô tả ngắn</span>
            <textarea id="character-short-bio" value={form.short_bio} onChange={(event) => updateField('short_bio', event.target.value)} rows={4} placeholder="Tóm tắt vai trò lịch sử và góc nhìn của nhân vật." />
          </label>

          <label className="field-group">
            <span>Personality Prompt</span>
            <textarea id="character-personality" value={form.personality_prompt} onChange={(event) => updateField('personality_prompt', event.target.value)} rows={8} placeholder="Quy tắc giọng nói, giới hạn lịch sử, cách trích dẫn và hành vi hội thoại." />
          </label>
        </div>

        <section className="command-panel ai-policy-panel">
          <div className="section-heading">
            <p className="panel-kicker"><ShieldCheck size={16} /> Persona Context</p>
            <h2>Bối cảnh nhập vai</h2>
            <p>Cấu hình vai trò, giọng nói, phạm vi lịch sử và người đọc mục tiêu cho từng nhân vật.</p>
          </div>

          <div className="form-grid two-columns">
            <label className="field-group">
              <span>Role name</span>
              <input id="persona-role-name" value={form.persona_context.role_name} onChange={(event) => updatePersona('role_name', event.target.value)} placeholder="Hưng Đạo Vương Trần Quốc Tuấn" />
            </label>
            <label className="field-group">
              <span>Target audience</span>
              <input id="persona-target-audience" value={form.persona_context.target_audience} onChange={(event) => updatePersona('target_audience', event.target.value)} placeholder="middle_school" />
            </label>
            <label className="field-group">
              <span>Era context</span>
              <textarea id="persona-era-context" value={form.persona_context.era_context} onChange={(event) => updatePersona('era_context', event.target.value)} rows={3} placeholder="Thế kỷ 13, triều Trần, kháng chiến chống Nguyên Mông." />
            </label>
            <label className="field-group">
              <span>Tone</span>
              <textarea id="persona-tone" value={form.persona_context.tone} onChange={(event) => updatePersona('tone', event.target.value)} rows={3} placeholder="Uy nghi, điềm tĩnh, dễ hiểu, truyền cảm hứng." />
            </label>
            <label className="field-group">
              <span>Speaking rules</span>
              <textarea id="persona-speaking-rules" value={form.persona_context.speaking_rules.join('\n')} onChange={(event) => updatePersona('speaking_rules', splitLineList(event.target.value))} rows={4} placeholder="Mỗi dòng một rule: Xưng là ta; Không nói như AI..." />
            </label>
            <label className="field-group">
              <span>Sensitive topics</span>
              <textarea id="persona-sensitive-topics" value={form.persona_context.sensitive_topics.join('\n')} onChange={(event) => updatePersona('sensitive_topics', splitLineList(event.target.value))} rows={4} placeholder="Mỗi dòng một chủ đề cần cẩn trọng." />
            </label>
          </div>
          <label className="field-group">
            <span>Historical scope</span>
            <textarea id="persona-historical-scope" value={form.persona_context.historical_scope} onChange={(event) => updatePersona('historical_scope', event.target.value)} rows={4} placeholder="Chỉ trả lời trong phạm vi đời sống, di sản và bối cảnh lịch sử liên quan đến nhân vật." />
          </label>
        </section>

        <section className="command-panel ai-policy-panel">
          <div className="section-heading">
            <p className="panel-kicker"><ShieldCheck size={16} /> AI Behavior Control</p>
            <h2>Luật trả lời</h2>
            <p>Admin kiểm soát giới hạn câu chữ, chủ đề cho phép, mức phụ thuộc RAG và quyền dùng Gemini.</p>
          </div>

          <div className="form-grid two-columns">
            <label className="field-group">
              <span>Answer style</span>
              <input id="ai-answer-style" value={form.ai_policy.answer_style} onChange={(event) => updatePolicy('answer_style', event.target.value)} placeholder="roleplay_educational" />
            </label>
            <label className="field-group">
              <span>Prior knowledge policy</span>
              <select id="ai-prior-policy" value={form.ai_policy.prior_knowledge_policy} onChange={(event) => updatePolicy('prior_knowledge_policy', event.target.value as PriorKnowledgePolicy)} disabled={!form.ai_policy.allow_gemini_prior_knowledge}>
                <option value="disabled">Disabled</option>
                <option value="allowed_with_warning">Allowed with warning</option>
                <option value="general_history_only">General history only</option>
              </select>
            </label>
            <label className="field-group">
              <span>Min words</span>
              <input id="ai-min-words" type="number" min={20} max={250} value={form.ai_policy.min_answer_words} onChange={(event) => updatePolicy('min_answer_words', Number(event.target.value))} />
            </label>
            <label className="field-group">
              <span>Max words</span>
              <input id="ai-max-words" type="number" min={40} max={500} value={form.ai_policy.max_answer_words} onChange={(event) => updatePolicy('max_answer_words', Number(event.target.value))} />
            </label>
            <label className="field-group">
              <span>Allowed topics</span>
              <input id="ai-allowed-topics" value={form.ai_policy.allowed_topics.join(', ')} onChange={(event) => updatePolicy('allowed_topics', splitTopicList(event.target.value))} placeholder="history, biography, battle" />
            </label>
            <label className="field-group">
              <span>Blocked topics</span>
              <input id="ai-blocked-topics" value={form.ai_policy.blocked_topics.join(', ')} onChange={(event) => updatePolicy('blocked_topics', splitTopicList(event.target.value))} placeholder="medical, financial" />
            </label>
            <label className="field-group">
              <span>Out-of-scope response</span>
              <textarea id="ai-out-of-scope" value={form.ai_policy.out_of_scope_response} onChange={(event) => updatePolicy('out_of_scope_response', event.target.value)} rows={3} />
            </label>
          </div>

          <div className="policy-toggle-grid">
            <label className="policy-toggle">
              <input id="ai-rag-required" type="checkbox" checked={form.ai_policy.rag_required} onChange={(event) => updatePolicy('rag_required', event.target.checked)} />
              <span>RAG bắt buộc</span>
              <small>Ưu tiên dữ liệu nhân vật trước khi sinh câu trả lời.</small>
            </label>
            <label className="policy-toggle">
              <input id="ai-citation-required" type="checkbox" checked={form.ai_policy.citation_required} onChange={(event) => updatePolicy('citation_required', event.target.checked)} />
              <span>Bắt buộc citation</span>
              <small>Cảnh báo nếu câu trả lời không có nguồn.</small>
            </label>
            <label className="policy-toggle">
              <input id="ai-gemini-judge" type="checkbox" checked={form.ai_policy.gemini_judge_enabled} onChange={(event) => updatePolicy('gemini_judge_enabled', event.target.checked)} />
              <span>Gemini Evidence Judge</span>
              <small>Để Gemini kiểm tra citation có đúng trọng tâm không.</small>
            </label>
            <label className="policy-toggle">
              <input id="ai-gemini-synthesis" type="checkbox" checked={form.ai_policy.gemini_synthesis_enabled} onChange={(event) => updatePolicy('gemini_synthesis_enabled', event.target.checked)} />
              <span>Gemini synthesis</span>
              <small>Cho Gemini diễn đạt câu trả lời từ RAG đã được kiểm.</small>
            </label>
            <label className="policy-toggle">
              <input id="ai-gemini-prior" type="checkbox" checked={form.ai_policy.allow_gemini_prior_knowledge} onChange={(event) => updatePolicy('allow_gemini_prior_knowledge', event.target.checked)} />
              <span>Cho phép Gemini bổ sung</span>
              <small>Chỉ dùng khi RAG thiếu và phải hiển thị warning.</small>
            </label>
            <label className="policy-toggle">
              <input id="ai-web-fallback" type="checkbox" checked={form.ai_policy.web_fallback_enabled} onChange={(event) => updatePolicy('web_fallback_enabled', event.target.checked)} />
              <span>Web fallback</span>
              <small>MVP chỉ lưu cấu hình; pipeline web sẽ nối ở phase sau.</small>
            </label>
          </div>
        </section>

        <section className="command-panel ai-policy-panel">
          <div className="section-heading">
            <p className="panel-kicker">RAG Templates</p>
            <h2>Câu hỏi mẫu và truy vấn ưu tiên</h2>
            <p>Template giúp câu hỏi chung chung đi vào đúng intent và đúng nhóm tư liệu.</p>
          </div>

          {form.rag_templates.map((template, index) => (
            <div className="command-panel" key={`${template.intent}-${index}`}>
              <div className="section-heading">
                <p className="panel-kicker">Template #{index + 1}</p>
                <h3>{template.display_name || template.intent}</h3>
              </div>
              <div className="form-grid two-columns">
                <label className="field-group">
                  <span>Intent</span>
                  <input id={`template-intent-${index}`} value={template.intent} onChange={(event) => updateTemplate(index, 'intent', event.target.value)} placeholder="contribution_overview" />
                </label>
                <label className="field-group">
                  <span>Display name</span>
                  <input id={`template-display-${index}`} value={template.display_name} onChange={(event) => updateTemplate(index, 'display_name', event.target.value)} placeholder="Đóng góp nổi bật" />
                </label>
                <TemplateTextarea id={`template-samples-${index}`} label="Sample questions" value={template.sample_questions} onChange={(value) => updateTemplate(index, 'sample_questions', value)} />
                <TemplateTextarea id={`template-queries-${index}`} label="Preferred RAG queries" value={template.rag_queries} onChange={(value) => updateTemplate(index, 'rag_queries', value)} />
                <TemplateTextarea id={`template-must-cover-${index}`} label="Must cover" value={template.must_cover} onChange={(value) => updateTemplate(index, 'must_cover', value)} />
                <TemplateTextarea id={`template-avoid-${index}`} label="Avoid" value={template.avoid} onChange={(value) => updateTemplate(index, 'avoid', value)} />
              </div>
              <TemplateTextarea id={`template-outline-${index}`} label="Expected answer outline" value={template.expected_answer_outline} onChange={(value) => updateTemplate(index, 'expected_answer_outline', value)} />
              <button id={`remove-template-${index}`} className="ghost-button" type="button" onClick={() => removeTemplate(index)}>
                <Trash2 size={16} /> Xóa template
              </button>
            </div>
          ))}

          <button id="add-rag-template" className="ghost-button" type="button" onClick={addTemplate}>
            <Plus size={16} /> Thêm RAG template
          </button>
        </section>
      </div>

      <aside className="command-panel editor-side">
        <div className="section-heading">
          <p className="panel-kicker">Release State</p>
          <h2>Trạng thái</h2>
        </div>
        <label className="field-group">
          <span>Publish status</span>
          <select id="character-status" value={form.status} onChange={(event) => updateField('status', event.target.value as CharacterStatus)}>
            <option value="draft">Bản nháp</option>
            <option value="active">Đang phát hành</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
        </label>
        <div className="release-note">
          <strong>Gợi ý:</strong> Giữ trạng thái draft cho đến khi JSONL knowledge import và infer test trả lời đúng.
        </div>
        <div className="side-actions">
          <button id="save-character" className="primary-button full-width" type="submit" disabled={isSaving}>
            <Save size={17} /> {isSaving ? 'Đang lưu...' : 'Lưu nhân vật'}
          </button>
          <Link className="ghost-button full-width" to="/characters">
            <X size={17} /> Huỷ
          </Link>
        </div>
      </aside>
    </form>
  );
}

function TemplateTextarea({ id, label, value, onChange }: { id: string; label: string; value: string[]; onChange: (value: string[]) => void }) {
  return (
    <label className="field-group">
      <span>{label}</span>
      <textarea id={id} value={value.join('\n')} onChange={(event) => onChange(splitLineList(event.target.value))} rows={4} placeholder="Mỗi dòng một mục" />
    </label>
  );
}

function normalizePayload(form: CharacterPayload): CharacterPayload {
  const aiPolicy = mergeAiPolicy(form.ai_policy);
  const minWords = clampNumber(aiPolicy.min_answer_words, 20, 250);
  const maxWords = clampNumber(Math.max(aiPolicy.max_answer_words, minWords), 40, 500);
  const allowPrior = aiPolicy.allow_gemini_prior_knowledge;

  return {
    ...form,
    character_id: form.character_id?.trim(),
    display_name: form.display_name.trim(),
    era: form.era.trim(),
    short_bio: form.short_bio.trim(),
    personality_prompt: form.personality_prompt.trim(),
    portrait_url: form.portrait_url.trim(),
    tts_voice_id: form.tts_voice_id.trim() || 'vi-VN-default',
    death_year: form.death_year || null,
    ai_policy: {
      ...aiPolicy,
      answer_style: aiPolicy.answer_style.trim() || defaultAiPolicy.answer_style,
      min_answer_words: minWords,
      max_answer_words: maxWords,
      allowed_topics: aiPolicy.allowed_topics,
      blocked_topics: aiPolicy.blocked_topics,
      prior_knowledge_policy: allowPrior ? aiPolicy.prior_knowledge_policy : 'disabled',
      out_of_scope_response: aiPolicy.out_of_scope_response.trim() || defaultAiPolicy.out_of_scope_response,
    },
    persona_context: normalizePersonaContext(form.persona_context),
    rag_templates: normalizeTemplates(form.rag_templates),
  };
}

function mergeAiPolicy(policy?: Partial<AiPolicy>): AiPolicy {
  return {
    ...defaultAiPolicy,
    ...policy,
    allowed_topics: policy?.allowed_topics?.length ? policy.allowed_topics : defaultAiPolicy.allowed_topics,
    blocked_topics: policy?.blocked_topics?.length ? policy.blocked_topics : defaultAiPolicy.blocked_topics,
    prior_knowledge_policy: policy?.allow_gemini_prior_knowledge ? policy.prior_knowledge_policy ?? 'allowed_with_warning' : 'disabled',
  };
}

function mergePersonaContext(context?: Partial<PersonaContext>): PersonaContext {
  return {
    ...defaultPersonaContext,
    ...context,
    speaking_rules: context?.speaking_rules?.length ? context.speaking_rules : [],
    sensitive_topics: context?.sensitive_topics?.length ? context.sensitive_topics : [],
  };
}

function normalizePersonaContext(context: PersonaContext): PersonaContext {
  return {
    role_name: context.role_name.trim(),
    era_context: context.era_context.trim(),
    tone: context.tone.trim(),
    target_audience: context.target_audience.trim() || 'general',
    speaking_rules: context.speaking_rules.map((rule) => rule.trim()).filter(Boolean).slice(0, 30),
    historical_scope: context.historical_scope.trim(),
    sensitive_topics: context.sensitive_topics.map((topic) => topic.trim()).filter(Boolean).slice(0, 30),
  };
}

function normalizeTemplates(templates?: RagTemplate[]): RagTemplate[] {
  return (templates ?? [])
    .map((template) => ({
      intent: template.intent.trim() || 'general_history',
      display_name: template.display_name.trim(),
      sample_questions: normalizeList(template.sample_questions, 20),
      rag_queries: normalizeList(template.rag_queries, 20),
      must_cover: normalizeList(template.must_cover, 30),
      avoid: normalizeList(template.avoid, 30),
      expected_answer_outline: normalizeList(template.expected_answer_outline, 20),
    }))
    .filter((template) => template.intent)
    .slice(0, 30);
}

function normalizeList(values: string[], limit: number): string[] {
  return values.map((value) => value.trim()).filter(Boolean).slice(0, limit);
}

function splitTopicList(value: string): string[] {
  return value
    .split(',')
    .map((topic) => topic.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function splitLineList(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}
