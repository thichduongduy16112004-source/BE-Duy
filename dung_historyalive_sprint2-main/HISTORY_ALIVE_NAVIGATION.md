# History Alive - Navigation Flow

## 🎯 Tổng Quan
Ứng dụng History Alive là một prototype đầy đủ với 17 màn hình, bao gồm onboarding flow và main app features.

## 📱 Cấu Trúc Navigation

### A. ONBOARDING FLOW (Screens 1-9)

#### Luồng Người Dùng Mới:
```
Welcome (/) 
  → Sign Up (/signup)
  → Age Selection (/onboarding/age)
  → Name Input (/onboarding/name)
  → Email Input (/onboarding/email)
  → Subject Selection (/onboarding/subject)
  → Grade Selection (/onboarding/grade)
  → Study Time (/onboarding/study-time)
  → Home Screen (/home)
```

#### Luồng Người Dùng Cũ:
```
Welcome (/)
  → Login (/login)
  → Home Screen (/home)
```

### B. MAIN APP (Screens 10-17)

#### Bottom Navigation (5 Tabs):
1. **🗺️ Home** (`/home`) - Lộ trình học với timeline
2. **⚔️ Practice** (`/practice`) - 5 chế độ luyện tập
3. **🏆 Leaderboard** (`/leaderboard`) - Xếp hạng
4. **💎 Premium** (`/premium`) - 2 gói nâng cấp
5. **👤 Profile** (`/profile`) - Thông tin cá nhân

#### Additional Screens:
- **💬 AI Chat** (`/ai-chat`) - Trò chuyện với nhân vật lịch sử
- **📹 Video Lesson** (`/video-lesson`) - Học qua video + quiz
- **❌ Wrong Answer** (`/wrong-answer`) - Màn hình xem lại khi trả lời sai

## 🎮 Chi Tiết Các Màn Hình

### 1. Welcome Screen (/)
**Chức năng:**
- Hiển thị logo và giới thiệu app
- 2 CTA buttons: "Bắt đầu ngay" và "Tôi đã có tài khoản"

**Navigation:**
- "Bắt đầu ngay" → `/signup`
- "Tôi đã có tài khoản" → `/login`

---

### 2. Sign Up Screen (/signup)
**Chức năng:**
- Đăng ký bằng Google/Facebook OAuth
- Hoặc đăng ký thủ công (username, password, confirm password)

**Navigation:**
- Back button → `/`
- Google/Facebook OAuth → `/onboarding/age`
- Đăng ký thành công → `/onboarding/age`
- "Đã có tài khoản?" link → `/login`

---

### 3. Login Screen (/login)
**Chức năng:**
- Đăng nhập bằng Google/Facebook OAuth
- Hoặc đăng nhập thủ công (username/email, password)
- Link "Quên mật khẩu?"

**Navigation:**
- Back button → `/`
- Đăng nhập thành công → `/home` (bỏ qua onboarding)
- "Chưa có tài khoản?" → `/signup`

---

### 4. Age Selection (/onboarding/age)
**Progress:** 1/6

**Chức năng:**
- Chọn 1 trong 4 nhóm tuổi: 6-10, 11-14, 15-18, 18+
- Highlight với viền vàng #fbce03

**Navigation:**
- Back → `/signup`
- Continue → `/onboarding/name`

---

### 5. Name Input (/onboarding/name)
**Progress:** 2/6

**Chức năng:**
- Nhập họ và tên (2 input fields)
- Button "Tiếp tục" chỉ active khi cả 2 fields có data

**Navigation:**
- Back → `/onboarding/age`
- Continue → `/onboarding/email`

---

### 6. Email Input (/onboarding/email)
**Progress:** 3/6

**Chức năng:**
- Nhập email
- Validate format email (phải có @)

**Navigation:**
- Back → `/onboarding/name`
- Continue → `/onboarding/subject`

---

### 7. Subject Selection (/onboarding/subject)
**Progress:** 4/6

**Chức năng:**
- Chọn chủ đề: Lịch sử Việt Nam 🏛️ hoặc Lịch sử Thế Giới 🌍
- Có thể multi-select (chọn cả 2)

**Navigation:**
- Back → `/onboarding/email`
- Continue → `/onboarding/grade`

---

### 8. Grade Selection (/onboarding/grade)
**Progress:** 5/6

