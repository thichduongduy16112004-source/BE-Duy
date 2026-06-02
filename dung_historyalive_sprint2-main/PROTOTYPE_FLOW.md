# History Alive - Mobile Prototype Flow

## 📱 Complete Prototype Navigation Map

### 🎯 Onboarding Flow (9 Screens)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ONBOARDING JOURNEY                            │
└─────────────────────────────────────────────────────────────────────┘

1. WELCOME SCREEN (/)
   ├─ "Bắt đầu ngay" button → Sign Up Screen
   └─ "Tôi đã có tài khoản" button → Login Screen

2. SIGN UP SCREEN (/signup)
   ├─ Back button → Welcome Screen
   ├─ Google button → Age Selection
   ├─ Facebook button → Age Selection
   ├─ Register button (with validation) → Age Selection
   └─ "Đã có tài khoản" link → Login Screen

2.1 LOGIN SCREEN (/login)
    ├─ Back button → Welcome Screen
    ├─ Google button → Home Screen
    ├─ Facebook button → Home Screen
    ├─ Login button (with validation) → Home Screen
    ├─ "Quên mật khẩu?" → Alert (Demo)
    └─ "Đăng ký ngay" link → Sign Up Screen

3. AGE SELECTION (/onboarding/age)
   ├─ Progress: 12.5% (Step 1/8)
   ├─ Back button → Sign Up Screen
   ├─ Options: 6-10, 11-14, 15-18, 18+
   └─ Continue button → Name Input

4. NAME INPUT (/onboarding/name)
   ├─ Progress: 25% (Step 2/8)
   ├─ Back button → Age Selection
   ├─ Name input field (min 2 chars)
   ├─ Quick suggestions: Minh, An, Hương, Duy, Linh, Khoa
   ├─ Character counter: 0/50
   └─ Continue button → Email Input

5. EMAIL INPUT (/onboarding/email)
   ├─ Progress: 37.5% (Step 3/8)
   ├─ Back button → Name Input
   ├─ Email validation (real-time)
   ├─ Visual feedback (✓/✗ with colors)
   └─ Continue button → Subject Selection

6. SUBJECT SELECTION (/onboarding/subject)
   ├─ Progress: 50% (Step 4/8)
   ├─ Back button → Email Input
   ├─ Multi-select grid (2 columns)
   ├─ Options:
   │  • Lịch sử Việt Nam 🇻🇳
   │  • Lịch sử Thế giới 🌍
   │  • Lịch sử Cổ đại 🏛️
   │  • Lịch sử Hiện đại 🏙️
   │  • Lịch sử Chiến tranh ⚔️
   │  • Lịch sử Văn hóa 🎭
   ├─ Selected counter display
   └─ Continue button → Grade Selection

7. GRADE SELECTION (/onboarding/grade)
   ├─ Progress: 62.5% (Step 5/8)
   ├─ Back button → Subject Selection
   ├─ Options: Lớp 6-12, Đại học
   └─ Continue button → Study Time Selection

8. STUDY TIME SELECTION (/onboarding/study-time)
   ├─ Progress: 100% (Final Step! 🎉)
   ├─ Back button → Grade Selection
   ├─ Options:
   │  • 5-10 phút/ngày (Cơ bản) ⚡
   │  • 10-20 phút/ngày (Phổ biến) 🎯 ✨ Đề xuất
   │  • 20-30 phút/ngày (Nâng cao) 🚀
   │  • 30+ phút/ngày (Chuyên gia) 🏆
   ├─ Benefits card with tips
   ├─ Completion animation (Sparkles)
   └─ "Hoàn tất & Bắt đầu học" → HOME SCREEN
```

### 🏠 Main App Flow (8 Screens)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          MAIN SCREENS                                │
└─────────────────────────────────────────────────────────────────────┘

HOME SCREEN (/home)
├─ Bottom Nav: Home (active), Practice, Leaderboard, Profile
├─ Timeline/Learning content
└─ Quick access cards

PRACTICE MODES (/practice)
├─ Bottom Nav: Home, Practice (active), Leaderboard, Profile
├─ Quiz modes
└─ Practice exercises

LEADERBOARD (/leaderboard)
├─ Bottom Nav: Home, Practice, Leaderboard (active), Profile
├─ Rankings
└─ Competitions

PROFILE (/profile)
├─ Bottom Nav: Home, Practice, Leaderboard, Profile (active)
├─ User info
├─ Settings
└─ Progress stats

PREMIUM (/premium)
├─ Premium features
└─ Subscription options

AI CHAT (/ai-chat)
├─ Chat interface
└─ AI tutor

VIDEO LESSON (/video-lesson)
├─ Video player
└─ Lesson content

WRONG ANSWER (/wrong-answer)
├─ Review mistakes
└─ Explanations
```

