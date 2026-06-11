# History Alive - Cổng Học Tập Lịch Sử Tương Tác ⚔️📜

Chào mừng bạn đến với **History Alive**, một nền tảng học tập lịch sử Việt Nam hiện đại, trực quan và đầy cảm hứng. Hệ thống bao gồm ứng dụng học tập dành cho học sinh (Student Web), cổng thông tin phân tích dành cho giáo viên/quản trị viên (Admin Portal) và hệ thống máy chủ dịch vụ thông minh (FastAPI Backend).

---

## 🏛️ Kiến trúc Dự án (Architecture)

Dự án được cấu trúc dưới dạng monorepo chứa 3 thành phần chính:

```
history_alive/
├── backend/               # FastAPI Backend (Python)
├── frontend/              # Ứng dụng dành cho học sinh (React + Vite)
└── historyalive-admin/    # Cổng thông tin Quản trị viên (React + Vite)
```

### 1. Backend Service (`backend/`)
* **Công nghệ:** FastAPI (Python), MongoDB Atlas (database), Pydantic v2 (validation).
* **Tính năng:**
  * Xác thực người dùng (JWT Authentication) hỗ trợ đăng nhập linh hoạt bằng cả Email hoặc Username.
  * Quản lý tiến trình học tập, XP, Streak, bảng xếp hạng và Onboarding.
  * API CRUD bài học (lessons) và câu hỏi trắc nghiệm (quizzes) phục vụ học tập.
  * Tích hợp hội thoại và tương tác với các nhân vật lịch sử AI (persona-chat).

### 2. Student Web App (`frontend/`)
* **Công nghệ:** React 19, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
* **Giao diện:** Thiết kế theo phong cách DuoLingo trực quan, sinh động với các Mascot đáng yêu, hiệu ứng âm thanh và chuyển cảnh mượt mà.
* **Tính năng:** Học bài lịch sử theo checkpoint, tham gia đố vui trắc nghiệm, tích lũy XP tăng cấp, trò chuyện với trợ lý AI lịch sử, và quản lý hồ sơ cá nhân (cập nhật thông tin & đổi mật khẩu bảo mật).

### 3. Admin Web App (`historyalive-admin/`)
* **Công nghệ:** React 19, Vite, Tailwind CSS, Recharts (vẽ biểu đồ báo cáo).
* **Giao diện:** Tông màu tối (Dark Mode) sang trọng, huyền bí với các điểm nhấn kim loại vàng lịch sử.
* **Tính năng:** Xem báo cáo thống kê hoạt động hệ thống, quản lý danh sách học viên (phân quyền Admin/Student, xóa tài khoản học sinh), và quản lý kho dữ liệu bài học (CRUD bài học & ngân hàng câu hỏi).

---

## 🛠️ Yêu cầu Hệ thống (Prerequisites)

* **Node.js:** Phiên bản 18.x trở lên.
* **Python:** Phiên bản 3.10.x trở lên.
* **Database:** Cơ sở dữ liệu MongoDB (cục bộ hoặc MongoDB Atlas đám mây).

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

Hãy làm theo các bước dưới đây để chạy thử nghiệm toàn bộ hệ thống cục bộ:

### Bước 1: Khởi động FastAPI Backend
1. Di chuyển vào thư mục backend:
   ```powershell
   cd D:\AntiGravity\history_alive\backend
   ```
2. Tạo môi trường ảo Python và kích hoạt:
   ```powershell
   python -m venv venv
   # Trên Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # Trên macOS/Linux:
   source venv/bin/activate
   ```
3. Cài đặt các thư viện cần thiết:
   ```powershell
   pip install -r requirements.txt
   ```
4. Cấu hình tệp môi trường `.env` trong thư mục `backend/` (nếu chưa có):
   ```ini
   MONGODB_URL=mongodb+str://... # Hoặc mongodb://localhost:27017/history_alive
   JWT_SECRET=your_jwt_access_secret_key
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
   ```
5. Chạy server ở chế độ tự động reload (cổng mặc định 8000):
   ```powershell
   uvicorn main:app --reload --port 8000
   ```

