# README — Hướng Dẫn Import Bài Học Vào Lesson Studio

Tài liệu này hướng dẫn cách tạo, import, kiểm tra và publish một bài học hoàn chỉnh trong Admin Lesson Studio.

- Admin Lesson Studio: `http://localhost:5178/lessons`
- Student Web: `http://localhost:5173`
- File quiz gốc: [`frontend/public/quiz/data.js`](./frontend/public/quiz/data.js)
- Thư mục ảnh bài học: [`frontend/public/assets`](./frontend/public/assets)

---

## 1. Mô hình dữ liệu bài học

Một bài học trong hệ thống hiện tại đi theo luồng:

```text
data.js / JSON
→ Import vào Lesson Studio
→ Tạo hoặc chỉnh lessonNodes
→ Save chapter vào draft
→ Publish draft
→ Student Web đọc dữ liệu published
```

### Khái niệm chính

| Khái niệm | Ý nghĩa |
|---|---|
| `topic` | Một chương / unit học |
| `questions` | Danh sách câu hỏi của chương |
| `lessonNodes` | Cách chia câu hỏi trong chương thành từng node |
| `draft` | Bản nháp admin đang chỉnh |
| `published` | Bản chính thức học sinh nhìn thấy |

> [!IMPORTANT]
> `frontend/public/quiz/data.js` là nguồn dữ liệu bài học gốc. Admin Lesson Studio dùng file này để import, chuẩn hóa và publish.

---

## 2. Chuẩn bị data bài học

Một chương chuẩn nên có **25 câu hỏi**. Mặc định hệ thống sẽ chia thành **5 node × 5 câu**.

Mỗi câu hỏi nên có các trường:

```js
{
  id: "u1-q1",
  type: "multiple_choice",
  question: "Câu hỏi?",
  options: ["A", "B", "C", "D"],
  answer: "A",
  explanation: "Giải thích đáp án."
}
```

### Data mẫu tối thiểu

Bạn có thể paste mẫu này vào Lesson Studio để test nhanh:

```js
const QUIZ_DATA = {
  title: "History Alive - Bài học mẫu",
  subtitle: "Demo import lesson",
  topics: [
    {
      id: 1,
      unitId: "u1",
      name: "Chương 1",
      title: "Bài học mẫu: Cách mạng tư sản",
      icon: "⚙️",
      color: "#f97316",
      questions: [
        {
          id: "u1-q1",
          type: "multiple_choice",
          question: "Cách mạng tư sản là gì?",
          options: [
            "Cuộc cách mạng do giai cấp tư sản lãnh đạo nhằm xóa bỏ cản trở phong kiến",
            "Cuộc chiến giữa hai vương triều",
            "Phong trào cải cách nông nghiệp",
            "Cuộc nổi dậy không có mục tiêu chính trị"
          ],
          answer: "Cuộc cách mạng do giai cấp tư sản lãnh đạo nhằm xóa bỏ cản trở phong kiến",
          explanation: "Cách mạng tư sản mở đường cho quan hệ tư bản chủ nghĩa phát triển."
        },
        {
          id: "u1-q2",
          type: "multiple_choice",
          question: "Một nguyên nhân sâu xa của cách mạng tư sản là gì?",
          options: [
            "Mâu thuẫn giữa lực lượng sản xuất tư bản chủ nghĩa và quan hệ phong kiến",
            "Sự biến mất của thương mại",
            "Dân số đô thị giảm mạnh",
            "Chế độ nô lệ cổ đại phục hồi"
          ],
          answer: "Mâu thuẫn giữa lực lượng sản xuất tư bản chủ nghĩa và quan hệ phong kiến",
          explanation: "Kinh tế mới phát triển nhưng bị chế độ cũ kìm hãm."
        },
        {
          id: "u1-q3",
          type: "multiple_choice",
          question: "Giai cấp nào thường lãnh đạo cách mạng tư sản?",
          options: ["Tư sản", "Chủ nô", "Nông nô", "Tăng lữ"],
          answer: "Tư sản",
          explanation: "Tư sản có lợi ích trực tiếp trong việc xóa bỏ rào cản phong kiến."
        },
        {
          id: "u1-q4",
          type: "multiple_choice",
          question: "Cách mạng tư sản Pháp bùng nổ năm nào?",
          options: ["1789", "1776", "1640", "1917"],
          answer: "1789",
          explanation: "Năm 1789 là mốc mở đầu nổi bật của Cách mạng Pháp."
        },
        {
          id: "u1-q5",
          type: "multiple_choice",
          question: "Kết quả quan trọng của cách mạng tư sản là gì?",
          options: [
            "Mở đường cho chủ nghĩa tư bản phát triển",
            "Khôi phục hoàn toàn phong kiến",
            "Xóa bỏ mọi nhà nước",
            "Chấm dứt thương mại"
          ],
          answer: "Mở đường cho chủ nghĩa tư bản phát triển",
          explanation: "Nhiều rào cản phong kiến bị xóa bỏ, tạo điều kiện cho kinh tế tư bản."
        }
      ]
    }
  ]
};
```

