// src/services/apiService.ts
import type { Character, CharacterPayload, InferResult, KnowledgeImportReport, PersistedReviewFeedback, ReviewFeedbackPayload } from '../types/admin';

const API_BASE_URL = 'http://localhost:8000/api/v1';
const HISTORY_API_BASE_URL = 'http://localhost:8001';

export const CHAPTER_BACKGROUND_LESSON_ID = '__chapter_background__';

export type AdminRole = 'admin' | 'manager' | 'student';
export type UserStatus = 'ACTIVE' | 'BANNED';
export type ProAction = 'upgrade' | 'downgrade';

export interface User {
  _id?: string;
  id?: string;
  email: string;
  username?: string;
  name?: string;
  full_name?: string;
  role: AdminRole | string;
  status?: UserStatus | string;
  grade?: string;
  avatar_url?: string;
  subscription_type?: string;
  onboarding_completed?: boolean;
  isPremium?: boolean;
  created_at?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  order: number;
  points: number;
  quiz_questions: unknown[];
  created_at?: string;
  image_url?: string;
  thumbnail_url?: string;
}

export interface LessonContentSummary {
  title: string;
  subtitle?: string;
  topic_count: number;
  totalQuestions: number;
  topics: Array<{
    id: string | number;
    unitId: string;
    name: string;
    title: string;
    question_count: number;
  }>;
}

export interface LessonContentDocument {
  _id: string;
  status: 'draft' | 'published';
  dataset: Record<string, unknown>;
  source_name?: string;
  updated_at?: string;
  published_at?: string;
}

export interface LessonAsset {
  id?: string;
  unitId: string;
  lessonId: string;
  filename: string;
  content_type: string;
  size: number;
  url: string;
  updated_at?: string;
  created_at?: string;
}

export interface AnalyticsPoint {
  date: string;
  label: string;
  value: number;
}

export type AnalyticsSeriesMode = 'user' | 'revenue' | 'active_users' | 'requests' | 'input_tokens' | 'output_tokens' | 'total_tokens';

export interface TokenMetrics {
  requests?: number;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
}

export interface AdminStats {
  total_users: number;
  total_lessons: number;
  premium_users: number;
  total_chats: number;
  user_metrics?: {
    total_users?: number;
    new_users_today?: number;
    new_users_24h?: number;
    new_users_7d?: number;
    new_users_30d?: number;
    active_users_today?: number;
    premium_users?: number;
    manager_count?: number;
  };
  range_metrics?: Record<string, { new_users?: number }>;
  analytics_series?: Record<string, Partial<Record<AnalyticsSeriesMode, AnalyticsPoint[]>>>;
  token_metrics?: TokenMetrics;
  financial_metrics?: {
    total_revenue?: number;
    mrr?: number;
    transaction_count?: number;
  };
  operational_metrics?: {
    total_lessons?: number;
    total_chats?: number;
  };
}

export interface AdminUserFilters {
  search?: string;
  role?: string;
  status?: string;
  subscription?: string;
}

export interface AdminTransaction {
  id: string;
  user_id: string;
  email: string;
  amount: number;
  plan_type: string;
  payment_gateway: string;
  status: string;
  order_code?: number;
  created_at?: string;
  completed_at?: string;
}

export interface SystemSettings {
  _id?: string;
  class_code_limit: number;
  pro_pricing: {
    monthly_price: number;
    yearly_price: number;
  };
  updated_at?: string;
}

export interface AuditLog {
  _id?: string;
  admin_id: string;
  action: string;
  target_id?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export const getAccessToken = () => localStorage.getItem('admin_access_token');
export const getRefreshToken = () => localStorage.getItem('admin_refresh_token');

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('admin_access_token', accessToken);
  localStorage.setItem('admin_refresh_token', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_refresh_token');
  localStorage.removeItem('admin_user');
};

function formatApiErrorDetail(detail: unknown): string {
  if (!detail) return '';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => formatApiErrorDetail(item)).filter(Boolean).join('\n');
  }
  if (typeof detail === 'object') {
    const record = detail as Record<string, unknown>;
    const location = Array.isArray(record.loc) ? record.loc.join('.') : '';
    const message = typeof record.msg === 'string' ? record.msg : '';
    const type = typeof record.type === 'string' ? record.type : '';
    const compact = [location, message, type].filter(Boolean).join(' — ');
    return compact || JSON.stringify(record, null, 2);
  }
  return String(detail);
}

