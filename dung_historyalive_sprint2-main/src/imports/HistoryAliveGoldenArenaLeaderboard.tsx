import svgPaths from "./svg-jvuvarj4hu";
import imgAvatarUser2nd from "figma:asset/10ac3bc0d3c7ee89a610ece143c092235cc6a75d.png";
import imgAvatarUser1st from "figma:asset/437a90b946de81c1be1f8b0ee89c30df923050ed.png";
import imgAvatarUser3rd from "figma:asset/dbad4c1fdc90f79e323720efab65de53dee256e0.png";
import imgRank4 from "figma:asset/cd46b3e60188fb680e4e80fa2ce4e9515725bab7.png";
import imgRank5 from "figma:asset/02d5d6afc60253518a2c4b2d0f9428a80995324f.png";
import imgRank6 from "figma:asset/7aa30035e3445c8ef36938d40b2a516d2cfd301d.png";
import imgYourAvatar from "figma:asset/69cd8e7d63400a683c47355ff78244859ec0e5fb.png";

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[46.92%] opacity-30 pt-px right-[46.92%] top-0" data-name="Container">
      <div className="flex flex-col font-['Material_Symbols_Outlined:Thin',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#fbce03] text-[24px] w-[24.103px]">
        <p className="leading-[24px]">emoji_events</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col items-center left-1/2 overflow-clip top-[72px] w-[80px]" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#334155] text-[12px] text-center w-[71px]">
        <p className="leading-[16px]">Minh Hoàng</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[27.78px] pb-[8px] top-[88px]" data-name="Margin">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[10px] w-[58.42px]">
        <p className="leading-[15px]">18,420 EXP</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[20px] relative shrink-0 w-[10px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 20">
        <g id="Container">
          <path d={svgPaths.p2d1edbc0} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="absolute bg-gradient-to-t content-stretch flex from-[#cbd5e1] h-[96px] items-center justify-center left-0 pt-[2px] px-[2px] right-0 rounded-tl-[48px] rounded-tr-[48px] to-[#f1f5f9] top-[111px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-[rgba(203,213,225,0.3)] border-l-2 border-r-2 border-solid border-t-2 inset-0 pointer-events-none rounded-tl-[48px] rounded-tr-[48px]" />
      <Container5 />
    </div>
  );
}

function AvatarUser2nd() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Avatar user 2nd">
      <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAvatarUser2nd} />
      </div>
    </div>
  );
}

function BackgroundBorderShadow() {
  return (
    <div className="bg-white relative rounded-[9999px] shrink-0 size-[64px]" data-name="Background+Border+Shadow">
      <div className="content-stretch flex flex-col items-start justify-center overflow-clip p-[4px] relative rounded-[inherit] size-full">
        <AvatarUser2nd />
      </div>
      <div aria-hidden="true" className="absolute border-4 border-[#cbd5e1] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="absolute bg-[#94a3b8] bottom-[-4px] content-stretch flex items-center justify-center p-[2px] right-[-4px] rounded-[9999px] size-[24px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white w-[6.64px]">
        <p className="leading-[15px]">2</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <BackgroundBorderShadow />
      <BackgroundBorder1 />
    </div>
  );
}

function Margin1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[25px] pb-[8px] top-0" data-name="Margin">
      <Container6 />
    </div>
  );
}

function Container3() {
  return (
    <div className="flex-[1_0_0] h-[207px] min-h-px min-w-px relative" data-name="Container">
      <Container4 />
      <Margin />
      <BackgroundBorder />
      <Margin1 />
    </div>
  );
}

function Container8() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col items-center left-1/2 overflow-clip top-[104px] w-[96px]" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] text-center w-[69.11px]">
        <p className="leading-[20px]">Anh Quân</p>
      </div>
    </div>
  );
}

function AvatarUser1st() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Avatar user 1st">
      <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAvatarUser1st} />
      </div>
    </div>
  );
}

