# Graph Analysis Skill

## Mô tả
Skill này cung cấp các công cụ để xây dựng, truy vấn và phân tích đồ thị phụ thuộc (agent dependency graph, capability graph). Bao gồm:
- Tạo graph bằng Mermaid
- Kiểm tra chu trình (cycle detection)
- Tính toán độ trung tâm (centrality) để tối ưu hoá thứ tự thực thi.

## Giao diện
```json
{
  "name": "graph-analysis",
  "description": "Graph analysis utilities for agent and capability dependencies",
  "inputs": {
    "nodes": "array of node identifiers",
    "edges": "array of [source, target] pairs"
  },
  "outputs": {
    "hasCycle": "boolean",
    "topologicalOrder": "array",
    "centrality": "object"
  }
}
```

## Cách dùng trong ECC
- Đặt file `graph-analysis.js` trong `.agent/skills/graph-analysis/`.
- Export các hàm `detectCycle`, `topologicalSort`, `computeCentrality`.
- Các skill khác (ví dụ `AGENT_DEPENDENCY_GRAPH`) sẽ import và gọi.

## Kiểm thử
Test mẫu (`graph-analysis.test.js`) được tạo trong `tests/` để xác minh các hàm.

## Ghi chú bảo mật
Không thực thi code không đáng tin cậy; chỉ cho phép graph được tạo từ JSON nội bộ.
