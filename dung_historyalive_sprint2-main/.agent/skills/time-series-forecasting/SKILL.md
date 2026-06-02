# Skill: Time‑Series Forecasting

## Mô tả
Cung cấp các hàm dự đoán token usage, memory usage, latency và agent load trong các horizon (1 min, 5 min, 15 min) bằng mô hình ARIMA / Prophet hoặc LLM‑based regression.

## API
- `forecastTokenUsage(horizonMinutes): number`
- `forecastMemoryUsage(horizonMinutes): number`
- `forecastLatency(horizonMinutes): number`
- `forecastAgentLoad(horizonMinutes): number`

## Usage
```js
import { forecastTokenUsage } from './time_series_forecasting.js';
const tokensNext5 = forecastTokenUsage(5);
```

## Dependencies
- `node‑cron` for periodic refresh
- `ml‑forecast` or OpenAI embeddings for LLM‑based prediction.

---
*This skill is referenced by THRESHOLD_INTELLIGENCE for proactive threshold adjustment.*
