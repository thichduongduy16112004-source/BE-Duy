# Teacher Dashboard (manager-web) — Kế hoạch Phát triển (Bản chốt)

> Nhiệm vụ: xây dựng web riêng cho Giáo viên/Manager trong hệ thống Edu Plan của History Alive.
> Vai trò: Full-stack — bạn (Duy) code cả Backend API và Frontend UI.
> Quyết định kiến trúc đã chốt: **xem mục 0.**

---

## 0. Quyết định kiến trúc — ĐÃ CHỐT

**Vấn đề đặt ra:** Team quy ước "tách biệt hoàn toàn" Backend/Frontend của Teacher Dashboard với hệ thống chính. Nhưng Duy đang quản lý cả backend chính (`history-alive`) và Teacher Dashboard, nên tách 2 backend riêng sẽ phải tự đồng bộ MongoDB hoặc dựng pipeline gọi nhau — tốn công vô ích vì Teacher Dashboard không có dữ liệu riêng, chỉ đọc dữ liệu hệ thống chính.

**Quyết định: Phương án A — 1 Backend chung, 2 Frontend tách riêng**

```
history-alive/                    (1 Render service — KHÔNG tạo service mới)
└── backend/
    ├── routers/
    │   ├── auth.py, users.py, chat.py, ...   (đã có, không đụng vào)
    │   └── teacher.py                         ← MỚI, code riêng của Duy
    ├── services/
    │   └── teacher_service.py                 ← MỚI
    ├── models/
    │   └── teacher.py                         ← MỚI
    └── main.py             (chỉ thêm 1 dòng include_router)

manager-web/                      (repo + Vercel project RIÊNG)
frontend/                         (repo + Vercel project RIÊNG — của Dũng)
```

**Lý do giữ được tinh thần "tách biệt" của team mà không tốn công vô ích:**

| Tiêu chí | Đạt được? |
|---|---|
| Code riêng theo người, không đụng file người khác | ✅ `teacher.py` là file mới, PR riêng, git blame rõ ràng |
| Frontend hoàn toàn độc lập (repo, deploy, domain riêng) | ✅ `manager-web/` là Vercel project riêng hoàn toàn |
| Backend tách hạ tầng (2 service Render riêng) | ❌ Hy sinh có chủ đích — không cần thiết vì không có data riêng |

**Nếu bị hỏi lại:** *"Teacher Dashboard là read-only consumer của dữ liệu hệ thống chính. Tách backend sẽ buộc tách hoặc đồng bộ MongoDB — tăng độ phức tạp mà không giải quyết vấn đề gì, vì không tồn tại dữ liệu nào thuộc riêng Teacher Dashboard."*

---

## 1. Database Schema (nền tảng)

3 entity dùng chung 1 MongoDB Atlas cluster với hệ thống chính:

```python
School = {
  "_id": str,
  "name": str,
  "contract_slots": int,
  "contract_expires_at": datetime,
  "created_at": datetime
}

Class = {
  "_id": str,
  "school_id": str,
  "teacher_id": str,             # user_id giáo viên được gán
  "name": str,                   # "Lịch sử 10A1"
  "class_code": str,             # unique, format HAL-{year}-{random6}
  "slot_limit": int,
  "expires_at": datetime,
  "status": str,                 # "active" | "expiring_soon" | "expired" | "full"
  "created_at": datetime
}

ClassEnrollment = {
  "_id": str,
  "user_id": str,
  "class_id": str,
  "enrolled_at": datetime,
  "plan_source": str             # "class_code" | "purchase"
}
```

**Index cần tạo:**
```
Class:            class_code (unique), teacher_id, school_id
ClassEnrollment:  (user_id, class_id) unique, class_id
```

> Nếu 3 entity này chưa tồn tại trong DB (do Admin team chưa làm), Duy cần tạo trước — vì Teacher API phụ thuộc hoàn toàn vào đây.

---

## 2. API Contract — `/api/teacher/*`

Tất cả endpoint: **GET only**, yêu cầu `role = "teacher"`, verify ownership trước khi trả dữ liệu.

### `GET /api/teacher/classes`
```json
{
  "classes": [
    {
      "id": "cls_001",
      "name": "Lịch sử 10A1",
      "school_name": "THPT Nguyễn Du",
      "class_code": "HAL-2025-A1X9K2",
      "student_count": 32,
      "slot_limit": 40,
      "status": "active",
      "expires_at": "2025-06-30T00:00:00Z"
    }
  ]
}
```

