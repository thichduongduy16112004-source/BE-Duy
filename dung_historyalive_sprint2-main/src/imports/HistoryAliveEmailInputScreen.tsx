import svgPaths from "./svg-zqy4nt6ha2";
import imgHistoryAliveEmailInputScreen from "figma:asset/3ef9d8e3369d4436fa47c39e5463587f9cdd28b8.png";

function Container1() {
  return (
    <div className="relative shrink-0 size-[17.7px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.7 17.7">
        <g id="Container">
          <path d={svgPaths.p1b1c4800} fill="var(--fill-0, #1E293B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button">
      <Container1 />
    </div>
  );
}

function BackgroundShadow1() {
  return (
    <div className="absolute bg-[#fbce04] bottom-0 left-0 right-1/2 rounded-[9999px] top-0" data-name="Background+Shadow">
      <div className="absolute bg-[rgba(255,255,255,0.3)] h-[8px] left-0 rounded-[9999px] top-0 w-[115px]" data-name="Overlay" />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_4px_0px_rgba(0,0,0,0.2)]" />
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-[#e2e8f0] h-[16px] overflow-clip relative rounded-[9999px] shrink-0 w-full" data-name="Background+Shadow">
      <BackgroundShadow1 />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Container2() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[16px] relative w-full">
        <BackgroundShadow />
      </div>
    </div>
  );
}

function TopNavigationProgress() {
  return (
    <div className="relative shrink-0 w-full" data-name="Top Navigation & Progress">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pr-[40px] relative w-full">
          <Button />
          <Container2 />
        </div>
      </div>
    </div>
  );
}

function TopNavigationProgressMargin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] pb-[24px] right-[24px] top-[16px]" data-name="Top Navigation & Progress:margin">
      <TopNavigationProgress />
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[48px] relative shrink-0 w-[60px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 60 48">
        <g id="Container">
          <path d={svgPaths.pa75d1c0} fill="var(--fill-0, #FBCE04)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center p-[28px] relative rounded-[32px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-4 border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[32px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] inset-[0_-32.02px_-32px_0] rounded-[32px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" data-name="Overlay+Shadow" />
      <Container5 />
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="bg-[#ef4444] content-stretch flex h-[40.003px] items-center justify-center pb-[6.501px] pt-[5.501px] px-[4px] relative rounded-[9999px] w-[39.993px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] right-[-10.01px] rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[50px] top-0" data-name="Overlay+Shadow" />
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-center text-white w-[7.768px]">
        <p className="leading-[28px]">1</p>
      </div>
    </div>
  );
}

function Component3DLikeIconRepresentation() {
  return (
    <div className="content-stretch flex flex-col items-start relative" data-name="3D-like Icon Representation">
      <div className="flex h-[109.928px] items-center justify-center relative shrink-0 w-[121.284px]" style={{ "--transform-inner-width": "1186", "--transform-inner-height": "952" } as React.CSSProperties}>
        <div className="-rotate-3 flex-none">
          <BackgroundBorder />
        </div>
      </div>
      <div className="absolute flex h-[47.444px] items-center justify-center right-[-15.71px] top-[-16.46px] w-[47.436px]" style={{ "--transform-inner-width": "1186", "--transform-inner-height": "18" } as React.CSSProperties}>
        <div className="flex-none rotate-12">
          <BackgroundBorder1 />
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex items-center justify-center pb-[11.105px] pl-[12.724px] pr-[11.102px] pt-[12.74px] relative shrink-0 size-[192px]" data-name="Container">
      <div className="flex h-[137.411px] items-center justify-center relative shrink-0 w-[151.605px]" style={{ "--transform-inner-width": "1186", "--transform-inner-height": "970" } as React.CSSProperties}>
        <div className="flex-none scale-x-125 scale-y-125">
          <Component3DLikeIconRepresentation />
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="absolute flex inset-[-48px] items-center justify-center">
        <div className="flex-none size-[288px]">
          <div className="bg-[rgba(251,206,4,0.3)] blur-[32px] rounded-[9999px] size-full" data-name="Overlay+Blur" />
        </div>
      </div>
      <Container4 />
    </div>
  );
}

