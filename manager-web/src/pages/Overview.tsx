import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { StatCard } from "../components/StatCard";
import { StudentTable } from "../components/StudentTable";
import { useClassStudents, useTeacherClasses } from "../hooks/teacherHooks";
import { Users, Target, Activity, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import type { AuthUser } from "../types/teacher";

interface OverviewProps {
  user: AuthUser;
  onLogout: () => void;
}

export function Overview({ user, onLogout }: OverviewProps) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const classesState = useTeacherClasses();

  useEffect(() => {
    if (!selectedClassId && classesState.data && classesState.data.length > 0) {
      setSelectedClassId(classesState.data[0].id);
    }
  }, [classesState.data, selectedClassId]);

  const studentsState = useClassStudents(selectedClassId);
  const classes = classesState.data ?? [];
  const students = studentsState.data ?? [];
  const selectedClass = classes.find((item) => item.id === selectedClassId) ?? null;

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const avgProgress = totalStudents > 0
      ? Math.round(students.reduce((acc, student) => acc + student.progress_percent, 0) / totalStudents)
      : 0;
    const scoredStudents = students.filter((student) => student.avg_score !== null);
    const avgScore = scoredStudents.length > 0
      ? (scoredStudents.reduce((acc, student) => acc + (student.avg_score ?? 0), 0) / scoredStudents.length).toFixed(1)
      : "-";
    const needsSupportCount = students.filter((student) => student.needs_support).length;

    return { totalStudents, avgProgress, avgScore, needsSupportCount };
  }, [students]);

  return (
    <DashboardLayout
      title={selectedClass?.name ?? "Teacher Dashboard"}
      subtitle={selectedClass ? `${selectedClass.school_name} • Mã lớp ${selectedClass.class_code}` : "Tổng quan tình hình học tập"}
      classes={classes}
      selectedClassId={selectedClassId}
      user={user}
      onSelectClass={setSelectedClassId}
      onLogout={onLogout}
    >
      {classesState.loading && (
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-card)] p-10 flex justify-center items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải danh sách lớp...
        </div>
      )}

      {classesState.error && (
        <div className="bg-red-50 border border-red-200 rounded-[var(--radius-card)] p-6 text-red-700 flex items-center justify-between">
          <span>{classesState.error}</span>
          <button onClick={classesState.refetch} className="inline-flex items-center gap-2 font-semibold">
            <RefreshCw className="h-4 w-4" /> Tải lại
          </button>
        </div>
      )}

      {!classesState.loading && !classesState.error && classes.length === 0 && (
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-card)] p-10 text-center text-gray-600">
          Giáo viên chưa được gán lớp học nào.
        </div>
      )}

      {selectedClass && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Sĩ số lớp" value={stats.totalStudents} icon={<Users className="h-6 w-6" />} />
            <StatCard title="Tiến độ trung bình" value={`${stats.avgProgress}%`} icon={<Activity className="h-6 w-6" />} />
            <StatCard title="Điểm trung bình" value={stats.avgScore} icon={<Target className="h-6 w-6" />} />
            <StatCard title="Cần hỗ trợ" value={stats.needsSupportCount} icon={<AlertCircle className="h-6 w-6 text-red-500" />} />
          </div>

          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Danh sách học sinh</h3>
              <p className="text-sm text-gray-500">Nhấn vào học sinh để xem chi tiết tiến độ bài học</p>
            </div>
            <button onClick={studentsState.refetch} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[var(--color-header)]">
              <RefreshCw className="h-4 w-4" /> Làm mới
            </button>
          </div>

          {studentsState.loading && (
            <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-card)] p-10 flex justify-center items-center gap-3 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang tải danh sách học sinh...
            </div>
          )}

          {studentsState.error && (
            <div className="bg-red-50 border border-red-200 rounded-[var(--radius-card)] p-6 text-red-700">{studentsState.error}</div>
          )}

          {!studentsState.loading && !studentsState.error && (
            students.length === 0 ? (
              <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-card)] p-10 text-center text-gray-600">
                Lớp này chưa có học sinh.
              </div>
            ) : (
              <StudentTable students={students} classId={selectedClass.id} />
            )
          )}
        </>
      )}
    </DashboardLayout>
  );
}
