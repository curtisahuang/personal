export const ENEMY_TYPES = {
  slime: {
    id: 'slime',
    name: 'Slime',
    stats: { maxHp: 12, atk: 3, def: 3, spe: 5, luc: 3 },
    rewards: { xp: 10, gold: 10 },
    sprite: { image: 'assets/images/battle/SlimeA.png', frames: 16, frameW: 16, scale: 8, loopMs: 4000, pauseMs: 3000, animated: true }
  },
  toughSlime: {
    id: 'toughSlime',
    name: 'Tough Slime',
    stats: { maxHp: 12, atk: 3, def: 6, spe: 5, luc: 3 },
    rewards: { xp: 15, gold: 15 },
    sprite: { image: 'assets/images/battle/SlimeA.png', frames: 16, frameW: 16, scale: 8, loopMs: 4000, pauseMs: 3000, animated: true, filter: 'hue-rotate(90deg)' }
  },
  bat: {
    id: 'bat',
    name: 'Bat',
    stats: { maxHp: 8, atk: 2, def: 2, spe: 9, luc: 14 },
    rewards: { xp: 5, gold: 3 },
    sprite: { image: 'assets/images/battle/bat.png', frames: 1, frameW: 16, scale: 9, animated: false }
  },
  zombie: {
    id: 'zombie',
    name: 'Zombie',
    stats: { maxHp: 10, atk: 4, def: 8, spe: 2, luc: 2 },
    rewards: { xp: 15, gold: 8 },
    sprite: { image: 'assets/images/battle/zombie.png', frames: 1, frameW: 16, scale: 11, animated: false }
  },
  thief: {
    id: 'thief',
    name: 'Thief',
    stats: { maxHp: 8, atk: 7, def: 2, spe: 11, luc: 1 },
    rewards: { xp: 12, gold: 30 },
    sprite: { image: 'assets/images/battle/thief.png', frames: 1, frameW: 16, scale: 9, animated: false }
  },
  soldier: {
    id: 'soldier',
    name: 'Soldier',
    stats: { maxHp: 14, atk: 7, def: 7, spe: 1, luc: 1 },
    rewards: { xp: 15, gold: 19 },
    sprite: { image: 'assets/images/battle/soldier.png', frames: 1, frameW: 16, scale: 12, animated: false }
  },
  orc: {
    id: 'orc',
    name: 'Orc',
    stats: { maxHp: 18, atk: 5, def: 2, spe: 2, luc: 2 },
    rewards: { xp: 20, gold: 15 },
    sprite: { image: 'assets/images/battle/orc.png', frames: 1, frameW: 16, scale: 13, animated: false }
  },
  dragon: {
    id: 'dragon',
    name: 'Dragon',
    stats: { maxHp: 30, atk: 10, def: 5, spe: 6, luc: 6 },
    rewards: { xp: 50, gold: 100 },
    sprite: { image: 'assets/images/battle/dragon.png', frames: 1, frameW: 16, scale: 14, animated: false }
  },
  demonBat: {
    id: 'demonBat',
    name: 'Demon Bat',
    stats: { maxHp: 11, atk: 4, def: 3, spe: 12, luc: 18 },
    rewards: { xp: 10, gold: 7 },
    sprite: { image: 'assets/images/battle/bat.png', frames: 1, frameW: 16, scale: 10, animated: false, filter: 'hue-rotate(90deg)' }
  },
  cursedZombie: {
    id: 'cursedZombie',
    name: 'Cursed Zombie',
    stats: { maxHp: 16, atk: 6, def: 11, spe: 3, luc: 2 },
    rewards: { xp: 25, gold: 14 },
    sprite: { image: 'assets/images/battle/zombie.png', frames: 1, frameW: 16, scale: 12, animated: false, filter: 'hue-rotate(90deg)' }
  },
  corruptedSoldier: {
    id: 'corruptedSoldier',
    name: 'Corrupted Soldier',
    stats: { maxHp: 18, atk: 10, def: 10, spe: 2, luc: 1 },
    rewards: { xp: 25, gold: 30 },
    sprite: { image: 'assets/images/battle/soldier.png', frames: 1, frameW: 16, scale: 13, animated: false, filter: 'hue-rotate(90deg)' }
  },
  dextrousThief: {
    id: 'dextrousThief',
    name: 'Dextrous Thief',
    stats: { maxHp: 10, atk: 10, def: 3, spe: 14, luc: 2 },
    rewards: { xp: 20, gold: 60 },
    sprite: { image: 'assets/images/battle/thief.png', frames: 1, frameW: 16, scale: 10, animated: false, filter: 'hue-rotate(90deg)' }
  },
  orcChampion: {
    id: 'orcChampion',
    name: 'Orc Champion',
    stats: { maxHp: 24, atk: 8, def: 4, spe: 3, luc: 2 },
    rewards: { xp: 35, gold: 25 },
    sprite: { image: 'assets/images/battle/orc.png', frames: 1, frameW: 16, scale: 14, animated: false, filter: 'hue-rotate(90deg)' }
  },
  apocalypticDragon: {
    id: 'apocalypticDragon',
    name: 'Apocalyptic Dragon',
    stats: { maxHp: 48, atk: 18, def: 9, spe: 7, luc: 7 },
    rewards: { xp: 100, gold: 250 },
    sprite: { image: 'assets/images/battle/dragon.png', frames: 1, frameW: 16, scale: 16, animated: false, filter: 'hue-rotate(90deg)' }
  },
  necromancer: {
    id: 'necromancer',
    name: 'Necromancer',
    // VERY high stats all around
    stats: { maxHp: 120, atk: 26, def: 22, spe: 18, luc: 22 },
    rewards: { xp: 500, gold: 1000 },
    // No dedicated sprite provided; use placeholder with a distinct tint
    sprite: { placeholder: true, frames: 1, frameW: 16, scale: 16, animated: false, filter: 'grayscale(0.2) hue-rotate(250deg) saturate(1.4)' }
  }
};

