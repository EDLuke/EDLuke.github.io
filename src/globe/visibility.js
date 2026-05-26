import { clamp01 } from './geo';

export const JOURNEY_REVEAL_START = 0.25;
export const JOURNEY_REVEAL_END = 0.42;
export const ROUTE_PROGRESS_START = JOURNEY_REVEAL_END;

export function routeProgressFromPage(progress) {
  return clamp01((progress - ROUTE_PROGRESS_START) / (1 - ROUTE_PROGRESS_START));
}

export function pageProgressFromRoute(progress) {
  return ROUTE_PROGRESS_START + clamp01(progress) * (1 - ROUTE_PROGRESS_START);
}

export function activeIndex(progress, centers) {
  let best = 0;
  let bestDistance = Infinity;

  centers.forEach((center, index) => {
    const distance = Math.abs(progress - center);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });

  return best;
}
