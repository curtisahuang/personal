import THREE from './vendor/three.module.js';
import { renderer, scene, camera, EYE_HEIGHT, WORLD_TIME_SPEED, applyTimeOfDay, updateFlashlight, setFlashlightOn, flashlightOn, getWorldTimeHours, addWorldTimeHours, GROUND_SIZE } from './core.js';
import { PointerLockControls } from './vendor/controls.js';
import { addForestInstanced, addRocksInstanced, addBoundaryRocks } from './world.js';
import { buildCollisionGrid, attemptMoveLocal, clampPlayer, PLAYER_RADIUS } from './collision.js';
import { worldDoors, spawnShelters, updateTorchesFlicker, enterShelter } from './shelters.js';
import { worldBoxes, spawnItems, updateBoxesAnimation, openBox, INTERACT_DISTANCE } from './items.js';
import { initializeUI, setOverlayVisible, updateStamina, setInteractPrompt, updateClockUI, setInventoryVisible, getInventoryVisible, getIsWaiting, setWaitPanelVisible, showGameOver, getOverlayVisible, setDebugInfo } from './ui.js';
import { spawnMonster, updateMonsters, worldMonsters, resetMonstersFarFromPlayer } from './monsters.js';
import { startMusic, setProximityFactor, stopMusic } from './audio.js';

// Build world with scaled counts based on map area
const BASE_SIZE = 2000;
const areaScale = Math.pow(GROUND_SIZE / BASE_SIZE, 2);

const treeCount = Math.floor(4000 * areaScale);
const rockCount = Math.floor(1200 * areaScale);
const shelterCount = Math.floor(6 * areaScale);
const boxCount = Math.floor(120 * areaScale);

addForestInstanced(treeCount);
addRocksInstanced(rockCount);

// Add tall rocks around the border to mark the edge
addBoundaryRocks({ spacing: 32 });

// Build collision grid now that trees and rocks (including border) are placed
buildCollisionGrid();

// Place shelters and items
spawnShelters(shelterCount);
spawnItems(boxCount);

// Spawn the monster (stationary for now)
spawnMonster();

// Controls
const controls = new PointerLockControls(camera, document.body);
controls.addEventListener('lock', () => {
  setOverlayVisible(false);
});
controls.addEventListener('unlock', () => {
  setOverlayVisible(true);
});

// UI init
initializeUI({
  onStart: () => {
    // Start audio in a user gesture and enter pointer lock
    try { startMusic(); } catch (_) {}
    controls.lock();
  },
  onWaitConfirm: (hours) => {
    addWorldTimeHours(hours);
    stamina = MAX_STAMINA;
    applyTimeOfDay(stamina / MAX_STAMINA);
    // Move monster(s) far away when the player finishes waiting in shelter
    resetMonstersFarFromPlayer();
    setWaitPanelVisible(false);
    controls.lock();
  },
  onWaitCancel: () => {
    setWaitPanelVisible(false);
    controls.lock();
  },
});

// Movement state
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let isSprinting = false;
let isGameOver = false;

let debugDistanceEnabled = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const SPEED = 80;
const DAMPING = 8.0;
const SPRINT_MULTIPLIER = 2.0;

// Stamina
const MAX_STAMINA = 100;
let stamina = MAX_STAMINA;
const STAMINA_DRAIN_PER_SEC = 30;
const STAMINA_REGEN_PER_SEC = 20;
const STAMINA_FLASHLIGHT_DRAIN_PER_SEC = 25;

// Interaction
let currentInteract = null;

function updateInteractTarget() {
  currentInteract = null;
  let bestDistSq = INTERACT_DISTANCE * INTERACT_DISTANCE;
  const cx = camera.position.x;
  const cz = camera.position.z;

  // Boxes
  for (let i = 0; i < worldBoxes.length; i++) {
    const b = worldBoxes[i];
    if (!b || b.opened) continue;
    const dx = cx - b.x;
    const dz = cz - b.z;
    const d2 = dx * dx + dz * dz;
    if (d2 < bestDistSq) {
      bestDistSq = d2;
      currentInteract = { type: 'box', ref: b };
    }
  }

  // Doors
  for (let i = 0; i < worldDoors.length; i++) {
    const d = worldDoors[i];
    if (!d) continue;
    const dx = cx - d.x;
    const dz = cz - d.z;
    const d2 = dx * dx + dz * dz;
    if (d2 < bestDistSq) {
      bestDistSq = d2;
      currentInteract = { type: 'door', ref: d };
    }
  }

  if (currentInteract) {
    setInteractPrompt(currentInteract.type === 'door' ? 'Press E to enter shelter' : 'Press E to open 🎁');
  } else {
    setInteractPrompt(null);
  }
}

function handleInteract() {
  if (!currentInteract) return;
  if (currentInteract.type === 'box') {
    openBox(currentInteract.ref);
  } else if (currentInteract.type === 'door') {
    controls.unlock();
    enterShelter();
  }
}