function buildHttpErrorMessage(status: number, detail: unknown, fallbackPrefix = 'HTTP Error'): string {
  const formattedDetail = formatApiErrorDetail(detail);
  return formattedDetail || `${fallbackPrefix}: ${status}`;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setTokens(data.access_token, refreshToken);

          headers.set('Authorization', `Bearer ${data.access_token}`);
          const retryResponse = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers,
          });

          if (!retryResponse.ok) {
            const errData = await retryResponse.json().catch(() => ({}));
            throw new Error(buildHttpErrorMessage(retryResponse.status, errData.detail, 'Request failed'));
          }
          return retryResponse.json();
        }
      } catch {
        clearTokens();
      }
    }

    clearTokens();
    window.location.href = '/login';
    throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(buildHttpErrorMessage(response.status, errData.detail));
  }

  return response.json();
}

async function uploadRequest<T>(url: string, formData: FormData): Promise<T> {
  const headers = new Headers();
  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(buildHttpErrorMessage(response.status, errData.detail));
  }

  return response.json();
}

async function blobRequest(url: string): Promise<Blob> {
  const headers = new Headers();
  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, { headers });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(buildHttpErrorMessage(response.status, errData.detail));
  }
  return response.blob();
}

function buildQuery(params: Partial<Record<keyof AdminUserFilters, string | undefined>>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

async function historyRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${HISTORY_API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `HTTP Error: ${response.status}`);
  }

  return response.json();
}

function parseInferSse(rawSse: string, timing?: { startedAt: number; completedAt: number }): InferResult {
  const result: InferResult = {
    answer: '',
    citations: [],
    rawSse,
    startedAt: timing?.startedAt,
    completedAt: timing?.completedAt,
    durationMs: timing ? timing.completedAt - timing.startedAt : undefined,
  };

  for (const line of rawSse.split('\n')) {
    if (!line.startsWith('data:')) {
      continue;
    }

    const payload = line.replace(/^data:\s*/, '').trim();
    if (!payload || payload === '[DONE]') {
      continue;
    }

    try {
      const event = JSON.parse(payload);
      if (typeof event.token === 'string') {
        result.answer += event.token;
      }
      if (typeof event.text === 'string') {
        result.answer += event.text;
      }
      if (typeof event.answer === 'string') {
        result.answer = event.answer;
      }
      if (Array.isArray(event.citations)) {
        result.citations = event.citations;
      }
      if (typeof event.mode === 'string') {
        result.mode = event.mode;
      }
      if (typeof event.state === 'string') {
        result.state = event.state;
      }
      if (event.route && typeof event.route === 'object' && !Array.isArray(event.route)) {
        result.route = event.route;
      }
      if (typeof event.fallback_used === 'boolean') {
        result.fallback_used = event.fallback_used;
      }
      if (typeof event.llm_status === 'string') {
        result.llm_status = event.llm_status;
      }
      if (event.timings_ms && typeof event.timings_ms === 'object' && !Array.isArray(event.timings_ms)) {
        result.timings_ms = event.timings_ms;
      }
      if (typeof event.data_source === 'string') {
        result.data_source = event.data_source;
      }
      if (event.visual && typeof event.visual === 'object' && !Array.isArray(event.visual)) {
        result.visual = event.visual;
      }
      copyString(event, result, 'template_id');
      copyString(event, result, 'template_status');
      copyString(event, result, 'evidence_status');
      copyString(event, result, 'judge_reason');
      copyString(event, result, 'llm_judge_status');
      copyArray(event, result, 'must_cover_hit');
      copyArray(event, result, 'avoid_hit');
      copyArray(event, result, 'usable_chunk_ids');
      copyArray(event, result, 'missing_topics');
      if (typeof event.relevance_score === 'number') {
        result.relevance_score = event.relevance_score;
      }
      if (typeof event.citation_warning === 'boolean') {
        result.citation_warning = event.citation_warning;
      }
      if (typeof event.answer_origin === 'string') {
        result.answer_origin = event.answer_origin as InferResult['answer_origin'];
      }
      if (typeof event.requires_review === 'boolean') {
        result.requires_review = event.requires_review;
      }
      copyArray(event, result, 'source_evidence');
    } catch {
      result.answer += payload;
    }
  }

  return result;
}

function copyString(event: Record<string, unknown>, result: InferResult, key: keyof InferResult) {
  if (typeof event[key] === 'string') {
    (result as unknown as Record<string, unknown>)[key] = event[key];
  }
}

function copyArray(event: Record<string, unknown>, result: InferResult, key: keyof InferResult) {
  if (Array.isArray(event[key])) {
    (result as unknown as Record<string, unknown>)[key] = event[key];
  }
}