export const ENCOUNTER_TABLE = [
  { id: 'slime', weight: 0.30 },
  { id: 'bat', weight: 0.20 },
  { id: 'zombie', weight: 0.15 },
  { id: 'thief', weight: 0.10 },
  { id: 'soldier', weight: 0.10 },
  { id: 'orc', weight: 0.10 },
  { id: 'dragon', weight: 0.05 },
];

export const VARIANT_MAP = {
  slime: 'toughSlime',
  bat: 'demonBat',
  zombie: 'cursedZombie',
  soldier: 'corruptedSoldier',
  thief: 'dextrousThief',
  orc: 'orcChampion',
  dragon: 'apocalypticDragon',
};

export const VARIANT_CHANCE = 0.10;

export const ITEM_DEFS = {
  // Healing
  potion: { id: 'potion', name: 'Potion', desc: 'Heals 10 HP', type: 'heal', amount: 10 },
  blessed_potion: { id: 'blessed_potion', name: 'Blessed Potion', desc: 'Heals 20 HP', type: 'heal', amount: 20 },
  heavenly_potion: { id: 'heavenly_potion', name: 'Heavenly Potion', desc: 'Fully restores HP', type: 'fullheal' },

  // Temporary combat buffs (can push stats over caps; decay by 1 each turn)
  kaelith_brand: { id: 'kaelith_brand', name: "Kaelith's Brand", desc: '+6 ATK, decays by 1 each turn', type: 'buff', stat: 'atk', start: 6, decay: 1, value: 20 },
  orun_bulwark: { id: 'orun_bulwark', name: "Orun's Bulwark", desc: '+6 DEF, decays by 1 each turn', type: 'buff', stat: 'def', start: 6, decay: 1, value: 20 },
  zephryl_striders: { id: 'zephryl_striders', name: "Zephryl's Striders", desc: '+6 SPE, decays by 1 each turn', type: 'buff', stat: 'spe', start: 6, decay: 1, value: 20 },
  nymera_charm: { id: 'nymera_charm', name: "Nymera's Charm", desc: '+6 LUC, decays by 1 each turn', type: 'buff', stat: 'luc', start: 6, decay: 1, value: 20 },

  // Multi-battle reward boosters
  thalor_tithe: { id: 'thalor_tithe', name: "Thalor's Tithe", desc: 'For 3 battles, doubles Gold earned', type: 'reward', reward: 'gold', multiplier: 2, battles: 3, value: 20 },
  aevyn_insight: { id: 'aevyn_insight', name: "Aevyn's Insight", desc: 'For 3 battles, doubles EXP earned', type: 'reward', reward: 'xp', multiplier: 2, battles: 3, value: 20 },
};

