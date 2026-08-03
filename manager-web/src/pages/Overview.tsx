import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { StatCard } from "../components/StatCard";
import { StudentTable } from "../components/StudentTable";
import { useClassStudents, useTeacherClasses } from "../hooks/teacherHooks";
import { createClassAssignment, deleteClassAssignment, deleteClassLesson, getClassAssignments, getClassLessons, importClassLesson } from "../lib/api";
import {
  Activity,
  AlertCircle,
  Bell,
  BookOpen,
  CalendarClock,
  FileJson,
  Loader2,
  RefreshCw,
  Send,
  Settings,
  Target,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import type { AssignmentSummary, AuthUser, ImportedLessonCreate, ImportedLessonSummary } from "../types/teacher";

interface OverviewProps {
  user: AuthUser;
  onLogout: () => void;
}

type ManagerTab = "dashboard" | "classes" | "students" | "lessons" | "assignments" | "json" | "reports" | "notifications" | "settings";

const getAssignmentTotal = (assignment: AssignmentSummary) => assignment.total_students ?? assignment.assigned_count ?? 0;
const getLessonQuestionCount = (lesson: ImportedLessonSummary) => lesson.question_count ?? lesson.quiz_count ?? 0;
const getCompletionRate = (assignment: AssignmentSummary) => {
  const total = getAssignmentTotal(assignment);
  return total > 0 ? Math.round((assignment.completed_count / total) * 100) : 0;
};

type JsonOption = string | { id?: string; text?: string; correct?: boolean };

type JsonQuestion = {
  question: string;
  options: JsonOption[];
  answer?: number | string;
  explanation?: string;
};

type JsonLesson = {
  title: string;
  description?: string;
  content?: string;
  questions?: JsonQuestion[];
};

type JsonLessonPack = {
  title?: string;
  lessons?: JsonLesson[];
};


const defaultLessonJson = JSON.stringify(
  {
    title: "Bài ôn tập mẫu",
    description: "Bài học import nhanh từ JSON",
    questions: [
      {
        question: "Câu hỏi mẫu",
        options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
        answer: 0,
        explanation: "Giải thích ngắn cho đáp án đúng.",
      },
    ],
  },
  null,
  2,
);

function normalizeQuestions(questions: JsonQuestion[] = []) {
  return questions.map((question, index) => {
    const options = question.options.map((option) => typeof option === "string" ? option : option.text ?? "").filter(Boolean);
    const answer = typeof question.answer === "number" ? question.answer : String(question.answer ?? "A").toUpperCase();

    if (!question.question?.trim()) throw new Error(`Câu hỏi ${index + 1} đang thiếu nội dung.`);
    if (options.length < 2) throw new Error(`Câu hỏi ${index + 1} cần ít nhất 2 đáp án.`);

    return {
      question: question.question.trim(),
      options,
      answer,
      explanation: question.explanation,
    };
  });
}

function makeLessonPayload(rawLesson: JsonLesson): ImportedLessonCreate {
  const title = rawLesson.title?.trim();
  const questions = normalizeQuestions(rawLesson.questions);

  if (!title) throw new Error("Mỗi bài học trong JSON cần có title.");
  if (questions.length === 0) throw new Error(`Bài "${title}" chưa có câu hỏi.`);

  return {
    title,
    description: rawLesson.description || rawLesson.content || "",
    content: rawLesson.content || rawLesson.description || "",
    questions,
  };
}

export function Overview({ user, onLogout }: OverviewProps) {
  const [activeTab, setActiveTab] = useState<ManagerTab>("dashboard");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<ImportedLessonSummary[]>([]);
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [lessonJson, setLessonJson] = useState(defaultLessonJson);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [panelMessage, setPanelMessage] = useState("");
  const [panelError, setPanelError] = useState("");
  const [panelLoading, setPanelLoading] = useState(false);
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
    const avgProgress = totalStudents > 0 ? Math.round(students.reduce((acc, student) => acc + student.progress_percent, 0) / totalStudents) : 0;
    const scoredStudents = students.filter((student) => student.avg_score !== null);
    const avgScore = scoredStudents.length > 0 ? (scoredStudents.reduce((acc, student) => acc + (student.avg_score ?? 0), 0) / scoredStudents.length).toFixed(1) : "-";
    const needsSupportCount = students.filter((student) => student.needs_support || student.progress_percent < 40).length;
    const completionRate = assignments.length > 0 ? Math.round(assignments.reduce((acc, item) => acc + getCompletionRate(item), 0) / assignments.length) : 0;
    return { totalStudents, avgProgress, avgScore, needsSupportCount, completionRate };
  }, [assignments, students]);

  const refreshAssignments = async () => {
    if (!selectedClassId) return;
    const [lessonResult, assignmentResult] = await Promise.all([getClassLessons(selectedClassId), getClassAssignments(selectedClassId)]);
    setLessons(lessonResult.lessons);
    setAssignments(assignmentResult.assignments);
    setSelectedLessonId((current) => current || lessonResult.lessons[0]?.id || "");
  };

  useEffect(() => {
    setPanelError("");
    refreshAssignments().catch((error) => setPanelError(error.message || "Không tải được dữ liệu lớp"));
  }, [selectedClassId]);

  async function importLessonsFromJson(assignAfterImport = false) {
    if (!selectedClassId) return;
    setPanelLoading(true);
    setPanelError("");
    setPanelMessage("");
    try {
      const parsed = JSON.parse(lessonJson) as JsonLessonPack | JsonLesson;
      const rawLessons = Array.isArray((parsed as JsonLessonPack).lessons) ? (parsed as JsonLessonPack).lessons ?? [] : [parsed as JsonLesson];
      if (rawLessons.length === 0) throw new Error("File JSON chưa có lessons.");
      const imported: ImportedLessonSummary[] = [];
      for (const lesson of rawLessons) {
        imported.push(await importClassLesson(selectedClassId, makeLessonPayload(lesson)));
      }
      if (assignAfterImport) {
        for (const lesson of imported) {
          await createClassAssignment(selectedClassId, { lesson_id: lesson.id, title: lesson.title });
        }
      }
      setPanelMessage(`Đã import ${imported.length} bài${assignAfterImport ? " và giao cho lớp" : ""}.`);
      await refreshAssignments();
      studentsState.refetch();
    } catch (error) {
      setPanelError(error instanceof Error ? error.message : "Không import được JSON.");
    } finally {
      setPanelLoading(false);
    }
  }

  async function handleJsonFile(file: File | null) {
    if (!file) return;
    setLessonJson(await file.text());
    setPanelMessage(`Đã nạp file ${file.name}. Kiểm tra nội dung rồi bấm import.`);
  }

  async function handleCreateAssignment() {
    if (!selectedClassId || !selectedLessonId) return;
    setPanelLoading(true);
    setPanelError("");
    setPanelMessage("");
    try {
      await createClassAssignment(selectedClassId, {
        lesson_id: selectedLessonId,
        title: assignmentTitle.trim() || undefined,
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
      });
      setAssignmentTitle("");
      setDueAt("");
      setPanelMessage("Đã giao bài cho lớp.");
      await refreshAssignments();
      studentsState.refetch();
    } catch (error) {
      setPanelError(error instanceof Error ? error.message : "Không giao được bài");
    } finally {
      setPanelLoading(false);
    }
  }

  async function handleDeleteAssignment(assignment: AssignmentSummary) {
    if (!selectedClassId) return;
    if (!confirm(`Xóa bài đã giao "${assignment.title}" khỏi lớp?\nTiến độ nộp bài liên quan sẽ bị xóa khỏi dashboard.`)) return;
    setPanelLoading(true);
    setPanelError("");
    setPanelMessage("");
    try {
      const response = await deleteClassAssignment(selectedClassId, assignment.id);
      setPanelMessage(response.message || "Đã xóa bài đã giao.");
      await refreshAssignments();
      studentsState.refetch();
    } catch (error) {
      setPanelError(error instanceof Error ? error.message : "Không xóa được bài đã giao");
    } finally {
      setPanelLoading(false);
    }
  }

  async function handleDeleteLesson(lesson: ImportedLessonSummary) {
    if (!selectedClassId) return;
    if (!confirm(`Xóa bài học "${lesson.title}" khỏi thư viện lớp?\nCác bài đã giao và tiến độ liên quan cũng sẽ bị xóa.`)) return;
    setPanelLoading(true);
    setPanelError("");
    setPanelMessage("");
    try {
      const response = await deleteClassLesson(selectedClassId, lesson.id);
      setPanelMessage(response.message || "Đã xóa bài học.");
      await refreshAssignments();
      studentsState.refetch();
    } catch (error) {
      setPanelError(error instanceof Error ? error.message : "Không xóa được bài học");
    } finally {
      setPanelLoading(false);
    }
  }


  return (
    <DashboardLayout
      title={selectedClass?.name ?? "Manager Dashboard"}
      subtitle={selectedClass ? `${selectedClass.school_name} • Mã lớp ${selectedClass.class_code}` : "Tổng quan quản lý lớp học"}
      classes={classes}
      selectedClassId={selectedClassId}
      activeTab={activeTab}
      user={user}
      onSelectClass={setSelectedClassId}
      onSelectTab={(tabId) => setActiveTab(tabId as ManagerTab)}
      onLogout={onLogout}
    >
      {classesState.loading && <LoadingCard label="Đang tải danh sách lớp..." />}
      {classesState.error && <ErrorCard message={classesState.error} onRetry={classesState.refetch} />}
      {!classesState.loading && !classesState.error && classes.length === 0 && <EmptyPanel title="Chưa có lớp" description="Admin cần tạo lớp và gán tài khoản của bạn làm teacher/manager." />}

      {selectedClass && (
        <>
          {(panelError || panelMessage) && (
            <div className={`mb-5 rounded-2xl border p-4 text-sm font-bold ${panelError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{panelError || panelMessage}</div>
          )}

          {activeTab === "dashboard" && <DashboardTab stats={stats} assignments={assignments} studentsLoading={studentsState.loading} />}
          {activeTab === "classes" && <ClassesTab classes={classes} selectedClassId={selectedClassId} onSelectClass={setSelectedClassId} />}
          {activeTab === "students" && <StudentsTab loading={studentsState.loading} error={studentsState.error} studentsLength={students.length} onRefresh={studentsState.refetch}>{students.length > 0 && <StudentTable students={students} classId={selectedClass.id} />}</StudentsTab>}
          {activeTab === "lessons" && <LessonsTab lessons={lessons} lessonJson={lessonJson} setLessonJson={setLessonJson} onFile={handleJsonFile} onImport={() => importLessonsFromJson(false)} onDeleteLesson={handleDeleteLesson} loading={panelLoading} />}
          {activeTab === "assignments" && <AssignmentsTab lessons={lessons} assignments={assignments} selectedLessonId={selectedLessonId} setSelectedLessonId={setSelectedLessonId} assignmentTitle={assignmentTitle} setAssignmentTitle={setAssignmentTitle} dueAt={dueAt} setDueAt={setDueAt} onAssign={handleCreateAssignment} onDeleteAssignment={handleDeleteAssignment} loading={panelLoading} />}
          {activeTab === "json" && <JsonLibraryTab lessonJson={lessonJson} setLessonJson={setLessonJson} onFile={handleJsonFile} onImport={() => importLessonsFromJson(false)} onImportAndAssign={() => importLessonsFromJson(true)} loading={panelLoading} />}
          {activeTab === "reports" && <ReportsTab stats={stats} assignments={assignments} students={students} />}
          {activeTab === "notifications" && <NotificationsTab selectedClassName={selectedClass.name} />}
          {activeTab === "settings" && <SettingsTab selectedClass={selectedClass} />}
        </>
      )}
    </DashboardLayout>
  );
}

function LoadingCard({ label }: { label: string }) {
  return <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-10 text-gray-600 flex items-center justify-center gap-3"><Loader2 className="h-5 w-5 animate-spin" /> {label}</div>;
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="rounded-[var(--radius-card)] border border-red-200 bg-red-50 p-6 text-red-700 flex items-center justify-between"><span>{message}</span><button onClick={onRetry} className="inline-flex items-center gap-2 font-semibold"><RefreshCw className="h-4 w-4" /> Tải lại</button></div>;
}

function EmptyPanel({ title, description }: { title: string; description: string }) {
  return <div className="rounded-[24px] border border-stone-200 bg-white p-10 text-center"><h3 className="text-xl font-black text-stone-950">{title}</h3><p className="mt-2 text-stone-500">{description}</p></div>;
}

function DashboardTab({ stats, assignments, studentsLoading }: { stats: { totalStudents: number; avgProgress: number; avgScore: string; needsSupportCount: number; completionRate: number }; assignments: AssignmentSummary[]; studentsLoading: boolean }) {
  const lowCompletion = assignments.filter((item) => getCompletionRate(item) < 50);
  return <div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><StatCard title="Sĩ số lớp" value={studentsLoading ? "..." : stats.totalStudents} icon={<Users className="h-6 w-6" />} /><StatCard title="Tiến độ trung bình" value={`${stats.avgProgress}%`} icon={<Activity className="h-6 w-6" />} /><StatCard title="Điểm trung bình" value={stats.avgScore} icon={<Target className="h-6 w-6" />} /><StatCard title="Cần hỗ trợ" value={stats.needsSupportCount} icon={<AlertCircle className="h-6 w-6 text-red-500" />} /></div><section className="rounded-[28px] bg-stone-950 p-7 text-white"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">Live operations</p><h3 className="mt-2 text-3xl font-black">{stats.completionRate}% bài giao đã hoàn thành</h3><p className="mt-2 text-stone-300">Theo dõi bài đang giao, phát hiện bài chậm và nhóm học sinh cần nhắc.</p></div><div className="rounded-2xl bg-amber-300 px-5 py-3 text-sm font-black text-stone-950">{lowCompletion.length} bài cần theo sát</div></div><div className="mt-5 grid gap-3 md:grid-cols-3">{assignments.slice(0, 3).map((item) => <div key={item.id} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10"><div className="font-bold">{item.title}</div><div className="mt-1 text-sm text-stone-300">{item.completed_count}/{getAssignmentTotal(item)} hoàn thành · {getCompletionRate(item)}%</div><div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-amber-300" style={{ width: `${getCompletionRate(item)}%` }} /></div></div>)}</div></section></div>;
}

function ClassesTab({ classes, selectedClassId, onSelectClass }: { classes: any[]; selectedClassId: string | null; onSelectClass: (id: string) => void }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{classes.map((item) => <button key={item.id} onClick={() => onSelectClass(item.id)} className={`text-left rounded-[24px] border p-5 transition ${selectedClassId === item.id ? "border-amber-400 bg-amber-50 shadow-lg" : "border-stone-200 bg-white hover:border-amber-300"}`}><div className="flex items-center justify-between"><strong className="text-lg text-stone-950">{item.name}</strong><span className="rounded-full bg-stone-950 px-3 py-1 text-xs font-black text-amber-200">{item.student_count}/{item.slot_limit}</span></div><p className="mt-2 text-sm text-stone-500">{item.school_name}</p><p className="mt-4 font-mono text-sm font-black text-amber-700">{item.class_code}</p></button>)}</div>;
}

function StudentsTab({ loading, error, studentsLength, onRefresh, children }: { loading: boolean; error: string | null; studentsLength: number; onRefresh: () => void; children: React.ReactNode }) {
  return <section className="space-y-4"><div className="flex items-end justify-between"><div><h3 className="text-xl font-black text-stone-950">Danh sách học sinh</h3><p className="text-sm text-stone-500">Nhấn vào học sinh để xem chi tiết tiến độ bài học, điểm số và trạng thái hỗ trợ.</p></div><button onClick={onRefresh} className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold"><RefreshCw className="h-4 w-4" /> Làm mới</button></div>{loading && <LoadingCard label="Đang tải học sinh..." />}{error && <div className="rounded-2xl bg-red-50 p-5 font-bold text-red-700">{error}</div>}{!loading && !error && studentsLength === 0 ? <EmptyPanel title="Lớp chưa có học sinh" description="Học sinh cần nhập mã lớp và mật khẩu ở Web Student." /> : children}</section>;
}

function LessonsTab({ lessons, lessonJson, setLessonJson, onFile, onImport, onDeleteLesson, loading }: { lessons: ImportedLessonSummary[]; lessonJson: string; setLessonJson: (value: string) => void; onFile: (file: File | null) => void; onImport: () => void; onDeleteLesson: (lesson: ImportedLessonSummary) => void; loading: boolean }) {
  const preview = useMemo(() => {
    try {
      const parsed = JSON.parse(lessonJson) as JsonLessonPack | JsonLesson;
      const rawLessons = Array.isArray((parsed as JsonLessonPack).lessons) ? (parsed as JsonLessonPack).lessons ?? [] : [parsed as JsonLesson];
      const invalidLessons = rawLessons
        .map((lesson, index) => ({ title: lesson.title || `Bài ${index + 1}`, questionCount: lesson.questions?.length ?? 0 }))
        .filter((lesson) => lesson.questionCount === 0);
      return { isValid: rawLessons.length > 0 && invalidLessons.length === 0, lessonCount: rawLessons.length, questionCount: rawLessons.reduce((total, lesson) => total + (lesson.questions?.length ?? 0), 0), invalidLessons, error: "" };
    } catch (error) {
      return { isValid: false, lessonCount: 0, questionCount: 0, invalidLessons: [], error: error instanceof Error ? error.message : "JSON không hợp lệ" };
    }
  }, [lessonJson]);

  return <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]"><section className="rounded-[24px] bg-white p-5 ring-1 ring-stone-200"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h3 className="flex items-center gap-2 text-xl font-black"><FileJson className="h-5 w-5 text-amber-600" /> Import nhanh một bài hoặc pack</h3><p className="mt-1 text-sm text-stone-500">Dán JSON hoặc tải file JSON câu hỏi từ máy để tạo bài học cho lớp.</p></div><a className="rounded-full bg-amber-100 px-4 py-2 text-xs font-black text-amber-800 hover:bg-amber-200" href="/sample-assignment-pack.json" download>Tải file mẫu 10 chương</a></div><label className="mb-4 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-5 font-black text-amber-800 transition hover:border-amber-500 hover:bg-amber-50"><Upload className="h-5 w-5" /> Tải file JSON câu hỏi từ máy<input type="file" accept="application/json,.json" className="hidden" onChange={(event) => void onFile(event.target.files?.[0] ?? null)} /></label><div className={`mb-4 rounded-2xl p-4 text-sm font-bold ${preview.isValid ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>{preview.error ? <span>JSON chưa hợp lệ: {preview.error}</span> : <div><div>{preview.lessonCount} bài học · {preview.questionCount} câu hỏi</div>{preview.invalidLessons.length > 0 && <div className="mt-2">Bài thiếu câu hỏi: {preview.invalidLessons.map((lesson) => lesson.title).join(", ")}</div>}{preview.isValid && <div className="mt-2 text-emerald-700">Sẵn sàng import vào thư viện lớp.</div>}</div>}</div><JsonEditor title="Nội dung JSON" value={lessonJson} onChange={setLessonJson} onImport={onImport} loading={loading || !preview.isValid} /></section><section className="rounded-[24px] bg-white p-5 ring-1 ring-stone-200"><h3 className="mb-4 text-xl font-black">Thư viện bài học trong lớp</h3><div className="space-y-3">{lessons.map((lesson) => { const count = getLessonQuestionCount(lesson); return <div key={lesson.id} className="rounded-2xl border border-stone-200 p-4"><div className="flex items-start justify-between gap-3"><div><strong>{lesson.title}</strong><p className="text-sm text-stone-500">{lesson.description || "Không có mô tả"}</p></div><div className="flex flex-col items-end gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black ${count > 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}`}>{count > 0 ? "Sẵn sàng giao" : "Thiếu câu hỏi"}</span><button disabled={loading} onClick={() => onDeleteLesson(lesson)} className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700 hover:bg-red-100 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" /> Xóa bài</button></div></div><span className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">{count} câu hỏi</span></div>; })}{lessons.length === 0 && <p className="text-sm text-stone-500">Chưa có bài học import.</p>}</div></section></div>;
}

function AssignmentsTab(props: { lessons: ImportedLessonSummary[]; assignments: AssignmentSummary[]; selectedLessonId: string; setSelectedLessonId: (value: string) => void; assignmentTitle: string; setAssignmentTitle: (value: string) => void; dueAt: string; setDueAt: (value: string) => void; onAssign: () => void; onDeleteAssignment: (assignment: AssignmentSummary) => void; loading: boolean }) {
  const selectedLesson = props.lessons.find((lesson) => lesson.id === props.selectedLessonId);
  const canAssign = Boolean(props.selectedLessonId && (!selectedLesson || getLessonQuestionCount(selectedLesson) > 0));
  return <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]"><section className="rounded-[24px] bg-stone-950 p-5 text-white"><h3 className="mb-4 flex items-center gap-2 text-xl font-black"><Send className="h-5 w-5 text-amber-300" /> Giao bài</h3><select className="mb-3 w-full rounded-xl border border-amber-200 bg-white px-4 py-3 font-bold text-stone-950 outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-300/20" value={props.selectedLessonId} onChange={(event) => props.setSelectedLessonId(event.target.value)}><option className="bg-white text-stone-950" value="">Chọn bài học</option>{props.lessons.map((lesson) => <option className="bg-white text-stone-950" key={lesson.id} value={lesson.id}>{lesson.title} · {getLessonQuestionCount(lesson)} câu</option>)}</select>{selectedLesson && <div className={`mb-3 rounded-2xl p-3 text-sm font-bold ${getLessonQuestionCount(selectedLesson) > 0 ? "bg-white/10 text-stone-200" : "bg-red-500/20 text-red-100"}`}>{getLessonQuestionCount(selectedLesson) > 0 ? `Bài này có ${getLessonQuestionCount(selectedLesson)} câu hỏi, sẵn sàng giao.` : "Bài này chưa có câu hỏi, không nên giao cho học sinh."}</div>}<input className="mb-3 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3" placeholder="Tiêu đề giao bài" value={props.assignmentTitle} onChange={(event) => props.setAssignmentTitle(event.target.value)} /><input type="datetime-local" className="mb-3 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3" value={props.dueAt} onChange={(event) => props.setDueAt(event.target.value)} /><button disabled={props.loading || !canAssign} onClick={props.onAssign} className="w-full rounded-xl bg-amber-300 px-5 py-3 font-black text-stone-950 disabled:opacity-40">Giao cho lớp</button></section><section className="rounded-[24px] bg-white p-5 ring-1 ring-stone-200"><h3 className="mb-4 text-xl font-black">Bài đã giao</h3><div className="space-y-3">{props.assignments.map((assignment) => { const rate = getCompletionRate(assignment); const total = getAssignmentTotal(assignment); return <div key={assignment.id} className="rounded-2xl border border-stone-200 p-4"><div className="flex items-center justify-between gap-3"><strong>{assignment.title}</strong><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black ${rate >= 80 ? "bg-emerald-100 text-emerald-800" : rate >= 40 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700"}`}>{rate >= 80 ? "Hoàn thành tốt" : rate >= 40 ? "Đang làm" : "Cần nhắc"}</span><button disabled={props.loading} onClick={() => props.onDeleteAssignment(assignment)} className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700 hover:bg-red-100 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" /> Xóa</button></div></div><p className="mt-1 text-sm text-stone-500">{assignment.completed_count}/{total} hoàn thành · {assignment.question_count ?? 0} câu hỏi</p><div className="mt-3 h-2 rounded-full bg-stone-100"><div className="h-2 rounded-full bg-stone-950" style={{ width: `${rate}%` }} /></div><p className="mt-3 text-xs font-bold text-stone-500">Hạn: {assignment.due_at ? new Date(assignment.due_at).toLocaleString("vi-VN") : "Chưa đặt"}</p></div>; })}{props.assignments.length === 0 && <p className="text-sm text-stone-500">Chưa có bài nào được giao.</p>}</div></section></div>;
}

function JsonLibraryTab({ lessonJson, setLessonJson, onFile, onImport, onImportAndAssign, loading }: { lessonJson: string; setLessonJson: (value: string) => void; onFile: (file: File | null) => void; onImport: () => void; onImportAndAssign: () => void; loading: boolean }) {
  const preview = useMemo(() => {
    try {
      const parsed = JSON.parse(lessonJson) as JsonLessonPack | JsonLesson;
      const rawLessons = Array.isArray((parsed as JsonLessonPack).lessons) ? (parsed as JsonLessonPack).lessons ?? [] : [parsed as JsonLesson];
      const invalidLessons = rawLessons
        .map((lesson, index) => ({
          title: lesson.title || `Bài ${index + 1}`,
          questionCount: lesson.questions?.length ?? 0,
        }))
        .filter((lesson) => lesson.questionCount === 0);
      return {
        isValid: rawLessons.length > 0 && invalidLessons.length === 0,
        lessonCount: rawLessons.length,
        questionCount: rawLessons.reduce((total, lesson) => total + (lesson.questions?.length ?? 0), 0),
        invalidLessons,
        error: "",
      };
    } catch (error) {
      return { isValid: false, lessonCount: 0, questionCount: 0, invalidLessons: [], error: error instanceof Error ? error.message : "JSON không hợp lệ" };
    }
  }, [lessonJson]);

  return <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]"><section className="rounded-[24px] border border-amber-200 bg-[#fff8e7] p-5"><h3 className="flex items-center gap-2 text-xl font-black"><FileJson className="h-5 w-5 text-amber-700" /> JSON Library</h3><p className="mt-2 text-sm text-stone-600">Dùng file mẫu tại <a className="font-black text-amber-800 underline" href="/sample-assignment-pack.json" download>sample-assignment-pack.json</a>, hoặc upload file JSON từ máy để làm nội dung giao bài tập.</p><div className="mt-4 rounded-2xl bg-white/80 p-4 text-sm text-stone-700 ring-1 ring-amber-200"><p className="font-black text-stone-950">Format cần có</p><p className="mt-1 font-mono text-xs">lessons[] → title, description, content, questions[] → question, options[4], answer, explanation</p></div><label className="mt-5 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-amber-300 bg-white p-8 font-black text-amber-800 transition hover:border-amber-500 hover:bg-amber-50"><Upload className="h-5 w-5" /> Chọn file JSON từ máy<input type="file" accept="application/json,.json" className="hidden" onChange={(event) => void onFile(event.target.files?.[0] ?? null)} /></label><div className={`mt-4 rounded-2xl p-4 text-sm font-bold ${preview.isValid ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>{preview.error ? <span>JSON chưa hợp lệ: {preview.error}</span> : <div><div>{preview.lessonCount} bài học · {preview.questionCount} câu hỏi</div>{preview.invalidLessons.length > 0 && <div className="mt-2">Bài thiếu câu hỏi: {preview.invalidLessons.map((lesson) => lesson.title).join(", ")}</div>}{preview.isValid && <div className="mt-2 text-emerald-700">Sẵn sàng import vào thư viện lớp.</div>}</div>}</div><div className="mt-4 grid gap-3"><button disabled={loading || !preview.isValid} onClick={onImport} className="rounded-xl bg-stone-950 px-5 py-3 font-black text-white disabled:opacity-40">Import vào thư viện lớp</button><button disabled={loading || !preview.isValid} onClick={onImportAndAssign} className="rounded-xl bg-amber-300 px-5 py-3 font-black text-stone-950 disabled:opacity-40">Import và giao ngay</button></div></section><JsonEditor title="Nội dung JSON" value={lessonJson} onChange={setLessonJson} onImport={onImport} loading={loading || !preview.isValid} /></div>;
}

function JsonEditor({ title, value, onChange, onImport, loading }: { title: string; value: string; onChange: (value: string) => void; onImport: () => void; loading: boolean }) {
  return <section className="rounded-[24px] bg-white p-5 ring-1 ring-stone-200"><h3 className="mb-4 flex items-center gap-2 text-xl font-black"><BookOpen className="h-5 w-5 text-amber-700" /> {title}</h3><textarea className="min-h-[420px] w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 font-mono text-xs outline-none focus:border-amber-400" value={value} onChange={(event) => onChange(event.target.value)} /><button disabled={loading} onClick={onImport} className="mt-4 rounded-xl bg-stone-950 px-5 py-3 font-black text-white disabled:opacity-40">{loading ? "Đang xử lý..." : "Import JSON"}</button></section>;
}

function ReportsTab({ stats, assignments, students }: { stats: { totalStudents: number; avgProgress: number; avgScore: string; needsSupportCount: number; completionRate: number }; assignments: AssignmentSummary[]; students: any[] }) {
  return <div className="grid gap-5 lg:grid-cols-2"><section className="rounded-[24px] bg-white p-6 ring-1 ring-stone-200"><h3 className="text-xl font-black">Báo cáo học tập</h3><div className="mt-5 space-y-4">{[["Tiến độ trung bình", `${stats.avgProgress}%`], ["Tỷ lệ hoàn thành bài giao", `${stats.completionRate}%`], ["Điểm trung bình", stats.avgScore], ["Cần hỗ trợ", String(stats.needsSupportCount)]].map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-2xl bg-stone-50 p-4"><span className="font-bold text-stone-600">{label}</span><strong className="text-stone-950">{value}</strong></div>)}</div></section><section className="rounded-[24px] bg-stone-950 p-6 text-white"><h3 className="text-xl font-black">Insight hành động</h3><ul className="mt-5 space-y-3 text-sm text-stone-300"><li>• {students.length} học sinh đang theo lớp.</li><li>• {assignments.length} bài đã được giao.</li><li>• Ưu tiên hỗ trợ nhóm học sinh có tiến độ dưới 40% hoặc chưa nộp bài.</li></ul></section></div>;
}

function NotificationsTab({ selectedClassName }: { selectedClassName: string }) {
  return <div className="rounded-[24px] bg-white p-6 ring-1 ring-stone-200"><h3 className="flex items-center gap-2 text-xl font-black"><Bell className="h-5 w-5 text-amber-700" /> Notifications</h3><p className="mt-2 text-stone-500">V1 chuẩn bị nội dung thông báo cho lớp {selectedClassName}. Gửi notification thật sẽ nối backend sau.</p><div className="mt-5 grid gap-3"><textarea className="min-h-36 rounded-2xl border border-stone-200 p-4" placeholder="Nhập thông báo cho học sinh..." /><button className="rounded-xl bg-stone-950 px-5 py-3 font-black text-white">Lưu nháp thông báo</button></div></div>;
}

function SettingsTab({ selectedClass }: { selectedClass: any }) {
  return <div className="rounded-[24px] bg-white p-6 ring-1 ring-stone-200"><h3 className="flex items-center gap-2 text-xl font-black"><Settings className="h-5 w-5 text-amber-700" /> Class Settings</h3><div className="mt-5 grid gap-4 md:grid-cols-2"><Info label="Tên lớp" value={selectedClass.name} /><Info label="Trường" value={selectedClass.school_name} /><Info label="Mã lớp" value={selectedClass.class_code} /><Info label="Sĩ số" value={`${selectedClass.student_count}/${selectedClass.slot_limit}`} /><Info label="Trạng thái" value={selectedClass.status} /><Info label="Hết hạn" value={selectedClass.expires_at ? new Date(selectedClass.expires_at).toLocaleString("vi-VN") : "Không giới hạn"} /></div><p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800"><CalendarClock className="mr-2 inline h-4 w-4" /> Mật khẩu lớp chỉ hiển thị khi Admin tạo lớp để bảo mật.</p></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-stone-50 p-4"><p className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">{label}</p><strong className="mt-1 block text-stone-950">{value || "—"}</strong></div>;
}