### `GET /api/teacher/classes/:id/students`
```json
{
  "class_id": "cls_001",
  "class_name": "Lịch sử 10A1",
  "students": [
    {
      "user_id": "u_123",
      "full_name": "Nguyễn Văn A",
      "avatar_url": "...",
      "progress_percent": 68,
      "current_lesson": "Bài 5: Trận Bạch Đằng",
      "avg_score": 82,
      "last_active": "2025-06-20T14:30:00Z",
      "needs_support": false
    }
  ]
}
```
`needs_support` = `avg_score < 60` HOẶC `last_active > 7 ngày trước`.

**Bảo mật bắt buộc — verify ownership:**
```python
class_doc = await db.classes.find_one({"_id": class_id})
if class_doc["teacher_id"] != current_user["_id"]:
    raise HTTPException(403, "Bạn không có quyền xem lớp này")
```

### `GET /api/teacher/classes/:id/students/:uid`
```json
{
  "user_id": "u_123",
  "full_name": "Nguyễn Văn A",
  "lessons": [
    {
      "lesson_id": "l_01",
      "title": "Bài 1: Thời dựng nước",
      "status": "completed",
      "score": 90,
      "time_spent_minutes": 12,
      "completed_at": "2025-06-10T10:00:00Z"
    }
  ]
}
```
Verify thêm: `user_id` phải thuộc `class_id` đó (qua `ClassEnrollment`) — tránh giáo viên xem học sinh ngoài lớp mình.

---

### Backend Agent Prompt

```
You are a senior Python backend developer. Execute all commands directly.

TASK: Implement Teacher Dashboard API (/api/teacher/*) cho History Alive Edu Plan.
Đây được thêm vào BACKEND CHÍNH hiện có (KHÔNG tạo service mới, KHÔNG tạo repo mới).
Toàn bộ endpoint là READ-ONLY — không có bất kỳ POST/PUT/DELETE nào.

CONTEXT:
- Backend đã có: FastAPI + MongoDB Motor, core/security.py với get_current_user
- Entity School, Class, ClassEnrollment ĐÃ TỒN TẠI trong DB (do Admin team tạo)
  Nếu chưa có, tạo trước theo schema:
  School:  {_id, name, contract_slots, contract_expires_at, created_at}
  Class:   {_id, school_id, teacher_id, name, class_code, slot_limit, expires_at, status, created_at}
  ClassEnrollment: {_id, user_id, class_id, enrolled_at, plan_source}
- LessonProgress đã tồn tại trong hệ thống (theo dõi tiến độ học sinh)
- User đã có field "role" — cần thêm giá trị "teacher"
- File mới được tạo TÁCH BIỆT khỏi code router/service của các tính năng khác,
  KHÔNG sửa file đã có trừ main.py (chỉ thêm 1 dòng include_router)

STEP 1 — Thêm role middleware
Trong core/security.py, thêm hàm mới (không sửa hàm cũ):

def require_teacher():
    async def check(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") != "teacher":
            raise HTTPException(403, "Chỉ giáo viên mới truy cập được")
        return current_user
    return check

STEP 2 — Tạo models/teacher.py
  ClassSummary: {id, name, school_name, class_code, student_count,
                 slot_limit, status, expires_at}
  StudentSummary: {user_id, full_name, avatar_url, progress_percent,
                   current_lesson, avg_score, last_active, needs_support}
  LessonDetail: {lesson_id, title, status, score, time_spent_minutes, completed_at}
  StudentDetail: {user_id, full_name, lessons: List[LessonDetail]}

STEP 3 — Tạo services/teacher_service.py

  async def get_teacher_classes(teacher_id: str):
    - Query Class collection: {teacher_id: teacher_id}
    - Với mỗi class, count ClassEnrollment theo class_id → student_count
    - Join School để lấy school_name
    - Tính status runtime: so sánh expires_at với now()
    - Trả về list ClassSummary

  async def get_class_students(class_id: str, teacher_id: str):
    - Verify: class.teacher_id == teacher_id, nếu sai → 403
    - Query ClassEnrollment: {class_id: class_id}
    - Join User collection theo user_id
    - Join LessonProgress để tính progress_percent, avg_score, current_lesson
    - Tính needs_support = (avg_score < 60) OR (last_active > 7 ngày trước now())
    - Trả về list StudentSummary

  async def get_student_detail(class_id: str, user_id: str, teacher_id: str):
    - Verify ownership tương tự
    - Verify user_id thuộc class_id đó (qua ClassEnrollment)
    - Query toàn bộ LessonProgress của user_id
    - Trả về StudentDetail với danh sách lessons đầy đủ

STEP 4 — Tạo routers/teacher.py
  router = APIRouter(prefix="/teacher", tags=["Teacher"])

  GET /classes
    Depends(require_teacher())
    return await get_teacher_classes(current_user["_id"])

  GET /classes/{class_id}/students
    Depends(require_teacher())
    return await get_class_students(class_id, current_user["_id"])

  GET /classes/{class_id}/students/{user_id}
    Depends(require_teacher())
    return await get_student_detail(class_id, user_id, current_user["_id"])

STEP 5 — Index MongoDB
  db.classes.create_index("teacher_id")
  db.class_enrollments.create_index("class_id")
  db.class_enrollments.create_index([("user_id", 1), ("class_id", 1)], unique=True)

STEP 6 — Register router (CHỈ sửa main.py, 1 dòng duy nhất)
  Thêm: app.include_router(teacher.router, prefix="/api")
  KHÔNG sửa các include_router khác đã có.

STEP 7 — Test
Tạo 1 teacher user, 1 class gán teacher đó, vài enrollment giả.
Test 3 endpoint bằng curl:
  - Happy path cho cả 3 endpoint
  - Test 403: teacher_id không khớp class.teacher_id
  - Test 403: role="student" gọi /api/teacher/*
  - Test 403: user_id không thuộc class_id khi gọi student detail

STEP 8 — Deploy
Push code lên nhánh dev/main của repo history-alive (KHÔNG tạo repo mới).
Render tự động deploy lại service hiện có — verify qua logs.
```

