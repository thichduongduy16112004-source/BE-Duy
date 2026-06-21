export type CharacterStatus = 'draft' | 'active' | 'archived';
export type PriorKnowledgePolicy = 'disabled' | 'allowed_with_warning' | 'general_history_only';

export interface PersonaContext {
  role_name: string;
  era_context: string;
  tone: string;
  target_audience: string;
  speaking_rules: string[];
  historical_scope: string;
  sensitive_topics: string[];
}

export interface RagTemplate {
  intent: string;
  display_name: string;
  sample_questions: string[];
  rag_queries: string[];
  must_cover: string[];
  avoid: string[];
  expected_answer_outline: string[];
}

export interface AiPolicy {
  answer_style: string;
  max_answer_words: number;
  min_answer_words: number;
  allowed_topics: string[];
  blocked_topics: string[];
  rag_required: boolean;
  allow_gemini_prior_knowledge: boolean;
  web_fallback_enabled: boolean;
  citation_required: boolean;
  gemini_judge_enabled: boolean;
  gemini_synthesis_enabled: boolean;
  prior_knowledge_policy: PriorKnowledgePolicy;
  out_of_scope_response: string;
}

export interface Character {
  id?: string;
  character_id: string;
  display_name: string;
  era: string;
  death_year?: number | null;
  short_bio: string;
  personality_prompt: string;
  portrait_url: string;
  tts_voice_id: string;
  status: CharacterStatus;
  ai_policy: AiPolicy;
  persona_context: PersonaContext;
  rag_templates: RagTemplate[];
  chunk_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CharacterPayload {
  character_id?: string;
  display_name: string;
  era: string;
  death_year?: number | null;
  short_bio: string;
  personality_prompt: string;
  portrait_url: string;
  tts_voice_id: string;
  status: CharacterStatus;
  ai_policy: AiPolicy;
  persona_context: PersonaContext;
  rag_templates: RagTemplate[];
}

export interface KnowledgeImportReport {
  inserted: number;
  skipped: number;
  failed: number;
  errors: string[];
}

export interface Citation {
  chunk_id?: string;
  source_title?: string;
  source_url?: string;
  source_year?: string;
  source_tier?: number | null;
  source_excerpt?: string;
  claim_status?: string;
  text?: string;
}

export interface InferResult {
  answer: string;
  citations: Citation[];
  rawSse: string;
  durationMs?: number;
  startedAt?: number;
  completedAt?: number;
  mode?: string;
  state?: string;
  route?: Record<string, unknown>;
  fallback_used?: boolean;
  llm_status?: string;
  timings_ms?: Record<string, number>;
  data_source?: string;
  visual?: Record<string, unknown>;
  template_id?: string;
  template_status?: string;
  must_cover_hit?: string[];
  avoid_hit?: string[];
  evidence_status?: string;
  llm_judge_status?: string;
  relevance_score?: number;
  judge_reason?: string;
  usable_chunk_ids?: string[];
  missing_topics?: string[];
  citation_warning?: boolean;
  source_evidence?: SourceEvidence[];
  answer_origin?: ReviewAnswerOrigin;
  requires_review?: boolean;
}

export type ReviewAnswerOrigin = 'rag' | 'gemini' | 'admin_corrected';
export type ReviewFeedbackStatus = 'approved' | 'rejected' | 'needs_source' | 'corrected_approved';
export type ReviewErrorType = 'off_topic' | 'wrong_fact' | 'missing_source' | 'unsafe_prior' | 'duplicate' | 'other';

export interface SourceEvidence {
  chunk_id?: string;
  source_title?: string;
  source_url?: string;
  source_year?: string;
  source_tier?: number | null;
  source_excerpt?: string;
  claim_status?: string;
  text?: string;
}

export interface ReviewFeedbackPayload {
  question: string;
  character_id: string;
  answer_origin: ReviewAnswerOrigin;
  status: ReviewFeedbackStatus;
  model_answer?: string;
  corrected_answer?: string;
  error_type?: ReviewErrorType | '';
  source_title?: string;
  source_url?: string;
  source_excerpt?: string;
  source_tier?: number | null;
  reviewer_note?: string;
  correction_of_review_id?: string;
}

export interface PersistedReviewFeedback extends ReviewFeedbackPayload {
  review_id: string;
  created_at: string;
  question_hash: string;
  source_hash?: string;
}
