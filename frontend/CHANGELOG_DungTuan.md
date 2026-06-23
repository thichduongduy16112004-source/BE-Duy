# CHANGELOG_DungTuan

Ngày cập nhật: 2026-06-23

Tài liệu này ghi lại chi tiết các thay đổi frontend/UI/logic đã được thực hiện trong phiên làm việc để dễ đồng bộ với repository `BE-Duy`.

> Lưu ý: Các thay đổi dưới đây tập trung vào phần frontend và giao diện bài học/quiz. Không chủ động chỉnh sửa backend, môi trường Docker, admin app hoặc các thay đổi branding/logo không thuộc phạm vi làm việc này.

---

## 1. Tổng quan phạm vi thay đổi

Các nhóm thay đổi chính:

1. Sửa luồng đăng nhập/đăng ký/onboarding để user đã chọn nhân vật/lớp không bị yêu cầu chọn lại.
2. Đồng bộ hệ thống tim giữa React app cha và iframe quiz.
3. Thiết kế lại giao diện quiz/bài học theo hướng premium hơn.
4. Thêm logic ẩn/hiện Giải thích AI bằng nút ngôi sao.
5. Thêm logic trừ tim khi người dùng xin gợi ý AI trước khi kiểm tra đáp án.
6. Thiết kế lại popup thoát bài học và popup chúc mừng hoàn thành bài học.
7. Sửa lỗi hoàn thành câu cuối không hiện popup chúc mừng.
8. Thêm ảnh minh họa chúc mừng mới dùng cho popup hoàn thành.
9. Đồng bộ một phần UI/logic sang thư mục `noidungtracnghiem`.
10. Bổ sung cơ chế đọc dữ liệu quiz linh hoạt hơn cho các format câu hỏi khác nhau.

---

## 2. Thay đổi chi tiết theo file

### 2.1. `frontend/src/app/store.ts`

#### Nội dung thay đổi

- Bổ sung field `onboarding_completed?: boolean` vào type `User`.
- Thêm giá trị mặc định `onboarding_completed: false` trong `defaultUser`.
- Thêm helper `isOnboardingComplete(user)` để xác định người dùng đã hoàn thành onboarding hay chưa.
- Thêm helper `getPostAuthRoute(user, isNew)` để gom logic điều hướng sau đăng nhập/đăng ký.

#### Lý do thay đổi

Trước đó, một số tài khoản đã hoàn tất chọn nhân vật/lớp nhưng khi đăng nhập lại vẫn bị đẩy về onboarding. Nguyên nhân là logic xác định trạng thái onboarding chưa thống nhất giữa backend response và local state.

#### Tác động

- Nếu user có `onboarding_completed === true`, app đi thẳng vào `/home`.
- Nếu không có flag nhưng đã có đủ `name`, `mascotId`, `grade`, app vẫn xem là hoàn thành onboarding.
- User mới hoặc thiếu dữ liệu onboarding sẽ đi về `/onboarding/name`.

---

### 2.2. `frontend/src/app/screens/LoginScreen.tsx`

#### Nội dung thay đổi

- Import thêm `getPostAuthRoute` từ store.
- Sau khi đăng nhập thường hoặc Google login thành công, thay vì luôn `nav('/home')`, app dùng:

```ts
nav(getPostAuthRoute(data.user, data.is_new));
```

#### Lý do thay đổi

Đảm bảo login không đẩy sai user về Home khi chưa onboarding, hoặc không bắt user đã onboarding phải chọn lại.

#### Tác động

- Login user cũ đã hoàn thành onboarding: vào Home.
- Login user mới/chưa đủ dữ liệu: vào flow onboarding.

---

### 2.3. `frontend/src/app/screens/RegisterScreen.tsx`

#### Nội dung thay đổi

- Import thêm `getPostAuthRoute` từ store.
- Rút gọn logic điều hướng sau đăng ký/Google register bằng helper chung.

#### Lý do thay đổi

Tránh duplicated logic và đảm bảo RegisterScreen xử lý giống LoginScreen.

#### Tác động

Luồng đăng ký mới vẫn vào onboarding, nhưng tài khoản đã có đủ dữ liệu sẽ không bị điều hướng sai.

---

### 2.4. `frontend/src/app/screens/ChooseGradeScreen.tsx`

