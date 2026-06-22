import type { ContentUnit } from "./content.types";

const CACHE_KEY = "published-content-units";
let publishedUnitsCache: ContentUnit[] = [];

export function setPublishedUnitsCache(units: ContentUnit[]) {
  publishedUnitsCache = units;

  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(units));
  } catch {
    publishedUnitsCache = units;
  }
}

export function getPublishedUnitsCache() {
  if (publishedUnitsCache.length > 0) {
    return publishedUnitsCache;
  }

  try {
    const rawUnits = window.sessionStorage.getItem(CACHE_KEY);
    if (!rawUnits) return [];

    const units = JSON.parse(rawUnits) as ContentUnit[];
    publishedUnitsCache = Array.isArray(units) ? units : [];
    return publishedUnitsCache;
  } catch {
    return [];
  }
}
