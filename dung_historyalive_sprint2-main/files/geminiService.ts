// src/app/services/geminiService.ts
// API key đã được chuyển lên Firebase Function — frontend không còn lộ key nữa

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ChatResponse {
  text: string;
  used: number;
  remaining: number;
}

// URL Firebase Function sau khi deploy
// Thay bằng URL thật sau khi chạy: firebase deploy --only functions
const FUNCTION_URL = import.meta.env.VITE_CHAT_FUNCTION_URL as string;

export async function sendMessageToGemini(
  userMessage: string,
  history: ChatMessage[],
  userId: string
): Promise<ChatResponse> {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId, // Firebase Auth UID
    },
    body: JSON.stringify({
      message: userMessage,
      history,
    }),
  });

  if (res.status === 429) {
    const data = await res.json();
    throw new Error('RATE_LIMIT:' + data.message);
  }

  if (!res.ok) {
    throw new Error('Chat service error: ' + res.status);
  }

  return res.json();
}
