# Skill: Knowledge Distillation

## Mô tả
Gộp nhiều entries của bộ nhớ thành các tài liệu tổng hợp: BEST_PRACTICES.md, LESSONS_LEARNED.md, PROJECT_SUMMARIES.md. Sử dụng LLM summarization và clustering.

## API
- `distillMemories(clusterId[]): DistilledArtifact[]`
- `runPeriodicDistillation(scheduleCron): void`

## Usage
```js
import { distillMemories } from './knowledge_distillation.js';
const artifacts = await distillMemories(['projA','projB']);
```

## Dependencies
- OpenAI/Llama API for summarization
- Faiss / Annoy for clustering embeddings

---
*Referenced by MEMORY_INTELLIGENCE (knowledge distillation step).*
