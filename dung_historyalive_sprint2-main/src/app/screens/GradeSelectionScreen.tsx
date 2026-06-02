import { useNavigate } from 'react-router';
import { MobileGradeSelectionScreen } from '../components/MobileGradeSelectionScreen';
import { useOnboarding } from '../context/OnboardingContext';

export default function GradeSelectionScreen() {
  const navigate = useNavigate();
  const { updateData } = useOnboarding();

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#f5f5dc]">
      <MobileGradeSelectionScreen
        onBack={() => navigate('/onboarding/subject')}
        onContinue={(grade) => {
          console.log('Selected grade:', grade);
          updateData({ grade });
          navigate('/onboarding/study-time');
        }}
      />
    </div>
  );
}
