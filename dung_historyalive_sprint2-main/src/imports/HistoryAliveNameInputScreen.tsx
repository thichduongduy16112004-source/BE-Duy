import svgPaths from "./svg-op7wawsz9l";
import imgImage from "figma:asset/678c40d7b0d9739f9a95345e3a5a2e4c6d961bf3.png";

function Container1() {
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
    <div className="content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button">
      <Container1 />
    </div>
  );
}

function OverlayBorderShadow() {
  return (
    <div className="bg-[rgba(255,255,255,0.5)] flex-[1_0_0] h-[16px] min-h-px min-w-px relative rounded-[9999px]" data-name="Overlay+Border+Shadow">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute bg-[#fbce04] inset-[2px_66.73%_2px_0.81%] rounded-[9999px]" data-name="Background" />
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_2px_rgba(0,0,0,0.1)]" />
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[9999px]" />
    </div>
  );
}

function Container2() {
  return <div className="h-[20px] shrink-0 w-[22.86px]" data-name="Container" />;
}

function Container() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Container">
      <Button />
      <OverlayBorderShadow />
      <Container2 />
    </div>
  );
}

function HeaderProgressBar() {
  return (
    <div className="relative shrink-0 w-full" data-name="Header & Progress Bar">
      <div className="content-stretch flex flex-col items-start pb-[24px] pt-[32px] px-[24px] relative w-full">
        <Container />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Heading 1">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[35px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[28px] text-center w-[253.64px]">
        <p className="leading-[35px]">Tên của bạn là gì?</p>
      </div>
    </div>
  );
}

function Heading1Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[68.17px] pb-[8px] top-[232px]" data-name="Heading 1:margin">
      <Heading />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-center pl-[29.52px] pr-[29.53px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Regular',sans-serif] h-[48px] justify-center leading-[24px] not-italic relative shrink-0 text-[#475569] text-[16px] text-center w-[300px]">
        <p className="mb-0">Đây sẽ là tên hiển thị trong ứng dụng</p>
        <p>của bạn</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] pb-[32px] top-[275px]" data-name="Margin">
      <Container3 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 size-[192px]" data-name="Container">
      <div className="absolute bg-[rgba(251,206,4,0.2)] inset-0 rounded-[9999px]" data-name="Overlay" />
      <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Image">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgImage} />
        </div>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[216px] items-start left-[99px] pb-[24px] top-[16px] w-[192px]" data-name="Margin">
      <Container4 />
    </div>
  );
}

function AvatarHeroSection() {
  return (
    <div className="h-[371px] relative shrink-0 w-full" data-name="Avatar Hero Section">
      <Heading1Margin />
      <Margin />
      <Margin1 />
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Label">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] tracking-[0.7px] uppercase w-full">
        <p className="leading-[20px]">Họ</p>
      </div>
    </div>
  );
}

function LabelMargin() {
  return (
    <div className="relative shrink-0 w-full" data-name="Label:margin">
      <div className="content-stretch flex flex-col items-start pl-[8px] relative w-full">
        <Label />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[18px] w-full">
          <p className="leading-[normal]">Nhập họ</p>
        </div>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-white h-[64px] relative rounded-[24px] shrink-0 w-full" data-name="Input">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-[26px] py-[20.5px] relative size-full">
          <Container6 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_4px_10px_-2px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <LabelMargin />
      <Input />
    </div>
  );
}

function Label1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Label">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] tracking-[0.7px] uppercase w-full">
        <p className="leading-[20px]">Tên</p>
      </div>
    </div>
  );
}

function LabelMargin1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Label:margin">
      <div className="content-stretch flex flex-col items-start pl-[8px] relative w-full">
        <Label1 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[18px] w-full">
          <p className="leading-[normal]">Nhập tên</p>
        </div>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-white h-[64px] relative rounded-[24px] shrink-0 w-full" data-name="Input">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-[26px] py-[20.5px] relative size-full">
          <Container8 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_4px_10px_-2px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <LabelMargin1 />
      <Input1 />
    </div>
  );
}

function FormInputs() {
  return (
    <div className="relative shrink-0 w-full" data-name="Form Inputs">
      <div className="content-stretch flex flex-col gap-[24px] items-start pb-[96px] px-[24px] relative w-full">
        <Container5 />
        <Container7 />
      </div>
    </div>
  );
}

function Container9() {
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

function Button1() {
  return (
    <div className="bg-[#fbce04] content-stretch flex gap-[8px] h-[64px] items-center justify-center pb-[18.5px] pt-[17.5px] relative rounded-[9999px] shadow-[0px_6px_0px_0px_#b38600] shrink-0 w-full" data-name="Button">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[20px] text-center w-[83.33px]">
        <p className="leading-[28px]">Tiếp tục</p>
      </div>
      <Container9 />
    </div>
  );
}

function StickyFooterButton() {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(245,245,220,0.8)] bottom-0 content-stretch flex flex-col items-start left-0 max-w-[430px] p-[24px] right-0" data-name="Sticky Footer Button">
      <Button1 />
    </div>
  );
}

function Background() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[430px] min-h-[884px] overflow-clip pb-[113px] relative shrink-0 w-full" data-name="Background" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 402 884\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(52.114 0 0 114.6 -16549 -36391)\\'><stop stop-color=\\'rgba(217,179,3,0.1)\\' offset=\\'0.016071\\'/><stop stop-color=\\'rgba(217,179,3,0)\\' offset=\\'0.016071\\'/></radialGradient></defs></svg>')" }}>
      <HeaderProgressBar />
      <AvatarHeroSection />
      <FormInputs />
      <StickyFooterButton />
    </div>
  );
}

export default function HistoryAliveNameInputScreen() {
  return (
    <div className="bg-[#f5f5dc] content-stretch flex flex-col items-start relative size-full" data-name="History Alive Name Input Screen">
      <Background />
    </div>
  );
}