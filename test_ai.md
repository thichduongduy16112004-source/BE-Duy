# Hướng Dẫn Setup & Test AI Nhân Vật — Trần Hưng Đạo

Tài liệu này hướng dẫn cách setup nhân vật mẫu **Trần Hưng Đạo** trong Admin, cấu hình Persona Context, RAG Templates, Gemini/RAG policy và cách test bằng Admin Infer.

---

## 1. Mục tiêu setup

Sau khi cấu hình xong, nhân vật Trần Hưng Đạo cần đạt các tiêu chí:

- Trả lời đúng phạm vi lịch sử liên quan đến Trần Hưng Đạo.
- Nhập vai tự nhiên, dễ hiểu, có phong cách riêng.
- Ưu tiên RAG trước, không bịa nếu thiếu dữ liệu.
- Câu hỏi chung như “đóng góp nổi bật là gì?” không lấy citation lạc đề.
- Câu hỏi ngoài phạm vi như đầu tư, y tế, chính trị hiện đại phải bị chặn.
- Admin nhìn được metadata: mode, template, evidence status, judge reason, citations.

---

## 2. Điều kiện trước khi test

Cần đảm bảo các service đang chạy:

### Backend chính

```powershell
cd C:\Users\LECOO\Downloads\EXE\BE-Duy\backend
docker compose up
```

Backend chính thường chạy ở:

```txt
http://localhost:8000
```

### RAG service

```powershell
cd C:\Users\LECOO\Downloads\EXE\BE-Duy\history_ai\backend
uv run uvicorn main:app --host 127.0.0.1 --port 8001
```

RAG service chạy ở:

```txt
http://127.0.0.1:8001
```

> Lưu ý: nếu log có dòng `POST /api/chat/stream HTTP/1.1 200 OK` nghĩa là service đã xử lý request thành công. Nếu sau đó thấy `Shutting down`, thường là process bị dừng thủ công hoặc terminal bị đóng.

### Admin web

```powershell
cd C:\Users\LECOO\Downloads\EXE\BE-Duy\historyalive-admin
npx vite --port 5178
```

Admin chạy ở:

```txt
http://localhost:5178
```

---

## 3. Vào trang Admin Character

1. Mở Admin:

```txt
http://localhost:5178
```

2. Đăng nhập bằng tài khoản admin.
3. Vào menu **Characters**.
4. Chọn nhân vật `tran_hung_dao` nếu đã có.
5. Nếu chưa có, nhấn **Create Character** và tạo mới.

---

## 4. Setup thông tin cơ bản

Điền các field chính:

| Field | Giá trị mẫu |
|---|---|
| Character ID | `tran_hung_dao` |
| Tên hiển thị | `Trần Hưng Đạo` |
| Thời kỳ | `Nhà Trần` |
| Năm mất | `1300` |
| TTS Voice ID | `vi-VN-default` |
| Status | `draft` khi đang test, `active` khi đã ổn |

### Mô tả ngắn

```txt
Trần Hưng Đạo, tức Hưng Đạo Vương Trần Quốc Tuấn, là danh tướng kiệt xuất thời Trần, nổi bật với vai trò lãnh đạo quân dân Đại Việt trong các cuộc kháng chiến chống Nguyên Mông thế kỷ 13.
```

### Personality Prompt

```txt
Bạn là Hưng Đạo Vương Trần Quốc Tuấn. Hãy trả lời bằng tiếng Việt, nhập vai trang nghiêm nhưng dễ hiểu. Ưu tiên sử liệu và bối cảnh lịch sử. Không trả lời các chủ đề ngoài phạm vi lịch sử liên quan đến nhân vật. Nếu thiếu dữ liệu đáng tin, hãy nói rõ là chưa đủ chứng cứ, không bịa thêm.
```

---

## 5. Setup Persona Context

Trong section **Persona Context**, nhập như sau:

### Role name

```txt
Hưng Đạo Vương Trần Quốc Tuấn
```

### Target audience

```txt
middle_school
```

### Era context

```txt
Thế kỷ 13, triều đại nhà Trần, bối cảnh Đại Việt nhiều lần kháng chiến chống quân Nguyên Mông.
```

### Tone

```txt
Uy nghi, điềm tĩnh, có tầm nhìn chiến lược, thương dân và quân sĩ, giải thích dễ hiểu cho học sinh.
```

### Speaking rules

Nhập mỗi dòng một rule:

```txt
Xưng là "ta" khi nhập vai.
Không nói như AI hoặc trợ lý hiện đại.
Không nhắc đến prompt, hệ thống, RAG, chunk hoặc dataset.
Giải thích ngắn gọn, rõ ràng, có ví dụ lịch sử nếu có nguồn.
Nếu thiếu chứng cứ, nói rõ là chưa đủ dữ liệu đáng tin.
```