**Chức năng:**
- Grid chọn lớp: 1-5 (Tiểu Học), 6-9 (THCS), 10-12 (THPT)
- Chọn 1 lớp

**Navigation:**
- Back → `/onboarding/subject`
- Continue → `/onboarding/study-time`

---

### 9. Study Time Selection (/onboarding/study-time)
**Progress:** 6/6 (100% - glow effect)

**Chức năng:**
- Chọn thời gian học mỗi ngày: 5, 10, 15, 20, 30, 45, 60 phút
- Hiển thị subtitle cho từng option (Khởi động, Nhẹ nhàng, etc.)

**Navigation:**
- Back → `/onboarding/grade`
- "BẮT ĐẦU HỌC! 🎉" → `/home`

---

### 10. Home Screen (/home)
**Chức năng:**
- **Timeline lộ trình h��c** với các nodes:
  - Active nodes (có thể click vào học)
  - Completed nodes (xem lại)
  - Locked nodes 🔒 (chưa mở)
- **Thanh energy** ❤️❤️❤️🤍🤍 (3/5 hearts)
- **Streak counter** 🔥
- **EXP/Gems** 💎
- **Nhân vật AI** (ví dụ: Trần Hưng Đạo) - click để chat

**Navigation:**
- Bottom Tab 1 (Home) - Current
- Bottom Tab 2 (Swords) → `/practice`
- Bottom Tab 3 (Trophy) → `/leaderboard`
- Bottom Tab 4 (Diamond) → `/premium`
- Bottom Tab 5 (Avatar) → `/profile`
- Click nhân vật AI → `/ai-chat`
- Click active lesson node → `/video-lesson`

**Business Logic:**
- Khi hearts = 0/5 → không thể vào bài học mới
- Phải chờ hồi phục hoặc upgrade Premium

---

### 11. Practice Modes (/practice)
**Chức năng:**
- **Thử Thách Hàng Ngày** ⚡ (EXP x2 banner)
- **6 chế độ luyện tập:**
  1. Quiz Sấm Sét ⚡ (vàng/amber)
  2. Dòng Thời Gian 🌳 (xanh lá)
  3. Thách Đấu 1v1 ⚔️ (đỏ)
  4. Giải Mã Ô Chữ 🔤 (xanh navy)
  5. Ghi Nhớ Flashcard 🎴 (xanh emerald)

**Navigation:**
- Bottom navigation giống Home
- Click từng mode → Alert demo (chưa implement)

---

### 12. Leaderboard (/leaderboard)
**Chức năng:**
- **Podium Top 3** với avatar + tên
- **Danh sách ranking** (scrollable)
- **Your rank** (pinned ở dưới, highlight vàng)
- Header: "Đấu trường Hạng Vàng"

**Navigation:**
- Back button → `/home`
- Bottom navigation → other tabs
- Click avatar → Alert xem profile (demo)

---

### 13. Premium (/premium)
**Chức năng:**
- **Pro Plan** (Phổ biến nhất):
  - 59.000đ/tháng
  - Dùng thử miễn phí 3 ngày
  - 5 features: Học không giới hạn, AI chat, báo cáo, avatar premium, không ads
  
- **Edu Plan** (Cho trường học):
  - Liên hệ tư vấn
  - 4 features: Quản lý học sinh, dashboard, tùy chỉnh, hỗ trợ ưu tiên

**Navigation:**
- Back button → `/home`
- Bottom navigation → other tabs
- "Dùng thử miễn phí" → Alert kích hoạt trial (demo)
- "Liên hệ tư vấn" → Alert contact info (demo)

---

### 14. Profile (/profile)
**Chức năng:**
- **Avatar** (khung vàng, có thể đổi)
- **4 stats cards:**
  - Streak 🔥: 15 ngày
  - Tổng EXP ⭐: 2,450
  - Giải đấu 🏆: Vàng
  - Thành tích 🎖️: 12 huân chương

- **Menu settings:**
  - Chỉnh sửa hồ sơ
  - Đổi mật khẩu
  - Cài đặt thông báo
  - Ngôn ngữ
  - Đăng xuất (màu đỏ)

**Navigation:**
- Bottom navigation → other tabs
- Stats cards → Alert chi tiết (demo)
- Menu items → Alert hoặc popup (demo)
- "Đăng xuất" → Confirm → `/`

---

