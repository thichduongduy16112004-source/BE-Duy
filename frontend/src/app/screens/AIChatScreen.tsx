import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Send, Crown, Lock, Sparkles, RefreshCw, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import { useApp } from "../store";
import { useIsPremium } from "../hooks/useIsPremium";
import PremiumModal from "../components/PremiumModal";
import { useAppSound } from "../hooks/useAppSound";
import { streamAIMessage } from "../../services/geminiService";
import { fetchPublishedCharacters, type PublishedCharacter } from "../content/publishedCharactersApi";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
};

const FREE_MESSAGE_LIMIT = 10;
const PREFERRED_CHARACTER_ID = "tran_hung_dao";

const CHARACTER_ICONS = ["⚔️", "👑", "🏯", "📜", "🔥", "🛡️", "⭐", "🐉"];

function getCharacterIcon(characterId: string): string {
  const normalized = characterId.toLocaleLowerCase("vi-VN");

  if (normalized.includes("tran")) return "⚔️";
  if (normalized.includes("quang") || normalized.includes("nguyen_hue")) return "🔥";
  if (normalized.includes("ngo")) return "🏯";
  if (normalized.includes("trung")) return "👑";
  if (normalized.includes("ho_chi_minh")) return "⭐";

  const hash = [...normalized].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return CHARACTER_ICONS[hash % CHARACTER_ICONS.length];
}

function getDefaultCharacter(characters: PublishedCharacter[]): PublishedCharacter | null {
  return characters.find((character) => character.character_id === PREFERRED_CHARACTER_ID) || characters[0] || null;
}

function buildSuggestions(character: PublishedCharacter | null): string[] {
  const name = character?.display_name || "nhân vật lịch sử";
  const era = character?.era || "thời kỳ của ông/bà";

  return [
    `${name} là ai?`,
    `${name} nổi bật nhất ở điểm nào?`,
    `Bối cảnh ${era} có gì đặc biệt?`,
    `Con có thể học gì từ ${name}?`,
  ];
}

function buildWelcomeMessage(userName: string | undefined, character: PublishedCharacter | null, isPremium: boolean): Message {
  const displayName = character?.display_name || "Sử Thần AI";
  const role = character?.role || character?.era || "người đồng hành lịch sử Việt Nam";
  const bio = character?.short_bio ? `\n\n${character.short_bio}` : "";
  const limitText = isPremium
    ? "Bạn có thể chat không giới hạn với Pro 👑"
    : `Bạn còn ${FREE_MESSAGE_LIMIT} câu hỏi miễn phí hôm nay.`;

  return {
    id: `welcome-${character?.character_id || "empty"}-${Date.now()}`,
    role: "ai",
    content: `Chào ${userName || "Chiến Binh"}! 👋 Ta là **${displayName}** — ${role}.${bio}\n\nHãy hỏi ta về thân thế, thời đại, chiến công, bài học lịch sử hoặc bất kỳ điều gì con muốn khám phá. ${limitText}`,
    timestamp: new Date(),
  };
}

