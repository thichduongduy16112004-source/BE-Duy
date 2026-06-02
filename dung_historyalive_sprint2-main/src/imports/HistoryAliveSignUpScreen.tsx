import svgPaths from "./svg-kukvdko0d6";
import imgGoogleLogo from "figma:asset/10d10f63a6df806ceb624fec993f394d723e8045.png";

function Container1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Container">
          <path d={svgPaths.p21bb7900} fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Container">
      <Container1 />
    </div>
  );
}

function Heading() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Heading 2">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center pr-[40px] relative w-full">
          <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[30px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[24px] text-center tracking-[-0.6px] w-[161.67px]">
            <p className="leading-[30px]">Tạo tài khoản</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopNavigation() {
  return (
    <div className="relative shrink-0 w-full" data-name="Top Navigation">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[8px] pt-[24px] px-[24px] relative w-full">
          <Container />
          <Heading />
        </div>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Google Logo">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgGoogleLogo} />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#334155] text-[18px] text-center tracking-[0.45px] w-[185.48px]">
        <p className="leading-[28px]">Tiếp tục với Google</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative">
        <GoogleLogo />
        <Container4 />
      </div>
    </div>
  );
}

function GoogleButtonTactileWithThickBottomBorder() {
  return (
    <div className="bg-white h-[56px] min-w-[84px] relative rounded-[24px] shrink-0" data-name="Google Button: Tactile with thick bottom border">
      <div className="content-stretch flex h-full items-center justify-center min-w-[inherit] overflow-clip pb-[4px] pl-[60.25px] pr-[60.27px] pt-[2px] relative rounded-[inherit]">
        <Container3 />
      </div>
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-b-4 border-l-2 border-r-2 border-solid border-t-2 inset-0 pointer-events-none rounded-[24px]" />
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_0_725)" id="SVG">
          <path d={svgPaths.p3db23880} fill="var(--fill-0, white)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_0_725">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-center text-white tracking-[0.45px] w-[211.56px]">
        <p className="leading-[28px]">Tiếp tục với Facebook</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative">
        <Svg />
        <Container6 />
      </div>
    </div>
  );
}

function FacebookButtonTactileBlueWithThickBottomBorder() {
  return (
    <div className="bg-[#1877f2] h-[56px] min-w-[84px] relative rounded-[24px] shrink-0" data-name="Facebook Button: Tactile blue with thick bottom border">
      <div className="content-stretch flex h-full items-center justify-center min-w-[inherit] overflow-clip pb-[4px] px-[47.22px] relative rounded-[inherit]">
        <Container5 />
      </div>
      <div aria-hidden="true" className="absolute border-[#1259b5] border-b-4 border-solid inset-0 pointer-events-none rounded-[24px]" />
    </div>
  );
}

function SocialButtonsSection() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Social Buttons Section">
      <GoogleButtonTactileWithThickBottomBorder />
      <FacebookButtonTactileBlueWithThickBottomBorder />
    </div>
  );
}

function SocialButtonsSectionMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[32px] relative shrink-0 w-full" data-name="Social Buttons Section:margin">
      <SocialButtonsSection />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start px-[16px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[14px] tracking-[1.4px] uppercase w-[214px]">
        <p className="leading-[20px]">hoặc tự tạo tài khoản</p>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-full" data-name="Divider">
      <div className="flex-[1_0_0] h-[2px] min-h-px min-w-px relative" data-name="Horizontal Divider">
        <div aria-hidden="true" className="absolute border-[#e2e8f0] border-solid border-t-2 inset-0 pointer-events-none" />
      </div>
      <Margin />
      <div className="flex-[1_0_0] h-[2px] min-h-px min-w-px relative" data-name="Horizontal Divider">
        <div aria-hidden="true" className="absolute border-[#e2e8f0] border-solid border-t-2 inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Label">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1e293b] text-[16px] w-full">
        <p className="leading-[24px]">Tên tài khoản</p>
      </div>
    </div>
  );
}

function LabelMargin() {
  return (
    <div className="relative shrink-0 w-full" data-name="Label:margin">
      <div className="content-stretch flex flex-col items-start pl-[4px] relative w-full">
        <Label />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[16px] w-full">
          <p className="leading-[normal]">Nhập tên tài khoản</p>
        </div>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-white flex-[1_0_0] h-[64px] min-h-px min-w-px relative rounded-[24px]" data-name="Input">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pl-[50px] pr-[18px] py-[22px] relative size-full">
          <Container7 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[24px]" />
    </div>
  );
}

function OverlayShadow() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-name="Overlay+Shadow">
      <Input />
      <div className="absolute left-[20px] size-[16px] top-[24px]" data-name="Icon">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <path d={svgPaths.p85bff00} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Username() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Username">
      <LabelMargin />
      <OverlayShadow />
    </div>
  );
}

function Label1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Label">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1e293b] text-[16px] w-full">
        <p className="leading-[24px]">Mật khẩu</p>
      </div>
    </div>
  );
}

