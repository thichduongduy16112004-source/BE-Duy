const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

type ChatHistoryItem = {
  role: "user" | "assistant" | "ai";
  content: string;
};

type StreamHandlers = {
  characterId: string;
  onToken: (token: string) => void;
  onFinal?: (metadata: Record<string, unknown>) => void;
};

function getAuthToken(): string {
  const token = localStorage.getItem("ha_token");
  if (!token) {
    throw new Error("Bạn cần đăng nhập lại để sử dụng Sử Thần AI.");
  }
  return token;
}

function parseSseEvent(rawEvent: string): { event: string; data: string } | null {
  const lines = rawEvent.split("\n");
  const event = lines.find((line) => line.startsWith("event:"))?.replace(/^event:\s?/, "") || "message";
  const data = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.replace(/^data:\s?/, ""))
    .join("\n");

  if (!data) return null;
  return { event, data };
}

export async function streamAIMessage(
  message: string,
  history: ChatHistoryItem[],
  handlers: StreamHandlers,
): Promise<void> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      character_id: handlers.characterId,
      message,
      history: history.slice(-10),
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    throw new Error(errorText || "Không thể kết nối RAG/Gemini AI.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const rawEvent of events) {
      const parsed = parseSseEvent(rawEvent);
      if (!parsed) continue;

      const payload = JSON.parse(parsed.data) as Record<string, unknown>;
      if (parsed.event === "token" && typeof payload.text === "string") {
        handlers.onToken(payload.text);
      }
      if (parsed.event === "final") {
        handlers.onFinal?.(payload);
      }
      if (parsed.event === "error") {
        throw new Error(String(payload.message || "RAG/Gemini không tạo được câu trả lời."));
      }
    }
  }
}
