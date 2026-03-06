# Retro RPG Demo (RPG-engine)

A small, dependency-free, turn-based RPG demo built with vanilla JavaScript, HTML, and CSS. The world is procedurally generated and the app runs entirely in the browser using ES Modules.

This README is optimized to help you (and future tasks) get oriented quickly: it summarizes structure, responsibilities, control flow, and how to extend the game.

## Quick start

- Serve the folder with any static server (recommended for ES Modules):
  - Python: `python3 -m http.server 8000`
  - Node: `npx serve .`
- Open http://localhost:8000 in a modern browser.

Controls
- Arrow keys: move (Overworld) or change selection (Combat/Shop/menus)
- Enter/Space: confirm
- `: toggle the Dev Console panel
- H: toggle Overworld Status panel
- E: open Equipment menu (Overworld)
- Mouse: click selectable UI (choices, items, etc.)
- The goal is the yellow tile; step on it to end the demo.

## Repository structure

```
index.html               # Boot page loading a single module: assets/script.js
assets/
  script.js              # Entry point; defines Game and installs feature modules
  style.css              # Styling for overworld, combat, shop, dev console
  images/                # Sprite and background images
    battle/
      SlimeA.png
    player/
      knight.png
    overworld/
      forest.png
      mountain.png
    background/
      shop.png blacksmith.png temple.png inn.png castle.png spellshop.png
  js/
    constants.js         # App-wide constants (State)
    utils.js             # Helpers (int, clamp, randInt, keyToDir, noise2d)
    data.js              # Data registries: enemies, items, equipment, shops, temple, etc.
    ui.js                # DOM scaffolding + render pipeline + dev console + sprite helpers
    world.js             # Map generation, camera deadzone, bounds/walkability, encounters
    input.js             # Key + click handling per state (CUTSCENE/OVERWORLD/SHOP/COMBAT)
    stateflow.js         # High-level state transitions and restart/end flows
    inventory.js         # Items + equipment menus, effects, and derived/effective stats
    stats.js             # XP -> level, growth/level-up, stat caps enforcement
    combat.js            # Battle loop, actions (attack/flex/item/run), rewards, variants
    shop.js              # Shop/Blacksmith/Temple/Inn flow and purchasing/donating/resting
