import { BookOpen, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MobileWelcomeScreenProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

export function MobileWelcomeScreen({
  onGetStarted,
  onLogin,
}: MobileWelcomeScreenProps) {
  return (
    <div className="relative w-[393px] h-[852px] bg-gradient-to-b from-[#FCCF03] via-[#ffd633] to-[#FCCF03] overflow-hidden flex flex-col">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Content Container */}
      <div className="relative flex-1 flex flex-col items-center justify-between px-8 py-16">
        {/* Logo & Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          {/* App Icon/Logo */}
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-[32px] shadow-[0_8px_0_0_rgba(0,0,0,0.1)] flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-[#FCCF03]" strokeWidth={2.5} />
            </div>
            {/* Sparkle decoration */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-[#FCCF03]" fill="#FCCF03" />
            </div>
          </div>

          {/* App Name */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-extrabold text-[#0f172a] tracking-tight">
              History Alive
            </h1>
            <p className="text-base font-semibold text-[#0f172a]/70">
              Khám phá lịch sử một cách sống động
            </p>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-[#0f172a] shadow-md">
              🎯 Học tương tác
            </div>
            <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-[#0f172a] shadow-md">
              🏆 Thi đấu
            </div>
            <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-[#0f172a] shadow-md">
              🤖 AI Trợ giảng
            </div>
          </div>
        </div>

        {/* CTA Buttons Section */}
        <div className="w-full space-y-4">
          {/* Primary CTA - Get Started */}
          <button
            onClick={onGetStarted}
            className="w-full h-[60px] bg-[#0f172a] border-2 border-[#0f172a] rounded-[16px] font-bold text-white text-[17px] uppercase tracking-wide hover:bg-[#1e293b] transition-all shadow-[0_6px_0_0_rgba(0,0,0,0.3)] active:shadow-[0_2px_0_0_rgba(0,0,0,0.3)] active:translate-y-[4px] flex items-center justify-center gap-2"
          >
            <span>Start Learning</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="animate-pulse"
            >
              <path
                d="M4 10H16M16 10L11 5M16 10L11 15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Secondary CTA - Login */}
          <button
            onClick={onLogin}
            className="w-full h-[56px] bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-[16px] font-semibold text-[#0f172a] text-[16px] hover:bg-white/30 transition-all"
          >
            I already have an account
          </button>

          {/* Terms Notice */}
          <p className="text-center text-xs text-[#0f172a]/60 px-4 pt-2">
            Bằng cách tiếp tục, bạn đồng ý với{' '}
            <span className="underline font-semibold">Điều khoản dịch vụ</span>
            {' '}và{' '}
            <span className="underline font-semibold">Chính sách bảo mật</span>
          </p>
        </div>
      </div>
    </div>
  );
}