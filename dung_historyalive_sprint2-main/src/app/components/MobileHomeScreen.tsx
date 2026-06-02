import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import svgPaths from '../../imports/svg-jzp2ono1ln';
import imgOverlayBackground from "figma:asset/ed8dec42c3c91dab7980c0b04f52ef152586cb11.png";
import imgNguynTraiScholar from "figma:asset/0eb6b50312ce796d871fbb9c02184424751ba66c.png";
import { BottomNavigation } from './BottomNavigation';
import { apiService } from '../services/apiService';

// Safe localStorage wrapper
function safeGetItem(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSetItem(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}
function safeRemoveItem(key: string): void {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

export default function MobileHomeScreen() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<any[]>([]);
  const [recoverySeconds, setRecoverySeconds] = useState<number>(9000);

  // Load persisted state and fetch dynamic lessons
  useEffect(() => {
    apiService.getLessons()
      .then(res => {
        if (res && res.lessons && res.lessons.length > 0) {
          setLessons(res.lessons);
        } else {
          // Default seeded lessons fallback
          setLessons([
            { id: "lesson_1", title: "Lý Thường Kiệt", description: "Lý Thường Kiệt đại chiến Ung Châu Thành", video_url: "https://www.youtube.com/embed/AbRg5rH6fxo", order: 1 },
            { id: "lesson_2", title: "Lý Thường Kiệt - P2", description: "Lý Thường Kiệt đại chiến – Phần 2", video_url: "https://www.youtube.com/embed/TQehUlbyp3o", order: 2 }
          ]);
        }
      })
      .catch(err => {
        console.error("Error loading lessons:", err);
        setLessons([
          { id: "lesson_1", title: "Lý Thường Kiệt", description: "Lý Thường Kiệt đại chiến Ung Châu Thành", video_url: "https://www.youtube.com/embed/AbRg5rH6fxo", order: 1 },
          { id: "lesson_2", title: "Lý Thường Kiệt - P2", description: "Lý Thường Kiệt đại chiến – Phần 2", video_url: "https://www.youtube.com/embed/TQehUlbyp3o", order: 2 }
        ]);
      });

    const saved = safeGetItem('recovery_end_time');
    if (saved) {
      const remaining = Math.max(0, Math.floor((parseInt(saved) - Date.now()) / 1000));
      setRecoverySeconds(remaining > 0 ? remaining : 9000);
    } else {
      const endTime = Date.now() + 9000 * 1000;
      safeSetItem('recovery_end_time', String(endTime));
      setRecoverySeconds(9000);
    }
  }, []);

  const isLessonCompleted = (lessonId: string) => {
    return safeGetItem(`lesson_completed_${lessonId}`) === 'true';
  };

  const isLessonUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevLesson = lessons[index - 1];
    return isLessonCompleted(prevLesson.id);
  };

  // The chat and practice are unlocked if all lessons are completed
  const allLessonsCompleted = lessons.length > 0 && lessons.every(l => isLessonCompleted(l.id));

  // Countdown timer
  useEffect(() => {
    if (recoverySeconds <= 0) return undefined;
    const interval = setInterval(() => {
      setRecoverySeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          safeRemoveItem('recovery_end_time');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [recoverySeconds <= 0 ? 'stopped' : 'running']);

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="w-[393px] h-[852px] bg-[#f5f5dc] flex flex-col relative overflow-hidden">

      {/* ── Background texture ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <img
          alt=""
          className="absolute h-full left-[-117.4%] max-w-none top-0 w-[334.79%]"
          src={imgOverlayBackground}
        />
      </div>
      <div className="absolute inset-0 bg-[rgba(245,245,220,0.85)] pointer-events-none" />

      {/* ── Header ── */}
      <div className="backdrop-blur-[6px] bg-[rgba(245,245,220,0.9)] border-b border-[rgba(0,0,0,0.05)] px-[16px] pt-[48px] pb-[17px] relative z-[3] shrink-0">
        <div className="flex items-center justify-between">
          {/* Title */}
          <div className="relative shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05)]">
            <span
              className="font-['Be_Vietnam_Pro',sans-serif] text-[20px] text-[#0f172a] tracking-[-0.5px]"
              style={{ fontWeight: 800, lineHeight: '28px' }}
            >
              History Alive
            </span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-[8px]">
            {/* Fire + streak */}
            <div className="bg-[rgba(255,255,255,0.6)] border border-[rgba(249,115,22,0.2)] rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-[13px] py-[5px] flex items-center gap-[6px]">
              <svg className="w-[12px] h-[14.25px]" fill="none" viewBox="0 0 12 14.25">
                <path d={svgPaths.p3edca500} fill="#F97316" />
              </svg>
              <span className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[#1e293b]" style={{ fontWeight: 700 }}>12</span>
            </div>
            {/* EXP */}
            <div className="bg-[rgba(255,255,255,0.6)] border border-[rgba(251,206,3,0.4)] rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] h-[30px] px-[13px] py-[5px] flex items-center">
              <span className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-black" style={{ fontWeight: 700 }}>450 exp</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="backdrop-blur-[2px] bg-[rgba(245,245,220,0.8)] border-b border-[rgba(0,0,0,0.05)] px-[16px] py-[12px] relative z-[2] shrink-0">
        <div className="bg-[rgba(255,255,255,0.9)] border-2 border-[rgba(251,206,3,0.3)] rounded-[16px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] p-[14px] flex items-center justify-between relative">
          {/* Inset shadow */}
          <div className="absolute inset-0 rounded-[16px] shadow-[inset_0px_-4px_0px_2px_rgba(0,0,0,0.1)] pointer-events-none" />

          {/* Hearts */}
          <div className="flex items-center gap-[4px]">
            {[0, 1, 2].map((i) => (
              <svg key={i} className="w-[16.667px] h-[15.292px]" fill="none" viewBox="0 0 16.6667 15.2917">
                <path d={svgPaths.p28063980} fill="#EF4444" />
              </svg>
            ))}
            {[3, 4].map((i) => (
              <svg key={i} className="w-[16.667px] h-[15.292px]" fill="none" viewBox="0 0 16.6667 15.2917">
                <path d={svgPaths.p28063980} fill="#D1D5DB" />
              </svg>
            ))}
            <span
              className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[#1e293b] pl-[8px]"
              style={{ fontWeight: 800 }}
            >3/5</span>
          </div>

          {/* Recovery time + plus button */}
          <div className="flex items-center gap-[8px]">
            <div>
              <span
                className="font-['Be_Vietnam_Pro',sans-serif] text-[11px] text-[#64748b] tracking-[-0.55px] uppercase"
                style={{ fontWeight: 700 }}
              >
                {'Hồi phục: '}
              </span>
              <span
                className="font-['Be_Vietnam_Pro',sans-serif] text-[11px] text-[#1e293b] uppercase"
                style={{ fontWeight: 700 }}
              >
                {formatTime(recoverySeconds)}
              </span>
            </div>
            {/* + button → Premium */}
            <button
              onClick={() => navigate('/premium')}
              className="bg-gradient-to-b from-[#fbce03] to-[#d4ae00] border-b-2 border-[#a38600] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-[28px] h-[28px] flex items-center justify-center active:scale-95 transition-transform"
            >
              <svg className="w-[11.775px] h-[11.775px]" fill="none" viewBox="0 0 11.775 11.775">
                <path d={svgPaths.p309b4900} fill="white" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Timeline (scrollable) ── */}
      <div className="flex-1 overflow-y-auto relative z-[1] pb-[70px]">
        <div
          className="relative flex flex-col items-center min-h-[1100px] pt-0 pb-[78px]"
        >
          {/* Dashed path SVG */}
          <div className="absolute left-0 top-0 w-[388px] h-[1100px] pointer-events-none">
            <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 388 1100">
              <path
                d={svgPaths.p28f94b00}
                stroke="#FBCE03"
                strokeDasharray="16.56 12.42"
                strokeLinecap="round"
                strokeWidth="10.35"
              />
            </svg>
          </div>

          {/* ── Dynamic Lessons Checkpoints ── */}
          {lessons.map((lesson, index) => {
            const isCompleted = isLessonCompleted(lesson.id);
            const isUnlocked = isLessonUnlocked(index);
            const isEven = index % 2 === 0;

            if (isEven) {
              return (
                <div key={lesson.id} className="relative flex flex-col items-center pb-[128px] z-[1] pt-0">
                  <div className="pt-[12px]">
                    <div className="bg-[rgba(255,255,255,0.8)] border border-[rgba(251,206,3,0.3)] rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-[17px] py-[7px]">
                      <span className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[#1e293b]" style={{ fontWeight: 800, lineHeight: '20px' }}>
                        {lesson.title}
                      </span>
                    </div>
                  </div>

                  <div className="relative mt-2">
                    <button
                      onClick={() => {
                        if (isUnlocked) navigate(`/video-lesson/${lesson.id}`);
                        else alert('Hãy hoàn thành bài học trước đó!');
                      }}
                      disabled={!isUnlocked}
                      className={`border-4 border-white rounded-full shadow-[0px_0px_20px_0px_rgba(251,206,3,0.5)] w-[96px] h-[96px] flex items-center justify-center transition-all active:scale-95 ${
                        isCompleted ? 'bg-green-500' : isUnlocked ? 'bg-[#fbce03]' : 'bg-gray-400 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-[40px] h-[40px]" fill="none" viewBox="0 0 40 40">
                          <path d={svgPaths.p186be1a0} fill={isUnlocked ? 'white' : '#64748B'} />
                        </svg>
                      )}
                    </button>

                    {isUnlocked && !isCompleted && (
                      <div className="absolute top-[-4px] right-[-4px] bg-[#dc2626] border-2 border-white rounded-full shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] w-[32px] h-[32px] flex items-center justify-center">
                        <svg className="w-[15px] h-[14.25px]" fill="none" viewBox="0 0 15 14.25">
                          <path d={svgPaths.p1755bb80} fill="white" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            } else {
              return (
                <div key={lesson.id} className="relative shrink-0 w-full pb-[128px] z-[1]">
                  <div className="flex flex-row items-center justify-end w-full">
                    <div className="flex items-center justify-end px-[48px] w-full">
                      <div className="flex items-center gap-[16px]">
                        <div className={`backdrop-blur-[2px] bg-[rgba(255,255,255,0.6)] border border-white rounded-[8px] px-[13px] py-[5px] ${!isUnlocked ? 'opacity-50' : ''}`}>
                          <span className="font-['Be_Vietnam_Pro',sans-serif] text-[16px] text-[#0f172a] tracking-[0.8px] uppercase" style={{ fontWeight: 400, lineHeight: '24px' }}>
                            {lesson.title}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (isUnlocked) navigate(`/video-lesson/${lesson.id}`);
                            else alert('Hãy hoàn thành bài học trước đó!');
                          }}
                          disabled={!isUnlocked}
                          className={`border-4 border-white rounded-full shadow-[0px_0px_20px_0px_rgba(251,206,3,0.5)] w-[96px] h-[96px] flex items-center justify-center transition-all active:scale-95 ${
                            isCompleted ? 'bg-green-500' : isUnlocked ? 'bg-[#fbce03]' : 'bg-gray-400 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {isCompleted ? (
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-[40px] h-[40px]" fill="none" viewBox="0 0 40 40">
                              <path d={svgPaths.p186be1a0} fill={isUnlocked ? 'white' : '#64748B'} />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}

          {/* ── Checkpoint 3: Nhân vật Nguyễn Trãi + Ôn Tập ── */}
          <div className="relative shrink-0 w-full pb-[128px] z-[1]">
            <div className="flex flex-row items-center w-full">
              <div className="flex items-center px-[48px] w-full">
                <div className="h-[130px] relative shrink-0 w-[113px]">
                  <div className="absolute bg-white h-[104px] left-[-4.4px] rounded-full top-[41px] w-[104.4px]">
                    <div className="flex flex-col items-start justify-center overflow-hidden p-[4px] relative rounded-full size-full">
                      <div className="flex items-center justify-center relative size-[96.8px]">
                        <div className="scale-[1.1] w-[88px] h-[88px] rounded-full overflow-hidden">
                          <img
                            alt="Nguyễn Trãi"
                            className="absolute left-[-5%] max-w-none w-[110%] h-[110%] top-[-5%] object-cover"
                            src={imgNguynTraiScholar}
                          />
                        </div>
                      </div>
                    </div>
                    <div aria-hidden="true" className="absolute border-4 border-[#fbce03] border-solid inset-0 pointer-events-none rounded-full shadow-[0px_4px_20px_0px_rgba(0,0,0,0.15)]" />
                  </div>

                  <button
                    onClick={() => navigate('/ai-chat')}
                    className="absolute left-0 top-0 bg-white border border-[#f1f5f9] rounded-[16px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] px-[17px] py-[9px] active:bg-gray-50 transition-colors"
                  >
                    <span className="font-['Be_Vietnam_Pro',sans-serif] text-[12px] text-[#1e293b] whitespace-nowrap" style={{ fontWeight: 800, lineHeight: '15px' }}>Chạm để hỏi ta!</span>
                    <div className="absolute bottom-[-7px] left-[25px] w-[8px] h-[8px]">
                      <div aria-hidden="true" className="absolute border-r-[8px] border-t-[8px] border-solid border-white inset-0 pointer-events-none" />
                    </div>
                  </button>
                </div>

                <div className="flex items-center gap-[16px] ml-[16px]">
                  <div className={`bg-[rgba(255,255,255,0.8)] border border-[rgba(0,0,0,0.05)] rounded-full px-[17px] py-[7px] ${!allLessonsCompleted ? 'opacity-50' : ''}`}>
                    <span className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[#334155]" style={{ fontWeight: 700, lineHeight: '20px' }}>Ôn Tập</span>
                  </div>

                  <button
                    onClick={() => {
                      if (allLessonsCompleted) navigate('/practice');
                      else alert('Hãy hoàn thành tất cả các bài học trước!');
                    }}
                    disabled={!allLessonsCompleted}
                    className={`border-4 border-white rounded-full w-[80px] h-[80px] flex items-center justify-center transition-all active:scale-95 ${
                      allLessonsCompleted
                        ? 'bg-[#fbce03] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]'
                        : 'bg-gray-400 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-[33px] h-[24px]" fill="none" viewBox="0 0 33 24">
                      <path d={svgPaths.p556ff00} fill="white" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Checkpoint 4: Nổi Dậy (locked) ── */}
          <div className="relative shrink-0 w-full pb-[128px] z-[1]">
            <div className="flex flex-row items-center justify-end w-full">
              <div className="flex items-center justify-end px-[64px] w-full">
                <div className="flex items-center gap-[16px]">
                  <button disabled className="bg-[#607d8b] border-4 border-white rounded-full shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] w-[80px] h-[80px] flex items-center justify-center cursor-not-allowed opacity-70">
                    <svg className="w-[22.5px] h-[25.5px]" fill="none" viewBox="0 0 22.5 25.5">
                      <path d={svgPaths.p390ea880} fill="white" />
                    </svg>
                  </button>
                  <div className="bg-[rgba(255,255,255,0.8)] border border-[rgba(0,0,0,0.05)] rounded-full px-[17px] py-[7px] opacity-70">
                    <span className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[#334155]" style={{ fontWeight: 700, lineHeight: '20px' }}>Nổi Dậy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Checkpoint 5: Thời Hoàng Kim (locked) ── */}
          <div className="relative flex flex-col items-center pb-[20px] z-[1]">
            <div className="bg-[#cbd5e1] border-4 border-white rounded-full w-[80px] h-[80px] flex items-center justify-center shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)] opacity-70">
              <svg className="w-[24px] h-[31.5px]" fill="none" viewBox="0 0 24 31.5">
                <path d={svgPaths.p415fb40} fill="#64748B" />
              </svg>
            </div>
            <div className="pt-[12px]">
              <span className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[#64748b]" style={{ fontWeight: 700, lineHeight: '20px' }}>Thời Hoàng Kim</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Navigation ── */}
      <BottomNavigation />
    </div>
  );
}