import svgPaths from "./svg-13stjxfdc9";
import imgBackgroundBorderShadow from "figma:asset/253167a588e9474328c4cf8c137382a0b5e82a82.png";

function Container1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p300a1100} fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="relative rounded-[9999px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container1 />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative w-full">
        <div className="flex flex-col font-['Lexend:Thin',sans-serif] font-thin h-[23px] justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[18px] text-center tracking-[-0.45px] w-[180.42px]">
          <p className="leading-[22.5px]">Khởi Nghĩa Lam Sơn</p>
        </div>
      </div>
    </div>
  );
}

function Container3() {
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

function Container2() {
  return (
    <div className="relative rounded-[9999px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container3 />
      </div>
    </div>
  );
}

function TopNavigationBar() {
  return (
    <div className="absolute bg-white content-stretch flex items-center justify-between left-0 pb-[17px] pt-[16px] px-[16px] right-0 top-0" data-name="Top Navigation Bar">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
      <Container />
      <Heading />
      <Container2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[21px] relative shrink-0 w-[16.5px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 21">
        <g id="Container">
          <path d="M0 21V0L16.5 10.5L0 21V21" fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#fccf03] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[64px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[rgba(255,255,255,0)] left-1/2 rounded-[9999px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] size-[64px] top-1/2" data-name="Button:shadow" />
      <Container4 />
    </div>
  );
}

function Overlay() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.2)] content-stretch flex inset-[4px_4px_3.74px_4px] items-center justify-center" data-name="Overlay">
      <Button />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Lexend:Thin',sans-serif] font-thin h-[15px] justify-center leading-[0] relative shrink-0 text-[10px] text-white tracking-[0.5px] w-[30.09px]">
        <p className="leading-[15px]">01:30</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-80 relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Lexend:Thin',sans-serif] font-thin h-[15px] justify-center leading-[0] relative shrink-0 text-[10px] text-white tracking-[0.5px] w-[31.03px]">
        <p className="leading-[15px]">04:45</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container6 />
      <Container7 />
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(255,255,255,0.3)] h-[8px] overflow-clip relative rounded-[9999px] shrink-0 w-full" data-name="Overlay">
      <div className="absolute bg-[#fccf03] inset-[0_65%_0_0]" data-name="Background" />
    </div>
  );
}

function VideoControlsOverlay() {
  return (
    <div className="absolute bg-gradient-to-t bottom-[3.74px] content-stretch flex flex-col from-[rgba(0,0,0,0.6)] gap-[4px] items-start left-[4px] px-[16px] py-[12px] right-[4px] to-[rgba(0,0,0,0)]" data-name="Video Controls Overlay">
      <Container5 />
      <Overlay1 />
    </div>
  );
}

function BackgroundBorderShadow() {
  return (
    <div className="aspect-video bg-size-[350px_350px] bg-top-left relative rounded-[48px] shrink-0 w-full" data-name="Background+Border+Shadow" style={{ backgroundImage: `url('${imgBackgroundBorderShadow}')` }}>
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Overlay />
        <VideoControlsOverlay />
      </div>
      <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-0 pointer-events-none rounded-[48px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Lexend:Thin',sans-serif] font-thin h-[16px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] tracking-[1.2px] uppercase w-[138.3px]">
        <p className="leading-[16px]">Lesson Progress</p>
      </div>
    </div>
  );
}

function Overlay2() {
  return (
    <div className="bg-[rgba(252,207,3,0.1)] content-stretch flex flex-col items-start px-[8px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Lexend:Thin',sans-serif] font-thin h-[16px] justify-center leading-[0] relative shrink-0 text-[#fccf03] text-[12px] w-[79.28px]">
        <p className="leading-[16px]">Checkpoint 2</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
        <Container9 />
        <Overlay2 />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[6.012px] relative shrink-0 w-[8.15px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.15 6.0125">
        <g id="Container">
          <path d={svgPaths.p483d100} fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-[#fccf03] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[24px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      <Container11 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Lexend:Thin',sans-serif] font-thin h-[15px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[10px] w-[19.17px]">
        <p className="leading-[15px]">CP1</p>
      </div>
    </div>
  );
}

function Checkpoint1Completed() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0" data-name="Checkpoint 1: Completed">
      <BackgroundBorder />
      <Container12 />
    </div>
  );
}

function BackgroundBorderShadow1() {
  return (
    <div className="bg-[#fccf03] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[32px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_15px_0px_rgba(252,207,3,0.6)]" />
      <div className="bg-[#0f172a] rounded-[9999px] shrink-0 size-[8px]" data-name="Background" />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Lexend:Thin',sans-serif] font-thin h-[15px] justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[10px] w-[19.05px]">
        <p className="leading-[15px]">CP2</p>
      </div>
    </div>
  );
}

function Checkpoint2PulsingActive() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0" data-name="Checkpoint 2: Pulsing Active">
      <BackgroundBorderShadow1 />
      <Container13 />
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[8px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 10.5">
        <g id="Container">
          <path d={svgPaths.p3e41e180} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="bg-[#e2e8f0] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[24px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      <Container14 />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Lexend:Thin',sans-serif] font-thin h-[15px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[10px] w-[19.48px]">
        <p className="leading-[15px]">CP3</p>
      </div>
    </div>
  );
}