## 🎬 Prototype Interactions

### ✅ Implemented Interactions

#### Welcome Screen
- ✓ "Bắt đầu ngay" button with pulse animation
- ✓ "Tôi đã có tài khoản" button
- ✓ Gradient yellow background
- ✓ Feature badges display
- ✓ App icon with sparkle

#### Sign Up Screen
- ✓ Back navigation
- ✓ Google OAuth button (tactile with shadow)
- ✓ Facebook OAuth button (blue theme)
- ✓ Username input field
- ✓ Password input with toggle visibility (Eye icon)
- ✓ Confirm password with toggle visibility
- ✓ Form validation (required, min length, match)
- ✓ Submit button (tactile 3D effect)
- ✓ Link to Login screen
- ✓ All buttons have hover/active states

#### Login Screen
- ✓ Back navigation
- ✓ Google OAuth button
- ✓ Facebook OAuth button
- ✓ Username/Email input field
- ✓ Password input with toggle visibility
- ✓ "Quên mật khẩu?" link (alert demo)
- ✓ Form validation (required fields)
- ✓ Submit button
- ✓ Link to Sign Up screen

#### Age Selection
- ✓ Progress bar (12.5%)
- ✓ Step indicator (1/8)
- ✓ Back navigation
- ✓ 4 age option cards with emojis
- ✓ Single selection (radio behavior)
- ✓ Visual feedback (yellow highlight + shadow)
- ✓ Check mark on selected
- ✓ Continue button (disabled state)

#### Name Input
- ✓ Progress bar (25%)
- ✓ Step indicator (2/8)
- ✓ Back navigation
- ✓ Avatar preview (updates with name)
- ✓ Text input with focus states
- ✓ Character counter (0/50)
- ✓ Quick suggestion chips
- ✓ Min 2 characters validation
- ✓ Continue button

#### Email Input
- ✓ Progress bar (37.5%)
- ✓ Step indicator (3/8)
- ✓ Back navigation
- ✓ Email icon illustration
- ✓ Real-time email validation
- ✓ Visual feedback (green ✓ / red ✗)
- ✓ Border color changes (green/red)
- ✓ Benefits list display
- ✓ Privacy notice
- ✓ Continue button

#### Subject Selection
- ✓ Progress bar (50%)
- ✓ Step indicator (4/8)
- ✓ Back navigation
- ✓ 6 subject cards in 2-column grid
- ✓ Multi-selection (checkbox behavior)
- ✓ Each card has emoji + gradient
- ✓ Check mark on selected
- ✓ Selected counter display
- ✓ Continue button (min 1 selection)

#### Grade Selection
- ✓ Progress bar (62.5%)
- ✓ Step indicator (5/8)
- ✓ Back navigation
- ✓ 8 grade options (Lớp 6-12 + Đại học)
- ✓ Each with graduation cap icon
- ✓ Gradient colors per grade
- ✓ Level labels (THCS, THPT, ĐH)
- ✓ Single selection
- ✓ Continue button

#### Study Time Selection
- ✓ Progress bar (100%)
- ✓ Step indicator (Final! 🎉)
- ✓ Back navigation
- ✓ 4 time options with badges
- ✓ "Đề xuất" badge on recommended
- ✓ Benefits card with tips
- ✓ Completion animation (sparkles)
- ✓ Loading state on submit
- ✓ "Hoàn tất & Bắt đầu học" button

## 🎨 Design System

### Colors
- **Primary:** #FCCF03 (Yellow)
- **Primary Border:** #e5b800
- **Primary Hover:** #ffd633
- **Background:** #f5f5dc (Beige)
- **Container:** #0f172a (Dark frame)
- **Text Dark:** #0f172a
- **Text Medium:** #64748b
- **Text Light:** #94a3b8
- **Border:** #e5e7eb
- **White:** #ffffff
- **Success:** #10b981 (Green)
- **Error:** #ef4444 (Red)

