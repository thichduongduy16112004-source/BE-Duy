import { useState } from 'react';
import { FloatingChatButton } from './FloatingChatButton';
import { AIChatModal } from './AIChatModal';

interface WithFloatingChatProps {
  children: React.ReactNode;
}

export function WithFloatingChat({ children }: WithFloatingChatProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {children}
      <FloatingChatButton onClick={() => setIsChatOpen(true)} />
      <AIChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
