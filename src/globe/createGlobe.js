import * as THREE from 'three';
import { GLOBE_RADIUS } from './route';

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function applySrgb(texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawLandBlob(ctx, points, color) {
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point[0], point[1]);
      return;
    }
    ctx.lineTo(point[0], point[1]);
  });
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawContour(ctx, points, color, width) {
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point[0], point[1]);
      return;
    }
    ctx.lineTo(point[0], point[1]);
  });
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function makeGlobeTexture() {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;

  const ocean = ctx.createLinearGradient(0, 0, width, height);
  ocean.addColorStop(0, '#06183d');
  ocean.addColorStop(0.42, '#126dcb');
  ocean.addColorStop(0.72, '#27c1ff');
  ocean.addColorStop(1, '#06142d');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 220; i += 1) {
    const x = seededRandom(i * 17.31) * width;
    const y = seededRandom(i * 41.71) * height;
    const radius = 14 + seededRandom(i * 8.13) * 58;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, 'rgba(118, 231, 255, 0.1)');
    glow.addColorStop(1, 'rgba(118, 231, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';

  const landMasses = [
    { color: '#8ad66d', points: [[250, 260], [410, 175], [570, 220], [640, 360], [510, 420], [360, 380]] },
    { color: '#74c461', points: [[535, 455], [610, 505], [665, 650], [615, 810], [525, 745], [490, 590]] },
    { color: '#f5df62', points: [[930, 245], [1090, 230], [1200, 345], [1160, 520], [990, 525], [900, 405]] },
    { color: '#7fd36a', points: [[1075, 505], [1185, 530], [1240, 710], [1150, 835], [1035, 760], [1010, 610]] },
    { color: '#9de16d', points: [[1210, 250], [1510, 170], [1760, 300], [1725, 500], [1420, 545], [1215, 430]] },
    { color: '#f5df62', points: [[1600, 620], [1715, 615], [1775, 720], [1685, 790], [1565, 740]] },
  ];
  landMasses.forEach((land) => drawLandBlob(ctx, land.points, land.color));
  landMasses.forEach((land) => drawContour(ctx, land.points, 'rgba(2, 18, 37, 0.28)', 7));
  landMasses.forEach((land) => drawContour(ctx, land.points, 'rgba(255, 255, 255, 0.26)', 2));

  ctx.globalCompositeOperation = 'multiply';
  for (let y = 0; y < height; y += 18) {
    ctx.fillStyle = `rgba(2, 18, 37, ${0.025 + (y / height) * 0.04})`;
    ctx.fillRect(0, y, width, 9);
  }
  ctx.globalCompositeOperation = 'source-over';

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1.2;
  for (let lng = 0; lng <= 360; lng += 15) {
    const x = (lng / 360) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let lat = 0; lat <= 180; lat += 15) {
    const y = (lat / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.11)';
  for (let i = 0; i < 1800; i += 1) {
    ctx.fillRect(seededRandom(i * 9.91) * width, seededRandom(i * 23.17) * height, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  applySrgb(texture);
  texture.anisotropy = 8;
  return texture;
}

function makeCloudTexture() {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;

  for (let i = 0; i < 130; i += 1) {
    const x = seededRandom(i * 31.17) * width;
    const y = seededRandom(i * 52.41) * height;
    const radiusX = 58 + seededRandom(i * 14.7) * 190;
    const radiusY = 12 + seededRandom(i * 19.3) * 48;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radiusX);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
    gradient.addColorStop(0.52, 'rgba(255, 255, 255, 0.06)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((seededRandom(i * 6.9) - 0.5) * 0.7);
    ctx.scale(1, radiusY / radiusX);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radiusX, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  applySrgb(texture);
  texture.anisotropy = 8;
  return texture;
}

function makeAtmosphere(segments) {
  const geometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.09, segments, segments);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uColor: { value: new THREE.Color('#5be7ff') },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vViewDir = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 2.2);
        gl_FragColor = vec4(uColor, rim * 0.72);
      }
    `,
  });

  return new THREE.Mesh(geometry, material);
}

export function createGlobe(options) {
  const group = new THREE.Group();
  const segments = options.globeSegments;

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS, segments, segments),
    new THREE.MeshPhongMaterial({
      map: makeGlobeTexture(),
      shininess: 7,
      specular: new THREE.Color('#1f7fb8'),
      emissive: new THREE.Color('#031226'),
      emissiveIntensity: 0.22,
    }),
  );
  sphere.name = 'random-asian-dude-globe';

  const scanline = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS * 1.012, segments, segments),
    new THREE.MeshBasicMaterial({
      color: '#ffffff',
      wireframe: true,
      transparent: true,
      opacity: 0.055,
    }),
  );

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS * 1.018, segments, segments),
    new THREE.MeshBasicMaterial({
      map: makeCloudTexture(),
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    }),
  );
  clouds.name = 'resume-cloud-layer';

  const key = new THREE.DirectionalLight('#ffffff', 1.08);
  key.position.set(3, 2, 4);
  const rim = new THREE.DirectionalLight('#3ae8ff', 1.6);
  rim.position.set(-3, 1.4, -2.5);

  group.add(sphere, clouds, scanline, makeAtmosphere(segments), key, rim);
  group.add(new THREE.AmbientLight('#4777ff', 0.62));

  return { group, sphere, clouds, scanline };
}