### Bước 2: Khởi động Ứng dụng Học sinh (Student Web)
1. Mở một terminal mới và di chuyển vào thư mục frontend:
   ```powershell
   cd D:\AntiGravity\history_alive\frontend
   ```
2. Cài đặt các package Node.js:
   ```powershell
   npm install
   ```
3. Chạy ứng dụng học sinh ở chế độ phát triển (sẽ chạy tại cổng **5173** hoặc **5174** nếu bị trùng):
   ```powershell
   npx vite --port 5173
   ```
4. Truy cập giao diện tại: `http://localhost:5173/`

### Bước 3: Khởi động Cổng Quản trị (Admin Portal)
1. Mở một terminal mới và di chuyển vào thư mục admin:
   ```powershell
   cd D:\AntiGravity\history_alive\historyalive-admin
   ```
2. Cài đặt các package Node.js:
   ```powershell
   npm install
   ```
3. Chạy ứng dụng admin ở chế độ phát triển (sẽ chạy tại cổng **5175**):
   ```powershell
   npx vite --port 5175
   ```
4. Truy cập giao diện tại: `http://localhost:5175/`

---

## 🧪 Quy Trình Kiểm Thử & Xác Minh (Testing)

### 1. Kiểm thử Tự động phía Backend (E2E Integration Test)
Chúng tôi cung cấp một kịch bản kiểm thử tích hợp tự động để kiểm tra các luồng xác thực, thay đổi hồ sơ cá nhân và đổi mật khẩu của Backend.
* Chạy kịch bản test bằng Python (đảm bảo Backend đang chạy ở cổng 8000):
  ```powershell
  python D:\AntiGravity\history_alive\backend\scratch\test_profile_and_password.py
  ```
* Kịch bản sẽ tự động chạy 9 trường hợp kiểm thử bao gồm: đăng ký, cập nhật hồ sơ với dữ liệu mới, ngăn chặn trùng email, đổi mật khẩu không hợp lệ (sai mật khẩu cũ, mật khẩu mới trùng mật khẩu cũ, mật khẩu mới không đủ chữ hoa/số), và đăng nhập lại thành công với mật khẩu mới.

### 2. Kiểm thử Thủ công trên Giao diện Web
1. **Đăng ký tài khoản học sinh mới:** Truy cập `http://localhost:5173/register` để tạo tài khoản.
2. **Onboarding:** Chọn các tuỳ chọn lớp học, đặt tên hiển thị và thời lượng học tập. Các tùy chọn này sẽ tự động lưu và đồng bộ lên MongoDB.
3. **Cập nhật hồ sơ & hiển thị email:**
   * Vào mục **Hồ sơ (Profile)**. Đảm bảo ô Email hiển thị chính xác email bạn vừa đăng ký thay vì email sample.
   * Nhấn **Chỉnh sửa hồ sơ**, thay đổi Họ tên, Ngày sinh hoặc Số điện thoại. Nhấn lưu và tải lại trang để kiểm tra dữ liệu đã đồng bộ thực tế từ server.
4. **Thay đổi mật khẩu:**
   * Nhấn nút **Cài đặt** (icon bánh răng) ở góc phải màn hình hồ sơ.
   * Chọn mục **Đổi mật khẩu** để mở form nhập mật khẩu cũ và xác nhận mật khẩu mới 2 lần.
   * Thử nghiệm nhập sai mật khẩu cũ hoặc nhập 2 mật khẩu mới không khớp để kiểm tra thông báo cảnh báo.
5. **Kiểm tra quyền truy cập Admin:**
   * Sau khi đăng ký tài khoản học sinh, hãy truy cập Cổng Admin (`http://localhost:5175/`).
   * Thử đăng nhập bằng tài khoản học sinh vừa tạo. Bạn sẽ nhận được thông báo lỗi từ chối truy cập: *"Tài khoản không có quyền truy cập trang quản trị!"*.
   * Để cấp quyền Admin, bạn hãy cập nhật quyền trực tiếp trong database MongoDB Atlas (sửa trường `role` của user từ `"student"` thành `"admin"`), sau đó đăng nhập lại tại trang Admin để quản lý dữ liệu.
