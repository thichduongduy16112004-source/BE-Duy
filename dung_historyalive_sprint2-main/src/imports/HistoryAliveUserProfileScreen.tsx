import svgPaths from "./svg-a6mu8sjwht";
import imgImage from "figma:asset/b32d1c52916914adadf06f7eebd01134eb363e16.png";

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 1">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[20px] tracking-[-0.5px] w-[56.61px]">
        <p className="leading-[28px]">Hồ Sơ</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[20px] relative shrink-0 w-[20.1px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.1 20">
        <g id="Container">
          <path d={svgPaths.p3cdadd00} fill="var(--fill-0, #334155)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center p-[2px] relative rounded-[16px] shrink-0 size-[48px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)]" />
      <Container2 />
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[24px] relative w-full">
          <Heading />
          <Button />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start justify-center p-[10px] relative rounded-[9999px] shrink-0 size-[128px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-6 border-[#fbce03] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] left-0 rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[128px] top-0" data-name="Overlay+Shadow" />
      <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[9999px] w-full" data-name="Image">
        <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden pointer-events-none rounded-[9999px]">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgImage} />
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 z-[2]" data-name="Container">
      <div className="absolute bg-[#fbce03] blur-[6px] inset-0 opacity-30 rounded-[9999px]" data-name="Background+Blur" />
      <BackgroundBorder />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[24px] text-center w-[155.48px]">
        <p className="leading-[32px]">NguyenVanA</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[14px] text-center w-[217.54px]">
        <p>
          <span className="leading-[20px]">{`Tham gia từ: 2023 • `}</span>
          <span className="font-['Be_Vietnam_Pro:Bold',sans-serif] leading-[20px] not-italic text-[#fbce03]">Hạng Vàng</span>
        </p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[217.54px]" data-name="Container">
      <Container6 />
      <Container7 />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[16px] relative shrink-0 z-[1]" data-name="Margin">
      <Container5 />
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col isolate items-center px-[24px] py-[16px] relative w-full">
          <Container4 />
          <Margin />
        </div>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[19px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 19">
        <g id="Container">
          <path d={svgPaths.p38fbbc00} fill="var(--fill-0, #EA580C)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#ffedd5] relative rounded-[48px] shrink-0 size-[40px]" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container9 />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[12px] tracking-[0.6px] uppercase w-full">
        <p className="leading-[16px]">Streak</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[18px] w-full">
        <p className="leading-[28px]">15 ngày</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container11 />
        <Container12 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[8px] items-start left-[24px] p-[18px] right-[203px] rounded-[16px] top-[24px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)]" />
      <Background />
      <Container10 />
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[19px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 19">
        <g id="Container">
          <path d={svgPaths.p1f93f980} fill="var(--fill-0, #FBCE03)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(251,206,3,0.2)] relative rounded-[48px] shrink-0 size-[40px]" data-name="Overlay">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container13 />
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[12px] tracking-[0.6px] uppercase w-full">
        <p className="leading-[16px]">Tổng EXP</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[18px] w-full">
        <p className="leading-[28px]">2,450</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container15 />
        <Container16 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow1() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[8px] items-start left-[203px] p-[18px] right-[24px] rounded-[16px] top-[24px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)]" />
      <Overlay />
      <Container14 />
    </div>
  );
}

function Container17() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.pda44380} fill="var(--fill-0, #CA8A04)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#fef9c3] relative rounded-[48px] shrink-0 size-[40px]" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container17 />
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[12px] tracking-[0.6px] uppercase w-full">
        <p className="leading-[16px]">Giải đấu</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[18px] w-full">
        <p className="leading-[28px]">Vàng</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container19 />
        <Container20 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow2() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[8px] items-start left-[24px] pb-[46px] pt-[18px] px-[18px] right-[203px] rounded-[16px] top-[168px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)]" />
      <Background1 />
      <Container18 />
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[20px] relative shrink-0 w-[10px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 20">
        <g id="Container">
          <path d={svgPaths.p2d1edbc0} fill="var(--fill-0, #2563EB)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#dbeafe] relative rounded-[48px] shrink-0 size-[40px]" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container21 />
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[12px] tracking-[0.6px] uppercase w-full">
        <p className="leading-[16px]">Thành tích</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[28px] not-italic relative shrink-0 text-[#0f172a] text-[18px] w-full">
        <p className="mb-0">12 huân</p>
        <p>chương</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container23 />
        <Container24 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow3() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[8px] items-start left-[203px] p-[18px] right-[24px] rounded-[16px] top-[168px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)]" />
      <Background2 />
      <Container22 />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[348px] relative shrink-0 w-full" data-name="Container">
      <BackgroundBorderShadow />
      <BackgroundBorderShadow1 />
      <BackgroundBorderShadow2 />
      <BackgroundBorderShadow3 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[14px] tracking-[1.4px] uppercase w-full">
        <p className="leading-[20px]">Cài đặt tài khoản</p>
      </div>
    </div>
  );
}

