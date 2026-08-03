import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { API_URL, HEART_POLICY, useApp } from "../store";
import { getLessonById } from "../content/contentRepository";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Star, Gem, Heart, Crown, Home } from "lucide-react";

// ─── Canvas Confetti ──────────────────────────────────────────────────────────
function ConfettiCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: { x: number; y: number; vx: number; vy: number; color: string; r: number; rot: number; rotV: number }[] = [];
    const colors = ["#f59e0b", "#fde047", "#10b981", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c"];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        r: 6 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.2,
      });
    }
    let frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        ctx.restore();
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none" }}
    />
  );
}

// ─── Badge dữ liệu cho từng chương ───────────────────────────────────────────
const CHAPTER_BADGES: Record<string, { name: string; icon: string; desc: string }> = {
  u1: { name: "Chiến Binh Cách Mạng", icon: "⚙️", desc: "Chương 1: Cách mạng tư sản" },
  u2: { name: "Sao Đỏ Kiên Trung",    icon: "⭐", desc: "Chương 2: Chủ nghĩa xã hội" },
  u3: { name: "Dũng Sĩ Dân Tộc",      icon: "🛡️", desc: "Chương 3: Phong trào giải phóng" },
  u4: { name: "Anh Hùng Chiến Tranh", icon: "⚔️", desc: "Chương 4: Chiến tranh thế giới" },
  u5: { name: "Kiến Trúc Sư Hoà Bình",icon: "🕊️", desc: "Chương 5: Trật tự thế giới mới" },
  u6: { name: "Nhà Sử Học Việt Nam",  icon: "📜", desc: "Chương 6: Việt Nam hiện đại" },
};