export const apiService = {
  async login(email: string, password: string) {
    const data = await request<{ access_token: string; refresh_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identity: email, password }),
    });

    const headers = { Authorization: `Bearer ${data.access_token}` };
    const meResponse = await fetch(`${API_BASE_URL}/users/me`, { headers });
    if (!meResponse.ok) {
      throw new Error('Không thể tải thông tin hồ sơ');
    }
    const profile = await meResponse.json();

    if (profile.role !== 'admin') {
      throw new Error('Tài khoản không có quyền truy cập trang quản trị!');
    }

    setTokens(data.access_token, data.refresh_token);
    localStorage.setItem('admin_user', JSON.stringify(profile));
    return profile;
  },

  async logout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } finally {
        clearTokens();
      }
    }
    clearTokens();
  },

  async getMe(): Promise<User> {
    return request<User>('/users/me');
  },

  async getLessons(): Promise<{ lessons: Lesson[]; total: number }> {
    return request<{ lessons: Lesson[]; total: number }>('/lessons');
  },

  async getLesson(id: string): Promise<Lesson> {
    return request<Lesson>(`/lessons/${id}`);
  },

  async getAdminStats(): Promise<AdminStats> {
    return request<AdminStats>('/admin/stats');
  },

  async getAdminUsers(filters: AdminUserFilters = {}): Promise<{ users: User[] }> {
    return request<{ users: User[] }>(`/admin/users${buildQuery(filters)}`);
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
  },

  async updateUserRole(userId: string, role: AdminRole): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/users/${encodeURIComponent(userId)}/role?role=${encodeURIComponent(role)}`, { method: 'PUT' });
  },

  async updateUserStatus(userId: string, status: UserStatus): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/users/${encodeURIComponent(userId)}/status?status=${encodeURIComponent(status)}`, { method: 'PUT' });
  },

  async updateUserPro(userId: string, action: ProAction): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/users/${encodeURIComponent(userId)}/pro?action=${encodeURIComponent(action)}`, { method: 'PUT' });
  },

  async getTransactions(): Promise<{ transactions: AdminTransaction[] }> {
    return request<{ transactions: AdminTransaction[] }>('/admin/transactions');
  },

  async exportTransactions(): Promise<Blob> {
    return blobRequest('/admin/transactions/export');
  },

  async getSettings(): Promise<SystemSettings> {
    return request<SystemSettings>('/admin/settings');
  },

  async updateSettings(payload: Partial<SystemSettings>): Promise<SystemSettings> {
    return request<SystemSettings>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async getAuditLogs(): Promise<{ logs: AuditLog[] }> {
    return request<{ logs: AuditLog[] }>('/admin/audit-logs');
  },

  async createLesson(lesson: Omit<Lesson, 'id'>): Promise<{ message: string; lesson_id: string }> {
    return request<{ message: string; lesson_id: string }>('/admin/lessons', {
      method: 'POST',
      body: JSON.stringify(lesson),
    });
  },

  async updateLesson(lessonId: string, lesson: Partial<Lesson>): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(lesson),
    });
  },

  async deleteLesson(lessonId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/lessons/${lessonId}`, { method: 'DELETE' });
  },

  async previewLessonContent(dataset: Record<string, unknown>, sourceName = 'admin-json'): Promise<{ valid: boolean; summary: LessonContentSummary }> {
    return request<{ valid: boolean; summary: LessonContentSummary }>('/lesson-content/admin/preview', {
      method: 'POST',
      body: JSON.stringify({ dataset, source_name: sourceName }),
    });
  },

  async importLessonContentDraft(dataset: Record<string, unknown>, sourceName = 'admin-json'): Promise<{ message: string; summary: LessonContentSummary }> {
    return request<{ message: string; summary: LessonContentSummary }>('/lesson-content/admin/draft', {
      method: 'POST',
      body: JSON.stringify({ dataset, source_name: sourceName }),
    });
  },

  async patchLessonContentTopic(topic: Record<string, unknown>, sourceName = 'admin-lesson-topic'): Promise<{ message: string; summary: LessonContentSummary }> {
    return request<{ message: string; summary: LessonContentSummary }>('/lesson-content/admin/topic', {
      method: 'PUT',
      body: JSON.stringify({ topic, source_name: sourceName }),
    });
  },

  async deleteLessonContentTopic(topicId: string): Promise<{ message: string; summary: LessonContentSummary; deleted_topic_id: string }> {
    return request<{ message: string; summary: LessonContentSummary; deleted_topic_id: string }>(`/lesson-content/admin/topic/${topicId}`, {
      method: 'DELETE',
    });
  },

  async getLessonContentDraft(): Promise<LessonContentDocument> {
    return request<LessonContentDocument>('/lesson-content/admin/draft');
  },

  async getPublishedLessonContent(): Promise<LessonContentDocument> {
    return request<LessonContentDocument>('/lesson-content/admin/published');
  },

  async publishLessonContent(): Promise<{ message: string; published_at: string }> {
    return request<{ message: string; published_at: string }>('/lesson-content/admin/publish', { method: 'POST' });
  },

  async listLessonAssets(): Promise<{ assets: LessonAsset[] }> {
    return request<{ assets: LessonAsset[] }>('/lesson-content/admin/assets');
  },

  async uploadLessonAsset(unitId: string, lessonId: string, file: File): Promise<{ message: string; asset: LessonAsset }> {
    const formData = new FormData();
    formData.append('file', file);
    return uploadRequest<{ message: string; asset: LessonAsset }>(`/lesson-content/admin/assets?unit_id=${encodeURIComponent(unitId)}&lesson_id=${encodeURIComponent(lessonId)}`, formData);
  },

  async uploadChapterBackground(unitId: string, file: File): Promise<{ message: string; asset: LessonAsset }> {
    return this.uploadLessonAsset(unitId, CHAPTER_BACKGROUND_LESSON_ID, file);
  },

  async getCharacters(): Promise<{ characters: Character[]; total: number }> {
    return request<{ characters: Character[]; total: number }>('/admin/characters');
  },

  async getCharacter(characterId: string): Promise<Character> {
    return request<Character>(`/admin/characters/${characterId}`);
  },

  async createCharacter(payload: CharacterPayload & { character_id: string }): Promise<{ message: string; character: Character }> {
    return request<{ message: string; character: Character }>('/admin/characters', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateCharacter(characterId: string, payload: CharacterPayload): Promise<{ message: string; character: Character }> {
    return request<{ message: string; character: Character }>(`/admin/characters/${characterId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async uploadCharacterPortrait(characterId: string, file: File): Promise<{ message: string; character: Character }> {
    const formData = new FormData();
    formData.append('file', file);
    return uploadRequest<{ message: string; character: Character }>(`/admin/characters/${characterId}/portrait`, formData);
  },

  async archiveCharacter(characterId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/characters/${characterId}`, { method: 'DELETE' });
  },

  async uploadKnowledge(characterId: string, file: File): Promise<KnowledgeImportReport> {
    const formData = new FormData();
    formData.append('character_id', characterId);
    formData.append('file', file);
    return uploadRequest<KnowledgeImportReport>('/admin/knowledge/upload', formData);
  },

  async infer(characterId: string, message: string): Promise<InferResult> {
    const startedAt = performance.now();
    const response = await request<{ raw_sse?: string }>('/admin/infer', {
      method: 'POST',
      body: JSON.stringify({ character_id: characterId, message, include_draft: true }),
    });
    const completedAt = performance.now();
    return parseInferSse(response.raw_sse || '', { startedAt, completedAt });
  },

  async saveReviewFeedback(payload: ReviewFeedbackPayload): Promise<{ ok: boolean; feedback: PersistedReviewFeedback }> {
    return historyRequest<{ ok: boolean; feedback: PersistedReviewFeedback }>('/admin/review-feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getLatestReviewFeedback(characterId: string, question: string): Promise<{ ok: boolean; feedback: PersistedReviewFeedback | null }> {
    const params = new URLSearchParams({ character_id: characterId, question });
    return historyRequest<{ ok: boolean; feedback: PersistedReviewFeedback | null }>(`/admin/review-feedback/latest?${params.toString()}`);
  },

  async transitionReviewFeedback(reviewId: string, payload: Partial<ReviewFeedbackPayload>): Promise<{ ok: boolean; feedback: PersistedReviewFeedback }> {
    return historyRequest<{ ok: boolean; feedback: PersistedReviewFeedback }>(`/admin/review-feedback/${encodeURIComponent(reviewId)}/transition`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteReviewFeedback(reviewId: string): Promise<{ ok: boolean; deleted: PersistedReviewFeedback; removed_count: number }> {
    return historyRequest<{ ok: boolean; deleted: PersistedReviewFeedback; removed_count: number }>(`/admin/review-feedback/${encodeURIComponent(reviewId)}`, {
      method: 'DELETE',
    });
  },

  async exportApprovedKnowledge(): Promise<{ ok: boolean; exported_count: number; skipped_count: number; output_path: string }> {
    return historyRequest<{ ok: boolean; exported_count: number; skipped_count: number; output_path: string }>('/admin/knowledge/export-approved', {
      method: 'POST',
    });
  },

  async rebuildKnowledgeIndex(characterId: string): Promise<Record<string, unknown>> {
    return historyRequest<Record<string, unknown>>(`/admin/knowledge/rebuild-index?character_id=${encodeURIComponent(characterId)}`, {
      method: 'POST',
    });
  },
};
