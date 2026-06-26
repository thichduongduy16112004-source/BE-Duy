# Manager Web - Development Log

## Tổng quan

`manager-web/` là web dashboard riêng dành cho giáo viên/manager của dự án History Alive. Web này được tạo để giáo viên đăng nhập, xem danh sách lớp được phân công, theo dõi tiến độ học sinh, lọc học sinh cần hỗ trợ và xem chi tiết tiến độ bài học của từng học sinh.

Frontend được tách riêng khỏi app học sinh hiện tại để sau này có thể deploy độc lập trên Vercel, còn backend FastAPI vẫn deploy riêng trên Render.

---

## Công nghệ sử dụng

- React 19
- Vite 8
- TypeScript
- Tailwind CSS v4
- Lucide React icons
- Fetch API cho HTTP client
- LocalStorage để lưu session teacher trong bản MVP

File cấu hình package: `manager-web/package.json`

Các script chính:

```bash
npm run dev
npm run build
npm run preview
```

---

## Cấu trúc thư mục chính

```txt
manager-web/
├── log.md
├── package.json
├── vite.config.ts
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── components/
│   │   ├── ProgressBar.tsx
│   │   ├── StatCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── StudentDetailPanel.tsx
│   │   ├── StudentTable.tsx
│   │   └── layout/
│   │       ├── DashboardLayout.tsx
│   │       └── Sidebar.tsx
│   ├── hooks/
│   │   └── teacherHooks.ts
│   ├── lib/
│   │   └── api.ts
│   ├── mock/
│   │   └── mockData.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   └── Overview.tsx
│   └── types/
│       └── teacher.ts
```

---

## Những gì đã tạo trong `manager-web/`

### 1. Khởi tạo project frontend

Đã tạo project React + Vite + TypeScript trong thư mục `manager-web/`.

Chức năng:

- Tách web manager thành một frontend độc lập.
- Có thể chạy local bằng Vite.
- Có thể build production để deploy sau này.

---

### 2. Cấu hình Tailwind CSS v4

Files:

- `manager-web/vite.config.ts`
- `manager-web/src/index.css`

Đã thêm plugin Tailwind cho Vite và dùng cú pháp CSS-first của Tailwind v4.

Trong `src/index.css` đã cấu hình design tokens:

- `--color-background`: nền ấm của dashboard.
- `--color-surface`: nền card/sidebar.
- `--color-header`: màu text chính.
- `--color-brand`: màu nhấn vàng.
- `--color-border`: màu viền.
- `--radius-card`: border radius card.
- `--font-sans`: font chính.

Ngoài ra đã sửa lỗi tiếng Việt/typography:

- Import Google Font `Inter`.
- Thêm fallback `Segoe UI`, `system-ui`, `Arial`.
- Ép `button`, `input`, `textarea`, `select` dùng cùng font.
- Thêm `text-rendering: optimizeLegibility`.

Chức năng: đảm bảo giao diện thống nhất và render tiếng Việt đẹp hơn.

---

### 3. Tạo mock data ban đầu

File: `manager-web/src/mock/mockData.ts`

Đã tạo dữ liệu mẫu ban đầu để dựng UI khi chưa nối API thật.

Bao gồm:

- Interface `Lesson`
- Interface `Student`
- Interface `ClassData`
- `MOCK_CLASS_DATA`
- `MOCK_STUDENT_DETAIL`

Chức năng:

- Giúp dựng UI nhanh ở giai đoạn mock.
- Sau khi nối API thật, file này không còn là nguồn dữ liệu chính.
- Có thể giữ lại để demo/offline fallback nếu cần.

---

### 4. Tạo types cho Teacher API

File: `manager-web/src/types/teacher.ts`

Đã thêm các type khớp response backend:

- `ClassSummary`
- `StudentSummary`
- `LessonDetail`
- `StudentDetail`
- `TeacherClassesResponse`
- `ClassStudentsResponse`
- `AuthUser`
- `LoginResponse`
- `AuthSession`

Chức năng:

- Chuẩn hóa dữ liệu giữa frontend và backend.
- Giúp TypeScript bắt lỗi khi dùng sai field.
- Là nền tảng cho API client và hooks.

---

### 5. Tạo API client

File: `manager-web/src/lib/api.ts`

Đã tạo API client dùng `fetch`.

Các function chính:

```ts
login(identity, password)
getTeacherClasses()
getClassStudents(classId)
getStudentDetail(classId, userId)
```

Các helper session:

```ts
getStoredSession()
saveSession(session)
clearSession()
```

API base URL mặc định:

```txt
http://127.0.0.1:8000/api/v1
```

Khi deploy có thể set biến môi trường:

