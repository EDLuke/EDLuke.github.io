import { getWaypointParams } from './route';
import {
  ROUTE_PROGRESS_START,
  activeIndex,
  pageProgressFromRoute,
  routeProgressFromPage,
} from './visibility';

it('keeps Lehigh active while the route UI becomes readable', () => {
  const centers = getWaypointParams();
  const lehighSwitchPoint = pageProgressFromRoute((centers[0] + centers[1]) / 2);

  expect(routeProgressFromPage(ROUTE_PROGRESS_START)).toBe(0);
  expect(activeIndex(routeProgressFromPage(ROUTE_PROGRESS_START), centers)).toBe(0);
  expect(activeIndex(routeProgressFromPage(0.43), centers)).toBe(0);
  expect(lehighSwitchPoint).toBeGreaterThan(0.45);
});