function Checkpoint3Locked() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0" data-name="Checkpoint 3: Locked">
      <BackgroundBorder1 />
      <Container15 />
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between px-[8px] relative w-full">
          <div className="-translate-y-1/2 absolute bg-[#e2e8f0] h-[4px] left-0 right-0 rounded-[9999px] top-1/2" data-name="Track line" />
          <div className="-translate-y-1/2 absolute bg-[#fccf03] h-[4px] left-0 right-1/2 rounded-[9999px] top-1/2" data-name="Background" />
          <Checkpoint1Completed />
          <Checkpoint2PulsingActive />
          <Checkpoint3Locked />
        </div>
      </div>
    </div>
  );
}

function ProgressCheckpoints() {
  return (
    <div className="bg-[#f8fafc] relative rounded-[48px] shrink-0 w-full" data-name="Progress & Checkpoints">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[48px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[17px] relative w-full">
        <Container8 />
        <Container10 />
      </div>
    </div>
  );
}

function VideoPlayerSection() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Video Player Section">
      <BackgroundBorderShadow />
      <ProgressCheckpoints />
    </div>
  );
}

function Overlay3() {
  return (
    <div className="bg-[rgba(252,207,3,0.2)] content-stretch flex flex-col items-start px-[8px] py-[2px] relative rounded-[16px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Lexend:Thin',sans-serif] font-thin h-[15px] justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[10px] tracking-[-0.5px] uppercase w-[74.88px]">
        <p className="leading-[15px]">Question 1/5</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Overlay3 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Be_Vietnam_Pro:SemiBold',sans-serif] justify-center leading-[25px] not-italic relative shrink-0 text-[#0f172a] text-[20px] tracking-[-0.5px] w-full">
        <p className="mb-0">Cuộc khởi nghĩa Lam Sơn diễn</p>
        <p>ra vào năm nào?</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Lexend:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#064e3b] text-[16px] w-full">
        <p className="leading-[24px]">Năm 1418</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Lexend:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#059669] text-[12px] w-full">
        <p className="leading-[16px]">Chính xác!</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container20 />
        <Container21 />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[7.015px] relative shrink-0 w-[9.508px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.50833 7.01458">
        <g id="Container">
          <path d={svgPaths.p25f8ca80} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#10b981] relative rounded-[9999px] shrink-0 size-[24px]" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container22 />
      </div>
    </div>
  );
}

function LabelCorrectOption() {
  return (
    <div className="bg-[#ecfdf5] relative rounded-[48px] shrink-0 w-full" data-name="Label - Correct Option">
      <div aria-hidden="true" className="absolute border-2 border-[#10b981] border-solid inset-0 pointer-events-none rounded-[48px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center p-[18px] relative w-full">
          <Container19 />
          <Background />
        </div>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Lexend:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[16px] w-full">
        <p className="leading-[24px]">Năm 1428</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container24 />
      </div>
    </div>
  );
}

function LabelOtherOptions() {
  return (
    <div className="bg-[#f8fafc] relative rounded-[48px] shrink-0 w-full" data-name="Label - Other Options">
      <div aria-hidden="true" className="absolute border-2 border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[48px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center p-[18px] relative w-full">
          <Container23 />
          <div className="relative rounded-[9999px] shrink-0 size-[24px]" data-name="Border">
            <div aria-hidden="true" className="absolute border-2 border-[#cbd5e1] border-solid inset-0 pointer-events-none rounded-[9999px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Lexend:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[16px] w-full">
        <p className="leading-[24px]">Năm 1400</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container26 />
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="bg-[#f8fafc] relative rounded-[48px] shrink-0 w-full" data-name="Label">
      <div aria-hidden="true" className="absolute border-2 border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[48px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center p-[18px] relative w-full">
          <Container25 />
          <div className="relative rounded-[9999px] shrink-0 size-[24px]" data-name="Border">
            <div aria-hidden="true" className="absolute border-2 border-[#cbd5e1] border-solid inset-0 pointer-events-none rounded-[9999px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Lexend:Thin',sans-serif] font-thin justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[16px] w-full">
        <p className="leading-[24px]">Năm 1407</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container28 />
      </div>
    </div>
  );
}

function Label1() {
  return (
    <div className="bg-[#f8fafc] relative rounded-[48px] shrink-0 w-full" data-name="Label">
      <div aria-hidden="true" className="absolute border-2 border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[48px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center p-[18px] relative w-full">
          <Container27 />
          <div className="relative rounded-[9999px] shrink-0 size-[24px]" data-name="Border">
            <div aria-hidden="true" className="absolute border-2 border-[#cbd5e1] border-solid inset-0 pointer-events-none rounded-[9999px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start pt-[8px] relative shrink-0 w-full" data-name="Container">
      <LabelCorrectOption />
      <LabelOtherOptions />
      <Label />
      <Label1 />
    </div>
  );
}

function Container16() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start p-[20px] relative w-full">
        <Container17 />
        <Heading1 />
        <Container18 />
      </div>
    </div>
  );
}

