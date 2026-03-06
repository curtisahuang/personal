import THREE from './vendor/three.module.js';
import { scene, GROUND_SIZE } from './core.js';
import { collidesAt, insertCollider } from './collision.js';
import { setWaitPanelVisible } from './ui.js';

export const worldDoors = [];
export const worldTorches = [];

export function createHouse(x, z) {
  const house = new THREE.Group();

  const width = 8, depth = 6, height = 3.5, th = 0.8;
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x7d6a57, roughness: 1.0, metalness: 0.0 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a4638, roughness: 1.0, metalness: 0.0 });

  // Front wall segments (door gap in the middle)
  const doorW = 1.3, doorH = 3.0;

  const segW = (width - doorW) * 0.5;
  const frontL = new THREE.Mesh(new THREE.BoxGeometry(segW, height, th), wallMat);
  frontL.position.set(-((doorW + segW) * 0.5), height * 0.5, -depth * 0.5);
  frontL.castShadow = true; frontL.receiveShadow = true;

  const frontR = new THREE.Mesh(new THREE.BoxGeometry(segW, height, th), wallMat);
  frontR.position.set(((doorW + segW) * 0.5), height * 0.5, -depth * 0.5);
  frontR.castShadow = true; frontR.receiveShadow = true;

  const back = new THREE.Mesh(new THREE.BoxGeometry(width, height, th), wallMat);
  back.position.set(0, height * 0.5, depth * 0.5);
  back.castShadow = true; back.receiveShadow = true;

  const left = new THREE.Mesh(new THREE.BoxGeometry(th, height, depth), wallMat);
  left.position.set(-width * 0.5, height * 0.5, 0);
  left.castShadow = true; left.receiveShadow = true;

  const right = new THREE.Mesh(new THREE.BoxGeometry(th, height, depth), wallMat);
  right.position.set(width * 0.5, height * 0.5, 0);
  right.castShadow = true; right.receiveShadow = true;

  const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.8, 1.0, depth + 0.8), roofMat);
  roof.position.set(0, height + 0.5, 0);
  roof.castShadow = true; roof.receiveShadow = true;

  // Door with hinge pivot (opens around left edge)
  const doorPivot = new THREE.Object3D();
  doorPivot.position.set(-doorW * 0.5, doorH * 0.5, -depth * 0.5 + th * 0.5);

  const door = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, th * 0.6), new THREE.MeshStandardMaterial({ color: 0x9a6b3a, roughness: 0.95, metalness: 0.0 }));
  door.position.set(doorW * 0.5, 0, 0);
  door.castShadow = true; door.receiveShadow = true;
  doorPivot.add(door);

  house.add(frontL, frontR, back, left, right, roof, doorPivot);
  house.position.set(x, 0, z);
  scene.add(house);

  // Torch mounted outside near the door (brighter)
  const torchX = -doorW * 0.5 - 0.8;
  const torchY = 2.2;
  const torchZ = -depth * 0.5 - (th * 0.5 + 0.25);

  const stickGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8);
  const stickMat = new THREE.MeshStandardMaterial({ color: 0x3a2b1a, roughness: 1.0, metalness: 0.0 });
  const stick = new THREE.Mesh(stickGeo, stickMat);
  stick.position.set(torchX, torchY - 0.7, torchZ);
  stick.castShadow = false; stick.receiveShadow = false;
  house.add(stick);

  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffcc88 }));
  flame.position.set(torchX, torchY, torchZ);
  house.add(flame);

  const torchLight = new THREE.PointLight(0xffaa66, 5.2, 72, 1.8);
  torchLight.position.set(torchX, torchY + 0.2, torchZ);
  torchLight.castShadow = false;
  house.add(torchLight);

  worldTorches.push({ light: torchLight, flame, baseIntensity: torchLight.intensity, time: 0 });

  // Register door for interaction
  worldDoors.push({
    type: 'door',
    group: house,
    doorPivot,
    x,
    z: z - depth * 0.5,
    r: Math.max(doorW * 0.5, 2.5),
  });

  // Perimeter colliders (skip door gap)
  const spacing = 2.4;
  const rad = 1.4;

  // Front wall left segment
  for (let xi = -width * 0.5; xi <= -doorW * 0.5; xi += spacing) {
    insertCollider(x + xi, z - depth * 0.5, rad);
  }
  // Front wall right segment
  for (let xi = doorW * 0.5; xi <= width * 0.5; xi += spacing) {
    insertCollider(x + xi, z - depth * 0.5, rad);
  }
  // Back wall
  for (let xi = -width * 0.5; xi <= width * 0.5; xi += spacing) {
    insertCollider(x + xi, z + depth * 0.5, rad);
  }
  // Left wall
  for (let zi = -depth * 0.5; zi <= depth * 0.5; zi += spacing) {
    insertCollider(x - width * 0.5, z + zi, rad);
  }
  // Right wall
  for (let zi = -depth * 0.5; zi <= depth * 0.5; zi += spacing) {
    insertCollider(x + width * 0.5, z + zi, rad);
  }
}

export function spawnShelters(count = 6) {
  let placed = 0;

  // Ensure one shelter spawns near the starting area
  for (let attempts = 0; attempts < 300 && placed < 1; attempts++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 28 + Math.random() * 120;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const r = 9;
    if (collidesAt(x, z, r)) continue;
    createHouse(x, z);
    placed++;
    break;
  }
  if (placed < 1) {
    createHouse(26, 0);
    placed++;
  }

  const BORDER = 120;
  const minFromCenter = 16;
  for (let i = placed; i < count; i++) {
    let done = false;
    for (let attempts = 0; attempts < 800; attempts++) {
      const x = (Math.random() - 0.5) * (GROUND_SIZE - BORDER);
      const z = (Math.random() - 0.5) * (GROUND_SIZE - BORDER);
      if (Math.hypot(x, z) < minFromCenter) continue;
      const r = 9;
      if (collidesAt(x, z, r)) continue;
      createHouse(x, z);
      done = true;
      break;
    }
    if (!done) break;
  }
}

export function updateTorchesFlicker(delta) {
  for (let i = 0; i < worldTorches.length; i++) {
    const t = worldTorches[i];
    if (!t || !t.light) continue;
    t.time += delta;
    const s1 = Math.sin(t.time * 8.3 + i * 1.7);
    const s2 = Math.sin(t.time * 13.5 + i * 0.9);
    const n = (s1 + s2) * 0.5;
    const flick = 1 + 0.2 * n + (Math.random() - 0.5) * 0.06;
    t.light.intensity = Math.max(0.8, t.baseIntensity * flick);
    if (t.flame) {
      const scale = 1 + 0.15 * n;
      t.flame.scale.set(scale, scale, scale);
    }
  }
}

export function enterShelter() {
  setWaitPanelVisible(true);
}