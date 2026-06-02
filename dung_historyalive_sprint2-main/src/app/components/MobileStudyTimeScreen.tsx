import { useNavigate } from 'react-router';
import { useState } from 'react';
import { Clock } from 'lucide-react';

export default function MobileStudyTimeScreen() {
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const timeOptions = [5, 10, 15, 20, 30, 45, 60];

  const handleContinue = () => {
    if (selectedTime) {
      navigate('/home');
    }
  };

  return (
    <div className="w-[393px] h-[852px] bg-white flex flex-col">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200">
        <div className="h-full w-full bg-[#FCCF03] transition-all duration-300" />
      </div>

      {/* Header */}
      <div className="px-6 py-8">
        <div className="w-16 h-16 bg-[#FCCF03]/20 rounded-2xl flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-[#FCCF03]" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
          Daily Study Time
        </h1>
        <p className="text-base text-gray-600 leading-relaxed">
          Bạn dự định học bao nhiêu phút mỗi ngày?
        </p>
      </div>

      {/* Time Options */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {timeOptions.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`h-32 rounded-3xl border-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                selectedTime === time
                  ? 'bg-[#FCCF03] border-[#FCCF03] shadow-lg scale-105'
                  : 'bg-white border-gray-200 hover:border-[#FCCF03] hover:bg-[#FCCF03]/5'
              }`}
            >
              <Clock
                className={`w-10 h-10 ${
                  selectedTime === time ? 'text-white' : 'text-[#FCCF03]'
                }`}
              />
              <span
                className={`text-3xl font-extrabold ${
                  selectedTime === time ? 'text-white' : 'text-gray-900'
                }`}
              >
                {time}
              </span>
              <span
                className={`text-sm font-semibold ${
                  selectedTime === time ? 'text-white' : 'text-gray-500'
                }`}
              >
                minutes
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-sm text-blue-900">
            💡 <strong>Tip:</strong> Học đều đặn mỗi ngày tốt hơn học dồn!
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <div className="px-6 pb-8">
        <button
          onClick={handleContinue}
          disabled={!selectedTime}
          className={`w-full h-16 rounded-2xl font-extrabold text-lg transition-all duration-150 ${
            selectedTime
              ? 'bg-[#FCCF03] text-[#0f172a] shadow-[0_6px_0_0_#c4a302] active:translate-y-1 active:shadow-[0_3px_0_0_#c4a302] hover:bg-[#ffd633]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Start Learning →
        </button>
      </div>
    </div>
  );
}
