import { useNavigate } from 'react-router';
import { BottomNavigation } from './BottomNavigation';
import svgPaths from '../../imports/svg-wdeaovtbx7';

// Fire/streak icon
function FireIcon() {
  return (
    <svg width="19" height="21" viewBox="0 0 18.6667 21" fill="none">
      <path d={svgPaths.p3f215d00} fill="#F97316" />
    </svg>
  );
}

// Clock icon
function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 23.8076 23.8076" fill="none">
      <path d={svgPaths.pc961f80} fill="#0F172A" />
    </svg>
  );
}

// Lightning bolt icon
function LightningIcon() {
  return (
    <svg width="22" height="26" viewBox="0 0 22.2542 25.55" fill="none">
      <path d={svgPaths.p1b4a600} fill="#0F172A" />
    </svg>
  );
}



// Practice/swords icon (white)
function PracticeWhiteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 23.6542 23.6332" fill="none">
      <path d={svgPaths.p124bf580} fill="white" />
    </svg>
  );
}

// Grid icon
function GridIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 21.4743 21.4743" fill="none">
      <path d={svgPaths.paa180} fill="white" />
    </svg>
  );
}

// Flashcard/gear icon
function FlashcardIcon() {
  return (
    <svg width="23" height="24" viewBox="0 0 22.6122 23.7518" fill="none">
      <path d={svgPaths.p1b8ee0c0} fill="white" />
    </svg>
  );
}

// Chevron right icon
function ChevronRight({ color = '#0F172A' }: { color?: string }) {
  return (
    <svg width="9" height="14" viewBox="0 0 9.07972 14.4464" fill="none">
      <path d={svgPaths.p1a5d1dc0} fill={color} />
    </svg>
  );
}

// Star/sparkle icon for decoration
function SparkleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26.0991 26.0712" fill="none" className="opacity-50">
      <path d={svgPaths.p9ff5c0} fill="white" />
    </svg>
  );
}

// Medal/star overlay icon
function MedalIcon() {
  return (
    <svg width="29" height="40" viewBox="0 0 28.671 40.1843" fill="none">
      <g filter="url(#filter_medal)">
        <rect fill="white" fillOpacity="0.4" height="40.1843" rx="14.3355" width="28.671" />
        <path d={svgPaths.p36f67560} fill="#0F172A" />
      </g>
      <defs>
        <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="42.1843" id="filter_medal" width="28.671" x="0" y="0">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
          <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend in2="shape" mode="normal" result="effect1_innerShadow" />
        </filter>
      </defs>
    </svg>
  );
}

