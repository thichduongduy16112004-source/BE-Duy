# History Alive - Nền Tảng Học Tập Lịch Sử Tương Tác ⚔️📜

Chào mừng bạn đến với **History Alive**, một nền tảng học tập lịch sử Việt Nam trực quan, sinh động và đầy cảm hứng. Dự án được cấu trúc dưới dạng Monorepo chứa ứng dụng dành cho học sinh (Student Web), cổng thông tin quản lý (Admin Portal), và hệ thống dịch vụ dữ liệu thông minh (FastAPI Backend).

---

## 🏛️ Kiến Trúc Hệ Thống (Architecture)

Dự án được phân chia thành 3 phần chính nằm trong cùng một repository:

```text
history_alive/
├── backend/               # FastAPI Backend Service (Python)
├── frontend/              # Ứng dụng học tập cho học sinh (React + Vite, Port 5173)
├── historyalive-admin/    # Cổng thông tin cho quản trị viên (React + Vite, Port 5175)
└── scratch/               # Kịch bản kiểm thử tích hợp tự động (Integration Tests)
```

1. **Backend Service (`backend/`):** FastAPI, MongoDB Atlas, Pydantic v2. Hỗ trợ xác thực JWT (đăng nhập bằng Email/Username), lưu trữ tiến trình, Streak, bảng xếp hạng, Google OAuth2, và dịch vụ gửi email SMTP (BackgroundTasks).
2. **Student Web App (`frontend/`):** React 19, Vite, Tailwind CSS. Giao diện thiết kế theo phong cách học tập DuoLingo (Gamification), tích hợp Mascot đáng yêu, hiệu ứng âm thanh sống động và cổng kết nối Google Identity Services.
3. **Admin Web App (`historyalive-admin/`):** React 19, Vite, Tailwind CSS, Recharts. Giao diện Dark Mode huyền bí sang trọng, hỗ trợ quản lý học sinh (phân quyền, xóa tài khoản), xem biểu đồ báo cáo và CRUD bài học/ngân hàng câu hỏi.

---

## ⚙️ Hướng Dẫn Cấu Hình Môi Trường (`.env`)

Để chạy đầy đủ các tính năng (Google Login, Gửi Email), bạn cần cấu hình tệp môi trường `.env` trong thư mục `backend/`. 

Hãy sao chép tệp mẫu `backend/.env.example` thành `backend/.env` và điền các thông tin sau:

```ini
# Kết nối Cơ sở dữ liệu MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/history_alive

# Cấu hình Token bảo mật JWT
JWT_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# Khóa API OpenAI (Phục vụ chatbot tương tác nhân vật AI)
OPENAI_API_KEY=your_openai_api_key_here

# 1. Cấu hình Google Client ID (Cho đăng nhập Google thật)
# Để trống hoặc điền "mock-google-id" để sử dụng chế độ Mock Login trong môi trường dev
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# 2. Cấu hình Email SMTP (Cho gửi email xác nhận thật)
# Để trống SMTP_USER và SMTP_PASSWORD để tự động chạy MOCK MODE (ghi nhận email ra màn hình console)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_sender@gmail.com
SMTP_PASSWORD=your_gmail_app_password
```

> [!TIP]
> **Cách tạo mật khẩu ứng dụng Gmail (App Password):**
> 1. Truy cập trang Tài khoản Google của bạn -> mục **Bảo mật** (Security).
> 2. Bật **Xác minh 2 bước** (2-Step Verification) nếu chưa bật.
> 3. Tìm kiếm cụm từ **Mật khẩu ứng dụng** (App Passwords) ở thanh tìm kiếm phía trên.
> 4. Chọn ứng dụng "Thư" và thiết bị của bạn để tạo chuỗi mã 16 ký tự. Sao chép chuỗi mã này dán vào biến `SMTP_PASSWORD` trong `.env`.

---

## 🚀 Hướng Dẫn Khởi Chạy Từng Phần (Step-by-Step)

Thành viên trong nhóm thực hiện mở 3 cửa sổ Terminal độc lập để chạy các dịch vụ:

### Bước 1: Khởi Động FastAPI Backend (Port 8000)
1. Mở terminal và di chuyển vào thư mục backend:
   ```powershell
   cd D:\AntiGravity\history_alive\backend
   ```
2. Tạo và kích hoạt môi trường ảo Python (Virtual Environment):
   * **Trên Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **Trên macOS/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Cài đặt các thư viện cần thiết:
   ```powershell
   pip install -r requirements.txt
   ```
4. Khởi chạy Server ở chế độ tự động tải lại (Hot-Reload) tại cổng 8000:
   ```powershell
   uvicorn main:app --reload --port 8000
   ```
   *Khi khởi chạy thành công, tài liệu API Swagger sẽ xuất hiện tại:* `http://127.0.0.1:8000/docs`

### Bước 2: Khởi Động Web Học Sinh - Student App (Port 5173)
1. Mở một terminal mới và di chuyển vào thư mục frontend:
   ```powershell
   cd D:\AntiGravity\history_alive\frontend
   ```
2. Cài đặt các gói thư viện Node.js:
   ```powershell
   npm install
   ```
3. Chạy ứng dụng học sinh ở chế độ phát triển:
   ```powershell
   npx vite --port 5173
   ```
4. Truy cập giao diện học sinh tại địa chỉ: `http://localhost:5173/`

### Bước 3: Khởi Động Web Quản Trị - Admin Portal (Port 5175)
1. Mở một terminal mới và di chuyển vào thư mục admin:
   ```powershell
   cd D:\AntiGravity\history_alive\historyalive-admin
   ```
2. Cài đặt các gói thư viện Node.js:
   ```powershell
   npm install
   ```