function QuizCardSection() {
  return (
    <div className="bg-white relative rounded-[16px] shrink-0 w-full" data-name="Quiz Card Section">
      <div className="content-stretch flex flex-col items-start overflow-clip pt-[8px] relative rounded-[inherit] w-full">
        <Container16 />
      </div>
      <div aria-hidden="true" className="absolute border-[#fccf03] border-solid border-t-8 inset-0 pointer-events-none rounded-[16px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function MainContentArea() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] inset-[73px_0_-20.38px_0] items-start pt-[16px] px-[16px]" data-name="Main Content Area">
      <VideoPlayerSection />
      <QuizCardSection />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Lexend:Thin',sans-serif] font-thin h-[28px] justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[18px] text-center tracking-[0.45px] uppercase w-[229.86px]">
        <p className="leading-[28px]">{`Xác nhận & Tiếp tục`}</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[14px] relative shrink-0 w-[11px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 14">
        <g id="Container">
          <path d="M0 14V0L11 7L0 14V14" fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#fccf03] content-stretch flex gap-[12px] h-[64px] items-center justify-center relative rounded-[16px] shadow-[0px_6px_0px_0px_#c4a302] shrink-0 w-full" data-name="Button">
      <Container29 />
      <Container30 />
    </div>
  );
}

function StickyBottomButton() {
  return (
    <div className="absolute bg-gradient-to-t bottom-0 content-stretch flex flex-col from-white items-start left-0 p-[24px] right-0 to-[rgba(255,255,255,0)] via-1/2 via-white" data-name="Sticky Bottom Button">
      <Button1 />
    </div>
  );
}

export default function Body() {
  return (
    <div className="relative shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-full" data-name="Body" style={{ backgroundImage: "linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%), linear-gradient(90deg, rgb(248, 248, 245) 0%, rgb(248, 248, 245) 100%)" }}>
      <TopNavigationBar />
      <MainContentArea />
      <StickyBottomButton />
    </div>
  );
}