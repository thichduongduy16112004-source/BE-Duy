import svgPaths from "./svg-okwy8r7zbi";

function Container1() {
  return (
    <div className="h-[55.275px] relative shrink-0 w-[63px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63 55.275">
        <g id="Container">
          <path d={svgPaths.pe355400} fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute bottom-[-59.72px] right-[-60.02px] size-[56px]" data-name="Background">
      <div className="absolute inset-[-3.57%_-21.43%_-39.29%_-21.43%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 80">
          <g id="Background">
            <rect fill="var(--fill-0, white)" height="56" rx="28" width="56" x="12" y="2" />
            <g filter="url(#filter0_dd_0_677)" id="Overlay+Shadow">
              <rect fill="var(--fill-0, white)" fillOpacity="0.01" height="56" rx="28" shapeRendering="crispEdges" width="56" x="12" y="2" />
            </g>
            <path d={svgPaths.p133d27c0} fill="var(--fill-0, #FCCF03)" id="Icon" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="80" id="filter0_dd_0_677" width="80" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feMorphology in="SourceAlpha" operator="erode" radius="4" result="effect1_dropShadow_0_677" />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="3" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_0_677" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feMorphology in="SourceAlpha" operator="erode" radius="3" result="effect2_dropShadow_0_677" />
              <feOffset dy="10" />
              <feGaussianBlur stdDeviation="7.5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
              <feBlend in2="effect1_dropShadow_0_677" mode="normal" result="effect2_dropShadow_0_677" />
              <feBlend in="SourceGraphic" in2="effect2_dropShadow_0_677" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <Container1 />
        <Background1 />
      </div>
    </div>
  );
}

function StylizedGoldenScrollAndCompassLogo() {
  return (
    <div className="bg-[#fccf03] content-stretch flex items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 size-[192px]" data-name="Stylized Golden Scroll and Compass Logo">
      <div aria-hidden="true" className="absolute border-8 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[rgba(255,255,255,0)] left-1/2 rounded-[9999px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-[192px] top-1/2" data-name="Stylized Golden Scroll and Compass Logo:shadow" />
      <Container />
    </div>
  );
}

function Heading1AppName() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 1 - App Name">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[40px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[36px] tracking-[-0.9px] w-[223.86px]">
        <p>
          <span className="leading-[40px]">{`History `}</span>
          <span className="font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] leading-[40px] not-italic text-[#d9a400]">Alive</span>
        </p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="relative shrink-0" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[0.75px] items-center not-italic px-[10.31px] relative text-center">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[47px] justify-center leading-[22.5px] relative shrink-0 text-[#0f172a] text-[18px] w-[268px]">
          <p className="mb-0">Chào mừng đến với History</p>
          <p>Alive!</p>
        </div>
        <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[48px] justify-center leading-[24px] relative shrink-0 text-[#475569] text-[16px] w-[247.38px]">
          <p className="mb-0">Hành trình khám phá lịch sử bắt</p>
          <p>đầu từ đây.</p>
        </div>
      </div>
    </div>
  );
}

