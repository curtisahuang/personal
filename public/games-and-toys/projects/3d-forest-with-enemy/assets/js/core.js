import THREE from './vendor/three.module.js';

// Renderer
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Scene and camera
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1e5);
scene.fog = new THREE.Fog(0xbfd1e5, 200, 2800);

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 6000);
export const EYE_HEIGHT = 2;
camera.position.set(0, EYE_HEIGHT, 0);

// Lighting
export const hemi = new THREE.HemisphereLight(0xffffff, 0x334433, 0.6);
hemi.position.set(0, 200, 0);
scene.add(hemi);

export const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(-120, 200, 80);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.left = -200;
dirLight.shadow.camera.right = 200;
dirLight.shadow.camera.top = 200;
dirLight.shadow.camera.bottom = -200;
scene.add(dirLight);

// Time of day
export let worldTimeHours = 8; // start morning
export const WORLD_TIME_SPEED = 0.04; // hours progressed per real-time second
export function getWorldTimeHours() { return worldTimeHours; }
export function setWorldTimeHours(h) { worldTimeHours = h; }
export function addWorldTimeHours(delta) { worldTimeHours += delta; }

// Flashlight (spotlight attached to the player view)
export const flashlight = new THREE.SpotLight(0xffffff, 2.6, 140, Math.PI / 3, 1.0, 0.6);
flashlight.castShadow = false;
export const flashlightTarget = new THREE.Object3D();
scene.add(flashlightTarget);
flashlight.target = flashlightTarget;
scene.add(flashlight);

export let flashlightOn = false;
flashlight.visible = false;
export function setFlashlightOn(on) {
  flashlightOn = !!on;
  flashlight.visible = !!on;
}

// Apply time-of-day visuals
export function applyTimeOfDay(staminaRatio = 1) {
  const hour = ((worldTimeHours % 24) + 24) % 24;
  const day = hour / 24;

  // Base curve for day brightness (0 at midnight/dawn/dusk, 1 at noon)
  const base = Math.max(0, Math.sin(Math.PI * day)); // 0..1

  // Smooth night transition:
  // - Enter night between 18:00→19:00 (sunset)
  // - Exit night between 06:00→07:00 (sunrise)
  const smooth = (e0, e1, x) => {
    const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };
  const nightEnter = smooth(18, 19, hour);
  const nightExit = 1 - smooth(6, 7, hour);
  const nightStrength = Math.max(nightEnter, nightExit); // 0..1

  // Dim factor applied during night (very dark at full night)
  const nightDim = 0.92;
  const brightness = Math.max(0.01, base * (1 - nightStrength * nightDim));

  const dayColor = new THREE.Color(0xbfd1e5);
  const nightColor = new THREE.Color(0x0b1230);
  let skyColor = nightColor.clone().lerp(dayColor, brightness);

  // Gentle sunrise/sunset warm tint
  const twilightColor = new THREE.Color(0xffa562);
  const twilightSunset = (smooth(17.2, 18.0, hour)) * (1 - smooth(18.0, 19.0, hour));
  const twilightSunrise = (smooth(5.0, 6.0, hour)) * (1 - smooth(6.0, 6.8, hour));
  const twilight = Math.max(twilightSunset, twilightSunrise);
  if (twilight > 0) {
    const tAmt = 0.45 * twilight; // gentle
    skyColor = skyColor.lerp(twilightColor, tAmt);
  }

  // Blend lighting smoothly between day and night presets
  const hemiDay = 0.35 + 0.35 * brightness;
  const hemiNight = 0.05 + 0.10 * brightness;
  hemi.intensity = hemiDay * (1 - nightStrength) + hemiNight * nightStrength;

  const dirDay = 0.60 + 0.60 * brightness;
  const dirNight = 0.08 + 0.25 * brightness;
  dirLight.intensity = dirDay * (1 - nightStrength) + dirNight * nightStrength;

  // Flashlight scales with night strength and stamina
  const sr = Math.max(0, Math.min(1, staminaRatio));
  const flashlightDayIntensity = 0.03;
  const flashlightNightIntensity = 1.6;
  const baseIntensity = flashlightDayIntensity * (1 - nightStrength) + flashlightNightIntensity * nightStrength;
  flashlight.intensity = baseIntensity * (0.15 + 0.85 * sr);
  flashlight.distance = (30 + 70 * nightStrength) * (0.3 + 0.7 * sr);

  scene.background = skyColor;
  if (scene.fog) scene.fog.color = skyColor.clone();
}

// Initialize time-of-day visuals after flashlight exists
applyTimeOfDay(1);

// Ground
export const GROUND_SIZE = 4096;
const groundGeo = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b }); // brown
export const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Update flashlight position and target
export function updateFlashlight() {
  if (!flashlightOn) return;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  if (forward.lengthSq() > 1e-6) forward.normalize(); else forward.set(0, 0, -1);
  const pos = camera.position.clone().addScaledVector(forward, 0.6);
  pos.y -= 0.2;
  flashlight.position.copy(pos);
  flashlightTarget.position.copy(camera.position).addScaledVector(forward, 14);
}