export default function MobilePracticeScreen() {
  const navigate = useNavigate();

  return (
    <div className="w-[393px] h-[852px] bg-[#f5f5dc] flex flex-col relative overflow-hidden">
      {/* Sticky Header */}
      <div className="backdrop-blur-[6px] bg-[rgba(245,245,220,0.8)] w-full z-[2] shrink-0">
        <div className="flex items-center justify-between px-[24px] py-[16px]">
          <h1 className="font-['Be_Vietnam_Pro',sans-serif] text-[24px] text-[#0f172a] tracking-[-0.6px]" style={{ fontWeight: 800 }}>
            Luyện Tập
          </h1>
          <div className="flex items-center gap-[8px] bg-white rounded-full px-[17px] py-[7px] border border-[rgba(251,206,3,0.2)] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <FireIcon />
            <span className="font-['Be_Vietnam_Pro',sans-serif] text-[18px] text-[#0f172a]" style={{ fontWeight: 700 }}>12</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[90px]">
        {/* Daily Challenge Card */}
        <div className="mx-[16px] mt-[8px] bg-[#fbce03] rounded-[16px] relative overflow-hidden border-b-8 border-[rgba(202,138,4,0.3)] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]">
          <div className="px-[20px] pt-[20px] pb-[28px] flex flex-col gap-[16px] relative">
            {/* Top row */}
            <div className="flex items-center gap-[12px]">
              <MedalIcon />
              <div>
                <h2 className="font-['Be_Vietnam_Pro',sans-serif] text-[20px] text-[#0f172a]" style={{ fontWeight: 800 }}>
                  Thử Thách Hàng Ngày
                </h2>
                <p className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[rgba(30,41,59,0.8)]" style={{ fontWeight: 700 }}>
                  Hoàn thành để nhận EXP x2!
                </p>
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex items-center gap-[12px]">
              {/* Timer */}
              <div className="flex items-center gap-[8px] bg-[rgba(255,255,255,0.4)] rounded-full px-[17px] py-[9px] border border-[rgba(255,255,255,0.2)] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]">
                <ClockIcon />
                <span className="font-['Be_Vietnam_Pro',sans-serif] text-[16px] text-[#0f172a]" style={{ fontWeight: 700 }}>
                  15 : 00
                </span>
              </div>

              {/* Start Button */}
              <button className="flex-1 bg-[#0f172a] rounded-full py-[12px] shadow-[0px_6px_0px_0px_rgba(0,0,0,0.15)] active:translate-y-[2px] active:shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] transition-all">
                <span className="font-['Be_Vietnam_Pro',sans-serif] text-[16px] text-white" style={{ fontWeight: 800 }}>
                  BẮT ĐẦU
                </span>
              </button>
            </div>

            {/* Decorative sparkle */}
            <div className="absolute top-[8px] right-[16px]">
              <SparkleIcon />
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="px-[20px] mt-[24px] mb-[16px]">
          <h3 className="font-['Be_Vietnam_Pro',sans-serif] text-[18px] text-[#1e293b] tracking-[0.45px] uppercase" style={{ fontWeight: 800 }}>
            Chế độ luyện tập
          </h3>
        </div>

        {/* Practice Mode Cards */}
        <div className="px-[16px] flex flex-col gap-[20px]">
          {/* Quiz Sấm Sét - Yellow */}
          <button 
            className="w-full bg-[#fbbf24] rounded-[16px] flex items-center gap-[16px] px-[16px] pt-[16px] pb-[20px] relative border-b-4 border-[#d97706] active:translate-y-[2px] active:border-b-2 transition-all text-left"
          >
            <div className="bg-[rgba(255,255,255,0.3)] rounded-full p-[12px] shrink-0 shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]">
              <LightningIcon />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-['Be_Vietnam_Pro',sans-serif] text-[18px] text-[#0f172a]" style={{ fontWeight: 800 }}>
                Quiz Sấm Sét
              </h4>
              <p className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[rgba(30,41,59,0.7)] tracking-[-0.35px] uppercase" style={{ fontWeight: 700 }}>
                Trả lời nhanh dưới áp lực
              </p>
            </div>
            <ChevronRight color="#0F172A" />
          </button>



          {/* Thách Đấu 1v1 - Red */}
          <button 
            className="w-full bg-[#da4533] rounded-[16px] flex items-center gap-[16px] px-[16px] pt-[16px] pb-[20px] relative border-b-4 border-[#7f1d1d] active:translate-y-[2px] active:border-b-2 transition-all text-left"
          >
            <div className="bg-[rgba(255,255,255,0.2)] rounded-full p-[12px] shrink-0 shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]">
              <PracticeWhiteIcon />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-['Be_Vietnam_Pro',sans-serif] text-[18px] text-white" style={{ fontWeight: 800 }}>
                Thách Đấu 1v1
              </h4>
              <p className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[rgba(255,255,255,0.7)] tracking-[-0.35px] uppercase" style={{ fontWeight: 700 }}>
                So tài cùng người chơi khác
              </p>
            </div>
            <ChevronRight color="white" />
          </button>

          {/* Giải Mã Ô Chữ - Blue */}
          <button 
            className="w-full bg-[#1e4d8c] rounded-[16px] flex items-center gap-[16px] px-[16px] pt-[16px] pb-[20px] relative border-b-4 border-[#1e3a8a] active:translate-y-[2px] active:border-b-2 transition-all text-left"
          >
            <div className="bg-[rgba(255,255,255,0.2)] rounded-full p-[12px] shrink-0 shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]">
              <GridIcon />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-['Be_Vietnam_Pro',sans-serif] text-[18px] text-white" style={{ fontWeight: 800 }}>
                Giải Mã Ô Chữ
              </h4>
              <p className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[rgba(255,255,255,0.7)] tracking-[-0.35px] uppercase" style={{ fontWeight: 700 }}>
                Tìm từ khóa lịch sử ẩn giấu
              </p>
            </div>
            <ChevronRight color="white" />
          </button>

          {/* Ghi Nhớ Flashcard - Green */}
          <button 
            className="w-full bg-[#2d7a5e] rounded-[16px] flex items-center gap-[16px] px-[16px] pt-[16px] pb-[20px] relative border-b-4 border-[#064e3b] active:translate-y-[2px] active:border-b-2 transition-all text-left"
          >
            <div className="bg-[rgba(255,255,255,0.2)] rounded-full p-[12px] shrink-0 shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]">
              <FlashcardIcon />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-['Be_Vietnam_Pro',sans-serif] text-[18px] text-white" style={{ fontWeight: 800 }}>
                Ghi Nhớ Flashcard
              </h4>
              <p className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[rgba(255,255,255,0.7)] tracking-[-0.35px] uppercase" style={{ fontWeight: 700 }}>
                Ôn tập kiến thức cốt lõi
              </p>
            </div>
            <ChevronRight color="white" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