---

## 3. Frontend — Quy trình 2 giai đoạn

Để đạt UI đẹp hơn, tách riêng việc **thiết kế UI** và **nối logic** thành 2 bước độc lập:

```
GIAI ĐOẠN A — UI Mock (giao cho model chuyên design)
  Input:  mock data cố định (JSON tĩnh, không gọi API)
  Output: toàn bộ components.tsx + style hoàn chỉnh, đẹp, đúng UX
  Không cần biết gì về backend, axios, hooks, hay auth

GIAI ĐOẠN B — Nối logic (bạn tự làm hoặc giao lại cho agent code)
  Input:  components từ Giai đoạn A (giữ nguyên UI, không sửa style)
  Output: thay mock data bằng API thật qua hooks + axios
  Không động vào JSX/CSS đã có, chỉ thay nguồn dữ liệu
```

Lợi ích: model design tập trung 100% vào trải nghiệm/giao diện mà không bị phân tâm bởi lỗi API, loading state phức tạp hay auth. Khi nối logic, bạn chỉ "cắm" data vào, không phải vẽ lại UI.

---

### GIAI ĐOẠN A — Prompt cho Model chuyên Design UI

```
You are a senior UI/UX designer and frontend developer specializing in 
beautiful, modern dashboard interfaces. Build with React + TypeScript + Tailwind CSS.

TASK: Design Teacher Dashboard cho "History Alive" — nền tảng học Lịch sử 
gamification dành cho học sinh cấp 2-3 Việt Nam. Đây là dashboard cho GIÁO VIÊN 
theo dõi tiến độ học sinh trong lớp mình dạy.

⚠️ QUAN TRỌNG: Đây là bước THIẾT KẾ UI THUẦN — dùng MOCK DATA cố định.
KHÔNG gọi API, KHÔNG cần axios, KHÔNG cần auth, KHÔNG cần React Router.
Chỉ tập trung vào: layout, component, màu sắc, spacing, typography, 
micro-interaction, responsive.

═══════════════════════════════════════
BRAND & DESIGN LANGUAGE (tham khảo, có thể tinh chỉnh cho đẹp hơn)
═══════════════════════════════════════

Đây là dashboard cho Giáo viên — đối tượng người lớn, chuyên nghiệp,
cần đọc nhanh thông tin học sinh. Phong cách: sạch, ấm, đáng tin cậy,
KHÔNG sến/màu sắc trẻ con như app học sinh.

Gợi ý màu nền tham khảo (không bắt buộc, có thể đề xuất bảng màu khác đẹp hơn):
- Background: tông sáng kem/ấm (không trắng tinh, không xám lạnh)
- Card: nền trắng, viền rất mỏng, bo góc nhẹ, shadow tối giản
- Accent: vàng đồng/cam đất (gợi nhớ lịch sử, sách cổ) — tránh xanh dương sáo rỗng
- Badge trạng thái: hệ màu pastel có ý nghĩa
  (xanh=tốt, cam=cảnh báo, đỏ=cần chú ý, xám=trung tính)

Đây CHỈ là gợi ý — nếu bạn (model design) có hướng màu/phong cách tốt hơn 
cho 1 dashboard giáo dục dành cho giáo viên, hãy tự đề xuất và áp dụng.

═══════════════════════════════════════
CẤU TRÚC TRANG CẦN THIẾT KẾ
═══════════════════════════════════════

## Trang duy nhất: Overview (Tổng quan)

Layout 2 cột: Sidebar trái cố định + Content phải.

### Sidebar trái
- Logo "History Alive" + label nhỏ "Teacher Portal"
- Section "Lớp của tôi": list 3-4 lớp dạng chip/card có thể click
  (mock data: "Lịch sử 10A1", "Lịch sử 10A2", "Lịch sử 11B3")
  Lớp đang chọn cần có trạng thái active rõ ràng (không chỉ đổi màu nhạt)
- Menu điều hướng: Tổng quan (active) / Học sinh / Bài học / Bài tập / Thông báo
  (chỉ "Tổng quan" cần hoạt động, các mục khác hiện badge "Sắp ra mắt")
- Footer sidebar: avatar + tên giáo viên (mock: "Nguyễn Thị Hà")

### Content phải

**Header trên cùng:**
Breadcrumb dạng "History Alive — Teacher Portal / Lịch sử 10A1"

**4 Stat Cards** (hàng ngang, responsive wrap trên mobile):
- "Học sinh active" — số lớn + sub-text "trong 7 ngày qua"
- "Tiến độ trung bình" — số % lớn + progress visual nhỏ
- "Điểm trung bình" — số lớn + so sánh "+5% so với tuần trước" (tự sáng tạo)
- "Cần hỗ trợ" — số lớn, màu cảnh báo nếu > 0

**Filter bar:**
3 nút toggle: "Tất cả" / "Cần hỗ trợ" / "Học tốt" — nút active phải nổi bật rõ

**Bảng học sinh** (mock 8 dòng):
Columns: Avatar+Tên | Tiến độ (progress bar) | Bài học hiện tại | 
         Điểm TB | Hoạt động cuối | Trạng thái (badge)
- Mỗi row hover phải có feedback rõ (background đổi, cursor pointer)
- Click vào 1 row → mở "Detail Panel" NGAY DƯỚI row đó (inline expand,
  KHÔNG phải modal, KHÔNG phải trang mới) — animate mượt khi mở/đóng

**Detail Panel (mở inline khi click 1 học sinh):**
- Header nhỏ: tên học sinh + nút đóng (X)
- List 6-8 bài học dạng timeline hoặc card nhỏ, mỗi bài có:
  tên bài, trạng thái (hoàn thành ✓ / đang học / chưa mở khóa 🔒), 
  điểm số (nếu có), thời gian làm bài
- Trạng thái "chưa mở khóa" cần có visual mờ/khác biệt rõ với 2 trạng thái khác

═══════════════════════════════════════
MOCK DATA — DÙNG ĐÚNG CẤU TRÚC NÀY
═══════════════════════════════════════

const mockClasses = [
  { id: "cls_1", name: "Lịch sử 10A1", studentCount: 32 },
  { id: "cls_2", name: "Lịch sử 10A2", studentCount: 38 },
  { id: "cls_3", name: "Lịch sử 11B3", studentCount: 29 },
];

const mockStudents = [
  {
    user_id: "u_1", full_name: "Nguyễn Văn An", avatar_url: null,
    progress_percent: 85, current_lesson: "Bài 7: Khởi nghĩa Tây Sơn",
    avg_score: 88, last_active: "2 giờ trước", needs_support: false
  },
  {
    user_id: "u_2", full_name: "Trần Thị Bình", avatar_url: null,
    progress_percent: 42, current_lesson: "Bài 3: Hai Bà Trưng",
    avg_score: 54, last_active: "9 ngày trước", needs_support: true
  },
  // ... tự sinh thêm 6 học sinh đa dạng (điểm cao/thấp, active/inactive)
];

const mockLessons = [
  { lesson_id: "l_1", title: "Bài 1: Thời dựng nước", status: "completed", 
    score: 90, time_spent_minutes: 12 },
  { lesson_id: "l_2", title: "Bài 2: Hai Bà Trưng", status: "completed", 
    score: 75, time_spent_minutes: 18 },
  { lesson_id: "l_3", title: "Bài 3: Ngô Quyền", status: "in_progress", 
    score: null, time_spent_minutes: null },
  { lesson_id: "l_4", title: "Bài 4: Lý Thường Kiệt", status: "locked", 
    score: null, time_spent_minutes: null },
  // ... tự sinh thêm
];

═══════════════════════════════════════
DELIVERABLE — CẤU TRÚC FILE CẦN TẠO
═══════════════════════════════════════

manager-web/src/
├── mock/
│   └── mockData.ts          ← toàn bộ mock data ở trên
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx       ← nhận props, không tự fetch gì
│   │   └── DashboardLayout.tsx
│   ├── StatCard.tsx
│   ├── StudentTable.tsx       ← nhận students[] qua props
│   ├── StudentDetailPanel.tsx ← nhận lessons[] qua props
│   ├── StatusBadge.tsx
│   ├── ProgressBar.tsx
│   └── FilterBar.tsx
├── pages/
│   └── Overview.tsx           ← dùng useState để quản lý
│                                  selectedClassId, expandedStudentId, filterMode
│                                  TẤT CẢ data lấy từ mock/mockData.ts
├── App.tsx                    ← render <Overview /> trực tiếp, không cần router
└── index.css / tailwind config

YÊU CẦU KỸ THUẬT BẮT BUỘC (để Giai đoạn B nối logic dễ dàng):
- MỌI component nhận data qua props, KHÔNG hardcode data bên trong component
  (data hardcode chỉ nằm ở pages/Overview.tsx hoặc mock/mockData.ts)
- Tên prop interface phải khớp đúng tên field ở mục "MOCK DATA" bên trên
  (để sau này thay bằng API response thật không cần đổi tên field)
- KHÔNG dùng localStorage/sessionStorage
- Responsive tối thiểu: hoạt động tốt ở 1280px (desktop), không cần tối ưu mobile

Hãy tự do sáng tạo về: animation, micro-interaction, empty state, 
hover effect, color palette tinh tế hơn — miễn giữ đúng cấu trúc data và 
layout tổng thể đã mô tả. Ưu tiên cảm giác "đáng tin cậy, chuyên nghiệp, 
dễ đọc nhanh" hơn là "nhiều màu sắc, vui nhộn".
```

