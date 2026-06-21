# Dashboard UI Polish Plan

## Goal

Tinh chỉnh trang thống kê admin theo UI hình 1–2: gọn hơn, chart cong có animation trái sang phải, chuyển range mượt, hover tooltip như hình 4, bỏ panel Control Room/Today Activity cũ và thay bài học/lượt chat bằng thống kê token/request.

## Project Type

WEB admin dashboard: React + TypeScript + Vanilla CSS + FastAPI/MongoDB stats API.

## Decisions / Assumptions

- Không thêm chart library; dùng SVG custom để kiểm soát animation và tooltip.
- `Today activity user` sẽ đưa vào chart/tab thay vì side panel chữ.
- `Bài học` và `Lượt chat` bị bỏ khỏi UI dashboard, nhưng backend vẫn có thể giữ field cũ để tránh breaking change.
- Token metrics sẽ **đo từ thời điểm triển khai trở đi**, không backfill dữ liệu cũ.
- Vì code hiện tại chưa có `count_tokens`/`usage_metadata`, sẽ thêm hàm đo token nội bộ:
  - Ưu tiên dùng tokenizer/provider nếu backend đã expose API token count.
  - Nếu chưa có tokenizer chính xác, dùng estimator an toàn theo độ dài text để bắt đầu ghi số liệu.
  - Khi provider trả usage thật sau này, logger có thể thay estimator mà không đổi dashboard.

## Success Criteria

- Header đổi thành `Thống kê`, chữ nhỏ gọn giống UI hình 1–2.
- Không còn text/panel cũ:
  - `Control Room`
  - `Bảng điều khiển quản trị`
  - `Mongo RAG Admin`
  - `Today activity`
  - mô tả `User có last_active_at...`
- Chart line là đường cong, không gãy khúc.
- Khi đổi `Today / 24h / 7D / 30D`, chart transition mượt.
- Khi render chart, line chạy từ trái sang phải.
- Hover vào point hiện tooltip tối như hình 4.
- Table/card thống kê hiển thị:
  - Requests
  - Input Tokens
  - Output Tokens
  - Total Tokens
- Token/request data bắt đầu tăng từ các request mới sau khi triển khai.
- Build admin pass.

## Tasks

### 1. Add token usage measurement/logger

