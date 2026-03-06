import THREE from './vendor/three.module.js';
import { camera, EYE_HEIGHT, GROUND_SIZE } from './core.js';
import { treeFootprints, rockFootprints } from './world.js';

export const PLAYER_RADIUS = 1.6;
export const COLLISION_CELL = 16;
export const COLLISION_NEIGHBOR_RANGE = 3;

export const collisionGrid = new Map();

export function cIndex(v) { return Math.floor(v / COLLISION_CELL); }
export function cKey(ix, iz) { return ix + ',' + iz; }

export function buildCollisionGrid() {
  collisionGrid.clear();

  // Insert trees (halve collision radius)
  for (let i = 0; i < treeFootprints.length; i++) {
    const p = treeFootprints[i];
    const k = cKey(cIndex(p.x), cIndex(p.z));
    if (!collisionGrid.has(k)) collisionGrid.set(k, []);
    collisionGrid.get(k).push({ x: p.x, z: p.z, r: p.r * 0.5 });
  }

  // Insert rocks
  for (let i = 0; i < rockFootprints.length; i++) {
    const p = rockFootprints[i];
    const k = cKey(cIndex(p.x), cIndex(p.z));
    if (!collisionGrid.has(k)) collisionGrid.set(k, []);
    collisionGrid.get(k).push(p);
  }
}

export function getNearby(x, z) {
  const ix = cIndex(x);
  const iz = cIndex(z);
  const res = [];
  for (let dx = -COLLISION_NEIGHBOR_RANGE; dx <= COLLISION_NEIGHBOR_RANGE; dx++) {
    for (let dz = -COLLISION_NEIGHBOR_RANGE; dz <= COLLISION_NEIGHBOR_RANGE; dz++) {
      const k = cKey(ix + dx, iz + dz);
      const cell = collisionGrid.get(k);
      if (cell) res.push(...cell);
    }
  }
  return res;
}

export function collidesAt(x, z, r) {
  const neighbors = getNearby(x, z);
  for (let i = 0; i < neighbors.length; i++) {
    const p = neighbors[i];
    const minDist = r + p.r;
    const dx = x - p.x;
    const dz = z - p.z;
    if ((dx * dx + dz * dz) < (minDist * minDist)) return true;
  }
  return false;
}

// Insert an arbitrary collider into the collision grid
export function insertCollider(cx, cz, cr) {
  const k = cKey(cIndex(cx), cIndex(cz));
  if (!collisionGrid.has(k)) collisionGrid.set(k, []);
  collisionGrid.get(k).push({ x: cx, z: cz, r: cr });
}

// Move the camera with collision, given local deltas in the camera's right/forward axes
export function attemptMoveLocal(velocity, dxLocal, dzLocal) {
  if (dxLocal === 0 && dzLocal === 0) return;

  // Compute world-space movement vectors
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  if (forward.lengthSq() > 1e-6) forward.normalize(); else forward.set(0, 0, -1);

  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().copy(forward).cross(up).normalize();

  // Break long moves into small steps to reduce tunneling through thin obstacles
  const maxStep = 2.0;
  const worldDelta = new THREE.Vector3()
    .addScaledVector(right, dxLocal)
    .addScaledVector(forward, dzLocal);
  const steps = Math.max(1, Math.ceil(worldDelta.length() / maxStep));
  const stepDx = dxLocal / steps;
  const stepDz = dzLocal / steps;

  for (let i = 0; i < steps; i++) {
    const dR = right.clone().multiplyScalar(stepDx);
    const dF = forward.clone().multiplyScalar(stepDz);

    // Axis-separated movement for natural sliding
    if (stepDx !== 0) {
      const candX = camera.position.x + dR.x;
      const candZ = camera.position.z + dR.z;
      if (!collidesAt(candX, candZ, PLAYER_RADIUS)) {
        camera.position.x = candX;
        camera.position.z = candZ;
      } else {
        velocity.x = 0;
      }
    }

    if (stepDz !== 0) {
      const candX = camera.position.x + dF.x;
      const candZ = camera.position.z + dF.z;
      if (!collidesAt(candX, candZ, PLAYER_RADIUS)) {
        camera.position.x = candX;
        camera.position.z = candZ;
      } else {
        velocity.z = 0;
      }
    }
  }
}

// Keep the camera above ground and within bounds
export function clampPlayer() {
  camera.position.y = EYE_HEIGHT;
  const half = GROUND_SIZE * 0.5 - 5;
  camera.position.x = Math.max(-half, Math.min(half, camera.position.x));
  camera.position.z = Math.max(-half, Math.min(half, camera.position.z));
}