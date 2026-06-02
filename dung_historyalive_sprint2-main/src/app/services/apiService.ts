// src/app/services/apiService.ts

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role?: string;
  grade?: string;
  avatar_url?: string;
  subscription_type: string;
  daily_chat_count: number;
  onboarding_completed: boolean;
  selected_character?: string;
  created_at: string;
}

export interface Character {
  id: string;
  name: string;
  era: string;
  role: string;
  description: string;
  grade: string[];
}

export interface Flashcard {
  id: string;
  user_id: string;
  session_id: string;
  character_id: string;
  character_name: string;
  summary: string;
  key_points: string[];
  created_at: string;
}

// Token management helpers
export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Generic HTTP request handler with interceptor
async function request(url: string, options: RequestInit = {}): Promise<any> {
  const headers = new Headers(options.headers || {});
  
  // Set default JSON Content-Type
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject Bearer Token
  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Handle Token Refresh on 401 Unauthorized
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
          
          // Retry original request
          headers.set('Authorization', `Bearer ${data.access_token}`);
          const retryResponse = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers,
          });

          if (!retryResponse.ok) {
            const errData = await retryResponse.json().catch(() => ({}));
            throw new Error(errData.detail || `Request failed: ${retryResponse.status}`);
          }
          return retryResponse.json();
        }
      } catch (err) {
        console.error('Token refresh failed:', err);
      }
    }

    // Clear tokens and redirect to login if refresh fails
    clearTokens();
    window.location.href = '/login';
    throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `HTTP Error: ${response.status}`);
  }

  return response.json();
}

export const apiService = {
  // Auth API
  async register(email: string, password: string,fullName: string) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    setTokens(data.access_token, data.refresh_token);
    return data;
  },

  async login(email: string, password: string) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setTokens(data.access_token, data.refresh_token);
    return data;
  },

  async logout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).catch(console.error);
    }
    clearTokens();
  },

  // User Profile & Onboarding API
  async getMe(): Promise<User> {
    return request('/users/me');
  },

  async updateMe(fullName: string): Promise<any> {
    return request('/users/me', {
      method: 'PUT',
      body: JSON.stringify({ full_name: fullName }),
    });
  },

  async updateOnboarding(grade: 'cap2' | 'cap3', selectedCharacter: string): Promise<any> {
    return request('/users/me/onboarding', {
      method: 'PUT',
      body: JSON.stringify({ grade, selected_character: selectedCharacter }),
    });
  },

  async getStats(): Promise<{ total_sessions: number; daily_chat_remaining: number }> {
    return request('/users/me/stats');
  },

  // Characters API
  async getCharacters(): Promise<{ characters: Character[]; total: number }> {
    return request('/characters');
  },

  async getCharacter(id: string): Promise<Character> {
    return request(`/characters/${id}`);
  },

  // Chat API
  async startChat(characterId: string): Promise<{ session_id: string; character: Character }> {
    return request('/chat/start', {
      method: 'POST',
      body: JSON.stringify({ character_id: characterId }),
    });
  },

  async endChat(sessionId: string): Promise<{ flashcard_id: string; flashcard: Flashcard; message: string }> {
    return request('/chat/end', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  },

  async getChatHistory(sessionId: string): Promise<{ messages: any[]; status: string }> {
    return request(`/chat/history/${sessionId}`);
  },

  async getChatSessions(): Promise<{ sessions: any[]; page: number }> {
    return request('/chat/sessions');
  },

  // SSE Chat Stream Message
  sendMessageStream(
    sessionId: string,
    message: string,
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (err: any) => void
  ) {
    const token = getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let controller = new AbortController();

    fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ session_id: sessionId, message }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || `Chat request failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Không thể khởi tạo Stream Reader.');
        }

        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || ''; // Keep the last partial line in buffer

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine) continue;

            if (cleanLine.startsWith('data: ')) {
              const dataText = cleanLine.substring(6).trim();
              if (dataText === '[DONE]') {
                onDone();
                return;
              }
              onChunk(dataText);
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          onError(err);
        }
      });

    return () => {
      controller.abort();
    };
  },

  // Flashcards API
  async getFlashcards(): Promise<{ flashcards: Flashcard[] }> {
    return request('/flashcards');
  },

  async getFlashcardDetail(id: string): Promise<Flashcard> {
    return request(`/flashcards/${id}`);
  },

  async deleteFlashcard(id: string): Promise<{ message: string }> {
    return request(`/flashcards/${id}`, {
      method: 'DELETE',
    });
  },

  // Lessons API
  async getLessons(): Promise<{ lessons: any[]; total: number }> {
    return request('/lessons');
  },

  async getLesson(id: string): Promise<any> {
    return request(`/lessons/${id}`);
  },
};
