import svgPaths from "./svg-x5b48o7o3b";

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[3.052px] pt-[7.187px] relative" data-name="Container">
      <div className="flex flex-col font-['Material_Symbols_Outlined:Thin',sans-serif] h-[150px] justify-center leading-[0] not-italic relative shrink-0 text-[150px] text-black w-[147.646px]">
        <p className="leading-[150px]">temple_buddhist</p>
      </div>
    </div>
  );
}

function DecorativeElementsOptionalAesthetic() {
  return (
    <div className="absolute h-[884px] left-0 opacity-5 overflow-clip top-0 w-[390px]" data-name="Decorative Elements (Optional aesthetic)">
      <div className="absolute flex h-[110.904px] items-center justify-center left-[34.35px] top-[44.55px] w-[126.308px]" style={{ "--transform-inner-width": "1186", "--transform-inner-height": "973" } as React.CSSProperties}>
        <div className="-rotate-12 flex-none">
          <div className="h-[90px] relative w-[110px]" data-name="Icon">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 110 90">
              <path d={svgPaths.p8655c80} fill="var(--fill-0, black)" id="Icon" />
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute bottom-[58.87px] flex h-[185.084px] items-center justify-center right-[-14.63px] w-[180.086px]" style={{ "--transform-inner-width": "1186", "--transform-inner-height": "18" } as React.CSSProperties}>
        <div className="flex-none rotate-12">
          <Container />
        </div>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0 size-[22.125px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.125 22.125">
        <g id="Container">
          <path d={svgPaths.p161c2180} fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-[-8px] p-[8px] top-0" data-name="Button">
      <Container2 />
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="h-[52px] relative shrink-0 w-[38px]" data-name="Button:margin">
      <Button />
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#fccf03] flex-[1_0_0] min-h-px min-w-px relative rounded-[9999px] w-[37.11px]" data-name="Background">
      <div className="absolute bg-[rgba(255,255,255,0.3)] inset-[0_0_66.69%_0] rounded-[9999px]" data-name="Overlay" />
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-[#e2e8f0] content-stretch flex flex-col h-[16px] items-start justify-center overflow-clip relative rounded-[9999px] shrink-0 w-full" data-name="Background+Shadow">
      <Background />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_0px_0px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Container3() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[16px] relative w-full">
        <BackgroundShadow />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pr-[40px] relative w-full">
          <ButtonMargin />
          <Container3 />
        </div>
      </div>
    </div>
  );
}

function HeaderTopAppBarProgress() {
  return (
    <div className="relative shrink-0 w-full" data-name="Header - Top App Bar & Progress">
      <div className="content-stretch flex flex-col items-start pb-[32px] pt-[24px] px-[24px] relative w-full">
        <Container1 />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[36px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[30px] text-center tracking-[-0.75px] w-[287.98px]">
        <p className="leading-[36px]">Bạn bao nhiêu tuổi?</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] h-[48px] justify-center leading-[24px] not-italic relative shrink-0 text-[#475569] text-[16px] text-center w-[342px]">
        <p className="mb-0">Chọn độ tuổi để chúng tôi điều chỉnh nội</p>
        <p>dung lịch sử phù hợp nhất với bạn.</p>
      </div>
    </div>
  );
}

function TitleSection() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Title Section">
      <Heading />
      <Container4 />
    </div>
  );
}

function TitleSectionMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[32px] pt-[16px] relative shrink-0 w-full" data-name="Title Section:margin">
      <TitleSection />
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0 size-[27px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 27">
        <g id="Container">
          <path d={svgPaths.p1e401f00} fill="var(--fill-0, #FCCF03)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(252,207,3,0.1)] content-stretch flex items-center justify-center relative rounded-[32px] shrink-0 size-[56px]" data-name="Overlay">
      <Container5 />
    </div>
  );
}