function IllustrationArea() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-[24px] py-[32px] right-[24px] top-[80px]" data-name="Illustration Area">
      <Container3 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[38px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[30px] text-center tracking-[-0.75px] w-[328.63px]">
        <p className="leading-[37.5px]">Địa chỉ email của bạn?</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[56px] justify-center leading-[28px] not-italic relative shrink-0 text-[#475569] text-[18px] text-center w-[310.56px]">
        <p className="mb-0">Chúng tôi sẽ gửi thông báo học tập</p>
        <p>qua email này</p>
      </div>
    </div>
  );
}

function Content() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] items-start left-0 right-0 top-[-1px]" data-name="Content">
      <Heading />
      <Container6 />
    </div>
  );
}

function ContentMargin() {
  return (
    <div className="absolute h-[145.5px] left-[24px] right-[24px] top-[336px]" data-name="Content:margin">
      <Content />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#fbce04] content-stretch flex items-center justify-center py-[20px] relative rounded-[32px] shadow-[0px_4px_0px_0px_#c48e00] shrink-0 w-full" data-name="Button">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[20px] text-center tracking-[1px] uppercase w-[103.91px]">
        <p className="leading-[28px]">Tiếp tục</p>
      </div>
    </div>
  );
}

function FooterButton() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] pb-[40px] pt-[24px] right-[24px] top-[736px]" data-name="Footer Button">
      <Button1 />
    </div>
  );
}

function Container7() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Semi_Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[18px] w-full">
          <p className="leading-[normal]">Email của bạn</p>
        </div>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-white h-[64px] relative rounded-[32px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center pl-[58px] pr-[26px] py-[20.5px] relative size-full">
          <Container7 />
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_2px_rgba(0,0,0,0.05)]" />
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[32px]" />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute bottom-1/4 content-stretch flex flex-col items-start left-[20px] top-[23.44%]" data-name="Container">
      <div className="flex flex-col font-['Material_Symbols_Outlined:Thin',sans-serif] h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[24px] w-[24.103px]">
        <p className="leading-[32px]">alternate_email</p>
      </div>
    </div>
  );
}

function InputField() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Input Field">
      <Input />
      <Container8 />
    </div>
  );
}

function InputFieldMargin() {
  return (
    <div className="absolute content-stretch flex flex-col h-[254.5px] items-start left-[24px] min-h-[64px] pb-[190.5px] right-[24px] top-[481.5px]" data-name="Input Field:margin">
      <InputField />
    </div>
  );
}

function Container() {
  return (
    <div className="flex-[1_0_0] h-full max-w-[448px] min-h-[884px] min-w-px overflow-clip relative" data-name="Container">
      <TopNavigationProgressMargin />
      <IllustrationArea />
      <ContentMargin />
      <FooterButton />
      <InputFieldMargin />
    </div>
  );
}

function BackgroundImagesForDecorativeFeelIfNeeded() {
  return (
    <div className="absolute h-[884px] left-px opacity-5 overflow-clip top-[-8px] w-[390px]" data-name="Background Images for decorative feel if needed">
      <div className="absolute border-8 border-[#0f172a] border-solid left-[-40px] rounded-[9999px] size-[160px] top-[80px]" data-name="Border" />
      <div className="absolute border-4 border-[#0f172a] border-solid bottom-[160px] right-[-80px] rounded-[9999px] size-[320px]" data-name="Border" />
      <div className="-translate-y-1/2 absolute flex items-center justify-center left-[94.19px] size-[22.627px] top-[calc(50%+8px)]" style={{ "--transform-inner-width": "1186", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-45">
          <div className="bg-[#0f172a] size-[16px]" data-name="Background" />
        </div>
      </div>
      <div className="absolute flex items-center justify-center right-[95.26px] size-[28.465px] top-[292.42px]" style={{ "--transform-inner-width": "1186", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-12">
          <div className="border-2 border-[#0f172a] border-solid rounded-[2px] size-[24px]" data-name="Border" />
        </div>
      </div>
    </div>
  );
}

export default function HistoryAliveEmailInputScreen() {
  return (
    <div className="content-stretch flex items-start justify-center relative size-full" data-name="History Alive Email Input Screen">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute bg-[#f5f5dc] inset-0" />
        <div className="absolute inset-0 overflow-hidden">
          <img alt="" className="absolute h-full left-0 max-w-none top-0 w-[226.67%]" src={imgHistoryAliveEmailInputScreen} />
        </div>
      </div>
      <Container />
      <BackgroundImagesForDecorativeFeelIfNeeded />
    </div>
  );
}