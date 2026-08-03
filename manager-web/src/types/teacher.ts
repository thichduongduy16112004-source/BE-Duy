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

export interface ClassAssignmentsResponse {
  class_id: string;
  assignments: AssignmentSummary[];
}

export interface ImportedQuestionInput {
  question: string;
  options: string[];
  answer: number | string;
  explanation?: string;
}

export interface ImportedLessonCreate {
  title: string;
  description?: string;
  content?: string;
  questions: ImportedQuestionInput[];
}

export interface ImportedLessonSummary {
  id: string;
  class_id?: string;
  title: string;
  description: string | null;
  question_count?: number;
  quiz_count?: number;
  created_at: string | null;
}

export interface ClassLessonsResponse {
  class_id: string;
  lessons: ImportedLessonSummary[];
}

export interface QuizQuestionInput {
  id?: string | number;
  question: string;
  options: QuizOptionInput[];
  explanation?: string;
}

export interface QuizOptionInput {
  id: string;
  text: string;
  correct: boolean;
}

export interface AssignmentCreate {
  lesson_id: string;
  title?: string;
  due_at?: string | null;
}

export interface AssignmentSummary {
  id: string;
  lesson_id: string;
  class_id: string;
  title: string;
  lesson_title?: string | null;
  question_count?: number;
  assigned_count?: number;
  completed_count: number;
  total_students?: number;
  student_status?: "not_started" | "in_progress" | "completed" | null;
  student_score?: number | null;
  due_at: string | null;
  created_at?: string | null;
  assigned_at?: string | null;
  status?: string;
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