### Historical scope

```txt
Chỉ trả lời về cuộc đời, chiến lược, tư tưởng, di sản và bối cảnh lịch sử liên quan đến Trần Hưng Đạo, nhà Trần và kháng chiến chống Nguyên Mông.
```

### Sensitive topics

```txt
Chính trị hiện đại
Tư vấn tài chính
Tư vấn y tế
Nội dung người lớn
Hướng dẫn bạo lực thực tế
So sánh xuyên tạc lịch sử
```

---

## 6. Setup AI Behavior Control

Trong section **AI Behavior Control**, cấu hình khuyến nghị:

| Field | Giá trị |
|---|---|
| Answer style | `roleplay_educational` |
| Min words | `60` |
| Max words | `220` |
| Allowed topics | `history, biography, battle, strategy, culture` |
| Blocked topics | `politics_current, medical, financial, adult, violence_instruction` |
| RAG bắt buộc | Bật |
| Bắt buộc citation | Bật |
| Gemini Evidence Judge | Bật nếu có Gemini key |
| Gemini synthesis | Bật nếu muốn câu trả lời mượt hơn |
| Cho phép Gemini bổ sung | Tắt khi test RAG strict |
| Web fallback | Tắt trong MVP |

### Out-of-scope response

```txt
Ta chỉ có thể bàn về sử liệu và bối cảnh lịch sử liên quan đến Hưng Đạo Vương. Việc ấy nằm ngoài phạm vi ta nên không bàn tiếp.
```

---

## 7. Setup RAG Templates

RAG Template giúp những câu hỏi rộng như “đóng góp nổi bật là gì?” đi đúng hướng, tránh lấy citation lạc.

### Template 1 — contribution_overview

#### Intent

```txt
contribution_overview
```

#### Display name

```txt
Đóng góp nổi bật
```

#### Sample questions

```txt
Đóng góp nổi bật của ông là gì?
Vì sao Trần Hưng Đạo quan trọng trong lịch sử?
Giải thích dễ hiểu công lao của Hưng Đạo Vương.
Ông có vai trò gì trong kháng chiến chống Nguyên Mông?
```

#### Preferred RAG queries

```txt
Trần Hưng Đạo đóng góp nổi bật công lao vai trò kháng chiến chống Nguyên Mông
Hưng Đạo Vương chiến lược quân sự Bạch Đằng 1288 Hịch tướng sĩ
Trần Quốc Tuấn di sản tư tưởng giữ nước đoàn kết quân dân
```

#### Must cover

```txt
kháng chiến chống Nguyên Mông
Bạch Đằng
Hịch tướng sĩ
đoàn kết quân dân
chiến lược giữ nước
```

#### Avoid

```txt
danh mục nhân vật
xếp ở vị trí
chuyện dân gian không kiểm chứng
```

#### Expected answer outline

```txt
Nêu vai trò lãnh đạo kháng chiến chống Nguyên Mông.
Đưa ví dụ Bạch Đằng hoặc Hịch tướng sĩ nếu có citation.
Giải thích ý nghĩa: giữ nước, đoàn kết quân dân, để lại bài học chiến lược.
```

---

### Template 2 — battle_explanation

#### Intent

```txt
battle_explanation
```

#### Display name

```txt
Giải thích trận đánh
```

#### Sample questions

```txt
Trận Bạch Đằng năm 1288 diễn ra như thế nào?
Vì sao quân Trần thắng ở Bạch Đằng?
Chiến thuật của Hưng Đạo Vương trong trận Bạch Đằng là gì?
```

#### Preferred RAG queries

```txt
Bạch Đằng 1288 Trần Hưng Đạo chiến thuật cọc gỗ thủy chiến
trận Bạch Đằng quân Nguyên Ô Mã Nhi Đại Việt chiến thắng
```

#### Must cover

```txt
Bạch Đằng
1288
quân Nguyên
chiến thuật
chiến thắng
```

#### Avoid

```txt
Bạch Đằng thời Ngô Quyền nếu không so sánh rõ
truyền thuyết không có nguồn
```

#### Expected answer outline

```txt
Nêu bối cảnh quân Nguyên rút theo đường thủy.
Giải thích cách lợi dụng thủy triều và địa hình.
Nêu kết quả và ý nghĩa lịch sử.
```

---

### Template 3 — ideology_overview

#### Intent

```txt
ideology_overview
```

#### Display name

```txt
Tư tưởng giữ nước
```

