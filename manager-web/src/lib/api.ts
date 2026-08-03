import type {
  AssignmentCreate,
  AssignmentSummary,
  AuthSession,
  ClassAssignmentsResponse,
  ClassLessonsResponse,
  ClassStudentsResponse,
  ImportedLessonCreate,
  ImportedLessonSummary,
  LoginResponse,
  StudentDetail,
  TeacherClassesResponse,
} from "../types/teacher";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";
const SESSION_KEY = "history_alive_teacher_session";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getAuthToken() {
  return getStoredSession()?.token ?? null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // Keep fallback message when response is not JSON.
    }

    if (response.status === 401) {
      clearSession();
    }

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export async function login(identity: string, password: string) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identity, password }),
  });
}

export function getTeacherClasses() {
  return request<TeacherClassesResponse>("/teacher/classes");
}

export function getClassStudents(classId: string) {
  return request<ClassStudentsResponse>(`/teacher/classes/${classId}/students`);
}

export function getStudentDetail(classId: string, userId: string) {
  return request<StudentDetail>(`/teacher/classes/${classId}/students/${userId}`);
}

export function getClassLessons(classId: string) {
  return request<ClassLessonsResponse>(`/teacher/classes/${classId}/lessons`);
}

export function importClassLesson(classId: string, payload: ImportedLessonCreate) {
  return request<ImportedLessonSummary>(`/teacher/classes/${classId}/lessons`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getClassAssignments(classId: string) {
  return request<ClassAssignmentsResponse>(`/teacher/classes/${classId}/assignments`);
}

export function createClassAssignment(classId: string, payload: AssignmentCreate) {
  return request<AssignmentSummary>(`/teacher/classes/${classId}/assignments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteClassAssignment(classId: string, assignmentId: string) {
  return request<{ message: string; deleted?: Record<string, number> }>(`/teacher/classes/${classId}/assignments/${assignmentId}`, {
    method: "DELETE",
  });
}

export function deleteClassLesson(classId: string, lessonId: string) {
  return request<{ message: string; deleted?: Record<string, number> }>(`/teacher/classes/${classId}/lessons/${lessonId}`, {
    method: "DELETE",
  });
}
