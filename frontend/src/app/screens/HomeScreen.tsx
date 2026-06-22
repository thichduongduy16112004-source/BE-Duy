import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useApp, MASCOTS } from "../store";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Trophy, Flame, Crown, Scroll, BookOpen, BookMarked, ChevronRight, Zap, Star, FastForward, Dumbbell } from "lucide-react";
import { useAppSound } from "../hooks/useAppSound";
import { getAllUnits } from "../content/contentRepository";
import { CONTENT_UNITS } from "../content/mockContent";
import { fetchPublishedLessonDataset } from "../content/publishedLessonApi";
import { mapPublishedDatasetToUnits } from "../content/publishedLessonAdapter";
import { mergePublishedUnits } from "../content/mergePublishedUnits";
import { setPublishedUnitsCache } from "../content/publishedUnitsCache";

const ZIGZAG = [0, 72, 0, -72, 0, 72, 0, -72, 0, 72];



// Warm historical backgrounds - light & cinematic
const UNIT_WARM_BG: Record<string, { from: string; to: string; path: string; accent: string }> = {
  u1: {
    from: "#4a2c0a",
    to: "#2d1400",
    path: "linear-gradient(160deg, #f9f0de 0%, #f0e6cc 40%, #e8d9b8 100%)",
    accent: "#c07a1a",
  },
  u2: {
    from: "#5c1a1a",
    to: "#3b0e0e",
    path: "linear-gradient(160deg, #fdf0ec 0%, #f5ddd8 40%, #ead0c8 100%)",
    accent: "#c0392b",
  },
  u3: {
    from: "#1a3d2e",
    to: "#0d2418",
    path: "linear-gradient(160deg, #eef8f2 0%, #d8f0e4 40%, #c5e8d6 100%)",
    accent: "#1a7a50",
  },
  u4: {
    from: "#1a2050",
    to: "#0d1230",
    path: "linear-gradient(160deg, #eef0fc 0%, #d8dcf8 40%, #c8cef0 100%)",
    accent: "#2a3aab",
  },
};

