import svgPaths from "./svg-qrlkog9kng";
import imgCharacterIllustrationSection from "figma:asset/db465f6202b7a45703ba0ca2fda2e08785a2a99b.png";
import imgImageBorderShadow from "figma:asset/eeaf89497dc9673f68176ae462170d30f89f2a99.png";
import imgImageBorderShadow1 from "figma:asset/673e31710865bf1cf41e10f13c21def39ca73377.png";

function Container() {
  return (
    <div className="h-[19px] relative shrink-0 w-[14px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 19">
        <g id="Container">
          <path d={svgPaths.p39e29d00} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center p-[8px] relative">
        <Container />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[14px] w-full">
        <p className="leading-[normal]">Hỏi Nguyễn Trãi...</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Input">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[12px] py-[5px] relative w-full">
          <Container1 />
        </div>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[13.333px] relative shrink-0 w-[15.833px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.8333 13.3333">
        <g id="Container">
          <path d={svgPaths.pf594000} fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#fccf03] relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <div className="-translate-y-1/2 absolute bg-[rgba(255,255,255,0)] left-0 rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[40px] top-1/2" data-name="Button:shadow" />
        <Container2 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow() {
  return (
    <div className="bg-[#f1f5f9] relative rounded-[9999px] shrink-0 w-full" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center p-[9px] relative w-full">
          <Button />
          <Input />
          <Button1 />
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function FixedInputArea() {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(255,255,255,0.8)] bottom-[72px] content-stretch flex flex-col items-start left-0 p-[16px] right-0 z-[3]" data-name="Fixed Input Area">
      <BackgroundBorderShadow />
    </div>
  );
}

function Container4() {
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

function Container3() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[48px]" data-name="Container">
      <Container4 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px min-w-px relative" data-name="Heading 2">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[23px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[18px] text-center tracking-[-0.45px] w-[103.7px]">
        <p className="leading-[22.5px]">Nguyễn Trãi</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[20px] relative shrink-0 w-[20.1px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.1 20">
        <g id="Container">
          <path d={svgPaths.p3cdadd00} fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[48px]" data-name="Button">
      <Container6 />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex items-center justify-end relative shrink-0 w-[48px]" data-name="Container">
      <Button2 />
    </div>
  );
}

function HeaderTopNavigationBar() {
  return (
    <div className="bg-white relative shrink-0 w-full z-[2]" data-name="Header - Top Navigation Bar">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[8px] pt-[16px] px-[16px] relative w-full">
          <Container3 />
          <Heading />
          <Container5 />
        </div>
      </div>
    </div>
  );
}

function CharacterIllustrationSection() {
  return (
    <div className="h-[447.5px] relative rounded-[48px] shrink-0 w-[358px]" data-name="Character Illustration Section">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[48px]">
        <img alt="" className="absolute h-[98.21%] left-[-11.38%] max-w-none top-[0.89%] w-[122.77%]" src={imgCharacterIllustrationSection} />
      </div>
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute bg-gradient-to-t from-[rgba(0,0,0,0.4)] inset-[4px] to-[rgba(0,0,0,0)]" data-name="Gradient" />
      </div>
      <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-0 pointer-events-none rounded-[48px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[11px] tracking-[0.55px] uppercase w-[82.2px]">
        <p className="leading-[16.5px]">Nguyễn Trãi</p>
      </div>
    </div>
  );
}

function BackgroundBorderShadow1() {
  return (
    <div className="bg-[#f5f5dc] content-stretch flex flex-col items-start max-w-[260.1000061035156px] pl-[17px] pr-[34.37px] py-[13px] relative rounded-br-[16px] rounded-tl-[16px] rounded-tr-[16px] shrink-0" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[rgba(252,207,3,0.1)] border-solid inset-0 pointer-events-none rounded-br-[16px] rounded-tl-[16px] rounded-tr-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-col font-['Be_Vietnam_Pro:Regular',sans-serif] h-[91px] justify-center leading-[22.75px] not-italic relative shrink-0 text-[#1e293b] text-[14px] w-[208.72px]">
        <p className="mb-0">Chào hậu sinh! Năm 1428, đại</p>
        <p className="mb-0">cục đã định. Con có biết ta đã</p>
        <p className="mb-0">viết áng thiên cổ hùng văn nào</p>
        <p>để bá cáo thiên hạ không?</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative" data-name="Container">
      <Margin />
      <BackgroundBorderShadow1 />
    </div>
  );
}

function AiMessage() {
  return (
    <div className="content-stretch flex gap-[12px] items-end relative shrink-0 w-full" data-name="AI Message 1">
      <div className="pointer-events-none relative rounded-[9999px] shrink-0 size-[40px]" data-name="Image+Border+Shadow">
        <div className="absolute inset-0 overflow-hidden rounded-[9999px]">
          <img alt="" className="absolute left-[5%] max-w-none size-[90%] top-[5%]" src={imgImageBorderShadow} />
        </div>
        <div aria-hidden="true" className="absolute border-2 border-[#fccf03] border-solid inset-0 rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      </div>
      <Container7 />
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pr-[4px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[11px] tracking-[0.55px] uppercase w-[25.53px]">
        <p className="leading-[16.5px]">Bạn</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#fccf03] content-stretch flex flex-col items-start max-w-[260.1000061035156px] pl-[16px] pr-[24.97px] py-[12px] relative rounded-bl-[16px] rounded-tl-[16px] rounded-tr-[16px] shrink-0" data-name="Background">
      <div className="absolute bg-[rgba(255,255,255,0)] inset-[0_0_0.5px_0] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" data-name="Overlay+Shadow" />
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[46px] justify-center leading-[22.75px] not-italic relative shrink-0 text-[#0f172a] text-[14px] w-[219.12px]">
        <p className="mb-0">Dạ, có phải là Bình Ngô Đại Cáo</p>
        <p>không bác?</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-end min-h-px min-w-px relative" data-name="Container">
      <Margin1 />
      <Background />
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0 size-[13.333px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333">
        <g id="Container">
          <path d={svgPaths.pfeb5cc0} fill="var(--fill-0, #FCCF03)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorderShadow() {
  return (
    <div className="bg-[rgba(252,207,3,0.2)] content-stretch flex items-center justify-center p-[2px] relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay+Border+Shadow">
      <div aria-hidden="true" className="absolute border-2 border-[#fccf03] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container9 />
    </div>
  );
}

function UserMessage() {
  return (
    <div className="content-stretch flex gap-[12px] items-end justify-end relative shrink-0 w-full" data-name="User Message">
      <Container8 />
      <OverlayBorderShadow />
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[11px] tracking-[0.55px] uppercase w-[82.2px]">
        <p className="leading-[16.5px]">Nguyễn Trãi</p>
      </div>
    </div>
  );
}

function BackgroundBorderShadow2() {
  return (
    <div className="bg-[#f5f5dc] content-stretch flex flex-col items-start max-w-[260.1000061035156px] pl-[17px] pr-[19.98px] py-[13px] relative rounded-br-[16px] rounded-tl-[16px] rounded-tr-[16px] shrink-0" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[rgba(252,207,3,0.1)] border-solid inset-0 pointer-events-none rounded-br-[16px] rounded-tl-[16px] rounded-tr-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-col font-['Be_Vietnam_Pro:Regular',sans-serif] h-[94px] justify-center leading-[22.75px] not-italic relative shrink-0 text-[#1e293b] text-[14px] w-[230px]">
        <p className="mb-0">Chính xác! Bài cáo đó đúc kết tư</p>
        <p className="mb-0">{`tưởng "Việc nhân nghĩa cốt ở yên`}</p>
        <p className="mb-0">{`dân". Con muốn ta phân tích`}</p>
        <p>thêm không?</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative" data-name="Container">
      <Margin2 />
      <BackgroundBorderShadow2 />
    </div>
  );
}

function AiMessage1() {
  return (
    <div className="content-stretch flex gap-[12px] items-end relative shrink-0 w-full" data-name="AI Message 2">
      <div className="pointer-events-none relative rounded-[9999px] shrink-0 size-[40px]" data-name="Image+Border+Shadow">
        <div className="absolute inset-0 overflow-hidden rounded-[9999px]">
          <img alt="" className="absolute left-[5%] max-w-none size-[90%] top-[5%]" src={imgImageBorderShadow1} />
        </div>
        <div aria-hidden="true" className="absolute border-2 border-[#fccf03] border-solid inset-0 rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      </div>
      <Container10 />
    </div>
  );
}

function ChatInterface() {
  return (
    <div className="relative shrink-0 w-full" data-name="Chat Interface">
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[16px] relative w-full">
        <AiMessage />
        <UserMessage />
        <AiMessage1 />
      </div>
    </div>
  );
}

function MainContentAreaScrollable() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full z-[1]" data-name="Main Content Area (Scrollable)">
      <div className="flex flex-col items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[8px] items-center pb-[149.5px] pt-[8px] relative size-full">
          <CharacterIllustrationSection />
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}

export default function Body() {
  return (
    <div className="content-stretch flex flex-col isolate items-start relative shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-full" data-name="Body" style={{ backgroundImage: "linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%), linear-gradient(90deg, rgb(248, 248, 245) 0%, rgb(248, 248, 245) 100%)" }}>
      <FixedInputArea />
      <HeaderTopNavigationBar />
      <MainContentAreaScrollable />
    </div>
  );
}