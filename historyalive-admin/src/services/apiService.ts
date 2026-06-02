// src/services/apiService.ts

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  grade?: string;
  avatar_url?: string;
  subscription_type: string;
  onboarding_completed: boolean;
  created_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  order: number;
  points: number;
  quiz_questions: any[];
  created_at?: string;
}

// Token management helpers
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

// Generic HTTP request handler with interceptor
async function request(url: string, options: RequestInit = {}): Promise<any> {
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
  async login(email: string, password: string) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Fetch profile to verify role
    const headers = { 'Authorization': `Bearer ${data.access_token}` };
    const meResponse = await fetch(`${API_BASE_URL}/users/me`, { headers });
    if (!meResponse.ok) {
      throw new Error("Không thể tải thông tin hồ sơ");
    }
    const profile = await meResponse.json();
    
    if (profile.role !== 'admin') {
      throw new Error("Tài khoản không có quyền truy cập trang quản trị!");
    }
    
    setTokens(data.access_token, data.refresh_token);
    localStorage.setItem('admin_user', JSON.stringify(profile));
    return profile;
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

  async getMe(): Promise<User> {
    return request('/users/me');
  },

  // Public/Lessons API
  async getLessons(): Promise<{ lessons: Lesson[]; total: number }> {
    return request('/lessons');
  },

  async getLesson(id: string): Promise<Lesson> {
    return request(`/lessons/${id}`);
  },

  // Admin APIs
  async getAdminStats(): Promise<{ total_users: number; total_lessons: number; premium_users: number; total_chats: number }> {
    return request('/admin/stats');
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    return request('/admin/users');
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    return request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async updateUserRole(userId: string, role: 'admin' | 'student'): Promise<{ message: string }> {
    return request(`/admin/users/${userId}/role?role=${role}`, {
      method: 'PUT',
    });
  },

  async createLesson(lesson: Omit<Lesson, 'id'>): Promise<{ message: string; lesson_id: string }> {
    return request('/admin/lessons', {
      method: 'POST',
      body: JSON.stringify(lesson),
    });
  },

  async updateLesson(lessonId: string, lesson: Partial<Lesson>): Promise<{ message: string }> {
    return request(`/admin/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(lesson),
    });
  },

  async deleteLesson(lessonId: string): Promise<{ message: string }> {
    return request(`/admin/lessons/${lessonId}`, {
      method: 'DELETE',
    });
  },
};
