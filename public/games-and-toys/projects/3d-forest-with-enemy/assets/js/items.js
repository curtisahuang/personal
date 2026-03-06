import THREE from './vendor/three.module.js';
import { scene, GROUND_SIZE } from './core.js';
import { collidesAt } from './collision.js';
import { inventory, addInventoryItem, updateInventoryUI, showPickupMessage, getInventoryVisible } from './ui.js';

export const TREASURE_POOL = {
  common: [
    'Ancient Coin','Worn Copper Ring','Traveler\'s Charm','Forest Token','Rusty Key',
    'Old Dice','Weathered Locket','Simple Gem Shard','Woodland Rune','Faded Map Scrap'
  ],
  uncommon: [
    'Silver Leaf','Moonlit Feather','Glowing Sap','Polished Bone Comb','Amber Pendant',
    'Carved Totem','Singing Stone','Misty Pearl','Twilight Brooch'
  ],
  rare: [
    'Frostglass Gem','Starlit Opal','Sunforged Ingot','Spiritbound Bracelet',
    'River King\'s Seal','Shadow Quartz','Elderwood Circlet'
  ],
  superRare: [
    'Phoenix Teardrop','Sylvan Crown','Runebound Grimoire','Aether Prism',
    'Dragonheart Knot','Aurora Crystal'
  ],
  legendary: [
    'Golden shimmering dragon scale','Holy Crown of Altrusias','Heart of the Everflame',
    'Worldroot Seed','Chronicle of the First Dawn','Blade of Whispering Winds'
  ]
};

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function sampleRarity() {
  const r = Math.random();
  if (r < 0.60) return 'common';
  if (r < 0.85) return 'uncommon';
  if (r < 0.95) return 'rare';
  if (r < 0.99) return 'superRare';
  return 'legendary';
}

export const INTERACT_DISTANCE = 5.5;
export const worldBoxes = [];

export function createTreasureBox(x, z) {
  const chest = new THREE.Group();

  const width = 2.0, depth = 1.75;
  const baseH = 1.0, lidH = 0.6;

  const baseGeo = new THREE.BoxGeometry(width, baseH, depth);
  const lidGeo = new THREE.BoxGeometry(width, lidH, depth);

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.95, metalness: 0.0 });
  const lidMat  = new THREE.MeshStandardMaterial({ color: 0xa9703a, roughness: 0.92, metalness: 0.0 });

  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.set(0, baseH * 0.5, 0);
  base.castShadow = true;
  base.receiveShadow = true;

  const lidPivot = new THREE.Object3D();
  lidPivot.position.set(0, baseH, -depth * 0.5);

  const lid = new THREE.Mesh(lidGeo, lidMat);
  lid.position.set(0, lidH * 0.5, depth * 0.5);
  lid.castShadow = true;
  lid.receiveShadow = true;

  lidPivot.add(lid);
  chest.add(base);
  chest.add(lidPivot);

  chest.position.set(x, 0, z);

  scene.add(chest);

  const addMoney = 2 + Math.floor(Math.random() * 5);
  const rarity = sampleRarity();
  const name = randomFrom(TREASURE_POOL[rarity]);
  const lootItems = [{ name, rarity, count: 1 }];

  worldBoxes.push({
    type: 'box',
    group: chest,
    lidPivot,
    x, z,
    r: Math.max(width, depth) * 0.6,
    opened: false,
    opening: false,
    animT: 0,
    animDur: 0.45,
    lootMoney: addMoney,
    lootItems,
  });
}

export function spawnTreasureBoxes(countBoxes = 250) {
  const BORDER = 120;
  const minRadiusFromCenter = 16;

  for (let i = 0; i < countBoxes; i++) {
    for (let attempts = 0; attempts < 400; attempts++) {
      const x = (Math.random() - 0.5) * (GROUND_SIZE - BORDER);
      const z = (Math.random() - 0.5) * (GROUND_SIZE - BORDER);
      if (Math.hypot(x, z) < minRadiusFromCenter) continue;
      const r = 1.3;
      if (collidesAt(x, z, r)) continue;
      createTreasureBox(x, z);
      break;
    }
  }
}

export function spawnItems(countBoxes = 80) {
  spawnTreasureBoxes(countBoxes);
}

export function updateBoxesAnimation(delta) {
  for (let i = 0; i < worldBoxes.length; i++) {
    const b = worldBoxes[i];
    if (!b) continue;
    if (b.opening && !b.opened) {
      b.animT = Math.min(1, b.animT + delta / b.animDur);
      const t = 1 - Math.pow(1 - b.animT, 3);
      const angle = -t * (Math.PI * 0.85);
      b.lidPivot.rotation.x = angle;

      if (b.animT >= 1) {
        b.opened = true;
        b.opening = false;
        setTimeout(() => {
          if (b.group && b.group.parent) b.group.parent.remove(b.group);
        }, 400);
      }
    }
  }
}

export function openBox(b) {
  if (!b || b.opened || b.opening) return;
  b.opening = true;

  inventory.money += b.lootMoney;
  const items = b.lootItems || [];
  const label = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', superRare: 'Super Rare', legendary: 'Legendary' };
  const order = { legendary: 5, superRare: 4, rare: 3, uncommon: 2, common: 1 };

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    inventory.treasures[it.rarity] = (inventory.treasures[it.rarity] || 0) + it.count;
    addInventoryItem(it.name, it.rarity, it.count);
  }

  const parts = [`+${b.lootMoney} 💰`];
  items.sort((a, c) => order[c.rarity] - order[a.rarity]);
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    parts.push(`+${it.count} ${label[it.rarity]} ${it.name}`);
  }

  showPickupMessage(`Opened 🎁 ${parts.join(' ')}`);
  if (getInventoryVisible()) updateInventoryUI();
}