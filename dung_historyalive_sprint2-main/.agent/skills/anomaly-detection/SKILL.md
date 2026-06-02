# Skill: Anomaly Detection & Alerting

## Mô tả
Phát hiện bất thường trong token consumption, latency, memory usage, agent load bằng thống kê (Z‑score, EWMA) và mô hình LLM‑based anomaly detection.

## API
- `detectAnomalies(metricSeries): AnomalyReport[]`
- `registerAlert(callback): void`

## Usage
```js
import { detectAnomalies } from './anomaly_detection.js';
const report = detectAnomalies(tokenSeries);
```

## Dependencies
- `ml‑anomaly` library or custom LLM prompt for outlier explanation.

---
*Referenced by PERFORMANCE_GOVERNOR & EMERGENCY_MODE.*
