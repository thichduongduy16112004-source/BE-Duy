import { useNavigate } from 'react-router';
import { MobileVideoLesson2Screen } from '../components/MobileVideoLesson2Screen';

export default function VideoLesson2Screen() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-white">
      <MobileVideoLesson2Screen onBack={() => navigate('/home')} />
    </div>
  );
}