export const EQUIPMENT_DEFS = {
  // Weapons
  iron_sword: { id: 'iron_sword', name: 'Iron Sword', slot: 'weapon', desc: 'A trusty blade. ATK +2', mods: { atk: 2 } },
  steel_blade: { id: 'steel_blade', name: 'Steel Blade', slot: 'weapon', desc: 'Hefty, but powerful. ATK +4, SPE -2', mods: { atk: 4, spe: -2 } },
  assassins_blade: { id: 'assassins_blade', name: "Assassin's Blade", slot: 'weapon', desc: 'Swift and silent. ATK +1, SPE +6', mods: { atk: 1, spe: 6 } },
  blood_sword: { id: 'blood_sword', name: 'Bloodsword', slot: 'weapon', desc: 'Heals 50% of damage dealt', mods: { } },
  cursed_sword: { id: 'cursed_sword', name: 'Cursed Sword', slot: 'weapon', desc: 'ATK +6; 10% chance to deal 5 HP damage to self on attack', mods: { atk: 6 } },
  silver_sword: { id: 'silver_sword', name: 'Silver Sword', slot: 'weapon', desc: 'ATK +6', mods: { atk: 6 } },
  golden_sword: { id: 'golden_sword', name: 'Golden Sword', slot: 'weapon', desc: '10% chance to gain Gold equal to your ATK on attack', mods: { } },
  sword_revealing_light: { id: 'sword_revealing_light', name: 'Sword of Revealing Light', slot: 'weapon', desc: '+5 to all stats; Deals double damage to the Necromancer', mods: { atk: 5, def: 5, spe: 5, luc: 5 } },

  // Armor
  iron_plate: { id: 'iron_plate', name: 'Iron Plate', slot: 'armor', desc: 'DEF +2', mods: { def: 2 } },
  steel_armor: { id: 'steel_armor', name: 'Steel Armor', slot: 'armor', desc: 'DEF +6, SPE -4', mods: { def: 6, spe: -4 } },
  assassins_cloak: { id: 'assassins_cloak', name: "Assassin's Cloak", slot: 'armor', desc: 'DEF -1, SPE +6', mods: { def: -1, spe: 6 } },
  gamblers_cape: { id: 'gamblers_cape', name: "Gambler's Cape", slot: 'armor', desc: 'DEF -2, LUC +20', mods: { def: -2, luc: 20 } },
  cloak_heavenly_thunder: { id: 'cloak_heavenly_thunder', name: 'Cloak of Heavenly Thunder', slot: 'armor', desc: 'DEF +10, +20% critical rate', mods: { def: 10 }, critBonusPct: 20 },

  // Accessories
  thunder_ring: { id: 'thunder_ring', name: 'Thunder Ring', slot: 'accessory', desc: '+10% critical rate', mods: { }, critBonusPct: 10, value: 50 },
  wind_scarf: { id: 'wind_scarf', name: 'Wind Scarf', slot: 'accessory', desc: '+10% dodge rate', mods: { }, dodgeBonusPct: 10, value: 50 },
  greed_ring: { id: 'greed_ring', name: 'Greed Ring', slot: 'accessory', desc: '+100% Gold from battle, DEF -5', mods: { def: -5 }, goldMult: 2, value: 100 },
  cowards_shield: { id: 'cowards_shield', name: "Coward's Shield", slot: 'accessory', desc: '-50% EXP gained, take half damage', mods: { }, xpMult: 0.5, dmgTakenMult: 0.5, value: 100 },
  thunder_god_amulet: { id: 'thunder_god_amulet', name: "Vaelor's Amulet", slot: 'accessory', desc: '+20% critical rate', mods: { }, critBonusPct: 20, value: 200 },

  // Special find: grants dodge and mountain-walk when equipped
  boots_divine_wind: { id: 'boots_divine_wind', name: 'Boots of Divine Wind', slot: 'accessory', desc: '+20% dodge; Walk on mountains while equipped', mods: { }, dodgeBonusPct: 20, canWalkMountains: true },

  
};

