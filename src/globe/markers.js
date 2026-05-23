import * as THREE from 'three';
import { latLngToVector3 } from './geo';
import { MARKER_RADIUS, WAYPOINTS } from './route';

const BASE_COLOR = new THREE.Color('#f9ff6a');
const ACTIVE_COLOR = new THREE.Color('#ff4fd8');

export function createMarkers() {
  const group = new THREE.Group();
  const meshes = [];

  WAYPOINTS.forEach((waypoint) => {
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.032, 28),
      new THREE.MeshBasicMaterial({
        color: BASE_COLOR.clone(),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      }),
    );
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.045, 0.061, 28),
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      }),
    );
    const position = latLngToVector3(waypoint.lat, waypoint.lng, MARKER_RADIUS);

    mesh.position.copy(position);
    mesh.lookAt(position.clone().multiplyScalar(2));
    halo.position.copy(position.clone().multiplyScalar(1.003));
    halo.lookAt(position.clone().multiplyScalar(2));
    group.add(mesh, halo);
    meshes.push({ mesh, halo });
  });

  return {
    group,
    setActive(index, visibility) {
      const opacity = Math.max(0, Math.min(1, visibility));
      meshes.forEach((entry, i) => {
        const active = i === index;
        const scale = active ? 2.15 : 1;
        entry.mesh.scale.setScalar(scale);
        entry.halo.scale.setScalar(active ? 2.35 : 1.2);
        entry.mesh.material.color.copy(active ? ACTIVE_COLOR : BASE_COLOR);
        entry.mesh.material.opacity = opacity * (active ? 1 : 0.7);
        entry.halo.material.opacity = opacity * (active ? 0.72 : 0.16);
      });
    },
  };
}
