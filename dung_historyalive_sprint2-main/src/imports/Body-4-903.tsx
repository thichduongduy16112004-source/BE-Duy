import svgPaths from "./svg-uc0af6jxhh";

function Heading() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 top-[-1px]" data-name="Heading 1">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Black',sans-serif] h-[38px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[30px] text-center tracking-[-0.75px] w-[324.97px]">
        <p className="leading-[37.5px]">History Alive Premium</p>
      </div>
    </div>
  );
}

function Heading1Margin() {
  return (
    <div className="absolute h-[45.5px] left-[27.66px] top-[176px] w-[324.97px]" data-name="Heading 1:margin">
      <Heading />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute right-[-7.76px] size-[22px] top-[-8px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Container">
          <path d={svgPaths.p11c2d500} fill="var(--fill-0, #FCCF03)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute bottom-[15.5px] content-stretch flex flex-col items-center left-[-16px]" data-name="Container">
      <div className="flex flex-col font-['Material_Symbols_Outlined:Thin',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#fccf03] text-[20px] text-center w-[100px]">
        <p className="leading-[28px]">colors_spark</p>
      </div>
    </div>
  );
}

function Shadow() {
  return (
    <div className="h-[85.5px] relative shrink-0 w-[96.25px]" data-name="Shadow">
      <div className="absolute inset-[0_-10.39%_-23.39%_-10.39%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 116.25 105.5">
          <g filter="url(#filter0_d_4_1938)" id="Shadow">
            <path d={svgPaths.p34ba1000} fill="var(--fill-0, #FCCF03)" id="Icon" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="105.5" id="filter0_d_4_1938" width="116.25" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="10" />
              <feGaussianBlur stdDeviation="5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.988235 0 0 0 0 0.811765 0 0 0 0 0.0117647 0 0 0 0.5 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_4_1938" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_4_1938" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="absolute bg-[rgba(252,207,3,0.3)] blur-[32px] inset-[0_0.25px_-0.5px_0] rounded-[9999px]" data-name="Overlay+Blur" />
      <Container1 />
      <Container2 />
      <Shadow />
    </div>
  );
}

function Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[130.14px] pb-[24px] top-[32px]" data-name="Margin">
      <Container />
    </div>
  );
}

function HeroSection() {
  return (
    <div className="absolute h-[273.5px] left-0 right-0 top-[88px]" data-name="Hero Section">
      <Heading1Margin />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[20px] justify-center leading-[0] left-[calc(50%-0.01px)] not-italic text-[#475569] text-[14px] text-center top-[231.5px] w-[316.88px]">
        <p className="leading-[20px]">Nâng tầm hành trình khám phá lịch sử của bạn</p>
      </div>
      <Margin />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Black',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[20px] w-full">
        <p className="leading-[28px]">Pro Plan</p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[41px] leading-[0] not-italic relative shrink-0 w-full" data-name="Paragraph">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Be_Vietnam_Pro:Black',sans-serif] h-[40px] justify-center left-0 text-[#0f172a] text-[36px] top-[20px] tracking-[-0.9px] w-[160.17px]">
        <p className="leading-[40px]">59.000đ</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[28px] justify-center left-[164.17px] text-[#64748b] text-[18px] top-[27px] w-[67.11px]">
        <p className="leading-[28px]">/ tháng</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Margin">
      <Paragraph />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#fccf03] text-[14px] w-full">
        <p className="leading-[20px]">Dùng thử MIỄN PHÍ 3 ngày</p>
      </div>
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0 w-full" data-name="Margin">
      <Container4 />
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative w-full">
        <Heading2 />
        <Margin1 />
        <Margin2 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[11px] relative shrink-0 w-[24px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 11">
        <g id="Container">
          <path d={svgPaths.p30325b40} fill="var(--fill-0, #FCCF03)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.75px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[19px] justify-center leading-[0] not-italic relative shrink-0 text-[#334155] text-[15px] w-[170.58px]">
        <p className="leading-[18.75px]">Học tập không giới hạn</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Container7 />
      <Container8 />
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[19px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 19">
        <g id="Container">
          <path d={svgPaths.p24855620} fill="var(--fill-0, #FCCF03)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.75px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[19px] justify-center leading-[0] not-italic relative shrink-0 text-[#334155] text-[15px] w-[211.05px]">
        <p className="leading-[18.75px]">Trò chuyện AI không giới hạn</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Container10 />
      <Container11 />
    </div>
  );
}

function Container13() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p19344b40} fill="var(--fill-0, #FCCF03)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.75px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[19px] justify-center leading-[0] not-italic relative shrink-0 text-[#334155] text-[15px] w-[178.55px]">
        <p className="leading-[18.75px]">Báo cáo học tập chi tiết</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Container14 />
    </div>
  );
}

function Container16() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Container">
          <path d={svgPaths.p13a8c40} fill="var(--fill-0, #FCCF03)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.75px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[19px] justify-center leading-[0] not-italic relative shrink-0 text-[#334155] text-[15px] w-[198.09px]">
        <p className="leading-[18.75px]">{`Avatar & Huy hiệu Premium`}</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Container16 />
      <Container17 />
    </div>
  );
}