### Typography
- **H1:** 30px / extrabold (Titles)
- **H2:** 24px / extrabold (Subtitles)
- **Body Large:** 17px / bold (Card labels)
- **Body:** 15px / semibold (Inputs)
- **Small:** 14px / semibold (Labels)
- **XSmall:** 12px / semibold (Hints)

### Spacing
- **Screen padding:** 20px (px-5)
- **Component gaps:** 12-16px
- **Section gaps:** 24-32px

### Border Radius
- **Buttons:** 14-16px
- **Inputs:** 12-14px
- **Cards:** 16px
- **Badges:** 9999px (full rounded)

### Shadows
- **Tactile buttons:** 0 4px 0 0 #e5b800
- **Active state:** 0 2px 0 0 #e5b800
- **Cards:** 0 4px 6px rgba(0,0,0,0.1)

### Heights
- **Inputs:** 50-54px
- **Buttons:** 56-60px
- **Social buttons:** 52px
- **Touch targets:** Min 44px

## ⚡ Transitions & Animations

### Navigation
- **Type:** Page transition
- **Duration:** 300ms
- **Easing:** ease-in-out

### Button States
- **Hover:** 150ms ease
- **Active:** Instant (0ms) + translate-y
- **Focus:** 200ms ease (ring appearance)

### Progress Bar
- **Duration:** 300ms
- **Easing:** ease-out

### Form Validation
- **Border color:** 200ms ease
- **Icon appearance:** 150ms ease
- **Scale:** 100ms ease

### Completion Animation
- **Sparkles:** ping animation
- **Duration:** 800ms
- **Then:** Navigate to home

## 🔄 State Management

### Local State (useState)
Each screen manages its own state:
- **Sign Up/Login:** username, password, confirmPassword, showPassword
- **Age:** selectedAge
- **Name:** name
- **Email:** email, isFocused
- **Subject:** selectedSubjects (array)
- **Grade:** selectedGrade
- **Study Time:** selectedTime, isCompleting

### Navigation State (useNavigate)
- Router handles all navigation
- Back button navigates to previous screen
- Continue button navigates to next screen
- Form submission triggers navigation

### Future: Context API
Currently logs to console. Can be upgraded to:
```typescript
const { updateProfile } = useOnboarding();
updateProfile({ age, name, email, subjects, grade, studyTime });
```

## 📊 Progress Tracking

| Screen | Progress | Step |
|--------|----------|------|
| Welcome | - | - |
| Sign Up/Login | - | - |
| Age | 12.5% | 1/8 |
| Name | 25% | 2/8 |
| Email | 37.5% | 3/8 |
| Subject | 50% | 4/8 |
| Grade | 62.5% | 5/8 |
| Study Time | 100% | Final! |

## ✅ Validation Rules

### Sign Up
- Username: Required, min 1 char
- Password: Required, min 6 chars
- Confirm Password: Must match password

### Login
- Username/Email: Required
- Password: Required

### Name Input
- Min length: 2 characters
- Max length: 50 characters
- Disabled button if < 2 chars

### Email Input
- Format: email regex validation
- Real-time feedback on blur
- Green/red visual indicators

### Subject Selection
- Min selection: 1 subject
- Max selection: Unlimited
- Button disabled if none selected

### Grade Selection
- Required: 1 grade
- Pre-selected: Lớp 9 (default)

### Study Time
- Required: 1 time option
- Pre-selected: 10-20 min (recommended)

## 🎯 User Flow Examples

### New User Journey
```
Welcome → Sign Up → Age → Name → Email → Subject → Grade → Study Time → Home
   ↓        ↓        ↓      ↓       ↓        ↓        ↓         ↓
 Click   Register  Select Fill   Enter   Select   Select    Select    Complete
  "Bắt    form +   age    name   email   topics   grade     time      onboarding
  đầu"    submit
```

### Returning User Journey
```
Welcome → Login → Home
   ↓        ↓       ↓
 Click    Enter   Access
"Tôi đã   creds   dashboard
có TK"
```

### Social OAuth Journey
```
Welcome → Sign Up → Google/FB → Age → Name → Email → Subject → Grade → Study Time → Home
   ↓        ↓          ↓
 Click    Click     OAuth    (Continue onboarding...)
"Bắt     social    flow
 đầu"    button
```