// Default vendor inventories and prices
export const SHOP_INVENTORY = {
  potion: { id: 'potion', price: 10, stock: 5 },
  blessed_potion: { id: 'blessed_potion', price: 25, stock: 5 },
  heavenly_potion: { id: 'heavenly_potion', price: 40, stock: 5 },
};

export const SMITH_INVENTORY = {
  steel_blade: { id: 'steel_blade', price: 30, stock: 1 },
  assassins_blade: { id: 'assassins_blade', price: 40, stock: 1 },
  blood_sword: { id: 'blood_sword', price: 50, stock: 1 },
  cursed_sword: { id: 'cursed_sword', price: 25, stock: 1 },
  silver_sword: { id: 'silver_sword', price: 100, stock: 1 },
  golden_sword: { id: 'golden_sword', price: 50, stock: 1 },

  iron_plate: { id: 'iron_plate', price: 25, stock: 1 },
  steel_armor: { id: 'steel_armor', price: 45, stock: 1 },
  assassins_cloak: { id: 'assassins_cloak', price: 40, stock: 1 },
  gamblers_cape: { id: 'gamblers_cape', price: 50, stock: 1 },
};

export const DIVINE_ITEM_IDS = [
  'kaelith_brand',
  'orun_bulwark',
  'zephryl_striders',
  'nymera_charm',
  'thalor_tithe',
  'aevyn_insight',
];

export const TEMPLE_RIDDLES = [
  "Priestess: Six keep watch—Kaelith, Orun, Zephryl, Nymera, Thalor, Aevyn.\nPriestess: Each asks a different price.\nPriestess: Bring an honest tithe.\nPriestess: Listen between the bells.\nPriestess: Leave lighter, not less.",
  "Priestess: Orun teaches slow fire.\nPriestess: Haste bends; patience holds.\nPriestess: Count the shape, not the sparks.\nPriestess: Give what you can.\nPriestess: Keep what keeps you.",
  "Priestess: Zephryl changes the map, not the journey.\nPriestess: Chase the wind and you tire.\nPriestess: Walk with it and you arrive.\nPriestess: Step light.\nPriestess: Step true.",
  "Priestess: Nymera laughs at locked doors.\nPriestess: A coin turned twice is a mirror.\nPriestess: Look once for chance.\nPriestess: Twice for choice.\nPriestess: Then knock.",
  "Priestess: Thalor trades in currents.\nPriestess: Give and the tide remembers.\nPriestess: Hoard and it forgets.\nPriestess: Count moons, not coins.\nPriestess: Fortune moves.",
  "Priestess: Kaelith is a whisper after the shout.\nPriestess: Hold the will, not the rage.\nPriestess: Strike when the shadow is shortest.\nPriestess: Hold when breath is longest.\nPriestess: Victory is quiet.",
  "Priestess: Aevyn names the dawn.\nPriestess: Learn, then lift.\nPriestess: Fail, then begin.\nPriestess: Carry only what teaches.\nPriestess: The rest sets itself down."
];