function Container19() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Container">
          <path d={svgPaths.p2b80fb00} fill="var(--fill-0, #FCCF03)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.75px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[19px] justify-center leading-[0] not-italic relative shrink-0 text-[#334155] text-[15px] w-[129.8px]">
        <p className="leading-[18.75px]">Không quảng cáo</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Container19 />
      <Container20 />
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative w-full">
        <Container6 />
        <Container9 />
        <Container12 />
        <Container15 />
        <Container18 />
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute bg-[#fccf03] right-[27px] rounded-[9999px] top-[-13px]" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[16px] py-[6px] relative">
        <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" data-name="Overlay+Shadow" />
        <div className="flex flex-col font-['Be_Vietnam_Pro:Black',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[12px] tracking-[0.6px] uppercase w-[106.33px]">
          <p className="leading-[16px]">Phổ biến nhất</p>
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#fccf03] h-[56px] relative rounded-[9999px] shrink-0 w-full" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center pb-[14.5px] pt-[13.5px] relative size-full">
        <div className="absolute bg-[rgba(255,255,255,0)] h-[56px] left-0 right-0 rounded-[9999px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] top-0" data-name="Button:shadow" />
        <div className="flex flex-col font-['Be_Vietnam_Pro:Black',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[18px] text-center w-[163.5px]">
          <p className="leading-[28px]">Dùng thử miễn phí</p>
        </div>
      </div>
    </div>
  );
}

function ProPlanPlan() {
  return (
    <div className="bg-white relative rounded-[48px] shrink-0 w-full" data-name="Pro Plan (Plan 1)">
      <div aria-hidden="true" className="absolute border-3 border-[#fccf03] border-solid inset-0 pointer-events-none rounded-[48px]" />
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[35px] relative w-full">
        <div className="absolute bg-[rgba(255,255,255,0)] inset-[0_0_0.25px_0] rounded-[48px] shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]" data-name="Pro Plan (Plan 1):shadow" />
        <Container3 />
        <Container5 />
        <Background1 />
        <Button />
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[20px] w-full">
        <p className="leading-[28px]">Edu Plan</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] justify-center leading-[20px] not-italic relative shrink-0 text-[#64748b] text-[14px] w-full">
        <p className="mb-0">{`Dành cho trường học & tổ chức giáo`}</p>
        <p>dục</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative w-full">
        <Heading3 />
        <Container22 />
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[16px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 16">
        <g id="Container">
          <path d={svgPaths.p2337ef60} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[21px] justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[14px] w-[112.08px]">
        <p className="leading-[21px]">Quản lý học sinh</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Container25 />
      <Container26 />
    </div>
  );
}

function Container28() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p20793584} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[21px] justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[14px] w-[188.33px]">
        <p className="leading-[21px]">Dashboard theo dõi tiến độ</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Container28 />
      <Container29 />
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[20px] relative shrink-0 w-[21.175px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.175 20">
        <g id="Container">
          <path d={svgPaths.p3a788fdc} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[21px] justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[14px] w-[127.08px]">
        <p className="leading-[21px]">Tùy chỉnh nội dung</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Container31 />
      <Container32 />
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[18px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 18">
        <g id="Container">
          <path d={svgPaths.p20cc9b00} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[21px] justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[14px] w-[92.42px]">
        <p className="leading-[21px]">Hỗ trợ ưu tiên</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Container34 />
      <Container35 />
    </div>
  );
}