function SpeechBubble() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start max-w-[320px] pb-[26px] pt-[25.25px] px-[26px] relative rounded-[16px] shrink-0" data-name="Speech Bubble">
      <div aria-hidden="true" className="absolute border-2 border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[16px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]" data-name="Speech Bubble:shadow" />
      <Paragraph />
      <div className="-translate-x-1/2 absolute bottom-[-10px] h-[12px] left-1/2 w-[24px]" data-name="Border">
        <div aria-hidden="true" className="absolute border-l-12 border-r-12 border-solid border-t-12 border-white inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function CenterContentLogoAndMascotCharacterArea() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center justify-center py-[101.5px] relative shrink-0 w-full" data-name="Center Content: Logo and Mascot/Character Area">
      <StylizedGoldenScrollAndCompassLogo />
      <Heading1AppName />
      <SpeechBubble />
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[20px] text-center tracking-[1px] uppercase w-[170.47px]">
          <p className="leading-[28px]">Bắt đầu ngay</p>
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0 size-[17.7px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.7 17.7">
        <g id="Container">
          <path d={svgPaths.p3f27e00} fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin() {
  return (
    <div className="relative shrink-0" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[8px] relative">
        <Container3 />
      </div>
    </div>
  );
}

function PrimaryMassiveButton() {
  return (
    <div className="bg-[#fccf03] content-stretch flex h-[64px] items-center justify-center pb-[6px] relative rounded-[9999px] shrink-0 w-full" data-name="Primary Massive Button">
      <div aria-hidden="true" className="absolute border-[#d97706] border-b-6 border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <Container2 />
      <Margin />
    </div>
  );
}

function ButtonSecondaryTextLink() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button - Secondary Text Link">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[16px] text-center w-[182px]">
        <p className="[text-decoration-skip-ink:none] decoration-solid leading-[24px] underline">Tôi đã có tài khoản</p>
      </div>
    </div>
  );
}

function BottomActionArea() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center pb-[32px] relative shrink-0 w-full" data-name="Bottom Action Area">
      <PrimaryMassiveButton />
      <ButtonSecondaryTextLink />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[41.75px] relative w-[50px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 41.75">
        <g id="Container" opacity="0.1">
          <path d={svgPaths.p3288c100} fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute bottom-[160px] h-[30px] left-[20px] w-[27.608px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27.6082 30">
        <g id="Container" opacity="0.1">
          <path d={svgPaths.p3c889300} fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div className="max-w-[448px] min-h-[884px] relative shrink-0 w-full" data-name="Background" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 402 886\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(54.009 0 0 119.03 -17889 -39427)\\'><stop stop-color=\\'rgba(252,207,3,0.1)\\' offset=\\'0.009304\\'/><stop stop-color=\\'rgba(252,207,3,0)\\' offset=\\'0.009304\\'/></radialGradient></defs></svg>')" }}>
      <div className="flex flex-col items-center max-w-[inherit] min-h-[inherit] size-full">
        <div className="content-stretch flex flex-col items-center justify-between max-w-[inherit] min-h-[inherit] px-[24px] py-[48px] relative w-full">
          <div className="absolute bg-gradient-to-b from-[rgba(252,207,3,0.2)] h-[128px] left-0 opacity-20 right-0 to-[rgba(252,207,3,0)] top-0" data-name="Top Decorative Elements" />
          <CenterContentLogoAndMascotCharacterArea />
          <BottomActionArea />
          <div className="absolute bg-[rgba(252,207,3,0.1)] blur-[32px] bottom-[-40px] left-[-40px] rounded-[9999px] size-[160px]" data-name="Background Aesthetic Elements" />
          <div className="absolute bg-[rgba(252,207,3,0.1)] blur-[32px] right-[-40px] rounded-[9999px] size-[160px] top-[-40px]" data-name="Overlay+Blur" />
          <div className="absolute h-[40px] left-[42.5px] top-[90px] w-[55px]" data-name="Decorative Cloud Patterns (Simplified CSS representations) → cloud">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 55 40">
              <path d={svgPaths.p28cb0080} fill="var(--fill-0, #0F172A)" id="Decorative Cloud Patterns (Simplified CSS representations) â cloud" opacity="0.1" />
            </svg>
          </div>
          <div className="absolute flex h-[62.625px] items-center justify-center right-[25px] top-[145px] w-[75px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18" } as React.CSSProperties}>
            <div className="flex-none scale-x-150 scale-y-150">
              <Container4 />
            </div>
          </div>
          <Container5 />
        </div>
      </div>
    </div>
  );
}

export default function HistoryAliveWelcomeScreen() {
  return (
    <div className="bg-[#f5f5dc] content-stretch flex flex-col items-start relative size-full" data-name="History Alive Welcome Screen">
      <Background />
    </div>
  );
}