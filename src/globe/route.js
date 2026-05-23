import * as THREE from 'three';
import { clamp01, latLngToVector3 } from './geo';

export const GLOBE_RADIUS = 1;
export const ROUTE_RADIUS = 1.025;
export const MARKER_RADIUS = 1.04;
export const COVER_CAMERA_DISTANCE = 4.65;
export const ROUTE_CAMERA_DISTANCE = 2.78;

export const WAYPOINTS = [
  {
    id: 'lehigh-university',
    name: 'Lehigh University',
    place: 'Bethlehem, PA',
    lat: 40.6073,
    lng: -75.3780,
    caption: 'Bachelor of Science, Computer Science. The first official stamp on the building arc.',
  },
  {
    id: 'alk-copilot',
    name: 'ALK / CoPilot',
    place: 'Princeton, NJ',
    lat: 37.7749,
    lng: -122.4194,
    caption: 'Software Engineer working on navigation apps in C++ across Android and Windows Mobile.',
  },
  {
    id: 'columbia-university',
    name: 'Columbia University',
    place: 'New York, NY',
    lat: 51.5072,
    lng: -0.1276,
    caption: 'Master of Science in Computer Science. The route moves uptown and gets more serious.',
  },
  {
    id: 'gilt-saks',
    name: 'Gilt / Saks Android',
    place: 'New York, NY',
    lat: 35.6762,
    lng: 139.6503,
    caption: 'Software Engineer II. Developed and launched the Saks Fifth Avenue Android app.',
  },
  {
    id: 'door',
    name: 'Door',
    place: 'door.com',
    lat: 1.3521,
    lng: 103.8198,
    caption: 'Building everything you see at Door.',
  },
  {
    id: 'buiilding-now',
    name: 'Buiilding Now',
    place: 'edluke.github.io',
    lat: -33.8688,
    lng: 151.2093,
    caption: 'This site becomes the living map: resume, taste, experiments, and whatever ships next.',
  },
];

const SAMPLES_PER_SEGMENT = 32;

function slerpDir(a, b, t) {
  const dot = Math.min(1, Math.max(-1, a.dot(b)));
  const omega = Math.acos(dot);

  if (omega < 1e-6) {
    return a.clone();
  }

  const sinOmega = Math.sin(omega);
  return a.clone()
    .multiplyScalar(Math.sin((1 - t) * omega) / sinOmega)
    .add(b.clone().multiplyScalar(Math.sin(t * omega) / sinOmega));
}

function buildRoutePoints() {
  const dirs = WAYPOINTS.map((waypoint) =>
    latLngToVector3(waypoint.lat, waypoint.lng, 1).normalize());
  const points = [];

  for (let segment = 0; segment < dirs.length - 1; segment += 1) {
    const steps = segment === dirs.length - 2
      ? SAMPLES_PER_SEGMENT
      : SAMPLES_PER_SEGMENT - 1;

    for (let i = 0; i <= steps; i += 1) {
      const dir = slerpDir(dirs[segment], dirs[segment + 1], i / SAMPLES_PER_SEGMENT);
      points.push(dir.multiplyScalar(ROUTE_RADIUS));
    }
  }

  return points;
}

let cachedCurve = null;
let cachedWaypointParams = null;

export function getRouteCurve() {
  if (!cachedCurve) {
    cachedCurve = new THREE.CatmullRomCurve3(buildRoutePoints(), false, 'centripetal');
  }

  return cachedCurve;
}

export function getRouteCameraPosition(progress, distance) {
  const routePoint = getRouteCurve().getPointAt(clamp01(progress));
  return routePoint.clone().normalize().multiplyScalar(distance || ROUTE_CAMERA_DISTANCE);
}

export function getCoverCameraPosition() {
  return latLngToVector3(22, 118, COVER_CAMERA_DISTANCE);
}

export function getWaypointParams() {
  if (cachedWaypointParams) {
    return cachedWaypointParams;
  }

  const curve = getRouteCurve();
  const density = 900;
  cachedWaypointParams = WAYPOINTS.map((waypoint) => {
    const target = latLngToVector3(waypoint.lat, waypoint.lng, ROUTE_RADIUS);
    let bestU = 0;
    let bestD = Infinity;

    for (let i = 0; i <= density; i += 1) {
      const u = i / density;
      const d = curve.getPointAt(u).distanceTo(target);
      if (d < bestD) {
        bestD = d;
        bestU = u;
      }
    }

    return bestU;
  });

  return cachedWaypointParams;
}
