# 🚀 History Alive - Quick Start Guide

**Welcome to History Alive!** This guide will help you get the prototype up and running in minutes.

---

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **npm** or **pnpm** package manager
- ✅ **Modern web browser** (Chrome, Safari, Firefox, Edge)

---

## ⚡ Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
npm install
# or
pnpm install
```

**Expected output:**
```
✔ Dependencies installed successfully
✔ 65 packages installed
```

### Step 2: Start Development Server

```bash
npm run dev
# or
pnpm dev
```

**Expected output:**
```
  VITE v6.3.5  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 3: Open in Browser

Navigate to **http://localhost:3000**

You should see the **Welcome Screen** with:
- 📚 Book icon logo
- "History Alive" heading
- Yellow gradient background
- "Start Learning" button
- "I already have an account" button

**🎉 Congratulations! Your prototype is running!**

---

## 🎯 Testing the Complete Flow

### Option 1: New User Flow (Recommended)

**Time:** ~2 minutes

1. **Welcome Screen** (`/`)
   - Click **"Start Learning"** button

2. **Sign Up** (`/signup`)
   - Enter username: `test`
   - Enter password: `test123`
   - Confirm password: `test123`
   - Click **"ĐĂNG KÝ NGAY"**

3. **Age Selection** (`/onboarding/age`)
   - Select: **"11-14 tuổi"**
   - Click **"Tiếp tục"**

4. **Name Input** (`/onboarding/name`)
   - Enter name: `Minh`
   - Click **"Tiếp tục"**

5. **Email Input** (`/onboarding/email`)
   - Enter email: `test@example.com`
   - Click **"Tiếp tục"**

6. **Subject Selection** (`/onboarding/subject`)
   - Select: **"Lịch sử Việt Nam"**
   - Click **"Tiếp tục"**

7. **Grade Selection** (`/onboarding/grade`)
   - Select: **"Lớp 9"**
   - Click **"Tiếp tục"**

8. **Study Time** (`/onboarding/study-time`)
   - Select: **"10-20 phút/ngày"**
   - Click **"Hoàn tất & Bắt đầu học"**
   - ✨ Watch celebration animation

9. **Home Screen** (`/home`)
   - ✅ See hearts (3/5)
   - ✅ See streak (7 days)
   - ✅ See gems (245)
   - ✅ See learning path timeline

**🎉 Onboarding Complete!**

### Option 2: Returning User Flow (Fast)

**Time:** ~30 seconds

1. **Welcome Screen** (`/`)
   - Click **"I already have an account"**

2. **Login** (`/login`)
   - Enter username: `test`
   - Enter password: `test123`
   - Click **"ĐĂNG NHẬP"**

3. **Home Screen** (`/home`)
   - ✅ Logged in successfully!

---

## 🧪 Testing Key Features

### 1. AI Chat Feature

From **Home Screen**:
1. Click on the **AI character icon** (🎭) beside the active lesson node
2. See "Chạm để hỏi!" tooltip
3. Navigate to **AI Chat Screen** (`/ai-chat`)
4. View chat with Nguyễn Trãi
5. Click **← Back** to return to Home

### 2. Video Lesson + Quiz

From **Home Screen**:
1. Click on the **active lesson node** (yellow pulsing circle with 📚)
2. Navigate to **Video Lesson Screen** (`/video-lesson`)
3. See video player with play button
4. View checkpoint progress (CP1 ✓, CP2 ●, CP3 🔒)
5. View quiz question with 4 options
6. Click **"XÁC NHẬN & TIẾP TỤC"** button

**Test Correct Answer:**
- The demo has answer "A. Năm 1418" marked as correct
- Clicking submit will log "Correct answer! Continue..."

**Test Wrong Answer:**
- To test wrong answer flow, you'd need to select a different answer
- Should navigate to **Wrong Answer Screen** (`/wrong-answer`)
- View feedback with red/green highlights
- Click **"XEM LẠI & HỌC TIẾP"** to return

### 3. Bottom Navigation

From **Home Screen**, test all 5 tabs:

1. **🏠 Home** (`/home`)
   - Active by default (yellow)

2. **⚔️ Practice** (`/practice`)
   - Click to see 6 practice modes
   - Daily Challenge, Lightning Quiz, etc.

