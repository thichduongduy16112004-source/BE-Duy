# HISTORY_AI - Architecture Analysis & Reusability Guide

> **Phân tích chuyên sâu dự án History Simulacra AI để bóc tách UI Components và Features cho tái sử dụng**

---

## 📋 Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Kiến trúc tổng thể](#2-kiến-trúc-tổng-thể)
3. [Backend Analysis](#3-backend-analysis)
4. [Frontend Analysis](#4-frontend-analysis)
5. [Component Extraction Guide](#5-component-extraction-guide)
6. [Feature Extraction Guide](#6-feature-extraction-guide)
7. [Integration Guide](#7-integration-guide)

---

## 1. Tổng quan hệ thống

### 1.1 Công nghệ stack

**Backend:**
- Framework: **FastAPI** (Python 3.12+)
- Streaming: **Server-Sent Events (SSE)**
- AI/LLM: **Google Gemini API** (via Vertex AI)
- RAG Engine: Custom implementation (125KB rag_core.py)
- TTS: Custom provider integration
- Deployment: Python ASGI (Uvicorn)

**Frontend:**
- Framework: **Next.js 15** (App Router)
- UI Library: **React 19**
- Language: **TypeScript**
- State Management: **Zustand**
- Styling: **Tailwind CSS** + Custom CSS
- Icons: **Lucide React**
- Real-time: **Fetch API Streaming (SSE)**

### 1.2 Mục đích hệ thống

Ứng dụng chat với nhân vật lịch sử sử dụng:
- **RAG (Retrieval-Augmented Generation)**: Truy xuất tư liệu lịch sử để đảm bảo độ chính xác
- **Character Persona System**: Mỗi nhân vật có profile riêng, cách nói chuyện riêng
- **Visual Emotion System**: Hiển thị cảm xúc và hành động của nhân vật theo ngữ cảnh
- **Citation Tracking**: Mọi câu trả lời đều có nguồn trích dẫn tư liệu
- **Streaming Response**: Trả lời real-time, không chờ đợi
- **TTS Integration**: Chuyển text thành giọng nói nhập vai

### 1.3 Cấu trúc thư mục

```
history_ai/
├── backend/
│   ├── main.py                 # FastAPI entry point (579 lines)
│   ├── requirements.txt        # Minimal deps
│   └── __init__.py
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Main chat UI (458 lines)
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── CharacterViewer.tsx # Character animation (233 lines)
│   ├── lib/
│   │   ├── api.ts             # API client (93 lines)
│   │   └── store.ts           # Zustand store (130 lines)
│   ├── types.ts               # TypeScript types (75 lines)
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── quang_trung_web/           # Legacy code (CORE LOGIC)
│   ├── rag_core.py            # RAG pipeline (125KB!)
│   ├── llm_provider.py        # LLM integration (33KB)
│   ├── character_registry.py  # Character configs (3.9KB)
│   ├── tts_provider.py        # TTS provider (4.5KB)
│   ├── app.py                 # Legacy Flask app (22KB)
│   └── assets/                # Character images
│       ├── quang_trung/
│       ├── ho_chi_minh/
│       └── ...
├── *_dataset/                 # RAG data sources
│   ├── chunks.jsonl
│   └── profile.json
└── source_manifest.json       # Dataset metadata

```

---

## 2. Kiến trúc tổng thể

### 2.1 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js)                      │
├─────────────────────────────────────────────────────────────────┤
│  User Input → Zustand Store → API Client (SSE) → UI Update      │
│       ↑                           ↓                              │
│       └───────────── Real-time Stream ─────────────┘            │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/SSE
┌────────────────────────────┴────────────────────────────────────┐
│                       BACKEND (FastAPI)                          │
├─────────────────────────────────────────────────────────────────┤
│  API Endpoint → Character Registry → RAG Pipeline               │
│       │                                    ↓                     │
│       │                          Vector Retrieval                │
│       │                                    ↓                     │
│       │                          LLM Provider (Gemini)           │
│       │                                    ↓                     │
│       │                          TTS Provider                    │
│       └──────────────► SSE Stream ────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Request Lifecycle

**Phase 1: User Input**
1. User nhập câu hỏi → Form submit
2. Zustand store update → Add user message
3. API client gọi `/api/chat/stream` với POST request

**Phase 2: Backend Processing**
1. FastAPI nhận request → Parse character_id + message
2. Character Registry load profile & retriever
3. Local Route: Phân loại intent (identity, battle, philosophy...)
4. LLM Router (optional): Gemini phân tích query nâng cao
5. RAG Pipeline: 
   - Vector search tìm chunks liên quan
   - Ranking theo relevance score
   - Extract citations

**Phase 3: Streaming Response**
1. SSE Event "start": Gửi visual thinking state
2. SSE Event "retrieval": Gửi citations + mode
3. SSE Event "stream_start": Gửi visual answering state
4. SSE Event "token" (multiple): Stream từng token text
5. SSE Event "final": Gửi câu trả lời hoàn chỉnh + visual final state

**Phase 4: Post-processing**
1. Frontend nhận final answer
2. Gọi `/api/tts` để tạo audio
3. Update message với audioBase64
4. Auto-play audio

### 2.3 Key Design Patterns

**Pattern 1: Server-Sent Events (SSE)**
- Backend: `StreamingResponse` với generator function
- Frontend: `fetch()` với `response.body.getReader()`
- Format: `event: <event_name>\ndata: <json>\n\n`

**Pattern 2: State Machine (Visual System)**
```
States: idle → thinking → answering → speaking → idle
Emotions: idle, thinking, talking, happy, angry, sad, confused
Motions: none, thinking, attack (sprite animation)
```

**Pattern 3: Abort Controller**
- User switch character → abort current stream
- Prevent race condition với concurrent requests

**Pattern 4: Optimistic UI**
- Add user message immediately
- Add empty assistant message
- Stream fill assistant message progressively

---

## 3. Backend Analysis

### 3.1 File Structure & Responsibilities

#### 3.1.1 `main.py` (579 lines) - API Entry Point

**Core Functions:**

```python
# Lifespan: Preload tất cả characters vào memory
@asynccontextmanager
async def lifespan(_: FastAPI):
    runtime.preload()  # Load profiles + vector retrievers
    yield

# Health check
@app.get("/api/health")
def health() -> dict

# Get character list
@app.get("/api/characters")
def characters() -> dict

# Main chat endpoint (SSE streaming)
@app.post("/api/chat/stream")
def chat_stream(request: ChatStreamRequest) -> StreamingResponse

# TTS endpoint
@app.post("/api/tts")
def tts(request: TTSRequest) -> dict
```

**Helper Functions:**
- `visual_payload()`: Tính toán visual state từ query/answer/citations
- `stream_chat_response()`: Generator function cho SSE stream
- `should_stream_with_gemini()`: Logic quyết định có dùng LLM hay không
- `should_skip_llm_router()`: Logic skip LLM router cho intents đơn giản

**Visual Logic (Lines 94-271):**
Hàm `visual_payload()` là CORE của emotion system:
- Input: query, answer, profile, result, citations, phase
- Output: `{ intent, emotion, baseEmotion, motion, asset, action }`
- Logic: Pattern matching trên combined text (query + answer + metadata)

Example patterns:
```python
if "giặc" in combined or "ngoại xâm" in combined:
    emotion = "angry"
    asset = "angry.png"
elif "chiến thắng" in combined:
    emotion = "happy"
    asset = "happy.png"
elif character_id == "quang_trung" and is_quang_trung_self_name_confusion(query):
    emotion = "confused"
    asset = "confused.png"
```



#### 3.1.2 Legacy Code Modules (quang_trung_web/)

**ag_core.py (125KB) - RAG Pipeline Core**

Đây là module lớn nhất và phức tạp nhất, chứa:

**Core Components:**
- VectorRetriever: TF-IDF based vector search (không dùng embeddings)
- load_chunks(): Load dataset từ JSONL files
- load_profile(): Load character profile
- nswer_query(): Main RAG pipeline function
- local_route_query(): Deterministic intent classification
- query_intents(): Extract intents từ query
- is_identity_query(), is_private_life_query(): Intent detection helpers

**Key Functions:**

`python
def answer_query(
    query: str,
    profile: dict,
    retriever: VectorRetriever,
    generator: Any | None = None,
    route: dict | None = None,
) -> dict:
    # Returns: { answer, citations, mode, state, fallback_used }
    pass
`

**Modes:**
- etrieval: Trả lời từ RAG chunks
- pi: Trả lời từ LLM (Gemini)
- guardrail: Từ chối câu hỏi không phù hợp
- conversation: Chuyện phiếm, chào hỏi
- actual: Câu trả lời ngắn gọn từ profile

**States:**
- 	alking: Đang trả lời bình thường
- confused: Không hiểu câu hỏi

---

**llm_provider.py (33KB) - Gemini Integration**

**Core Functions:**
- oute_query_json(): Dùng Gemini classify intent
- stream_fused_generation(): Stream response từ Gemini với RAG context
- is_configured(): Check API key availability

**Error Handling:**
`python
class GeminiCallError(Exception):
    kind: str  # "quota_exhausted", "auth_error", "invalid_model", "network_error"
`

**Prompting Strategy:**
- System instruction: Character persona + role-playing rules
- RAG context injection: Top-K retrieved chunks
- Few-shot examples: Character-specific conversation patterns

---

**character_registry.py (3.9KB) - Character Configuration**

`python
CHARACTER_REGISTRY = {
    "quang_trung": {
        "display_name": "Quang Trung",
        "profile_path": Path("quang_trung_dataset/profile.json"),
        "chunks_path": Path("quang_trung_dataset/chunks.jsonl"),
        "asset_dir": Path("quang_trung_web/assets/quang_trung"),
        "edge_cases": [...],  # Test queries
        "tts_voice_id": "...",
    },
    "ho_chi_minh": {...},
    # ...
}

DEFAULT_CHARACTER_ID = "quang_trung"

def get_character_config(character_id: str) -> dict:
    return CHARACTER_REGISTRY[character_id]
`

---

**	ts_provider.py (4.5KB) - Text-to-Speech**

`python
def synthesize(text: str, character_id: str) -> TTSResult:
    # Returns: { ok, audio_base64, mime_type, message }
    pass
`

**Provider:** Custom TTS API (có thể là ElevenLabs, Google TTS, hoặc custom)

---

### 3.2 API Endpoints

#### GET /api/health
**Response:**
`json
{
  "ok": true,
  "runtime": "fastapi",
  "characters_loaded": ["quang_trung", "ho_chi_minh", ...],
  "llm_configured": true
}
`

#### GET /api/characters
**Response:**
`json
{
  "characters": [
    {
      "character_id": "quang_trung",
      "display_name": "Quang Trung",
      "era": "Nhà Tây Sơn (1788-1792)",
      "death_year": 1792,
      "edge_cases": ["Bạn có phải là Nguyễn Huệ không?", ...],
      "portrait_url": "/assets/quang_trung/idle.png"
    }
  ],
  "default_character_id": "quang_trung"
}
`

#### POST /api/chat/stream
**Request:**
`json
{
  "character_id": "quang_trung",
  "message": "Bạn đánh trận Ngọc Hồi - Đống Đa như thế nào?",
  "history": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
`

**Response:** SSE Stream
`
event: start
data: {"character_id": "quang_trung", "status": "Đang gợi ký ức", "visual": {...}}

event: retrieval
data: {"mode": "retrieval", "state": "talking", "citations": [...], "route": {...}}

event: stream_start
data: {"intent": "battle_detail", "emotion": "angry", "visual": {...}}

event: token
data: {"text": "Ta"}

event: token
data: {"text": " đã"}

event: final
data: {"answer": "Ta đã...", "citations": [...], "visual": {...}}
`

#### POST /api/tts
**Request:**
`json
{
  "character_id": "quang_trung",
  "text": "Ta đã hạ quyết tâm đánh tan quân Thanh"
}
`

**Response:**
`json
{
  "ok": true,
  "audio_base64": "//uQx...",
  "mime_type": "audio/mpeg",
  "message": "Audio generated successfully"
}
`

---

## 4. Frontend Analysis

### 4.1 Technology Stack

**Core:**
- **Next.js 15.0.4** (App Router, React Server Components)
- **React 19.0.0** (Latest with Concurrent Features)
- **TypeScript 5.7.2** (Strict mode)

**State Management:**
- **Zustand 5.0.1** (Lightweight, no boilerplate)

**Styling:**
- **Tailwind CSS 3.4.16** (Utility-first)
- **PostCSS 8.4.49** (CSS processing)
- **Custom CSS** (globals.css với advanced selectors)

**UI Libraries:**
- **Lucide React 0.468.0** (Icon system)

**Build Tools:**
- **Autoprefixer 10.4.20** (CSS vendor prefixes)
- **TypeScript 5.7.2** (Type checking)

### 4.2 Project Structure

`
frontend/
├── app/
│   ├── page.tsx              # Main chat page (458 lines)
│   ├── layout.tsx            # Root layout (metadata, fonts)
│   └── globals.css           # Global styles (3KB)
├── components/
│   └── CharacterViewer.tsx   # Character display (233 lines)
├── lib/
│   ├── api.ts                # API client (93 lines)
│   └── store.ts              # Zustand store (130 lines)
├── types.ts                  # TypeScript types (75 lines)
├── public/                   # Static assets (served by Next.js)
├── package.json              # Dependencies (28 lines)
├── next.config.mjs           # Next.js config
├── tailwind.config.ts        # Tailwind config
├── tsconfig.json             # TypeScript config
└── postcss.config.mjs        # PostCSS config
`

### 4.3 Type System (types.ts)

**Core Types:**

`	ypescript
// Character data
type Character = {
  character_id: string;
  display_name: string;
  era: string;
  death_year?: number;
  edge_cases: string[];
  portrait_url: string | null;
};

// Visual state machine
type VisualEmotion = "idle" | "thinking" | "talking" | "happy" | "angry" | "sad" | "confused";
type VisualMotion = "none" | "thinking" | "attack";

type CharacterVisual = {
  phase: "idle" | "thinking" | "answering" | "speaking";
  intent?: string;
  emotion: VisualEmotion;
  baseEmotion?: Exclude<VisualEmotion, "talking">;
  motion: VisualMotion;
  asset?: string;
  action?: "none" | "loop" | "play_once";
};

// Chat message
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  mode?: string;
  state?: string;
  audioBase64?: string | null;
  audioReady?: boolean;
  audioPending?: boolean;
};

// Citation data
type Citation = {
  chunk_id: string;
  source_title: string;
  source_url: string;
  source_year?: string | number;
  claim_status: string;
  source_tier?: number;
  source_quality_score?: number;
  answer_intents?: string[];
  tags?: string[];
  fact: string;
};

// SSE events
type StreamEvent =
  | { event: "start"; data: {...} }
  | { event: "retrieval"; data: {...} }
  | { event: "stream_start"; data: {...} }
  | { event: "token"; data: { text: string } }
  | { event: "final"; data: {...} }
  | { event: "error"; data: { message: string } };
`



### 4.4 State Management (lib/store.ts)

**Zustand Store Structure:**

`	ypescript
type HistoryState = {
  // Data
  characters: Character[];
  selectedCharacterId: string;
  messages: ChatMessage[];
  
  // UI state
  status: "idle" | "thinking" | "answering" | "audio" | "error";
  statusText: string;
  isSending: boolean;
  visual: CharacterVisual;
  
  // Actions
  setCharacters: (characters, defaultId) => void;
  selectCharacter: (characterId) => void;
  addMessage: (message) => void;
  updateAssistant: (id, patch) => void;
  appendAssistantText: (id, text) => void;
  setStatus: (status, text) => void;
  setSending: (value) => void;
  setVisual: (visual) => void;
  completeVisualMotion: () => void;
  beginSpeaking: () => void;
  endSpeaking: () => void;
  clearChat: () => void;
};
`

**Key Patterns:**

1. **Immutable Updates**: Spread operators cho nested objects
2. **Message Management**: Array operations (map, filter) cho updates
3. **Visual State Machine**: baseEmotion tracking để restore sau "talking"

### 4.5 API Client (lib/api.ts)

**Core Functions:**

`	ypescript
// Fetch character list
async function fetchCharacters(): Promise<{
  characters: Character[];
  default_character_id: string;
}>

// Stream chat with SSE
async function streamChat(
  characterId: string,
  message: string,
  history: {role, content}[],
  handlers: StreamHandlers,
  signal?: AbortSignal
): Promise<void>

// Synthesize audio
async function synthesizeAudio(
  characterId: string,
  text: string
): Promise<TTSResult>
`

**SSE Streaming Implementation:**

`	ypescript
// Manual ReadableStream parsing (không dùng EventSource)
const reader = response.body.getReader();
const decoder = new TextDecoder("utf-8");
let buffer = "";

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  
  buffer += decoder.decode(value, { stream: true });
  const blocks = buffer.split("\\n\\n");
  buffer = blocks.pop() || "";
  
  for (const block of blocks) {
    if (block.trim()) {
      dispatchEventBlock(block, handlers);
    }
  }
}
`

**Why not EventSource?**
- EventSource không hỗ trợ POST requests
- Cần custom headers (Content-Type)
- Cần AbortSignal để cancel

---

## 5. Component Extraction Guide

### 5.1 UI Components Breakdown

#### 5.1.1 **CharacterViewer Component** (Dumb Component Ready)

**Current State:** Tightly coupled với Character type

**Extracted Interface:**

`	ypescript
// Dumb component props
interface CharacterViewerProps {
  characterId: string;
  displayName: string;
  portraitUrl?: string;
  visual: {
    emotion: "idle" | "thinking" | "talking" | "happy" | "angry" | "sad" | "confused";
    motion: "none" | "thinking" | "attack";
    baseEmotion?: string;
  };
  onMotionComplete?: () => void;
}

// Usage
<CharacterViewer
  characterId="hero1"
  displayName="Hero Name"
  portraitUrl="/assets/hero1/idle.png"
  visual={{ emotion: "happy", motion: "none" }}
/>
`

**Extracted Logic:**
- Asset URL generation → getAssetUrl(characterId, filename)
- Sprite sheet animation → useSpriteAnimation(src, loop, onComplete)
- Static portrait animation → usePortraitAnimation(emotion, baseEmotion)

**Dependencies to Extract:**
- Asset path resolver
- Image preloading hook
- Animation timing constants

---

#### 5.1.2 **MessageBubble Component** (Dumb Component Ready)

**Current State:** Hardcoded styles, minimal coupling

**Extracted Interface:**

`	ypescript
interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{
    source_title: string;
    source_year?: string;
    claim_status: string;
    fact: string;
    source_url?: string;
  }>;
  audioBase64?: string;
  audioReady?: boolean;
  audioPending?: boolean;
  onAudioPlay?: () => void;
  onAudioStop?: () => void;
}
`

**Sub-components:**
- CitationList: Display citations
- AudioPlayer: Audio playback UI

---

#### 5.1.3 **AudioPlayer Component** (Fully Reusable)

**Extracted Interface:**

`	ypescript
interface AudioPlayerProps {
  audioBase64: string;
  mimeType?: string; // default: "audio/mpeg"
  autoPlay?: boolean;
  onPlay?: () => void;
  onStop?: () => void;
}

// Usage
<AudioPlayer
  audioBase64="//uQx..."
  autoPlay={true}
  onPlay={() => console.log("Playing")}
/>
`

**Features:**
- Progress bar với time display
- Play/Pause toggle
- Auto-play support
- Event callbacks

---

#### 5.1.4 **ChatInput Component** (Extract from page.tsx)

**Extracted Interface:**

`	ypescript
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}
`

---

### 5.2 Extraction Steps

**Step 1: Identify Props Dependencies**

Xem component đang nhận gì từ:
- Props trực tiếp
- Global state (Zustand)
- Context
- Hardcoded values

**Step 2: Create Props Interface**

Tạo interface với tất cả data cần thiết:

`	ypescript
// Before (coupled)
function MyComponent() {
  const { data } = useStore();
  return <div>{data.name}</div>;
}

// After (dumb)
interface MyComponentProps {
  name: string;
}
function MyComponent({ name }: MyComponentProps) {
  return <div>{name}</div>;
}
`

**Step 3: Extract Business Logic**

Move logic ra custom hooks:

`	ypescript
// Hook
function useCharacterData(characterId: string) {
  const [character, setCharacter] = useState(null);
  // Fetch logic here
  return character;
}

// Component
function CharacterDisplay({ characterId }: { characterId: string }) {
  const character = useCharacterData(characterId);
  return <CharacterViewer character={character} />;
}
`

**Step 4: Remove Hardcoded Styles**

Replace với theme/props:

`	ypescript
// Before
<div className="text-[#e5bd3b]">Text</div>

// After
<div className="text-primary">Text</div>
// OR
<div style={{ color: theme.colors.primary }}>Text</div>
`

---

## 6. Feature Extraction Guide

### 6.1 Core Features to Extract

#### Feature 1: **SSE Chat Streaming**

**Extracted Module:** useChatStream.ts

`	ypescript
interface UseChatStreamOptions {
  apiUrl: string; // "/api/chat/stream"
  onStart?: (data: any) => void;
  onToken?: (text: string) => void;
  onComplete?: (data: any) => void;
  onError?: (error: string) => void;
}

function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const startStream = async (
    characterId: string,
    message: string,
    options: UseChatStreamOptions
  ) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    // Streaming logic here
  };
  
  const stopStream = () => {
    abortControllerRef.current?.abort();
  };
  
  return { isStreaming, startStream, stopStream };
}
`

**Usage:**

`	ypescript
const { isStreaming, startStream } = useChatStream();

const handleSend = async (message: string) => {
  await startStream("hero1", message, {
    apiUrl: "/api/chat/stream",
    onToken: (text) => appendText(text),
    onComplete: (data) => console.log("Done", data),
  });
};
`

---

#### Feature 2: **Visual Emotion System**

**Extracted Module:** useVisualState.ts

`	ypescript
interface VisualState {
  emotion: string;
  motion: string;
  asset: string;
}

function useVisualState(initialState: VisualState) {
  const [visual, setVisual] = useState(initialState);
  
  const updateEmotion = (emotion: string) => {
    setVisual(prev => ({ ...prev, emotion }));
  };
  
  const triggerMotion = (motion: string, duration?: number) => {
    setVisual(prev => ({ ...prev, motion }));
    if (duration) {
      setTimeout(() => {
        setVisual(prev => ({ ...prev, motion: "none" }));
      }, duration);
    }
  };
  
  return { visual, updateEmotion, triggerMotion };
}
`

---

#### Feature 3: **Citation Management**

**Extracted Module:** useCitations.ts

`	ypescript
interface Citation {
  id: string;
  source_title: string;
  source_url: string;
  fact: string;
}

function useCitations() {
  const [citations, setCitations] = useState<Citation[]>([]);
  
  const addCitation = (citation: Citation) => {
    setCitations(prev => [...prev, citation]);
  };
  
  const clearCitations = () => {
    setCitations([]);
  };
  
  const getCitationSummary = () => {
    return \\ nguồn trích dẫn\;
  };
  
  return { citations, addCitation, clearCitations, getCitationSummary };
}
`

---

#### Feature 4: **TTS Audio Synthesis**

**Extracted Module:** useAudioSynthesis.ts

`	ypescript
function useAudioSynthesis(apiUrl: string) {
  const [isLoading, setIsLoading] = useState(false);
  
  const synthesize = async (
    characterId: string,
    text: string
  ): Promise<string | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character_id: characterId, text }),
      });
      const data = await response.json();
      return data.audio_base64;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { synthesize, isLoading };
}
`

---

### 6.2 Backend Feature Extraction

#### Feature: **RAG Pipeline** (Python)

**Extracted Module:** ag_pipeline.py

`python
class RAGPipeline:
    def __init__(self, chunks_path: str, profile_path: str):
        self.chunks = self._load_chunks(chunks_path)
        self.profile = self._load_profile(profile_path)
        self.retriever = VectorRetriever(self.chunks)
    
    def answer_query(
        self,
        query: str,
        top_k: int = 5
    ) -> dict:
        # Route query
        route = self._route_query(query)
        
        # Retrieve relevant chunks
        citations = self.retriever.search(query, top_k)
        
        # Generate answer
        answer = self._generate_answer(query, citations, route)
        
        return {
            "answer": answer,
            "citations": citations,
            "mode": route["mode"],
        }
`

**Dependencies:**
- VectorRetriever: TF-IDF search
- load_chunks(): JSONL loader
- load_profile(): JSON loader



---

## 7. Integration Guide

### 7.1 Dependencies

#### 7.1.1 Frontend Dependencies

**Core Framework:**
`json
{
  "dependencies": {
    "next": "^15.0.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.1",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.1",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.1",
    "typescript": "^5.7.2",
    "tailwindcss": "^3.4.16",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20"
  }
}
`

**Installation:**
`ash
npm install next@15 react@19 react-dom@19 zustand lucide-react
npm install -D typescript @types/node @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
`

---

#### 7.1.2 Backend Dependencies

**Core Framework:**
`	xt
fastapi>=0.115
uvicorn[standard]>=0.32
python-dotenv>=1.0
pydantic>=2.8
httpx>=0.27
`

**Additional (for full features):**
`	xt
# AI/LLM
google-cloud-aiplatform>=1.38  # For Gemini
# OR
openai>=1.0  # For OpenAI

# Vector/Text processing
scikit-learn>=1.3  # For TF-IDF
numpy>=1.24
`

**Installation:**
`ash
pip install fastapi uvicorn[standard] python-dotenv pydantic httpx
pip install google-cloud-aiplatform scikit-learn numpy
`

---

### 7.2 Environment Variables

#### Frontend (.env.local)

`ash
# API endpoint (if backend không cùng domain)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Feature flags (optional)
NEXT_PUBLIC_ENABLE_TTS=true
NEXT_PUBLIC_ENABLE_VISUAL_EFFECTS=true
`

#### Backend (.env)

`ash
# LLM Provider (Gemini)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GEMINI_MODEL=gemini-1.5-flash  # or gemini-1.5-pro

# Feature Flags
FAST_LOCAL_RETRIEVAL=1  # Skip LLM router for simple queries
HISTORY_DEBUG_ERRORS=0  # Set to 1 for detailed error logs

# TTS Provider (if using external service)
TTS_API_KEY=your-tts-api-key
TTS_API_URL=https://api.tts-provider.com/synthesize

# CORS (if frontend khác domain)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
`

---

### 7.3 Setup Instructions

#### Step 1: Clone and Install

`ash
# Clone project
git clone <repo-url> history_ai
cd history_ai

# Install frontend
cd frontend
npm install
npm run dev  # Chạy trên port 3000

# Install backend (terminal khác)
cd ../backend
pip install -r requirements.txt
# OR nếu dùng uv
uv pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env với API keys

# Run backend
uvicorn main:app --reload --port 8000
`

#### Step 2: Prepare Data

**Dataset Structure:**
`
project_root/
├── character_dataset/
│   ├── chunks.jsonl      # RAG chunks
│   └── profile.json      # Character profile
└── quang_trung_web/assets/
    └── character_id/
        ├── idle.png
        ├── thinking.png
        ├── happy.png
        └── ...
`

**chunks.jsonl format:**
`jsonl
{"chunk_id": "001", "text": "Historical fact...", "source_title": "Book Name", "source_url": "...", "tags": ["war", "strategy"]}
{"chunk_id": "002", "text": "Another fact...", ...}
`

**profile.json format:**
`json
{
  "character_id": "hero1",
  "character_metadata": {
    "era": "1788-1792",
    "death_year": 1792,
    "birth_year": 1753
  },
  "identity_facts": [...],
  "conversation_examples": [...]
}
`

#### Step 3: Register Character

**Edit character_registry.py:**
`python
CHARACTER_REGISTRY["hero1"] = {
    "display_name": "Hero Name",
    "profile_path": Path("hero1_dataset/profile.json"),
    "chunks_path": Path("hero1_dataset/chunks.jsonl"),
    "asset_dir": Path("quang_trung_web/assets/hero1"),
    "edge_cases": ["Test query 1", "Test query 2"],
    "tts_voice_id": "voice_id_from_provider",
}
`

---

### 7.4 Minimal Reusable Setup (No Backend Legacy Code)

Nếu muốn tái sử dụng UI + tự implement backend:

**Frontend:** Giữ nguyên toàn bộ
**Backend:** Chỉ cần implement 3 endpoints:

`python
@app.get("/api/characters")
def characters():
    return {
        "characters": [...],
        "default_character_id": "hero1"
    }

@app.post("/api/chat/stream")
async def chat_stream(request: ChatStreamRequest):
    async def generate():
        yield sse_event("start", {"character_id": "hero1", "status": "Thinking"})
        yield sse_event("token", {"text": "Hello"})
        yield sse_event("final", {"answer": "Hello", "citations": []})
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/api/tts")
def tts(request: TTSRequest):
    # Call your TTS service
    return {"ok": True, "audio_base64": "..."}
`

**SSE Event Format:**
`python
def sse_event(event: str, data: dict) -> str:
    import json
    return f"event: {event}\\ndata: {json.dumps(data)}\\n\\n"
`

---

### 7.5 Common Pitfalls & Solutions

#### Pitfall 1: CORS Errors

**Problem:** Frontend không gọi được backend API

**Solution:**
`python
# Backend: Add CORS middleware
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
`

#### Pitfall 2: SSE Stream Bị Cắt

**Problem:** Stream bị disconnect giữa chừng

**Solution:**
`python
# Backend: Add proper headers
headers = {
    "Cache-Control": "no-cache, no-transform",
    "X-Accel-Buffering": "no",
    "Connection": "keep-alive",
}
return StreamingResponse(generate(), media_type="text/event-stream", headers=headers)
`

#### Pitfall 3: Image Assets Không Load

**Problem:** Character images 404

**Solution:**
`python
# Backend: Mount static files
from fastapi.staticfiles import StaticFiles
app.mount("/assets", StaticFiles(directory="quang_trung_web/assets"), name="assets")
`

`	ypescript
// Frontend: Check asset URL
const assetUrl = (characterId, filename) => {
  return /assets//?v=;
};
`

#### Pitfall 4: Zustand State Không Update

**Problem:** Component không re-render khi state thay đổi

**Solution:**
`	ypescript
// Đảm bảo destructure đúng
const { messages, setMessages } = useHistoryStore();  // ✅
// NOT
const store = useHistoryStore();  // ❌ (không reactive)
`

---

### 7.6 Performance Optimization

**Frontend:**
1. **Lazy load components:**
   `	ypescript
   const CharacterViewer = dynamic(() => import('./CharacterViewer'), {
     loading: () => <div>Loading...</div>,
   });
   `

2. **Memoize expensive computations:**
   `	ypescript
   const sortedCitations = useMemo(
     () => citations.sort((a, b) => ...),
     [citations]
   );
   `

3. **Debounce user input:**
   `	ypescript
   const debouncedQuery = useDebounce(input, 300);
   `

**Backend:**
1. **Preload characters at startup:**
   `python
   @asynccontextmanager
   async def lifespan(app: FastAPI):
       runtime.preload()  # Load all trong memory
       yield
   `

2. **Cache vector retrievers:**
   `python
   # Không tạo mới mỗi request
   retrievers = {}  # Character ID -> Retriever
   `

3. **Stream tokens progressively:**
   `python
   # Yield ngay khi có token, không đợi batch
   for token in llm.stream():
       yield sse_event("token", {"text": token})
   `

---

### 7.7 Security Considerations

**1. Input Validation:**
`python
from pydantic import BaseModel, Field

class ChatStreamRequest(BaseModel):
    character_id: str
    message: str = Field(min_length=1, max_length=2000)  # Limit length
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)  # Limit history
`

**2. Rate Limiting:**
`python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/api/chat/stream")
@limiter.limit("10/minute")  # Max 10 requests/minute
async def chat_stream(...):
    ...
`

**3. API Key Protection:**
`python
# NEVER commit .env files
# Use secrets manager in production
import os
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("Missing API key")
`

**4. Sanitize User Input:**
`python
import html
message = html.escape(request.message)  # Prevent XSS
`

---

## 8. Conclusion

### 8.1 Summary

Dự án **History_AI** là một hệ thống chat AI phức tạp với:
- **Backend:** FastAPI + RAG pipeline + LLM integration
- **Frontend:** Next.js 15 + React 19 + Real-time streaming
- **Features:** Character persona, visual emotions, TTS, citation tracking

### 8.2 Reusability Checklist

**✅ UI Components đã sẵn sàng tái sử dụng:**
- CharacterViewer (animation + sprite sheets)
- MessageBubble (chat UI)
- CitationList (source display)
- AudioPlayer (TTS playback)

**✅ Features có thể bóc tách:**
- SSE streaming client (useChatStream hook)
- Visual emotion system (useVisualState hook)
- Citation management (useCitations hook)
- Audio synthesis (useAudioSynthesis hook)

**✅ Backend có thể tái sử dụng:**
- RAG pipeline (rag_core.py)
- LLM provider wrapper (llm_provider.py)
- Character registry pattern
- SSE streaming pattern

### 8.3 Next Steps

1. **Bóc tách UI:** Tạo component library riêng với Storybook
2. **Extract hooks:** Publish các custom hooks lên npm
3. **API standardization:** Tạo OpenAPI spec cho backend
4. **Documentation:** Viết JSDoc/TSDoc cho mọi component
5. **Testing:** Thêm unit tests + integration tests

### 8.4 Quick Start Command Reference

`ash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

# Full stack
docker-compose up  # If using Docker
`

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-17  
**Author:** Architecture Analysis Team

