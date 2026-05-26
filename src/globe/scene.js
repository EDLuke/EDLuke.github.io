import * as THREE from 'three';
import { createGlobe } from './createGlobe';
import { createMarkers } from './markers';
import { createRoute } from './createRoute';
import {
  COVER_CAMERA_DISTANCE,
  ROUTE_CAMERA_DISTANCE,
  getCoverCameraPosition,
  getRouteCameraPosition,
  getWaypointParams,
} from './route';
import { activeIndex, routeProgressFromPage } from './visibility';
import { clamp01, smoothstep } from './geo';

const INTRO_END = 0.34;

function defaultRendererFactory(canvas, antialias) {
  return new THREE.WebGLRenderer({
    canvas,
    antialias,
    alpha: true,
    powerPreference: 'high-performance',
  });
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function createStarField() {
  const count = 900;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const theta = seededRandom(i * 12.3) * Math.PI * 2;
    const phi = Math.acos((seededRandom(i * 45.1) * 2) - 1);
    const radius = 8 + seededRandom(i * 8.7) * 18;
    positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
    positions[(i * 3) + 1] = Math.cos(phi) * radius;
    positions[(i * 3) + 2] = Math.sin(phi) * Math.sin(theta) * radius;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: '#e8fbff',
    size: 0.028,
    transparent: true,
    opacity: 0.78,
    sizeAttenuation: true,
  });

  return new THREE.Points(geometry, material);
}

export function createScene(canvas, options) {
  const factory = options.rendererFactory || defaultRendererFactory;
  const renderer = factory(canvas, options.quality.antialias);
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.quality.dprCap));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 80);
  const globe = createGlobe({ globeSegments: options.quality.globeSegments });
  const route = createRoute({ tubularSegments: options.quality.tubularSegments });
  const markers = createMarkers();
  const stars = createStarField();
  const waypointParams = getWaypointParams();

  scene.add(stars, globe.group, route.mesh, markers.group);

  let targetProgress = 0;
  let currentProgress = 0;
  let raf = 0;
  let lastTime = 0;
  let disposed = false;
  const pointer = { x: 0, y: 0 };

  function frame(now) {
    if (disposed) {
      return;
    }

    const dt = lastTime === 0 ? 0 : Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    currentProgress += (targetProgress - currentProgress) * 0.09;

    const pageProgress = clamp01(currentProgress);
    const intro = smoothstep(0.02, INTRO_END, pageProgress);
    const routeVisibility = smoothstep(0.25, 0.39, pageProgress);
    const journeyProgress = routeProgressFromPage(pageProgress);

    const coverCamera = getCoverCameraPosition();
    const routeCamera = getRouteCameraPosition(
      journeyProgress,
      ROUTE_CAMERA_DISTANCE + (1 - intro) * (COVER_CAMERA_DISTANCE - ROUTE_CAMERA_DISTANCE) * 0.16,
    );
    camera.position.copy(coverCamera.lerp(routeCamera, intro));
    camera.position.x += pointer.x * (0.09 + intro * 0.09);
    camera.position.y += pointer.y * (0.08 + intro * 0.08);
    camera.lookAt(0, 0, 0);

    stars.rotation.y += dt * 0.006;
    globe.clouds.rotation.y += dt * 0.022;
    globe.clouds.rotation.z = Math.sin(now * 0.00008) * 0.025;
    globe.scanline.rotation.y += dt * (0.04 + (1 - intro) * 0.1);
    globe.scanline.rotation.x = Math.sin(now * 0.00012) * 0.04;
    route.setProgress(journeyProgress, routeVisibility);
    markers.setActive(activeIndex(journeyProgress, waypointParams), routeVisibility, now);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);

  return {
    setProgress(progress) {
      targetProgress = clamp01(progress);
    },
    setPointer(nx, ny) {
      pointer.x = nx;
      pointer.y = ny;
    },
    resize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if (material.map) {
              material.map.dispose();
            }
            material.dispose();
          });
        }
      });
      renderer.dispose();
    },
  };
}
