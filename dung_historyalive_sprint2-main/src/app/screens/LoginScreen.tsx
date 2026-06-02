import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MobileLoginScreen } from '../components/MobileLoginScreen';
import { auth, googleProvider, facebookProvider, appleProvider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import { apiService } from '../services/apiService';

export default function LoginScreen() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleBackClick = () => {
    navigate('/');
  };

  // Login thường
  const handleLogin = async (credentials: any) => {
    setIsLoading(true);
    try {
      const data = await apiService.login(credentials.username, credentials.password);
      if (data.user && data.user.onboarding_completed) {
        navigate('/home');
      } else {
        navigate('/onboarding/age');
      }
    } catch (error: any) {
      alert(error.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google Login Success:", result.user);
      navigate('/home');
    } catch (error: any) {
      console.error("Google Login Error:", error);
      alert('Đăng nhập Google thất bại: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      console.log("Facebook Login Success:", result.user);
      navigate('/home');
    } catch (error: any) {
      console.error("Facebook Login Error:", error);
      alert('Đăng nhập Facebook thất bại: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, appleProvider);
      console.log("Apple Login Success:", result.user);
      navigate('/home');
    } catch (error: any) {
      console.error("Apple Login Error:", error);
      alert('Đăng nhập Apple thất bại: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Chức năng quên mật khẩu sẽ gửi link reset về email của bạn!');
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#0f172a]">
      <MobileLoginScreen
        onBack={handleBackClick}
        onLogin={handleLogin}
        onGoogleLogin={handleGoogleLogin}
        onFacebookLogin={handleFacebookLogin}
        onAppleLogin={handleAppleLogin}
        onSignUpClick={handleSignUpClick}
        onForgotPassword={handleForgotPassword}
        isLoading={isLoading}
      />
    </div>
  );
}