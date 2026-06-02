import { useState } from 'react';
import { ArrowLeft, Check, Globe } from 'lucide-react';

interface MobileSubjectSelectionScreenProps {
  onBack?: () => void;
  onContinue?: (subjects: string[]) => void;
}

// Vietnam Flag SVG Component
const VietnamFlag = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="32" fill="#DA251D"/>
    <path d="M32 16L36.12 27.88L48 32L36.12 36.12L32 48L27.88 36.12L16 32L27.88 27.88L32 16Z" fill="#FFCD00"/>
  </svg>
);

// World Globe SVG Component
const WorldGlobe = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="32" fill="#3B82F6"/>
    <circle cx="32" cy="32" r="24" stroke="white" strokeWidth="3" fill="none"/>
    <ellipse cx="32" cy="32" rx="12" ry="24" stroke="white" strokeWidth="3" fill="none"/>
    <line x1="8" y1="32" x2="56" y2="32" stroke="white" strokeWidth="3"/>
    <line x1="32" y1="8" x2="32" y2="56" stroke="white" strokeWidth="3"/>
  </svg>
);

const subjectOptions = [
  { 
    value: 'vietnam-history', 
    label: 'Lịch sử Việt Nam', 
    icon: 'vietnam-flag',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50'
  },
  { 
    value: 'world-history', 
    label: 'Lịch sử Thế giới', 
    icon: 'globe',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50'
  },
];

export function MobileSubjectSelectionScreen({
  onBack,
  onContinue,
}: MobileSubjectSelectionScreenProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const handleSubjectSelect = (value: string) => {
    setSelectedSubject(value);
  };

  const handleContinue = () => {
    if (selectedSubject) {
      onContinue?.([selectedSubject]);
    }
  };

  return (
    <div className="relative w-[393px] h-[852px] bg-[#f5f5dc] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="relative pt-16 pb-6 px-5">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-16 left-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/50 hover:bg-white/80 transition-colors"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 text-[#0f172a]" />
        </button>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-[#FCCF03] rounded-full transition-all duration-300"
            style={{ width: '66.67%' }}
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <p className="text-sm font-semibold text-[#FCCF03] uppercase tracking-wider mb-2">
            Bước 4/6
          </p>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
            Bạn muốn học gì?
          </h1>
          <p className="text-sm text-[#64748b] mt-2">
            Chọn chủ đề lịch sử bạn quan tâm
          </p>
        </div>
      </div>

      {/* Content - Single Column Layout */}
      <div className="flex-1 px-5 pb-6 flex flex-col justify-center">
        <div className="space-y-4">
          {subjectOptions.map((option) => {
            const isSelected = selectedSubject === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => handleSubjectSelect(option.value)}
                className={`
                  relative w-full p-6 rounded-[20px] border-3 transition-all flex items-center gap-5
                  ${ 
                    isSelected
                      ? 'bg-[#FCCF03] border-[#e5b800] shadow-[0_6px_0_0_#e5b800] -translate-y-[2px]'
                      : 'bg-white border-[#e5e7eb] hover:border-[#FCCF03] hover:shadow-lg active:scale-[0.98]'
                  }
                `}
              >
                {/* Icon Container */}
                <div
                  className={`
                    shrink-0 w-20 h-20 rounded-full flex items-center justify-center transition-all
                    ${isSelected ? 'bg-white scale-105' : 'bg-[#f5f5dc]'}
                  `}
                >
                  <div className="scale-75">
                    {option.icon === 'vietnam-flag' ? <VietnamFlag /> : <WorldGlobe />}
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 text-left">
                  <h3
                    className={`
                      text-lg font-extrabold leading-tight mb-1
                      ${isSelected ? 'text-[#0f172a]' : 'text-[#0f172a]'}
                    `}
                  >
                    {option.label}
                  </h3>
                  <p className={`text-sm ${isSelected ? 'text-[#0f172a]/70' : 'text-[#64748b]'}`}>
                    {option.value === 'vietnam-history' 
                      ? 'Khám phá lịch sử dân tộc Việt Nam'
                      : 'Tìm hiểu các sự kiện lịch sử thế giới'}
                  </p>
                </div>

                {/* Check Icon */}
                <div
                  className={`
                    shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all
                    ${
                      isSelected
                        ? 'bg-[#0f172a] scale-100'
                        : 'bg-transparent border-2 border-[#cbd5e1] scale-90 opacity-50'
                    }
                  `}
                >
                  {isSelected && (
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="px-5 pb-8 pt-4 bg-gradient-to-t from-[#f5f5dc] via-[#f5f5dc] to-transparent">
        <button
          onClick={handleContinue}
          disabled={!selectedSubject}
          className={`
            w-full h-[56px] rounded-[14px] font-bold text-[16px] uppercase tracking-wide transition-all
            ${
              selectedSubject
                ? 'bg-[#FCCF03] border-2 border-[#e5b800] text-[#0f172a] shadow-[0_4px_0_0_#e5b800] active:shadow-[0_2px_0_0_#e5b800] active:translate-y-[2px] hover:bg-[#ffd633]'
                : 'bg-[#e5e7eb] border-2 border-[#cbd5e1] text-[#94a3b8] cursor-not-allowed'
            }
          `}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}