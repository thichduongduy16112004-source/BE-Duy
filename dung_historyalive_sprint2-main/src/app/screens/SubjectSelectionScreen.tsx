import { useNavigate } from 'react-router';
import { MobileSubjectSelectionScreen } from '../components/MobileSubjectSelectionScreen';
import { useOnboarding } from '../context/OnboardingContext';

export default function SubjectSelectionScreen() {
  const navigate = useNavigate();
  const { updateData } = useOnboarding();

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#f5f5dc]">
      <MobileSubjectSelectionScreen
        onBack={() => navigate('/onboarding/email')}
        onContinue={(subjects) => {
          console.log('Selected subjects:', subjects);
          // subjects là mảng các string, lưu trữ lại
          updateData({ subject: Array.isArray(subjects) ? subjects.join(', ') : String(subjects) });
          navigate('/onboarding/grade');
        }}
      />
    </div>
  );
}
