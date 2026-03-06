import { State } from './js/constants.js';
import {
  ENEMY_TYPES,
  ENCOUNTER_TABLE,
  VARIANT_MAP,
  VARIANT_CHANCE,
  ITEM_DEFS,
  EQUIPMENT_DEFS,
  SHOP_INVENTORY,
  SMITH_INVENTORY,
  DIVINE_ITEM_IDS,
  TEMPLE_RIDDLES,
  SHOP_TALKS,
  BLACKSMITH_TALKS,
  INN_TALKS,
  RANDOM_HERO_NAMES,
  GOD_LORE,
} from './js/data.js';
import { installUI } from './js/ui.js';
import { installWorld } from './js/world.js';
import { installInput } from './js/input.js';
import { installStateflow } from './js/stateflow.js';
import { installInventory } from './js/inventory.js';
import { installShop } from './js/shop.js';
import { installStats } from './js/stats.js';
import { installCombat } from './js/combat.js';
import { installAudio } from './js/audio.js';


function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

class Game {
  constructor(root) {
    this.root = root;

    // World
    this.tileSize = 28;
    this.viewCols = Math.ceil(window.innerWidth / this.tileSize);
    this.viewRows = Math.ceil(window.innerHeight / this.tileSize);
    this.minRadius = 20;
    this.borderTiles = 6;
    this.mapWidth = Math.max(this.viewCols, this.minRadius * 2 + this.borderTiles);
    this.mapHeight = Math.max(this.viewRows, this.minRadius * 2 + this.borderTiles);
    this.tiles = [];
    this.player = { x: 0, y: 0 };

    // Camera (deadzone)
    this.cameraX0 = null;
    this.cameraY0 = null;
    this.cameraMargin = 4;

    // Player identity
    this.playerName = '';
    this.randomHeroNames = Array.isArray(RANDOM_HERO_NAMES) ? [...RANDOM_HERO_NAMES] : [];
    this.isNamePromptOpen = false;
    this.nameMaxLength = 18;

    // Player stats
    this.stats = { maxHp: 25, atk: 5, def: 2, spe: 8, luc: 10, xp: 0, gold: 0 };
    // Snapshot base stats for clean restarts
    this._baseStats = deepClone(this.stats);
    this.hp = this.stats.maxHp;
    this._lastHp = this.hp;
    this._lastEnemyHp = null;

    // Special Points (SP) - for special abilities
    this.spMax = 20;
    this.sp = this.spMax;
    this._lastSp = this.sp;

    // Leveling
    this.levelCap = 30;
    this.level = 1;
    this.growthRates = { maxHp: 150, atk: 60, def: 45, spe: 30, luc: 40 };

    // Enemy (created on combat start)
    this.enemy = null;

    // Data registries
    this.enemyTypes = ENEMY_TYPES;
    this.encounterTable = deepClone(ENCOUNTER_TABLE);
    this.variantMap = { ...VARIANT_MAP };
    this.variantChance = VARIANT_CHANCE;

    // Items
    this.itemDefs = ITEM_DEFS;
    this.inventory = { potion: 2 };

    // Combat modifiers
    this.combatBuffs = { atk: 0, def: 0, spe: 0, luc: 0 };
    this.rewardMult = { xp: 1, gold: 1 };
    this.rewardMultLeft = { xp: 0, gold: 0 };

    // Equipment
    this.equipmentDefs = EQUIPMENT_DEFS;
    this.equipmentInventory = { iron_sword: 1 };
    this.equipment = { weapon: 'iron_sword', armor: null, accessory: null };

    // Encounters
    this.encounterChanceForest = 0.30;
    this.encounterChanceLand = 0.10;
    this.encounterChanceSwamp = 0.40;
    this.encounterBase = 1.0;

    // Cutscene
    this.cutsceneLines = [
      "You awaken in a mysterious land.",
      "A land full of monsters.",
      "You've heard of rumors of an evil necromancer to the north who has been the root cause of all the horrors the people have been facing.",
      "This is your moment to grow stronger and reach your destiny.",
      "Show us what you have, hero!"
    ];
    this.cutIndex = 0;

    // Combat state
    this.choiceIndex = 0;
    this.combatMessage = '';
       this.awaitContinue = null;
    this.turn = 1;
    this.flexBuffTurn = null;
    this.flexMultiplier = 1.5;
    this.isTyping = false;
    this.typingTimer = null;
    this.typingIndex = 0;
    this.typingFull = '';
    this.lastCombatMessage = null;

    // Combat paging (per-turn action pages shown in bottom dialogue)
    this.combatPages = null;
    this.combatPageIndex = 0;
    this._advanceTurnAfterPages = false;

    // Post-combat paging
    this.postCombatPages = null;
    this.postCombatPageIndex = 0;

    // Menus
    this.itemMenuOpen = false;
    this.itemMenuIndex = 0;
    this.equipMenuOpen = false;
    this.equipMenuIndex = 0;

    // Shop state
    this.shopChoiceIndex = 0;
    this.shopMessage = '';
    this.shopAwaitContinue = false;
    this.shopInventory = deepClone(SHOP_INVENTORY);
    this.smithInventory = deepClone(SMITH_INVENTORY);
    this.isBlacksmith = false;
    this.isTemple = false;
    this.isInn = false;

    // NPC dialogue pools
    this.shopTalks = Array.isArray(SHOP_TALKS) ? [...SHOP_TALKS] : [];
    this.blacksmithTalks = Array.isArray(BLACKSMITH_TALKS) ? [...BLACKSMITH_TALKS] : [];
    this.innTalks = Array.isArray(INN_TALKS) ? [...INN_TALKS] : [];

    // Temple
    this.divineItemIds = [...DIVINE_ITEM_IDS];
    this.templeInventory = {};
    for (const id of this.divineItemIds) this.templeInventory[id] = 1;
    this.templeRiddles = [...TEMPLE_RIDDLES];
    this.godLore = { ...(GOD_LORE || {}) };
    // Ensure first Temple Talk always gives the shimmering-tile hint
    this.templeHintSeen = false;

    this.shopBuyOpen = false;
    this.shopBuyIndex = 0;

    // Enemy sprite animation
    this.enemyAnimTimer = null;
    this.enemyFrame = 0;

    // State flag
    this.current = State.TITLE;
    this.showOwStatus = false;

    // DOM + UI
    this.$ = {};
    this.buildUI();

    // Input
    this.bindInputs();

    // Build world and start
    this.generateWorld();
    this.placePlayerOnLand();
    // Reset camera so first render recenters with deadzone
    this.cameraX0 = null;
    this.cameraY0 = null;

    // Initial level from XP
    this.level = this.computeLevelFromXp(this.stats.xp);

    this.render();

    // Audio
    this.initAudio();
    this.playMusic('title');

    // Resize handling
    window.addEventListener('resize', () => this.resizeToViewport());

    // Expose for dev console
    window.__GAME__ = this;
  }
}

// Install feature modules
installUI(Game);
installWorld(Game);
installInput(Game);
installStateflow(Game);
installInventory(Game);
installShop(Game);
installStats(Game);
installCombat(Game);
installAudio(Game);

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  // eslint-disable-next-line no-new
  new Game(root);
});