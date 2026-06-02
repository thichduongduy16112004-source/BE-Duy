import svgPaths from "./svg-mqiyzsnmwh";
import imgImage from "figma:asset/b4cb56767bb2ee81d2c81da79517b67fe2ec5a88.png";

function BackgroundVideoSceneDimmed() {
  return (
    <div className="absolute content-stretch flex flex-col inset-0 items-start justify-center" data-name="Background Video Scene (Dimmed)">
      <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Image">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-full left-[-65.64%] max-w-none top-0 w-[231.28%]" src={imgImage} />
        </div>
      </div>
      <div className="absolute bg-gradient-to-b from-[rgba(35,31,15,0.4)] inset-0 to-[rgba(35,31,15,0.95)]" data-name="Gradient" />
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p300a1100} fill="var(--fill-0, #F1F5F9)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="backdrop-blur-[6px] bg-[rgba(35,31,15,0.5)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button">
      <Container />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px min-w-px relative" data-name="Heading 2">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[23px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[18px] text-center tracking-[-0.45px] w-[103.61px]">
        <p className="leading-[22.5px]">History Alive</p>
      </div>
    </div>
  );
}

function HeaderTopAppBar() {
  return (
    <div className="relative shrink-0 w-full" data-name="Header - Top App Bar">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[16px] pr-[56px] py-[16px] relative w-full">
          <Button />
          <Heading1 />
        </div>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0 size-[23.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.4 23.4">
        <g id="Container">
          <path d={svgPaths.pc0fef00} fill="var(--fill-0, #EF4444)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorder() {
  return (
    <div className="bg-[rgba(239,68,68,0.1)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[64px]" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border-4 border-[rgba(239,68,68,0.2)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <Container2 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 1">
      <div className="flex flex-col font-['Be_Vietnam_Pro:ExtraBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#ef4444] text-[30px] tracking-[-0.75px] w-[109.88px]">
        <p className="leading-[36px]">{`Sai rồi! `}</p>
      </div>
    </div>
  );
}

function StatusIconTitle() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full" data-name="Status Icon & Title">
      <OverlayBorder />
      <Heading />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Semi_Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[14px] text-center tracking-[0.7px] uppercase w-[63.98px]">
        <p className="leading-[20px]">Câu hỏi</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[0.625px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[50px] justify-center leading-[24.75px] relative shrink-0 text-[#0f172a] text-[18px] text-center w-[277.88px]">
        <p className="mb-0">Cuộc khởi nghĩa Lam Sơn diễn ra</p>
        <p>vào năm nào?</p>
      </div>
    </div>
  );
}

function Question() {
  return (
    <div className="content-stretch flex flex-col gap-[2.875px] items-start py-[8px] relative shrink-0 w-full" data-name="Question">
      <Container3 />
      <Container4 />
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] relative shrink-0 text-[#ef4444] text-[16px] w-[99.63px]">
          <p className="leading-[24px]">C. Năm 1400</p>
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0 size-[21.7px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.7 21.7">
        <g id="Container">
          <path d={svgPaths.p1f83a580} fill="var(--fill-0, #EF4444)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function UserChoiceWrong() {
  return (
    <div className="bg-[rgba(239,68,68,0.05)] relative rounded-[48px] shrink-0 w-full" data-name="User Choice (Wrong)">
      <div aria-hidden="true" className="absolute border-2 border-[#ef4444] border-solid inset-0 pointer-events-none rounded-[48px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[18px] relative w-full">
          <Container5 />
          <Container6 />
        </div>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] relative shrink-0 text-[#22c55e] text-[16px] w-[92.53px]">
          <p className="leading-[24px]">A. Năm 1418</p>
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 size-[21.7px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.7 21.7">
        <g id="Container">
          <path d={svgPaths.p2a7b0680} fill="var(--fill-0, #22C55E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function CorrectAnswer() {
  return (
    <div className="bg-[rgba(34,197,94,0.05)] relative rounded-[48px] shrink-0 w-full" data-name="Correct Answer">
      <div aria-hidden="true" className="absolute border-2 border-[#22c55e] border-solid inset-0 pointer-events-none rounded-[48px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[18px] relative w-full">
          <Container7 />
          <Container8 />
        </div>
      </div>
    </div>
  );
}

function OptionsVisualized() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Options Visualized">
      <UserChoiceWrong />
      <CorrectAnswer />
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[14px] w-full">
          <p className="mb-0">
            <span className="leading-[22.75px]">Giải thích:</span>
            <span className="font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal leading-[22.75px] text-[#334155]">{` Khởi nghĩa Lam Sơn do Lê Lợi`}</span>
          </p>
          <p className="font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal leading-[22.75px] mb-0 text-[#334155]">lãnh đạo, bắt đầu từ năm 1418 tại Thanh</p>
          <p className="font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal leading-[22.75px] text-[#334155]">Hóa nhằm chống lại quân Minh xâm lược.</p>
        </div>
      </div>
    </div>
  );
}

function ExplanationBox() {
  return (
    <div className="bg-[rgba(254,207,1,0.1)] relative rounded-[48px] shrink-0 w-full" data-name="Explanation Box">
      <div aria-hidden="true" className="absolute border border-[rgba(254,207,1,0.2)] border-solid inset-0 pointer-events-none rounded-[48px]" />
      <div className="content-stretch flex flex-col items-start pb-[17px] pt-[16.25px] px-[17px] relative w-full">
        <Container9 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start p-[24px] relative w-full">
        <StatusIconTitle />
        <Question />
        <OptionsVisualized />
        <ExplanationBox />
      </div>
    </div>
  );
}

function FeedbackCard() {
  return (
    <div className="bg-white max-w-[448px] relative rounded-[48px] shrink-0 w-full" data-name="Feedback Card">
      <div className="content-stretch flex flex-col items-start max-w-[inherit] overflow-clip pt-[8px] relative rounded-[inherit] w-full">
        <Container1 />
      </div>
      <div aria-hidden="true" className="absolute border-[#ef4444] border-solid border-t-8 inset-0 pointer-events-none rounded-[48px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" />
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[14.25px] relative shrink-0 w-[16.5px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 14.25">
        <g id="Container">
          <path d={svgPaths.p10d9fd00} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[14px] text-white w-[285.61px]">
        <p className="leading-[20px]">Xem lại đoạn video này! Không thể bỏ qua.</p>
      </div>
    </div>
  );
}

function OverlayOverlayBlur() {
  return (
    <div className="backdrop-blur-[2px] bg-[rgba(249,115,22,0.9)] content-stretch flex gap-[8px] items-center px-[16px] py-[8px] relative rounded-[9999px] shrink-0" data-name="Overlay+OverlayBlur">
      <div className="absolute bg-[rgba(255,255,255,0)] inset-[0_0.5px_0_0] rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" data-name="Overlay+Shadow" />
      <Container10 />
      <Container11 />
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[14px] relative shrink-0 w-[11px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 14">
        <g id="Container">
          <path d={svgPaths.p30eba500} fill="var(--fill-0, #231F0F)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#fecf01] content-stretch flex gap-[12px] h-[64px] items-center justify-center pb-[18.5px] pt-[17.5px] relative rounded-[9999px] shadow-[0px_8px_0px_0px_#d4ac00] shrink-0 w-full" data-name="Button">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Extra_Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#231f0f] text-[20px] text-center tracking-[1px] uppercase w-[212.83px]">
        <p className="leading-[28px]">{`Xem lại & Học tiếp`}</p>
      </div>
      <Container12 />
    </div>
  );
}

function CallToActionBanner() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center max-w-[448px] relative shrink-0 w-full" data-name="Call to Action Banner">
      <OverlayOverlayBlur />
      <Button1 />
    </div>
  );
}

function CallToActionBannerMargin() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[448px] pt-[24px] relative shrink-0 w-full" data-name="Call to Action Banner:margin">
      <CallToActionBanner />
    </div>
  );
}

function MainContentArea() {
  return (
    <div className="relative shrink-0 w-full" data-name="Main Content Area">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center p-[16px] relative w-full">
          <FeedbackCard />
          <CallToActionBannerMargin />
        </div>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[13.081px] relative shrink-0 w-[10.325px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.325 13.0813">
        <g id="Container">
          <path d={svgPaths.p355dd580} fill="var(--fill-0, #EF4444)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start pr-[16.56px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[30px] justify-center leading-[15px] relative shrink-0 text-[#ef4444] text-[10px] tracking-[1px] uppercase w-[241.53px]">
        <p className="mb-0">Thanh tua bị khóa — Hãy xem lại đoạn</p>
        <p>này</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container16 />
      <Container17 />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start pr-[29.52px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[30px] justify-center leading-[15px] relative shrink-0 text-[#94a3b8] text-[10px] w-[36.37px]">
        <p className="mb-0">02:45 /</p>
        <p>05:20</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container15 />
      <Container18 />
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-[#ef4444] inset-[0_41.67%_0_33.33%]" data-name="Background">
      <div className="absolute bg-[rgba(255,255,255,0.2)] inset-0" data-name="Overlay" />
    </div>
  );
}

function ProgressTrack() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] h-[12px] overflow-clip relative rounded-[9999px] shrink-0 w-full" data-name="Progress Track">
      <div className="absolute bg-[#22c55e] inset-[0_66.67%_0_0]" data-name="Background" />
      <div className="absolute bg-[rgba(255,255,255,0.05)] inset-[0_0_0_199.5px]" data-name="Overlay" />
      <Background />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start max-w-[448px] relative shrink-0 w-full" data-name="Container">
      <Container14 />
      <ProgressTrack />
    </div>
  );
}

function FooterBottomLockedProgressBar() {
  return (
    <div className="bg-gradient-to-t from-[#231f0f] relative shrink-0 to-[rgba(35,31,15,0)] w-full" data-name="Footer - Bottom Locked Progress Bar">
      <div className="content-stretch flex flex-col items-start pb-[40px] pt-[24px] px-[24px] relative w-full">
        <Container13 />
      </div>
    </div>
  );
}

export default function HistoryAliveWrongAnswerRewatch() {
  return (
    <div className="bg-[#231f0f] content-stretch flex flex-col items-start relative size-full" data-name="History Alive Wrong Answer Rewatch">
      <BackgroundVideoSceneDimmed />
      <HeaderTopAppBar />
      <MainContentArea />
      <FooterBottomLockedProgressBar />
    </div>
  );
}