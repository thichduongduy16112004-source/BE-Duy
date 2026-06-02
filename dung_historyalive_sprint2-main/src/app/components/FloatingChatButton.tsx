import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface FloatingChatButtonProps {
  onClick: () => void;
}

export function FloatingChatButton({ onClick }: FloatingChatButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-24 right-6 z-40 group"
      aria-label="Mở chat AI"
    >
      {/* Pulse animation background */}
      <div className="absolute inset-0 bg-[#FCCF03] rounded-full animate-ping opacity-20" />
      
      {/* Main button */}
      <div className="relative w-16 h-16 bg-gradient-to-br from-[#FCCF03] to-[#FFE566] rounded-full shadow-2xl flex items-center justify-center border-4 border-white transition-all hover:scale-110 active:scale-95">
        <MessageCircle className="w-8 h-8 text-[#0f172a]" strokeWidth={2.5} />
        
        {/* Notification badge */}
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg">
          1
        </div>
      </div>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap shadow-xl">
          Hỏi AI trợ lý
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 rotate-45" />
        </div>
      )}
    </button>
  );
}
