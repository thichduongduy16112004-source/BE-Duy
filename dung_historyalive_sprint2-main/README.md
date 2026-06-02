# History Alive - Interactive Learning App 🎓

<div align="center">

![History Alive](https://img.shields.io/badge/History-Alive-FCCF03?style=for-the-badge&logo=react&logoColor=white)
![Mobile First](https://img.shields.io/badge/Mobile-First-4285F4?style=for-the-badge&logo=apple&logoColor=white)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

*Ứng dụng học lịch sử tương tác dành cho học sinh - Thiết kế đẹp, Học vui!*

[Demo](#-demo) • [Features](#-features) • [Installation](#-installation) • [Documentation](#-documentation)

</div>

---

## 📱 About

**History Alive** là một ứng dụng mobile-first giúp học sinh học lịch sử một cách sinh động và tương tác thông qua:
- 🎬 **Video lessons** với quiz checkpoints
- 💬 **AI Chat** với các nhân vật lịch sử
- 🎮 **Gamification** với leaderboard và streak tracking
- 📚 **Personalized learning** dựa trên sở thích và trình độ

### Device Specifications
- **Target Device:** iPhone 16 Pro
- **Screen Size:** 402 x 874 px
- **Design System:** Mobile-first, responsive
- **Primary Color:** #FCCF03 (Vibrant Yellow)

---

## ✨ Features

### 🎯 Core Features

#### 1. Complete Onboarding Flow (9 Screens)
- ✅ Welcome screen with brand introduction
- ✅ Sign Up / Login with validation
- ✅ Age selection (6-10, 11-14, 15-18, 18+)
- ✅ Name input
- ✅ Email input  
- ✅ Subject selection (multiple)
- ✅ Grade selection (6-12)
- ✅ Study time preference (15-60 mins)
- ✅ Smooth progress indication

#### 2. Home Dashboard
- ✅ Interactive timeline with lesson nodes
- ✅ Progress tracking (completed, active, locked)
- ✅ Character portraits with "Tap to ask" CTA
- ✅ Bottom navigation to all sections
- ✅ Beautiful beige aesthetic with yellow accents

#### 3. AI Chat with Historical Figures 🆕
- ✅ Chat with Nguyễn Trãi (expandable to more characters)
- ✅ Portrait display with gradient overlay
- ✅ Bubble chat interface (AI vs User)
- ✅ Voice input button
- ✅ Real-time conversation UI
- ✅ Fixed input area with send button
- ✅ Scrollable chat history

**Sample Conversation:**
```
NGUYỄN TRÃI: "Chào hậu sinh! Con có biết ta đã viết 
áng thiên cổ hùng văn nào để bá cáo thiên hạ không?"

YOU: "Dạ, có phải là Bình Ngô Đại Cáo không?"

NGUYỄN TRÃI: "Chính xác! 'Việc nhân nghĩa cốt ở yên dân'..."
```

#### 4. Video Lesson with Interactive Quiz 🆕
- ✅ Embedded video player (16:9 aspect ratio)
- ✅ Play/pause controls with progress bar
- ✅ Checkpoint system (3 stages)
  - CP1: Completed (green checkmark)
  - CP2: Active (yellow pulsing dot)
  - CP3: Locked (gray lock)
- ✅ Quiz cards at each checkpoint
- ✅ Multiple choice questions (4 options)
- ✅ Instant feedback (correct = green, wrong = trigger feedback)
- ✅ Progress tracking badge ("Checkpoint 2")
- ✅ Sticky bottom button: "XÁC NHẬN & TIẾP TỤC"

**Quiz Flow:**
```
Watch Video → Checkpoint Reached → Answer Quiz
    ↓                                    ↓
Correct Answer                    Wrong Answer
    ↓                                    ↓
Continue to Next                  Show Feedback
Checkpoint                        & Require Rewatch
```

#### 5. Wrong Answer Feedback Screen 🆕
- ✅ Dramatic dark background with dimmed video
- ✅ White feedback card with red top border
- ✅ Status icon: Red X with "Sai rồi!"
- ✅ Question review section
- ✅ User's wrong answer highlighted in RED
- ✅ Correct answer highlighted in GREEN
- ✅ Detailed explanation box (yellow tinted)
- ✅ Warning banner: "Xem lại đoạn video này!"
- ✅ Locked progress bar at bottom
  - Green: Already watched
  - Red: Locked segment (must rewatch)
  - Gray: Future content
- ✅ CTA button: "XEM LẠI & HỌC TIẾP"

**Educational Loop:**
```
Wrong Answer → See Mistake → Read Explanation 
    → Rewatch Video → Retry Quiz → Master Concept ✓
```

#### 6. Additional Screens
- ✅ Practice Modes (various learning activities)
- ✅ Leaderboard (competitive rankings)
- ✅ User Profile (achievements, stats)
- ✅ Premium Features (upgrade options)

### 🎨 Design Highlights

- **Mobile-Optimized:** Every pixel designed for 402x874 iPhone frame
- **Tactile Buttons:** 3D shadow effects that respond to clicks
- **Yellow Theme:** #FCCF03 as primary brand color
- **Beige Background:** #f5f5dc for warm, educational feel
- **Smooth Animations:** 300ms transitions, pulse effects, smart animate
- **Safe Areas:** 16-20px margins from screen edges
- **Touch Targets:** 50-64px heights for easy thumb access
- **Rounded Corners:** 12-48px for modern, friendly UI

---

## 🚀 Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4.1** - Utility-first styling
- **React Router 7.13** - Client-side routing
- **Lucide React** - Icon system
- **Motion** - Animations (Framer Motion successor)

### Design System
- **Figma Imports** - Direct component exports
- **Custom Mobile Components** - Hand-crafted for 402x874
- **Responsive Utilities** - Tailwind v4 features
- **CSS Variables** - Theme customization

### Development
- **Vite 6.3** - Lightning-fast build tool
- **ESM** - Modern module system
- **Hot Module Replacement** - Instant updates

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd history-alive-app

# Install dependencies
pnpm install
# or
npm install

# Start development server
pnpm dev
# or
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

### Build for Production

```bash
# Build optimized bundle
pnpm build

# Preview production build
pnpm preview
```

---

## 🗂️ Project Structure

```
history-alive-app/
├── src/
│   ├── app/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── MobileWelcomeScreen.tsx
│   │   │   ├── MobileSignUpScreen.tsx
│   │   │   ├── MobileLoginScreen.tsx
│   │   │   ├── MobileAgeSelectionScreen.tsx
│   │   │   ├── MobileNameInputScreen.tsx
│   │   │   ├── MobileEmailInputScreen.tsx
│   │   │   ├── MobileSubjectSelectionScreen.tsx
│   │   │   ├── MobileGradeSelectionScreen.tsx
│   │   │   └── MobileStudyTimeSelectionScreen.tsx
│   │   │
│   │   ├── screens/             # Page-level components
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── SignUpScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── AgeSelectionScreen.tsx
│   │   │   ├── NameInputScreen.tsx
│   │   │   ├── EmailInputScreen.tsx
│   │   │   ├── SubjectSelectionScreen.tsx
│   │   │   ├── GradeSelectionScreen.tsx
│   │   │   ├── StudyTimeSelectionScreen.tsx
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── PracticeModesScreen.tsx
│   │   │   ├── LeaderboardScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── PremiumScreen.tsx
│   │   │   ├── AIChatScreen.tsx         # 🆕 AI conversation
│   │   │   ├── VideoLessonScreen.tsx    # 🆕 Video + Quiz
│   │   │   └── WrongAnswerScreen.tsx    # 🆕 Feedback
│   │   │
│   │   ├── context/             # React Context providers
│   │   ├── routes.tsx           # Router configuration
│   │   └── App.tsx              # Root component
│   │
│   ├── imports/                 # Figma design imports
│   │   ├── Body-5-2344.tsx           # AI Chat UI
│   │   ├── Body-5-2354.tsx           # Video Lesson UI
│   │   ├── HistoryAliveWrongAnswerRewatch-5-2350.tsx
│   │   ├── HistoryTimelineScreen.tsx
│   │   ├── svg-*.ts                   # SVG path data
│   │   └── ...                        # Other imports
│   │
│   ├── styles/
│   │   ├── theme.css            # CSS variables
│   │   └── fonts.css            # Font imports
│   │
│   └── main.tsx                 # App entry point
│
├── public/                      # Static assets
├── docs/                        # Documentation
│   ├── MOBILE_DESIGN_SPECS.md        # Design system specs
│   ├── PROTOTYPE_FLOW_UPDATED.md     # Complete flow docs
│   └── DEMO_NAVIGATION_GUIDE.md      # Testing guide
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md                    # You are here!
```

---

## 🎮 Usage Guide

### Navigation Flow

#### For New Users:
```
1. Welcome Screen (/)
2. Sign Up (/signup)
3. Onboarding Flow (7 steps)
4. Home Dashboard (/home)
```

#### For Returning Users:
```
1. Welcome Screen (/)
2. Login (/login)
3. Home Dashboard (/home)
```

### Main Features Access

From **Home Screen** (`/home`):

| Feature | How to Access |
|---------|---------------|
| **AI Chat** | Tap character portrait or "Chạm để hỏi..." text |
| **Video Lesson** | Tap active lesson node (yellow circle) on timeline |
| **Practice Modes** | Tap ⚔️ icon in bottom navigation |
| **Leaderboard** | Tap 🏆 icon in bottom navigation |
| **Premium** | Tap 💎 icon in bottom navigation |
| **Profile** | Tap 👤 icon in bottom navigation |

### Interactive Elements

#### AI Chat Screen (`/ai-chat`):
- **← Back:** Return to home
- **⚙️ Settings:** Open settings (demo)
- **🎤 Voice Input:** Start voice recording (demo)
- **Text Input:** Type your question
- **➤ Send:** Send message (demo)

#### Video Lesson Screen (`/video-lesson`):
- **← Back / ✕ Close:** Return to home
- **▶️ Play Button:** Play/pause video
- **Progress Bar:** Shows watched progress
- **Answer Options:** Tap to select
- **Submit Button:** Check answer & continue

#### Wrong Answer Screen (`/wrong-answer`):
- **← Back:** Return to video lesson
- **"XEM LẠI & HỌC TIẾP":** Replay video segment

---

## 📚 Documentation

### Available Guides

1. **[MOBILE_DESIGN_SPECS.md](./MOBILE_DESIGN_SPECS.md)**
   - Complete design system documentation
   - Component specifications
   - Color palette and typography
   - Mobile UX guidelines
   - Interactive state definitions

2. **[PROTOTYPE_FLOW_UPDATED.md](./PROTOTYPE_FLOW_UPDATED.md)**
   - Complete navigation flow
   - All 18 screens documented
   - User journey scenarios
   - Technical implementation notes
   - Testing checklist

3. **[DEMO_NAVIGATION_GUIDE.md](./DEMO_NAVIGATION_GUIDE.md)**
   - Step-by-step testing guide
   - Interactive element locations
   - Demo scenarios
   - Troubleshooting tips
   - Visual testing checklist

### Key Concepts

#### Mobile-First Design
All screens are designed for **402 x 874 px** (iPhone 16 Pro):
```tsx
<div className="w-[402px] h-[874px] relative overflow-hidden">
  {/* Screen content */}
</div>
```

Centered on larger displays:
```tsx
<div className="flex items-center justify-center min-h-screen">
  {/* Mobile frame */}
</div>
```

#### Click Detection Pattern
```tsx
const handleClick = (e: React.MouseEvent) => {
  const target = e.target as HTMLElement;
  
  if (target.closest('[data-name="Component"]')) {
    // Handle interaction
    navigate('/route');
  }
};
```

#### Navigation Pattern
```tsx
import { useNavigate } from 'react-router';

export default function Screen() {
  const navigate = useNavigate();
  
  return (
    <div onClick={handleClick}>
      <ImportedComponent />
    </div>
  );
}
```

---

## 🎨 Design System

### Color Palette

#### Primary Colors
```css
--primary-yellow: #FCCF03;
--yellow-border: #e5b800;
--yellow-hover: #ffd633;
```

#### Semantic Colors
```css
--success: #22c55e;
--error: #ef4444;
--warning: #f97316;
```

#### Neutral Colors
```css
--background: #f5f5dc;    /* Beige */
--surface: #ffffff;       /* White */
--text-dark: #0f172a;     /* Almost black */
--text-gray: #64748b;     /* Medium gray */
```

### Typography

#### Font Families
- **Be Vietnam Pro** - Primary UI font
- **Plus Jakarta Sans** - Headings and CTAs
- **Lexend** - Data displays

#### Font Sizes
```css
--text-xs: 10px;
--text-sm: 12px;
--text-base: 14px;
--text-lg: 16px;
--text-xl: 18px;
--text-2xl: 20px;
--text-3xl: 30px;
```

### Spacing Scale
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
```

### Border Radius
```css
--radius-sm: 12px;
--radius-md: 16px;
--radius-lg: 48px;
--radius-full: 9999px;
```

---

## 🧪 Testing

### Manual Testing Checklist

#### Onboarding Flow
- [ ] Welcome screen displays correctly
- [ ] Sign Up form validation works
- [ ] All 7 onboarding steps complete
- [ ] Progress indicators show correctly
- [ ] Can navigate back through steps

#### Home Screen
- [ ] Timeline renders with nodes
- [ ] Bottom navigation works
- [ ] Character portrait is clickable
- [ ] Lesson nodes respond to clicks

#### AI Chat
- [ ] Chat interface loads
- [ ] Messages display correctly (AI vs User)
- [ ] Input field is functional
- [ ] Send button is clickable
- [ ] Back navigation works

#### Video Lesson
- [ ] Video player renders
- [ ] Checkpoints show correct states
- [ ] Quiz card displays
- [ ] Answer selection works
- [ ] Submit button navigates correctly

#### Wrong Answer Feedback
- [ ] Displays after wrong answer
- [ ] Shows both answers correctly
- [ ] Explanation is readable
- [ ] Progress bar shows locked state
- [ ] Rewatch button works

### Browser Testing
- ✅ Chrome/Edge (Chromium)
- ✅ Safari (iOS)
- ✅ Firefox
- ⚠️ Mobile Safari (Recommended)
- ⚠️ Chrome Mobile (Recommended)

### Device Testing
- ✅ iPhone 16 Pro (402 x 874)
- ✅ iPhone 14 Pro (393 x 852)
- ⚠️ iPhone SE (375 x 667) - May need adjustments
- ✅ Desktop (shows centered frame)

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Netlify
```bash
# Build command
npm run build

# Publish directory
dist
```

### Environment Variables
```env
# .env.local (not committed)
VITE_API_URL=your-api-url
VITE_AI_API_KEY=your-ai-key
```

---

## 🤝 Contributing

### Development Workflow

1. **Create a feature branch**
```bash
git checkout -b feature/new-screen
```

2. **Make changes**
   - Follow existing code patterns
   - Use mobile-first approach
   - Test on 402x874 viewport

3. **Test thoroughly**
   - Check all interactive elements
   - Verify navigation
   - Test on mobile device

4. **Commit with clear message**
```bash
git commit -m "feat: Add new quiz type screen"
```

5. **Push and create PR**
```bash
git push origin feature/new-screen
```

### Code Style

- Use TypeScript for type safety
- Follow React hooks best practices
- Use Tailwind CSS for styling
- Keep components under 200 lines
- Add comments for complex logic

---

## 📈 Roadmap

### Phase 1: Prototype ✅ (Current)
- [x] Complete onboarding flow
- [x] Home dashboard
- [x] AI chat interface
- [x] Video lesson with quiz
- [x] Wrong answer feedback
- [x] Navigation system
- [x] Mobile-first design

### Phase 2: MVP 🚧 (Next)
- [ ] Backend API integration
- [ ] Real video player (YouTube/Vimeo)
- [ ] AI chat service (OpenAI/Claude)
- [ ] User authentication (Firebase/Supabase)
- [ ] Progress persistence
- [ ] Analytics tracking

### Phase 3: Enhancement 📋 (Future)
- [ ] Multiple historical characters
- [ ] More lesson topics
- [ ] Advanced quiz types (matching, fill-in)
- [ ] Achievement badges
- [ ] Social features (share progress)
- [ ] Offline mode
- [ ] Parent dashboard

### Phase 4: Scale 🌟 (Vision)
- [ ] Multi-language support
- [ ] Adaptive learning AI
- [ ] VR/AR experiences
- [ ] Live teacher sessions
- [ ] Marketplace for content creators

---

## 🐛 Known Issues

### Current Limitations
- ⚠️ Video player is visual mockup (no real playback)
- ⚠️ AI chat is UI only (no actual AI integration)
- ⚠️ No backend (all state is local)
- ⚠️ Limited to 3 checkpoints per lesson
- ⚠️ Single character (Nguyễn Trãi) available

### Planned Fixes
- 🔧 Integrate real video API
- 🔧 Connect AI service
- 🔧 Add database persistence
- 🔧 Implement dynamic checkpoint system
- 🔧 Add character selection feature

---

## 📞 Support

### Get Help
- 📧 Email: support@historyalive.edu.vn (example)
- 💬 Discord: [Join our community](#) (example)
- 🐛 Issues: [GitHub Issues](#) (example)

### Resources
- [Design Specs](./MOBILE_DESIGN_SPECS.md)
- [Flow Documentation](./PROTOTYPE_FLOW_UPDATED.md)
- [Demo Guide](./DEMO_NAVIGATION_GUIDE.md)
- [Figma Designs](#) (link to your Figma file)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

### Design Inspiration
- **Duolingo** - Gamification & engagement
- **Khan Academy** - Educational content structure
- **Character.AI** - Conversational AI interface

### Technologies
- React Team for amazing framework
- Tailwind Labs for utility-first CSS
- Lucide for beautiful icons
- Vercel for hosting infrastructure

### Fonts
- Be Vietnam Pro by Cadson Demak
- Plus Jakarta Sans by Tokotype
- Lexend by Bonnie Shaver-Troup

---

## 📊 Stats

- **Total Screens:** 18
- **Components:** 50+
- **Lines of Code:** ~5,000
- **Design Files:** 40+ Figma imports
- **Color Palette:** 20+ colors
- **Animations:** 10+ micro-interactions

---

<div align="center">

**Built with ❤️ for Vietnamese Students**

*Learning history should be fun, interactive, and memorable!*

---

**[⬆ Back to Top](#history-alive---interactive-learning-app-)**

</div>