#### Nội dung thay đổi

- Import thêm `API_URL`.
- Khi chọn lớp, app tạo `nextUser` với:
  - `grade`
  - `onboarding_completed: true`
  - `isNewUser: false`
- Lưu user mới vào state và `localStorage`.
- Nếu có token, gửi request `PUT /users/me/onboarding` để cập nhật backend.
- Có fallback local nếu request lỗi để user không bị kẹt onboarding.

#### Lý do thay đổi

Khi user chọn lớp xong, cần đánh dấu onboarding đã hoàn tất ở cả local app và backend. Nếu không, lần login sau có thể bị yêu cầu chọn lại nhân vật/lớp.

#### Tác động

- Hoàn thành onboarding ổn định hơn.
- Hạn chế lỗi tài khoản như `admin3@historyalive.com` đã chọn rồi nhưng vẫn bị hỏi lại.

---

### 2.5. `frontend/src/app/screens/LessonScreen.tsx`

#### Nội dung thay đổi

- Thêm xử lý message `QUIZ_READY` từ iframe quiz.
- Khi iframe báo sẵn sàng, React app cha gửi lại state tim hiện tại xuống iframe qua `syncHeartsToQuiz()`.
- Khi nhận message `LOSE_HEART`, response gửi về iframe có thêm `reason`.

#### Lý do thay đổi

Iframe quiz cần biết số tim thực tế từ app cha, đặc biệt sau refresh hoặc khi vào lesson trực tiếp. Nếu không đồng bộ, quiz có thể hiển thị tim sai hoặc xử lý trừ tim không nhất quán.

#### Tác động

- Tim hiển thị đồng bộ giữa Home/Lesson/Quiz.
- Logic trừ tim trong quiz đáng tin cậy hơn.
- Premium user hoặc user không còn tim được xử lý đúng theo logic app cha.

---

### 2.6. `frontend/public/quiz/data-loader.js`

#### Nội dung thay đổi

- Khi normalize question, bổ sung fallback cho field `answer`:
  - Ưu tiên `question.answer` nếu có.
  - Nếu không có, dùng `question.correctOptionIndex`.
  - Nếu vẫn không có, dùng `question.ans`.

#### Lý do thay đổi

Dữ liệu quiz có thể đến từ nhiều format khác nhau. Một số bộ câu hỏi dùng `correctOptionIndex` hoặc `ans` thay vì `answer`.

#### Tác động

- Quiz tương thích nhiều format dữ liệu hơn.
- Giảm lỗi câu hỏi không xác định đáp án đúng.

---

### 2.7. `frontend/public/quiz/index.html`

#### Nội dung thay đổi

- Điều chỉnh layout header/sidebar/quiz để phù hợp thiết kế mới.
- Di chuyển/ẩn một số phần không còn phù hợp như tiêu đề thừa hoặc các block làm rối màn hình.
- Hỗ trợ giao diện chương hiện tại nằm ở thanh trên cao.

#### Lý do thay đổi

Người dùng yêu cầu:

- Xóa chữ/thành phần không cần thiết như `FUS`.
- Xóa phần lịch sử 11/ngôi sao dư ở vị trí cũ.
- Đưa thông tin chương hiện tại lên thanh trên cao.

#### Tác động

Giao diện lesson gọn hơn, tập trung vào câu hỏi và tiến trình học.

---

### 2.8. `frontend/public/quiz/style.css`

#### Nội dung thay đổi nổi bật

- Thiết kế lại nhiều phần UI theo hướng premium/light warm theme.
- Cập nhật icon tim đồng bộ style với icon pin/HomeScreen.
- Thiết kế lại progress bar câu hỏi.
- Thêm/điều chỉnh style cho:
  - Question header.
  - Progress shell/fill.
  - Hearts pill.
  - Nút thoát bài học.
  - Nút ngôi sao AI hint.
  - Khung Giải thích AI.
  - Result banner đúng/sai.
  - Popup xác nhận thoát bài học.
  - Popup chúc mừng hoàn thành bài học.
- Làm nền popup sáng hơn, không dùng màu đen nặng như trước.
- Màu chữ/nút `Thoát Bài Học` chuyển theo hướng đỏ để hợp ngữ cảnh xanh/đỏ.
- Thêm style hỗ trợ ảnh chúc mừng không lộ viền/background.