// Riddle-like lore per god for Temple "Learn" option
export const GOD_LORE = {
  kaelith: {
    id: 'kaelith',
    name: 'Kaelith',
    text:
      "Priestess: Hear the ember after the blaze.\n" +
      "Priestess: He binds iron and men with the same heat.\n" +
      "Priestess: Oaths cool to truth when quenched in him.\n" +
      "Priestess: Speak softly; steel listens."
  },
  orun: {
    id: 'orun',
    name: 'Orun',
    text:
      "Priestess: The mountain breathes slow.\n" +
      "Priestess: He teaches fire to remember stone.\n" +
      "Priestess: Strike less; hold longer.\n" +
      "Priestess: The ore knows its own name."
  },
  zephryl: {
    id: 'zephryl',
    name: 'Zephryl',
    text:
      "Priestess: Roads move when he laughs.\n" +
      "Priestess: Maps tell the truth on the second reading.\n" +
      "Priestess: Follow the lighter footprint.\n" +
      "Priestess: Chase the wind and it hides behind you."
  },
  nymera: {
    id: 'nymera',
    name: 'Nymera',
    text:
      "Priestess: Two flips, one door.\n" +
      "Priestess: Luck is a key that chooses its lock.\n" +
      "Priestess: Knock when the coin refuses to land.\n" +
      "Priestess: She smiles at honest hands."
  },
  thalor: {
    id: 'thalor',
    name: 'Thalor',
    text:
      "Priestess: The tide counts debts in moons.\n" +
      "Priestess: Give and the current remembers your weight.\n" +
      "Priestess: Hoard and you dry on the sand.\n" +
      "Priestess: He buys storms with stories."
  },
  aevyn: {
    id: 'aevyn',
    name: 'Aevyn',
    text:
      "Priestess: Dawn writes small and clear.\n" +
      "Priestess: Fail, then begin; he saves the first light for you.\n" +
      "Priestess: Lessons walk before they speak.\n" +
      "Priestess: Carry only what teaches."
  },
  vaelor: {
    id: 'vaelor',
    name: 'Vaelor',
    text:
      "Priestess: Thunder counts courage by echoes.\n" +
      "Priestess: He drinks the cloud and spits spears.\n" +
      "Priestess: Stand still until your fear blinks.\n" +
      "Priestess: Then move as if lightning remembered you."
  }
};

export const SHOP_TALKS = [
  "Shopkeeper: Welcome back, {name}.\nShopkeeper: If you're gearing for a long road, say the word and I'll set aside what you need, from rations to spare flint.\nShopkeeper: Tell me your plan and I'll show you what's worth the weight.",
  "Shopkeeper: Maps first, arguments later.\nShopkeeper: If your map keeps quarrelling with the dunes, I sell a calmer one marked for wells, shade, and honest camps.\nShopkeeper: Buy it once; find the road twice.",
  "Shopkeeper: Storm prep matters.\nShopkeeper: Oilskins, waterproof wraps, and lashings keep Vaelor's mood outside your pack.\nShopkeeper: Take a tin of tar; it's ugly, but it keeps coin and powder dry.",
  "Shopkeeper: Rope solves quiet problems.\nShopkeeper: Hemp for hauling, silk for climbing, and thin line for snares—tell me the cliff and I'll cut the length.\nShopkeeper: Better knots than regrets.",
  "Shopkeeper: Worried about thieves?\nShopkeeper: I sell locks that prefer their owners; keys filed under Nymera's eye, shy around strangers.\nShopkeeper: A small chest beats an empty purse.",
  "Shopkeeper: Trail food saves tempers.\nShopkeeper: Hardtack, cured meat, dried fruit—wake it kindly with a little fire and a kinder spice.\nShopkeeper: The road forgives the prepared.",
  "Shopkeeper: Keep a maintenance kit.\nShopkeeper: Oil, thread, wax, and a whetstone will outrun a dozen accidents when Orun frowns at lazy edges.\nShopkeeper: I'll bundle it to fit the pouch you actually use.",
  "Shopkeeper: Prices are honest because I like familiar faces.\nShopkeeper: If something fails you fairly, bring it back and we'll make it right.\nShopkeeper: Thalor approves of fair trades—and I sleep better."
];