---

### GIAI ĐOẠN B — Prompt nối Logic (sau khi đã có UI từ Giai đoạn A)

```
You are a senior React/TypeScript developer. Execute all commands directly.

TASK: Nối API thật vào Teacher Dashboard UI đã có sẵn (từ Giai đoạn A).
⚠️ KHÔNG sửa bất kỳ JSX/className/style nào trong các component đã có.
CHỈ thay nguồn dữ liệu từ mock sang API thật.

CONTEXT:
- UI đã hoàn chỉnh tại manager-web/src/components/ và pages/Overview.tsx
- Hiện tại Overview.tsx đang import từ mock/mockData.ts
- Backend đã có 3 endpoint thật:
  GET /api/teacher/classes
  GET /api/teacher/classes/:id/students
  GET /api/teacher/classes/:id/students/:uid
- Cần thêm: Login page, routing, auth (KHÔNG có trong Giai đoạn A)

STEP 1 — Cài thêm dependencies
cd manager-web
npm install axios react-router-dom

STEP 2 — Tạo .env
VITE_API_URL=https://history-alive-xxxx.onrender.com/api

STEP 3 — Tạo types/teacher.ts
Copy chính xác interface từ các component đã có (props types) thành 
type chính thức dùng chung — đảm bảo khớp 100% với field đã dùng trong UI.

STEP 4 — Tạo lib/api.ts
axios instance, baseURL từ VITE_API_URL, interceptor gắn Bearer token.
Hàm: getTeacherClasses(), getClassStudents(classId), getStudentDetail(classId, userId)

STEP 5 — Tạo hooks/useTeacherClasses.ts và useClassStudents.ts
useState + useEffect gọi API qua lib/api.ts, trả {data, loading, error, refetch}

STEP 6 — Sửa pages/Overview.tsx (CHỈ phần data, giữ nguyên JSX return)
- Xóa import từ mock/mockData.ts
- Thay bằng hooks useTeacherClasses() và useClassStudents(selectedClassId)
- Thêm loading/error state đơn giản (có thể tái dùng skeleton nếu 
  Giai đoạn A đã làm, nếu chưa thì thêm spinner tối giản không phá layout)
- KHÔNG đổi bất kỳ class Tailwind hay cấu trúc JSX nào

STEP 7 — Tạo pages/Login.tsx (trang mới, không có ở Giai đoạn A)
Form email/password, gọi POST {VITE_API_URL}/auth/login,
verify role === "teacher", redirect /overview nếu đúng,
lỗi "Tài khoản này không có quyền giáo viên" nếu sai role.
Style đồng bộ với design system đã có (tham khảo màu/spacing từ 
StatCard hoặc component khác đã có sẵn).

STEP 8 — Setup routing trong App.tsx
/ → redirect /overview nếu có token, else /login
/login → Login
/overview → Overview (protected route, check role teacher)

STEP 9 — Test
npm run dev
Login bằng teacher test account, verify UI giữ nguyên y hệt Giai đoạn A
nhưng giờ load data thật từ backend.

STEP 10 — Xóa mock/mockData.ts nếu không còn dùng, hoặc giữ lại 
để dùng cho Storybook/test sau này (tùy chọn).
```

