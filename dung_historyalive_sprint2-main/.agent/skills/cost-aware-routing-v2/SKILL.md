# Cost‑Aware Routing v2

## Mô tả
Skill này mở rộng **COST_AWARE_ROUTING** để tính ROI dựa trên:
- `RelevanceScore`
- `ExpectedValue`
- `TokenCost`
- `LatencyCost`
- `AgentQualityScore`
- `ThresholdConfidence`

## Công thức
```
ROI = (ExpectedValue * RelevanceScore * AgentQualityScore) / (TokenCost + LatencyCost + AgentCost)
```

Kết quả được trả về dưới dạng JSON:
```json
{ "skill": "cost-aware-routing-v2", "roi": 1.23, "details": {...} }
```

## Hook
- Được gọi trong `skillRouter.js` sau khi thu thập các metric.
- Nếu `roi` < `roiThreshold` (được tính bởi **Threshold Intelligence**) thì skill sẽ bị bỏ qua.

## Cấu hình mẫu (`cost-aware-routing-config.json`)
```json
{
  "roiThreshold": 0.5,
  "weight": {
    "relevance": 0.4,
    "expectedValue": 0.3,
    "agentQuality": 0.2,
    "cost": 0.1
  }
}
```

## Kiểm thử
- `tests/cost_aware_routing_v2.test.js` sẽ mô phỏng các metric và xác nhận ROI tính đúng.

**Tham chiếu**: Sử dụng `lodash` cho tính toán trọng số, `axios` để lấy metrics runtime.
