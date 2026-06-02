# Battle package (extracted)

Gói này chứa toàn bộ mã liên quan tới phần "Battle" (trang panorama 360°, store, helper image) để bạn có thể dễ dàng copy vào dự án khác.

Mục lục:
- `src/BattlePage.tsx` — thành phần chính của trang Battle (panorama 360° viewer + UI nhỏ kèm theo).
- `src/data/images.ts` — bản đồ asset (tên file ảnh) dùng bởi `BattlePage`.
- `src/store/gameStore.ts` — slice store nhỏ dùng trong demo (zustand).
- `src/components/ImageWithFallback.tsx` — helper image với fallback khi load lỗi.
- `assets/` — thư mục dành cho ảnh PNG (không bao gồm ảnh trong gói này). Vui lòng copy ảnh từ dự án gốc vào đây.

Hướng dẫn nhanh:

1. Copy thư mục `battle-package/src` vào `src/` của dự án đích hoặc import trực tiếp từ đây.
2. Copy các file ảnh sau từ dự án gốc (`/assets/` gốc) vào `battle-package/assets/`:
   - `49de1dc596808751e47a5f2e68a692506d154435.png`
   - `17e719751afdf7352a16f8b439ae07f8beb83993.png`
   - `ad2d5d4ea267641879ee58e2b50917998d660e4a.png`
   - `a835ca0d0958876e7b887be8bb9e5f85c2dd1301.png`

   Ví dụ copy từ terminal (chạy trong thư mục gốc của dự án):

```bash
mkdir -p battle-package/assets
cp \
  "/Users/dungtuan/Downloads/UI Design for History App/assets/49de1dc596808751e47a5f2e68a692506d154435.png" \
  battle-package/assets/
cp \
  "/Users/dungtuan/Downloads/UI Design for History App/assets/17e719751afdf7352a16f8b439ae07f8beb83993.png" \
  battle-package/assets/
cp \
  "/Users/dungtuan/Downloads/UI Design for History App/assets/ad2d5d4ea267641879ee58e2b50917998d660e4a.png" \
  battle-package/assets/
cp \
  "/Users/dungtuan/Downloads/UI Design for History App/assets/a835ca0d0958876e7b887be8bb9e5f85c2dd1301.png" \
  battle-package/assets/
```

3. Cài phụ thuộc nếu cần (ở dự án đích):

```bash
# Nếu dùng npm
npm install react react-dom zustand motion lucide-react
# hoặc pnpm/yarn tương ứng
```

4. Import `BattlePage` trong router của bạn, ví dụ:

```ts
import BattlePage from './battle-package/src/BattlePage';

// trong routes
{ path: '/battle', Component: BattlePage }
```

Ghi chú:
- Tôi không sao chép các ảnh nhị phân vào gói này để tránh nhân đôi file — thay vào đó cung cấp lệnh `cp` để bạn dễ dàng copy từ thư mục `assets` gốc.
- Nếu muốn, tôi có thể đóng gói thành một zip và include ảnh luôn — báo tôi nếu bạn muốn vậy.

---
Phiên bản: 1.0 — trích xuất từ dự án gốc (BattlePage + assets map + store + helper)
