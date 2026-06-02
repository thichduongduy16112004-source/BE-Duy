import svgPaths from "./svg-mvoqk0x97n";
import imgImage from "figma:asset/2f4bfbfe413b5b655cfd3987dd125a58e6f3b3f9.png";

function Container2() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Container">
          <path d={svgPaths.p15494480} fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(255,255,255,0.5)] content-stretch flex items-center justify-center relative rounded-[32px] shrink-0 size-[40px]" data-name="Button">
      <Container2 />
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-[#e2e8f0] h-[16px] relative rounded-[9999px] shrink-0 w-full" data-name="Background+Border">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute bg-[#fbce03] inset-[2px_34.31%_2px_0.94%] rounded-[9999px]" data-name="Background+Shadow">
          <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-4px_0px_0px_rgba(0,0,0,0.1)]" />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[rgba(203,213,225,0.5)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
    </div>
  );
}

function Container3() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[16px] relative w-full">
        <BackgroundBorder />
      </div>
    </div>
  );
}

function Container4() {
  return <div className="h-[15px] shrink-0 w-[12px]" data-name="Container" />;
}

function Container1() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Button />
      <Container3 />
      <Container4 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[0.75px] relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[75px] justify-center leading-[37.5px] not-italic relative shrink-0 text-[#0f172a] text-[30px] text-center tracking-[-0.75px] w-[292.54px]">
        <p className="mb-0">Bạn muốn khám phá</p>
        <p>lịch sử nào?</p>
      </div>
    </div>
  );
}

