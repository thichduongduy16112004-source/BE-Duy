import { useNavigate } from 'react-router';
import MobileVideoLessonScreen from '../components/MobileVideoLessonScreen';

export default function VideoLessonScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-white">
      <MobileVideoLessonScreen onBack={() => navigate('/home')} />
    </div>
  );
}