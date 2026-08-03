import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { BookOpenCheck, Loader2, RefreshCw, Trophy } from "lucide-react";
import { API_URL } from "../store";

type Assignment = {
  id: string;
  lesson_id: string;
  title: string;
  status?: string;
  student_status?: string;
  best_score?: number | null;
  student_score?: number | null;
};

export default function AssignmentsScreen() {
  const nav = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAssignments() {
    const token = localStorage.getItem("ha_token");
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/me/assignments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Không tải được bài tập được giao");
      const data = await response.json();
      setAssignments(data.assignments ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được bài tập");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignments();
  }, []);

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-8 lg:px-10">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 overflow-hidden rounded-[32px] bg-[#1d1308] p-8 text-white shadow-[0_28px_80px_rgba(68,40,8,0.25)]">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-amber-300">Teacher Quest Board</p>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-4xl font-black tracking-tight md:text-6xl">Bài tập được giao</h1>
              <p className="mt-3 max-w-2xl text-stone-300">Nhận nhiệm vụ từ giáo viên, hoàn thành quiz và tiến độ sẽ tự động gửi về Manager.</p>
            </div>
            <button onClick={loadAssignments} className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 font-black text-stone-950">
              <RefreshCw className="h-4 w-4" /> Làm mới
            </button>
          </div>
        </div>

        {loading && (
          <div className="rounded-3xl bg-white p-10 text-center font-bold text-stone-600 shadow-sm">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-amber-600" /> Đang tải bài tập...
          </div>
        )}

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 font-semibold text-red-700">{error}</div>}

        {!loading && !error && assignments.length === 0 && (
          <div className="rounded-3xl border border-amber-200 bg-[#fffaf0] p-10 text-center">
            <BookOpenCheck className="mx-auto mb-4 h-14 w-14 text-amber-700" />
            <h2 className="text-2xl font-black text-stone-950">Chưa có bài tập mới</h2>
            <p className="mt-2 text-stone-600">Khi giáo viên giao bài, nhiệm vụ sẽ xuất hiện tại đây.</p>
          </div>
        )}

        <div className="grid gap-4">
          {assignments.map((assignment, index) => {
            const completed = (assignment.student_status ?? assignment.status) === "completed";
            const score = assignment.student_score ?? assignment.best_score;
            return (
              <motion.article
                key={assignment.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="group rounded-[28px] border border-amber-100 bg-white p-5 shadow-[0_14px_40px_rgba(120,80,20,0.08)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-2xl">{completed ? "🏆" : "📜"}</div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{completed ? "Đã hoàn thành" : "Nhiệm vụ mới"}</p>
                      <h2 className="text-xl font-black text-stone-950">{assignment.title}</h2>
                      {score !== null && score !== undefined && (
                        <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-emerald-700"><Trophy className="h-4 w-4" /> Điểm: {score}%</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!completed) nav(`/assignment/${assignment.id}`);
                    }}
                    disabled={completed}
                    className={`rounded-full px-6 py-3 font-black transition ${
                      completed
                        ? "cursor-not-allowed bg-emerald-100 text-emerald-800"
                        : "bg-stone-950 text-white group-hover:-translate-y-0.5 group-hover:bg-amber-600"
                    }`}
                  >
                    {completed ? "Đã nộp bài" : "Vào làm bài"}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