- Agent: `backend-specialist`
- Skill: `api-patterns`
- Files:
  - [admin.py](file:///C:/Users/LECOO/Downloads/EXE/BE-Duy/backend/routers/admin.py)
  - AI/chat service file that handles requests after locate pass
- Work:
  - Locate request entrypoint that calls AI/chat generation.
  - Add small token usage logger that writes one document per request:
    - `created_at`
    - `user_id`
    - `route` or `feature`
    - `model` if available
    - `request_count: 1`
    - `input_tokens`
    - `output_tokens`
    - `total_tokens`
  - Add token measuring helper:
    - `measure_input_tokens(text)`
    - `measure_output_tokens(text)`
    - `measure_total_tokens(input, output)`
  - Use estimator first if exact provider usage is unavailable.
- Verify:
  - A new chat/AI request inserts token usage record.
  - Missing/failed token logging must not break the user request.
- Acceptance:
  - Token metrics start collecting from now onward.
  - No historical backfill required.

### 2. Extend backend stats for token/request metrics

- Agent: `backend-specialist`
- Skill: `api-patterns`
- Files:
  - [admin.py](file:///C:/Users/LECOO/Downloads/EXE/BE-Duy/backend/routers/admin.py)
- Work:
  - Add `token_metrics` to `/admin/stats` from the new token usage collection.
  - Add range-based series for:
    - `requests`
    - `input_tokens`
    - `output_tokens`
    - `total_tokens`
    - `active_users`
  - Keep existing response fields for compatibility.
- Verify:
  - `python -m py_compile backend/routers/admin.py`
  - `/admin/stats` returns token fields even when there are no token usage records yet.
- Acceptance:
  - Empty token collection shows `0`, not API crash.
  - Admin/user/revenue metrics still work.

### 3. Update frontend API types

- Agent: `frontend-specialist`
- Skill: `clean-code`
- Files:
  - [apiService.ts](file:///C:/Users/LECOO/Downloads/EXE/BE-Duy/historyalive-admin/src/services/apiService.ts)
- Work:
  - Add token metric interfaces.
  - Extend `analytics_series` to support `requests`, `input_tokens`, `output_tokens`, `total_tokens`, `active_users`.
- Verify:
  - TypeScript build catches no missing fields.
- Acceptance:
  - No `any` needed for dashboard stats.

### 4. Rework dashboard content into compact `Thống kê` layout

- Agent: `frontend-specialist`
- Skill: `frontend-design`
- Files:
  - [DashboardPage.tsx](file:///C:/Users/LECOO/Downloads/EXE/BE-Duy/historyalive-admin/src/pages/DashboardPage.tsx)
- Work:
  - Rename heading to `Thống kê`.
  - Remove old control-room style copy and Today Activity panel.
  - Replace `Bài học` and `Lượt chat` rows/cards with:
    - Requests
    - Input Tokens
    - Output Tokens
    - Total Tokens
  - Add chart modes/tabs for token/request metrics.
  - Add `active users today` as a chart-visible mode/series, not a side text panel.
- Verify:
  - UI no longer contains banned old strings.
  - Range buttons still update values.
- Acceptance:
  - Layout visually matches image 1–2 density more than image 3.

### 5. Build curved animated SVG chart

- Agent: `frontend-specialist`
- Skill: `frontend-design`
- Files:
  - [DashboardPage.tsx](file:///C:/Users/LECOO/Downloads/EXE/BE-Duy/historyalive-admin/src/pages/DashboardPage.tsx)
  - [App.css](file:///C:/Users/LECOO/Downloads/EXE/BE-Duy/historyalive-admin/src/App.css)
- Work:
  - Replace linear path builder with cubic Bézier curve path.
  - Add line draw animation using `stroke-dasharray` / `stroke-dashoffset`.
  - Add smooth range transition by keying chart animation on selected range + metric.
  - Add area fill fade/slide transition.
- Verify:
  - Switching Today/24h/7D/30D feels smooth.
  - Line draws left-to-right after range change.
- Acceptance:
  - Chart line is curved and animated, not straight segments.

### 6. Add hover tooltip like image 4

- Agent: `frontend-specialist`
- Skill: `webapp-testing`
- Files:
  - [DashboardPage.tsx](file:///C:/Users/LECOO/Downloads/EXE/BE-Duy/historyalive-admin/src/pages/DashboardPage.tsx)
  - [App.css](file:///C:/Users/LECOO/Downloads/EXE/BE-Duy/historyalive-admin/src/App.css)
- Work:
  - Track hovered point in React state.
  - Render vertical guide line.
  - Render dark floating tooltip with:
    - time/date label
    - metric label/value
  - Highlight hovered point with ring.
- Verify:
  - Hovering each point shows correct value.
  - Tooltip does not overflow chart edge.
- Acceptance:
  - Tooltip visually matches image 4: dark box, clear label, colored metric.

### 7. CSS density and responsive polish

- Agent: `frontend-specialist`
- Skill: `frontend-design`
- Files:
  - [App.css](file:///C:/Users/LECOO/Downloads/EXE/BE-Duy/historyalive-admin/src/App.css)
- Work:
  - Reduce oversized typography from current image 3.
  - Make chart/table cards compact like image 1–2.
  - Tighten spacing, card radius, table font sizes.
  - Keep no purple/violet colors.
- Verify:
  - Desktop view resembles reference images 1–2.
  - Mobile/tablet does not overflow.
- Acceptance:
  - UI feels like analytics console, not hero dashboard.

### 8. Verification

- Agent: `frontend-specialist` + `backend-specialist`
- Commands:
  - `python -m py_compile backend/routers/admin.py`
  - `npm run build` in [historyalive-admin](file:///C:/Users/LECOO/Downloads/EXE/BE-Duy/historyalive-admin)
- Manual checks:
  - Trigger one new AI/chat request.
  - Open admin dashboard on running Vite port.
  - Click all range buttons.
  - Hover chart points.
  - Switch metric tabs.
  - Confirm old text/panel removed.

## Done When

- [ ] New compact `Thống kê` UI is visible.
- [ ] Curved chart animates left-to-right.
- [ ] Range transitions are smooth.
- [ ] Hover tooltip works like image 4.
- [ ] Request/token stats replace bài học/lượt chat in UI.
- [ ] Today active users appear in chart, not side panel text.
- [ ] Token usage starts collecting from new requests.
- [ ] Backend compile passes.
- [ ] Admin build passes.

## Risk Notes

- Token counts before implementation will be empty by design.
- If exact provider token usage is unavailable, first version will use estimator-based counts. The schema should keep field names stable so exact counts can replace estimator later without changing UI.