function HeaderProgress() {
  return (
    <div className="relative shrink-0 w-full" data-name="Header & Progress">
      <div className="content-stretch flex flex-col gap-[23.25px] items-start pb-[16px] pt-[32px] px-[24px] relative w-full">
        <Container1 />
        <Heading />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[50px] relative shrink-0 w-[40px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 50">
        <g id="Container">
          <path d={svgPaths.p1e777a40} fill="var(--fill-0, #008751)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(251,206,3,0.2)] relative rounded-[32px] shrink-0 size-[96px]" data-name="Overlay">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip relative rounded-[inherit] size-full">
        <Container5 />
        <div className="absolute inset-0 opacity-10" data-name="Gradient" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 96 96\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(6.7882 0 0 6.7882 48 48)\\'><stop stop-color=\\'rgba(0,135,81,1)\\' offset=\\'0.070711\\'/><stop stop-color=\\'rgba(0,135,81,0)\\' offset=\\'0.070711\\'/></radialGradient></defs></svg>')" }} />
        <div className="absolute bg-[rgba(218,37,29,0.2)] blur-[12px] bottom-[-8px] right-[-8px] rounded-[9999px] size-[48px]" data-name="Overlay+Blur" />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] justify-center leading-[25px] not-italic relative shrink-0 text-[#0f172a] text-[20px] w-full">
        <p className="mb-0">Lịch sử Việt</p>
        <p>Nam</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Regular',sans-serif] justify-center leading-[20px] not-italic relative shrink-0 text-[#64748b] text-[14px] w-full">
        <p className="mb-0">Hào khí ngàn năm văn</p>
        <p>hiến</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#fbce03] content-stretch flex items-center px-[12px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[12px] w-[58.47px]">
        <p className="leading-[16px]">ĐÃ CHỌN</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative w-full">
        <Heading1 />
        <Container7 />
        <Background />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[7.963px] relative shrink-0 w-[10.442px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.4417 7.9625">
        <g id="Container">
          <path d={svgPaths.p90c9340} fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="absolute bg-[#fbce03] right-[-8px] rounded-[9999px] size-[32px] top-[-8px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-4 border-[#f5f5dc] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[4px] relative size-full">
        <Container8 />
      </div>
    </div>
  );
}

function ButtonSelectedCardVietnam() {
  return (
    <div className="bg-white relative rounded-[32px] shrink-0 w-full" data-name="Button - Selected Card: Vietnam">
      <div aria-hidden="true" className="absolute border-4 border-[#fbce03] border-solid inset-0 pointer-events-none rounded-[32px] shadow-[0px_0px_15px_0px_rgba(251,206,3,0.4),0px_8px_0px_0px_#d9af02]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[24px] items-center p-[28px] relative w-full">
          <Overlay />
          <Container6 />
          <BackgroundBorder1 />
        </div>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0 size-[50px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
        <g id="Container">
          <path d={svgPaths.p8fc9100} fill="var(--fill-0, #1E40AF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#f1f5f9] relative rounded-[32px] shrink-0 size-[96px]" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip relative rounded-[inherit] size-full">
        <Container9 />
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[20px] w-full">
        <p className="leading-[25px]">Lịch sử Thế Giới</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Regular',sans-serif] justify-center leading-[20px] not-italic relative shrink-0 text-[#64748b] text-[14px] w-full">
        <p className="mb-0">Hành trình qua các nền</p>
        <p>văn minh</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative w-full">
        <Heading2 />
        <Container11 />
      </div>
    </div>
  );
}

function ButtonUnselectedCardWorld() {
  return (
    <div className="bg-white relative rounded-[32px] shrink-0 w-full" data-name="Button - Unselected Card: World">
      <div aria-hidden="true" className="absolute border-4 border-[#e5e5d1] border-solid inset-0 pointer-events-none rounded-[32px] shadow-[0px_6px_0px_0px_#e5e5d1]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[24px] items-center p-[28px] relative w-full">
          <Background1 />
          <Container10 />
        </div>
      </div>
    </div>
  );
}

function IllustrationDecor() {
  return (
    <div className="content-stretch flex items-start justify-center opacity-40 relative shrink-0 w-full" data-name="Illustration Decor">
      <div aria-hidden="true" className="absolute bg-white inset-0 mix-blend-saturation pointer-events-none" />
      <div className="flex-[1_0_0] h-[128px] min-h-px min-w-px relative" data-name="Image">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-full left-[31.29%] max-w-none top-0 w-[37.43%]" src={imgImage} />
        </div>
      </div>
    </div>
  );
}

function IllustrationDecorMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[16px] relative shrink-0 w-full" data-name="Illustration Decor:margin">
      <IllustrationDecor />
    </div>
  );
}

function ContentArea() {
  return (
    <div className="relative shrink-0 w-full" data-name="Content Area">
      <div className="content-stretch flex flex-col gap-[24px] items-start px-[24px] py-[16px] relative w-full">
        <ButtonSelectedCardVietnam />
        <ButtonUnselectedCardWorld />
        <IllustrationDecorMargin />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#fbce03] content-stretch flex items-center justify-center py-[20px] relative rounded-[32px] shadow-[0px_8px_0px_0px_#d97706] shrink-0 w-full" data-name="Button">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[20px] text-center tracking-[1px] uppercase w-[103.91px]">
        <p className="leading-[28px]">Tiếp tục</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-full" data-name="Container">
      <div className="bg-[rgba(148,163,184,0.3)] h-[6px] rounded-[9999px] shrink-0 w-[128px]" data-name="Overlay" />
    </div>
  );
}

function FooterButton() {
  return (
    <div className="backdrop-blur-[2px] bg-[rgba(245,245,220,0.8)] relative shrink-0 w-full" data-name="Footer Button">
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[24px] relative w-full">
        <Button1 />
        <Container12 />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[448px] min-h-[887px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <HeaderProgress />
      <ContentArea />
      <FooterButton />
    </div>
  );
}

export default function HistoryAliveSubjectSelectionScreen() {
  return (
    <div className="bg-[#f5f5dc] content-stretch flex flex-col items-start relative size-full" data-name="History Alive Subject Selection Screen">
      <Container />
    </div>
  );
}