3. Chạy cổng thông tin quản trị ở chế độ phát triển tại cổng 5175:
   ```powershell
   npx vite --port 5175
   ```
4. Truy cập giao diện quản trị viên tại địa chỉ: `http://localhost:5175/`

---

## 🧪 Quy Trình Kiểm Thử & Nghiệm Thu (Testing & Verification)

Để đảm bảo các chức năng bảo mật, đăng ký và gửi email hoạt động ổn định, dự án cung cấp đầy đủ các kịch bản kiểm thử tự động và thủ công.

### 1. Kiểm Thử Tự Động Phía Backend (Integration Tests)

Đảm bảo server Backend của bạn đang chạy ở cổng 8000 (`http://localhost:8000`). Chạy các kịch bản kiểm thử bằng Python tại thư mục gốc của dự án:

* **Kịch bản 1: Kiểm thử luồng Đăng nhập Google & Gửi Email SMTP**
  ```powershell
  python D:\AntiGravity\history_alive\scratch\test_google_auth_and_email.py
  ```
  *Kịch bản này tự động thực thi 7 ca kiểm thử:*
  1. Đăng ký tài khoản thường (xác minh tự động gửi Email Chào mừng).
  2. Đăng nhập Google SSO lần đầu (xác minh tự động tạo tài khoản Google và gửi Email Chào mừng).
  3. Đăng nhập Google lần sau (xác minh không gửi trùng email chào mừng).
  4. Đặt mật khẩu lần đầu cho tài khoản Google (xác minh bỏ qua yêu cầu nhập `old_password` cũ).
  5. Đổi mật khẩu lần sau khi đã có mật khẩu (xác minh yêu cầu mật khẩu cũ đúng).
  6. Bảo mật mật khẩu mới và gửi Email Cảnh báo đổi mật khẩu.
  7. Kiểm tra đăng nhập lại bằng mật khẩu mới vừa thiết lập.

* **Kịch bản 2: Kiểm thử Hồ sơ & Các quy tắc Mật khẩu thường**
  ```powershell
  python D:\AntiGravity\history_alive\scratch\test_profile_and_password.py
  ```
  *Kịch bản này kiểm tra:* Đăng ký, cập nhật thông tin cá nhân (Họ tên, Ngày sinh, Số điện thoại), chặn trùng lặp email trên server, kiểm tra độ mạnh của mật khẩu (độ dài >= 8, chứa ít nhất 1 chữ viết hoa và 1 chữ số), chặn mật khẩu mới trùng mật khẩu cũ.

---

### 2. Kiểm Thử Thủ Công Trên Giao Diện Web (Manual Verification)

#### A. Kiểm thử Đăng nhập & Đăng ký nhanh bằng Google
1. Truy cập trang đăng ký hoặc đăng nhập học sinh (`http://localhost:5173/login`).
2. Nhấn nút **"Tiếp tục với Google"** chính thức.
3. **Bypass Kiểm thử nhanh:** Trên môi trường dev, nếu bạn không cấu hình Google Client ID thật, bạn có thể nhập tài khoản kiểm thử bất kỳ. Nếu sử dụng test tự động, nút Google sẽ gửi credential giả lập lên server, backend tự tạo tài khoản với đuôi email `@gmail.com` và hoàn tất Onboarding bình thường.

#### B. Kiểm thử Hồ sơ Cá nhân & Email đồng bộ
1. Đăng nhập và đi tới trang **Hồ sơ** (Profile).
2. Kiểm tra phần hiển thị **Email**: Đảm bảo email đồng bộ đúng với tài khoản bạn đã đăng nhập chứ không hiển thị email mẫu (`...@kidmail.com`) như trước.
3. Nhấn **Chỉnh sửa hồ sơ**, thay đổi các thông tin: Họ tên, Ngày sinh, Số điện thoại và nhấn Lưu. Tải lại trang để xác minh dữ liệu đã đồng bộ thực tế từ MongoDB Atlas lên giao diện.

#### C. Kiểm thử Đổi mật khẩu bảo mật (Modal DuoLingo)
1. Ở trang Hồ sơ, nhấn vào biểu tượng bánh răng **Cài đặt** ở góc phải -> Chọn **Đổi mật khẩu**.
2. **Đối với tài khoản Google chưa có mật khẩu:** Màn hình hiển thị form tạo mật khẩu mới. Nhập 2 lần mật khẩu mới giống nhau để lưu. (Hãy kiểm tra email hoặc console backend xem email cảnh báo đổi mật khẩu có được gửi/in ra không).
3. **Đối với tài khoản thường hoặc tài khoản Google đã có mật khẩu:** Form sẽ yêu cầu nhập đủ: Mật khẩu cũ, Mật khẩu mới và Xác nhận mật khẩu mới.
4. Nhập sai mật khẩu cũ hoặc nhập 2 mật khẩu mới không khớp để kiểm tra thông báo cảnh báo client-side và lỗi chặn từ server.

#### D. Kiểm thử Bảo mật & Phân quyền trang Admin
1. Đăng nhập bằng tài khoản học sinh thông thường tại Cổng Admin (`http://localhost:5175/`). Giao diện sẽ hiển thị thông báo lỗi từ chối truy cập: *"Tài khoản không có quyền truy cập trang quản trị!"*.
2. Để kiểm thử giao diện quản trị viên: Truy cập database MongoDB Atlas cục bộ hoặc đám mây của bạn, tìm tài khoản học sinh đó và sửa trường `role` từ `"student"` thành `"admin"`.
3. Quay lại trang Admin và đăng nhập lại. Lúc này bạn sẽ truy cập thành công giao diện Dark Mode cao cấp để quản lý học sinh và ngân hàng bài học lịch sử.
