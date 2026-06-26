import { Clock, Target, CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";
import { useStudentDetail } from "../hooks/teacherHooks";

interface StudentDetailPanelProps {
  classId: string;
  studentId: string;
}

export function StudentDetailPanel({ classId, studentId }: StudentDetailPanelProps) {
  const { data: detail, loading, error } = useStudentDetail(classId, studentId);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải dữ liệu chi tiết...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 bg-red-50 flex items-center justify-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  const lessons = detail?.lessons || [];
  const completed = lessons.filter((lesson) => lesson.status === "completed").length;

  if (lessons.length === 0) {
    return <div className="p-8 text-center text-gray-500 bg-gray-50">Học sinh chưa có dữ liệu bài học.</div>;
  }

  return (
    <div className="bg-gray-50 p-6 border-l-4 border-[var(--color-brand)]">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-medium text-gray-900">Tiến độ bài học của {detail?.full_name}</h4>
        <div className="text-sm text-gray-500">
          Đã hoàn thành: <span className="font-bold text-gray-900">{completed}/{lessons.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson) => (
          <div key={lesson.lesson_id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium text-sm text-gray-900 line-clamp-2 pr-4">{lesson.title}</h5>
              {lesson.status === "completed" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : lesson.status === "in_progress" ? (
                <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
              )}
            </div>
            
            {lesson.status === "completed" && (
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  Điểm: <span className="font-medium text-gray-900 ml-1">{lesson.score ?? "-"}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{lesson.time_spent_minutes ?? 0} phút</span>
                </div>
              </div>
            )}
            {lesson.status !== "completed" && (
              <div className="mt-4 text-xs text-gray-400 italic">
                {lesson.status === "in_progress" ? "Đang học..." : "Chưa học"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