function BackgroundBorderShadow1() {
  return (
    <div className="bg-white relative rounded-[9999px] shrink-0 size-[96px]" data-name="Background+Border+Shadow">
      <div className="content-stretch flex flex-col items-start justify-center overflow-clip p-[4px] relative rounded-[inherit] size-full">
        <AvatarUser1st />
      </div>
      <div aria-hidden="true" className="absolute border-4 border-[#fbce03] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" />
    </div>
  );
}

function Shadow() {
  return (
    <div className="h-[21px] relative shrink-0 w-[16px]" data-name="Shadow">
      <div className="absolute inset-[0_-18.75%_-33.33%_-18.75%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 28">
          <g filter="url(#filter0_dd_4_1805)" id="Shadow">
            <path d={svgPaths.p181acd80} fill="var(--fill-0, #FBCE03)" id="Icon" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28" id="filter0_dd_4_1805" width="22" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="1.5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_4_1805" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="2" />
              <feGaussianBlur stdDeviation="1" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
              <feBlend in2="effect1_dropShadow_4_1805" mode="normal" result="effect2_dropShadow_4_1805" />
              <feBlend in="SourceGraphic" in2="effect2_dropShadow_4_1805" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[37.49%] right-[37.49%] top-[-32px]" data-name="Container">
      <Shadow />
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div className="absolute bg-[#fbce03] bottom-[-8px] content-stretch flex items-center justify-center p-[2px] right-[-4px] rounded-[9999px] size-[32px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] bottom-0 right-0 rounded-[9999px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] size-[32px]" data-name="Overlay+Shadow" />
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] text-center w-[6.25px]">
        <p className="leading-[20px]">1</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <BackgroundBorderShadow1 />
      <Container10 />
      <BackgroundBorder2 />
    </div>
  );
}

function Margin3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[9px] pb-[8px] top-0" data-name="Margin">
      <Container9 />
    </div>
  );
}

function Shadow1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05)] shrink-0" data-name="Shadow">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#fbce03] text-[12px] w-[71.34px]">
        <p className="leading-[16px]">24,150 EXP</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[21.33px] pb-[8px] top-[124px]" data-name="Margin">
      <Shadow1 />
    </div>
  );
}

function Margin5() {
  return (
    <div className="h-[24px] relative shrink-0 w-[20px]" data-name="Margin">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 24">
        <g id="Margin">
          <path d={svgPaths.p42e11c0} fill="var(--fill-0, #0F172A)" fillOpacity="0.4" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder3() {
  return (
    <div className="absolute bg-gradient-to-t content-stretch flex flex-col from-[#fbce03] h-[144px] items-center left-0 pt-[18px] px-[2px] right-0 rounded-tl-[16px] rounded-tr-[16px] to-[#fff1a3] top-[148px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-[rgba(251,206,3,0.4)] border-l-2 border-r-2 border-solid border-t-2 inset-0 pointer-events-none rounded-tl-[16px] rounded-tr-[16px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] h-[144px] left-0 right-0 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] top-0" data-name="Overlay+Shadow" />
      <Margin5 />
      <div className="bg-[rgba(255,255,255,0.4)] h-[6px] rounded-[9999px] shrink-0 w-[48px]" data-name="Overlay" />
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute h-[292px] left-0 right-0 top-[-32px]" data-name="Container">
      <Container8 />
      <Margin3 />
      <Margin4 />
      <BackgroundBorder3 />
    </div>
  );
}

function Margin2() {
  return (
    <div className="flex-[1_0_0] h-[260px] min-h-px min-w-px relative" data-name="Margin">
      <Container7 />
    </div>
  );
}

function Container12() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col items-center left-1/2 overflow-clip top-[72px] w-[80px]" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#334155] text-[12px] text-center w-[58.25px]">
        <p className="leading-[16px]">Thuỳ Linh</p>
      </div>
    </div>
  );
}