function Heading3Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[4px] relative shrink-0 w-full" data-name="Heading 3:margin">
      <Heading1 />
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[17px] relative shrink-0 w-[19px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 17">
        <g id="Container">
          <path d={svgPaths.p1449c200} fill="var(--fill-0, #475569)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] w-[125.67px]">
        <p className="leading-[24px]">Chỉnh sửa hồ sơ</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative">
        <Container27 />
        <Container28 />
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #CBD5E1)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link() {
  return (
    <div className="bg-white relative rounded-[48px] shrink-0 w-full" data-name="Link">
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[48px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[18px] relative w-full">
          <Container26 />
          <Container29 />
        </div>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[21px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 21">
        <g id="Container">
          <path d={svgPaths.p12930f00} fill="var(--fill-0, #475569)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] w-[106.45px]">
        <p className="leading-[24px]">Đổi mật khẩu</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative">
        <Container31 />
        <Container32 />
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #CBD5E1)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link1() {
  return (
    <div className="bg-white relative rounded-[48px] shrink-0 w-full" data-name="Link">
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[48px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[18px] relative w-full">
          <Container30 />
          <Container33 />
        </div>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 20">
        <g id="Container">
          <path d={svgPaths.p164b49c0} fill="var(--fill-0, #475569)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] w-[156px]">
        <p className="leading-[24px]">Cài đặt thông báo</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative">
        <Container35 />
        <Container36 />
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #CBD5E1)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link2() {
  return (
    <div className="bg-white relative rounded-[48px] shrink-0 w-full" data-name="Link">
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[48px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[18px] relative w-full">
          <Container34 />
          <Container37 />
        </div>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Container">
          <path d={svgPaths.p237be000} fill="var(--fill-0, #475569)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] w-[75.63px]">
        <p className="leading-[24px]">Ngôn ngữ</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative">
        <Container39 />
        <Container40 />
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[14px] w-[69.67px]">
        <p className="leading-[20px]">Tiếng Việt</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #CBD5E1)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container41() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative">
        <Container42 />
        <Container43 />
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="bg-white relative rounded-[48px] shrink-0 w-full" data-name="Link">
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[48px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[18px] relative w-full">
          <Container38 />
          <Container41 />
        </div>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p3e9df400} fill="var(--fill-0, #EF4444)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#ef4444] text-[16px] w-[83.61px]">
        <p className="leading-[24px]">Đăng xuất</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative">
        <Container45 />
        <Container46 />
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="bg-white relative rounded-[48px] shrink-0 w-full" data-name="Link">
      <div aria-hidden="true" className="absolute border-2 border-[#fee2e2] border-solid inset-0 pointer-events-none rounded-[48px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[18px] relative w-full">
          <Container44 />
        </div>
      </div>
    </div>
  );
}

function LinkMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Link:margin">
      <Link4 />
    </div>
  );
}

function Container25() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[12px] items-start px-[24px] relative w-full">
        <Heading3Margin />
        <Link />
        <Link1 />
        <Link2 />
        <Link3 />
        <LinkMargin />
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[32px] relative shrink-0 w-full" data-name="Margin">
      <Container25 />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[448px] min-h-[1166px] overflow-clip pb-[70px] relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Container3 />
      <Container8 />
      <Margin1 />
    </div>
  );
}

function Container47() {
  return (
    <div className="relative shrink-0 size-[23.333px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.3333 23.3333">
        <g id="Container">
          <path d={svgPaths.p170aa000} fill="var(--fill-0, #9E9E9E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link5() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative w-full">
        <Container47 />
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="relative shrink-0 size-[23.333px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.3333 23.3333">
        <g id="Container">
          <path d={svgPaths.p229b4e80} fill="var(--fill-0, #9E9E9E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link6() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative w-full">
        <Container48 />
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="relative shrink-0 size-[21px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 21">
        <g id="Container">
          <path d={svgPaths.p172e1c00} fill="var(--fill-0, #9E9E9E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link7() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative w-full">
        <Container49 />
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="h-[21px] relative shrink-0 w-[23.333px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.3333 21">
        <g id="Container">
          <path d={svgPaths.p1fa7d800} fill="var(--fill-0, #9E9E9E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link8() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative w-full">
        <Container50 />
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="relative shrink-0 size-[18.667px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.6667 18.6667">
        <g id="Container">
          <path d={svgPaths.p169ff80} fill="var(--fill-0, #FBCE03)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(251,206,3,0.15)] content-stretch flex items-center justify-center relative rounded-[22px] shrink-0 size-[44px]" data-name="Overlay">
      <Container51 />
    </div>
  );
}

function Link9() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative w-full">
        <Overlay1 />
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="absolute bg-white bottom-0 content-stretch flex h-[70px] items-center justify-center left-0 max-w-[448px] pt-px right-0" data-name="Nav">
      <div aria-hidden="true" className="absolute border-[#e0e0e0] border-solid border-t inset-0 pointer-events-none shadow-[0px_-2px_10px_0px_rgba(0,0,0,0.05)]" />
      <Link5 />
      <Link6 />
      <Link7 />
      <Link8 />
      <Link9 />
    </div>
  );
}

export default function HistoryAliveUserProfileScreen() {
  return (
    <div className="bg-[#f5f5dc] content-stretch flex flex-col items-start relative size-full" data-name="History Alive User Profile Screen">
      <Container />
      <Nav />
    </div>
  );
}