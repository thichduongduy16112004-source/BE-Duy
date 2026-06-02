import { useNavigate } from 'react-router';
import { MobileAgeSelectionScreen } from '../components/MobileAgeSelectionScreen';
import { useOnboarding } from '../context/OnboardingContext';

export default function AgeSelectionScreen() {
  const navigate = useNavigate();
  const { updateData } = useOnboarding();

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#f5f5dc]">
      <MobileAgeSelectionScreen
        onBack={() => navigate('/signup')}
        onContinue={(age) => {
          console.log('Selected age:', age);
          updateData({ age });
          navigate('/onboarding/name');
        }}
      />
    </div>
  );
}