> [!NOTE]
> Mẫu trên chỉ có 5 câu để test nhanh. Khi tạo bài học thật, nên chuẩn bị 25 câu cho một chương.

---

## 3. Import bài học trong Admin

### Bước 1: Mở Lesson Studio

1. Mở Admin: `http://localhost:5178/login`
2. Đăng nhập tài khoản admin.
3. Vào trang: `http://localhost:5178/lessons`

### Bước 2: Paste hoặc upload data

Trong khu vực **Import Center**:

1. Chọn **Paste JSON nâng cao** nếu muốn dán data thủ công.
2. Dán `const QUIZ_DATA = {...};` hoặc JSON thuần `{...}`.
3. Bấm **Preview local**.

Kết quả mong muốn:

```text
Preview thành công
Có danh sách chương
Có danh sách node
Có danh sách câu hỏi
```

### Bước 3: Kiểm tra backend

Bấm **Check backend** để xác thực dữ liệu với backend.

Các lỗi thường gặp:

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| Không có `topics` | Data thiếu trường `topics` | Thêm `topics: []` |
| `questions` không phải array | Sai format câu hỏi | Đảm bảo `questions: []` |
| Parse JSON fail | Thiếu dấu phẩy / ngoặc | Kiểm tra lại cú pháp |
| Không thấy chương | `topics` rỗng | Thêm ít nhất 1 topic |

### Bước 4: Import full draft

Bấm **Import full draft**.

Ý nghĩa:

```text
Data được lưu vào draft.
Học sinh chưa nhìn thấy thay đổi.
```

---

## 4. Chỉnh node bài học

Sau khi import draft:

1. Vào **Content Explorer**.
2. Chọn chương, ví dụ `u1`.
3. Chọn node, ví dụ `u1-l1`.
4. Ở **Node Detail**, chỉnh số câu trong node.

Quy tắc hiện tại:

```text
Mỗi node có thể có 5-10 câu.
Publish theo chương.
Không dùng Review Pool cho câu 21-25.
```

Ví dụ:

```text
u1-l1: 6 câu
u1-l2: 5 câu
u1-l3: 5 câu
u1-l4: 5 câu
u1-l5: 4 câu nếu tổng chỉ còn 25 câu
```

> [!WARNING]
> Node cuối có thể ít hơn 5 câu nếu tổng số câu trong chương không chia đều. Khi tạo bài thật, nên chuẩn bị số câu phù hợp để node đẹp hơn.

---

## 5. Lưu chương và publish

### Lưu chương vào draft

Sau khi chỉnh node:

1. Chọn chương cần lưu.
2. Bấm **Lưu chương**.

Ý nghĩa:

```text
Chỉ chương đang chọn được cập nhật trong draft.
Các chương khác không bị ảnh hưởng.
```

### Publish cho học sinh

Khi đã kiểm tra xong:

1. Bấm **Publish draft**.
2. Student Web sẽ đọc dữ liệu published mới.

---

## 6. Test bài học ở Student Web

Mở Student Web:

```text
http://localhost:5173
```