---

### Cấu trúc `manager-web/` (repo + Vercel project riêng)

```
manager-web/
├── src/
│   ├── pages/
│   │   ├── Login.tsx
│   │   └── Overview.tsx          ← Trang Tổng quan (4 stat cards + bảng)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx       ← logo, menu, chip danh sách lớp
│   │   │   └── DashboardLayout.tsx
│   │   ├── StatCard.tsx
│   │   ├── StudentTable.tsx
│   │   ├── StudentDetailPanel.tsx ← mở inline dưới bảng khi click row
│   │   ├── StatusBadge.tsx
│   │   └── ProgressBar.tsx
│   ├── hooks/
│   │   ├── useTeacherClasses.ts
│   │   └── useClassStudents.ts
│   ├── lib/
│   │   └── api.ts                ← gọi VITE_API_URL/api/teacher/*
│   ├── types/
│   │   └── teacher.ts
│   ├── App.tsx
│   └── main.tsx
├── .env                            VITE_API_URL=https://history-alive-xxxx.onrender.com/api
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

### Design tokens (giữ nhất quán với Admin Console)

```
Header: nền đen #1a1a1a, chữ vàng nhạt #d4a843 brand, chữ trắng breadcrumb
Background: nền sáng kem #faf8f3
Card: nền trắng, viền 1px #e5e3dc, border-radius 12px
Badge trạng thái:
  - "Hoạt động"    → bg #e8f5e0, chữ #4a7c2f
  - "Sắp hết hạn"  → bg #fdf0d8, chữ #b8722a
  - "Hết hạn"      → bg #fce8e8, chữ #c44545
  - "Đầy slot"     → bg #f0efe9, chữ xám
