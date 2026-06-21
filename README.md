# History Alive - Nền Tảng Học Tập Lịch Sử Tương Tác ⚔️📜

Chào mừng bạn đến với **History Alive**, một nền tảng học tập lịch sử Việt Nam trực quan, sinh động và đầy cảm hứng. Dự án được cấu trúc dưới dạng Monorepo chứa ứng dụng dành cho học sinh (Student Web), cổng thông tin quản lý (Admin Portal), và hệ thống dịch vụ dữ liệu thông minh (FastAPI Backend).

---

## 🏛️ Kiến Trúc Hệ Thống (Architecture)

Dự án được phân chia thành 4 phần chính nằm trong cùng một repository:

```text
history_alive/
├── backend/               # FastAPI Backend API (Python, Port 8000)
├── history_ai/backend/    # RAG Service cho nhân vật lịch sử (FastAPI, Port 8001)
├── frontend/              # Ứng dụng học tập cho học sinh (React + Vite, Port 5173)
├── historyalive-admin/    # Cổng thông tin quản trị viên (React + Vite, Port 5178)
└── scratch/               # Kịch bản kiểm thử tích hợp tự động (Integration Tests)
```

1. **Backend API (`backend/`):** FastAPI, MongoDB Atlas, Pydantic v2. Hỗ trợ xác thực JWT, lưu tiến trình học, streak, bảng xếp hạng, Google OAuth2, SMTP email và proxy `/infer` tới RAG service.
2. **RAG Service (`history_ai/backend/`):** FastAPI service riêng cho nhân vật lịch sử. Đọc profile/knowledge, retrieval, guardrail, Gemini fallback và stream câu trả lời dạng SSE.
3. **Student Web App (`frontend/`):** React 19, Vite, Tailwind CSS. Giao diện học tập gamification cho học sinh.
4. **Admin Web App (`historyalive-admin/`):** React 19, Vite, Tailwind CSS, Recharts. Hỗ trợ quản lý học sinh, nhân vật, import knowledge JSONL và infer test trước khi phát hành.

---

## ⚙️ Hướng Dẫn Cấu Hình Môi Trường (`.env`)

Dự án cần cấu hình chính ở `backend/.env`. Backend API đọc file này để kết nối MongoDB,
xác thực JWT và biết địa chỉ RAG service.

Tạo file môi trường từ mẫu:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
```

Các biến quan trọng:

```ini
# MongoDB Atlas hoặc MongoDB server của bạn
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/history_alive

# JWT cho đăng nhập / phân quyền
JWT_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# LLM fallback/generation khi knowledge không đủ
GEMINI_API_KEY=your_gemini_api_key_here

# Backend chạy trong Docker, RAG chạy trên máy host
RAG_SERVICE_URL=http://host.docker.internal:8001

# Nếu backend chạy trực tiếp ngoài Docker, dùng dòng này thay thế:
# RAG_SERVICE_URL=http://127.0.0.1:8001

