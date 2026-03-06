import THREE from './vendor/three.module.js';
import { scene, GROUND_SIZE, camera } from './core.js';
import { collidesAt } from './collision.js';

export const worldMonsters = [];

// Soft vertical mist/aura texture
function createAuraTexture() {
  const w = 256, h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const g = ctx.createRadialGradient(w * 0.5, h * 0.55, 12, w * 0.5, h * 0.55, Math.max(w, h) * 0.55);
  g.addColorStop(0.0, 'rgba(0,0,0,0.75)');
  g.addColorStop(0.25, 'rgba(20,0,20,0.45)');
  g.addColorStop(0.50, 'rgba(40,0,20,0.18)');
  g.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

// Jagged mouth texture with white teeth and transparent background
function createMouthTexture() {
  const w = 256, h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, w, h);

  // Mouth base (black ellipse)
  ctx.fillStyle = 'black';
  ctx.beginPath();
  if (ctx.ellipse) {
    ctx.ellipse(w * 0.5, h * 0.5, w * 0.45, h * 0.35, 0, 0, Math.PI * 2);
  } else {
    // Fallback: rounded rect
    const rx = w * 0.1, ry = h * 0.1;
    const x = w * 0.05, y = h * 0.15, ww = w * 0.9, hh = h * 0.7;
    ctx.moveTo(x + rx, y);
    ctx.lineTo(x + ww - rx, y);
    ctx.quadraticCurveTo(x + ww, y, x + ww, y + ry);
    ctx.lineTo(x + ww, y + hh - ry);
    ctx.quadraticCurveTo(x + ww, y + hh, x + ww - rx, y + hh);
    ctx.lineTo(x + rx, y + hh);
    ctx.quadraticCurveTo(x, y + hh, x, y + hh - ry);
    ctx.lineTo(x, y + ry);
    ctx.quadraticCurveTo(x, y, x + rx, y);
  }
  ctx.fill();

  // Teeth (top and bottom rows of white triangles)
  ctx.fillStyle = 'white';
  const teethCount = 11;
  for (let i = 0; i < teethCount; i++) {
    const t = (i + 0.5) / teethCount;
    const cx = t * w * 0.8 + w * 0.1;
    const topY = h * 0.34;
    const botY = h * 0.66;
    const width = 10 + Math.random() * 10;
    const len = 18 + Math.random() * 14;

    // Top tooth (pointing downward)
    ctx.beginPath();
    ctx.moveTo(cx - width * 0.5, topY);
    ctx.lineTo(cx + width * 0.5, topY);
    ctx.lineTo(cx, topY + len);
    ctx.closePath();
    ctx.fill();

    // Bottom tooth (pointing upward)
    ctx.beginPath();
    ctx.moveTo(cx - width * 0.5, botY);
    ctx.lineTo(cx + width * 0.5, botY);
    ctx.lineTo(cx, botY - len);
    ctx.closePath();
    ctx.fill();
  }

  // Subtle red tint inner glow
  const g2 = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, Math.max(w, h) * 0.5);
  g2.addColorStop(0, 'rgba(120,0,0,0.12)');
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function createEyeTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);

  // Draw an oval eye shape using clipping
  const cx = size * 0.5;
  const cy = size * 0.5;
  const rx = size * 0.40;
  const ry = size * 0.28;

  ctx.save();
  if (ctx.ellipse) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.clip();
  }

  // Sclera
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, size, size);

  // Iris (radial gradient)
  const irisR = Math.min(rx, ry) * 0.65;
  const irisGrad = ctx.createRadialGradient(cx, cy, irisR * 0.2, cx, cy, irisR);
  irisGrad.addColorStop(0, 'rgba(40,110,180,0.95)');
  irisGrad.addColorStop(0.6, 'rgba(25,75,140,0.95)');
  irisGrad.addColorStop(1, 'rgba(10,30,60,0.95)');
  ctx.fillStyle = irisGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
  ctx.fill();

  // Pupil
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(cx, cy, irisR * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.arc(cx - irisR * 0.28, cy - irisR * 0.28, irisR * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Subtle veins on sclera (outside iris)
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = 'rgba(180,40,40,0.8)';
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2;
    const r0 = irisR + Math.random() * (rx * 0.9 - irisR);
    const r1 = r0 + Math.random() * 14;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

const AURA_TEX = createAuraTexture();
const MOUTH_TEX = createMouthTexture();
const EYE_TEX = createEyeTexture();

// Base chase speed (further reduced)
const MONSTER_WALK_SPEED = 27.5;

// Small helper to smoothly interpolate angles (radians) with wrap-around
function lerpAngle(a, b, t) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

function createCreepyMonster(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // Materials
  const matteBlack = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1.0, metalness: 0.0 });
  const darker = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 1.0, metalness: 0.0 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });

  // Rig that we animate (keeps group fixed in world)
  const rig = new THREE.Object3D();

  // Body (tall, thin)
  const bodyH = 7.5, bodyR = 0.6;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(bodyR * 0.8, bodyR, bodyH, 10), matteBlack);
  body.position.y = bodyH * 0.5;
  body.castShadow = false; body.receiveShadow = false;

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 12), darker);
  head.position.y = bodyH + 0.9;

  // Eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), eyeMat);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), eyeMat);
  eyeL.position.set(-0.22, head.position.y + 0.12, 0.42);
  eyeR.position.set(0.22, head.position.y + 0.12, 0.42);

  // Mouth on the head (billboard plane with jagged teeth texture)
  const mouth = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.9),
    new THREE.MeshBasicMaterial({ map: MOUTH_TEX, transparent: true, depthWrite: false })
  );
  mouth.position.set(0, head.position.y - 0.05, 0.86);

  // Subtle red light near the face
  const faceLight = new THREE.PointLight(0xff2222, 3.2, 24, 2.0);
  faceLight.position.set(0, head.position.y + 0.1, 0.5);
  faceLight.castShadow = false;

  // Anchored arms: pivots attached to the body (shoulders), arm meshes hang from the pivots
  const armLen = 4.2, armR = 0.18;
  const armGeo = new THREE.CylinderGeometry(armR * 0.6, armR, armLen, 8);

  const armLPivot = new THREE.Object3D();
  const armRPivot = new THREE.Object3D();
  const shoulderX = bodyR + 0.25;
  const shoulderY = body.position.y + 1.6;
  armLPivot.position.set(-shoulderX, shoulderY, 0);
  armRPivot.position.set(shoulderX, shoulderY, 0);

  const armLMesh = new THREE.Mesh(armGeo, matteBlack);
  const armRMesh = new THREE.Mesh(armGeo, matteBlack);
  armLMesh.position.y = -armLen * 0.5;
  armRMesh.position.y = -armLen * 0.5;

  armLPivot.add(armLMesh);
  armRPivot.add(armRMesh);

  // Claws parented to arm meshes so they follow flails
  const clawGeo = new THREE.ConeGeometry(0.22, 0.6, 8);
  const clawL = new THREE.Mesh(clawGeo, darker);
  const clawR = new THREE.Mesh(clawGeo, darker);
  clawL.rotation.x = Math.PI;
  clawR.rotation.x = Math.PI;
  clawL.position.set(0, -(armLen * 0.5 + 0.3), 0);
  clawR.position.set(0, -(armLen * 0.5 + 0.3), 0);
  armLMesh.add(clawL);
  armRMesh.add(clawR);

  // Attach arm pivots to the body so they are anchored on the torso
  body.add(armLPivot);
  body.add(armRPivot);

  // Cylindrical placement bookkeeping for mouths and eyes
  const placedSlots = []; // track {y, theta, halfThetaSpan, halfYSpan}
  function angularDistance(a, b) {
    let d = Math.abs(a - b) % (Math.PI * 2);
    return d > Math.PI ? (Math.PI * 2) - d : d;
  }

  // Additional mouths wrapped around the body cylinder at random angles, avoiding overlap
  const extraMouths = [];
  const extraCount = 4 + Math.floor(Math.random() * 4); // 4..7
  const topRadius = bodyR * 0.8;
  const maxAttemptsPerSlot = 80;

  for (let i = 0; i < extraCount; i++) {
    const w = 1.0 + Math.random() * 0.9;
    const h = 0.5 + Math.random() * 0.7;

    let choice = null;
    for (let attempt = 0; attempt < maxAttemptsPerSlot; attempt++) {
      // Height along the torso and local radius there (cylinder slightly tapers)
      const yLocal = -bodyH * 0.2 + Math.random() * (bodyH * 0.5);
      const tY = Math.max(0, Math.min(1, (yLocal + bodyH * 0.5) / bodyH));
      const rAtY = THREE.MathUtils.lerp(bodyR, topRadius, tY);

      // Angle around body
      const theta = Math.random() * Math.PI * 2;

      // Some mouths are rotated significantly (roll), others slightly
      let roll;
      const p = Math.random();
      if (p < 0.35) {
        roll = (Math.random() < 0.5 ? 1 : -1) * Math.PI * 0.5; // ~90°
      } else if (p < 0.55) {
        roll = (Math.random() < 0.5 ? 1 : -1) * Math.PI * 0.25; // ~45°
      } else {
        roll = (Math.random() - 0.5) * 0.4; // subtle
      }

      // Project the rotated plane size to cylindrical coordinates
      const cosr = Math.cos(roll), sinr = Math.sin(roll);
      const tangentialW = Math.abs(cosr) * w + Math.abs(sinr) * h; // along theta
      const verticalH   = Math.abs(cosr) * h + Math.abs(sinr) * w; // along y

      const halfThetaSpan = (tangentialW * 0.5) / (rAtY + 0.03);
      const halfYSpan     = verticalH * 0.5;

      // Overlap test against previously placed slots
      let overlaps = false;
      for (let j = 0; j < placedSlots.length; j++) {
        const pm = placedSlots[j];
        const dy = Math.abs(yLocal - pm.y);
        if (dy >= (halfYSpan + pm.halfYSpan)) continue; // separated vertically

        const dth = angularDistance(theta, pm.theta);
        if (dth < (halfThetaSpan + pm.halfThetaSpan)) { overlaps = true; break; }
      }

      if (!overlaps) {
        choice = { yLocal, rAtY, theta, roll, halfThetaSpan, halfYSpan, w, h };
        placedSlots.push({ y: yLocal, theta, halfThetaSpan, halfYSpan });
        break;
      }
    }

    if (!choice) continue; // give up on this mouth if no space found

    const mMat = new THREE.MeshBasicMaterial({ map: MOUTH_TEX, transparent: true, depthWrite: false });
    const mPlane = new THREE.Mesh(new THREE.PlaneGeometry(choice.w, choice.h), mMat);

    // Slight outward offset to avoid z-fighting with the body
    const outward = 0.03;
    const xLocal = Math.sin(choice.theta) * (choice.rAtY + outward);
    const zLocal = Math.cos(choice.theta) * (choice.rAtY + outward);
    mPlane.position.set(xLocal, choice.yLocal, zLocal);

    // Face outward and apply roll; add tiny random pitch for organic feel
    mPlane.rotation.y = choice.theta;
    mPlane.rotation.x = (Math.random() - 0.5) * 0.2;
    mPlane.rotation.z = choice.roll;

    body.add(mPlane);
    extraMouths.push({ mesh: mPlane, phase: Math.random() * Math.PI * 2, amp: 0.10 + Math.random() * 0.25 });
  }

  // Eyes scattered around the body surface, with random sizes and rotation, avoiding overlap
  const extraEyes = [];
  const eyeCount = 12 + Math.floor(Math.random() * 12); // 12..23
  for (let i = 0; i < eyeCount; i++) {
    const w = 0.55 + Math.random() * 0.9;  // width variance
    const h = 0.4 + Math.random() * 0.7;   // height variance

    let choice = null;
    for (let attempt = 0; attempt < maxAttemptsPerSlot; attempt++) {
      const yLocal = -bodyH * 0.25 + Math.random() * (bodyH * 0.6);
      const tY = Math.max(0, Math.min(1, (yLocal + bodyH * 0.5) / bodyH));
      const rAtY = THREE.MathUtils.lerp(bodyR, topRadius, tY);

      const theta = Math.random() * Math.PI * 2;

      // Roll distribution: many subtle, some pronounced
      let roll;
      const p = Math.random();
      if (p < 0.25) {
        roll = (Math.random() < 0.5 ? 1 : -1) * Math.PI * 0.5;
      } else if (p < 0.5) {
        roll = (Math.random() < 0.5 ? 1 : -1) * Math.PI * 0.33;
      } else {
        roll = (Math.random() - 0.5) * 0.5;
      }

      const cosr = Math.cos(roll), sinr = Math.sin(roll);
      const tangentialW = Math.abs(cosr) * w + Math.abs(sinr) * h;
      const verticalH   = Math.abs(cosr) * h + Math.abs(sinr) * w;

      const halfThetaSpan = (tangentialW * 0.5) / (rAtY + 0.03);
      const halfYSpan     = verticalH * 0.5;

      let overlaps = false;
      for (let j = 0; j < placedSlots.length; j++) {
        const pm = placedSlots[j];
        const dy = Math.abs(yLocal - pm.y);
        if (dy >= (halfYSpan + pm.halfYSpan)) continue;

        const dth = angularDistance(theta, pm.theta);
        if (dth < (halfThetaSpan + pm.halfThetaSpan)) { overlaps = true; break; }
      }

      if (!overlaps) {
        choice = { yLocal, rAtY, theta, roll, halfThetaSpan, halfYSpan, w, h };
        placedSlots.push({ y: yLocal, theta, halfThetaSpan, halfYSpan });
        break;
      }
    }

    if (!choice) continue;

    const eMat = new THREE.MeshBasicMaterial({ map: EYE_TEX, transparent: true, depthWrite: false });
    const ePlane = new THREE.Mesh(new THREE.PlaneGeometry(choice.w, choice.h), eMat);

    const outward = 0.03;
    const xLocal = Math.sin(choice.theta) * (choice.rAtY + outward);
    const zLocal = Math.cos(choice.theta) * (choice.rAtY + outward);
    ePlane.position.set(xLocal, choice.yLocal, zLocal);

    ePlane.rotation.y = choice.theta;
    ePlane.rotation.x = (Math.random() - 0.5) * 0.2;
    ePlane.rotation.z = choice.roll;

    body.add(ePlane);
    extraEyes.push({ mesh: ePlane, phase: Math.random() * Math.PI * 2, amp: 0.04 + Math.random() * 0.06 });
  }

  // Aura planes (two crossed billboards)
  const auraGeo = new THREE.PlaneGeometry(6.5, 10.0);
  const auraMat = new THREE.MeshBasicMaterial({ map: AURA_TEX, transparent: true, depthWrite: false, opacity: 0.55 });
  const aura1 = new THREE.Mesh(auraGeo, auraMat.clone());
  const aura2 = new THREE.Mesh(auraGeo, auraMat.clone());
  aura1.position.y = bodyH * 0.5;
  aura2.position.y = bodyH * 0.5;
  aura1.rotation.y = 0;
  aura2.rotation.y = Math.PI * 0.5;

  // Assemble rig
  rig.add(body, head, eyeL, eyeR, mouth, faceLight, aura1, aura2);
  group.add(rig);
  scene.add(group);

  // Collision/trigger radius
  const triggerRadius = 2.6;

  return {
    group,
    rig,
    x, z,
    r: triggerRadius,
    head,
    mouth,
    extraMouths,
    extraEyes,
    armL: armLPivot,
    armR: armRPivot,
    eyeL,
    eyeR,
    faceLight,
    aura1,
    aura2,
    t: 0,
    lurchT: -1,
    lurchDur: 0.8,
    lurchCooldown: 0.5,
    // Movement/collision
    colR: 1.0,
    yaw: 0,
    // Stuck detection
    stuckTime: 0,
    _lastX: x,
    _lastZ: z,
    // Wild flail state
    armLFlailCur: new THREE.Vector3(0, 0, 0),
    armLFlailTgt: new THREE.Vector3(0, 0, 0),
    armLFlailTimer: 0.1,
    armRFlailCur: new THREE.Vector3(0, 0, 0),
    armRFlailTgt: new THREE.Vector3(0, 0, 0),
    armRFlailTimer: 0.1,
  };
}