function LabelMargin1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Label:margin">
      <div className="content-stretch flex flex-col items-start pl-[4px] relative w-full">
        <Label1 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[16px] w-full">
          <p className="leading-[normal]">Nhập mật khẩu</p>
        </div>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-white flex-[1_0_0] h-[64px] min-h-px min-w-px relative rounded-[24px]" data-name="Input">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-[50px] py-[22px] relative size-full">
          <Container8 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[24px]" />
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute h-[15px] right-[16px] top-[20px] w-[22px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
        <g id="Container">
          <path d={svgPaths.p3e801e80} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayShadow1() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-name="Overlay+Shadow">
      <Input1 />
      <div className="absolute h-[21px] left-[20px] top-[21px] w-[16px]" data-name="Icon">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 21">
          <path d={svgPaths.p12930f00} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </svg>
      </div>
      <Container9 />
    </div>
  );
}

function Password() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Password">
      <LabelMargin1 />
      <OverlayShadow1 />
    </div>
  );
}

function Label2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Label">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1e293b] text-[16px] w-full">
        <p className="leading-[24px]">Xác nhận mật khẩu</p>
      </div>
    </div>
  );
}

function LabelMargin2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Label:margin">
      <div className="content-stretch flex flex-col items-start pl-[4px] relative w-full">
        <Label2 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[16px] w-full">
          <p className="leading-[normal]">Xác nhận mật khẩu</p>
        </div>
      </div>
    </div>
  );
}

function Input2() {
  return (
    <div className="bg-white flex-[1_0_0] h-[64px] min-h-px min-w-px relative rounded-[24px]" data-name="Input">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pl-[50px] pr-[18px] py-[22px] relative size-full">
          <Container10 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[24px]" />
    </div>
  );
}

function OverlayShadow2() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-name="Overlay+Shadow">
      <Input2 />
      <div className="absolute left-[18px] size-[20px] top-[22px]" data-name="Icon">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          <path d={svgPaths.pfd03b40} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function ConfirmPassword() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Confirm Password">
      <LabelMargin2 />
      <OverlayShadow2 />
    </div>
  );
}

function RegistrationForm() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full" data-name="Registration Form">
      <Username />
      <Password />
      <ConfirmPassword />
    </div>
  );
}

function RegistrationFormMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[16px] relative shrink-0 w-full" data-name="Registration Form:margin">
      <RegistrationForm />
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-center relative">
        <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[20px] text-center tracking-[1px] uppercase w-[102.28px]">
          <p className="leading-[28px]">Đăng ký</p>
        </div>
      </div>
    </div>
  );
}

function SubmitButtonSectionButton() {
  return (
    <div className="bg-[#fccf03] h-[64px] relative rounded-[24px] shrink-0 w-full" data-name="Submit Button Section → Button">
      <div className="content-stretch flex items-center justify-center overflow-clip pb-[21.5px] pt-[14.5px] relative rounded-[inherit] size-full">
        <div className="absolute bg-gradient-to-t from-[rgba(255,255,255,0)] inset-[0_0_6px_0] opacity-50 to-[rgba(255,255,255,0.2)]" data-name="Gradient" />
        <Container11 />
      </div>
      <div aria-hidden="true" className="absolute border-[#d48c00] border-b-6 border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_10px_15px_-3px_rgba(252,207,3,0.2),0px_4px_6px_-4px_rgba(252,207,3,0.2)]" />
    </div>
  );
}

function SubmitButtonSectionMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[32px] pt-[48px] relative shrink-0 w-full" data-name="Submit Button Section:margin">
      <SubmitButtonSectionButton />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[18px] text-center w-[256.44px]">
        <p>
          <span className="leading-[28px]">{`Đã có tài khoản? `}</span>
          <span className="font-['Be_Vietnam_Pro:Bold',sans-serif] leading-[28px] not-italic text-[#e5bc00]">Đăng nhập</span>
        </p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[40px] relative shrink-0 w-full" data-name="Footer">
      <Container12 />
    </div>
  );
}

function FooterMargin() {
  return (
    <div className="flex-[1_0_0] min-h-[68px] min-w-px relative w-full" data-name="Footer:margin">
      <div className="flex flex-col justify-end min-h-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start justify-end min-h-[inherit] pt-[20px] relative size-full">
          <Footer />
        </div>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[812px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start justify-between pt-[24px] px-[24px] relative size-full">
        <SocialButtonsSectionMargin />
        <Divider />
        <RegistrationFormMargin />
        <SubmitButtonSectionMargin />
        <FooterMargin />
      </div>
    </div>
  );
}

export default function HistoryAliveSignUpScreen() {
  return (
    <div className="bg-[#f5f5dc] content-stretch flex flex-col items-start relative size-full" data-name="History Alive Sign Up Screen">
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" data-name="Overlay+Shadow" />
      <TopNavigation />
      <Container2 />
      <div className="absolute bg-[rgba(252,207,3,0.1)] blur-[32px] bottom-[-40px] right-[-40px] rounded-[9999px] size-[160px]" data-name="Decorative Ancient Vietnamese Elements (Abstract)" />
      <div className="absolute bg-[rgba(252,207,3,0.05)] blur-[20px] left-[-40px] rounded-[9999px] size-[128px] top-[80px]" data-name="Overlay+Blur" />
    </div>
  );
}