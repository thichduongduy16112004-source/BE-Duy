# HistoryAlive Admin — Hướng dẫn import bài học

Tài liệu này hướng dẫn import một bài học hoàn chỉnh vào trang Admin tại `http://localhost:5178/lessons`.

## 1. Chuẩn bị dữ liệu

Admin nhận 2 dạng nội dung:

- File `data.js` theo format quiz hiện tại.
- JSON object có các field tương tự `QUIZ_DATA`.

Cấu trúc tối thiểu:

```js
let QUIZ_DATA = {
  title: "Trắc nghiệm Lịch Sử 11",
  subtitle: "Sách Kết Nối Tri Thức",
  totalQuestions: 25,
  topics: [
    {
      id: 1,
      unitId: "u1",
      name: "Chương 1",
      title: "Cách mạng tư sản và CNTB",
      icon: "🏛️",
      color: "#f97316",
      backgroundImage: "/assets/bg_u1.png",
      questions: [
        {
          id: "q1",
          type: "multiple_choice",
          question: "Câu hỏi mẫu?",
          options: ["A", "B", "C", "D"],
          answer: "1",
          explanation: "Giải thích ngắn gọn."
        }
      ]
    }
  ]
};
```

> [!IMPORTANT]
> Mỗi chương nên có đủ 25 câu để publish theo chương. Admin vẫn cho chỉnh node 5-10 câu để chia nội dung học.

## 2. Ảnh nền chương

Mỗi topic/chương hỗ trợ field:

```js
backgroundImage: "/assets/bg_u1.png"
```

Có 2 cách gắn ảnh nền trong Admin:

1. **Chọn ảnh có sẵn** từ Public Asset Catalog.
   - Ví dụ: `/assets/bg_u1.png`, `/assets/bg_unit_1.png`.
2. **Upload ảnh mới** tại khu vực **Node Detail → Ảnh nền chương**.
   - Backend lưu ảnh bằng key đặc biệt `__chapter_background__`.
   - Sau upload, Admin tự gắn URL ảnh vào `topic.backgroundImage`.

> [!NOTE]
> Ảnh nền là metadata cấp chương, không phải ảnh minh họa node. Ảnh minh họa node vẫn upload riêng theo từng node.

## 3. Quy trình import trên `/lessons`

1. Mở Admin: `http://localhost:5178/lessons`.
2. Chọn **Upload data.js/JSON** hoặc paste nội dung vào Import Center.
3. Bấm **Preview / Validate** để backend kiểm tra dataset.
4. Kiểm tra Content Explorer:
   - Chương đúng tên và `unitId`.
   - Node chia đúng số câu.
   - Validation không báo lỗi nghiêm trọng.
5. Chọn một node bất kỳ trong chương.
6. Tại **Ảnh nền chương**:
   - Chọn ảnh từ catalog, hoặc
   - Nhập path thủ công, hoặc
   - Upload ảnh mới.
7. Bấm **Lưu chương** để ghi thay đổi vào draft.
8. Khi hoàn tất tất cả chương, bấm **Publish Draft**.

## 4. Sau khi publish

Quiz runtime sẽ đọc dữ liệu published từ backend và áp dụng `topic.backgroundImage` khi học sinh vào chương.

Đường dẫn test thường dùng:

```txt
http://localhost:5173/quiz/?unit=u1&lesson=1
```

Nếu không thấy ảnh nền:

- Kiểm tra `backgroundImage` có trong topic published.
- Kiểm tra URL ảnh mở được trên browser.
- Với ảnh trong `public/assets`, path phải bắt đầu bằng `/assets/`.
- Với ảnh upload, path thường có dạng `/api/v1/lesson-content/assets/u1/__chapter_background__`.

## 5. Lưu ý schema

Backend hiện chấp nhận:

- `question.id`: số hoặc chuỗi.
- `question.answer`: số, chuỗi, list, hoặc object.
- `topic.backgroundImage`: chuỗi URL/path hoặc bỏ trống.

Điều này giúp import được `data.js` hiện tại mà không cần đổi toàn bộ ID/answer sang number.