export function spawnMonster() {
  // Try to place far from the player (around 800 units from center)
  const BORDER = 120;
  const minR = 760;
  const maxR = 840;

  for (let attempts = 0; attempts < 500; attempts++) {
    const ang = Math.random() * Math.PI * 2;
    const rad = minR + Math.random() * (maxR - minR);
    const x = Math.cos(ang) * rad;
    const z = Math.sin(ang) * rad;

    if (Math.abs(x) > (GROUND_SIZE * 0.5 - BORDER)) continue;
    if (Math.abs(z) > (GROUND_SIZE * 0.5 - BORDER)) continue;

    if (collidesAt(x, z, 2.8)) continue;

    const m = createCreepyMonster(x, z);
    worldMonsters.push(m);
    return m;
  }

  // Fallback
  const m = createCreepyMonster(45, 0);
  worldMonsters.push(m);
  return m;
}

// Move all monsters to a position far from the player's current location
export function resetMonstersFarFromPlayer(minR = 760, maxR = 840) {
  const BORDER = 120;
  const half = GROUND_SIZE * 0.5 - BORDER;
  const px = camera.position.x;
  const pz = camera.position.z;

  for (let i = 0; i < worldMonsters.length; i++) {
    const m = worldMonsters[i];
    if (!m || !m.group) continue;

    let placed = false;
    for (let attempts = 0; attempts < 600; attempts++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = minR + Math.random() * (maxR - minR);
      const x = px + Math.cos(ang) * rad;
      const z = pz + Math.sin(ang) * rad;

      if (Math.abs(x) > half) continue;
      if (Math.abs(z) > half) continue;
      if (collidesAt(x, z, 2.8)) continue;

      m.x = x; m.z = z;
      m.group.position.x = x;
      m.group.position.z = z;
      // reset stuck tracking
      m._lastX = x; m._lastZ = z; m.stuckTime = 0;
      placed = true;
      break;
    }

    // If we couldn't find a valid far position, keep current but ensure in-bounds
    if (!placed) {
      m.x = Math.max(-half, Math.min(half, m.x));
      m.z = Math.max(-half, Math.min(half, m.z));
      m.group.position.x = m.x;
      m.group.position.z = m.z;
      m._lastX = m.x; m._lastZ = m.z; m.stuckTime = 0;
    }
  }
}