function triggerGameOver() {
  if (isGameOver) return;
  isGameOver = true;
  controls.unlock();
  try { stopMusic(); } catch (_) {}
  showGameOver('You were taken by the thing in the woods.');
}

// Keyboard
function onKeyDown(event) {
  if (isGameOver) return;
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = true; event.preventDefault(); break;
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = true; event.preventDefault(); break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = true; event.preventDefault(); break;
    case 'ArrowRight':
    case 'KeyD':
      moveRight = true; event.preventDefault(); break;
    case 'ShiftLeft':
    case 'ShiftRight':
      isSprinting = true; event.preventDefault(); break;
    case 'KeyQ':
      if (!event.repeat) setInventoryVisible(!getInventoryVisible());
      event.preventDefault(); break;
    case 'KeyE':
      if (!event.repeat) handleInteract();
      event.preventDefault(); break;
    case 'KeyF':
      if (!event.repeat) { setFlashlightOn(!flashlightOn); }
      event.preventDefault(); break;
    case 'Backquote': // secret debug toggle
      if (!event.repeat) {
        debugDistanceEnabled = !debugDistanceEnabled;
        if (!debugDistanceEnabled) setDebugInfo('');
      }
      event.preventDefault(); break;
    case 'Escape':
      if (getIsWaiting()) { setWaitPanelVisible(false); controls.lock(); }
      break;
    default:
      break;
  }
}
function onKeyUp(event) {
  if (isGameOver) return;
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = false; event.preventDefault(); break;
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = false; event.preventDefault(); break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = false; event.preventDefault(); break;
    case 'ArrowRight':
    case 'KeyD':
      moveRight = false; event.preventDefault(); break;
    case 'ShiftLeft':
    case 'ShiftRight':
      isSprinting = false; event.preventDefault(); break;
    default:
      break;
  }
}
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// Animation
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  if (isGameOver) {
    // Keep a faint idle render behind the overlay
    renderer.render(scene, camera);
    return;
  }

  // Pause simulation while the guide overlay is visible
  const paused = getOverlayVisible();
  if (paused) {
    renderer.render(scene, camera);
    return;
  }

  addWorldTimeHours(delta * WORLD_TIME_SPEED);

  // Damping
  velocity.x -= velocity.x * DAMPING * delta;
  velocity.z -= velocity.z * DAMPING * delta;

  // Input direction
  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  if (controls.isLocked) {
    const moving = moveForward || moveBackward || moveLeft || moveRight;
    const sprinting = isSprinting && moving && stamina > 0;

    const curSpeed = SPEED * (sprinting ? SPRINT_MULTIPLIER : 1);
    if (moveForward || moveBackward) velocity.z -= direction.z * curSpeed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * curSpeed * delta;

    // Collision move
    attemptMoveLocal(velocity, -velocity.x * delta, -velocity.z * delta);
    clampPlayer();

    // Stamina drain/regen
    if (sprinting) {
      stamina -= STAMINA_DRAIN_PER_SEC * delta;
    } else {
      stamina += STAMINA_REGEN_PER_SEC * delta;
    }
    if (flashlightOn) {
      stamina -= STAMINA_FLASHLIGHT_DRAIN_PER_SEC * delta;
    }
    stamina = Math.max(0, Math.min(MAX_STAMINA, stamina));
  }

  // Monster updates and proximity check
  updateMonsters(delta);
  let nearest = null;
  let nearestD2 = Infinity;
  for (let i = 0; i < worldMonsters.length; i++) {
    const m = worldMonsters[i];
    const dx = camera.position.x - m.x;
    const dz = camera.position.z - m.z;
    const d2 = dx * dx + dz * dz;
    if (d2 < nearestD2) { nearestD2 = d2; nearest = m; }
    const minDist = PLAYER_RADIUS + (m.r || 2.6);
    if (d2 < (minDist * minDist)) {
      triggerGameOver();
      break;
    }
  }
  // Drive reactive music by proximity
  if (nearest) {
    const dist = Math.sqrt(nearestD2);
    const maxInfluenceDist = 300; // beyond this, music is at calm baseline
    const f = 1 - Math.max(0, Math.min(1, dist / maxInfluenceDist)); // 0..1
    try { setProximityFactor(f); } catch (_) {}
    if (debugDistanceEnabled) setDebugInfo(`Dist: ${dist.toFixed(1)}`);
  } else {
    try { setProximityFactor(0); } catch (_) {}
    setDebugInfo('');
  }

  updateStamina(stamina / MAX_STAMINA);
  applyTimeOfDay(stamina / MAX_STAMINA);
  updateClockUI(getWorldTimeHours());
  updateFlashlight();

  updateInteractTarget();
  updateBoxesAnimation(delta);
  updateTorchesFlicker(delta);

  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});