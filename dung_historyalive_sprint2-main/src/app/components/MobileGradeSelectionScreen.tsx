import { useState } from 'react';
import { ArrowLeft, Check, GraduationCap } from 'lucide-react';

interface MobileGradeSelectionScreenProps {
  onBack?: () => void;
  onContinue?: (grade: string) => void;
}

const gradeOptions = [
  { value: 'grade-6', label: 'Lớp 6', level: 'THCS', color: 'from-blue-400 to-blue-500' },
  { value: 'grade-7', label: 'Lớp 7', level: 'THCS', color: 'from-blue-500 to-blue-600' },
  { value: 'grade-8', label: 'Lớp 8', level: 'THCS', color: 'from-indigo-500 to-indigo-600' },
  { value: 'grade-9', label: 'Lớp 9', level: 'THCS', color: 'from-indigo-600 to-indigo-700' },
  { value: 'grade-10', label: 'Lớp 10', level: 'THPT', color: 'from-purple-500 to-purple-600' },
  { value: 'grade-11', label: 'Lớp 11', level: 'THPT', color: 'from-purple-600 to-purple-700' },
  { value: 'grade-12', label: 'Lớp 12', level: 'THPT', color: 'from-violet-600 to-violet-700' },
];

export function MobileGradeSelectionScreen({
  onBack,
  onContinue,
}: MobileGradeSelectionScreenProps) {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedGrade) {
      onContinue?.(selectedGrade);
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
            style={{ width: '83.33%' }}
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <p className="text-sm font-semibold text-[#FCCF03] uppercase tracking-wider mb-2">
            Bước 5/6
          </p>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
            Bạn đang học lớp nào?
          </h1>
          <p className="text-sm text-[#64748b] mt-2">
            Giúp chúng tôi đề xuất nội dung phù hợp với cấp độ của bạn
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="space-y-3">
          {gradeOptions.map((option) => {
            const isSelected = selectedGrade === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => setSelectedGrade(option.value)}
                className={`
                  w-full p-4 rounded-[16px] border-2 transition-all
                  ${
                    isSelected
                      ? 'bg-[#FCCF03] border-[#e5b800] shadow-[0_4px_0_0_#e5b800] -translate-y-[2px]'
                      : 'bg-white border-[#e5e7eb] hover:border-[#FCCF03] hover:shadow-md'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br ${option.color}
                    `}
                  >
                    <GraduationCap className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 text-left">
                    <h3
                      className={`
                        text-[17px] font-bold
                        ${isSelected ? 'text-[#0f172a]' : 'text-[#0f172a]'}
                      `}
                    >
                      {option.label}
                    </h3>
                    <p
                      className={`
                        text-sm mt-0.5
                        ${isSelected ? 'text-[#0f172a]/70' : 'text-[#64748b]'}
                      `}
                    >
                      {option.level}
                    </p>
                  </div>

                  {/* Check Icon */}
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all
                      ${
                        isSelected
                          ? 'bg-[#0f172a] scale-100'
                          : 'bg-transparent border-2 border-[#cbd5e1] scale-90'
                      }
                    `}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    )}
                  </div>
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
          disabled={!selectedGrade}
          className={`
            w-full h-[56px] rounded-[14px] font-bold text-[16px] uppercase tracking-wide transition-all
            ${
              selectedGrade
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