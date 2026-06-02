# History Alive - FastAPI Backend

Dự án backend của ứng dụng học lịch sử **History Alive**, được xây dựng bằng FastAPI, MongoDB và OpenAI, tích hợp AI nhập vai nhân vật lịch sử và hệ thống tự động tạo flashcard ôn tập.

---

## 📁 Cấu trúc thư mục dự án

```text
history-alive/backend/
├── core/
│   ├── __init__.py
│   ├── config.py          # Quản lý cấu hình & biến môi trường (Pydantic Settings)
│   ├── database.py        # Kết nối MongoDB Atlas (Motor Async)
│   └── security.py        # Hashing mật khẩu (bcrypt) & JWT Auth (Access/Refresh Token)
├── models/
│   ├── __init__.py
│   ├── user.py            # Pydantic Schemas cho User & Onboarding
│   ├── session.py         # Schemas cho JWT Token & Session
│   ├── chat.py            # Schemas cho Chat Session
│   └── flashcard.py       # Schemas cho Flashcards
├── routers/
│   ├── __init__.py
│   ├── auth.py            # API Đăng ký, Đăng nhập, Refresh Token, Đăng xuất
│   ├── users.py           # API Thông tin người dùng, Cập nhật Profile, Onboarding & Thống kê
│   ├── characters.py      # API Danh sách & Chi tiết Nhân vật lịch sử
│   ├── chat.py            # API Tạo phiên chat, Gửi tin nhắn (SSE Streaming), Lịch sử chat
│   └── flashcards.py      # API Quản lý Flashcard ôn tập (Lấy danh sách, Chi tiết, Xóa)
├── services/
│   ├── __init__.py
│   ├── auth_service.py    # Logic nghiệp vụ đăng ký/đăng nhập/session
│   ├── chat_service.py    # Logic tương tác LLM (GPT-4o) & Ghép hội thoại theo vai nhân vật
│   └── flashcard_service.py # Logic tổng hợp hội thoại & sinh Flashcard tự động (GPT-3.5-turbo)
├── rag/
│   ├── __init__.py
│   └── pipeline.py        # Mock RAG Pipeline (Chuẩn bị tích hợp VectorDB tìm kiếm SGK)
├── main.py                # Điểm khởi chạy FastAPI, CORS & Scheduler reset lượt chat mỗi ngày
├── requirements.txt       # Danh sách dependencies
├── .env                   # Biến môi trường local (chứa API Keys, DB URIs)
└── .env.example           # File mẫu biến môi trường
```

---

## 🚀 Các tính năng đã hoàn thành (Sprint 1 & Sprint 2)

### 1. Khởi tạo & Cấu hình Hệ thống
*   **Directory Structure**: Thiết kế cấu trúc dự án chuẩn FastAPI phân chia rõ ràng giữa Router, Model, Service và Core.
*   **Config & DB**: Sử dụng `pydantic-settings` để kiểm soát chặt chẽ biến môi trường `.env`. Tích hợp thư viện `motor` kết nối phi tuần tự (async) với MongoDB.
*   **Daily Reset Job**: Sử dụng `apscheduler` để tự động reset số lượt chat hàng ngày của user (giới hạn 3 lượt/ngày đối với tài khoản Free) vào lúc `00:00` hàng ngày theo múi giờ Việt Nam (`Asia/Ho_Chi_Minh`).

### 2. Authentication & User API (Sprint 1)
*   **Register & Login**: Mã hóa mật khẩu bằng `bcrypt`. Cấp cặp token Access Token (hết hạn sau 15 phút) và Refresh Token (hết hạn sau 7 ngày).
*   **JWT Session**: Lưu vết Refresh Token trong MongoDB để quản lý đăng xuất (logout) và cấp lại Access Token mới (`/auth/refresh`).
*   **Onboarding**: Hỗ trợ lưu trữ cấp học (Cấp 2 / Cấp 3) và nhân vật lịch sử được chọn ban đầu để tùy biến trải nghiệm.
*   **User Stats**: Trả về thống kê số phiên đã tương tác và số lượt chat còn lại trong ngày.

### 3. Nhân vật lịch sử (Sprint 1)
*   Tích hợp sẵn danh sách **8 nhân vật lịch sử tiêu biểu** xuyên suốt chiều dài lịch sử Việt Nam:
    1.  *Hùng Vương* (Thời dựng nước)
    2.  *Hai Bà Trưng* (Kháng chiến chống Hán)
    3.  *Ngô Quyền* (Chiến thắng sông Bạch Đằng 938)
    4.  *Lý Thường Kiệt* (Tác giả bài Nam quốc sơn hà)
    5.  *Trần Hưng Đạo* (3 lần kháng chiến chống Mông - Nguyên)
    6.  *Lê Lợi* (Khởi nghĩa Lam Sơn giải phóng đất nước)
    7.  *Nguyễn Huệ — Quang Trung* (Đại phá quân Thanh 1789)
    8.  *Hồ Chí Minh* (Khai sinh nước Việt Nam Dân chủ Cộng hòa)

### 4. Hệ thống Chat nhập vai AI (Sprint 2)
*   **Roleplay Prompt**: Thiết kế System Prompt tối ưu để AI nhập vai nhân vật lịch sử (xưng "Ta", gọi học sinh là "con/người trẻ", dùng ngôn ngữ phù hợp lứa tuổi, bám sát kiến thức SGK lịch sử Việt Nam).
*   **SSE Streaming**: Tích hợp luồng phản hồi real-time từ OpenAI GPT-4o qua Server-Sent Events (`text/event-stream`).
*   **RAG Connection ready**: Khởi tạo module `rag/pipeline.py` sẵn sàng liên kết với VectorDB tài liệu SGK.
*   **Chat Limit**: Giới hạn 3 lượt chat miễn phí/ngày cho tài khoản Free.

### 5. Flashcard tự động (Sprint 2)
*   **Auto-Generation**: Khi kết thúc phiên chat (`POST /chat/end`), hệ thống tự động tổng hợp hội thoại vừa diễn ra và gọi GPT-3.5-turbo tóm tắt kiến thức quan trọng thành một bộ flashcard lưu vào cơ sở dữ liệu để phục vụ việc ôn tập sau này.
*   **Flashcard APIs**: Cho phép lấy danh sách flashcards cá nhân, xem chi tiết và xóa flashcard.

---

## 🛠️ Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Yêu cầu hệ thống
*   Python 3.10+
*   MongoDB (Local hoặc Atlas Cloud)
*   OpenAI API Key

### 2. Cài đặt thư viện
```bash
cd history-alive/backend
pip install -r requirements.txt
```

### 3. Cấu hình biến môi trường
Sao chép tệp mẫu và điền thông tin chi tiết của bạn vào `.env`:
```bash
cp .env.example .env
```
Nội dung file `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/historyalive # hoặc URI MongoDB Atlas của bạn
JWT_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Khởi chạy Server
Chạy lệnh sau tại thư mục `history-alive/backend`:
```bash
uvicorn main:app --reload --port 8000
```

*   **API Local URL**: `http://localhost:8000`
*   **Tài liệu hướng dẫn tương tác API (Swagger UI)**: `http://localhost:8000/docs`