# Google Login dev/prod
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# SMTP email; để trống user/password thì chạy mock mode trong dev
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_sender@gmail.com
SMTP_PASSWORD=your_gmail_app_password
```

> [!IMPORTANT]
> Không commit API key, JWT secret hoặc MongoDB password thật lên Git.

> [!TIP]
> **Cách tạo mật khẩu ứng dụng Gmail (App Password):**
> 1. Vào Google Account → **Security**.
> 2. Bật **2-Step Verification**.
> 3. Tìm **App Passwords**.
> 4. Tạo mật khẩu 16 ký tự và dán vào `SMTP_PASSWORD`.

---

## 🤖 AI Policy & Web Fallback

### Hiện Trạng MVP

History Alive chatbot sử dụng kiến trúc **RAG-first** (Retrieval-Augmented Generation):

- **Bắt buộc citation:** Mọi khẳng định lịch sử phải dựa trên tư liệu đã được import vào knowledge base của từng nhân vật.
- **Web fallback: TẮT mặc định** - Chatbot không tự động tìm kiếm trên web khi thiếu dữ liệu RAG.
- **Gemini prior knowledge: TẮT mặc định** - Gemini chỉ dùng để nhập vai và diễn đạt; không tự do trả lời bằng kiến thức nền.

> [!NOTE]
> `allow_gemini_prior_knowledge=true` không đồng nghĩa với web search. Nó chỉ cho phép model dùng kiến thức nền khi RAG thiếu, và không tạo citation web.

### Vì Sao Chưa Bật Web Fallback?

Lịch sử cần độ chính xác cao. Cho phép AI tự tìm web không kiểm soát sẽ:
- Dễ lấy nguồn kém chất lượng hoặc sai sự thật
- Khó kiểm chứng độ tin cậy
- Tăng nguy cơ hallucination

### Giai Đoạn Sau: Web Fallback Có Kiểm Soát

Khi cần mở rộng kiến thức ngoài kho RAG, cần:

1. **Trusted domain whitelist:** Danh sách domain uy tín được phép (ví dụ: Britannica, Wikipedia verified, thư viện số, bảo tàng).
2. **Citation capture:** Lưu lại nguồn web và nội dung để admin review.
3. **Admin review queue:** Mọi citation web phải được duyệt trước khi dùng lại.
4. **Per-character control:** Admin bật/tắt web fallback cho từng nhân vật qua `ai_policy.web_fallback_enabled`.

> [!CAUTION]
> Không bật `web_fallback_enabled=true` trong production nếu chưa có whitelist và review queue.

---

## 🚀 Hướng Dẫn Khởi Chạy Từng Phần (Step-by-Step)

Dự án hiện có **4 tiến trình chính**. Mỗi tiến trình nên chạy ở **một terminal riêng**:

| Phần | Thư mục | Port | Vai trò |
|------|---------|------|---------|
| Backend API | `backend/` | `8000` | Auth, user, admin, MongoDB, proxy tới RAG |
| RAG Service | `history_ai/backend/` | `8001` | Đọc knowledge/profile, retrieval, Gemini fallback, SSE answer |
| Student Web | `frontend/` | `5173` | Giao diện học sinh |
| Admin Portal | `historyalive-admin/` | `5178` | Quản trị nhân vật, import knowledge, infer test |

> [!IMPORTANT]
> Tính năng `/infer` trong Admin cần **cả Backend API `8000` và RAG Service `8001`**.
> Nếu thiếu RAG service, UI sẽ báo: `Cannot connect to RAG service`.

> [!WARNING]
> `historyalive-admin/` là **frontend React/Vite**, không phải backend Python.
> Không chạy `uvicorn main:app` trong thư mục này vì sẽ lỗi `Could not import module "main"`.

### Bước 1: Khởi động Backend API (Port 8000)

Backend API nằm trong thư mục `backend/`.

#### Cách 1A: Chạy bằng Docker trên Windows PowerShell

Đi tới thư mục gốc dự án:

```powershell
cd C:\Users\LECOO\Downloads\EXE\BE-Duy
```

Chạy backend container:

```powershell
docker compose -f .\backend\docker-compose.yml up --build
```

Kiểm tra backend:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:8000/docs
```

Dừng backend Docker khi cần:

```powershell
docker compose -f .\backend\docker-compose.yml down
```

#### Cách 1B: Chạy bằng Docker trên macOS/Linux

Đi tới thư mục gốc dự án:

```bash
cd ~/Downloads/EXE/BE-Duy
```

Chạy backend container:

```bash
docker compose -f ./backend/docker-compose.yml up --build
```

Kiểm tra backend:

```bash
curl -I http://localhost:8000/docs
```

Dừng backend Docker khi cần:

```bash
docker compose -f ./backend/docker-compose.yml down
```

#### Cách 1C: Chạy trực tiếp bằng Python venv trên Windows

Chỉ dùng cách này nếu không chạy Docker.

Đi tới thư mục backend:

```powershell
cd C:\Users\LECOO\Downloads\EXE\BE-Duy\backend
```

Tạo virtual environment ở thư mục gốc dự án:

```powershell
python -m venv ..\.venv
```

Cài dependencies:

```powershell
..\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Chạy Backend API:

```powershell
..\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### Cách 1D: Chạy trực tiếp bằng Python venv trên macOS/Linux

Đi tới thư mục backend:

```bash
cd ~/Downloads/EXE/BE-Duy/backend
```

Tạo virtual environment ở thư mục gốc dự án:

```bash
python3 -m venv ../.venv
```

Cài dependencies:

```bash
../.venv/bin/python -m pip install -r requirements.txt
```

Chạy Backend API:

```bash
../.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### Cách 1E: Chạy Backend API bằng uv

Windows PowerShell:

```powershell
cd C:\Users\LECOO\Downloads\EXE\BE-Duy\backend
```

```powershell
uv run uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

macOS/Linux:

```bash
cd ~/Downloads/EXE/BE-Duy/backend
```

```bash
uv run uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Nếu chạy backend trực tiếp, trong `backend/.env` nên dùng:

```ini
RAG_SERVICE_URL=http://127.0.0.1:8001
```

Nếu chạy Backend API bằng Docker nhưng RAG chạy trên máy host, dùng:

```ini
RAG_SERVICE_URL=http://host.docker.internal:8001
```

---

### Bước 2: Khởi động RAG Service (Port 8001)

RAG service nằm trong thư mục `history_ai/backend/`.
Service này phục vụ endpoint `/api/chat/stream` cho Admin infer test.

> [!IMPORTANT]
> Phải chạy lệnh RAG trong thư mục `history_ai/backend/`, không chạy trong `historyalive-admin/`.

#### Cách 2A: Chạy RAG bằng Python venv trên Windows

Đi tới thư mục RAG backend:

```powershell
cd C:\Users\LECOO\Downloads\EXE\BE-Duy\history_ai\backend
```

Cài dependencies:

```powershell
..\..\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Chạy RAG Service:

```powershell
..\..\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8001
```

#### Cách 2B: Chạy RAG bằng Python venv trên macOS/Linux

Đi tới thư mục RAG backend:

```bash
cd ~/Downloads/EXE/BE-Duy/history_ai/backend
```

Cài dependencies:

```bash
../../.venv/bin/python -m pip install -r requirements.txt
```

Chạy RAG Service:

```bash
../../.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8001
```

#### Cách 2C: Chạy RAG bằng uv trên Windows

Đi tới đúng thư mục RAG backend:

```powershell
cd C:\Users\LECOO\Downloads\EXE\BE-Duy\history_ai\backend
```

Chạy RAG Service:

```powershell
uv run uvicorn main:app --host 127.0.0.1 --port 8001
```

#### Cách 2D: Chạy RAG bằng uv trên macOS/Linux

Đi tới đúng thư mục RAG backend:

```bash
cd ~/Downloads/EXE/BE-Duy/history_ai/backend
```

Chạy RAG Service:

```bash
uv run uvicorn main:app --host 127.0.0.1 --port 8001
```

Kiểm tra RAG service:

Windows PowerShell:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8001/docs
```

macOS/Linux:

```bash
curl -I http://127.0.0.1:8001/docs
```

Nếu trả về HTTP `200`, RAG service đã chạy.

---

### Bước 3: Khởi động Web Học Sinh - Student App (Port 5173)

Student Web nằm trong thư mục `frontend/`.

#### Windows PowerShell

Đi tới thư mục frontend:

```powershell
cd C:\Users\LECOO\Downloads\EXE\BE-Duy\frontend
```

Cài dependencies nếu chưa cài:

```powershell
npm install
```

Chạy Student Web:

```powershell
npx vite --port 5173
```

#### macOS/Linux

Đi tới thư mục frontend:

```bash
cd ~/Downloads/EXE/BE-Duy/frontend
```

Cài dependencies nếu chưa cài:

```bash
npm install
```

Chạy Student Web:

```bash
npx vite --port 5173
```

Truy cập:

```text
http://localhost:5173/
```

---

### Bước 4: Khởi động Web Quản Trị - Admin Portal (Port 5178)

Admin Portal nằm trong thư mục `historyalive-admin/`.
Đây là frontend React/Vite, nên dùng `npx vite`, không dùng `uvicorn`.

#### Windows PowerShell

Đi tới thư mục Admin Portal:

```powershell
cd C:\Users\LECOO\Downloads\EXE\BE-Duy\historyalive-admin
```

Cài dependencies nếu chưa cài:

```powershell
npm install
```

Chạy Admin Portal:

```powershell
npx vite --port 5178
```

#### macOS/Linux

Đi tới thư mục Admin Portal:

```bash
cd ~/Downloads/EXE/BE-Duy/historyalive-admin
```

Cài dependencies nếu chưa cài:

```bash
npm install
```

Chạy Admin Portal:

```bash
npx vite --port 5178
```

Truy cập:

```text
http://localhost:5178/
```

---

### Bước 5: Kiểm tra luồng Admin Knowledge → Infer

1. Đảm bảo 3 service đang chạy:
   - Backend API: `http://localhost:8000/docs`
   - RAG Service: `http://127.0.0.1:8001/docs`
   - Admin Portal: `http://localhost:5178/`
2. Vào Admin Portal: `http://localhost:5178/knowledge`.
3. Chọn nhân vật, ví dụ `tran_hung_dao`.
4. Import file knowledge JSONL, ví dụ:
   `history_ai/tran_hung_dao_dataset/tran_hung_dao_knowledge.jsonl`.
5. Vào `http://localhost:5178/infer`.
6. Chọn nhân vật và hỏi thử.

Nếu gặp lỗi:

| Lỗi | Nguyên nhân thường gặp | Cách kiểm tra/sửa |
|-----|-------------------------|-------------------|
| `Cannot connect to RAG service` | Chưa chạy service `8001` | Chạy RAG service ở Bước 2 |
| `Could not import module "main"` | Chạy `uvicorn` sai thư mục | Chuyển sang `history_ai/backend/` rồi chạy lại |
| `uvicorn is not recognized` | Chưa cài uvicorn global | Dùng `python -m uvicorn` hoặc `uv run uvicorn` |
| Import báo thiếu `character_id` | Parser/file JSONL chưa đúng format | Kiểm tra file JSONL và chọn đúng nhân vật khi import |
| Admin không đăng nhập được | Tài khoản chưa có role admin | Sửa `role` thành `admin` trong MongoDB |
| Backend Docker gọi RAG fail | Sai `RAG_SERVICE_URL` | Docker backend cần `http://host.docker.internal:8001` |


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

