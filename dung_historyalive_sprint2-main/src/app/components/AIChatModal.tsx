import { useState, useRef, useEffect, useCallback } from 'react';
import svgPaths from '../../imports/svg-qrlkog9kng';
import imgAiAvatar from 'figma:asset/eeaf89497dc9673f68176ae462170d30f89f2a99.png';
import { apiService } from '../services/apiService';

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isStreaming?: boolean;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigatePremium?: () => void;
}

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const FREE_CHAT_LIMIT = 3;
const CHARACTER_NAME = 'Nguyễn Trãi';
const CHARACTER_ERA = 'Thế kỷ XV';
const STREAMING_SPEED_MS = 18; // ms per character

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function getFreeChatsUsed(): number {
  try {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('free_chats_date');
    if (stored !== today) {
      localStorage.setItem('free_chats_date', today);
      localStorage.setItem('free_chats_used', '0');
      return 0;
    }
    return parseInt(localStorage.getItem('free_chats_used') || '0', 10);
  } catch {
    return 0;
  }
}

function incrementFreeChats(): number {
  try {
    const today = new Date().toDateString();
    localStorage.setItem('free_chats_date', today);
    const current = parseInt(localStorage.getItem('free_chats_used') || '0', 10);
    const next = current + 1;
    localStorage.setItem('free_chats_used', String(next));
    return next;
  } catch {
    return 1;
  }
}

function getResetCountdown(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight.getTime() - now.getTime();
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  return `${h}h ${m}m`;
}

/* ─────────────────────────────────────────
   Inline CSS (animations)
───────────────────────────────────────── */
const animationStyles = `
@keyframes typingDot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}
@keyframes blinkCursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
.typing-dot {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  animation: typingDot 1.2s ease-in-out infinite;
}
.typing-dot:nth-child(1) { animation-delay: 0ms; }
.typing-dot:nth-child(2) { animation-delay: 200ms; }
.typing-dot:nth-child(3) { animation-delay: 400ms; }
.blink-cursor {
  display: inline-block;
  width: 2px; height: 1em;
  background: #1e293b;
  margin-left: 1px;
  vertical-align: middle;
  animation: blinkCursor 0.7s step-end infinite;
}
.message-bubble {
  animation: fadeSlideUp 0.25s ease-out;
}
.scroll-down-btn {
  animation: fadeIn 0.2s ease-out;
}
.end-sheet-overlay {
  animation: fadeIn 0.2s ease-out;
}
.end-sheet-panel {
  animation: slideUp 0.3s cubic-bezier(0.32,0.72,0,1);
}
.free-modal-overlay {
  animation: fadeIn 0.2s ease-out;
}
`;

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

/** Avatar nhân vật AI */
function CharacterAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="relative rounded-full shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <img
          alt={CHARACTER_NAME}
          className="absolute w-[90%] h-[90%] top-[5%] object-cover"
          style={{ left: '5%' }}
          src={imgAiAvatar}
        />
      </div>
      <div
        className="absolute inset-0 rounded-full"
        style={{ border: '2px solid #fccf03', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
      />
    </div>
  );
}

/** Bubble tin nhắn AI */
function AIBubble({ message }: { message: Message }) {
  return (
    <div className="flex gap-3 items-end w-full message-bubble">
      <CharacterAvatar size={36} />
      <div className="flex flex-col gap-1 items-start flex-1 min-w-0">
        <span
          className="text-[11px] tracking-[0.55px] uppercase text-[#64748b] pl-1"
          style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 500 }}
        >
          {CHARACTER_NAME}
        </span>
        <div
          className="px-4 py-3 rounded-br-2xl rounded-tl-2xl rounded-tr-2xl border shadow-sm"
          style={{
            background: '#f5f5dc',
            borderColor: 'rgba(252,207,3,0.2)',
            maxWidth: '270px',
          }}
        >
          <p
            className="text-[14px] leading-[1.65] text-[#1e293b] m-0"
            style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 400 }}
          >
            {message.text}
            {message.isStreaming && <span className="blink-cursor" />}
          </p>
        </div>
        <span
          className="text-[10px] text-[#94a3b8] pl-1"
          style={{ fontFamily: "'Be Vietnam Pro',sans-serif" }}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

