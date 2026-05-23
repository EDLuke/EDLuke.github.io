import * as THREE from 'three';
import { clamp01, latLngToVector3 } from './geo';

export const GLOBE_RADIUS = 1;
export const ROUTE_RADIUS = 1.025;
export const MARKER_RADIUS = 1.04;
export const COVER_CAMERA_DISTANCE = 4.65;
export const ROUTE_CAMERA_DISTANCE = 2.32;

export const WAYPOINTS = [
  {
    id: 'android-drawer',
    name: 'Obscure Android Drawer',
    place: 'New York, NY',
    lat: 40.7128,
    lng: -74.0060,
    caption: 'A pull request opens. Somewhere, a settings screen refuses to align.',
  },
  {
    id: 'lehigh-side-quest',
    name: 'Lehigh Side Quest Dispenser',
    place: 'Bethlehem, PA',
    lat: 40.6073,
    lng: -75.3780,
    caption: 'Three years, one degree, and a campus pathfinding bug that keeps respawning.',
  },
  {
    id: 'windows-mobile-portal',
    name: 'Windows Mobile Portal',
    place: 'Princeton, NJ',
    lat: 40.3573,
    lng: -74.6672,
    caption: 'C++ navigation energy preserved in a pocket dimension behind Exit 8A.',
  },
  {
    id: 'saks-elevator',
    name: 'Saks App Elevator',
    place: 'Fifth Avenue',
    lat: 40.7580,
    lng: -73.9776,
    caption: 'Luxury retail Android, going up, stopping at every asynchronous floor.',
  },
  {
    id: 'karaoke-404',
    name: 'Karaoke Room 404',
    place: 'Tokyo-ish',
    lat: 35.6762,
    lng: 139.6503,
    caption: 'The chorus compiled, but the room number cannot be found.',
  },
  {
    id: 'grandma-router',
    name: "Grandma's Router Admin Page",
    place: 'Fuzhou-ish',
    lat: 26.0745,
    lng: 119.2965,
    caption: 'Default password changed to a family recipe and a stern look.',
  },
  {
    id: 'npm-purgatory',
    name: 'NPM Install Purgatory',
    place: 'Singapore CDN Edge',
    lat: 1.3521,
    lng: 103.8198,
    caption: 'One package added. Two hundred warnings achieve enlightenment.',
  },
  {
    id: 'async-observatory',
    name: 'Async Void Observatory',
    place: 'Sydney, AU',
    lat: -33.8688,
    lng: 151.2093,
    caption: 'Promises disappear into the night sky and return as production incidents.',
  },
  {
    id: 'overflow-orbit',
    name: 'Stack Overflow Low Orbit',
    place: 'London, UK',
    lat: 51.5072,
    lng: -0.1276,
    caption: 'A duplicate answer circles forever, glowing with suspicious confidence.',
  },
  {
    id: 'pages-bodega',
    name: 'GitHub Pages Bodega',
    place: 'Brooklyn-adjacent',
    lat: 40.6782,
    lng: -73.9442,
    caption: 'Static hosting, hot coffee, and a deployment receipt taped to the window.',
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