Progress bar: track xám nhạt, fill xanh (<80%) / cam (80-99%) / đỏ (100%)
Avatar tròn: bg xanh nhạt, 2 chữ cái đầu tên
```

### Layout trang Tổng quan

```
┌──────────┬─────────────────────────────────────────────┐
│ SIDEBAR  │  HEADER: breadcrumb + tên giáo viên          │
│          ├─────────────────────────────────────────────┤
│ Logo     │  4 STAT CARDS                                │
│          │  [Active] [Tiến độ TB] [Điểm TB] [Cần hỗ trợ]│
│ Lớp 10A1 ├─────────────────────────────────────────────┤
│ Lớp 10A2 │  FILTER: [Tất cả] [Cần hỗ trợ] [Tốt]         │
│ Lớp 11B3 ├─────────────────────────────────────────────┤
│          │  BẢNG HỌC SINH (click row → detail inline)   │
│ Menu...  │                                               │
└──────────┴─────────────────────────────────────────────┘
```

**Hành vi quan trọng:**
- Click chip lớp ở sidebar → đổi `selectedClassId` state + refetch, không phải route mới
- Click row học sinh → detail panel mở **inline ngay dưới row đó** (kỹ thuật `colSpan`), KHÔNG dùng modal, KHÔNG navigate
- Filter "Cần hỗ trợ/Tốt" → lọc client-side trên data đã fetch, không gọi lại API
- Không có nút Edit/Delete/Create ở bất kỳ đâu

### Frontend Agent Prompt

```
You are a senior React/TypeScript developer. Execute all commands directly.

TASK: Build Teacher Dashboard frontend trong REPO RIÊNG "manager-web/".
Đây là repo hoàn toàn độc lập với repo "frontend/" (học sinh) và repo "history-alive" (backend).
Sẽ deploy lên Vercel project riêng, kết nối tới backend chính qua biến môi trường VITE_API_URL.
Tech stack: React + Vite + TypeScript + Tailwind CSS.
Toàn bộ là READ-ONLY UI — không có form create/edit/delete nào.

