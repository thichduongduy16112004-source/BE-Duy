# Mobile Design Specifications

## 📱 Device Frame
- **Device:** iPhone 16 Pro
- **Screen Size:** 402 x 874 px
- **Safe Area Margins:** 20px from all edges
- **Background:** Dark (#0f172a) with centered mobile frame

## 🎨 Mobile Sign Up Screen

### Layout Structure
```
┌─────────────────────────────┐
│  [←]         402px          │  ← Header (pt-16)
│                             │
│     Tạo Tài Khoản          │  ← Title (text-3xl)
│   Bắt đầu hành trình...    │  ← Subtitle
│                             │
├─────────────────────────────┤
│  [ G ] Đăng ký bằng Google │  ← 52px height
│  [ f ] Đăng ký bằng FB     │  ← 52px height
│                             │
│ ─── HOẶC TỰ TẠO TÀI KHOẢN ─── │  ← Divider
│                             │
│  Tên đăng nhập             │
│  [________________]         │  ← 50px height
│                             │
│  Mật khẩu                  │
│  [________________] [👁]   │  ← 50px height
│                             │
│  Xác nhận mật khẩu         │
│  [________________] [👁]   │  ← 50px height
│                             │
│  [  ĐĂNG KÝ NGAY  ]        │  ← 56px height (primary)
│                             │
│  Đã có tài khoản? Đăng nhập│  ← Link
└─────────────────────────────┘
        874px height
```

### Component Specifications

#### 1. Header Section
- **Padding Top:** 64px (pt-16)
- **Padding Bottom:** 32px (pb-8)
- **Padding Horizontal:** 20px (px-5)

**Back Button:**
- Size: 40 x 40 px
- Border Radius: 50% (rounded-full)
- Background: white/50 with hover state
- Icon: ArrowLeft (20px)

**Title:**
- Font Size: 30px (text-3xl)
- Font Weight: 800 (font-extrabold)
- Color: #0f172a
- Text Align: Center
- Margin Top: 48px

**Subtitle:**
- Font Size: 14px (text-sm)
- Color: #64748b
- Margin Top: 8px

#### 2. Social Login Buttons

**Google Button:**
- Width: 100%
- Height: 52px
- Background: #ffffff
- Border: 2px solid #e5e7eb
- Border Radius: 14px (rounded-[14px])
- Font Weight: 600 (font-semibold)
- Font Size: 15px
- Shadow: 0 2px 0 0 rgba(0,0,0,0.08)
- Active State: translate-y-[2px], no shadow

**Facebook Button:**
- Width: 100%
- Height: 52px
- Background: #1877f2
- Border: 2px solid #0c5bcc
- Border Radius: 14px
- Font Weight: 600
- Font Size: 15px
- Color: white
- Shadow: 0 2px 0 0 rgba(0,0,0,0.15)

#### 3. Divider
- Height: 1px
- Background: #cbd5e1
- Text: "HOẶC TỰ TẠO TÀI KHOẢN"
- Font Size: 12px (text-xs)
- Font Weight: 600
- Color: #64748b
- Text Transform: uppercase
- Letter Spacing: wider
- Padding Vertical: 16px

#### 4. Input Fields

**Label:**
- Font Size: 14px (text-sm)
- Font Weight: 600 (font-semibold)
- Color: #0f172a
- Margin Bottom: 8px

**Input Box:**
- Width: 100%
- Height: 50px
- Padding: 16px (px-4)
- Background: #ffffff
- Border: 2px solid #e5e7eb
- Border Radius: 12px (rounded-[12px])
- Font Size: 15px
- Color: #0f172a
- Placeholder Color: #94a3b8

**Focus State:**
- Border Color: #FCCF03
- Ring: 2px, #FCCF03 with 20% opacity

**Password Toggle Icon:**
- Position: absolute right-3
- Size: 20px (w-5 h-5)
- Color: #64748b
- Hover Color: #0f172a

#### 5. Primary Button (Register/Login)

**Dimensions:**
- Width: 100%
- Height: 56px
- Border Radius: 14px

**Colors:**
- Background: #FCCF03
- Border: 2px solid #e5b800
- Text: #0f172a

**Typography:**
- Font Weight: 700 (font-bold)
- Font Size: 16px
- Text Transform: uppercase
- Letter Spacing: wide

**Shadow Effect (Tactile):**
- Normal: 0 4px 0 0 #e5b800
- Active: 0 2px 0 0 #e5b800
- Active Transform: translate-y-[2px]

**Hover State:**
- Background: #ffd633

#### 6. Footer Link
- Font Size: 14px (text-sm)
- Color: #64748b
- Link Color: #0f172a
- Link Weight: 600
- Link Style: underline
- Text Align: center

### Spacing System

**Component Gaps:**
- Between social buttons: 12px (space-y-3)
- Between input fields: 16px (space-y-4)
- Divider top/bottom: 16px (py-4)
- Button margin top: 24px (mt-6)
- Footer padding top: 16px (pt-4)

**Safe Margins:**
- Screen horizontal: 20px (px-5)
- Content from edges: 20px minimum

## 🎯 Mobile Login Screen

Same specifications as Sign Up with these differences:

### Differences:
1. **Title:** "Chào Mừng Trở Lại!"
2. **Subtitle:** "Đăng nhập để tiếp tục học"
3. **Divider Text:** "HOẶC DÙNG TÀI KHOẢN"
4. **Input Fields:**
   - Username/Email (single field)
   - Password (with "Quên mật khẩu?" link)
5. **Button Text:** "ĐĂNG NHẬP"
6. **Footer Link:** "Chưa có tài khoản? Đăng ký ngay"

### Additional Element:
**Forgot Password Link:**
- Position: Top-right of password label
- Font Size: 12px (text-xs)
- Font Weight: 600
- Color: #FCCF03
- Hover: #e5b800

## 🎨 Color Palette

### Primary Colors
- **Yellow Primary:** `#FCCF03`
- **Yellow Border:** `#e5b800`
- **Yellow Hover:** `#ffd633`

### Neutral Colors
- **Dark Text:** `#0f172a`
- **Medium Text:** `#64748b`
- **Light Text:** `#94a3b8`
- **Border:** `#e5e7eb`
- **Border Hover:** `#9ca3af`
- **Divider:** `#cbd5e1`
- **Background:** `#f5f5dc` (beige)

### Social Brand Colors
- **Facebook:** `#1877f2`
- **Facebook Border:** `#0c5bcc`
- **Facebook Hover:** `#166fe5`

### State Colors
- **White Background:** `#ffffff`
- **White Overlay:** `rgba(255,255,255,0.5)`
- **Focus Ring:** `rgba(252,207,3,0.2)`

## 📐 Typography Scale

### Headings
- **H1 (Title):** 30px / font-extrabold / -0.025em
- **H2 (Section):** 20px / font-bold / normal

### Body Text
- **Large:** 16px / font-bold (buttons)
- **Medium:** 15px / font-semibold (inputs, button labels)
- **Regular:** 14px / font-semibold (labels)
- **Small:** 14px / normal (body text)
- **Extra Small:** 12px / font-semibold (divider, links)

### Text Styles
- **Uppercase:** Buttons, divider text
- **Letter Spacing:** 
  - Tight: -0.025em (headings)
  - Wide: 0.025em (buttons)
  - Wider: 0.05em (divider)

## 🎭 Interactive States

### Button States
1. **Normal:** Base colors with shadow
2. **Hover:** Lighter background, same shadow
3. **Active:** Translate down 2px, reduced shadow
4. **Focus:** Outline ring (accessibility)

### Input States
1. **Normal:** Gray border
2. **Focus:** Yellow border + yellow ring
3. **Filled:** Keep focus styles while typing
4. **Error:** Red border (not shown in prototype)

### Icon States (Eye Toggle)
1. **Normal:** Gray (#64748b)
2. **Hover:** Dark (#0f172a)
3. **Active:** Same as hover

## ♿ Accessibility

### ARIA Labels
- Back button: "Quay lại"
- Password toggle: "Hiện mật khẩu" / "Ẩn mật khẩu"

### Form Labels
- All inputs have visible labels
- Labels use `htmlFor` attribute
- IDs match between label and input

### Keyboard Navigation
- Tab order: Top to bottom
- Enter key submits form
- Space toggles password visibility on icon

### Touch Targets
- Minimum size: 44 x 44 px (iOS guideline)
- Actual button heights: 50-56px (exceeds minimum)
- Icon buttons: 40 x 40 px with padding

## 📱 Responsive Behavior

### Fixed Dimensions
- Container: 402 x 874 px (no scaling)
- All child elements scale proportionally

### Scrollable Content
- Content area: `overflow-y-auto`
- Header: Fixed at top
- Form: Scrolls if content exceeds height
- Safe padding at bottom

## 🔒 Form Validation

### Sign Up Validation
1. **All fields required**
2. **Password minimum:** 6 characters
3. **Passwords must match**
4. **Alert on error**
5. **Navigate on success**

### Login Validation
1. **Username required**
2. **Password required**
3. **Alert on error**
4. **Navigate on success**

## 🎬 Prototype Interactions

### Navigation Flow
```
Sign Up Screen:
├── Back Button → Welcome Screen
├── Google Button → Age Selection
├── Facebook Button → Age Selection
├── Register Button → Age Selection (after validation)
└── Login Link → Login Screen

Login Screen:
├── Back Button → Welcome Screen
├── Google Button → Home Screen
├── Facebook Button → Home Screen
├── Login Button → Home Screen (after validation)
├── Forgot Password → Alert
└── Sign Up Link → Sign Up Screen
```

### Transition Animation
- Type: Smart Animate (if supported)
- Duration: 300ms
- Easing: ease-in-out

## 📝 Implementation Notes

### React Components
- **MobileSignUpScreen** (`/src/app/components/MobileSignUpScreen.tsx`)
- **MobileLoginScreen** (`/src/app/components/MobileLoginScreen.tsx`)

### Dependencies
- **lucide-react** for icons (ArrowLeft, Eye, EyeOff)
- **React Router** for navigation
- **React hooks** for state management (useState)

### Props Interface
```typescript
interface MobileSignUpScreenProps {
  onBack?: () => void;
  onSignUp?: () => void;
  onGoogleSignUp?: () => void;
  onFacebookSignUp?: () => void;
  onLoginClick?: () => void;
}
```

### Local State
- `username: string`
- `password: string`
- `confirmPassword: string` (Sign Up only)
- `showPassword: boolean`
- `showConfirmPassword: boolean` (Sign Up only)

## 🚀 Production Considerations

### Future Enhancements
1. Real-time validation feedback
2. Password strength indicator
3. Actual OAuth integration
4. Backend API connection
5. Error message display (inline)
6. Loading states on buttons
7. Success/error toast notifications
8. Remember me checkbox (Login)
9. Biometric authentication option
10. Rate limiting on failed attempts

### Performance
- Lazy load social login SDKs
- Debounce input validation
- Optimize re-renders with React.memo
- Use proper form libraries (React Hook Form)

### Security
- HTTPS only
- Password hashing
- CSRF protection
- Rate limiting
- Input sanitization
- XSS prevention