function Margin() {
  return (
    <div className="h-[56px] relative shrink-0 w-[72px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pr-[16px] relative size-full">
        <Overlay />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[18px] w-[94.77px]">
        <p className="leading-[28px]">6 – 10 tuổi</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[14px] tracking-[0.7px] uppercase w-[77.61px]">
        <p className="leading-[20px]">Thiếu nhi</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0 w-[94.77px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container7 />
        <Container8 />
      </div>
    </div>
  );
}

function ButtonCard1() {
  return (
    <div className="bg-white relative rounded-[24px] shrink-0 w-full" data-name="Button - Card 1: 6-10">
      <div aria-hidden="true" className="absolute border-2 border-[#e7e4da] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_4px_0px_0px_#e7e4da]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[18px] relative w-full">
          <Margin />
          <Container6 />
        </div>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[24px] relative shrink-0 w-[9px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 24">
        <g id="Container">
          <path d={svgPaths.p22da4480} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow1() {
  return (
    <div className="bg-[#fccf03] content-stretch flex items-center justify-center relative rounded-[32px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[56px]" data-name="Background+Shadow">
      <Container9 />
    </div>
  );
}

function Margin1() {
  return (
    <div className="h-[56px] relative shrink-0 w-[72px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pr-[16px] relative size-full">
        <BackgroundShadow1 />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[18px] w-[98.38px]">
        <p className="leading-[28px]">11 – 14 tuổi</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#334155] text-[14px] tracking-[0.7px] uppercase w-[87.59px]">
        <p className="leading-[20px]">Thiếu niên</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0 w-[98.38px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container11 />
        <Container12 />
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="relative shrink-0 size-[25px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
        <g id="Container">
          <path d={svgPaths.p340d3e80} fill="var(--fill-0, #FCCF03)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin2() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-[30px] relative" data-name="Margin">
      <div className="flex flex-col items-end min-w-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-end min-w-[inherit] pl-[105.625px] relative w-full">
          <Container13 />
        </div>
      </div>
    </div>
  );
}

function ButtonCard21114SelectedState() {
  return (
    <div className="bg-[rgba(252,207,3,0.1)] relative rounded-[24px] shrink-0 w-full" data-name="Button - Card 2: 11-14 (Selected State)">
      <div aria-hidden="true" className="absolute border-2 border-[#fccf03] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_4px_0px_0px_#fccf03]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[18px] relative w-full">
          <Margin1 />
          <Container10 />
          <Margin2 />
        </div>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="relative shrink-0 size-[30px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="Container">
          <path d={svgPaths.p10ba2380} fill="var(--fill-0, #FCCF03)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(252,207,3,0.1)] content-stretch flex items-center justify-center relative rounded-[32px] shrink-0 size-[56px]" data-name="Overlay">
      <Container14 />
    </div>
  );
}

function Margin3() {
  return (
    <div className="h-[56px] relative shrink-0 w-[72px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pr-[16px] relative size-full">
        <Overlay1 />
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[18px] w-[101.95px]">
        <p className="leading-[28px]">15 – 18 tuổi</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[14px] tracking-[0.7px] uppercase w-[95.66px]">
        <p className="leading-[20px]">Thanh niên</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="relative shrink-0 w-[101.95px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container16 />
        <Container17 />
      </div>
    </div>
  );
}

function ButtonCard2() {
  return (
    <div className="bg-white relative rounded-[24px] shrink-0 w-full" data-name="Button - Card 3: 15-18">
      <div aria-hidden="true" className="absolute border-2 border-[#e7e4da] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_4px_0px_0px_#e7e4da]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[18px] relative w-full">
          <Margin3 />
          <Container15 />
        </div>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[27px] relative shrink-0 w-[33px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33 27">
        <g id="Container">
          <path d={svgPaths.p37da1dc0} fill="var(--fill-0, #FCCF03)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay2() {
  return (
    <div className="bg-[rgba(252,207,3,0.1)] content-stretch flex items-center justify-center relative rounded-[32px] shrink-0 size-[56px]" data-name="Overlay">
      <Container18 />
    </div>
  );
}

function Margin4() {
  return (
    <div className="h-[56px] relative shrink-0 w-[72px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pr-[16px] relative size-full">
        <Overlay2 />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[18px] w-[105.94px]">
        <p className="leading-[28px]">Trên 18 tuổi</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[14px] tracking-[0.7px] uppercase w-[182.02px]">
        <p className="leading-[20px]">Sinh viên / Người lớn</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="relative shrink-0 w-[182.02px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Container20 />
        <Container21 />
      </div>
    </div>
  );
}

function ButtonCard() {
  return (
    <div className="bg-white relative rounded-[24px] shrink-0 w-full" data-name="Button - Card 4: 18">
      <div aria-hidden="true" className="absolute border-2 border-[#e7e4da] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_4px_0px_0px_#e7e4da]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[18px] relative w-full">
          <Margin4 />
          <Container19 />
        </div>
      </div>
    </div>
  );
}

function AgeCardsGrid() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start max-w-[448px] relative shrink-0 w-full" data-name="Age Cards Grid">
      <ButtonCard1 />
      <ButtonCard21114SelectedState />
      <ButtonCard2 />
      <ButtonCard />
    </div>
  );
}

function Main() {
  return (
    <div className="relative shrink-0 w-full" data-name="Main">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center pb-[92px] px-[24px] relative w-full">
          <TitleSectionMargin />
          <AgeCardsGrid />
        </div>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#fccf03] content-stretch flex h-[64px] items-center justify-center pb-[18.5px] pt-[17.5px] relative rounded-[32px] shadow-[0px_6px_0px_0px_#c49a02] shrink-0 w-full" data-name="Button">
      <div className="flex flex-col font-['Be_Vietnam_Pro:Extra_Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[20px] text-center tracking-[2px] uppercase w-[111.91px]">
        <p className="leading-[28px]">Tiếp tục</p>
      </div>
    </div>
  );
}

function FooterAction() {
  return (
    <div className="max-w-[448px] relative shrink-0 w-full" data-name="Footer Action">
      <div className="content-stretch flex flex-col items-start max-w-[inherit] pb-[40px] pt-[24px] px-[24px] relative w-full">
        <Button1 />
      </div>
    </div>
  );
}

export default function HistoryAliveAgeSelectionScreen() {
  return (
    <div className="bg-[#f5f5dc] content-stretch flex flex-col items-start relative size-full" data-name="History Alive Age Selection Screen">
      <DecorativeElementsOptionalAesthetic />
      <HeaderTopAppBarProgress />
      <Main />
      <FooterAction />
    </div>
  );
}