export default function HomeScreen() {
  const { user } = useApp();
  const nav = useNavigate();
  const playClick = useAppSound("click");
  const mockUnits = CONTENT_UNITS;
  const [units, setUnits] = useState(mockUnits);
  const [isLoadingPublishedLessons, setIsLoadingPublishedLessons] = useState(true);
  const [isUsingMockFallback, setIsUsingMockFallback] = useState(true);
  const upcomingUnits = isUsingMockFallback ? units.slice(4, 6) : [];
  const userMascot = MASCOTS.find(m => m.id === user.mascotId) || MASCOTS[0];

  useEffect(() => {
    const controller = new AbortController();

    async function loadPublishedLessons() {
      setIsLoadingPublishedLessons(true);
      const dataset = await fetchPublishedLessonDataset(controller.signal);
      if (controller.signal.aborted) return;

      const publishedUnits = dataset ? mapPublishedDatasetToUnits(dataset) : [];
      setPublishedUnitsCache(publishedUnits);
      setUnits(mergePublishedUnits(mockUnits, publishedUnits));
      setIsUsingMockFallback(publishedUnits.length === 0);
      setIsLoadingPublishedLessons(false);
    }

    loadPublishedLessons();

    return () => controller.abort();
  }, []);

  const activeUnitIdx = (() => {
    for (let i = 0; i < units.length; i++) {
      const prevDone = i === 0 || units[i - 1].lessons.every(l => user.completedLessons.includes(l.id));
      if (prevDone && !units[i].lessons.every(l => user.completedLessons.includes(l.id))) return i;
    }
    return Math.max(units.length - 1, 0);
  })();

  const activeUnit = units[activeUnitIdx] ?? mockUnits[0];
  const completedInActive = activeUnit.lessons.filter(l => user.completedLessons.includes(l.id)).length;
  const nextLesson = activeUnit.lessons.find(l => !user.completedLessons.includes(l.id));
  const [showOutOfHeartsGate, setShowOutOfHeartsGate] = useState(false);
  const isPremium = Boolean(user.isPremium || user.planType === "premium");
  const isOutOfEnergy = !isPremium && (user.hearts ?? 0) <= 0;
  const getLessonPath = (lesson: UnitType["lessons"][0]) =>
    lesson.type === "story" ? `/story/${lesson.id}` : `/lesson/${lesson.id}`;
  const handleOpenLesson = (lesson: UnitType["lessons"][0]) => {
    playClick();
    if (isOutOfEnergy) {
      setShowOutOfHeartsGate(true);
      return;
    }
    nav(getLessonPath(lesson));
  };

  return (
    <div
      className="pb-28 lg:pb-10"
      style={{ background: "linear-gradient(180deg, #fdf8ef 0%, #f7f0e2 50%, #f2e8d5 100%)", minHeight: "100vh" }}
    >



      {/* ══════════════════════════════════════════
          HERO — Compact banner, focus trên bản đồ
      ══════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{ minHeight: 200, maxHeight: 220 }}
      >
        {/* Warm layered background */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${activeUnit.bgFrom} 0%, ${activeUnit.bgTo} 100%)` }} />
        {/* Warm amber vignette instead of cold black */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(80,40,0,0.1) 0%, rgba(40,18,0,0.55) 100%)" }} />
        {/* Warm sepia grain texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            opacity: 0.4,
          }}
        />
        {/* Warm gold ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 25% 55%, rgba(255,200,80,0.12) 0%, transparent 65%)" }} />
        {/* Parchment-like top edge */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,210,100,0.5), transparent)" }} />

        {/* Content — compact layout */}
        <div className="relative z-10 px-5 lg:px-10 py-5 max-w-3xl flex flex-col justify-center" style={{ minHeight: 200 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>

            {/* Chapter badge — Duolingo pill style */}
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{
                  background: "rgba(255,200,60,0.2)",
                  border: "2px solid rgba(255,200,60,0.5)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Star className="w-3 h-3" style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                <span style={{
                  color: "#fde68a",
                  fontFamily: '"Nunito", sans-serif',
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: "0.05em",
                }}>
                  Chương {activeUnitIdx + 1}
                </span>
              </motion.div>
              <span style={{ color: "rgba(220,190,140,0.65)", fontSize: 11, fontFamily: '"Nunito", sans-serif', fontWeight: 600 }}>

              </span>
            </div>

            {/* Hero title — Nunito playful, NO uppercase transform */}
            <h1
              className="mb-1"
              style={{
                fontFamily: '"Nunito", sans-serif',
                color: "#fff8ec",
                fontSize: "clamp(22px, 4vw, 32px)",
                fontWeight: 900,
                lineHeight: 1.2,
                textShadow: "0 2px 16px rgba(0,0,0,0.7)",
                letterSpacing: "-0.01em",
              }}
            >
              {activeUnit.title}
            </h1>
            <p className="mb-4" style={{
              color: "#c8a878",
              fontSize: 12,
              lineHeight: 1.5,
              fontFamily: '"Nunito", sans-serif',
              fontWeight: 500,
              maxWidth: 260,
            }}>
              {activeUnit.description}
            </p>

            {/* Progress + CTA — compact row */}
            <div className="flex flex-wrap items-center gap-2">


              {/* CTA button — Duolingo 3D style */}
              {nextLesson && (
                <motion.button
                  whileHover={{ y: -2, boxShadow: "0 8px 0 #7c2d0a, 0 0 24px rgba(255,180,40,0.4)" }}
                  whileTap={{ y: 4, boxShadow: "0 2px 0 #7c2d0a" }}
                  onClick={() => handleOpenLesson(nextLesson)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #f5b830)",
                    boxShadow: "0 5px 0 #7c2d0a",
                    color: "#1c0800",
                    fontFamily: '"Nunito", sans-serif',
                    fontWeight: 900,
                    fontSize: 13,
                    letterSpacing: "0.02em",
                  }}
                >
                  <Flame className="w-4 h-4" />
                  {completedInActive === 0 ? "Bắt đầu thôi! ⚔️" : "Tiếp tục nào! ⚡"}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #fdf8ef)" }}
        />
      </div>



      {/* ══════════════════════════════════════════
          CAMPAIGN MAP — All chapters
      ══════════════════════════════════════════ */}
      <div className="px-4 lg:px-10 pt-4 pb-2 max-w-4xl mx-auto flex items-center gap-3">
        <span style={{ fontSize: 20 }}>🗺️</span>
        <p style={{
          color: "#92400e",
          fontFamily: '"Nunito", sans-serif',
          fontWeight: 900,
          fontSize: 16,
          letterSpacing: "-0.01em",
        }}>Bản đồ chiến dịch</p>
        <div style={{ flex: 1, height: 2, background: "linear-gradient(to right, rgba(180,100,0,0.2), transparent)", borderRadius: 99 }} />
        <span style={{ color: "#a16207", fontSize: 11, fontFamily: '"Nunito", sans-serif', fontWeight: 800 }}>
          {isLoadingPublishedLessons ? "Đang đồng bộ Admin..." : isUsingMockFallback ? "Nội dung mẫu" : "Đã đồng bộ Admin"}
        </span>
      </div>

      <div className="px-4 lg:px-12 max-w-4xl mx-auto space-y-5 pb-4">
        {units.map((unit, ui) => {
          const prevDone = ui === 0 || units[ui - 1].lessons.every(l => user.completedLessons.includes(l.id));
          const unitLocked = !prevDone;
          const completedIn = unit.lessons.filter(l => user.completedLessons.includes(l.id)).length;
          const pct = Math.round((completedIn / unit.lessons.length) * 100);
          const isActive = ui === activeUnitIdx;
          const warmBg = UNIT_WARM_BG[unit.originalUnitId ?? unit.id] || UNIT_WARM_BG[unit.id] || UNIT_WARM_BG.u1;
          const chapterBackground = getUnitBackgroundImage(unit, warmBg.path);

          return (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + ui * 0.1, type: "spring", stiffness: 220, damping: 24 }}
              className="rounded-3xl overflow-hidden"
              style={{
                border: `1.5px solid ${isActive ? "rgba(212,140,40,0.55)" : unitLocked ? "rgba(220,210,195,0.8)" : "rgba(210,200,180,0.6)"}`,
                boxShadow: isActive
                  ? "0 8px 40px rgba(180,100,0,0.16), 0 2px 8px rgba(0,0,0,0.06)"
                  : "0 2px 12px rgba(0,0,0,0.05), 0 1px 0 rgba(255,255,255,0.7) inset",
              }}
            >
              {/* Chapter header */}
              <div
                className="relative overflow-hidden"
                style={{ background: `linear-gradient(145deg, ${unit.bgFrom} 0%, ${unit.bgTo} 100%)`, minHeight: unitLocked ? 80 : 114 }}
              >
                {/* Warm grain */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(255,200,80,0.08) 0%, transparent 70%)" }} />
                {/* Background art */}
                <div className="absolute right-5 top-1/2 -translate-y-1/2 select-none pointer-events-none" style={{ fontSize: 60, opacity: 0.14 }}>

                </div>

                <div className="relative z-10 px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span style={{
                        color: "#fde68a",
                        fontFamily: '"Nunito", sans-serif',
                        fontWeight: 800,
                        fontSize: 11,
                      }}>
                        ✦ Chương {ui + 1}
                      </span>
                      {unitLocked && <span style={{ fontSize: 11 }}>🔒</span>}
                      {pct === 100 && (
                        <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.2)", color: "#4ade80", fontSize: 10, fontWeight: 700, fontFamily: '"Nunito", sans-serif' }}>✓ Xong</span>
                      )}
                      {isActive && !unitLocked && pct < 100 && (
                        <motion.span
                          animate={{ opacity: [1, 0.35, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(217,119,6,0.28)", color: "#fdd580", fontSize: 10, fontWeight: 600, fontFamily: '"Nunito", sans-serif' }}
                        >
                          ● Đang học
                        </motion.span>
                      )}
                    </div>
                    <h2 style={{
                      fontFamily: '"Nunito", sans-serif',
                      color: unitLocked ? "#7a6850" : "#fff8ec",
                      fontSize: "clamp(14px, 2.5vw, 18px)",
                      fontWeight: 900,
                      lineHeight: 1.2,
                      letterSpacing: "-0.01em",
                    }}>
                      {unit.title}
                    </h2>
                  </div>
                </div>

                {/* Progress bar */}
                {!unitLocked && (
                  <div className="px-5 pb-4 relative z-10">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(to right, #d97706, #fbbf24)", boxShadow: "0 0 8px rgba(251,191,36,0.5)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, delay: 0.3 + ui * 0.08 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Path section — Seamless Vertical Map */}
              <div
                className="pt-4 pb-0 relative w-full overflow-hidden flex justify-center"
                style={{
                  backgroundColor: "#ebd2a9",
                  backgroundImage: chapterBackground,
                  backgroundSize: "cover, cover, cover",
                  backgroundPosition: "center top, center top, center",
                  backgroundRepeat: "no-repeat",
                  boxShadow: "inset 0 10px 20px rgba(0,0,0,0.15)",
                }}
              >
                <UnitPath
                  unit={unit}
                  completedLessons={user.completedLessons}
                  warmAccent={warmBg.accent}
                  unitLocked={unitLocked}
                  onNavigate={(id) => {
                    playClick();
                    const l = unit.lessons.find(x => x.id === id);
                    if (l) handleOpenLesson(l);
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
          UPCOMING — Teaser for what's next
      ══════════════════════════════════════════ */}
      {upcomingUnits.length > 0 && (
        <div className="px-4 lg:px-12 pt-6 pb-4 max-w-4xl mx-auto">
          <p style={{ color: "#92400e", fontFamily: '"Nunito", sans-serif', fontWeight: 900, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>Sắp Tới</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcomingUnits.map((unit, idx) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.08 }}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(248,244,232,0.94), rgba(242,234,216,0.84))",
                  border: "1.5px dashed rgba(185,160,110,0.45)",
                  boxShadow: "0 10px 26px rgba(120, 83, 32, 0.08), inset 0 1px 0 rgba(255,255,255,0.78)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: "rgba(220,210,190,0.72)", border: "1px solid rgba(190,175,145,0.5)" }}
                >
                  🔒
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ color: "#b09878", fontSize: 11, marginBottom: 3, fontFamily: '"Nunito", sans-serif', fontWeight: 700 }}>Chương {4 + idx + 1} · Sắp tới</p>
                  <p style={{ color: "#78614a", fontSize: 14, fontWeight: 900, fontFamily: '"Nunito", sans-serif', lineHeight: 1.25 }}>{unit.title}</p>
                  <p style={{ color: "#a58a68", fontSize: 11, fontWeight: 650, fontFamily: '"Nunito", sans-serif', marginTop: 4 }}>{unit.description || unit.era}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: "rgba(210,198,178,0.5)", border: "1px solid rgba(190,178,155,0.4)" }}>
                  <Lock className="w-3.5 h-3.5" style={{ color: "#a8a29e" }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showOutOfHeartsGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center px-5"
            style={{ background: "rgba(20, 9, 0, 0.52)", backdropFilter: "blur(14px)" }}
          >
            <motion.div
              initial={{ y: 24, scale: 0.94, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, scale: 0.96, opacity: 0 }}
              className="w-full max-w-sm rounded-[28px] p-6 text-center"
              style={{
                background: "radial-gradient(circle at 50% 0%, rgba(255,216,107,0.18), transparent 38%), linear-gradient(180deg, #21120a, #130904)",
                border: "1px solid rgba(255,216,107,0.22)",
                boxShadow: "0 30px 90px rgba(0,0,0,0.48), 0 0 38px rgba(245,158,11,0.18)",
              }}
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-5xl" style={{ background: "rgba(239,68,68,0.13)", color: "#f87171", boxShadow: "0 18px 38px rgba(239,68,68,0.18)" }}>♥</div>
              <h3 className="mb-2" style={{ color: "#fff7ed", fontSize: 24, fontWeight: 950, fontFamily: '"Nunito", sans-serif' }}>Bạn đã hết năng lượng học tập</h3>
              <p className="mb-5" style={{ color: "rgba(255,247,237,0.76)", fontSize: 14, lineHeight: 1.55, fontWeight: 700 }}>
                Bạn cần chờ hồi năng lượng hoặc nâng cấp Pro để tiếp tục mở bài học mới.
              </p>
              <button
                onClick={() => nav("/premium?from=out-of-hearts")}
                className="w-full rounded-2xl px-5 py-4"
                style={{ background: "linear-gradient(180deg,#ffd86b,#f59e0b)", color: "#251100", fontWeight: 950, boxShadow: "0 7px 0 #b45309" }}
              >
                NÂNG CẤP PRO
              </button>
              <button
                onClick={() => setShowOutOfHeartsGate(false)}
                className="mt-3 w-full rounded-2xl px-5 py-3"
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,247,237,0.78)", fontWeight: 900 }}
              >
                ĐỂ SAU
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type UnitType = ReturnType<typeof getAllUnits>[0];

function getUnitBackgroundImage(unit: UnitType, fallbackPath: string) {
  const assetUnitId = unit.originalUnitId ?? unit.id;
  const localAsset = `url(/assets/bg_${assetUnitId}.png)`;

  if (unit.backgroundImage) {
    return `url(${unit.backgroundImage}), ${localAsset}, ${fallbackPath}`;
  }

  if (unit.source === "published") {
    const apiUnitId = encodeURIComponent(assetUnitId);
    const apiLessonId = encodeURIComponent(unit.lessons[0]?.id ?? `${assetUnitId}-l1`);
    return `url(http://localhost:8000/api/v1/lesson-content/assets/${apiUnitId}/${apiLessonId}), ${localAsset}, ${fallbackPath}`;
  }

  return `${localAsset}, ${fallbackPath}, ${fallbackPath}`;
}

// ─── Whimsical Decoration data ──────────────────────────────────────────────────────────
const DECORATIONS = [
  { img: "/assets/cartoon_house.png", side: "left",  offsetX: -90, offsetY: -30, scale: 1.1, isBig: true },
  { img: "/assets/round_bush.png", side: "right", offsetX:  70, offsetY:  20, scale: 0.8, isBig: false },
  { img: "/assets/swirly_tree.png", side: "right", offsetX:  85, offsetY: -20, scale: 1.2, isBig: true },
  { img: "/assets/cartoon_drum.png", side: "left",  offsetX: -85, offsetY:  10, scale: 1.0, isBig: false },
  { img: "/assets/swirly_tree.png", side: "left",  offsetX: -80, offsetY:  50, scale: 1.1, isBig: true },
  { img: "/assets/cartoon_house.png", side: "right", offsetX:  80, offsetY: -40, scale: 1.05, isBig: true },
  { img: "/assets/round_bush.png", side: "left",  offsetX: -75, offsetY: -10, scale: 0.9, isBig: false },
  { img: "/assets/cartoon_drum.png", side: "right", offsetX:  65, offsetY:  35, scale: 1.1, isBig: false },
  { img: "/assets/swirly_tree.png", side: "left",  offsetX: -70, offsetY:  25, scale: 1.0, isBig: true },
  { img: "/assets/round_bush.png", side: "right", offsetX:  75, offsetY: -15, scale: 1.0, isBig: false },
] as const;

// ─── UnitPath ─────────────────────────────────────────────────────────────────
function UnitPath({ unit, completedLessons, warmAccent, unitLocked, onNavigate }: {
  unit: UnitType;
  completedLessons: string[];
  warmAccent: string;
  unitLocked: boolean;
  onNavigate: (id: string) => void;
}) {
  const lessons = unit.lessons;
  const CONT_W = 340;
  const ROW_H = 110;
  const TOP_PAD = 70;
  const totalH = TOP_PAD + lessons.length * ROW_H + 80;

  // Tính số thứ tự practice trong toàn bộ lessons của unit
  let practiceCounter = 0;
  const practiceNumbers: number[] = lessons.map(l => {
    if (l.type === 'practice') { practiceCounter++; return practiceCounter; }
    return 0;
  });

  const nodes = lessons.map((lesson, i) => {
    const isDone    = completedLessons.includes(lesson.id);
    const isJump    = unitLocked && i === 0;
    const prevDone  = i === 0 ? !unitLocked : completedLessons.includes(lessons[i - 1].id);
    const isReview  = lesson.type === "review";
    const isPractice = lesson.type === "practice";
    const isLocked  = (!prevDone && !isJump) || (isReview && isDone);
    const isCurrent = (!isDone && !isLocked) || isJump;
    const isBoss    = lesson.type === "boss";
    const practiceNumber = practiceNumbers[i];
    // Size: boss to hơn 1 chút, review to vừa, current to nhất
    const size = isCurrent ? 92 : isReview ? 84 : isBoss ? 80 : isPractice ? 76 : 72;
    const x = CONT_W / 2 + ZIGZAG[i % ZIGZAG.length];
    const y = TOP_PAD + i * ROW_H + ROW_H / 2;

    return { lesson, isDone, isLocked, isCurrent, isBoss, isReview, isJump, isPractice, practiceNumber, size, x, y };
  });

  const svgPath = nodes.map((n, i) => {
    if (i === 0) return `M ${n.x} ${n.y}`;
    const prev = nodes[i - 1];
    const midY = (prev.y + n.y) / 2;
    return `C ${prev.x} ${midY} ${n.x} ${midY} ${n.x} ${n.y}`;
  }).join(" ");

  return (
    <div className="flex justify-center w-full py-6">
      <div className="relative" style={{ width: CONT_W, height: totalH }}>
        <svg className="absolute inset-0 pointer-events-none" width={CONT_W} height={totalH} overflow="visible">
          {/* Lớp viền ngoài (đậm) */}
          <path d={svgPath} fill="none" stroke="#784212" strokeWidth="52" strokeLinecap="round" strokeLinejoin="round" />
          {/* Lớp bóng đổ bên trong đường viền */}
          <path d={svgPath} fill="none" stroke="#935116" strokeWidth="46" strokeLinecap="round" strokeLinejoin="round" />
          {/* Lớp giữa đường (màu cát/đất) */}
          <path d={svgPath} fill="none" stroke="#d68910" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" />
          {/* Lớp trên cùng mặt đường sáng hơn */}
          <path d={svgPath} fill="none" stroke="#f5b041" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round" />
          {/* Thêm chút highlight ở giữa tạo độ cong 3D */}
          <path d={svgPath} fill="none" stroke="#f8c471" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {nodes.map((node, idx) => (
          <LessonNode
            key={node.lesson.id}
            node={node}
            accent={unit.accent}
            warmAccent={warmAccent}
            delay={idx * 0.06}
            onClick={() => !node.isLocked && onNavigate(node.lesson.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── LessonNode ─────────────────────────────────────────────────────────────────
function LessonNode({ node, accent, warmAccent, delay, onClick }: {
  node: {
    lesson: UnitType["lessons"][0];
    isDone: boolean;
    isLocked: boolean;
    isCurrent: boolean;
    isBoss: boolean;
    isReview: boolean;
    isJump: boolean;
    isPractice: boolean;
    practiceNumber: number;
    size: number;
    x: number;
    y: number;
  };
  accent: string;
  warmAccent: string;
  delay: number;
  onClick: () => void;
}) {
  const [showLockedTip, setShowLockedTip] = useState(false);
  const { lesson, isDone, isLocked, isCurrent, isBoss, isReview, isJump, isPractice, practiceNumber, size, x, y } = node;

  const nodeBg = isLocked
    ? "linear-gradient(180deg, #e5e7eb 0%, #cbd5e1 100%)"
    : isJump
    ? "radial-gradient(circle at 35% 28%, #fde047 0%, #f97316 45%, #ea580c 80%, #9a3412 100%)"
    : isReview
    ? "radial-gradient(circle at 35% 28%, #f3e8ff 0%, #a855f7 45%, #7c3aed 80%, #4c1d95 100%)"
    : isBoss
    ? "radial-gradient(circle at 35% 28%, #fde68a 0%, #f59e0b 35%, #dc2626 75%, #991b1b 100%)"
    : isPractice && isDone
    ? "radial-gradient(circle at 35% 28%, #fef08a 0%, #facc15 45%, #ca8a04 80%, #78350f 100%)"
    : isPractice
    ? "radial-gradient(circle at 35% 28%, #bfdbfe 0%, #60a5fa 45%, #2563eb 80%, #1e3a8a 100%)"
    : isCurrent
    ? "radial-gradient(circle at 35% 28%, #fde68a 0%, #f59e0b 45%, #d97706 80%, #b45309 100%)"
    : isDone
    ? "radial-gradient(circle at 38% 28%, #fde68a 0%, #f59e0b 50%, #d97706 80%, #92400e 100%)"
    : `radial-gradient(circle at 38% 28%, rgba(255,255,255,0.2) 0%, ${accent} 60%)`;

  const nodeBorder = isLocked
    ? "2.5px solid #e2e8f0"
    : isJump
    ? "3px solid rgba(253,224,71,0.9)"
    : isReview
    ? "3px solid rgba(216,180,254,0.9)"
    : isBoss
    ? "3px solid rgba(255,220,80,0.9)"
    : isPractice && isDone
    ? "3px solid rgba(253,224,71,0.9)"
    : isPractice
    ? "3px solid rgba(147,197,253,0.9)"
    : isCurrent
    ? "3px solid rgba(255,220,80,0.9)"
    : isDone
    ? "3px solid rgba(253,224,71,0.85)"
    : "2px solid rgba(255,210,100,0.7)";

  const nodeShadow = isLocked
    ? "0 6px 0 #94a3b8, 0 8px 18px rgba(0,0,0,0.18)"
    : isJump
    ? "0 8px 0 #9a3412, 0 0 0 6px rgba(249,115,22,0.25), 0 0 32px rgba(249,115,22,0.55)"
    : isReview
    ? "0 8px 0 #4c1d95, 0 0 0 6px rgba(168,85,247,0.22), 0 0 30px rgba(168,85,247,0.5)"
    : isBoss
    ? "0 8px 0 #7f1d1d, 0 0 40px rgba(239,68,68,0.5)"
    : isCurrent
    ? "0 7px 0 #7c2d12, 0 0 0 6px rgba(251,191,36,0.25), 0 0 32px rgba(251,191,36,0.55)"
    : isDone
    ? "0 5px 0 #047857, 0 8px 20px rgba(5,150,105,0.35)"
    : `0 5px 0 rgba(0,0,0,0.3)`;

  const iconColor = isLocked
    ? "#94a3b8"
    : isJump
    ? "#ffffff"
    : isReview
    ? "#f3e8ff"
    : isBoss
    ? "#fef3c7"
    : isPractice && isDone
    ? "#fef9c3"
    : isPractice
    ? "#dbeafe"
    : isCurrent
    ? "#7c2d12"
    : isDone
    ? "#fef3c7"
    : "#fffbeb";

  const Icon = isReview
    ? BookMarked
    : isBoss
    ? Crown
    : isPractice
    ? Dumbbell
    : lesson.type === "story"
    ? Scroll
    : BookOpen;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.2 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
      className="absolute flex flex-col items-center"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        zIndex: 2,
        pointerEvents: "auto"
      }}
    >
      {isCurrent && (
        <motion.div
          className="absolute flex flex-col items-center"
          style={{ bottom: "calc(100% + 4px)", left: "50%", zIndex: 20, pointerEvents: "none" }}
          initial={{ opacity: 0, x: "-50%", y: 6 }}
          animate={{ opacity: 1, x: "-50%", y: 0 }}
        >
          <motion.div
            className="flex flex-col items-center"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              className="rounded-2xl whitespace-nowrap flex items-center justify-center"
              style={{
                padding: "10px 18px",
                background: isJump ? "#37383a" : "#1e3f28",
                border: isJump ? "3px solid #555759" : "3px solid #dca626",
                color: isJump ? "#f97316" : "#fde047",
                fontFamily: '"Nunito", sans-serif',
                fontSize: 16,
                fontWeight: 800,
                boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                letterSpacing: isJump ? "0.04em" : "0.02em",
                gap: "8px",
                position: "relative",
                zIndex: 10
              }}
            >
              {isJump ? "HỌC VƯỢT?" : isBoss ? "⚔️ Thử thách" : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3L19 12L5 21V3Z" />
                  </svg>
                  Bắt đầu
                </>
              )}
            </div>
            {/* Seamless caret overlapping the border */}
            <div
              style={{
                width: 14,
                height: 14,
                background: isJump ? "#37383a" : "#1e3f28",
                borderBottom: isJump ? "3px solid #555759" : "3px solid #dca626",
                borderRight: isJump ? "3px solid #555759" : "3px solid #dca626",
                transform: "rotate(45deg)",
                marginTop: "-8px",
                position: "relative",
                zIndex: 11
              }}
            />
          </motion.div>
        </motion.div>
      )}

      {isCurrent && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: size + 28, height: size + 28, left: -14, top: -14, border: isJump ? "3px solid rgba(249,115,22,0.5)" : "3px solid rgba(251,191,36,0.5)" }}
          animate={{ opacity: [0.6, 0.05, 0.6], scale: [1, 1.22, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* ── Practice Locked Tooltip (Duolingo style) ─── */}
      {isPractice && isLocked && showLockedTip && (
        <motion.div
          initial={{ opacity: 0, y: 8, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0 }}
          style={{
            position: "absolute",
            bottom: "calc(100% + 10px)",
            left: "50%",
            width: 200,
            background: "#1e2535",
            border: "1.5px solid rgba(255,255,255,0.1)",
            borderRadius: 14,
            padding: "14px 14px 10px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
            zIndex: 50,
            pointerEvents: "none",
          }}
        >
          {/* Arrow caret */}
          <div style={{
            position: "absolute",
            bottom: -8,
            left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
            width: 14,
            height: 14,
            background: "#1e2535",
            borderBottom: "1.5px solid rgba(255,255,255,0.1)",
            borderRight: "1.5px solid rgba(255,255,255,0.1)",
            borderRadius: "0 0 3px 0",
          }} />
          <p style={{
            color: "#e2e8f0",
            fontFamily: '"Nunito", sans-serif',
            fontWeight: 800,
            fontSize: 15,
            marginBottom: 6,
          }}>
            Ôn lại cửa {practiceNumber}
          </p>
          <p style={{
            color: "#94a3b8",
            fontFamily: '"Nunito", sans-serif',
            fontWeight: 600,
            fontSize: 11,
            lineHeight: 1.5,
            marginBottom: 10,
          }}>
            Hãy hoàn thành tất cả các cấp độ phía trên để mở khóa!
          </p>
          <div style={{
            background: "#2d3748",
            borderRadius: 8,
            padding: "7px 0",
            textAlign: "center",
          }}>
            <span style={{
              color: "#718096",
              fontFamily: '"Nunito", sans-serif',
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: "0.12em",
            }}>KHÓA</span>
          </div>
        </motion.div>
      )}

      {/* ── 3D Bubble Node button ─────────────────────────── */}
      <motion.button
        whileHover={!isLocked ? { scale: 1.1, y: -4 } : isPractice ? {} : {}}
        whileTap={!isLocked ? { scale: 0.93, y: 5 } : {}}
        onClick={isLocked && isPractice ? () => setShowLockedTip(t => !t) : onClick}
        onMouseEnter={() => { if (isLocked && isPractice) setShowLockedTip(true); }}
        onMouseLeave={() => { if (isLocked && isPractice) setShowLockedTip(false); }}
        disabled={isLocked && !isPractice}
        className="rounded-full flex items-center justify-center relative"
        style={{
          width: size,
          height: size,
          background: nodeBg,
          border: nodeBorder,
          boxShadow: nodeShadow,
          cursor: isLocked ? "not-allowed" : "pointer",
          flexShrink: 0,
          overflow: "hidden", // Cắt bỏ các góc vuông của ảnh 3D
        }}
      >
        {/* Inner specular highlight */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size * 0.55,
            height: size * 0.28,
            top: size * 0.1,
            left: size * 0.18,
            background: "rgba(255,255,255,0.28)",
            filter: "blur(3px)",
            zIndex: 10,
          }}
        />
        {isJump ? (
          <svg
            width={size * 0.44}
            height={size * 0.44}
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ color: iconColor, zIndex: 5, position: "relative" }}
          >
            <polygon points="13 19 22 12 13 5 13 19" />
            <polygon points="2 19 11 12 2 5 2 19" />
          </svg>
        ) : isReview ? (
          /* Node ôn tập cuối chương: hiện ảnh Rương vàng */
          <img
            src="/assets/treasure_chest.png"
            alt="Treasure Chest"
            style={{
              width: "100%",
              height: "100%",
              opacity: isLocked ? 0.6 : 1,
              objectFit: "cover", // Phóng to phủ kín
              transform: "scale(1.0)",
              mixBlendMode: "multiply", // Xóa phông trắng (nếu có)
              filter: isLocked ? "grayscale(80%) drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
              position: "relative",
              zIndex: 5
            }}
          />
        ) : isPractice ? (
          /* Node Luyện tập (practice): luôn hiện ảnh sách hồng 3D, bất kể bị khóa */
          <img
            src="/assets/pink_book.png"
            alt="Practice Book"
            style={{
              width: "100%",
              height: "100%",
              opacity: isLocked ? 0.6 : 1,
              objectFit: "cover", // Phóng to phủ kín
              transform: "scale(1.2)", // Phóng to để quyển sách vừa khít hình tròn
              mixBlendMode: "multiply", // Xóa phông trắng
              filter: isLocked ? "grayscale(80%) drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
              position: "relative",
              zIndex: 5
            }}
          />
        ) : isLocked ? (
          <Lock
            style={{ width: size * 0.36, height: size * 0.36, color: iconColor, zIndex: 5, position: "relative" }}
          />
        ) : isDone ? (
          /* Node hoàn thành: Trophy vàng theo đặc tả */
          <Trophy
            style={{ width: size * 0.44, height: size * 0.44, color: iconColor, zIndex: 5, position: "relative" }}
          />
        ) : (
          <Icon
            style={{ width: size * 0.42, height: size * 0.42, color: iconColor, zIndex: 5, position: "relative" }}
          />
        )}
      </motion.button>

      {/* Labels are hidden as requested by user */}
    </motion.div>
  );
}
