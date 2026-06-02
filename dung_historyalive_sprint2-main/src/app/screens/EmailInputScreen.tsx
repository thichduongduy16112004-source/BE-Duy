import { useNavigate } from 'react-router';
import { MobileEmailInputScreen } from '../components/MobileEmailInputScreen';
import { useOnboarding } from '../context/OnboardingContext';

export default function EmailInputScreen() {
  const navigate = useNavigate();
  const { updateData } = useOnboarding();

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#f5f5dc]">
      <MobileEmailInputScreen
        onBack={() => navigate('/onboarding/name')}
        onContinue={(email) => {
          console.log('Email entered:', email);
          updateData({ email });
          navigate('/onboarding/subject');
        }}
      />
    </div>
  );
}
