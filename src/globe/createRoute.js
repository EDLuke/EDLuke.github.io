import * as THREE from 'three';
import { clamp01 } from './geo';
import { getRouteCurve } from './route';

export function createRoute(options) {
  const points = getRouteCurve().getPoints(options.tubularSegments);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const progress = new Float32Array(points.length);
  points.forEach((point, index) => {
    progress[index] = index / (points.length - 1);
  });
  geometry.setAttribute('aProgress', new THREE.BufferAttribute(progress, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uProgress: { value: 0 },
      uOpacity: { value: 0 },
      uBase: { value: new THREE.Color('#ffe45c') },
      uHot: { value: new THREE.Color('#ff4fd8') },
    },
    vertexShader: `
      attribute float aProgress;
      varying float vProgress;
      void main() {
        vProgress = aProgress;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uProgress;
      uniform float uOpacity;
      uniform vec3 uBase;
      uniform vec3 uHot;
      varying float vProgress;
      void main() {
        if (vProgress > uProgress) discard;
        float head = smoothstep(uProgress - 0.055, uProgress, vProgress);
        vec3 color = mix(uBase, uHot, head);
        gl_FragColor = vec4(color, uOpacity);
      }
    `,
  });

  const mesh = new THREE.Line(geometry, material);
  mesh.name = 'resume-pin-route';

  return {
    mesh,
    setProgress(progress, opacity) {
      material.uniforms.uProgress.value = clamp01(progress);
      material.uniforms.uOpacity.value = clamp01(opacity);
    },
  };
}
