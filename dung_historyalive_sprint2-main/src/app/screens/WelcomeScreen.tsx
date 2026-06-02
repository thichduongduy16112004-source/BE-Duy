import { useNavigate } from 'react-router';
import HistoryAliveWelcomeScreen from '../../imports/HistoryAliveWelcomeScreen';

export default function WelcomeScreen() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen w-full bg-[#f5f5dc]"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        
        // Check if clicked on "Bắt đầu ngay" button
        if (target.closest('[data-name="Primary Massive Button"]')) {
          handleGetStarted();
        }
        
        // Check if clicked on "Tôi đã có tài khoản" link
        if (target.closest('[data-name="Button - Secondary Text Link"]')) {
          handleLogin();
        }
      }}
    >
      <div className="w-full max-w-md">
        <HistoryAliveWelcomeScreen />
      </div>
    </div>
  );
}
