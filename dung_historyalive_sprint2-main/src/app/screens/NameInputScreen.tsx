import { useNavigate } from 'react-router';
import { MobileNameInputScreen } from '../components/MobileNameInputScreen';
import { useOnboarding } from '../context/OnboardingContext';
import { apiService } from '../services/apiService';

export default function NameInputScreen() {
  const navigate = useNavigate();
  const { updateData } = useOnboarding();

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#f5f5dc]">
      <MobileNameInputScreen
        onBack={() => navigate('/onboarding/age')}
        onContinue={async (name) => {
          console.log('Name entered:', name);
          updateData({ firstName: name.firstName, lastName: name.lastName });
          try {
            const fullName = `${name.lastName} ${name.firstName}`.trim();
            await apiService.updateMe(fullName);
          } catch (err) {
            console.error('Failed to update name on backend:', err);
          }
          navigate('/onboarding/email');
        }}
      />
    </div>
  );
}