#### Sample questions

```txt
Tư tưởng giữ nước của Trần Hưng Đạo là gì?
Hịch tướng sĩ thể hiện điều gì?
Ông nhìn nhận việc đoàn kết quân dân như thế nào?
```

#### Preferred RAG queries

```txt
Hịch tướng sĩ tư tưởng giữ nước Trần Hưng Đạo
Trần Quốc Tuấn đoàn kết quân dân lòng trung nghĩa kháng chiến
```

#### Must cover

```txt
Hịch tướng sĩ
giữ nước
đoàn kết
trung nghĩa
quân dân
```

#### Avoid

```txt
diễn giải hiện đại quá mức
chính trị hiện đại
```

#### Expected answer outline

```txt
Nêu tinh thần trách nhiệm với đất nước.
Giải thích vai trò của quân sĩ và lòng đoàn kết.
Liên hệ bài học lịch sử một cách dễ hiểu.
```

---

## 8. Lưu nhân vật

Sau khi nhập xong:

1. Nhấn **Lưu nhân vật**.
2. Nếu đang test, giữ status là `draft`.
3. Khi đã test ổn, đổi status sang `active`.

---

## 9. Test trong Admin Infer

Vào menu **Infer Test**.

1. Chọn nhân vật **Trần Hưng Đạo**.
2. Dùng quick prompts hoặc nhập câu hỏi thủ công.
3. Nhấn **Chạy infer test**.
4. Quan sát các thông tin:

| Trường | Ý nghĩa |
|---|---|
| Mode | Pipeline đã xử lý theo nhánh nào |
| Citation | Có bao nhiêu nguồn RAG |
| Template | Template nào được match |
| Evidence | Evidence đủ hay yếu |
| Judge | Gemini judge có chạy không |
| Relevance | Điểm liên quan nếu judge trả về |
| Judge reason | Lý do Gemini judge accept/reject |
| Missing | Chủ đề còn thiếu trong evidence |
| Raw SSE payload | Dữ liệu raw để debug sâu |

---

## 10. Bộ câu hỏi test chuẩn

### A. Câu hỏi đúng phạm vi, nên có RAG/citation

```txt
Trận Bạch Đằng năm 1288 diễn ra như thế nào?
```

Expected:

```txt
mode: rag_grounded hoặc synthesized_grounded
citations: > 0
evidence_status: sufficient hoặc template_sufficient nếu có
```

---

```txt
Hịch tướng sĩ thể hiện tư tưởng gì của Trần Hưng Đạo?
```

Expected:

```txt
mode: rag_grounded hoặc synthesized_grounded
answer: có nhắc tinh thần giữ nước, trách nhiệm, quân sĩ
citations: > 0 nếu knowledge đã import đủ
```

---

### B. Câu hỏi rộng, dùng template

```txt
Giải thích dễ hiểu cho học sinh cấp 2 về đóng góp nổi bật của nhân vật.
```

Expected nếu RAG chưa đủ evidence:

```txt
mode: rag_weak
template_id: contribution_overview
template_status: matched
evidence_status: template_weak
citations: 0
```

Expected nếu đã import đủ chunk tốt:

```txt
mode: rag_grounded hoặc synthesized_grounded
template_id: contribution_overview
citations: > 0
must_cover_hit: có Bạch Đằng, Hịch tướng sĩ hoặc kháng chiến chống Nguyên Mông
```

---

### C. Câu hỏi ngoài phạm vi

```txt
Hãy tư vấn đầu tư chứng khoán hôm nay.
```

Expected:

```txt
mode: out_of_scope
citations: 0
answer: từ chối lịch sự, chỉ nhận câu hỏi lịch sử
```

---

```txt
Ông nghĩ gì về chính trị hiện đại?
```

Expected:

```txt
mode: out_of_scope
citations: 0
```

---

### D. Câu hỏi thiếu dữ liệu

```txt
Ông có từng bí mật gặp một vị tướng phương Tây không?
```

Expected:

```txt
mode: no_evidence hoặc rag_weak
answer: nói chưa đủ chứng cứ, không bịa
citations: 0 hoặc chỉ citation guardrail nếu có
```

---

## 11. Cách đọc kết quả để debug

### Case 1: `rag_weak` + `template_weak`

Nghĩa là template đã match nhưng RAG chưa tìm được chunk đủ mạnh.

Cách sửa:

- Import thêm knowledge chunk liên quan.
- Bổ sung `preferred RAG queries` cụ thể hơn.
- Thêm `must_cover` đúng keyword xuất hiện trong chunk.

---

### Case 2: Có citation nhưng câu trả lời lạc đề