// Relocate a single monster far from the player, similar to resetMonstersFarFromPlayer but for one.
export function relocateMonsterFarFromPlayer(m, minR = 760, maxR = 840) {
  if (!m || !m.group) return;
  const BORDER = 120;
  const half = GROUND_SIZE * 0.5 - BORDER;
  const px = camera.position.x;
  const pz = camera.position.z;

  let placed = false;
  for (let attempts = 0; attempts < 600; attempts++) {
    const ang = Math.random() * Math.PI * 2;
    const rad = minR + Math.random() * (maxR - minR);
    const x = px + Math.cos(ang) * rad;
    const z = pz + Math.sin(ang) * rad;

    if (Math.abs(x) > half) continue;
    if (Math.abs(z) > half) continue;
    if (collidesAt(x, z, 2.8)) continue;

    m.x = x; m.z = z;
    m.group.position.x = x;
    m.group.position.z = z;
    m._lastX = x; m._lastZ = z;
    m.stuckTime = 0;
    placed = true;
    break;
  }

  if (!placed) {
    m.x = Math.max(-half, Math.min(half, m.x));
    m.z = Math.max(-half, Math.min(half, m.z));
    m.group.position.x = m.x;
    m.group.position.z = m.z;
    m._lastX = m.x; m._lastZ = m.z;
    m.stuckTime = 0;
  }
}