/** Bubble tin nhắn User */
function UserBubble({ message }: { message: Message }) {
  return (
    <div className="flex gap-3 items-end justify-end w-full message-bubble">
      <div className="flex flex-col gap-1 items-end flex-1 min-w-0">
        <span
          className="text-[11px] tracking-[0.55px] uppercase text-[#64748b] pr-1"
          style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 500 }}
        >
          Bạn
        </span>
        <div
          className="px-4 py-3 rounded-bl-2xl rounded-tl-2xl rounded-tr-2xl shadow-md"
          style={{
            background: 'linear-gradient(135deg, #fccf03 0%, #f5b800 100%)',
            maxWidth: '270px',
          }}
        >
          <p
            className="text-[14px] leading-[1.65] text-[#0f172a] m-0"
            style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 500 }}
          >
            {message.text}
          </p>
        </div>
        <span
          className="text-[10px] text-[#94a3b8] pr-1"
          style={{ fontFamily: "'Be Vietnam Pro',sans-serif" }}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
      {/* User Avatar */}
      <div
        className="rounded-full shrink-0 flex items-center justify-center"
        style={{
          width: 36, height: 36,
          background: 'rgba(252,207,3,0.15)',
          border: '2px solid #fccf03',
        }}
      >
        <svg fill="none" viewBox="0 0 14 14" style={{ width: 14, height: 14 }}>
          <path d={svgPaths.pfeb5cc0} fill="#FCCF03" />
        </svg>
      </div>
    </div>
  );
}

/** Typing Indicator (3 chấm động) */
function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end w-full message-bubble">
      <CharacterAvatar size={36} />
      <div className="flex flex-col gap-1 items-start">
        <span
          className="text-[11px] tracking-[0.55px] uppercase text-[#64748b] pl-1"
          style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 500 }}
        >
          {CHARACTER_NAME}
        </span>
        <div
          className="px-4 py-3 rounded-br-2xl rounded-tl-2xl rounded-tr-2xl border"
          style={{ background: '#f5f5dc', borderColor: 'rgba(252,207,3,0.2)' }}
        >
          <div className="flex gap-[6px] items-center" style={{ height: 20 }}>
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Modal xác nhận kết thúc hội thoại (Bottom Sheet) */
function EndConversationSheet({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="end-sheet-overlay absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div
        className="end-sheet-panel bg-white rounded-t-3xl p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center mb-5">
          <div className="w-10 h-1 rounded-full bg-[#e2e8f0]" />
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.1)' }}
          >
            <svg fill="none" viewBox="0 0 24 24" width="32" height="32">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <h3
          className="text-center text-[18px] text-[#0f172a] mb-2"
          style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 800 }}
        >
          Kết thúc hội thoại?
        </h3>
        <p
          className="text-center text-[14px] text-[#64748b] mb-6 leading-relaxed"
          style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 400 }}
        >
          Bạn sẽ nhận được Flashcard tóm tắt kiến thức từ cuộc trò chuyện này.
        </p>

        <button
          onClick={onConfirm}
          className="w-full py-4 rounded-2xl text-[15px] mb-3 active:scale-[0.98] transition-transform"
          style={{
            background: 'linear-gradient(135deg, #fccf03 0%, #f5b800 100%)',
            fontFamily: "'Be Vietnam Pro',sans-serif",
            fontWeight: 700,
            color: '#0f172a',
            boxShadow: '0 4px 12px rgba(252,207,3,0.4)',
          }}
        >
          ✅ Xác nhận &amp; Nhận Flashcard
        </button>
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-2xl text-[15px] text-[#64748b] bg-[#f1f5f9] active:scale-[0.98] transition-transform"
          style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 600 }}
        >
          Tiếp tục trò chuyện
        </button>
      </div>
    </div>
  );
}

