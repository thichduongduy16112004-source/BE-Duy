import type { ContentUnit } from "./content.types";

const MOCK_CHAPTERS_BEFORE_PUBLISHED = 4;

export function mergePublishedUnits(mockUnits: ContentUnit[], publishedUnits: ContentUnit[]) {
  if (publishedUnits.length === 0) {
    return mockUnits;
  }

  return [...mockUnits.slice(0, MOCK_CHAPTERS_BEFORE_PUBLISHED), ...publishedUnits];
}
