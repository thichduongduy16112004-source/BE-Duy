import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MobileSignUpScreen } from '../components/MobileSignUpScreen';
import { auth, googleProvider, facebookProvider, appleProvider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import { apiService } from '../services/apiService';
import { useOnboarding } from '../context/OnboardingContext';

export default function SignUpScreen() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { updateData } = useOnboarding();

  const handleBackClick = () => {
    navigate('/');
  };

  // SignUp thường
  const handleSignUp = async (credentials: any) => {
    setIsLoading(true);
    try {
      await apiService.register(credentials.username, credentials.password, 'Học sinh');
      updateData({ email: credentials.username });
      navigate('/onboarding/age');
    } catch (error: any) {
      alert(error.message || 'Đăng ký thất bại. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google SignUp Success:", result.user);
      navigate('/onboarding/age');
    } catch (error: any) {
      console.error("Google SignUp Error:", error);
      alert('Đăng ký Google thất bại: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      console.log("Facebook SignUp Success:", result.user);
      navigate('/onboarding/age');
    } catch (error: any) {
      console.error("Facebook SignUp Error:", error);
      alert('Đăng ký Facebook thất bại: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, appleProvider);
      console.log("Apple SignUp Success:", result.user);
      navigate('/onboarding/age');
    } catch (error: any) {
      console.error("Apple SignUp Error:", error);
      alert('Đăng ký Apple thất bại: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#0f172a]">
      <MobileSignUpScreen
        onBack={handleBackClick}
        onSignUp={handleSignUp}
        onGoogleSignUp={handleGoogleSignUp}
        onFacebookSignUp={handleFacebookSignUp}
        onAppleSignUp={handleAppleSignUp}
        onLoginClick={handleLoginClick}
        isLoading={isLoading}
      />
    </div>
  );
}