3. **🏆 Leaderboard** (`/leaderboard`)
   - Click to see rankings
   - Top 3 podium + list (you're #7)

4. **👑 Premium** (`/premium`)
   - Click to see subscription plans
   - Pro Plan: 99,000₫/tháng
   - Edu Plan: 199,000₫/tháng

5. **👤 Profile** (`/profile`)
   - Click to see your profile
   - View stats (Streak, XP, Rank, Achievements)
   - Click **Logout** to return to Welcome

---

## 🎮 Interactive Elements Guide

### Buttons You Can Click:

**Welcome Screen:**
- ✅ Start Learning → Sign Up
- ✅ I already have an account → Login

**Home Screen:**
- ✅ AI Character (🎭) → AI Chat
- ✅ Active Lesson Node (📚) → Video Lesson
- ✅ Bottom Nav Tabs (5) → Different screens

**All Screens:**
- ✅ Back buttons (←) → Previous screen
- ✅ Continue buttons → Next screen
- ✅ Form inputs → Editable

**Profile Screen:**
- ✅ Logout button → Welcome (with confirmation)

### Expected Console Logs:

Some features log to console (for prototype):
- AI Chat: "Settings clicked", "Send message clicked", "Voice input clicked"
- Video Lesson: "Play video clicked", "Answer selected", "Correct answer! Continue..."
- Practice cards: Click events (future implementation)

---

## 📱 Device Simulation

### Desktop Browser Testing

1. Open Chrome DevTools (F12 or Cmd+Opt+I)
2. Click **Toggle Device Toolbar** (Ctrl+Shift+M or Cmd+Shift+M)
3. Select **iPhone 15 Pro** from device list
4. Or set custom: **393 x 852 px**

### Mobile Device Testing

**Best Experience:**
1. Open on real iPhone/Android device
2. Navigate to your local IP (e.g., `http://192.168.1.100:3000`)
3. Or deploy to Vercel/Netlify and access via URL

**To expose server on network:**
```bash
npm run dev -- --host
# or
pnpm dev --host
```

---

## 🐛 Troubleshooting

### Issue: "Command not found: npm"

**Solution:** Install Node.js from [nodejs.org](https://nodejs.org/)

### Issue: "Port 3000 already in use"

**Solution 1:** Kill the process using port 3000
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Solution 2:** Use a different port
```bash
npm run dev -- --port 3001
```

### Issue: Dependencies fail to install

**Solution:** Clear cache and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Screen doesn't fit on mobile

**Solution:** Ensure viewport meta tag is present (already included)
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Issue: Images not loading

**Solution:** Check that Figma imports exist in `/src/imports/`

### Issue: Navigation doesn't work

**Solution:** Check browser console for errors. All routes should be defined in `/src/app/routes.tsx`

---

## 📂 Project Structure Overview

```
history-alive-app/
├── src/
│   ├── app/
│   │   ├── components/      # Mobile UI components (15 files)
│   │   ├── screens/         # Screen wrappers (17 files)
│   │   ├── routes.tsx       # Router configuration
│   │   └── App.tsx          # Root component
│   ├── imports/             # Figma design imports
│   └── main.tsx             # App entry point
├── public/                  # Static assets
├── docs/                    # Documentation
│   ├── MOBILE_DESIGN_SPECS.md
│   ├── PROTOTYPE_FLOW_UPDATED.md
│   ├── DEMO_NAVIGATION_GUIDE.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── FINAL_PROTOTYPE_COMPLETE.md
│   └── QUICK_START_GUIDE.md  (this file)
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 🎯 Testing Checklist

Use this checklist to verify everything works:

### Onboarding (9 screens)
- [ ] Welcome screen loads
- [ ] Sign Up form works
- [ ] Login form works
- [ ] Age selection works
- [ ] Name input works
- [ ] Email validation works
- [ ] Subject selection (multiple) works
- [ ] Grade selection works
- [ ] Study time selection works
- [ ] Progress bars animate correctly
- [ ] All "Tiếp tục" buttons work

### Main App (6 screens)
- [ ] Home screen displays
- [ ] Hearts show (3/5)
- [ ] Streak shows (7 days)
- [ ] Gems show (245)
- [ ] Learning path timeline renders
- [ ] Practice screen loads
- [ ] Leaderboard loads with top 3
- [ ] Premium screen shows plans
- [ ] Profile screen shows stats
- [ ] Bottom navigation works

### Feature Screens (3 screens)
- [ ] AI Chat loads
- [ ] Video Lesson loads
- [ ] Wrong Answer screen loads
- [ ] All navigation works

### Interactive Elements
- [ ] All buttons clickable
- [ ] All inputs editable
- [ ] All navigation works
- [ ] Logout confirmation works
- [ ] Mobile frame size correct (393 x 852)

---

## 📚 Next Steps

After testing the prototype:

1. **Review Documentation:**
   - [MOBILE_DESIGN_SPECS.md](./MOBILE_DESIGN_SPECS.md) - Design system
   - [DEMO_NAVIGATION_GUIDE.md](./DEMO_NAVIGATION_GUIDE.md) - Detailed testing guide
   - [FINAL_PROTOTYPE_COMPLETE.md](./FINAL_PROTOTYPE_COMPLETE.md) - Complete overview

2. **Gather Feedback:**
   - Test with real users (students)
   - Note pain points and improvements
   - Collect feature requests

3. **Plan Development:**
   - Prioritize features
   - Set up backend (Firebase/Supabase)
   - Integrate real video player
   - Connect AI service

4. **Deploy:**
   - Build production version: `npm run build`
   - Deploy to Vercel/Netlify
   - Share with stakeholders

---

## 🆘 Need Help?

### Resources:
- **GitHub Issues:** Report bugs
- **Documentation:** Check `/docs` folder
- **Code Comments:** Read inline comments

### Contact:
- Email: dev@historyalive.edu.vn (example)
- Discord: [Community Server](#) (example)

---

## 🎉 Success!

If you've made it here and everything is working:

**🎊 Congratulations!** You have successfully set up the History Alive prototype!

The app is now ready for:
- ✅ Demo presentations
- ✅ User testing
- ✅ Stakeholder review
- ✅ Development planning

---

**Happy Testing! 🚀**

*Remember: This is a fully interactive prototype. All navigation works, but some features (like actual video playback, real AI chat, etc.) are simulated for demo purposes.*

---

**Last Updated:** March 8, 2026  
**Version:** 1.0.0-final  
**Status:** ✅ Ready for Demo