## 🧪 Testing Checklist

### Welcome Screen
- [ ] "Bắt đầu ngay" navigates to /signup
- [ ] "Tôi đã có tài khoản" navigates to /login
- [ ] Animations play smoothly
- [ ] Feature badges display correctly

### Sign Up Screen
- [ ] Back button returns to /
- [ ] Google button navigates to /onboarding/age
- [ ] Facebook button navigates to /onboarding/age
- [ ] Empty form shows validation alert
- [ ] Password < 6 chars shows alert
- [ ] Passwords don't match shows alert
- [ ] Eye icon toggles password visibility
- [ ] Valid form navigates to /onboarding/age
- [ ] "Đã có tài khoản" link goes to /login

### Login Screen
- [ ] Back button returns to /
- [ ] Google button navigates to /home
- [ ] Facebook button navigates to /home
- [ ] Empty fields show validation alert
- [ ] Eye icon toggles password visibility
- [ ] Valid login navigates to /home
- [ ] "Quên mật khẩu" shows alert
- [ ] "Đăng ký ngay" link goes to /signup

### Age Selection
- [ ] Progress shows 12.5%
- [ ] Step shows "1/8"
- [ ] Back button returns to /signup
- [ ] Can select one age
- [ ] Selected age highlights in yellow
- [ ] Continue navigates to /onboarding/name

### Name Input
- [ ] Progress shows 25%
- [ ] Step shows "2/8"
- [ ] Back button returns to /onboarding/age
- [ ] Avatar updates with typed name
- [ ] Character counter updates (x/50)
- [ ] Quick suggestions populate input
- [ ] Button disabled if name < 2 chars
- [ ] Valid name navigates to /onboarding/email

### Email Input
- [ ] Progress shows 37.5%
- [ ] Step shows "3/8"
- [ ] Back button returns to /onboarding/name
- [ ] Email validation works on blur
- [ ] Invalid email shows red border + ✗
- [ ] Valid email shows green border + ✓
- [ ] Button disabled if invalid
- [ ] Valid email navigates to /onboarding/subject

### Subject Selection
- [ ] Progress shows 50%
- [ ] Step shows "4/8"
- [ ] Back button returns to /onboarding/email
- [ ] Can select multiple subjects
- [ ] Check marks show on selected
- [ ] Counter updates (x subjects selected)
- [ ] Button disabled if none selected
- [ ] Valid selection navigates to /onboarding/grade

### Grade Selection
- [ ] Progress shows 62.5%
- [ ] Step shows "5/8"
- [ ] Back button returns to /onboarding/subject
- [ ] Can select one grade
- [ ] Selected grade highlights
- [ ] Valid selection navigates to /onboarding/study-time

### Study Time Selection
- [ ] Progress shows 100%
- [ ] Step shows "Final!"
- [ ] Back button returns to /onboarding/grade
- [ ] Can select one time
- [ ] Recommended option has badge
- [ ] Button shows "Hoàn tất & Bắt đầu học"
- [ ] Click shows loading state
- [ ] Sparkles animation plays
- [ ] Navigates to /home after 800ms

## 🚀 Performance Notes

- All components use React.useState for local state
- Navigation is handled by React Router
- No external API calls (prototype mode)
- Form validation is client-side only
- Images use ImageWithFallback component
- Icons use lucide-react (tree-shakeable)

## 📝 Future Enhancements

1. **Backend Integration**
   - Connect to real authentication API
   - Save onboarding data to database
   - OAuth implementation (Google, Facebook)

2. **Analytics**
   - Track onboarding completion rate
   - Monitor drop-off points
   - A/B test different flows

3. **Animations**
   - Page transitions with Framer Motion
   - Micro-interactions on buttons
   - Confetti on completion

4. **Accessibility**
   - ARIA labels on all interactive elements
   - Keyboard navigation support
   - Screen reader optimization
   - Focus management

5. **Progressive Disclosure**
   - Show benefits at each step
   - Tooltips for complex options
   - Help center links

6. **Personalization**
   - Remember user's last position
   - Allow editing previous steps
   - Summary review before completion

7. **Gamification**
   - XP points for completing steps
   - Unlock badges during onboarding
   - Preview of learning path
