export interface ClassSummary {
  id: string;
  name: string;
  school_name: string;
  class_code: string;
  student_count: number;
  slot_limit: number;
  status: string;
  expires_at: string | null;
}

export interface StudentSummary {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  progress_percent: number;
  current_lesson: string;
  avg_score: number | null;
  last_active: string | null;
  needs_support: boolean;
}

export interface LessonDetail {
  lesson_id: string;
  title: string;
  status: "completed" | "in_progress" | "locked" | "not_started" | string;
  score: number | null;
  time_spent_minutes: number | null;
  completed_at: string | null;
}

export interface StudentDetail {
  user_id: string;
  full_name: string;
  lessons: LessonDetail[];
}

export interface TeacherClassesResponse {
  classes: ClassSummary[];
}

export interface ClassStudentsResponse {
  class_id: string;
  class_name: string;
  students: StudentSummary[];
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  user: AuthUser;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}