#### Lý do thay đổi

Các yêu cầu UI chính:

- Icon tim phải đồng bộ với icon pin HomeScreen.
- Khung AI explanation không hiện mặc định, chỉ hiện khi bấm sao.
- Popup chúc mừng cần sáng hơn, đẹp hơn, giống app thật hơn.
- Ảnh/icon chúc mừng không được bị lộ viền do background ảnh không merge với nền.

#### Tác động

- Giao diện bài học hiện đại hơn.
- Popup và AI panel nhìn đồng bộ hơn.
- Giảm cảm giác bị dán ảnh/icon có nền lạc tông.

---

### 2.9. `frontend/public/quiz/app.js`

Đây là file có nhiều thay đổi logic nhất.

#### 2.9.1. Đồng bộ tim giữa iframe và React app

- Iframe gửi message `QUIZ_READY` khi sẵn sàng.
- Iframe nhận state tim từ app cha.
- Khi user trả lời sai hoặc xin gợi ý AI trước khi kiểm tra đáp án, iframe gửi `LOSE_HEART` lên app cha.
- Response từ app cha được dùng để cập nhật số tim thật trong iframe.

#### 2.9.2. Logic Giải thích AI bằng ngôi sao

- Phần Giải thích AI không còn hiển thị mặc định.
- Nút ngôi sao cạnh lá cờ/bookmark dùng để bật/tắt khung AI.
- Nếu user chưa kiểm tra đáp án mà bấm sao để xem gợi ý, hệ thống sẽ gọi logic trừ tim.
- Nếu đã kiểm tra đáp án, việc mở AI explanation không bị tính như xin hint trước.

#### 2.9.3. Logic check đáp án và retry

- Cải thiện luồng đúng/sai cho các dạng câu hỏi.
- Tiếp tục hỗ trợ retry question khi trả lời sai.
- Cập nhật result banner đúng/sai và trạng thái question.

#### 2.9.4. Popup chúc mừng hoàn thành bài học

- Thêm `showFinish()` để tạo popup overlay chúc mừng sau khi hoàn thành bài học.
- Popup dùng ảnh `congratulations_party.png`.
- Popup có CTA `TIẾP TỤC` để gọi `triggerQuizFinished()`.
- `triggerQuizFinished()`:
  - Xóa popup.
  - Nếu đang chạy trong iframe lesson có params `unit` và `lesson`, gửi message `QUIZ_FINISHED` lên app cha.
  - Nếu chạy standalone, render màn hình thống kê hoàn thành.

#### 2.9.5. Sửa lỗi không hiện popup hoàn thành ở câu cuối

- Trước đó, khi hoàn thành câu cuối, UI có thể chỉ hiện banner đúng nhưng không hiện popup.
- Nguyên nhân chính được xử lý trong phiên cuối: `updateHeader()` cố truy cập element `headerProgressText` không còn tồn tại trong HTML hiện tại.
- Khi element không tồn tại, Javascript crash và các lệnh phía sau không chạy tiếp, dẫn đến popup không xuất hiện.
- Đã thêm guard an toàn:

```js
const headerProgressText = document.getElementById('headerProgressText');
if (headerProgressText) {
  headerProgressText.textContent = `${state.modeLabel} · ${answered}/${total} đã làm`;
}
```

#### 2.9.6. Export App global

- Đảm bảo các hàm được gọi từ inline HTML handler như `App.triggerQuizFinished()`, `App.restartQuiz()`, `App.returnHome()` có thể truy cập được.

#### 2.9.7. Popup thoát bài học

- Thiết kế lại popup xác nhận thoát.
- Đồng bộ màu sáng hơn, tránh nền đen.
- Nút thoát có màu đỏ rõ ngữ nghĩa.

#### Tác động tổng thể

- User làm xong câu cuối sẽ thấy popup chúc mừng tự hiện, không phải nhấn “Tiếp theo”.
- User có đường quay về HomeScreen để làm bài học tiếp theo.
- Trạng thái hoàn thành bài học được gửi lên React app cha đúng hơn.
- UI lesson/quiz thân thiện và premium hơn.

---

### 2.10. `frontend/public/quiz/assets/congratulations_party.png`