### 15. AI Chat (/ai-chat)
**Chức năng:**
- **Header:** Tên nhân vật (ví dụ: "Nguyễn Trãi")
- **Character illustration** (ảnh nhân vật)
- **Chat bubbles:**
  - AI messages (beige background, left side)
  - User messages (yellow background, right side)
- **Input area:**
  - Text input "Hỏi Nguyễn Trãi..."
  - Mic button 🎤 (voice input)
  - Send button ➤ (yellow)

**Navigation:**
- Back button → `/home`
- Send message → Alert demo

---

### 16. Video Lesson (/video-lesson)
**Chức năng:**
- **Video player** với controls:
  - Play/Pause
  - Progress bar
  - Time display (01:30 / 04:45)
  
- **Checkpoint system:**
  - CP1 ✅ (completed)
  - CP2 ⚡ (current - pulsing)
  - CP3 🔒 (locked)
  
- **Quiz overlay** khi đến checkpoint:
  - Question "Cuộc khởi nghĩa Lam Sơn diễn ra vào năm nào?"
  - 4 đáp án
  - Button "Xác nhận & Tiếp tục"

**Navigation:**
- Back/Close button → Confirm → `/home`
- Trả lời đúng → Continue video
- Trả lời sai → `/wrong-answer`

**Business Logic:**
- Video tự động pause tại checkpoint
- Phải trả lời đúng mới tiếp tục
- Progress bar shows checkpoints

---

### 17. Wrong Answer (/wrong-answer)
**Chức năng:**
- **Red X icon** ❌
- **Title:** "Sai rồi!"
- **Question recap**
- **Show:**
  - User's wrong choice (red border + X)
  - Correct answer (green border + ✓)
  - Explanation box (beige background)
- **Warning banner:** "Xem lại đoạn video này! Không thể bỏ qua."
- **Progress bar locked** 🔒 (màu đỏ)

**Navigation:**
- "XEM LẠI & HỌC TIẾP ▶️" → Alert → `/video-lesson`

**Business Logic:**
- Thanh tua video bị khóa
- Buộc phải xem lại đoạn video liên quan
- Sau khi xem xong → quiz hiện lại → user trả lời lần nữa

---

## 🎨 Design System

### Colors:
- **Primary Yellow:** `#FCCF03` / `#FBCE03`
- **Background:** `#F5F5DC` (beige)
- **Text:** `#0F172A` (dark slate)
- **Success:** `#22C55E` (green)
- **Error:** `#EF4444` (red)
- **Premium Gold:** `#FECF01`

### Typography:
- **Primary Font:** Be Vietnam Pro (Extra Bold, Bold, Semi Bold, Medium, Regular)
- **Secondary Font:** Lexend (Thin, Bold, Semi Bold)
- **Icon Font:** Material Symbols Outlined

### Components:
- **Buttons:** Rounded corners (9999px), thick bottom border (shadow effect)
- **Cards:** Rounded 48px, white background, subtle shadow
- **Progress bars:** Yellow (#FBCE03) fill, gray background
- **Badges:** Yellow background, uppercase text

---

## 🚀 Prototype Features

### Implemented:
✅ Full onboarding flow (9 screens)
✅ Main app navigation (5 tabs)
✅ Video lesson with checkpoint system
✅ AI chat interface
✅ Premium subscription plans
✅ Leaderboard ranking
✅ Profile with stats
✅ Practice modes overview
✅ Wrong answer feedback flow

### Demo/Mock:
🎭 OAuth login (simulated)
🎭 Video playback (placeholder)
🎭 AI chat responses (alerts)
🎭 Premium payment (alerts)
🎭 Practice games (alerts)
🎭 Profile settings (alerts)

---

## 📝 Notes

- App sử dụng **React Router** cho navigation
- State management: **Context API** (OnboardingContext)
- Mobile-first design với max-width 430px (iPhone frame)
- Tất cả interactions sử dụng onClick events
- Navigation flow theo đúng wireframe document

## 🎯 Next Steps (For Production)

1. Implement real authentication với backend
2. Integrate video player (YouTube/Vimeo API)
3. Implement AI chat với ChatGPT/Claude API
4. Build practice games (Quiz, Timeline, 1v1, etc.)
5. Add real payment gateway (Stripe/VNPay)
6. Implement analytics & tracking
7. Add push notifications
8. Build admin dashboard
