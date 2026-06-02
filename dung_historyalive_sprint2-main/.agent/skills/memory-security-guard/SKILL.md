# Skill: Memory Security Guard

## Mô tả
Kiểm tra và bảo vệ dữ liệu bộ nhớ (Long‑term, Project) khỏi rò rỉ PII/PHI. Phát hiện thông tin nhạy cảm trong nội dung, gắn nhãn, và áp dụng các biện pháp mã hoá hoặc cách ly.

## API
- `scanMemoryEntry(entry): SecurityReport` – trả về kết quả có chứa `containsPII`, `containsPHI` và mức độ nguy hiểm.
- `sanitizeEntry(entry): SanitizedEntry` – loại bỏ hoặc mask dữ liệu nhạy cảm.
- `enforcePolicy(entry): void` – tự động di chuyển entry vào `secure/` nếu phát hiện vi phạm.

## Usage
```js
import { scanMemoryEntry, sanitizeEntry } from './memory_security_guard.js';
const report = scanMemoryEntry(mem);
if (report.containsPII) {
  const safe = sanitizeEntry(mem);
  // store safe version
}
```

## Dependencies
- `node‑privacy‑scanner` hoặc custom regex list cho email, SSN, địa chỉ.
- `crypto` module for AES‑256 encryption of các trường nhạy cảm.

---
*Được tham chiếu bởi MEMORY_GOVERNOR và EMERGENCY_MODE để ngăn rò rỉ dữ liệu.*
