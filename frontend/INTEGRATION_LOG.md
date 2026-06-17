# Nhật ký Cập nhật (Changelog): Tích hợp "Nội dung trắc nghiệm"

**Ngày cập nhật:** 17/06/2026
**Mục đích:** Ghi chú lại lịch sử thay đổi để team và AI đọc hiểu, đảm bảo không xảy ra xung đột với dự án gốc.

## 1. Các thay đổi chính
- **Không thay đổi mã nguồn cũ:** Dự án React/Vite ban đầu của thư mục `frontend` được giữ nguyên vẹn 100%. (Đã thực hiện `git revert` khôi phục lại trạng thái ban đầu sau một thao tác ghi đè nhầm).
- **Thêm mới module Trắc nghiệm:** Đưa toàn bộ dự án "Nội dung trắc nghiệm Lịch sử" độc lập vào thư mục con `frontend/noidungtracnghiem/`.

## 2. Cấu trúc thư mục mới thêm
Module mới nằm gọn tại `frontend/noidungtracnghiem/` bao gồm:
- `index.html`: Cấu trúc giao diện ứng dụng.
- `style.css`: Giao diện thiết kế theo chuẩn Apple HIG (Light Yellow/Cream Theme).
- `app.js`: Logic xử lý ứng dụng (chọn đáp án, chấm điểm, giải thích AI, bookmark).
- `data.js`: Dữ liệu 130 câu hỏi trắc nghiệm chia thành 6 chủ đề.
- `assets/`: Thư mục chứa hình ảnh icon của 6 chủ đề.

## 3. Các tính năng nổi bật của bản Trắc nghiệm này (so với các phiên bản nháp trước)
- **Giao diện Light Cream Theme:** Chuyển đổi từ Dark Mode sang tone màu Vàng Kem dịu mắt, tối giản, hiển thị bảng "Chủ đề hiện tại" rõ ràng phía trên câu hỏi.
- **Dọn dẹp UI:** Lược bỏ phần "Gợi ý AI" và "Phím tắt" ở Sidebar để tăng không gian hiển thị cho Bản đồ câu hỏi (Question Map).
- **Tinh giản Giải thích AI:** Xóa bỏ các nội dung thừa lặp lại (tên chủ đề, chữ ĐÁP ÁN ĐÚNG) trong ô giải thích AI khi người dùng chọn đáp án. Chỉ hiển thị nguyên văn đoạn giải thích chuyên sâu.
- **Sửa lỗi tính năng Cắm cờ (Bookmark):** Đã sửa lỗi không gọi được hàm `toggleBookmark` từ UI bằng cách export đầy đủ trong `app.js`. Tính năng cắm cờ hiện đã lưu và hiển thị trạng thái chuẩn xác trên Bản đồ câu hỏi.

## 4. Lưu ý cho Team và AI
- Dự án trắc nghiệm này hiện tại hoạt động độc lập dưới dạng file HTML tĩnh (Static files).
- Nếu muốn tích hợp module này vào React/Vite router của `frontend` gốc, cần tiến hành chuyển đổi (convert) `app.js` và `index.html` sang dạng Component của React, hoặc cấu hình Vite để host thư mục này như một trang tĩnh thông qua thư mục `public/`.
- Mọi chỉnh sửa về UI/Logic cho phần trắc nghiệm này hiện tại chỉ giới hạn trong phạm vi thư mục `frontend/noidungtracnghiem/`.