#### Nội dung thay đổi

- Thêm asset ảnh chúc mừng mới cho popup hoàn thành bài học.

#### Lý do thay đổi

Ảnh/icon cũ có background không hòa vào nền popup, bị lộ viền. Asset mới được dùng như layer illustration trong popup để giảm cảm giác ảnh bị dán lên nền.

#### Tác động

Popup chúc mừng có visual rõ ràng và đẹp hơn.

---

### 2.11. `frontend/public/noidungtracnghiem/app.js`

#### Nội dung thay đổi

- Đồng bộ một phần logic quiz với bản `public/quiz`.
- Cập nhật cách xử lý UI/interaction cho quiz nội dung trắc nghiệm.
- Bổ sung/cải thiện các handler liên quan đến điều hướng, feedback và trạng thái làm bài.

#### Lý do thay đổi

Thư mục `noidungtracnghiem` là biến thể quiz khác cần giữ trải nghiệm tương tự để không lệch UI/logic giữa các khu vực.

#### Tác động

Giảm khác biệt trải nghiệm giữa quiz chính và quiz nội dung trắc nghiệm.

---

### 2.12. `frontend/public/noidungtracnghiem/index.html`

#### Nội dung thay đổi

- Điều chỉnh markup để phù hợp UI mới.
- Đồng bộ một số ID/class cần thiết cho JS/CSS.

#### Lý do thay đổi

Đảm bảo JS mới có DOM tương thích.

---

### 2.13. `frontend/public/noidungtracnghiem/style.css`

#### Nội dung thay đổi

- Đồng bộ style chính với quiz mới.
- Điều chỉnh layout, card, nút, feedback và các vùng hiển thị.

#### Lý do thay đổi

Giữ giao diện thống nhất giữa các module frontend.

---

## 3. Những file cố ý không đưa vào phạm vi thay đổi

Các file sau có thể đang xuất hiện trong `git status`, nhưng không thuộc phạm vi frontend UI/logic đã làm nên không nên stage/commit trong lần này:

- `backend/**`
- `backend/docker-compose.yml`
- `historyalive-admin/package-lock.json`
- `README.md`
- `.DS_Store`
- `LOCALHOST_STREAM_GUIDE.md`
- `news/**`
- Các file `__pycache__/*.pyc`

Lý do: tránh làm hỏng môi trường đang chạy thành công hoặc ghi đè thay đổi của người khác.

---

## 4. Checklist kiểm thử đề xuất

Sau khi pull commit này, nên kiểm tra thủ công các flow sau:

1. Login bằng tài khoản đã onboarding xong.
   - Kỳ vọng: vào thẳng HomeScreen.
2. Login bằng tài khoản mới/chưa onboarding.
   - Kỳ vọng: vào onboarding.
3. Vào lesson `/lesson/u1-l2`.
   - Kỳ vọng: iframe quiz load bình thường.
4. Kiểm tra icon tim trên lesson.
   - Kỳ vọng: đồng bộ với state app cha.
5. Bấm ngôi sao trước khi kiểm tra đáp án.
   - Kỳ vọng: mở AI hint và bị trừ tim nếu không premium/không miễn trừ.
6. Bấm ngôi sao sau khi kiểm tra đáp án.
   - Kỳ vọng: mở Giải thích AI, không trừ tim hint trước đáp án.
7. Làm sai một câu.
   - Kỳ vọng: trừ tim, hiện feedback, có retry nếu logic yêu cầu.
8. Làm đúng câu cuối cùng.
   - Kỳ vọng: popup chúc mừng tự hiện, không cần bấm “Tiếp theo”.
9. Bấm `TIẾP TỤC` trên popup.
   - Kỳ vọng: lesson gửi `QUIZ_FINISHED`, app cha điều hướng/cập nhật hoàn thành bài học.
10. Mở popup thoát bài học.
    - Kỳ vọng: popup nền sáng, nút thoát màu đỏ.

---

## 5. Ghi chú đồng bộ Git

Commit dự kiến chỉ nên chứa các file frontend được liệt kê trong kế hoạch đã duyệt. Không stage toàn bộ repository bằng `git add .`.

Lệnh stage an toàn nên dùng là stage theo file cụ thể để tránh lẫn backend/cache/config không liên quan.
