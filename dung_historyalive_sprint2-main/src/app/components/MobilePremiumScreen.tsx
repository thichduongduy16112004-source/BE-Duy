import { useNavigate } from 'react-router';
import svgPaths from '../../imports/svg-4dy26xwv06';
import { BottomNavigation } from './BottomNavigation';

export default function MobilePremiumScreen() {
  const navigate = useNavigate();

  return (
    <div className="w-[393px] h-[852px] bg-[#f5f5dc] flex flex-col relative overflow-hidden">

      {/* ── Header (backdrop-blur, matches Figma: pl-24px pr-64px py-24px) ── */}
      <div
        className="relative shrink-0 z-20 backdrop-blur-[6px] bg-[rgba(245,245,220,0.8)] flex items-center justify-between pl-[24px] pr-[64px] pt-[52px] pb-[24px]"
      >
        <button
          onClick={() => navigate(-1)}
          className="bg-[rgba(255,255,255,0.5)] rounded-full w-[40px] h-[40px] flex items-center justify-center shrink-0 active:scale-95 transition-transform"
        >
          <svg className="w-[11.775px] h-[20px]" fill="none" viewBox="0 0 11.775 20">
            <path d={svgPaths.p225a8cc0} fill="#0F172A" />
          </svg>
        </button>

        <div className="flex-1 flex items-center justify-center">
          <span
            className="font-['Be_Vietnam_Pro',sans-serif] text-[18px] text-[#0f172a] text-center tracking-[-0.27px]"
            style={{ fontWeight: 700 }}
          >
            History Alive Premium
          </span>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto pb-[70px]">

        {/* Hero Section */}
        <div className="relative flex flex-col items-center pt-[32px] pb-[16px] px-[24px]">

          {/* Diamond gem with glow */}
          <div className="relative flex items-center justify-center mb-[24px]">
            {/* Glow behind gem */}
            <div
              className="absolute rounded-full"
              style={{
                background: 'rgba(252,207,3,0.3)',
                filter: 'blur(32px)',
                width: 96,
                height: 86,
              }}
            />

            {/* Sparkle top-right */}
            <div className="absolute" style={{ right: -8, top: -8 }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
                <path d={svgPaths.p11c2d500} fill="#FCCF03" />
              </svg>
            </div>

            {/* Sparkle bottom-left (smaller) */}
            <div className="absolute" style={{ left: -14, bottom: -4 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 22 22">
                <path d={svgPaths.p11c2d500} fill="#FCCF03" opacity="0.6" />
              </svg>
            </div>

            {/* Diamond SVG with drop-shadow filter */}
            <div className="relative" style={{ width: 96.25, height: 85.5 }}>
              <svg
                width="116.25"
                height="105.5"
                viewBox="0 0 116.25 105.5"
                fill="none"
                style={{ display: 'block', marginLeft: -10, marginTop: -10 }}
              >
                <defs>
                  <filter
                    id="gem_drop"
                    x="0"
                    y="0"
                    width="116.25"
                    height="105.5"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="10" />
                    <feGaussianBlur stdDeviation="5" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0.988235 0 0 0 0 0.811765 0 0 0 0 0.0117647 0 0 0 0.5 0"
                    />
                    <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow" />
                    <feBlend in="SourceGraphic" in2="effect1_dropShadow" mode="normal" result="shape" />
                  </filter>
                </defs>
                <g filter="url(#gem_drop)">
                  <path d={svgPaths.p34ba1000} fill="#FCCF03" />
                </g>
              </svg>
            </div>
          </div>

          {/* Heading */}
          <p
            className="font-['Be_Vietnam_Pro',sans-serif] text-[30px] text-[#0f172a] text-center tracking-[-0.75px] mb-[8px]"
            style={{ fontWeight: 900, lineHeight: '37.5px' }}
          >
            History Alive Premium
          </p>

          {/* Subtitle */}
          <p
            className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[#475569] text-center"
            style={{ fontWeight: 500, lineHeight: '20px' }}
          >
            Nâng tầm hành trình khám phá lịch sử của bạn
          </p>
        </div>

        {/* Plans Container */}
        <div className="flex flex-col gap-[24px] px-[24px] pb-[32px]">

          {/* ── Pro Plan ── */}
          <div className="relative bg-white rounded-[48px] w-full">
            {/* Shadow */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[48px] pointer-events-none"
              style={{ boxShadow: '0px 10px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)' }}
            />
            {/* Yellow border */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[48px] pointer-events-none"
              style={{ border: '3px solid #fccf03' }}
            />

            {/* "PHỔ BIẾN NHẤT" badge */}
            <div
              className="absolute bg-[#fccf03] rounded-full px-[16px] py-[6px]"
              style={{
                right: 27,
                top: -13,
                boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
              }}
            >
              <span
                className="font-['Be_Vietnam_Pro',sans-serif] text-[12px] text-[#0f172a] tracking-[0.6px] uppercase"
                style={{ fontWeight: 900 }}
              >
                Phổ biến nhất
              </span>
            </div>

            <div className="flex flex-col gap-[24px] p-[35px]">
              {/* Plan info */}
              <div className="flex flex-col gap-0">
                <span
                  className="font-['Be_Vietnam_Pro',sans-serif] text-[20px] text-[#0f172a]"
                  style={{ fontWeight: 900, lineHeight: '28px' }}
                >
                  Pro Plan
                </span>

                {/* Price */}
                <div className="flex items-baseline gap-[4px] pt-[8px]">
                  <span
                    className="font-['Be_Vietnam_Pro',sans-serif] text-[36px] text-[#0f172a] tracking-[-0.9px]"
                    style={{ fontWeight: 900, lineHeight: '40px' }}
                  >
                    59.000đ
                  </span>
                  <span
                    className="font-['Be_Vietnam_Pro',sans-serif] text-[18px] text-[#64748b]"
                    style={{ fontWeight: 700, lineHeight: '28px' }}
                  >
                    / tháng
                  </span>
                </div>

                {/* Free trial */}
                <span
                  className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[#fccf03] pt-[4px]"
                  style={{ fontWeight: 700, lineHeight: '20px' }}
                >
                  Dùng thử MIỄN PHÍ 3 ngày
                </span>
              </div>

              {/* Features */}
              <div className="flex flex-col gap-[16px]">
                <div className="flex items-center gap-[12px]">
                  <svg className="shrink-0 w-[24px] h-[11px]" fill="none" viewBox="0 0 24 11">
                    <path d={svgPaths.p30325b40} fill="#FCCF03" />
                  </svg>
                  <span className="font-['Be_Vietnam_Pro',sans-serif] text-[15px] text-[#334155]" style={{ fontWeight: 500 }}>
                    Học tập không giới hạn
                  </span>
                </div>
                <div className="flex items-center gap-[12px]">
                  <svg className="shrink-0 w-[22px] h-[19px]" fill="none" viewBox="0 0 22 19">
                    <path d={svgPaths.p24855620} fill="#FCCF03" />
                  </svg>
                  <span className="font-['Be_Vietnam_Pro',sans-serif] text-[15px] text-[#334155]" style={{ fontWeight: 500 }}>
                    Trò chuyện AI không giới hạn
                  </span>
                </div>
                <div className="flex items-center gap-[12px]">
                  <svg className="shrink-0 w-[16px] h-[16px]" fill="none" viewBox="0 0 16 16">
                    <path d={svgPaths.p19344b40} fill="#FCCF03" />
                  </svg>
                  <span className="font-['Be_Vietnam_Pro',sans-serif] text-[15px] text-[#334155]" style={{ fontWeight: 500 }}>
                    Báo cáo học tập chi tiết
                  </span>
                </div>
                <div className="flex items-center gap-[12px]">
                  <svg className="shrink-0 w-[20px] h-[20px]" fill="none" viewBox="0 0 20 20">
                    <path d={svgPaths.p13a8c40} fill="#FCCF03" />
                  </svg>
                  <span className="font-['Be_Vietnam_Pro',sans-serif] text-[15px] text-[#334155]" style={{ fontWeight: 500 }}>
                    Avatar &amp; Huy hiệu Premium
                  </span>
                </div>
                <div className="flex items-center gap-[12px]">
                  <svg className="shrink-0 w-[20px] h-[20px]" fill="none" viewBox="0 0 20 20">
                    <path d={svgPaths.p2b80fb00} fill="#FCCF03" />
                  </svg>
                  <span className="font-['Be_Vietnam_Pro',sans-serif] text-[15px] text-[#334155]" style={{ fontWeight: 500 }}>
                    Không quảng cáo
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                className="relative w-full h-[56px] bg-[#fccf03] rounded-full flex items-center justify-center active:scale-[0.98] transition-transform"
                style={{ boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)' }}
              >
                <span
                  className="font-['Be_Vietnam_Pro',sans-serif] text-[18px] text-[#0f172a] text-center"
                  style={{ fontWeight: 900, lineHeight: '28px' }}
                >
                  Dùng thử miễn phí
                </span>
              </button>
            </div>
          </div>

          {/* ── Edu Plan ── */}
          <div className="relative bg-[rgba(255,255,255,0.6)] rounded-[48px] w-full">
            {/* Shadow */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[48px] pointer-events-none"
              style={{ boxShadow: '0px 10px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)' }}
            />
            {/* Gray border */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[48px] pointer-events-none"
              style={{ border: '1px solid #e2e8f0' }}
            />

            <div className="flex flex-col gap-[24px] p-[33px]">
              {/* Plan info */}
              <div className="flex flex-col gap-[4px]">
                <span
                  className="font-['Be_Vietnam_Pro',sans-serif] text-[20px] text-[#0f172a]"
                  style={{ fontWeight: 700, lineHeight: '28px' }}
                >
                  Edu Plan
                </span>
                <p
                  className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[#64748b]"
                  style={{ fontWeight: 500, lineHeight: '20px' }}
                >
                  Dành cho trường học &amp; tổ chức giáo dục
                </p>
              </div>

              {/* Features */}
              <div className="flex flex-col gap-[16px]">
                <div className="flex items-center gap-[12px]">
                  <svg className="shrink-0 w-[20px] h-[16px]" fill="none" viewBox="0 0 20 16">
                    <path d={svgPaths.p2337ef60} fill="#94A3B8" />
                  </svg>
                  <span className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[#475569]" style={{ fontWeight: 500, lineHeight: '21px' }}>
                    Quản lý học sinh
                  </span>
                </div>
                <div className="flex items-center gap-[12px]">
                  <svg className="shrink-0 w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
                    <path d={svgPaths.p20793584} fill="#94A3B8" />
                  </svg>
                  <span className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[#475569]" style={{ fontWeight: 500, lineHeight: '21px' }}>
                    Dashboard theo dõi tiến độ
                  </span>
                </div>
                <div className="flex items-center gap-[12px]">
                  <svg className="shrink-0 w-[21.175px] h-[20px]" fill="none" viewBox="0 0 21.175 20">
                    <path d={svgPaths.p3a788fdc} fill="#94A3B8" />
                  </svg>
                  <span className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[#475569]" style={{ fontWeight: 500, lineHeight: '21px' }}>
                    Tùy chỉnh nội dung
                  </span>
                </div>
                <div className="flex items-center gap-[12px]">
                  <svg className="shrink-0 w-[20px] h-[18px]" fill="none" viewBox="0 0 20 18">
                    <path d={svgPaths.p20cc9b00} fill="#94A3B8" />
                  </svg>
                  <span className="font-['Be_Vietnam_Pro',sans-serif] text-[14px] text-[#475569]" style={{ fontWeight: 500, lineHeight: '21px' }}>
                    Hỗ trợ ưu tiên
                  </span>
                </div>
              </div>

              {/* Outline Button */}
              <button
                className="relative w-full h-[48px] bg-transparent rounded-full flex items-center justify-center active:bg-[rgba(0,0,0,0.02)] transition-colors"
                style={{ border: '2px solid #cbd5e1' }}
              >
                <span
                  className="font-['Be_Vietnam_Pro',sans-serif] text-[16px] text-[#334155] text-center"
                  style={{ fontWeight: 700, lineHeight: '24px' }}
                >
                  Liên hệ tư vấn
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Navigation ── */}
      <BottomNavigation />
    </div>
  );
}
