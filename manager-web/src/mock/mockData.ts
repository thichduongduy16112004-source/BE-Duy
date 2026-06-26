export interface Lesson {
  lesson_id: string;
  title: string;
  status: "not_started" | "in_progress" | "completed";
  score?: number;
  time_spent_minutes?: number;
  completed_at?: string;
}

export interface Student {
  user_id: string;
  full_name: string;
  progress_percent: number;
  avg_score: number | null;
  needs_support: boolean;
  lessons?: Lesson[];
}

export interface ClassData {
  class_id: string;
  class_name: string;
  students: Student[];
}

export const MOCK_CLASS_DATA: ClassData = {
  class_id: "class_demo_10a1",
  class_name: "Lịch sử 10A1",
  students: [
    {
      user_id: "student_01",
      full_name: "Nguyễn Văn An",
      progress_percent: 85,
      avg_score: 8.5,
      needs_support: false,
    },
    {
      user_id: "student_02",
      full_name: "Trần Thị Bích",
      progress_percent: 40,
      avg_score: 5.0,
      needs_support: true,
    },
    {
      user_id: "student_03",
      full_name: "Lê Hoàng Cường",
      progress_percent: 95,
      avg_score: 9.2,
      needs_support: false,
    },
    {
      user_id: "student_04",
      full_name: "Phạm Dung",
      progress_percent: 20,
      avg_score: 4.5,
      needs_support: true,
    },
    {
      user_id: "student_05",
      full_name: "Hoàng Duy",
      progress_percent: 60,
      avg_score: 7.0,
      needs_support: false,
    },
  ],
};

export const MOCK_STUDENT_DETAIL: Record<string, Student> = {
  "student_02": {
    user_id: "student_02",
    full_name: "Trần Thị Bích",
    progress_percent: 40,
    avg_score: 5.0,
    needs_support: true,
    lessons: [
      {
        lesson_id: "l1",
        title: "Bài 1: Nguồn gốc loài người",
        status: "completed",
        score: 6.0,
        time_spent_minutes: 20,
        completed_at: "2026-06-20T10:00:00Z",
      },
      {
        lesson_id: "l2",
        title: "Bài 2: Các quốc gia cổ đại phương Đông",
        status: "completed",
        score: 4.0,
        time_spent_minutes: 15,
        completed_at: "2026-06-22T09:30:00Z",
      },
      {
        lesson_id: "l3",
        title: "Bài 3: Các quốc gia cổ đại phương Tây",
        status: "not_started",
      },
    ]
  }
};