export default function AIChatScreen() {
  const { user } = useApp();
  const isPremium = useIsPremium();
  const nav = useNavigate();
  const playClick = useAppSound("click");
  const playModal = useAppSound("modal");
  const [characters, setCharacters] = useState<PublishedCharacter[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<PublishedCharacter | null>(null);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true);
  const [characterError, setCharacterError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const remainingMsgs = FREE_MESSAGE_LIMIT - msgCount;
  const isLimitReached = !isPremium && msgCount >= FREE_MESSAGE_LIMIT;
  const suggestions = useMemo(() => buildSuggestions(selectedCharacter), [selectedCharacter]);
  const selectedIcon = selectedCharacter ? getCharacterIcon(selectedCharacter.character_id) : "📜";

  useEffect(() => {
    let isMounted = true;

    async function loadCharacters() {
      setIsLoadingCharacters(true);
      setCharacterError("");

      try {
        const nextCharacters = await fetchPublishedCharacters();
        if (!isMounted) return;

        const defaultCharacter = getDefaultCharacter(nextCharacters);
        setCharacters(nextCharacters);
        setSelectedCharacter(defaultCharacter);
        setMessages([buildWelcomeMessage(user.name, defaultCharacter, isPremium)]);
      } catch (error) {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : "Không thể tải danh sách nhân vật.";
        setCharacterError(message);
        setMessages([buildWelcomeMessage(user.name, null, isPremium)]);
      } finally {
        if (isMounted) {
          setIsLoadingCharacters(false);
        }
      }
    }

    loadCharacters();

    return () => {
      isMounted = false;
    };
  }, [isPremium, user.name]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function selectCharacter(character: PublishedCharacter) {
    if (character.character_id === selectedCharacter?.character_id) return;

    playClick();
    setSelectedCharacter(character);
    setMessages([buildWelcomeMessage(user.name, character, isPremium)]);
    setInput("");
    setIsTyping(false);
  }

  async function retryLoadCharacters() {
    playClick();
    setIsLoadingCharacters(true);
    setCharacterError("");

    try {
      const nextCharacters = await fetchPublishedCharacters();
      const defaultCharacter = getDefaultCharacter(nextCharacters);
      setCharacters(nextCharacters);
      setSelectedCharacter(defaultCharacter);
      setMessages([buildWelcomeMessage(user.name, defaultCharacter, isPremium)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải danh sách nhân vật.";
      setCharacterError(message);
    } finally {
      setIsLoadingCharacters(false);
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    playClick();

    if (isLimitReached) {
      playModal();
      setShowPremiumModal(true);
      return;
    }

    if (!selectedCharacter) {
      setCharacterError("Chưa có nhân vật đã phát hành để trò chuyện.");
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");
    setMsgCount((c) => c + 1);
    setIsTyping(true);

    const aiId = (Date.now() + 1).toString();
    setMessages((m) => [...m, { id: aiId, role: "ai", content: "", timestamp: new Date() }]);

    try {
      let isFirstChunk = true;
      const history = messages
        .filter((msg) => !msg.id.startsWith("welcome-"))
        .map((msg) => ({
          role: msg.role === "ai" ? "assistant" as const : "user" as const,
          content: msg.content,
        }));

      await streamAIMessage(text, history, {
        characterId: selectedCharacter.character_id,
        onToken: (chunkText) => {
          if (isFirstChunk) {
            setIsTyping(false);
            isFirstChunk = false;
          }
          setMessages((m) => m.map((msg) => msg.id === aiId ? { ...msg, content: msg.content + chunkText } : msg));
        },
      });

      setIsTyping(false);
    } catch (error) {
      setIsTyping(false);
      const message = error instanceof Error
        ? error.message
        : `${selectedCharacter.display_name} tạm chưa thể hồi đáp. Hãy thử lại sau.`;
      setMessages((m) => m.map((msg) => msg.id === aiId ? { ...msg, content: message } : msg));
    }
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*/g, "<strong>$1</strong>");
      return <p key={i} className={i > 0 ? "mt-2" : ""} dangerouslySetInnerHTML={{ __html: bold }} />;
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #fdf8ef 0%, #f7f0e2 100%)" }}>
      <div
        className="sticky top-0 z-20 px-4 py-3"
        style={{
          background: "rgba(250,245,232,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(240,180,41,0.2)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => { playClick(); nav(-1); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(240,180,41,0.1)", color: "#92400e" }}
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1c0800, #2d1400)", border: "1.5px solid rgba(240,180,41,0.4)" }}
          >
            {selectedCharacter?.portrait_url ? (
              <img
                src={selectedCharacter.portrait_url}
                alt={selectedCharacter.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span style={{ fontSize: 20 }}>{selectedIcon}</span>
            )}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{ background: selectedCharacter ? "#22c55e" : "#f59e0b", border: "1.5px solid white" }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate" style={{ color: "#1c1209", fontSize: 14, fontWeight: 700, fontFamily: '"Nunito", sans-serif' }}>
                {selectedCharacter?.display_name || "Đang tải nhân vật..."}
              </p>
              {isPremium && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md" style={{ background: "linear-gradient(135deg, #d97706, #f0b429)", fontSize: 8, color: "#1c0800", fontWeight: 800 }}>
                  <Crown style={{ width: 8, height: 8 }} />
                  PRO
                </span>
              )}
            </div>
            <p className="truncate" style={{ color: "#a8a29e", fontSize: 10, fontFamily: '"Nunito", sans-serif' }}>
              {selectedCharacter?.era || (isLoadingCharacters ? "Đang đồng bộ nhân vật đã phát hành" : "Chọn nhân vật để bắt đầu")}
            </p>
          </div>

          {!isPremium && (
            <button
              onClick={() => { playModal(); setShowPremiumModal(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{ background: "linear-gradient(135deg, #d97706, #f0b429)", color: "#1c0800", fontSize: 11, fontWeight: 800, fontFamily: '"Nunito", sans-serif' }}
            >
              <Crown className="w-3 h-3" />
              Pro
            </button>
          )}
        </div>

        <div className="mt-3 -mx-1 overflow-x-auto pb-1">
          <div className="flex gap-2 px-1 min-w-max">
            {isLoadingCharacters && [0, 1].map((index) => (
              <div
                key={index}
                className="h-14 w-44 rounded-2xl animate-pulse"
                style={{ background: "rgba(240,180,41,0.12)", border: "1px solid rgba(240,180,41,0.18)" }}
              />
            ))}

            {!isLoadingCharacters && characters.map((character) => {
              const isSelected = character.character_id === selectedCharacter?.character_id;
              return (
                <motion.button
                  key={character.character_id}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectCharacter(character)}
                  className="min-w-44 max-w-56 px-3 py-2 rounded-2xl text-left flex items-center gap-2"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, #1c0800, #3a1700)"
                      : "rgba(255,252,242,0.86)",
                    border: isSelected
                      ? "1.5px solid rgba(240,180,41,0.65)"
                      : "1px solid rgba(240,180,41,0.22)",
                    boxShadow: isSelected ? "0 6px 18px rgba(124,45,10,0.18)" : "0 1px 5px rgba(0,0,0,0.05)",
                  }}
                >
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: isSelected ? "rgba(240,180,41,0.18)" : "rgba(240,180,41,0.12)" }}>
                    {character.portrait_url ? (
                      <img
                        src={character.portrait_url}
                        alt={character.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getCharacterIcon(character.character_id)
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate" style={{ color: isSelected ? "#fff7d6" : "#3b220c", fontSize: 12, fontWeight: 800, fontFamily: '"Nunito", sans-serif' }}>
                      {character.display_name}
                    </span>
                    <span className="block truncate" style={{ color: isSelected ? "#f0c070" : "#a16207", fontSize: 9, fontFamily: '"Nunito", sans-serif' }}>
                      {character.era || "Nhân vật đã phát hành"}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {characterError && (
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            className="px-4 py-3 flex items-center justify-between gap-3"
            style={{ background: "#fff7ed", borderBottom: "1px solid rgba(217,119,6,0.2)" }}
          >
            <p style={{ color: "#9a3412", fontSize: 12, fontFamily: '"Nunito", sans-serif' }}>{characterError}</p>
            <button
              onClick={retryLoadCharacters}
              className="px-3 py-2 rounded-xl flex items-center gap-1.5"
              style={{ background: "rgba(217,119,6,0.12)", color: "#9a3412", fontSize: 11, fontWeight: 800 }}
            >
              <RefreshCw className="w-3 h-3" />
              Thử lại
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isLoadingCharacters && !characterError && characters.length === 0 && (
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mx-4 mt-4 rounded-2xl p-4 flex gap-3"
            style={{ background: "#fff7ed", border: "1px solid rgba(217,119,6,0.18)" }}
          >
            <UserRound className="w-5 h-5 shrink-0" style={{ color: "#d97706" }} />
            <p style={{ color: "#92400e", fontSize: 12, fontFamily: '"Nunito", sans-serif' }}>
              Chưa có nhân vật nào ở trạng thái phát hành. Hãy phát hành nhân vật trong Admin rồi tải lại trang.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isPremium && remainingMsgs <= 3 && remainingMsgs > 0 && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="px-4 py-2.5 flex items-center justify-between gap-3"
            style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(217,119,6,0.08))", borderBottom: "1px solid rgba(240,180,41,0.2)" }}
          >
            <p style={{ color: "#92400e", fontSize: 11, fontFamily: '"Nunito", sans-serif' }}>
              ⚠️ Còn <strong>{remainingMsgs}</strong> câu hỏi miễn phí hôm nay
            </p>
            <button
              onClick={() => setShowPremiumModal(true)}
              style={{ color: "#d97706", fontSize: 11, fontWeight: 700, fontFamily: '"Nunito", sans-serif', whiteSpace: "nowrap" }}
            >
              Nâng cấp →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-6">
        {messages.length <= 1 && selectedCharacter && (
          <div className="space-y-2 mb-4">
            <p style={{ color: "#a8a29e", fontSize: 11, fontFamily: '"Nunito", sans-serif', textAlign: "center" }}>💡 Gợi ý câu hỏi</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => sendMessage(suggestion)}
                  className="px-3 py-2 rounded-xl text-left"
                  style={{
                    background: "rgba(255,252,242,0.9)",
                    border: "1px solid rgba(240,180,41,0.25)",
                    color: "#92400e",
                    fontSize: 12,
                    fontFamily: '"Nunito", sans-serif',
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index === messages.length - 1 ? 0 : 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 self-end overflow-hidden"
              style={{
                background: msg.role === "ai"
                  ? "linear-gradient(135deg, #1c0800, #2d1400)"
                  : "linear-gradient(135deg, rgba(240,180,41,0.2), #fef3c7)",
                border: msg.role === "ai"
                  ? "1.5px solid rgba(240,180,41,0.35)"
                  : "1.5px solid rgba(240,180,41,0.4)",
              }}
            >
              {msg.role === "ai" ? (
                selectedCharacter?.portrait_url ? (
                  <img
                    src={selectedCharacter.portrait_url}
                    alt={selectedCharacter.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedIcon
                )
              ) : (
                user.avatar || "🦊"
              )}
            </div>

            <div
              className="max-w-[80%] px-4 py-3 rounded-2xl"
              style={{
                background: msg.role === "ai"
                  ? "linear-gradient(145deg, rgba(255,253,242,0.98), rgba(255,249,228,0.95))"
                  : "linear-gradient(135deg, #b85c00, #d97706)",
                border: msg.role === "ai"
                  ? "1px solid rgba(240,180,41,0.2)"
                  : "none",
                color: msg.role === "ai" ? "#1c1209" : "#fffbeb",
                fontSize: 13,
                fontFamily: '"Nunito", sans-serif',
                lineHeight: 1.65,
                boxShadow: msg.role === "ai"
                  ? "0 2px 12px rgba(0,0,0,0.06)"
                  : "0 3px 12px rgba(217,119,6,0.3)",
                borderBottomRightRadius: msg.role === "user" ? 4 : 16,
                borderBottomLeftRadius: msg.role === "ai" ? 4 : 16,
              }}
            >
              {formatContent(msg.content)}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 items-end"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm overflow-hidden shrink-0" style={{ background: "linear-gradient(135deg, #1c0800, #2d1400)", border: "1.5px solid rgba(240,180,41,0.35)" }}>
                {selectedCharacter?.portrait_url ? (
                  <img
                    src={selectedCharacter.portrait_url}
                    alt={selectedCharacter.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedIcon
                )}
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center" style={{ background: "rgba(255,253,242,0.98)", border: "1px solid rgba(240,180,41,0.2)" }}>
                {[0, 1, 2].map((item) => (
                  <motion.div
                    key={item}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, delay: item * 0.15, repeat: Infinity }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#d97706" }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isLimitReached && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 text-center"
              style={{ background: "linear-gradient(145deg, #1c0d00, #120800)", border: "1.5px solid rgba(240,180,41,0.3)" }}
            >
              <Lock className="w-6 h-6 mx-auto mb-2" style={{ color: "#f0b429" }} />
              <p style={{ color: "#f0c070", fontSize: 13, fontWeight: 700, fontFamily: '"Nunito", sans-serif', marginBottom: 4 }}>
                Đã hết 10 câu hỏi miễn phí
              </p>
              <p style={{ color: "#7a6040", fontSize: 11, fontFamily: '"Nunito", sans-serif', marginBottom: 16 }}>
                Nâng cấp Pro để chat không giới hạn với Sử Thần AI
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { playModal(); setShowPremiumModal(true); }}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #b85c00, #d97706, #f5b830)", color: "#1c0800", fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 13 }}
              >
                <Sparkles className="w-4 h-4" />
                Chat Không Giới Hạn với Pro
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      <div
        className="sticky bottom-0 px-4 py-3 pb-safe"
        style={{
          background: "rgba(250,245,232,0.96)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(240,180,41,0.2)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
          paddingBottom: "env(safe-area-inset-bottom, 12px)",
        }}
      >
        <div className="flex gap-2 max-w-2xl mx-auto">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder={isLimitReached ? "Nâng cấp Pro để tiếp tục..." : selectedCharacter ? `Hỏi ${selectedCharacter.display_name}...` : "Chưa có nhân vật để chat..."}
            disabled={isLimitReached || !selectedCharacter}
            className="flex-1 px-4 py-3 rounded-2xl outline-none"
            style={{
              background: "rgba(255,252,242,0.9)",
              border: "1.5px solid rgba(240,180,41,0.25)",
              color: "#1c1209",
              fontSize: 13,
              fontFamily: '"Nunito", sans-serif',
              boxShadow: "0 1px 4px rgba(0,0,0,0.05) inset",
            }}
          />
          <motion.button
            whileHover={!isLimitReached && selectedCharacter ? { scale: 1.05 } : {}}
            whileTap={!isLimitReached && selectedCharacter ? { scale: 0.95 } : {}}
            onClick={() => {
              if (isLimitReached) {
                playModal();
                setShowPremiumModal(true);
              } else {
                sendMessage(input);
              }
            }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: isLimitReached || !selectedCharacter
                ? "rgba(240,180,41,0.15)"
                : input.trim()
                  ? "linear-gradient(135deg, #b85c00, #d97706, #f0b429)"
                  : "rgba(240,180,41,0.15)",
              boxShadow: input.trim() && !isLimitReached && selectedCharacter ? "0 4px 0 #7c2d0a" : "none",
              color: input.trim() && !isLimitReached && selectedCharacter ? "#1c0800" : "#c4a882",
            }}
            aria-label="Gửi câu hỏi"
          >
            {isLimitReached ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {showPremiumModal && (
        <PremiumModal
          trigger="feature"
          onClose={() => setShowPremiumModal(false)}
        />
      )}
    </div>
  );
}