/** Modal hết lượt Free */
function FreeLimitModal({ onUpgrade, onDismiss }: { onUpgrade: () => void; onDismiss: () => void }) {
  return (
    <div
      className="free-modal-overlay absolute inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="bg-white rounded-3xl p-6 w-full shadow-2xl"
        style={{ maxWidth: 340 }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}
          >
            <span style={{ fontSize: 36 }}>⏰</span>
          </div>
        </div>

        <h3
          className="text-center text-[20px] text-[#0f172a] mb-2"
          style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 800 }}
        >
          Hết lượt Free hôm nay!
        </h3>
        <p
          className="text-center text-[14px] text-[#64748b] mb-1 leading-relaxed"
          style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 400 }}
        >
          Bạn đã dùng hết <strong>3 lượt chat</strong> miễn phí hôm nay.
        </p>

        {/* Countdown */}
        <div
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl mb-5 mx-2"
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
        >
          <svg fill="none" viewBox="0 0 16 16" width="14" height="14">
            <circle cx="8" cy="8" r="7" stroke="#64748b" strokeWidth="1.5" />
            <path d="M8 4.5v4l2.5 2" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span
            className="text-[13px] text-[#475569]"
            style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 600 }}
          >
            Đặt lại sau: <span className="text-[#0f172a]">{getResetCountdown()}</span>
          </span>
        </div>

        <button
          onClick={onUpgrade}
          className="w-full py-4 rounded-2xl text-[15px] mb-3 active:scale-[0.98] transition-transform"
          style={{
            background: 'linear-gradient(135deg, #fccf03 0%, #f5b800 100%)',
            fontFamily: "'Be Vietnam Pro',sans-serif",
            fontWeight: 700,
            color: '#0f172a',
            boxShadow: '0 6px 20px rgba(252,207,3,0.45)',
          }}
        >
          ⭐ Nâng cấp Premium
        </button>
        <button
          onClick={onDismiss}
          className="w-full py-2 text-[13px] text-[#94a3b8] active:opacity-70"
          style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 500 }}
        >
          Để sau
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export function AIChatModal({ isOpen, onClose, onNavigatePremium }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Chào hậu sinh! Năm 1428, đại cục đã định. Con có biết ta đã viết áng thiên cổ hùng văn nào để bá cáo thiên hạ không?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);       // typing indicator (3 chấm)
  const [isStreaming, setIsStreaming] = useState(false);  // đang stream text
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showEndSheet, setShowEndSheet] = useState(false);
  const [showFreeLimitModal, setShowFreeLimitModal] = useState(false);
  const [freeChatsUsed, setFreeChatsUsed] = useState(() => getFreeChatsUsed());
  const [sessionId, setSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Khởi tạo chat session với backend
  useEffect(() => {
    if (isOpen) {
      apiService.startChat('nguyen-trai')
        .then((res) => {
          setSessionId(res.session_id);
          return apiService.getStats();
        })
        .then((stats) => {
          setFreeChatsUsed(FREE_CHAT_LIMIT - stats.daily_chat_remaining);
        })
        .catch((err) => {
          console.error('Failed to start chat session:', err);
        });
    }
  }, [isOpen]);

  /* ── Auto scroll ── */
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  /* ── Detect scroll position → show/hide scroll-down button ── */
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollDown(distFromBottom > 80);
  }, []);

  /* ── Cleanup streaming interval on unmount ── */
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current);
    };
  }, []);

  /* ── Send Message ── */
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isTyping || isStreaming || !sessionId) return;

    // Kiểm tra giới hạn free
    if (freeChatsUsed >= FREE_CHAT_LIMIT) {
      setShowFreeLimitModal(true);
      return;
    }

    const currentInput = inputText.trim();
    
    // Thêm tin nhắn của User
    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentInput,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Tạo tin nhắn trống của AI để chuẩn bị stream
    const aiMsgId = (Date.now() + 1).toString();
    let currentResponseText = '';

    const abortStream = apiService.sendMessageStream(
      sessionId,
      currentInput,
      // onChunk
      (chunk) => {
        setIsTyping(false); // Ẩn typing indicator khi bắt đầu nhận chữ
        setIsStreaming(true);
        currentResponseText += chunk;
        setMessages((prev) => {
          const exists = prev.find((m) => m.id === aiMsgId);
          if (exists) {
            return prev.map((m) =>
              m.id === aiMsgId ? { ...m, text: currentResponseText } : m
            );
          } else {
            return [
              ...prev,
              {
                id: aiMsgId,
                text: currentResponseText,
                sender: 'ai',
                timestamp: new Date(),
                isStreaming: true,
              },
            ];
          }
        });
      },
      // onDone
      () => {
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, isStreaming: false } : m))
        );
        // Tăng bộ đếm lượt chat
        const newCount = incrementFreeChats();
        setFreeChatsUsed(newCount);
      },
      // onError
      (error) => {
        console.error('SSE Stream error:', error);
        setIsTyping(false);
        setIsStreaming(false);
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: 'Ta gặp chút trở ngại, hậu sinh thử hỏi lại sau nhé!',
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    );

    return () => {
      if (abortStream) abortStream();
    };
  }, [inputText, isTyping, isStreaming, freeChatsUsed, sessionId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleEndConfirm = useCallback(async () => {
    if (!sessionId) {
      onClose();
      return;
    }
    setShowEndSheet(false);
    try {
      const res = await apiService.endChat(sessionId);
      console.log('Flashcard generated:', res.flashcard);
      alert('Đã kết thúc hội thoại và tạo Flashcard thành công! Bạn có thể xem lại tại trang Ôn Tập.');
    } catch (err) {
      console.error('Failed to end chat session:', err);
    }
    onClose();
  }, [sessionId, onClose]);

  if (!isOpen) return null;

  const isInputDisabled = isTyping || isStreaming;
  const chatsRemaining = Math.max(0, FREE_CHAT_LIMIT - freeChatsUsed);

  return (
    <>
      {/* Inject animation styles */}
      <style>{animationStyles}</style>

      <div
        className="flex flex-col relative size-full overflow-hidden"
        style={{ background: '#ffffff' }}
      >
        {/* ───────────────────────────────────────
            HEADER (fixed)
        ─────────────────────────────────────── */}
        <div
          className="relative shrink-0 z-10 w-full"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex flex-row items-center justify-between px-3 pt-4 pb-3">
            {/* Back Button */}
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-full active:scale-90 transition-transform"
              style={{ width: 40, height: 40, background: '#f1f5f9' }}
              aria-label="Quay lại"
            >
              <svg fill="none" viewBox="0 0 16 16" width="16" height="16">
                <path d={svgPaths.p300a1100} fill="#0F172A" />
              </svg>
            </button>

            {/* Character info */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              <CharacterAvatar size={32} />
              <div className="flex flex-col">
                <span
                  className="text-[16px] leading-tight text-[#0f172a]"
                  style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 800 }}
                >
                  {CHARACTER_NAME}
                </span>
                <span
                  className="text-[11px] text-[#64748b]"
                  style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 500 }}
                >
                  {CHARACTER_ERA} · {chatsRemaining} lượt còn lại
                </span>
              </div>
            </div>

            {/* End Conversation */}
            <button
              onClick={() => setShowEndSheet(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl active:scale-95 transition-transform"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
              aria-label="Kết thúc hội thoại"
            >
              <svg fill="none" viewBox="0 0 16 16" width="14" height="14">
                <path
                  d="M4 8h8M10 5l3 3-3 3"
                  stroke="#EF4444"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className="text-[11px] text-[#EF4444]"
                style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 700 }}
              >
                Kết thúc
              </span>
            </button>
          </div>
        </div>

        {/* ───────────────────────────────────────
            MESSAGES (scrollable)
        ─────────────────────────────────────── */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto w-full"
          style={{ paddingBottom: 80 }}
          onScroll={handleScroll}
        >
          {/* Conversation header / intro card */}
          <div className="px-4 pt-4 pb-2">
            <div
              className="rounded-2xl px-4 py-3 text-center"
              style={{ background: 'linear-gradient(135deg, #fef9e7, #fdf3c0)', border: '1px solid rgba(252,207,3,0.3)' }}
            >
              <span style={{ fontSize: 20 }}>📜</span>
              <p
                className="text-[12px] text-[#92400e] mt-1 leading-relaxed"
                style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 500 }}
              >
                Bạn đang trò chuyện với <strong>{CHARACTER_NAME}</strong> · {CHARACTER_ERA}<br />
                Giới hạn <strong>{FREE_CHAT_LIMIT} lượt/ngày</strong> miễn phí
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-4 px-4 py-2 w-full">
            {messages.map((msg) =>
              msg.sender === 'ai'
                ? <AIBubble key={msg.id} message={msg} />
                : <UserBubble key={msg.id} message={msg} />
            )}

            {/* Typing indicator */}
            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ───────────────────────────────────────
            SCROLL TO BOTTOM BUTTON
        ─────────────────────────────────────── */}
        {showScrollDown && (
          <button
            onClick={() => scrollToBottom()}
            className="scroll-down-btn absolute z-20 flex items-center justify-center rounded-full shadow-lg active:scale-90 transition-transform"
            style={{
              width: 40,
              height: 40,
              bottom: 88,
              right: 16,
              background: 'white',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}
            aria-label="Cuộn xuống tin nhắn mới nhất"
          >
            <svg fill="none" viewBox="0 0 16 16" width="16" height="16">
              <path
                d="M8 3v10M4 9l4 4 4-4"
                stroke="#64748b"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* ───────────────────────────────────────
            INPUT BAR (fixed bottom)
        ─────────────────────────────────────── */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 px-3 py-3"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div
            className="flex flex-row items-center gap-2"
            style={{
              background: '#f1f5f9',
              borderRadius: 28,
              border: '1.5px solid #e2e8f0',
              padding: '6px 8px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)',
            }}
          >
            {/* Mic icon */}
            <button
              className="flex items-center justify-center shrink-0 active:scale-90 transition-transform"
              style={{ padding: 8 }}
              aria-label="Ghi âm"
            >
              <svg fill="none" viewBox="0 0 14 19" width="14" height="19">
                <path d={svgPaths.p39e29d00} fill="#94A3B8" />
              </svg>
            </button>

            {/* Text input */}
            <input
              ref={inputRef}
              id="chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isInputDisabled ? `${CHARACTER_NAME} đang trả lời...` : `Hỏi ${CHARACTER_NAME}...`}
              disabled={isInputDisabled}
              className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-[#0f172a] placeholder:text-[#94a3b8] disabled:placeholder:text-[#c2cfe0]"
              style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 400 }}
            />

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={isInputDisabled || !inputText.trim()}
              aria-label="Gửi tin nhắn"
              className="rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all"
              style={{
                width: 40,
                height: 40,
                background:
                  isInputDisabled || !inputText.trim()
                    ? '#e2e8f0'
                    : 'linear-gradient(135deg, #fccf03, #f5b800)',
                boxShadow:
                  isInputDisabled || !inputText.trim()
                    ? 'none'
                    : '0 4px 12px rgba(252,207,3,0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              <svg fill="none" viewBox="0 0 16 14" width="16" height="14">
                <path d={svgPaths.pf594000} fill={isInputDisabled || !inputText.trim() ? '#94a3b8' : '#0F172A'} />
              </svg>
            </button>
          </div>

          {/* Free chats indicator */}
          {chatsRemaining <= 1 && chatsRemaining > 0 && (
            <p
              className="text-center text-[11px] text-[#f59e0b] mt-2"
              style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 600 }}
            >
              ⚠️ Còn {chatsRemaining} lượt chat miễn phí hôm nay
            </p>
          )}
        </div>

        {/* ───────────────────────────────────────
            MODALS / OVERLAYS
        ─────────────────────────────────────── */}
        {showEndSheet && (
          <EndConversationSheet
            onCancel={() => setShowEndSheet(false)}
            onConfirm={handleEndConfirm}
          />
        )}

        {showFreeLimitModal && (
          <FreeLimitModal
            onUpgrade={() => {
              setShowFreeLimitModal(false);
              if (onNavigatePremium) onNavigatePremium();
            }}
            onDismiss={() => setShowFreeLimitModal(false)}
          />
        )}
      </div>
    </>
  );
}