// ─── Boss Celebration Modal ───────────────────────────────────────────────────
function BossCelebrationModal({ unitId, xp, onContinue }: {
  unitId: string;
  xp: number;
  onContinue: () => void;
}) {
  const badge = CHAPTER_BADGES[unitId] ?? { name: "Huyền Thoại Lịch Sử", icon: "🏆", desc: "Hoàn thành chương" };
  return (
    <>
      <ConfettiCanvas />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: "fixed", inset: 0, zIndex: 90,
          background: "rgba(0,0,0,0.75)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 60 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.1 }}
          style={{
            background: "linear-gradient(145deg, #1c1008, #2d1a04)",
            border: "2.5px solid rgba(253,224,71,0.6)",
            borderRadius: 28,
            padding: "36px 28px 28px",
            maxWidth: 340,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 0 60px rgba(245,158,11,0.35), 0 24px 64px rgba(0,0,0,0.6)",
          }}
        >
          {/* Badge icon */}
          <motion.div
            animate={{ scale: [1, 1.18, 1], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: 72, lineHeight: 1, marginBottom: 12 }}
          >
            {badge.icon}
          </motion.div>

          {/* Title */}
          <p style={{ color: "rgba(253,224,71,0.7)", fontSize: 11, letterSpacing: "0.25em", marginBottom: 6, fontFamily: '"Cinzel", serif' }}>
            HUY HIỆU CHƯƠNG MỚI
          </p>
          <h2 style={{
            color: "#fde047",
            fontFamily: '"Cinzel", serif',
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 4,
            textShadow: "0 0 20px rgba(245,158,11,0.6)",
          }}>
            {badge.name}
          </h2>
          <p style={{ color: "#c8a878", fontSize: 13, marginBottom: 24, fontFamily: '"Nunito", sans-serif' }}>
            {badge.desc}
          </p>

          {/* Rewards */}
          <div style={{
            display: "flex", gap: 10, justifyContent: "center", marginBottom: 28,
          }}>
            <div style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 12, padding: "10px 20px", display: "flex", alignItems: "center", gap: 6 }}>
              <Star style={{ width: 18, height: 18, color: "#fde047" }} />
              <span style={{ color: "#fde047", fontWeight: 800, fontSize: 16, fontFamily: '"Nunito", sans-serif' }}>+{xp} XP</span>
            </div>
            <div style={{ background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.35)", borderRadius: 12, padding: "10px 20px", display: "flex", alignItems: "center", gap: 6 }}>
              <Gem style={{ width: 18, height: 18, color: "#93c5fd" }} />
              <span style={{ color: "#93c5fd", fontWeight: 800, fontSize: 16, fontFamily: '"Nunito", sans-serif' }}>+5 💎</span>
            </div>
          </div>

          {/* Stars row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
            {[0, 0.15, 0.3].map((delay, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 18, delay: 0.4 + delay }}
              >
                <Star style={{ width: 32, height: 32, color: "#fde047", fill: "#fde047" }} />
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ y: -3, boxShadow: "0 10px 0 #92400e, 0 0 30px rgba(245,158,11,0.4)" }}
            whileTap={{ y: 2, boxShadow: "0 3px 0 #92400e" }}
            onClick={onContinue}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #f59e0b, #fde047)",
              boxShadow: "0 6px 0 #92400e",
              border: "none",
              borderRadius: 16,
              padding: "16px 0",
              color: "#1c0800",
              fontFamily: '"Cinzel", serif',
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "0.06em",
              cursor: "pointer",
            }}
          >
            TIẾP TỤC HÀNH TRÌNH →
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LessonScreen() {
  const { id = "", assignmentId = "" } = useParams();
  const nav = useNavigate();
  const { completeLesson, loseHeart, recoverDailyHearts, user } = useApp();

  const [unitId, setUnitId] = useState("");
  const [lessonStr, setLessonStr] = useState("");
  const [assignmentQuizReady, setAssignmentQuizReady] = useState(false);
  const [assignmentLessonId, setAssignmentLessonId] = useState("");
  const [assignmentError, setAssignmentError] = useState("");
  const [showBossCelebration, setShowBossCelebration] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const admittedWithEnergyRef = useRef(Boolean(user.isPremium || user.planType === "premium" || (user.hearts ?? 0) > 0));

  const lesson = useMemo(() => {
    if (assignmentId) return null;
    const l = getLessonById(id);
    if (l && l.unit) {
      setUnitId(l.unit.id);
      const lIndex = l.unit.lessons.findIndex((x) => x.id === id);
      setLessonStr((lIndex + 1).toString());
      return l;
    }
    return null;
  }, [assignmentId, id]);

  useEffect(() => {
    if (!assignmentId) return;

    let cancelled = false;

    async function loadAssignment() {
      const token = localStorage.getItem("ha_token");
      setAssignmentQuizReady(false);
      setAssignmentError("");

      try {
        const response = await fetch(`${API_URL}/me/assignments/${assignmentId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) throw new Error("Không tải được nội dung bài tập được giao");

        const data = await response.json();
        const rawQuestions = data.lesson?.questions?.length ? data.lesson.questions : data.lesson?.quiz_questions ?? [];
        const questions = rawQuestions.map((question: any, index: number) => {
          const rawOptions = Array.isArray(question.options) ? question.options : [];
          const options = rawOptions.map((option: any) => typeof option === "string" ? option : option.text ?? "");
          const correctIndex = rawOptions.findIndex((option: any) => Boolean(option?.correct));
          const answer = typeof question.answer === "number"
            ? question.answer
            : typeof question.correctOptionIndex === "number"
              ? question.correctOptionIndex
              : correctIndex >= 0
                ? correctIndex
                : Math.max(0, ["A", "B", "C", "D"].indexOf(String(question.answer ?? "A").toUpperCase()));

          return {
            ...question,
            globalId: question.globalId ?? index + 1,
            topicId: "assignment",
            topicName: data.lesson?.title ?? data.assignment?.title ?? "Bài tập được giao",
            topicTitle: data.lesson?.title ?? data.assignment?.title ?? "Bài tập được giao",
            topicIcon: "📘",
            topicColor: "#f59e0b",
            question: question.question ?? question.text ?? "",
            options,
            answer,
          };
        });

        if (!questions.length) throw new Error("Bài được giao chưa có câu hỏi. Giáo viên cần import lại bài hoặc sửa dữ liệu bài cũ.");

        sessionStorage.setItem("ha_assignment_quiz", JSON.stringify({
          assignmentId,
          lessonId: data.lesson?.id ?? data.assignment?.lesson_id ?? "",
          title: data.lesson?.title ?? data.assignment?.title ?? "Bài tập được giao",
          questions,
        }));

        if (!cancelled) {
          setAssignmentLessonId(data.lesson?.id ?? data.assignment?.lesson_id ?? "");
          setAssignmentQuizReady(true);
        }
      } catch (error) {
        if (!cancelled) {
          setAssignmentError(error instanceof Error ? error.message : "Không tải được bài tập");
        }
      }
    }

    loadAssignment();

    return () => {
      cancelled = true;
    };
  }, [assignmentId]);

  const handleContinue = useCallback(() => {
    setShowBossCelebration(false);
    nav("/home");
  }, [nav]);

  const syncHeartsToQuiz = useCallback((payload?: { beforeHearts?: number; afterHearts?: number; lost?: boolean; recoveryOffer?: "daily" | "pro" }) => {
    const maxHearts = HEART_POLICY.maxHearts;
    const isPremium = Boolean(user.isPremium || user.planType === "premium");
    const today = new Date().toISOString().slice(0, 10);
    const canUseDailyRecovery = !isPremium && user.lastFreeHeartRecoveryDate !== today;
    const hearts = Math.max(0, Math.min(maxHearts, user.hearts ?? maxHearts));
    const message = payload
      ? {
          type: "HEARTS_UPDATED",
          beforeHearts: payload.beforeHearts ?? hearts,
          afterHearts: payload.afterHearts ?? hearts,
          hearts: payload.afterHearts ?? hearts,
          maxHearts,
          lost: Boolean(payload.lost),
          isPremium,
          hasUsedFreeHeartRecovery: !canUseDailyRecovery,
          canUseDailyRecovery,
          dailyRecoveryAmount: HEART_POLICY.freeDailyRecoveryAmount,
          recoveryOffer: payload.recoveryOffer,
        }
      : {
          type: "HEARTS_SYNC",
          hearts,
          maxHearts,
          isPremium,
          hasUsedFreeHeartRecovery: !canUseDailyRecovery,
          canUseDailyRecovery,
          dailyRecoveryAmount: HEART_POLICY.freeDailyRecoveryAmount,
        };

    iframeRef.current?.contentWindow?.postMessage(message, "*");
  }, [user.hearts, user.isPremium, user.planType, user.lastFreeHeartRecoveryDate]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === "QUIZ_READY") {
        syncHeartsToQuiz();
        return;
      }

      // Hearts: trừ tim khi sai và gửi lại state thật cho iframe
      if (event.data.type === "LOSE_HEART") {
        const isPremium = Boolean(user.isPremium || user.planType === "premium");
        const maxHearts = HEART_POLICY.maxHearts;
        const beforeHearts = Math.max(0, Math.min(maxHearts, user.hearts ?? maxHearts));
        const afterHearts = isPremium ? beforeHearts : Math.max(0, beforeHearts - HEART_POLICY.losePerWrong);
        const today = new Date().toISOString().slice(0, 10);
        const canUseDailyRecovery = user.lastFreeHeartRecoveryDate !== today;
        const recoveryOffer = !isPremium && afterHearts <= 0
          ? (canUseDailyRecovery ? "daily" : "pro")
          : undefined;

        if (!isPremium && beforeHearts > 0) {
          loseHeart();
        }

        syncHeartsToQuiz({
          beforeHearts,
          afterHearts,
          lost: !isPremium && beforeHearts > afterHearts,
          recoveryOffer,
          reason: event.data.reason,
        });
        return;
      }

      if (event.data.type === "DAILY_HEART_RECOVERY_REQUEST" || event.data.type === "FREE_HEART_RECOVERY_REQUEST") {
        recoverDailyHearts();
        iframeRef.current?.contentWindow?.postMessage({
          type: "HEARTS_UPDATED",
          beforeHearts: 0,
          afterHearts: HEART_POLICY.freeDailyRecoveryAmount,
          hearts: HEART_POLICY.freeDailyRecoveryAmount,
          maxHearts: HEART_POLICY.maxHearts,
          lost: false,
          recovered: true,
          recoveryOffer: undefined,
          isPremium: Boolean(user.isPremium || user.planType === "premium"),
          hasUsedFreeHeartRecovery: true,
          canUseDailyRecovery: false,
          dailyRecoveryAmount: HEART_POLICY.freeDailyRecoveryAmount,
        }, "*");
        return;
      }

      if (event.data.type === "OPEN_PREMIUM") {
        nav("/premium?from=out-of-hearts");
        return;
      }

      if (event.data.type === "QUIZ_FINISHED") {
        if (assignmentId && assignmentLessonId) {
          completeLesson(assignmentLessonId, 0, {
            correctAnswers: event.data.correct ?? 0,
            totalQuestions: event.data.total ?? 1,
            maxStreak: event.data.maxStreak ?? 0,
            mode: "assignment",
          });
          return;
        }

        if (lesson) {
          if (lesson.type === "review") {
            if (event.data.correct === 15) {
              completeLesson(lesson.id, lesson.xp, {
                correctAnswers: event.data.correct ?? 0,
                totalQuestions: event.data.total ?? 15,
                maxStreak: event.data.maxStreak ?? 0,
                mode: "review",
              });
              alert("Tuyệt vời! Bạn đã hoàn thành 100% đúng bài ôn tập. +30 Kim Cương! 💎");
            } else {
              alert(`Bạn chỉ làm đúng ${event.data.correct}/15 câu ngay từ đầu. Cố gắng làm đúng 100% để nhận 30 Kim Cương nhé!`);
            }
            nav("/home");
          } else if (lesson.type === "boss") {
            // Boss: Hiện celebration modal thay vì nav ngay
            completeLesson(lesson.id, lesson.xp, {
              correctAnswers: event.data.correct ?? 0,
              totalQuestions: event.data.total ?? 1,
              maxStreak: event.data.maxStreak ?? 0,
              mode: "lesson",
            });
            setShowBossCelebration(true);
          } else {
            completeLesson(lesson.id, lesson.xp, {
              correctAnswers: event.data.correct ?? 0,
              totalQuestions: event.data.total ?? 1,
              maxStreak: event.data.maxStreak ?? 0,
              mode: "lesson",
            });
            nav("/home");
          }
        }
      } else if (event.data.type === "RETURN_HOME") {
        nav("/home");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [assignmentId, assignmentLessonId, lesson, completeLesson, loseHeart, recoverDailyHearts, nav, syncHeartsToQuiz, user.hearts, user.isPremium, user.planType, user.lastFreeHeartRecoveryDate]);

  useEffect(() => {
    syncHeartsToQuiz();
  }, [syncHeartsToQuiz]);

  if (assignmentError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 px-5">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <p className="mb-5 font-bold text-red-700">{assignmentError}</p>
          <button onClick={() => nav("/assignments")} className="rounded-full bg-stone-950 px-5 py-3 font-black text-white">
            Quay lại bài tập
          </button>
        </div>
      </div>
    );
  }

  if (assignmentId ? !assignmentQuizReady : (!lesson || !unitId || !lessonStr)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <p>Đang tải bài học...</p>
      </div>
    );
  }

  const isPremium = Boolean(user.isPremium || user.planType === "premium");
  const isOutOfEnergy = !isPremium && (user.hearts ?? 0) <= 0 && !admittedWithEnergyRef.current;

  if (isOutOfEnergy) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: "radial-gradient(circle at top, #3a1d0a 0%, #140905 55%, #080402 100%)" }}>
        <div className="w-full max-w-md rounded-[32px] p-7 text-center" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))", border: "1px solid rgba(255,216,107,0.22)", boxShadow: "0 28px 90px rgba(0,0,0,0.48)" }}>
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full" style={{ background: "rgba(239,68,68,0.13)", color: "#fb7185" }}>
            <Heart className="h-14 w-14" fill="currentColor" />
          </div>
          <h1 className="mb-3" style={{ color: "#fff7ed", fontSize: 28, fontWeight: 950, fontFamily: '"Nunito", sans-serif' }}>Bạn đã hết năng lượng học tập</h1>
          <p className="mb-6" style={{ color: "rgba(255,247,237,0.78)", lineHeight: 1.6, fontWeight: 700 }}>
            Bài học mới đang bị khóa cho tới khi năng lượng hồi phục. Nâng cấp Pro để học không giới hạn.
          </p>
          <button onClick={() => nav("/premium?from=out-of-hearts")} className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4" style={{ background: "linear-gradient(180deg,#ffd86b,#f59e0b)", color: "#2b1300", fontWeight: 950, boxShadow: "0 7px 0 #b45309" }}>
            <Crown className="h-5 w-5" /> NÂNG CẤP PRO
          </button>
          <button onClick={() => nav("/home")} className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,247,237,0.82)", fontWeight: 900 }}>
            <Home className="h-5 w-5" /> VỀ TRANG CHỦ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", margin: 0, padding: 0, overflow: "hidden", background: "#fff" }}>
      <iframe
        ref={iframeRef}
        src={assignmentId ? `/quiz/index.html?assignment=1&id=${encodeURIComponent(assignmentId)}` : `/quiz/index.html?unit=${unitId}&lesson=${lessonStr}&type=${lesson?.type}`}
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Trắc nghiệm Lịch sử"
        onLoad={() => syncHeartsToQuiz()}
      />

      <AnimatePresence>
        {showBossCelebration && (
          <BossCelebrationModal
            unitId={unitId}
            xp={lesson.xp}
            onContinue={handleContinue}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