---

## 🧠 Hybrid RAG + Gemini Pipeline

Pipeline trả lời lịch sử hiện dùng mô hình an toàn theo tầng:

```txt
Local guardrail
→ Template-aware RAG
→ Gemini Evidence Judge nếu bật
→ Gemini synthesis nếu bật
→ Prior knowledge nếu được policy cho phép
→ Final metadata cho Admin Infer
```

### 1. Ý nghĩa các mode

| Mode | Khi nào xuất hiện | Ý nghĩa vận hành |
|---|---|---|
| `rag_grounded` | RAG đủ citation và trả lời local | Có nguồn RAG trực tiếp |
| `synthesized_grounded` | Gemini diễn đạt lại từ citation RAG | Vẫn dựa trên RAG, câu mượt hơn |
| `rag_weak` | Có template/câu hỏi nhưng evidence yếu | Không nên xem là câu trả lời có nguồn chắc |
| `no_evidence` | Không có chunk phù hợp | Cần import thêm knowledge |
| `prior_knowledge` | RAG yếu nhưng policy cho Gemini bổ sung | Không có citation RAG, phải hiển thị warning |
| `out_of_scope` | Ngoài phạm vi hoặc chủ đề bị chặn | Không trả lời nội dung không liên quan |

### 2. Setup Persona Context trong Admin

Vào **Admin → Characters → Edit** và cấu hình:

- **Role name:** tên nhân vật khi nhập vai.
- **Era context:** thời đại/bối cảnh lịch sử.
- **Tone:** phong cách trả lời.
- **Target audience:** nhóm người đọc.
- **Speaking rules:** mỗi dòng một quy tắc nói.
- **Historical scope:** phạm vi được phép trả lời.
- **Sensitive topics:** chủ đề cần cẩn trọng.

Ví dụ cho Trần Hưng Đạo:

```txt
Role name: Hưng Đạo Vương Trần Quốc Tuấn
Era context: Thế kỷ 13, triều Trần, kháng chiến chống Nguyên Mông
Tone: Uy nghi, điềm tĩnh, dễ hiểu, truyền cảm hứng
Speaking rules:
- Xưng là "ta"
- Không nói như AI
- Luôn giải thích dễ hiểu cho học sinh
Historical scope: Chỉ trả lời về đời sống, chiến lược, di sản và bối cảnh lịch sử liên quan.
```

### 3. Setup RAG Templates

RAG template giúp câu hỏi chung chung đi đúng trọng tâm.

Ví dụ template `contribution_overview`:

```txt
Intent: contribution_overview
Display name: Đóng góp nổi bật
Sample questions:
- Đóng góp nổi bật của ông là gì?
- Vì sao nhân vật này quan trọng trong lịch sử?
Preferred RAG queries:
- đóng góp nổi bật công lao vai trò sự nghiệp
- trận đánh tư tưởng di sản lịch sử
Must cover:
- đóng góp
- công lao
- vai trò
- sự nghiệp
Avoid:
- danh mục nhân vật
- xếp ở vị trí
Expected answer outline:
- Nêu đóng góp chính
- Đưa ví dụ lịch sử
- Giải thích ý nghĩa dễ hiểu
```

### 4. Gemini Judge / Synthesis / Prior Knowledge

Trong **AI Behavior Control**:

- **Gemini Evidence Judge:** Gemini chỉ kiểm tra citation có đúng câu hỏi không.
- **Gemini synthesis:** Gemini diễn đạt lại từ RAG đã được kiểm.
- **Cho phép Gemini bổ sung:** chỉ dùng khi RAG thiếu.
- **Prior knowledge policy:** phải khác `disabled` thì mới được chạy.

> [!WARNING]
> `prior_knowledge` không có citation RAG. UI Admin sẽ hiển thị `citation_warning=true` để tránh nhầm với câu trả lời có nguồn.

### 5. Troubleshooting: RAG trả lời lạc đề

| Triệu chứng | Cách xử lý |
|---|---|
| Query chung chung trả citation lạ | Thêm hoặc chỉnh RAG template |
| Template matched nhưng `rag_weak` | Import thêm chunk chứa `must_cover` |
| Judge reject evidence | Xem `judge_reason`, `missing_topics`, `usable_chunk_ids` trong Admin Infer |
| Gemini tự trả lời khi không có RAG | Tắt `allow_gemini_prior_knowledge` hoặc đặt `prior_knowledge_policy=disabled` |
| Muốn test nhanh đúng intent | Dùng quick prompts sinh từ `sample_questions` trong Admin Infer |
