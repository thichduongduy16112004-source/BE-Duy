import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface MobileLoginScreenProps {
  onBack?: () => void;
  onLogin?: (credentials: any) => void;
  onGoogleLogin?: () => void;
  onFacebookLogin?: () => void;
  onAppleLogin?: () => void;
  onSignUpClick?: () => void;
  onForgotPassword?: () => void;
  isLoading?: boolean;
}

export function MobileLoginScreen({
  onBack,
  onLogin,
  onGoogleLogin,
  onFacebookLogin,
  onAppleLogin,
  onSignUpClick,
  onForgotPassword,
  isLoading = false,
}: MobileLoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    
    onLogin?.({ username, password });
  };

  return (
    <div className="relative w-[393px] h-[852px] bg-[#f5f5dc] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="relative pt-16 pb-8 px-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-16 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 text-[#0f172a]" />
        </button>

        {/* Title */}
        <div className="mt-16">
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Đăng nhập
          </h1>
          <p className="text-base text-[#64748b] mt-2">
            Mừng bạn trở lại, tiếp tục học thôi!
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-semibold text-[#334155]">
              Email hoặc tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập email..."
              className="w-full h-[52px] px-4 bg-white border border-[#e2e8f0] rounded-[16px] text-[15px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#FCCF03] focus:ring-4 focus:ring-[#FCCF03]/10 transition-all shadow-sm"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-[#334155]">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full h-[52px] px-4 pr-12 bg-white border border-[#e2e8f0] rounded-[16px] text-[15px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#FCCF03] focus:ring-4 focus:ring-[#FCCF03]/10 transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#94a3b8] hover:text-[#0f172a] transition-colors"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm font-semibold text-[#0f172a] hover:text-[#64748b] transition-colors"
            >
              Quên mật khẩu?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[56px] bg-[#FCCF03] rounded-[16px] font-bold text-[#0f172a] text-[16px] hover:bg-[#ffd633] transition-all shadow-md active:scale-[0.98] mt-4 flex items-center justify-center border-2 border-[#e5b800]"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-6">
            <div className="flex-1 h-[1px] bg-[#d1d5db]"></div>
            <span className="text-xs font-semibold text-[#64748b]">
              HOẶC ĐĂNG NHẬP BẰNG
            </span>
            <div className="flex-1 h-[1px] bg-[#d1d5db]"></div>
          </div>

          {/* Social Login Buttons - Minimalist Group */}
          <div className="flex items-center justify-center gap-4">
            {/* Google */}
            <button
              type="button"
              onClick={onGoogleLogin}
              className="w-14 h-14 bg-white border border-[#e2e8f0] rounded-full flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              aria-label="Đăng nhập bằng Google"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M23.76 12.2727C23.76 11.4218 23.6836 10.6036 23.5418 9.81818H12.24V14.46H18.7069C18.42 15.96 17.5418 17.2309 16.2327 18.0818V21.0927H20.1818C22.4945 18.96 23.76 15.9273 23.76 12.2727Z" fill="#4285F4"/>
                <path d="M12.24 24C15.48 24 18.2073 22.9255 20.1818 21.0927L16.2327 18.0818C15.1636 18.8018 13.8055 19.2273 12.24 19.2273C9.11455 19.2273 6.44727 17.1164 5.47636 14.28H1.39636V17.3891C3.35455 21.3109 7.51091 24 12.24 24Z" fill="#34A853"/>
                <path d="M5.47636 14.28C5.23636 13.56 5.1 12.7909 5.1 12C5.1 11.2091 5.23636 10.44 5.47636 9.72V6.61091H1.39636C0.589091 8.23091 0.12 10.0636 0.12 12C0.12 13.9364 0.589091 15.7691 1.39636 17.3891L5.47636 14.28Z" fill="#FBBC04"/>
                <path d="M12.24 4.77273C14.0036 4.77273 15.5891 5.38909 16.8327 6.57818L20.2691 3.14182C18.1964 1.20909 15.48 0 12.24 0C7.51091 0 3.35455 2.68909 1.39636 6.61091L5.47636 9.72C6.44727 6.88364 9.11455 4.77273 12.24 4.77273Z" fill="#EA4335"/>
              </svg>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={onAppleLogin}
              className="w-14 h-14 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-all shadow-sm active:scale-95"
              aria-label="Đăng nhập bằng Apple"
            >
              <svg width="24" height="24" viewBox="0 0 384 512" fill="white">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={onFacebookLogin}
              className="w-14 h-14 bg-[#1877f2] rounded-full flex items-center justify-center hover:bg-[#166fe5] transition-all shadow-sm active:scale-95"
              aria-label="Đăng nhập bằng Facebook"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6575 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" fill="white"/>
              </svg>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-8 pb-4">
            <button
              type="button"
              onClick={onSignUpClick}
              className="text-[15px] text-[#64748b]"
            >
              Bạn chưa có tài khoản?{' '}
              <span className="font-bold text-[#0f172a] hover:underline">
                Đăng ký ngay
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}