```

## Architecture overview

- The Game class is created in assets/script.js and then “feature modules” are installed via an installX(Game) pattern. Each module augments Game.prototype with a cohesive set of methods.
- State machine: constants.js defines:
  - CUTSCENE → OVERWORLD → SHOP/COMBAT (and back), managed in stateflow.js
- Data-driven: enemies, encounter weights, items, equipment and inventories live in data.js.
- Rendering is explicit: after state changes or data mutations, methods call render()/renderStatus()/renderXXX as needed.
- Dev Console is built dynamically (ui.js) and mirrors core game state for debugging.

Game bootstrap (assets/script.js)
- Establishes initial world dimensions, player stats, equipment, item inventories, shop inventories, and various toggles (camera deadzone, encounter rates).
- Installs modules: UI, world generation, input, state flow, inventory, shop, stats, combat.
- Generates world, positions player, computes initial level from XP, renders, and binds resize.
- Exposes window.__GAME__ for inspection in the browser console.

## Module responsibilities and key methods

Entry point
- assets/script.js
  - Game constructor: initializes world, camera, stats, inventories, encounter parameters, equipment, shop/temple data, UI refs, and state (default: CUTSCENE). Bootstraps world and render loop.
  - Calls installUI/installWorld/installInput/installStateflow/installInventory/installShop/installStats/installCombat.

Constants and utilities
- js/constants.js: State enum { CUTSCENE, OVERWORLD, SHOP, COMBAT }
- js/utils.js:
  - int(v, fallback), clamp(n, a, b), randInt(min, max)
  - keyToDir(key): Arrow keys → {x,y}
  - noise2d(x,y): simple deterministic-ish noise

UI and rendering
- js/ui.js
  - buildUI(): scaffolds DOM (map, dialogue, combat, shop, menus, status bars, dev console)
  - buildDevConsole(), toggleDev(force), syncDevConsole()
  - render(): central render call switching by state; calls:
    - renderMap(): grid, camera deadzone, player sprite
    - renderStatus(): level, HP, EXP, Gold; bars and fill; enemy HP bar
    - renderChoices(), renderOverworldStatus(), renderCombatMessage()
  - Typing effect: startTyping, stopTyping, skipTyping
  - HP bar helpers: updatePlayerHpBar, updateEnemyHpBarLayout, updateEnemyHpBarFill
  - Sprite helpers: startEnemyAnim, stopEnemyAnim, applyEnemySprite
  - Shop backgrounds: applyShopBackground
  - Small animation: shakeElement + shakeEnemy/Player
  - Adds click handlers for combat choices, item/shop/equip menus, and dev console controls

World generation and viewport
- js/world.js
  - generateWorld(): oval island over water with forest/mountain features; places special tiles:
    - goal (north), shop (east), blacksmith (west), temple (south), inns (scattered)
  - placePlayerOnLand(): smart start near southern band, with fallbacks
  - inBounds, getTile, isWalkable, tileEncounterChance
  - isSuitableSpecialSpot(): land with adjacent walkable
  - resizeToViewport(): resizes virtual grid and clamps camera/player; re-renders

Input handling
- js/input.js
  - bindInputs(): global key handlers with state-specific logic
    - CUTSCENE: Enter/Space advance
    - OVERWORLD: arrows move; E toggles equipment; H toggles status; Backquote toggles dev
    - SHOP: arrows cycle choices or items; Enter/Space confirm; Escape cancels menus
    - COMBAT: arrows move selection; Enter/Space confirm; item menu navigation; typing skip
  - Global mouse click advances CUTSCENE

State management
- js/stateflow.js
  - startCutscene(), advanceCutscene(), startOverworld()
  - resolvePostCombat(): handles “paged” post-battle text and return to overworld
  - restartDemo(): resets stats/inventories/world and camera; returns to CUTSCENE
  - endDemo(): called when stepping on goal

Inventory, equipment, and derived stats
- js/inventory.js
  - Item menu: openItemMenu, closeItemMenu, renderItemMenu, useItemInCombat
  - Equip menu (overworld): open/close/render, equipEquipment
  - Derived/effective stats: getEquipmentModifierTotals, getEffectiveStats
  - Buffs: decayCombatBuffs
  - Dev console helpers: renderDevItemsPanel, populateDevEquipmentSelects, devEquipSelectedWeapon/Armor, devUnequipWeapon/Armor

Stats, leveling, and caps
- js/stats.js
  - xpForLevel(), computeLevelFromXp()
  - rollGrowthPoints(rate), processLevelUpsAfterReward(): applies growth/caps and HP carry-up
  - enforceCaps(): global caps and clamping

Combat flow
- js/combat.js
  - startCombat(enemyId?): sets up enemy from data or weighted random pick + variant chance
  - confirmChoice(): Attack/Flex/Items/Run
  - runCombatRound(action, itemId):
    - Attack order by Speed; hit/miss by defender Luck; crit chance from Speed/2
    - Equipment hooks (e.g., blood_sword heal, cursed_sword backlash, golden_sword gold gain)
    - Item use (heal/fullheal/buff/reward multiplier)
    - Buff decay, turn advance, and typewriter messaging
  - finishCombat(outcome): Win (paged rewards + optional level-up text), Run, or Lose (restart)
  - pickRandomEnemyForTile(x,y): weighted table + variant substitution

Data registries
- js/data.js
  - ENEMY_TYPES: base + “variant” versions (e.g., toughSlime, demonBat)
  - ENCOUNTER_TABLE: weighted list
  - VARIANT_MAP + VARIANT_CHANCE
  - ITEM_DEFS: heal/fullheal/buff/reward-mult items
  - EQUIPMENT_DEFS: weapon/armor with stat modifiers and special effects
  - SHOP_INVENTORY, SMITH_INVENTORY: default stock and prices
  - DIVINE_ITEM_IDS, TEMPLE_RIDDLES: used by Temple/inn/blacksmith flows

Shop/Blacksmith/Temple/Inn
- js/shop.js
  - startShop(vendor): sets flags and transitions to SHOP
  - confirmShopChoice(): Talk/Buy/Leave with dynamic labels per vendor
  - open/close/renderShopMenu(), purchaseShopItem()
  - donateAtTemple(): consumes gold → grants a divine item until sold out
  - restAtInn(): 10G to fully heal; handles already-full and insufficient funds

Styling
- assets/style.css: CSS for the overworld grid, battle UI (status bar, HP bars, monster sprite, choices), shop overlay (top banner image), modals/menus, dev console, and subtle animations.

## Start-of-task checklist (for development)

- Which area to change?
  - Overworld/map/camera/encounters → assets/js/world.js
  - State transitions / restart flow → assets/js/stateflow.js
  - Input mapping/UX → assets/js/input.js
  - Rendering/UI components → assets/js/ui.js (+ style.css)
  - Combat rules/effects → assets/js/combat.js
  - Leveling/caps → assets/js/stats.js
  - Items/equipment/enemies/vendors → assets/js/data.js (+ shop.js/inventory.js as needed)
- After mutations to game state, ensure the right renders are called:
  - Usually render(), renderStatus(), renderOverworldStatus(), renderCombatMessage(), syncDevConsole()
- If you touch combat state, also check:
  - stopEnemyAnim()/startEnemyAnim() and updateEnemyHpBarLayout/Fill
  - awaitContinue/typing flags and updateChoicesVisibility()
- Use window.__GAME__ in the browser console for quick inspection.
- Toggle the Dev Console with the Backquote (`) key.