function Container23() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative w-full">
        <Container24 />
        <Container27 />
        <Container30 />
        <Container33 />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[48px] relative rounded-[9999px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#cbd5e1] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#334155] text-[16px] text-center w-[111.2px]">
          <p className="leading-[24px]">Liên hệ tư vấn</p>
        </div>
      </div>
    </div>
  );
}

function EduPlanPlan() {
  return (
    <div className="bg-[rgba(255,255,255,0.6)] relative rounded-[48px] shrink-0 w-full" data-name="Edu Plan (Plan 2)">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[48px]" />
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[33px] relative w-full">
        <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[48px] shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]" data-name="Edu Plan (Plan 2):shadow" />
        <Container21 />
        <Container23 />
        <Button1 />
      </div>
    </div>
  );
}

function PlansContainer() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] items-start left-0 pb-[32px] px-[24px] right-0 top-[361.5px]" data-name="Plans Container">
      <ProPlanPlan />
      <EduPlanPlan />
    </div>
  );
}

function Container36() {
  return (
    <div className="h-[20px] relative shrink-0 w-[11.775px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.775 20">
        <g id="Container">
          <path d={svgPaths.p225a8cc0} fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[rgba(255,255,255,0.5)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button">
      <Container36 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px min-w-px relative" data-name="Heading 2">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[23px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[18px] text-center tracking-[-0.27px] w-[193.2px]">
        <p className="leading-[22.5px]">History Alive Premium</p>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(245,245,220,0.8)] content-stretch flex items-center justify-between left-0 pl-[24px] pr-[64px] py-[24px] right-0 top-0" data-name="Header">
      <Button2 />
      <Heading1 />
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#f5f5dc] flex-[1_0_0] h-[1292px] max-w-[430px] min-h-[884px] min-w-px relative" data-name="Background">
      <HeroSection />
      <PlansContainer />
      <Header />
    </div>
  );
}

function Container37() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Container">
          <path d={svgPaths.p176f0bb4} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link() {
  return (
    <div className="relative shrink-0" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center relative">
        <Container37 />
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Container">
          <path d={svgPaths.p899bf00} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link1() {
  return (
    <div className="relative shrink-0" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center relative">
        <Container38 />
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.pda44380} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link2() {
  return (
    <div className="relative shrink-0" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center relative">
        <Container39 />
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[17.1px] relative shrink-0 w-[19.25px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.25 17.1">
        <g id="Container">
          <path d={svgPaths.p11c96900} fill="var(--fill-0, #FCCF03)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link3() {
  return (
    <div className="relative shrink-0" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center relative">
        <div className="absolute bg-[rgba(252,207,3,0.15)] left-[-12px] rounded-[9999px] size-[48px] top-[-12px]" data-name="Overlay" />
        <Container40 />
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p85bff00} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link4() {
  return (
    <div className="relative shrink-0" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center relative">
        <Container41 />
      </div>
    </div>
  );
}

function BottomNavigation() {
  return (
    <div className="absolute bg-white bottom-0 content-stretch flex gap-[47.6px] h-[70px] items-center left-0 max-w-[430px] pl-[39.78px] pr-[39.83px] pt-px right-0" data-name="Bottom Navigation">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-solid border-t inset-0 pointer-events-none" />
      <Link />
      <Link1 />
      <Link2 />
      <Link3 />
      <Link4 />
    </div>
  );
}

export default function Body() {
  return (
    <div className="bg-[#f5f5dc] content-stretch flex items-start justify-center relative size-full" data-name="Body">
      <Background />
      <div className="flex flex-col font-['Be_Vietnam_Pro:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-black text-center w-[9.7px]">
        <p className="leading-[24px]">```</p>
      </div>
      <BottomNavigation />
    </div>
  );
}