CONTEXT:
- Backend API đã có 3 endpoint (deploy chung với backend chính, gọi qua VITE_API_URL):
  GET /api/teacher/classes
  GET /api/teacher/classes/:id/students
  GET /api/teacher/classes/:id/students/:uid
- Design: nền sáng #faf8f3, card viền #e5e3dc bo góc 12px, header đen #1a1a1a
- Layout: sidebar trái cố định + content phải, detail panel inline KHÔNG dùng modal

STEP 1 — Khởi tạo project (REPO RIÊNG, không nằm trong history-alive)
npm create vite@latest manager-web -- --template react-ts
cd manager-web
git init
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios react-router-dom zustand clsx

STEP 2 — Tạo .env
VITE_API_URL=https://history-alive-xxxx.onrender.com/api
(thay bằng URL thật của backend chính sau khi Duy deploy xong teacher.py)

STEP 3 — Cấu hình Tailwind theme
Trong tailwind.config.js, thêm vào theme.extend.colors:
  background: '#faf8f3'
  card-border: '#e5e3dc'
  status: {
    active-bg: '#e8f5e0', active-text: '#4a7c2f',
    warning-bg: '#fdf0d8', warning-text: '#b8722a',
    danger-bg: '#fce8e8', danger-text: '#c44545',
    neutral-bg: '#f0efe9', neutral-text: '#6b6b6b'
  }

STEP 4 — Tạo types/teacher.ts
  interface ClassSummary {
    id: string; name: string; school_name: string; class_code: string;
    student_count: number; slot_limit: number; status: string; expires_at: string;
  }
  interface StudentSummary {
    user_id: string; full_name: string; avatar_url: string;
    progress_percent: number; current_lesson: string; avg_score: number;
    last_active: string; needs_support: boolean;
  }
  interface LessonDetail {
    lesson_id: string; title: string; status: string;
    score: number; time_spent_minutes: number; completed_at: string | null;
  }
  interface StudentDetail {
    user_id: string; full_name: string; lessons: LessonDetail[];
  }

STEP 5 — Tạo lib/api.ts
  axios instance, baseURL = import.meta.env.VITE_API_URL
  interceptor tự gắn Bearer token từ localStorage
  Hàm: getTeacherClasses(), getClassStudents(classId), getStudentDetail(classId, userId)

STEP 6 — Tạo components/layout/Sidebar.tsx
  - Logo + tên app
  - Section "Lớp của tôi": render ClassSummary dạng chip, click → onClassSelect(classId)
  - Menu: Tổng quan / Học sinh / Bài học / Bài tập / Thông báo
    (chỉ "Tổng quan" hoạt động thật ở v1, còn lại disabled "Sắp ra mắt")

STEP 7 — Tạo components/StatCard.tsx
  Props: { label, value, sublabel? }
  Card trắng viền mỏng, label xám nhỏ trên, value to bold, sublabel xám nhạt dưới

STEP 8 — Tạo components/StatusBadge.tsx
  Props: { status: "active"|"warning"|"danger"|"neutral", label }
  Pill rounded-full theo màu mapping ở Step 3

STEP 9 — Tạo components/ProgressBar.tsx
  Props: { percent, max }
  Track xám nhạt, fill: percent/max < 0.8 xanh / < 1 cam / == 1 đỏ

STEP 10 — Tạo components/StudentTable.tsx
  Props: { students, onRowClick, expandedUserId, detailContent }
  Columns: Avatar+Tên | ProgressBar | current_lesson | avg_score |
           last_active ("X ngày trước") | StatusBadge(needs_support)
  Row click → toggle expand
  Nếu row.user_id === expandedUserId → render detail bằng <tr><td colSpan={6}>
    {detailContent}</td></tr> với transition height

STEP 11 — Tạo components/StudentDetailPanel.tsx
  Props: { detail: StudentDetail | null, loading }
  List lessons: title + StatusBadge(status) + score + time_spent
  3 trạng thái: completed (✓ xanh) / in_progress (cam) / locked (xám)

STEP 12 — Tạo hooks/useTeacherClasses.ts và useClassStudents.ts
  useState + useEffect gọi API, trả {data, loading, error, refetch}

STEP 13 — Tạo pages/Overview.tsx — ghép lại
  State: selectedClassId, expandedUserId, filterMode
  <Sidebar onClassSelect={setSelectedClassId} />
  <main>
    4 StatCard tính từ students data
    Filter buttons
    <StudentTable students={filtered} onRowClick={toggleExpand}
                   expandedUserId detailContent={<StudentDetailPanel .../>} />
  </main>