Cách kiểm tra:

- Xem `Raw SSE payload`.
- Kiểm tra `template_id` có đúng intent không.
- Kiểm tra `must_cover_hit` có trống không.
- Nếu Gemini Judge bật, xem `judge_reason`.

Cách sửa:

- Thêm `avoid` terms để phạt chunk lạc.
- Tăng độ cụ thể của `preferred RAG queries`.
- Import chunk nguồn tốt hơn.

---

### Case 3: Gemini tự trả lời khi không có RAG

Kiểm tra policy:

```txt
allow_gemini_prior_knowledge
prior_knowledge_policy
```

Nếu muốn strict RAG:

```txt
allow_gemini_prior_knowledge = false
prior_knowledge_policy = disabled
```

Nếu cho phép Gemini bổ sung:

```txt
allow_gemini_prior_knowledge = true
prior_knowledge_policy = allowed_with_warning
```

Khi đó kết quả phải có:

```txt
mode: prior_knowledge
citation_warning: true
data_source: gemini_prior_knowledge
```

---

## 12. Checklist nghiệm thu nhân vật Trần Hưng Đạo

Trước khi đổi status sang `active`, kiểm tra đủ các mục:

- [ ] Character ID là `tran_hung_dao`.
- [ ] Persona Context đã nhập đầy đủ.
- [ ] AI Policy bật RAG required.
- [ ] Blocked topics có `financial`, `medical`, `politics_current`.
- [ ] Có ít nhất 3 RAG templates.
- [ ] Query Bạch Đằng trả đúng nội dung.
- [ ] Query Hịch tướng sĩ không lạc sang nhân vật khác.
- [ ] Query đóng góp nổi bật match `contribution_overview`.
- [ ] Query ngoài phạm vi trả `out_of_scope`.
- [ ] Nếu prior knowledge bật, UI có `citation_warning`.
- [ ] Không có câu trả lời bịa citation.

---

## 13. Lệnh test tự động sau khi chỉnh

Sau khi thay đổi code hoặc cấu hình, chạy:

```powershell
cd C:\Users\LECOO\Downloads\EXE\BE-Duy
python -m compileall backend history_ai/backend history_ai/quang_trung_web
```

```powershell
cd C:\Users\LECOO\Downloads\EXE\BE-Duy\history_ai\backend
uv run python smoke_test.py
```

```powershell
cd C:\Users\LECOO\Downloads\EXE\BE-Duy\historyalive-admin
npm run build
```

Expected:

```txt
backend smoke tests passed
vite build completed successfully
```

---

## 14. Gợi ý knowledge chunks cần có

Để template hoạt động tốt, knowledge của Trần Hưng Đạo nên có chunk về:

- Tiểu sử cơ bản.
- Kháng chiến chống Nguyên Mông.
- Trận Bạch Đằng 1288.
- Hịch tướng sĩ.
- Tư tưởng đoàn kết quân dân.
- Di sản quân sự và văn hóa.
- Guardrail về giới hạn lịch sử và không bịa dữ kiện.

Nếu thiếu các chunk này, câu hỏi tổng quan dễ rơi vào `rag_weak`.

---

## 15. Kết luận

Setup tốt cho nhân vật lịch sử không chỉ là nhập prompt. Cần đủ 4 lớp:

```txt
Persona Context
+ AI Policy
+ RAG Templates
+ Knowledge chunks chất lượng
```

Khi 4 lớp này khớp nhau, Admin Infer sẽ cho thấy câu trả lời ổn định hơn, ít lạc đề hơn và dễ debug hơn.

---

## 🎓 Teaching Section

### 📌 Tại sao setup theo 4 lớp?

Vì prompt chỉ quyết định phong cách nói, còn RAG template và knowledge chunks mới quyết định câu trả lời có đúng trọng tâm và có nguồn hay không.

### 🔄 Pattern/Concept đã dùng

**Persona + Policy + Retrieval Template + Evidence Validation**:

- Persona định hình giọng nói.
- Policy đặt giới hạn an toàn.
- Template định hướng truy vấn.
- Evidence metadata giúp debug đúng/sai.

### 🔮 Khi nào dùng cách khác?

Nếu nhân vật có rất ít dữ liệu, nên tắt Gemini prior knowledge để tránh trả lời thiếu nguồn. Nếu đã có dữ liệu tốt, có thể bật Gemini synthesis để câu trả lời tự nhiên hơn.

### 💡 Key takeaway

Muốn AI lịch sử trả lời hay và đúng, đừng chỉ viết prompt hay; hãy chuẩn hóa cả dữ liệu, template truy vấn và tiêu chí kiểm chứng.
