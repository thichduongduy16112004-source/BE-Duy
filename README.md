# History Alive - Hệ Thống Học Lịch Sử & Quản Trị Toàn Diện

Dự án **History Alive** là một hệ sinh thái học tập lịch sử Việt Nam tương tác cao, kết hợp giữa ứng dụng học viên nhập vai AI, trang quản trị hệ thống (Admin Portal) độc lập và hệ thống Backend FastAPI + CSDL MongoDB Atlas.

---

## 📁 Cấu Trúc Tổng Thể Dự Án

Thư mục chính chứa 3 thành phần cốt lõi:

```text
history-alive/
├── backend/                       # FastAPI Backend API Server
├── dung_historyalive_sprint2-main/ # Student Web App (Vite + React + TS)
└── historyalive-admin/            # Admin Web Portal (Vite + React + TS)
```

---

## 🚀 Các Thành Phần Chi Tiết

### 1. Backend Server (`backend/` - Port 8000)
Được xây dựng bằng **FastAPI**, kết nối phi tuần tự (async) với **MongoDB Atlas** qua thư viện `motor`.
*   **Authentication & RBAC:** Cơ chế đăng ký/đăng nhập cấp cặp JWT Token (`access_token` & `refresh_token`), mã hóa mật khẩu bằng `bcrypt`. Hỗ trợ phân quyền người dùng (`role = "admin"` hoặc `"student"`).
*   **Auto-Role Promotion:** Hỗ trợ kiểm thử cục bộ bằng cách tự động gán quyền `role: "admin"` cho bất kỳ email đăng ký nào chứa từ khóa `"admin"`.
*   **AI Chat SSE Streaming:** Tương tác nhập vai với 8 nhân vật lịch sử Việt Nam qua Server-Sent Events (SSE) để truyền dữ liệu thời gian thực.
*   **Admin APIs:** Các endpoint được bảo vệ bằng quyền truy cập admin để quản lý học viên, xem thống kê biểu đồ và thực hiện CRUD bài học, câu hỏi trắc nghiệm (quiz).
*   **DB Lifespan Seeding:** Tự động chèn 2 bài học mặc định (Lý Thường Kiệt P1 & P2) kèm bộ câu hỏi ôn tập khi máy chủ khởi động nếu CSDL trống.

### 2. Ứng Dụng Học Viên (`dung_historyalive_sprint2-main/` - Port 5173)
Giao diện ứng dụng di động giả lập chạy trên nền web (Vite + React + TS) tối ưu trải nghiệm người dùng học sinh.
*   **Bản Đồ Checkpoint Động (Home Map):** Vẽ Timeline zigzag động dựa trên danh sách bài học lấy trực tiếp từ API `/lessons` của Backend thay vì dữ liệu cứng.
*   **Màn Hình Học Video & Quiz Động:** Lấy đúng link nhúng video và các câu hỏi trắc nghiệm tương ứng từ cơ sở dữ liệu để học sinh trả lời, tính điểm thưởng EXP.
*   **Tương Tác Chat Nhập Vai:** Học sinh chọn trò chuyện trực tiếp với nhân vật lịch sử (mặc định là Nguyễn Trãi) và nhận flashcard ôn tập tự động khi kết thúc.
*   **Nút Admin Portal:** Nút màu vàng kim nổi bật xuất hiện ở cuối trang Hồ Sơ, chỉ hiển thị nếu tài khoản đăng nhập có `role === "admin"`, dẫn trực tiếp tới Cổng quản trị `5174`.

### 3. Cổng Quản Trị Hệ Thống (`historyalive-admin/` - Port 5174)
Một ứng dụng Frontend riêng biệt (Vite + React + TS) thiết kế cao cấp dành riêng cho Quản trị viên điều hành.
*   **Login Guard:** Chặn học sinh đăng nhập, chỉ cho phép tài khoản Admin có token hợp lệ đi qua.
*   **Bảng Điều Khiển Tổng Quan (Dashboard Overview):** Tích hợp biểu đồ trực quan (Recharts) thể hiện lượng đăng ký học viên mới và số lượt chat AI, kèm theo các thẻ chỉ số (KPIs) thời gian thực.
*   **Quản Lý Học Viên (Users Tab):** Bảng quản lý tài khoản người dùng, hỗ trợ chuyển đổi quyền trực tiếp (Make Admin / Student) và xóa vĩnh viễn tài khoản.
*   **Biên Tập Bài Học Động (Lessons CRUD):** Trình quản lý bài học trực quan dạng lưới, hỗ trợ mở Modal thêm mới và cập nhật nội dung bài học, thay đổi video YouTube và quản lý bộ câu hỏi quiz đi kèm một cách linh hoạt.

---

## ⚙️ Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Chuẩn Bị
Đảm bảo máy tính của bạn đã cài đặt:
*   [Python 3.10+](https://www.python.org/)
*   [Node.js (LTS)](https://nodejs.org/) & NPM

---

### 2. Thiết Lập & Khởi Chạy Backend

1.  Di chuyển vào thư mục `backend`:
    ```bash
    cd backend
    ```
2.  Cài đặt dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Tạo file cấu hình `.env` dựa theo mẫu `.env.example`:
    ```env
    MONGODB_URI=mongodb+srv://thichduongduy:16112004@cluster0.7gukzfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
    JWT_SECRET=supersecret123
    JWT_REFRESH_SECRET=supersecret456
    OPENAI_API_KEY=mock-key
    ```
4.  Khởi chạy Server:
    ```bash
    python -m uvicorn main:app --reload --port 8000
    ```
    *   **Tài liệu tương tác API (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 3. Thiết Lập & Khởi Chạy App Học Viên

1.  Di chuyển vào thư mục `dung_historyalive_sprint2-main`:
    ```bash
    cd dung_historyalive_sprint2-main
    ```
2.  Cài đặt dependencies:
    ```bash
    npm install
    ```
3.  Khởi chạy chế độ Development:
    ```bash
    npm run dev
    ```
    *   **Ứng dụng chạy tại:** [http://localhost:5173](http://localhost:5173)

---

### 4. Thiết Lập & Khởi Chạy Cổng Quản Trị (Admin Portal)

1.  Di chuyển vào thư mục `historyalive-admin`:
    ```bash
    cd historyalive-admin
    ```
2.  Cài đặt dependencies:
    ```bash
    npm install
    ```
3.  Khởi chạy chế độ Development:
    ```bash
    npm run dev
    ```
    *   **Cổng Admin chạy tại:** [http://localhost:5174](http://localhost:5174)

---

## 🧪 Kiểm Thử Hệ Thống (E2E Integration Test)

Bạn có thể tự động chạy kiểm thử tích hợp toàn diện của hệ thống Backend API bằng cách chạy script E2E:

```bash
python C:\Users\Admin\.gemini\antigravity\brain\a2c752b9-9199-4644-a5c4-5fd7e06f0bf7\scratch\validate_e2e.py
```

Script này tự động:
1.  Đăng ký và đăng nhập 1 học sinh & 1 admin mới.
2.  Kiểm tra quyền truy cập (Chặn học sinh khỏi API Admin, Cho phép Admin).
3.  Tạo bài học mới kèm câu hỏi trắc nghiệm qua API Admin.
4.  Kiểm tra bài học xuất hiện trong danh sách công khai.
5.  Xóa bài học kiểm tra tính năng dọn dẹp.
6.  Promote tài khoản học sinh lên Admin và xác minh thành công.
7.  Dọn dẹp các tài khoản rác vừa tạo khỏi CSDL.