function Margin6() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[27.78px] pb-[8px] top-[88px]" data-name="Margin">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[10px] w-[58.44px]">
        <p className="leading-[15px]">15,200 EXP</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[20px] relative shrink-0 w-[10px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 20">
        <g id="Container">
          <path d={svgPaths.p2d1edbc0} fill="var(--fill-0, #CD7F32)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder4() {
  return (
    <div className="absolute bg-gradient-to-t content-stretch flex from-[rgba(205,127,50,0.4)] h-[80px] items-center justify-center left-0 pt-[2px] px-[2px] right-0 rounded-tl-[48px] rounded-tr-[48px] to-[rgba(205,127,50,0.1)] top-[111px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-[rgba(205,127,50,0.2)] border-l-2 border-r-2 border-solid border-t-2 inset-0 pointer-events-none rounded-tl-[48px] rounded-tr-[48px]" />
      <Container13 />
    </div>
  );
}

function AvatarUser3rd() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Avatar user 3rd">
      <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAvatarUser3rd} />
      </div>
    </div>
  );
}

function BackgroundBorderShadow2() {
  return (
    <div className="bg-white relative rounded-[9999px] shrink-0 size-[64px]" data-name="Background+Border+Shadow">
      <div className="content-stretch flex flex-col items-start justify-center overflow-clip p-[4px] relative rounded-[inherit] size-full">
        <AvatarUser3rd />
      </div>
      <div aria-hidden="true" className="absolute border-4 border-[#cd7f32] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function BackgroundBorder5() {
  return (
    <div className="absolute bg-[#cd7f32] bottom-[-4px] content-stretch flex items-center justify-center p-[2px] right-[-4px] rounded-[9999px] size-[24px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white w-[6.81px]">
        <p className="leading-[15px]">3</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <BackgroundBorderShadow2 />
      <BackgroundBorder5 />
    </div>
  );
}

function Margin7() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[25px] pb-[8px] top-0" data-name="Margin">
      <Container14 />
    </div>
  );
}

function Container11() {
  return (
    <div className="flex-[1_0_0] h-[191px] min-h-px min-w-px relative" data-name="Container">
      <Container12 />
      <Margin6 />
      <BackgroundBorder4 />
      <Margin7 />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex gap-[8px] items-end justify-center relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <Margin2 />
      <Container11 />
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0 w-full z-[2]" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pb-[48px] pt-[80px] px-[16px] relative w-full">
          <Container1 />
          <Container2 />
        </div>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="relative shrink-0 w-[24px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative w-full">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[16px] text-center w-[11.58px]">
          <p className="leading-[24px]">4</p>
        </div>
      </div>
    </div>
  );
}

function Rank() {
  return (
    <div className="max-w-[358px] pointer-events-none relative rounded-[9999px] shrink-0 size-[40px]" data-name="Rank 4">
      <div aria-hidden="true" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 rounded-[9999px]">
        <div className="absolute bg-[#f1f5f9] bg-clip-padding border-0 border-[transparent] border-solid inset-0 rounded-[9999px]" />
        <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden rounded-[9999px]">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgRank4} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#f8fafc] border-solid inset-0 rounded-[9999px]" />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1e293b] text-[14px] w-full">
        <p className="leading-[20px]">Quốc Huy</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Semi_Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[10px] tracking-[0.5px] uppercase w-full">
        <p className="leading-[15px]">Người khai phá</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container18 />
        <Container19 />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#334155] text-[14px] w-[49.97px]">
          <p className="leading-[20px]">12,980</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundHorizontalBorderShadow() {
  return (
    <div className="bg-white relative rounded-[16px] shrink-0 w-full" data-name="Background+HorizontalBorder+Shadow">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.05)] border-b-4 border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center pb-[16px] pt-[12px] px-[12px] relative w-full">
          <Container16 />
          <Rank />
          <Container17 />
          <Container20 />
        </div>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="relative shrink-0 w-[24px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative w-full">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[16px] text-center w-[11.03px]">
          <p className="leading-[24px]">5</p>
        </div>
      </div>
    </div>
  );
}