Hoặc test quiz trực tiếp bằng URL:

```text
http://localhost:5173/quiz/index.html?unit=u1&lesson=1
```

Kỳ vọng:

| URL | Kết quả |
|---|---|
| `unit=u1&lesson=1` | Lấy câu từ node `u1-l1` |
| `unit=u1&lesson=2` | Lấy câu từ node `u1-l2` |
| `unit=u1&lesson=3` | Lấy câu từ node `u1-l3` |

Nếu node `u1-l1` được chỉnh thành 6 câu, quiz runtime phải hiển thị 6 câu cho lesson 1.

---

## 7. Checklist tạo bài học thật

```text
[ ] Chuẩn bị 1 chương có khoảng 25 câu
[ ] Mỗi câu có id, type, question, options, answer, explanation
[ ] Dán hoặc upload data vào /lessons
[ ] Preview local thành công
[ ] Check backend thành công
[ ] Import full draft
[ ] Kiểm tra từng chương
[ ] Kiểm tra từng node
[ ] Chỉnh node 5-10 câu nếu cần
[ ] Lưu chương
[ ] Publish draft
[ ] Test trên Student Web
```

---

## 8. Quy ước đặt ID

Nên dùng format nhất quán:

```text
unitId: u1, u2, u3...
question id: u1-q1, u1-q2, u1-q3...
lesson node id: u1-l1, u1-l2, u1-l3...
```

Ví dụ:

```js
{
  id: 1,
  unitId: "u1",
  questions: [
    { id: "u1-q1", question: "..." },
    { id: "u1-q2", question: "..." }
  ]
}
```

---

## 9. Import từ file `data.js` hiện có

Nếu muốn dùng dữ liệu đang có sẵn:

1. Mở [`frontend/public/quiz/data.js`](./frontend/public/quiz/data.js).
2. Copy toàn bộ nội dung file.
3. Vào `http://localhost:5178/lessons`.
4. Paste vào **Paste JSON nâng cao**.
5. Bấm **Preview local**.
6. Bấm **Import full draft**.
7. Kiểm tra node.
8. Bấm **Publish draft**.

---

## 10. Troubleshooting nhanh

| Triệu chứng | Cách xử lý |
|---|---|
| Admin bị redirect về login | Đăng nhập lại bằng tài khoản admin |
| Không thấy trang `/lessons` | Kiểm tra Admin Portal đang chạy port `5178` |
| Backend check fail | Kiểm tra Backend API đang chạy |
| Publish không đổi bài học | Kiểm tra đã import draft và publish đúng chưa |
| Student vẫn thấy bài cũ | Reload trang, clear cache hoặc kiểm tra backend published dataset |
| Lesson vẫn chỉ có 5 câu | Kiểm tra `lessonNodes` đã được lưu/publish chưa |

---

## 11. Ghi chú cho người phát triển

Các file liên quan chính:

| File | Vai trò |
|---|---|
| [`historyalive-admin/src/pages/LessonsPage.tsx`](./historyalive-admin/src/pages/LessonsPage.tsx) | UI Lesson Studio |
| [`historyalive-admin/src/services/lessonDataAdapter.ts`](./historyalive-admin/src/services/lessonDataAdapter.ts) | Parse và normalize dataset |
| [`historyalive-admin/src/services/lessonAssetCatalog.ts`](./historyalive-admin/src/services/lessonAssetCatalog.ts) | Catalog ảnh public assets |
| [`backend/models/lesson.py`](./backend/models/lesson.py) | Schema dữ liệu lesson |
| [`backend/services/lesson_content_service.py`](./backend/services/lesson_content_service.py) | Draft/publish/normalize backend |
| [`frontend/public/quiz/app.js`](./frontend/public/quiz/app.js) | Runtime lấy câu theo `lessonNodes` |

---

## 12. Công thức nhớ nhanh

```text
25 câu = 1 chương chuẩn
5-10 câu = 1 node
Draft = nơi admin sửa
Published = nơi học sinh dùng
lessonNodes = metadata chia câu hỏi theo node
```
