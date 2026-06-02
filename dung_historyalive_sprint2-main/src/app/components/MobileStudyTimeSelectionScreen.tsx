import { useState } from 'react';
import { ArrowLeft, Check, Clock, Sparkles } from 'lucide-react';

interface MobileStudyTimeSelectionScreenProps {
  onBack?: () => void;
  onComplete?: (studyTime: number) => void;
}

const timeOptions = [
  { value: 5, label: '5 phút/ngày', emoji: '⚡', description: 'Học nhanh', badge: 'Cơ bản' },
  { value: 15, label: '15 phút/ngày', emoji: '🎯', description: 'Cân bằng', badge: 'Phổ biến', recommended: true },
  { value: 20, label: '20 phút/ngày', emoji: '🚀', description: 'Tích cực', badge: 'Nâng cao' },
];

export function MobileStudyTimeSelectionScreen({
  onBack,
  onComplete,
}: MobileStudyTimeSelectionScreenProps) {
  const [selectedTime, setSelectedTime] = useState<number>(15);
  const [customTime, setCustomTime] = useState<number>(15);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = () => {
    setIsCompleting(true);
    setTimeout(() => {
      onComplete?.(customTime);
    }, 800);
  };

  const handleQuickSelect = (value: number) => {
    setSelectedTime(value);
    setCustomTime(value);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setCustomTime(value);
    const closest = timeOptions.reduce((prev, curr) =>
      Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev
    );
    setSelectedTime(closest.value);
  };

  const fillPercent = ((customTime - 5) / 55) * 100;

  return (
    <div className="relative w-[393px] h-[852px] bg-[#f5f5dc] overflow-hidden flex flex-col">
      {/* Celebration Overlay */}
      {isCompleting && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
          <Sparkles className="w-32 h-32 text-[#FCCF03] animate-ping" />
        </div>
      )}

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
            style={{ width: '100%' }}
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <p className="text-sm font-semibold text-[#FCCF03] uppercase tracking-wider mb-2">
            Bước 6/6
          </p>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
            Bạn muốn học bao lâu mỗi ngày?
          </h1>
          <p className="text-sm text-[#64748b] mt-2">
            Chúng tôi sẽ tạo lộ trình học tập phù hợp cho bạn
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Quick Select Options */}
        <div className="space-y-3 mb-5">
          {timeOptions.map((option) => {
            const isSelected = selectedTime === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleQuickSelect(option.value)}
                className={`
                  relative w-full p-4 rounded-[16px] border-2 transition-all
                  ${
                    isSelected
                      ? 'bg-[#FCCF03] border-[#e5b800] shadow-[0_4px_0_0_#e5b800] -translate-y-[2px]'
                      : 'bg-white border-[#e5e7eb] hover:border-[#FCCF03] hover:shadow-md'
                  }
                `}
              >
                {/* Recommended Badge */}
                {option.recommended && (
                  <div className="absolute -top-2.5 right-3 px-3 py-0.5 bg-[#0f172a] rounded-full shadow-md">
                    <p className="text-xs font-bold text-[#FCCF03]">✨ Đề xuất</p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {/* Emoji Icon */}
                  <div
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0
                      ${isSelected ? 'bg-white' : 'bg-[#f5f5dc]'}
                    `}
                  >
                    {option.emoji}
                  </div>

                  {/* Text */}
                  <div className="flex-1 text-left">
                    <h3 className="text-[17px] font-bold text-[#0f172a]">
                      {option.label}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-sm ${isSelected ? 'text-[#0f172a]/70' : 'text-[#64748b]'}`}>
                        {option.description}
                      </p>
                      <span
                        className={`
                          px-2 py-0.5 rounded-full text-xs font-semibold
                          ${isSelected ? 'bg-[#0f172a] text-[#FCCF03]' : 'bg-[#f5f5dc] text-[#64748b]'}
                        `}
                      >
                        {option.badge}
                      </span>
                    </div>
                  </div>

                  {/* Check */}
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all
                      ${isSelected ? 'bg-[#0f172a] scale-100' : 'bg-transparent border-2 border-[#cbd5e1] scale-90'}
                    `}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Time Slider */}
        <div className="p-5 bg-white rounded-[16px] border-2 border-[#e5e7eb] mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FCCF03] rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#0f172a]" strokeWidth={2.5} />
              </div>
              <h3 className="text-base font-bold text-[#0f172a]">
                Tinh chỉnh thời gian
              </h3>
            </div>
            <div className="px-3 py-1 bg-[#FCCF03] border border-[#e5b800] rounded-full">
              <p className="text-base font-extrabold text-[#0f172a]">
                {customTime} phút
              </p>
            </div>
          </div>

          {/* Slider Track */}
          <div className="relative">
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={customTime}
              onChange={handleSliderChange}
              className="w-full h-3 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-7
                [&::-webkit-slider-thumb]:h-7
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-[#FCCF03]
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-[#e5b800]
                [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.2)]
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110
                [&::-moz-range-thumb]:w-7
                [&::-moz-range-thumb]:h-7
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-[#FCCF03]
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-[#e5b800]
                [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.2)]
                [&::-moz-range-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right, #FCCF03 0%, #FCCF03 ${fillPercent}%, #e5e7eb ${fillPercent}%, #e5e7eb 100%)`
              }}
            />
            {/* Labels */}
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-xs font-semibold text-[#94a3b8]">5 phút</span>
              <span className="text-xs font-semibold text-[#94a3b8]">60 phút</span>
            </div>
          </div>
        </div>

        {/* Tip Card */}
        <div className="p-4 bg-[#FCCF03] rounded-[16px] border-2 border-[#e5b800]">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-base">💡</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0f172a]">
                Học đều đặn hiệu quả hơn!
              </h3>
              <p className="text-xs text-[#0f172a]/70 mt-1 leading-relaxed">
                Nghiên cứu cho thấy học 15 phút/ngày hiệu quả hơn học dồn 2 giờ vào cuối tuần.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="px-5 pb-8 pt-4 bg-gradient-to-t from-[#f5f5dc] via-[#f5f5dc] to-transparent">
        <button
          onClick={handleComplete}
          disabled={isCompleting}
          className={`
            w-full h-[56px] rounded-[14px] font-bold text-[16px] uppercase tracking-wide transition-all
            flex items-center justify-center gap-2
            ${
              !isCompleting
                ? 'bg-[#FCCF03] border-2 border-[#e5b800] text-[#0f172a] shadow-[0_4px_0_0_#e5b800] active:shadow-[0_2px_0_0_#e5b800] active:translate-y-[2px] hover:bg-[#ffd633]'
                : 'bg-[#e5e7eb] border-2 border-[#cbd5e1] text-[#94a3b8] cursor-not-allowed'
            }
          `}
        >
          {isCompleting ? (
            <>
              <div className="w-5 h-5 border-2 border-[#94a3b8] border-t-transparent rounded-full animate-spin" />
              <span>Đang hoàn tất...</span>
            </>
          ) : (
            <>
              <span>Hoàn tất & Bắt đầu học</span>
              <Sparkles className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-xs text-center text-[#64748b] mt-3">
          🎉 Sẵn sàng khám phá lịch sử cùng History Alive!
        </p>
      </div>
    </div>
  );
}