function Rank1() {
  return (
    <div className="max-w-[358px] pointer-events-none relative rounded-[9999px] shrink-0 size-[40px]" data-name="Rank 5">
      <div aria-hidden="true" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 rounded-[9999px]">
        <div className="absolute bg-[#f1f5f9] bg-clip-padding border-0 border-[transparent] border-solid inset-0 rounded-[9999px]" />
        <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden rounded-[9999px]">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgRank5} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#f8fafc] border-solid inset-0 rounded-[9999px]" />
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1e293b] text-[14px] w-full">
        <p className="leading-[20px]">Ngọc Mai</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Semi_Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[10px] tracking-[0.5px] uppercase w-full">
        <p className="leading-[15px]">Người giữ lửa</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container23 />
        <Container24 />
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#334155] text-[14px] w-[47.23px]">
          <p className="leading-[20px]">11,450</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundHorizontalBorderShadow1() {
  return (
    <div className="bg-white relative rounded-[16px] shrink-0 w-full" data-name="Background+HorizontalBorder+Shadow">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.05)] border-b-4 border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center pb-[16px] pt-[12px] px-[12px] relative w-full">
          <Container21 />
          <Rank1 />
          <Container22 />
          <Container25 />
        </div>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="relative shrink-0 w-[24px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative w-full">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[16px] text-center w-[11.3px]">
          <p className="leading-[24px]">6</p>
        </div>
      </div>
    </div>
  );
}

function Rank2() {
  return (
    <div className="max-w-[358px] pointer-events-none relative rounded-[9999px] shrink-0 size-[40px]" data-name="Rank 6">
      <div aria-hidden="true" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 rounded-[9999px]">
        <div className="absolute bg-[#f1f5f9] bg-clip-padding border-0 border-[transparent] border-solid inset-0 rounded-[9999px]" />
        <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden rounded-[9999px]">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgRank6} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#f8fafc] border-solid inset-0 rounded-[9999px]" />
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1e293b] text-[14px] w-full">
        <p className="leading-[20px]">Văn Thanh</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Semi_Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[10px] tracking-[0.5px] uppercase w-full">
        <p className="leading-[15px]">Học giả</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container28 />
        <Container29 />
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#334155] text-[14px] w-[50.55px]">
          <p className="leading-[20px]">10,800</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundHorizontalBorderShadow2() {
  return (
    <div className="bg-white relative rounded-[16px] shrink-0 w-full" data-name="Background+HorizontalBorder+Shadow">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.05)] border-b-4 border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center pb-[16px] pt-[12px] px-[12px] relative w-full">
          <Container26 />
          <Rank2 />
          <Container27 />
          <Container30 />
        </div>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="relative shrink-0 w-full z-[1]" data-name="Container">
      <div className="content-stretch flex flex-col gap-[16px] items-start px-[16px] relative w-full">
        <BackgroundHorizontalBorderShadow />
        <BackgroundHorizontalBorderShadow1 />
        <BackgroundHorizontalBorderShadow2 />
      </div>
    </div>
  );
}

function Main() {
  return (
    <div className="absolute content-stretch flex flex-col isolate items-start left-0 pb-[176px] right-0 top-[97px]" data-name="Main">
      <Container />
      <Container15 />
    </div>
  );
}

function Container31() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p300a1100} fill="var(--fill-0, #334155)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white relative rounded-[48px] shrink-0 size-[40px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[48px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-full">
        <Container31 />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Heading 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative w-full">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#1e293b] text-[20px] text-center tracking-[-0.5px] w-[218.78px]">
          <p className="leading-[28px]">Đấu trường Hạng Vàng</p>
        </div>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[20px] relative shrink-0 w-[18px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
        <g id="Container">
          <path d={svgPaths.p2b729200} fill="var(--fill-0, #334155)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white relative rounded-[48px] shrink-0 size-[40px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[48px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-full">
        <Container32 />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(245,245,220,0.9)] content-stretch flex items-center justify-between left-0 pb-[17px] pt-[16px] px-[16px] right-0 top-[24px]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[rgba(251,206,3,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <Button />
      <Heading />
      <Button1 />
    </div>
  );
}

