import { useNavigate } from 'react-router';
import { AIChatModal } from '../components/AIChatModal';

export default function AIChatScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#0f172a]">
      <div className="w-[393px] h-[852px] relative overflow-hidden">
        <AIChatModal
          isOpen={true}
          onClose={() => navigate('/home')}
          onNavigatePremium={() => navigate('/premium')}
        />
      </div>
    </div>
  );
}