```env
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

Chức năng:

- Gọi backend thật.
- Tự gắn header `Authorization: Bearer <token>`.
- Tự xóa session khi gặp lỗi `401 Unauthorized`.
- Chuẩn hóa lỗi bằng class `ApiError`.

---

### 6. Tạo hooks gọi dữ liệu teacher

File: `manager-web/src/hooks/teacherHooks.ts`

Đã tạo các hook:

```ts
useTeacherClasses()
useClassStudents(classId)
useStudentDetail(classId, userId)
```

Mỗi hook trả về `data`, `loading`, `error`, `refetch`.

Chức năng:

- Tách logic gọi API ra khỏi component UI.
- Component chỉ cần quan tâm render `loading`, `error`, `data`.
- Dễ tái sử dụng cho các page sau.

---

### 7. Tạo trang Login

File: `manager-web/src/pages/Login.tsx`

Chức năng:

- Form email/password cho giáo viên.
- Gọi `POST /api/v1/auth/login`.
- Lưu access token và user vào localStorage.
- Kiểm tra role user.
- Nếu role không phải `teacher`, hiển thị: `Tài khoản này không có quyền giáo viên`.

Tài khoản demo được điền sẵn để test nhanh:

```txt
teacher.demo@historyalive.vn
Teacher123
```

---

### 8. Tạo auth gate trong App

File: `manager-web/src/App.tsx`

Chức năng:

- Nếu chưa có session teacher: hiển thị `Login`.
- Nếu có session teacher: hiển thị `Overview`.
- Hỗ trợ logout bằng cách xóa session và quay lại login.

Hiện tại chưa dùng `react-router-dom` để giữ project gọn ở MVP. Các trang sidebar khác có thể bổ sung routing sau.

---

### 9. Tạo layout dashboard

File: `manager-web/src/components/layout/DashboardLayout.tsx`

Chức năng:

- Bố cục chính của dashboard.
- Sidebar cố định bên trái.
- Header cố định phía trên.
- Main content rộng tối đa `max-w-7xl`.
- Nhận props `classes`, `selectedClassId`, `user`, `onSelectClass`, `onLogout`.

---

### 10. Tạo Sidebar

File: `manager-web/src/components/layout/Sidebar.tsx`

Chức năng:

- Hiển thị logo `HISTORY ALIVE`.
- Hiển thị danh sách lớp thật từ Teacher API.
- Cho phép chọn lớp.
- Hiển thị thông tin teacher đang login.
- Có nút logout.

Đã chỉnh UX sidebar:

- `Tổng quan` là mục active hiện tại.
- `Học sinh`, `Bài học`, `Bài tập` đang disabled và có nhãn `Sắp có`.

Lý do: hiện tại mới làm page Tổng quan. Các page riêng chưa được triển khai, nên disabled để tránh hiểu nhầm là lỗi API.

---

### 11. Tạo trang Overview

File: `manager-web/src/pages/Overview.tsx`

Chức năng:

- Gọi API lấy danh sách lớp của teacher.
- Tự chọn lớp đầu tiên khi load.
- Gọi API lấy danh sách học sinh theo lớp đang chọn.
- Tính thống kê từ dữ liệu thật:
  - Sĩ số lớp.
  - Tiến độ trung bình.
  - Điểm trung bình.
  - Số học sinh cần hỗ trợ.
- Hiển thị loading state.
- Hiển thị error state.
- Hiển thị empty state khi teacher chưa có lớp hoặc lớp chưa có học sinh.
- Render `StudentTable`.

---

### 12. Tạo StatCard

File: `manager-web/src/components/StatCard.tsx`

Chức năng: card thống kê reusable, hiển thị title, value, icon và có hỗ trợ trend nếu cần.

---

### 13. Tạo ProgressBar

File: `manager-web/src/components/ProgressBar.tsx`

Chức năng: hiển thị tiến độ học tập theo phần trăm trong bảng học sinh.

---

### 14. Tạo StatusBadge

File: `manager-web/src/components/StatusBadge.tsx`

Chức năng:

- Nếu `needs_support = true`: hiển thị `Cần hỗ trợ`.
- Nếu `needs_support = false`: hiển thị trạng thái ổn định.

---

### 15. Tạo StudentTable

File: `manager-web/src/components/StudentTable.tsx`

Chức năng:

- Hiển thị danh sách học sinh của lớp đang chọn.
- Có ô tìm kiếm theo tên học sinh.
- Có bộ lọc `Tất cả học sinh`, `Cần hỗ trợ`, `Ổn định`.
- Hiển thị các cột `Họ và tên`, `Tiến độ khóa học`, `Điểm TB`, `Trạng thái`.
- Click vào từng học sinh để mở/đóng detail panel.

Đã sửa lỗi encoding tiếng Việt trong file này:

- `Há» vÃ  tÃªn` → `Họ và tên`
- `Tiáº¿n Ä‘á»™ khÃ³a há»c` → `Tiến độ khóa học`
- `Äiá»ƒm TB` → `Điểm TB`
- `Tráº¡ng thÃ¡i` → `Trạng thái`
- Các label filter và placeholder tìm kiếm cũng đã sửa đúng UTF-8.

---

### 16. Tạo StudentDetailPanel

File: `manager-web/src/components/StudentDetailPanel.tsx`

Chức năng:

- Khi click học sinh trong bảng, component gọi API thật: `GET /api/v1/teacher/classes/{class_id}/students/{user_id}`.
- Hiển thị danh sách bài học của học sinh.
- Hiển thị trạng thái bài học: completed, in progress, not started/locked.
- Hiển thị điểm và thời gian học nếu bài đã hoàn thành.
- Có loading, error và empty state.

---

## Backend liên quan đã tạo/chỉnh để manager-web hoạt động

Dù web nằm trong `manager-web/`, để frontend hoạt động với dữ liệu thật đã cần thêm API backend.

### 1. Teacher API router

File: `backend/routers/teacher.py`

Endpoints:

```txt
GET /api/v1/teacher/classes
GET /api/v1/teacher/classes/{class_id}/students
GET /api/v1/teacher/classes/{class_id}/students/{user_id}
```

Chức năng: trả danh sách lớp, danh sách học sinh trong lớp và chi tiết tiến độ bài học của một học sinh.

### 2. Teacher service

File: `backend/services/teacher_service.py`

Chức năng:

- Query dữ liệu class/student/progress từ MongoDB.
- Kiểm tra teacher chỉ được xem lớp của mình.
- Tổng hợp tiến độ, điểm trung bình, trạng thái cần hỗ trợ.

### 3. Teacher models

File: `backend/models/teacher.py`

Chức năng: định nghĩa Pydantic response model cho Teacher API.

### 4. Teacher role guard

File: `backend/core/security.py`

Chức năng: thêm guard kiểm tra user phải có role `teacher` và bảo vệ endpoint `/api/v1/teacher/*`.

### 5. Register router trong FastAPI app

File: `backend/main.py`

Chức năng: gắn `teacher_router` vào app với prefix version hiện tại, đảm bảo API chạy dưới `/api/v1/teacher/...`.

### 6. Script setup database foundation

File: `backend/scripts/setup_teacher_dashboard_foundation.py`

Chức năng: tạo collection/index cần thiết cho teacher dashboard và seed dữ liệu demo nếu cần.

### 7. Script smoke test Teacher API

File: `backend/scripts/smoke_teacher_dashboard_api.py`

Chức năng:

- Login teacher demo bằng CLI.
- Gọi lần lượt các endpoint Teacher API.
- Kiểm tra response cơ bản.
- Dùng để xác nhận backend Teacher API hoạt động trước khi nối frontend.

---

## Luồng hoạt động hiện tại

```txt
Teacher mở manager-web
→ Login bằng email/password
→ Frontend gọi /api/v1/auth/login
→ Backend trả access_token + user
→ Frontend kiểm tra role teacher
→ Lưu session vào localStorage
→ Vào Overview
→ Frontend gọi /api/v1/teacher/classes
→ Chọn lớp đầu tiên
→ Frontend gọi /api/v1/teacher/classes/{class_id}/students
→ Render thống kê và bảng học sinh
→ Click học sinh
→ Frontend gọi /api/v1/teacher/classes/{class_id}/students/{user_id}
→ Render chi tiết bài học inline
```

---

## Trạng thái sidebar hiện tại

Hiện tại đã làm:

- Tổng quan.
- Chọn lớp.
- Danh sách học sinh trong Overview.
- Detail học sinh inline.

Chưa làm page riêng:

- Học sinh.
- Bài học.
- Bài tập.

Vì vậy các mục này đang disabled với nhãn `Sắp có`. Đây không phải lỗi API.

---

## Cách chạy local

### 1. Chạy backend

Backend cần chạy ở `http://127.0.0.1:8000`.

### 2. Chạy manager-web

Trong thư mục `manager-web/`:

```bash
npm run dev
```

Mở `http://localhost:5173`.

### 3. Tài khoản teacher demo

```txt
teacher.demo@historyalive.vn
Teacher123
```

---

## Cách build kiểm tra

Trong thư mục `manager-web/`:

```bash
npm run build
```

Build gần nhất đã pass với Vite/TypeScript.

---

## Ghi chú triển khai production

Khi deploy `manager-web`, cần set biến môi trường:

```env
VITE_API_URL=https://your-render-backend-url/api/v1
```

Nếu không set, frontend sẽ dùng mặc định `http://127.0.0.1:8000/api/v1`.

---

## Những việc nên làm tiếp theo

1. Tạo routing thật bằng `react-router-dom`.
2. Tạo page riêng cho `Học sinh`.
3. Tạo page riêng cho `Bài học`.
4. Tạo page riêng cho `Bài tập`.
5. Thêm refresh token flow hoặc httpOnly cookie cho production.
6. Deploy backend lên Render.
7. Deploy manager-web lên Vercel.
8. Cấu hình CORS production giữa Vercel và Render.
