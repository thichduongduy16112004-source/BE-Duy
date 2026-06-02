import { useNavigate, useLocation } from 'react-router';
import svgPaths from '../../imports/svg-8zy15rbqri';
import imgImage from "figma:asset/b4cb56767bb2ee81d2c81da79517b67fe2ec5a88.png";

interface WrongAnswerState {
  lessonTitle: string;
  question: string;
  wrongAnswer: string;
  correctAnswer: string;
  explanation: string;
  returnTo: string;
  checkpoint: number;
  totalCheckpoints: number;
}

const FALLBACK: WrongAnswerState = {
  lessonTitle: 'Lý Thường Kiệt',
  question: 'Ai là người chỉ huy quân Đại Việt trong trận Ung Châu?',
  wrongAnswer: 'B. Lý Thánh Tông',
  correctAnswer: 'A. Lý Thường Kiệt',
  explanation: 'Lý Thường Kiệt là danh tướng thời Lý, người đã chỉ huy cuộc tấn công phủ đầu vào châu Ung và châu Khâm của nhà Tống năm 1077.',
  returnTo: '/video-lesson',
  checkpoint: 1,
  totalCheckpoints: 3,
};

export default function WrongAnswerScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state: WrongAnswerState = (location.state as WrongAnswerState) || FALLBACK;

  const handleReturnToLesson = () => {
    navigate(state.returnTo, { state: { checkpoint: state.checkpoint } });
  };

  // Dynamic progress bar segments
  const completedPercent = ((state.checkpoint - 1) / state.totalCheckpoints) * 100;
  const rewatchPercent = (1 / state.totalCheckpoints) * 100;
  const remainingPercent = 100 - completedPercent - rewatchPercent;

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#f5f5dc]">
      <div className="w-[393px] h-[852px] bg-[#f5f5dc] flex flex-col relative overflow-hidden">

        {/* ── Background image with warm light overlay ── */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
            <img
              alt=""
              className="absolute h-full left-[-65.64%] max-w-none top-0 w-[231.28%] object-cover opacity-20"
              src={imgImage}
            />
          </div>
          {/* Warm beige vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(245,245,220,0.6)] via-[rgba(245,245,220,0.3)] to-[rgba(245,245,220,0.7)]" />
        </div>

        {/* ── Header — matches app style ── */}
        <div className="relative shrink-0 z-10 backdrop-blur-[6px] bg-[rgba(245,245,220,0.92)] border-b border-[rgba(0,0,0,0.07)] flex items-center justify-between px-[16px] pt-[16px] pb-[17px]">
          <button
            onClick={handleReturnToLesson}
            className="relative rounded-full shrink-0 w-[40px] h-[40px] flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 16 16">
              <path d={svgPaths.p300a1100} fill="#0F172A" />
            </svg>
          </button>

          <div className="flex-1 flex flex-col items-center">
            <span
              className="font-['Plus_Jakarta_Sans',sans-serif] text-[18px] text-[#0f172a] tracking-[-0.45px] text-center"
              style={{ fontWeight: 700 }}
            >
              {state.lessonTitle}
            </span>
          </div>

          {/* Spacer to balance the back button */}
          <div className="w-[40px] h-[40px]" />
        </div>

        {/* ── Scrollable main content ── */}
        <div className="flex-1 relative z-10 flex flex-col items-center justify-center px-[16px] overflow-y-auto pb-[8px]">

          {/* Feedback Card */}
          <div className="relative bg-white w-full rounded-[32px] shadow-[0px_20px_40px_-8px_rgba(0,0,0,0.15)]">
            {/* Red top border */}
            <div className="absolute inset-0 rounded-[32px] border-t-[8px] border-[#ef4444] pointer-events-none z-10" />

            <div className="flex flex-col pt-[8px] rounded-[32px] overflow-hidden w-full">
              <div className="flex flex-col gap-[14px] items-center px-[20px] pt-[20px] pb-[22px] w-full">

                {/* Status icon + title */}
                <div className="flex flex-col gap-[8px] items-center w-full">
                  <div className="bg-[rgba(239,68,68,0.1)] rounded-full w-[64px] h-[64px] flex items-center justify-center relative">
                    <div
                      aria-hidden="true"
                      className="absolute border-4 border-[rgba(239,68,68,0.2)] inset-0 rounded-full pointer-events-none"
                    />
                    <svg className="w-[23.4px] h-[23.4px]" fill="none" viewBox="0 0 23.4 23.4">
                      <path d={svgPaths.pc0fef00} fill="#EF4444" />
                    </svg>
                  </div>
                  <h1
                    className="font-['Be_Vietnam_Pro',sans-serif] text-[30px] text-[#ef4444] tracking-[-0.75px]"
                    style={{ fontWeight: 800 }}
                  >
                    Sai rồi!
                  </h1>
                </div>

                {/* Lesson & Checkpoint badges */}
                <div className="flex items-center gap-[8px] flex-wrap justify-center">
                  <div className="bg-[rgba(252,207,3,0.15)] rounded-full px-[12px] py-[4px] border border-[rgba(252,207,3,0.35)]">
                    <span
                      className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] text-[#0f172a] tracking-[0.5px]"
                      style={{ fontWeight: 600 }}
                    >
                      {state.lessonTitle}
                    </span>
                  </div>
                  <div className="bg-[rgba(239,68,68,0.08)] rounded-full px-[12px] py-[4px] border border-[rgba(239,68,68,0.2)]">
                    <span
                      className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] text-[#ef4444] tracking-[0.5px]"
                      style={{ fontWeight: 600 }}
                    >
                      Checkpoint {state.checkpoint}/{state.totalCheckpoints}
                    </span>
                  </div>
                </div>

                {/* Question */}
                <div className="flex flex-col gap-[4px] w-full items-center">
                  <span
                    className="font-['Plus_Jakarta_Sans',sans-serif] text-[12px] text-[#64748b] tracking-[0.7px] uppercase text-center"
                    style={{ fontWeight: 600 }}
                  >
                    Câu hỏi
                  </span>
                  <p
                    className="font-['Plus_Jakarta_Sans',sans-serif] text-[16px] text-[#0f172a] text-center"
                    style={{ fontWeight: 700, lineHeight: '1.45' }}
                  >
                    {state.question}
                  </p>
                </div>

                {/* Answer options */}
                <div className="flex flex-col gap-[10px] w-full">
                  {/* Wrong answer (user choice) */}
                  <div className="relative bg-[rgba(239,68,68,0.05)] rounded-[20px] w-full">
                    <div
                      aria-hidden="true"
                      className="absolute border-2 border-[#ef4444] inset-0 pointer-events-none rounded-[20px]"
                    />
                    <div className="flex items-center justify-between px-[16px] py-[14px]">
                      <div className="flex flex-col gap-[2px] flex-1 min-w-0 pr-[8px]">
                        <span
                          className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] text-[#ef4444] tracking-[0.5px] uppercase"
                          style={{ fontWeight: 600 }}
                        >
                          Bạn chọn
                        </span>
                        <span
                          className="font-['Plus_Jakarta_Sans',sans-serif] text-[15px] text-[#ef4444]"
                          style={{ fontWeight: 700 }}
                        >
                          {state.wrongAnswer}
                        </span>
                      </div>
                      <svg className="w-[21.7px] h-[21.7px] shrink-0" fill="none" viewBox="0 0 21.7 21.7">
                        <path d={svgPaths.p1f83a580} fill="#EF4444" />
                      </svg>
                    </div>
                  </div>

                  {/* Hint — không lộ đáp án */}
                  <div className="relative bg-[rgba(252,207,3,0.07)] rounded-[20px] w-full">
                    <div
                      aria-hidden="true"
                      className="absolute border-2 border-[rgba(252,207,3,0.4)] border-dashed inset-0 pointer-events-none rounded-[20px]"
                    />
                    <div className="flex items-start gap-[12px] px-[16px] py-[14px]">
                      {/* Bulb icon */}
                      <div className="bg-[rgba(252,207,3,0.2)] rounded-full w-[36px] h-[36px] flex items-center justify-center shrink-0 mt-[1px]">
                        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24">
                          <path
                            d="M12 2a7 7 0 0 1 5.292 11.563c-.9 1.05-1.292 2.1-1.292 3.187V18a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-1.25c0-1.087-.393-2.137-1.292-3.187A7 7 0 0 1 12 2zm3 18H9v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1z"
                            fill="#c4a302"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col gap-[4px] flex-1 min-w-0">
                        <span
                          className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] text-[#92720a] tracking-[0.5px] uppercase"
                          style={{ fontWeight: 700 }}
                        >
                          Gợi ý
                        </span>
                        <p
                          className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] text-[#4a3b00]"
                          style={{ fontWeight: 500, lineHeight: '1.55' }}
                        >
                          {state.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rewatch nudge */}
                <div className="w-full bg-[rgba(15,23,42,0.04)] rounded-[16px] px-[16px] py-[12px] flex items-center gap-[10px]">
                  <svg className="w-[16px] h-[16px] shrink-0 text-[#64748b]" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M12 20.5A8.5 8.5 0 1 1 20.5 12H18l3 3 3-3h-2.5A10 10 0 1 0 12 22v-1.5z"
                      fill="#64748b"
                    />
                  </svg>
                  <p
                    className="font-['Plus_Jakarta_Sans',sans-serif] text-[12px] text-[#64748b]"
                    style={{ fontWeight: 500, lineHeight: '1.5' }}
                  >
                    Xem lại video để tìm câu trả lời đúng nhé!
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* CTA section */}
          <div className="flex flex-col items-center gap-[12px] w-full pt-[18px]">
            {/* Warning banner */}
            <div className="relative backdrop-blur-[2px] bg-[rgba(249,115,22,0.92)] rounded-full flex items-center gap-[8px] px-[16px] py-[9px] shadow-[0px_8px_15px_-3px_rgba(249,115,22,0.35)]">
              <svg className="w-[16.5px] h-[14.25px] shrink-0" fill="none" viewBox="0 0 16.5 14.25">
                <path d={svgPaths.p10d9fd00} fill="white" />
              </svg>
              <span
                className="font-['Plus_Jakarta_Sans',sans-serif] text-[13px] text-white"
                style={{ fontWeight: 700 }}
              >
                Xem lại video CP{state.checkpoint} để tiếp tục!
              </span>
            </div>

            {/* CTA button */}
            <button
              onClick={handleReturnToLesson}
              className="w-full h-[60px] bg-[#fccf03] rounded-full flex items-center justify-center gap-[12px] shadow-[0px_8px_0px_0px_#d4ac00] active:translate-y-[3px] active:shadow-[0px_5px_0px_0px_#d4ac00] transition-all duration-100"
            >
              <span
                className="font-['Plus_Jakarta_Sans',sans-serif] text-[18px] text-[#231f0f] tracking-[1px] uppercase"
                style={{ fontWeight: 800 }}
              >
                Xem lại &amp; Học tiếp
              </span>
              <svg className="w-[11px] h-[14px]" fill="none" viewBox="0 0 11 14">
                <path d={svgPaths.p30eba500} fill="#231F0F" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Footer — locked progress bar ── */}
        <div className="relative shrink-0 z-10 bg-gradient-to-t from-[#f5f5dc] via-[rgba(245,245,220,0.95)] to-transparent px-[24px] pt-[16px] pb-[36px]">
          <div className="flex flex-col gap-[8px] w-full">

            {/* Info row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[5px]">
                <svg className="w-[10.325px] h-[13.08px] shrink-0" fill="none" viewBox="0 0 10.325 13.0813">
                  <path d={svgPaths.p355dd580} fill="#EF4444" />
                </svg>
                <span
                  className="font-['Plus_Jakarta_Sans',sans-serif] text-[10px] text-[#ef4444] tracking-[0.8px] uppercase"
                  style={{ fontWeight: 700, lineHeight: '15px' }}
                >
                  Thanh tua bị khóa — Hãy xem lại đoạn này
                </span>
              </div>
              <span
                className="font-['Plus_Jakarta_Sans',sans-serif] text-[10px] text-[#64748b]"
                style={{ fontWeight: 700, lineHeight: '15px' }}
              >
                CP{state.checkpoint} / {state.totalCheckpoints}
              </span>
            </div>

            {/* Progress track */}
            <div className="w-full h-[12px] bg-[rgba(0,0,0,0.1)] rounded-full overflow-hidden relative">
              {/* Completed (green) */}
              {completedPercent > 0 && (
                <div
                  className="absolute inset-y-0 left-0 bg-[#22c55e] rounded-l-full"
                  style={{ width: `${completedPercent}%` }}
                />
              )}
              {/* Current failed checkpoint (red + shimmer) */}
              <div
                className="absolute inset-y-0 bg-[#ef4444]"
                style={{ left: `${completedPercent}%`, width: `${rewatchPercent}%` }}
              >
                <div className="absolute inset-0 bg-[rgba(255,255,255,0.2)]" />
              </div>
              {/* Remaining (light gray) */}
              {remainingPercent > 0 && (
                <div
                  className="absolute inset-y-0 bg-[rgba(0,0,0,0.05)] rounded-r-full"
                  style={{ left: `${completedPercent + rewatchPercent}%`, right: 0 }}
                />
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}