export const BLACKSMITH_TALKS = [
  "Blacksmith: Dull steel lies; sharp steel tells the truth.\nBlacksmith: Leave the edge to me—I keep the wheel wet and the angle honest.\nBlacksmith: You'll feel the bite before you see it.",
  "Blacksmith: Balance comes before bravado.\nBlacksmith: Tell me how you stand and which wrist tires; I'll move the weight where your arm agrees.\nBlacksmith: A good blade vanishes in the hand.",
  "Blacksmith: Armor serves by fitting, not shining.\nBlacksmith: I'll chase the pinch and quiet the rattle; walk a lap, then we'll set the last rivet.\nBlacksmith: Comfort wins fights you never see.",
  "Blacksmith: Ore matters more than oaths.\nBlacksmith: Bring clean stone and I bring clean temper; slag makes brittle promises.\nBlacksmith: Orun hears the difference when the hammer lands.",
  "Blacksmith: Custom work takes time and silence.\nBlacksmith: Three days for the forge, one for the quench, one to argue with Kaelith about temper.\nBlacksmith: Leave a deposit; return when the anvil cools.",
  "Blacksmith: The quench is a promise, not a shock.\nBlacksmith: Oil if you want bite, water if you want spine—don't ask for both.\nBlacksmith: I won't lie to your steel for coin.",
  "Blacksmith: Cracks breed slowly; chips breed fast.\nBlacksmith: I can chase a crack and arrest it; a chip wants a grind and a new edge.\nBlacksmith: Show me the wound before the purse.",
  "Blacksmith: Small iron saves big trouble.\nBlacksmith: Rings, buckles, and hooks pay for themselves in camp.\nBlacksmith: Leave me the measure; pick it up after sundown."
];

export const INN_TALKS = [
  "Innkeeper: It's been a while since we've had guests, {name}, what with monsters crowding the roads, so come in and let this place remember how to be a home; tell me what you need and I'll see that the chair, the hearth, and the supper behave as if they were built for you.\nInnkeeper: If anything feels lacking, say so, and I'll mend it before the kettle finishes singing.\nInnkeeper: May Orun keep your feet warm.",
  "Innkeeper: The bath is hot and patient, the kind that forgives dust you didn't know you'd gathered, and I can set fresh towels where the steam won't sulk, so you can step out lighter than you came in.\nInnkeeper: Leave the grime to the floorboards; they've seen worse and still creak kindly at bedtime.",
  "Innkeeper: In the morning there will be porridge with honey that tastes like the field behaved itself, fresh bread that insists on being buttered twice, and coffee strong enough to argue with your yawns but kind enough to lose.\nInnkeeper: Sit by the window and let Aevyn count the light for you while you count nothing at all.",
  "Innkeeper: I keep a room where the quiet comes in layers—first the door, then the curtains, then the quilt—until even the road stops talking in your bones and decides to wait outside until you're ready.\nInnkeeper: Sleep there and wake only when your name feels rested.",
  "Innkeeper: Leave your cloak, your straps, and that stubborn seam by the counter with a note, and my needle will scold every thread into better manners while you dream.\nInnkeeper: Come morning, you'll find your gear standing straighter than your pride.",
  "Innkeeper: No one troubles guests under this roof; the latch listens to me, and Nymera keeps sly hands busy elsewhere, so rest the kind of rest that learns its lesson and keeps it.\nInnkeeper: If a worry knocks, I'll answer it with tea and send it back where it came from.",
  "Innkeeper: We trade in stories here the way merchants trade in coin—fairly when we can, generously when we must—and a good tale will buy you more silence than you think.\nInnkeeper: Leave one behind and take one you need.",
  "Innkeeper: If Vaelor is in a shouting mood, you'll hear only the soft part of his thunder, because the hearth eats the rest and the walls hum lullabies they learned from old storms.\nInnkeeper: Let the rain do the walking for you tonight; you have already done enough."
];

