import { useState } from 'react';
import { ArrowLeft, Mail, Check, X } from 'lucide-react';

interface MobileEmailInputScreenProps {
  onBack?: () => void;
  onContinue?: (email: string) => void;
}

export function MobileEmailInputScreen({
  onBack,
  onContinue,
}: MobileEmailInputScreenProps) {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value.length > 0) {
      setIsValid(validateEmail(value));
    } else {
      setIsValid(null);
    }
  };

  const handleContinue = () => {
    if (email.trim() && isValid) {
      onContinue?.(email.trim());
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
            style={{ width: '50%' }}
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <p className="text-sm font-semibold text-[#FCCF03] uppercase tracking-wider mb-2">
            Bước 3/6
          </p>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
            Email của bạn?
          </h1>
          <p className="text-sm text-[#64748b] mt-2">
            Chúng tôi sẽ gửi thông tin học tập và cập nhật mới nhất
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 flex flex-col justify-between pb-8">
        <form onSubmit={handleContinue} className="space-y-8 pt-4">
          {/* Email Icon Illustration */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-[#FCCF03] to-[#ffd633] rounded-full flex items-center justify-center shadow-lg">
                <Mail className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              {isValid !== null && (
                <div
                  className={`
                    absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg
                    ${isValid ? 'bg-green-500' : 'bg-red-500'}
                  `}
                >
                  {isValid ? (
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  ) : (
                    <X className="w-6 h-6 text-white" strokeWidth={3} />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-3">
            <label htmlFor="email" className="block text-sm font-semibold text-[#0f172a]">
              Địa chỉ email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="email@example.com"
              autoFocus
              className={`
                w-full h-[54px] px-5 bg-white border-2 rounded-[14px] text-[17px] font-medium text-[#0f172a] placeholder:text-[#94a3b8] transition-all
                ${
                  isValid !== null
                    ? isValid
                      ? 'border-green-500 focus:ring-green-500/20'
                      : 'border-red-500 focus:ring-red-500/20'
                    : 'border-[#e5e7eb] focus:border-[#FCCF03] focus:ring-[#FCCF03]/20'
                }
                focus:outline-none focus:ring-4
              `}
            />
            {isValid !== null && (
              <p
                className={`
                  text-sm font-medium px-1
                  ${isValid ? 'text-green-600' : 'text-red-600'}
                `}
              >
                {isValid ? '✓ Email hợp lệ' : '✗ Email không hợp lệ'}
              </p>
            )}
          </div>

          {/* Email Benefits */}
          <div className="space-y-3 bg-white/50 backdrop-blur-sm rounded-[14px] p-4 border-2 border-white">
            <p className="text-sm font-semibold text-[#0f172a] mb-2">
              📧 Bạn sẽ nhận được:
            </p>
            <ul className="space-y-2">
              {[
                'Thông báo về tiến độ học tập',
                'Bài học và quiz mới',
                'Mẹo và chiến lược học tập',
                'Cập nhật tính năng mới',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-[#64748b]">
                  <div className="w-5 h-5 bg-[#FCCF03] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#0f172a]" strokeWidth={3} />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy Notice */}
          <p className="text-xs text-[#64748b] text-center px-2">
            🔒 Chúng tôi tôn trọng quyền riêng tư của bạn. Email của bạn sẽ không bao giờ được chia sẻ với bên thứ ba.
          </p>
        </form>

        {/* Fixed Bottom CTA */}
        <div className="pt-4">
          <button
            onClick={handleContinue}
            disabled={!isValid}
            className={`
              w-full h-[56px] rounded-[14px] font-bold text-[16px] uppercase tracking-wide transition-all
              ${
                isValid
                  ? 'bg-[#FCCF03] border-2 border-[#e5b800] text-[#0f172a] shadow-[0_4px_0_0_#e5b800] active:shadow-[0_2px_0_0_#e5b800] active:translate-y-[2px] hover:bg-[#ffd633]'
                  : 'bg-[#e5e7eb] border-2 border-[#cbd5e1] text-[#94a3b8] cursor-not-allowed'
              }
            `}
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
}