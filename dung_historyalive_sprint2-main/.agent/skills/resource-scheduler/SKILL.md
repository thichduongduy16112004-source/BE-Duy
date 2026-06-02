# Skill: Resource Scheduler

## Mô tả
Quản lý parallelism governor: theo dõi chi phí giao tiếp, đồng bộ hoá và lợi ích tăng tốc khi spawn thêm agent. Tính toán `expectedBenefit - coordinationCost` và quyết định spawn hoặc không.

## API
- `evaluateParallelism(taskComplexity, activeAgents): boolean` – trả về `true` nếu nên spawn agent mới.
- `estimateCoordinationCost(numAgents): number` – tính chi phí thời gian và token.
- `estimateBenefit(taskComplexity): number` – ước lượng gain dựa trên độ phức tạp.

## Usage
```js
import { evaluateParallelism } from './resource_scheduler.js';
if (evaluateParallelism('HIGH', currentAgents)) {
  // invoke_subagent ...
}
```

## Dependencies
- `ml‑regression` for benefit prediction
- `performance‑monitor` for real‑time cost data.

---
*Referenced by Parallelism Governor in THRESHOLD_INTELLIGENCE.*