## Common extension recipes

Add a new enemy
1) Add a new entry under ENEMY_TYPES in data.js (with stats, rewards, optional sprite image/filter)
2) Optionally add to ENCOUNTER_TABLE and VARIANT_MAP
3) Provide a sprite image under assets/images/battle/ (or set placeholder: true)
4) Test by forcing combat via Dev Console or calling __GAME__.startCombat('enemyId')

Add a new item
1) Add to ITEM_DEFS (type: heal/fullheal/buff/reward)
2) Add to SHOP_INVENTORY (or Temple via DIVINE_ITEM_IDS)
3) If it has new behavior, extend runCombatRound’s item handling in combat.js
4) Verify in Dev Console (Inventory panel) and in combat item menu

Add a new weapon/armor
1) Add to EQUIPMENT_DEFS (slot: 'weapon'|'armor', mods, desc)
2) Add to SMITH_INVENTORY (price/stock)
3) If it has special effects, wire them into combat.js (e.g., blood_sword)
4) Confirm equipment shows in Overworld Status and Equipment menu

Add a vendor type or shop behavior
- Extend shop.js and UI background mapping (ui.applyShopBackground)

Adjust world generation or tiles
- Edit world.js (generateWorld, isWalkable, placement rules) and style.css for visuals

Add a new state
- Update constants.js, stateflow.js, input.js and ui.js to render appropriately

## Gotchas

- Always call enforceCaps() (stats.js) or renderStatus() after directly tweaking stats/HP.
- Stop timers when leaving combat: stopTyping(), stopEnemyAnim().
- When changing encounter math or movement, verify camera deadzone and map bounds.
- ES Modules must be served over HTTP for some browsers; use a local static server.

## Attribution

- Slime animation source: https://henrysoftware.itch.io/
- Background artwork (shop/temple/inn/blacksmith) included under assets/images/background.
