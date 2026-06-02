import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';

interface MobileAgeSelectionScreenProps {
  onBack?: () => void;
  onContinue?: (age: string) => void;
}

const ageOptions = [
  { value: '6-10', label: '6 – 10 tuổi', emoji: '👶', description: 'Tiểu học' },
  { value: '11-14', label: '11 – 14 tuổi', emoji: '🧒', description: 'THCS' },
  { value: '15-18', label: '15 – 18 tuổi', emoji: '👦', description: 'THPT' },
  { value: '18+', label: 'Trên 18 tuổi', emoji: '🎓', description: 'Đại học & Người lớn' },
];

export function MobileAgeSelectionScreen({
  onBack,
  onContinue,
}: MobileAgeSelectionScreenProps) {
  const [selectedAge, setSelectedAge] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedAge) {
      onContinue?.(selectedAge);
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
            style={{ width: '16.67%' }}
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <p className="text-sm font-semibold text-[#FCCF03] uppercase tracking-wider mb-2">
            Bước 1/6
          </p>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
            Bạn bao nhiêu tuổi?
          </h1>
          <p className="text-sm text-[#64748b] mt-2">
            Chúng tôi sẽ tùy chỉnh nội dung phù hợp với độ tuổi của bạn
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="space-y-3">
          {ageOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedAge(option.value)}
              className={`
                w-full p-5 rounded-[16px] border-2 transition-all
                ${
                  selectedAge === option.value
                    ? 'bg-[#FCCF03] border-[#e5b800] shadow-[0_4px_0_0_#e5b800] -translate-y-[2px]'
                    : 'bg-white border-[#e5e7eb] hover:border-[#FCCF03] hover:shadow-md'
                }
              `}
            >
              <div className="flex items-center gap-4">
                {/* Emoji Icon */}
                <div
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0
                    ${selectedAge === option.value ? 'bg-white' : 'bg-[#f5f5dc]'}
                  `}
                >
                  {option.emoji}
                </div>

                {/* Text Content */}
                <div className="flex-1 text-left">
                  <h3
                    className={`
                      text-[17px] font-bold
                      ${selectedAge === option.value ? 'text-[#0f172a]' : 'text-[#0f172a]'}
                    `}
                  >
                    {option.label}
                  </h3>
                  <p
                    className={`
                      text-sm mt-0.5
                      ${selectedAge === option.value ? 'text-[#0f172a]/70' : 'text-[#64748b]'}
                    `}
                  >
                    {option.description}
                  </p>
                </div>

                {/* Check Icon */}
                <div
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all
                    ${
                      selectedAge === option.value
                        ? 'bg-[#0f172a] scale-100'
                        : 'bg-transparent border-2 border-[#cbd5e1] scale-90'
                    }
                  `}
                >
                  {selectedAge === option.value && (
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="px-5 pb-8 pt-4 bg-gradient-to-t from-[#f5f5dc] via-[#f5f5dc] to-transparent">
        <button
          onClick={handleContinue}
          disabled={!selectedAge}
          className={`
            w-full h-[56px] rounded-[14px] font-bold text-[16px] uppercase tracking-wide transition-all
            ${
              selectedAge
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