STEP 14 — Tạo pages/Login.tsx
  Form email/password, gọi POST {VITE_API_URL}/auth/login (API hệ thống chính),
  verify role === "teacher" sau login, redirect /overview nếu đúng,
  hiện lỗi "Tài khoản này không có quyền giáo viên" nếu sai role

STEP 15 — Setup routing trong App.tsx
  / → redirect /overview nếu có token, else /login
  /login → Login
  /overview → Overview (protected, check role teacher)

STEP 16 — Chạy thử local
npm run dev
Login bằng teacher test account, verify data load đúng từ backend thật.

STEP 17 — Push lên repo riêng
git add . && git commit -m "[Manager-Web] Initial Teacher Dashboard"
git remote add origin [URL repo manager-web]
git push -u origin main
```

---

## 4. Deploy

**Backend (không có gì mới phải deploy — dùng lại service Render hiện có):**
1. Push `teacher.py` + các file liên quan lên repo `history-alive`
2. Render tự build lại service đang chạy — không tạo service mới, không cấu hình gì thêm

**Frontend `manager-web` (deploy mới hoàn toàn, độc lập):**
1. Tạo repo GitHub riêng `manager-web`
2. Vào Vercel → New Project → Import repo `manager-web`
3. Set biến môi trường: `VITE_API_URL=https://history-alive-xxxx.onrender.com/api`
4. Deploy

---

## 5. Thứ tự thực hiện

| # | Việc | Loại | Phụ thuộc |
|---|------|------|-----------|
| 1 | Verify/migrate 3 entity School, Class, ClassEnrollment | DB | — |
| 2 | Backend: `core/security.py` thêm `require_teacher` | BE | 1 |
| 3 | Backend: `GET /api/teacher/classes` | BE | 2 |
| 4 | Backend: `GET /api/teacher/classes/:id/students` | BE | 3 |
| 5 | Backend: `GET /api/teacher/classes/:id/students/:uid` | BE | 4 |
| 6 | Test toàn bộ API bằng Postman với data giả | BE | 3,4,5 |
| 7 | Push lên repo history-alive, Render tự deploy lại | Deploy | 6 |
| 8 | FE: tạo repo `manager-web` riêng + khởi tạo Vite project | FE | — |
| 9 | FE: Tailwind theme + components dùng chung | FE | 8 |
| 10 | FE: Sidebar + Layout | FE | 9 |
| 11 | FE: StudentTable + StudentDetailPanel | FE | 9 |
| 12 | FE: Login page | FE | 8 |
| 13 | FE: ghép Overview page, nối API thật (cần URL từ bước 7) | FE | 7, 10, 11, 12 |
| 14 | Test end-to-end: login → xem lớp → xem học sinh → xem detail | E2E | 13 |
| 15 | Deploy `manager-web` lên Vercel project riêng | Deploy | 14 |

> Việc 1–7 (Backend) hoàn toàn độc lập, test bằng Postman trước khi đụng Frontend. Việc 8–12 (Frontend cơ bản) có thể làm song song bằng mock data trong lúc chờ backend deploy xong. Việc 13 là điểm nối hai nhánh.

---

## 6. Checklist kiểm thử trước khi Done

```
Backend
[ ] Teacher A không xem được lớp của Teacher B (test 403)
[ ] Teacher xem học sinh không thuộc lớp mình → 403
[ ] needs_support tính đúng (avg_score < 60 OR last_active > 7 ngày)
[ ] Class có 0 học sinh → trả array rỗng, không lỗi 500
[ ] Role "student" gọi /api/teacher/* → 403
[ ] Push code không làm ảnh hưởng các router khác (auth, chat, users...)

Frontend
[ ] Click chip lớp khác → bảng đổi đúng, không cache data cũ
[ ] Click row học sinh → panel mở đúng dưới row đó
[ ] Click lại → panel đóng (toggle)
[ ] Filter "Cần hỗ trợ" → chỉ hiện needs_support=true
[ ] Không có nút Edit/Delete/Create ở bất kỳ đâu
[ ] Login role="student" → bị chặn
[ ] manager-web deploy độc lập, không ảnh hưởng frontend học sinh
```

---

*Bản kế hoạch chốt — dựa trên: Edu Plan mô tả thiết kế & kiến trúc + ảnh mẫu Curator Console + quyết định kiến trúc đã thống nhất trong hội thoại.*