function rand(a, b) { return a + Math.random() * (b - a); }

export function updateMonsters(delta) {
  for (let i = 0; i < worldMonsters.length; i++) {
    const m = worldMonsters[i];
    if (!m || !m.group) continue;
    m.t += delta;

    // CHASE: move toward the player at walking speed with simple obstacle steering
    {
      const px = camera.position.x;
      const pz = camera.position.z;

      let toX = px - m.x;
      let toZ = pz - m.z;
      const d = Math.hypot(toX, toZ);

      if (d > 1e-3) {
        // Distance-based ramp: slower when closer to the player
        let speed = MONSTER_WALK_SPEED;
        const tNorm = Math.max(0, Math.min(1, d / 250)); // 0 at contact, 1 at 250+ units
        const smooth = tNorm * tNorm * (3 - 2 * tNorm);  // smoothstep
        const distFactor = 0.25 + 0.75 * smooth;         // 0.25x near, 1x far
        speed *= distFactor;
        const step = speed * delta;

        // Desired normalized direction
        let dirX = toX / d;
        let dirZ = toZ / d;

        // Try straight step
        const tryStep = (angOffsetRad) => {
          const baseAng = Math.atan2(dirX, dirZ);
          const ang = baseAng + angOffsetRad;
          const s = Math.sin(ang), c = Math.cos(ang);
          const candX = m.x + s * step;
          const candZ = m.z + c * step;
          if (!collidesAt(candX, candZ, m.colR || 1.0)) {
            m.x = candX; m.z = candZ;
            m.group.position.x = m.x;
            m.group.position.z = m.z;
            // Face where we actually moved
            const targetYaw = Math.atan2(s, c);
            m.yaw = lerpAngle(m.yaw || targetYaw, targetYaw, Math.min(1, delta * 8));
            m.group.rotation.y = m.yaw;
            return true;
          }
          return false;
        };

        // First, try direct
        if (!tryStep(0)) {
          // Scan alternative angles to slide around obstacles
          const deg = [15, -15, 30, -30, 45, -45, 60, -60, 90, -90, 120, -120, 150, -150, 180];
          for (let k = 0; k < deg.length; k++) {
            if (tryStep(deg[k] * Math.PI / 180)) break;
          }
        }

        // Clamp within ground
        const half = GROUND_SIZE * 0.5 - 5;
        if (m.x < -half) m.x = -half;
        if (m.x > half) m.x = half;
        if (m.z < -half) m.z = -half;
        if (m.z > half) m.z = half;
        m.group.position.x = m.x;
        m.group.position.z = m.z;
      }
    }

    // Stuck detection: if position hasn't changed meaningfully for 5s, relocate far from player
    {
      const lastX = (m._lastX == null ? m.x : m._lastX);
      const lastZ = (m._lastZ == null ? m.z : m._lastZ);
      const moved = Math.hypot(m.x - lastX, m.z - lastZ);
      if (moved < 0.02) {
        m.stuckTime = (m.stuckTime || 0) + delta;
      } else {
        m.stuckTime = 0;
      }
      m._lastX = m.x;
      m._lastZ = m.z;
      if ((m.stuckTime || 0) >= 5.0) {
        relocateMonsterFarFromPlayer(m);
        m.stuckTime = 0;
      }
    }

    // Idle sway (breath) and tiny vertical bob
    const swayX = 0.07 * Math.sin(m.t * 0.9 + i);
    const swayZ = 0.04 * Math.sin(m.t * 1.13 + i * 0.37);
    const bobY = 0.05 * Math.sin(m.t * 2.1 + i * 0.5);
    if (m.rig) {
      m.rig.rotation.x = swayX;
      m.rig.rotation.z = swayZ;
      m.rig.position.y = bobY;
    }

    // Occasional lurch (kept in-place: rotation and slight crouch)
    if (m.lurchT < 0) {
      m.lurchCooldown -= delta;
      if (m.lurchCooldown <= 0) {
        m.lurchT = 0;
        m.lurchDur = 0.65 + Math.random() * 0.5;
        m.lurchCooldown = 1.8 + Math.random() * 2.6;
      }
    } else {
      m.lurchT += delta / m.lurchDur;
      if (m.lurchT >= 1) {
        m.lurchT = -1;
      }
    }

    let lurch = 0;
    if (m.lurchT >= 0) {
      const t = m.lurchT;
      if (t < 0.28) {
        lurch = t / 0.28; // fast ramp up
      } else {
        lurch = Math.max(0, 1 - (t - 0.28) / 0.72) * 0.65; // slower decay
      }
    }

    if (m.rig) {
      const addLean = -0.40 * lurch;
      const addTwist = 0.15 * Math.sin(m.t * 8.0 + i) * lurch;
      m.rig.rotation.x += addLean;
      m.rig.rotation.y = 0.06 * Math.sin(m.t * 0.7 + i * 0.21) + addTwist;
      m.rig.position.y += 0.06 * lurch;
    }

    // Head jitter
    if (m.head) {
      m.head.rotation.y = 0.12 * Math.sin(m.t * 12.0 + i) + 0.08 * (Math.random() - 0.5) * lurch;
      m.head.rotation.z = 0.06 * Math.sin(m.t * 10.0 + i * 0.4);
    }

    // Wild, random arm flailing (apply to pivots anchored on the body)
    m.armLFlailTimer -= delta;
    m.armRFlailTimer -= delta;
    if (m.armLFlailTimer <= 0) {
      m.armLFlailTimer = rand(0.05, 0.18);
      m.armLFlailTgt.set(
        rand(-1.9, 1.9),  // x (pitch)
        rand(-1.2, 1.2),  // y (twist)
        rand(-2.2, 2.2),  // z (swing)
      );
    }
    if (m.armRFlailTimer <= 0) {
      m.armRFlailTimer = rand(0.05, 0.18);
      m.armRFlailTgt.set(
        rand(-1.9, 1.9),
        rand(-1.2, 1.2),
        rand(-2.2, 2.2),
      );
    }
    const k = Math.min(1, delta * 18);
    m.armLFlailCur.lerp(m.armLFlailTgt, k);
    m.armRFlailCur.lerp(m.armRFlailTgt, k);

    // Base arm pose + lurch-driven raise
    const baseXL = 0.12 * Math.sin(m.t * 1.7 + i) + 0.35 * lurch;
    const baseZL = 0.35 + 0.05 * Math.sin(m.t * 2.1 + i * 0.5);
    const baseXR = -0.12 * Math.sin(m.t * 1.65 + i * 0.7) + 0.35 * lurch;
    const baseZR = -0.35 - 0.05 * Math.sin(m.t * 2.05 + i * 0.4);

    if (m.armL) {
      m.armL.rotation.x = baseXL + m.armLFlailCur.x;
      m.armL.rotation.y = m.armLFlailCur.y;
      m.armL.rotation.z = baseZL + m.armLFlailCur.z;
    }
    if (m.armR) {
      m.armR.rotation.x = baseXR + m.armRFlailCur.x;
      m.armR.rotation.y = m.armRFlailCur.y;
      m.armR.rotation.z = baseZR + m.armRFlailCur.z;
    }

    // Flicker the face light and eyes
    const s1 = Math.sin(m.t * 9.7 + i * 1.3);
    const s2 = Math.sin(m.t * 14.9 + i * 0.7);
    const noise = (s1 + s2) * 0.5 + (Math.random() - 0.5) * 0.12;
    const flick = Math.max(0.5, 1.0 + 0.35 * noise + 0.4 * lurch);

    if (m.faceLight) m.faceLight.intensity = 3.0 * flick + 0.6;
    if (m.eyeL) m.eyeL.scale.setScalar(1 + 0.25 * (flick - 1));
    if (m.eyeR) m.eyeR.scale.setScalar(1 + 0.25 * (flick - 1));

    // Mouth: pulsing/chattering with lurch
    if (m.mouth) {
      const chatter = 1 + 0.15 * Math.sin(m.t * 16.0 + i * 0.8) + 0.35 * lurch;
      m.mouth.scale.set(1, Math.max(0.8, chatter), 1);
      m.mouth.rotation.z = 0.02 * Math.sin(m.t * 7.3 + i);
    }

    // Extra body mouths chatter too
    if (m.extraMouths && m.extraMouths.length) {
      for (let j = 0; j < m.extraMouths.length; j++) {
        const em = m.extraMouths[j];
        if (!em || !em.mesh) continue;
        const sY = 1 + em.amp * (0.5 + 0.5 * Math.sin(m.t * 14.0 + em.phase)) + 0.25 * lurch;
        em.mesh.scale.y = Math.max(0.7, sY);
      }
    }

    // Body eyes: subtle pulsing (like pupil dilation) with lurch influence
    if (m.extraEyes && m.extraEyes.length) {
      for (let j = 0; j < m.extraEyes.length; j++) {
        const ee = m.extraEyes[j];
        if (!ee || !ee.mesh) continue;
        const sY = 1 + ee.amp * (0.5 + 0.5 * Math.sin(m.t * 9.5 + ee.phase)) + 0.15 * lurch;
        ee.mesh.scale.y = Math.max(0.8, sY);
      }
    }

    // Aura pulsing
    const auraAlpha = 0.45 + 0.25 * Math.max(0, Math.sin(m.t * 1.8 + i)) + 0.15 * lurch;
    if (m.aura1 && m.aura1.material) m.aura1.material.opacity = Math.min(0.9, auraAlpha);
    if (m.aura2 && m.aura2.material) m.aura2.material.opacity = Math.min(0.9, auraAlpha);
  }
}