/**
 * A small pool of fantasy-leaning hero names for quick randomization
 */
export const RANDOM_HERO_NAMES = [
  'Aeliana','Thorin','Eldric','Lyra','Calder','Seraphina','Draven','Kael','Mira','Riven',
  'Arwen','Bryn','Cassia','Dorian','Elowen','Galen','Isolde','Jorah','Kestrel','Lysander',
  'Maelis','Nyx','Orin','Perseus','Quill','Rowan','Sylas','Tamsin','Vale','Wren'
];

/*
GOD BIOS (for future use)

Kaelith — God of Ember Oaths, Discipline, and the Kept Blade.
Domains: fire’s afterglow, sworn vows, tempering of will and steel. Favored by duelists and captains who bind crews by promise rather than fear.
Relations: respects Orun as the elder furnace that makes patience; distrusts Zephryl’s wandering winds; bargains with Thalor to ferry sworn cargo; lets Aevyn annotate his contracts at dawn; calls Vaelor a loud apprentice when thunder tries to temper a blade.

Orun — Mountain-Hearted, Patron of Earth, Fire, and Smelting.
Domains: bedrock, slow flame, ore under pressure, anvils that remember. Miners pray by tapping the rock three times; smiths cool work on their breath.
Relations: tolerates Zephryl as erosion’s messenger; trades quietly with Thalor along subterranean rivers; forges keystones for Aevyn’s schools; wrestles Vaelor in spring when thunder cracks the ridgelines; grumbles that Kaelith swings too soon.

Zephryl — Trickster of Roads, Air, and Wayfinding.
Domains: crosswinds, shortcuts, lost maps that become better on the second reading; patron of couriers, scouts, and liars who keep their lies playful.
Relations: laughs with Nymera over rigged locks; steals Thalor’s tides to shift harbors; steals Orun’s hats (mountain peaks) and returns them as clouds; swaps pages in Aevyn’s ledgers; flirts with Vaelor until the sky bruises; breaks Kaelith’s straight lines into spirals.

Nymera — Velvet-Thief of Chance, Doors, and Second Tries.
Domains: luck-tide, keys that look like smiles, dice that refuse to land until you deserve them. Favored by locksmiths, gamblers, and repentant thieves.
Relations: drinks night-tea with Zephryl; pockets Thalor’s interest and returns it as improbable finds; files quiet notches in Kaelith’s oaths ("for mercy"); teaches Aevyn that a missed lesson is a secret door; switches Vaelor’s lightning for lanterns when children are asleep.

Thalor — Tidemaster of Water, Trade, and Price Remembered.
Domains: currents, markets that breathe, debts that ripen with the moon. Sailors toss him rings; he returns some as fish.
Relations: rents docks to Zephryl’s winds; buys ore from Orun at cost and sells it dear; insures Kaelith’s caravans for a story each; endows Aevyn’s libraries with tides of coin; wagers with Nymera and pretends to lose; negotiates with Vaelor to aim storms at empty sea.

Aevyn — Dawn-Binder of Learning, Memory, and Beginnings.
Domains: first light, patient ink, the step after failure. Teachers burn his candles down to the wick, then find them longer in the morning.
Relations: edits Kaelith’s oaths down to truths; writes Orun’s slowness into metronomes; leaves blank margins for Zephryl to doodle maps; stacks Thalor’s ledgers into stairways; hides extra sixes in Nymera’s dice only when lesson earned; asks Vaelor to thunder softly during exams.

Vaelor — Lord of Storms, Thunder, Courage, and Reckoning.
Domains: drum-sky, bright spears, the breath before the charge. Heroes hear him in the teeth; cowards hear only rain.
Relations: hammers Orun’s peaks into anvils and apologizes by polishing them with lightning; dares Kaelith’s soldiers to break formation and then makes them better for returning; races Zephryl until both are laughing; sells Thalor free thunder for every rescued ship; lets Aevyn count echoes as lessons; flips Nymera’s coin midair and claims both sides are victory.
*/