function Container34() {
  return (
    <div className="relative shrink-0 w-[32px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative w-full">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] text-center w-[22.22px]">
          <p className="leading-[24px]">42</p>
        </div>
      </div>
    </div>
  );
}

function YourAvatar() {
  return (
    <div className="pointer-events-none relative rounded-[9999px] shrink-0 size-[48px]" data-name="Your avatar">
      <div aria-hidden="true" className="absolute inset-0 rounded-[9999px]">
        <div className="absolute bg-white inset-0 rounded-[9999px]" />
        <div className="absolute inset-0 overflow-hidden rounded-[9999px]">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgYourAvatar} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Container35() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <YourAvatar />
        <div className="absolute bg-[#ef4444] right-[-4px] rounded-[9999px] size-[16px] top-[-4px]" data-name="Background+Border">
          <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
        </div>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] w-full">
        <p className="leading-[20px]">Bạn (Tên của bạn)</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(15,23,42,0.6)] uppercase w-full">
        <p className="leading-[15px]">Cần 450 EXP để tăng hạng</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container37 />
        <Container38 />
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] text-right w-[44.11px]">
        <p className="leading-[20px]">4,520</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(15,23,42,0.6)] text-right uppercase w-[20.91px]">
        <p className="leading-[15px]">EXP</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="relative shrink-0 w-[44.11px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container40 />
        <Container41 />
      </div>
    </div>
  );
}

function BackgroundHorizontalBorder() {
  return (
    <div className="bg-[#fbce03] relative rounded-[16px] shrink-0 w-full" data-name="Background+HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.15)] border-b-4 border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center pb-[20px] pt-[16px] px-[16px] relative w-full">
          <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[16px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]" data-name="Overlay+Shadow" />
          <Container34 />
          <Container35 />
          <Container36 />
          <Container39 />
        </div>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="absolute bottom-[86px] content-stretch flex flex-col items-start left-0 px-[16px] right-0" data-name="Container">
      <BackgroundHorizontalBorder />
    </div>
  );
}

function Container42() {
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

function Link() {
  return (
    <div className="relative shrink-0 size-[44px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container42 />
      </div>
    </div>
  );
}

function Container43() {
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

function Link1() {
  return (
    <div className="relative shrink-0 size-[44px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container43 />
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="relative shrink-0 size-[21px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 21">
        <g id="Container">
          <path d={svgPaths.p28642500} fill="var(--fill-0, #FBCE03)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link2() {
  return (
    <div className="relative shrink-0 size-[44px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container44 />
        <div className="absolute bg-[rgba(251,206,3,0.15)] inset-0 rounded-[9999px]" data-name="Overlay" />
      </div>
    </div>
  );
}

function Container45() {
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

function Link3() {
  return (
    <div className="relative shrink-0 size-[44px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container45 />
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="relative shrink-0 size-[18.667px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.6667 18.6667">
        <g id="Container">
          <path d={svgPaths.p9ca9b80} fill="var(--fill-0, #9E9E9E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link4() {
  return (
    <div className="relative shrink-0 size-[44px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container46 />
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="absolute bg-white bottom-0 content-stretch flex gap-[27.6px] h-[70px] items-center left-0 pl-[29.8px] pr-[29.83px] pt-px right-0" data-name="Nav">
      <div aria-hidden="true" className="absolute border-[#e0e0e0] border-solid border-t inset-0 pointer-events-none shadow-[0px_-2px_10px_0px_rgba(0,0,0,0.05)]" />
      <Link />
      <Link1 />
      <Link2 />
      <Link3 />
      <Link4 />
    </div>
  );
}

export default function HistoryAliveGoldenArenaLeaderboard() {
  return (
    <div className="bg-[#f5f5dc] relative size-full" data-name="History Alive Golden Arena Leaderboard">
      <Main />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Be_Vietnam_Pro:Regular',sans-serif] h-[24px] justify-center leading-[0] left-0 not-italic text-[#0f172a] text-[16px] top-[909px] w-[9.7px]">
        <p className="leading-[24px]">```</p>
      </div>
      <Header />
      <Container33 />
      <Nav />
    </div>
  );
}